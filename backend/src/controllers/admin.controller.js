import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardController = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const oldestMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const pendingStatuses = ["enquiry", "ordered", "processing", "dispatched"];

    const [
      totalOrdersMonth,
      totalOrdersYear,
      totalEnquiriesMonth,
      totalEnquiriesYear,
      totalRevenueMonthAgg,
      pendingOrdersAgg,
      recentEnquiries,
      recentOrders,
      topProductGroups,
      ordersPerMonthRows,
      topCategoryRows,
    ] = await Promise.all([
      prisma.order.count({
        where: { isActive: true, createdOn: { gte: startOfMonth }, status: { not: "cancelled" } },
      }),
      prisma.order.count({
        where: { isActive: true, createdOn: { gte: startOfYear }, status: { not: "cancelled" } },
      }),
      prisma.enquiry.count({ where: { createdOn: { gte: startOfMonth } } }),
      prisma.enquiry.count({ where: { createdOn: { gte: startOfYear } } }),
      prisma.order.aggregate({
        where: { isActive: true, createdOn: { gte: startOfMonth }, status: { not: "cancelled" } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { isActive: true, status: { in: pendingStatuses } } }),
      prisma.enquiry.findMany({ orderBy: { createdOn: "desc" }, take: 5 }),
      prisma.order.findMany({
        where: { isActive: true },
        orderBy: { createdOn: "desc" },
        take: 5,
        include: {
          customer: true,
          items: { include: { product: { include: { category: true } } } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { isActive: true, status: { not: "cancelled" } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.$queryRaw`
        SELECT
          to_char(date_trunc('month', o."createdOn"), 'YYYY-MM') AS month,
          COUNT(*)::int AS count
        FROM "Order" o
        WHERE o."isActive" = true AND o."createdOn" >= ${oldestMonth}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT
          c.id::int AS "categoryId",
          c.name AS "categoryName",
          COALESCE(SUM(oi.quantity), 0)::int AS "totalSold",
          COALESCE(SUM(oi.quantity * oi.price), 0)::text AS "revenue"
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        JOIN "Product" p ON p.id = oi."productId"
        JOIN "Category" c ON c.id = p."categoryId"
        WHERE o."isActive" = true AND o.status <> 'cancelled'
        GROUP BY c.id, c.name
        ORDER BY COALESCE(SUM(oi.quantity), 0) DESC
        LIMIT 5
      `,
    ]);

    const topProductIds = topProductGroups.map((g) => g.productId);
    const [topProductsMeta, topProductItems] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: topProductIds } },
        include: { category: true },
      }),
      prisma.orderItem.findMany({
        where: {
          productId: { in: topProductIds },
          order: { isActive: true, status: { not: "cancelled" } },
        },
        select: { productId: true, quantity: true, price: true },
      }),
    ]);

    const productMetaMap = new Map(topProductsMeta.map((p) => [p.id, p]));
    const productRevenueMap = new Map();
    for (const item of topProductItems) {
      const prev = productRevenueMap.get(item.productId) ?? 0;
      const revenue = Number(item.price) * Number(item.quantity);
      productRevenueMap.set(item.productId, prev + revenue);
    }

    const topProducts = topProductGroups
      .map((g) => {
        const product = productMetaMap.get(g.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          category: product.category?.name ?? null,
          totalSold: g._sum?.quantity ?? 0,
          revenue: productRevenueMap.get(product.id) ?? 0,
        };
      })
      .filter(Boolean);

    const ordersPerMonthIndex = new Map(
      (ordersPerMonthRows ?? []).map((r) => [r.month, Number(r.count)]),
    );
    const ordersPerMonthLast6Months = Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: key, count: ordersPerMonthIndex.get(key) ?? 0 };
    });

    const topCategories = (topCategoryRows ?? []).map((r) => ({
      categoryId: r.categoryId,
      name: r.categoryName,
      totalSold: Number(r.totalSold),
      revenue: Number(r.revenue),
    }));

    return res.json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        adminName: req.user.name,
        totalOrdersMonth,
        totalOrdersYear,
        totalEnquiriesMonth,
        totalEnquiriesYear,
        topProducts,
        topCategories,
        recentOrders,
        recentEnquiries,
        totalRevenueMonth: totalRevenueMonthAgg?._sum?.total ?? 0,
        pendingOrders: pendingOrdersAgg,
        ordersPerMonthLast6Months,
      },
    });
  } catch (error) {
    next(error);
  }
};
