import React, { useEffect, useMemo, useState } from "react";
import { dashboardApi } from "../api/adminApi";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [ordersMode, setOrdersMode] = useState("month");
  const [enquiriesMode, setEnquiriesMode] = useState("month");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await dashboardApi.getData();
        if (!alive) return;
        setData(res?.data?.data ?? null);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load dashboard";
        toast.error(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const ordersValue = ordersMode === "year" ? data?.totalOrdersYear : data?.totalOrdersMonth;
  const enquiriesValue =
    enquiriesMode === "year" ? data?.totalEnquiriesYear : data?.totalEnquiriesMonth;

  const barData = useMemo(() => data?.ordersPerMonthLast6Months || [], [data]);
  const pieData = useMemo(() => data?.topCategories || [], [data]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Header title="Dashboard" />
      <div className="px-6 py-6 md:ml-72">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-2xl font-semibold">
            {greeting()}, {data?.adminName || "Admin"}{" "}
            <span className="text-orange-400">👋</span>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening with Garuda Fireworks today
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={`Total Orders This ${ordersMode === "year" ? "Year" : "Month"}`}
            value={loading ? "—" : ordersValue ?? 0}
            right={
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs dark:border-gray-800 dark:bg-gray-950">
                <button
                  type="button"
                  onClick={() => setOrdersMode("month")}
                  className={[
                    "rounded-lg px-2 py-1",
                    ordersMode === "month" ? "bg-orange-500/15 text-orange-300" : "text-zinc-400",
                  ].join(" ")}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersMode("year")}
                  className={[
                    "rounded-lg px-2 py-1",
                    ordersMode === "year" ? "bg-orange-500/15 text-orange-300" : "text-zinc-400",
                  ].join(" ")}
                >
                  Year
                </button>
              </div>
            }
          />
          <StatCard
            title={`Total Enquiries This ${enquiriesMode === "year" ? "Year" : "Month"}`}
            value={loading ? "—" : enquiriesValue ?? 0}
            right={
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs dark:border-gray-800 dark:bg-gray-950">
                <button
                  type="button"
                  onClick={() => setEnquiriesMode("month")}
                  className={[
                    "rounded-lg px-2 py-1",
                    enquiriesMode === "month"
                      ? "bg-orange-500/15 text-orange-300"
                      : "text-zinc-400",
                  ].join(" ")}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiriesMode("year")}
                  className={[
                    "rounded-lg px-2 py-1",
                    enquiriesMode === "year"
                      ? "bg-orange-500/15 text-orange-300"
                      : "text-zinc-400",
                  ].join(" ")}
                >
                  Year
                </button>
              </div>
            }
          />
          <StatCard
            title="Total Revenue This Month"
            value={loading ? "—" : `₹${Number(data?.totalRevenueMonth ?? 0).toLocaleString()}`}
          />
          <StatCard title="Pending Orders" value={loading ? "—" : data?.pendingOrders ?? 0} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Orders per month (last 6 months)</div>
            <div className="mt-4 h-[260px]">
              {barData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#71717a" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      cursor={false}
                      formatter={(value) => [`${value}`, "Sales"]}
                      contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No chart data.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Top 5 categories by sales</div>
            <div className="mt-4 h-[260px]">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value, name) => [`${value} sales`, name]} />
                    <Pie
                      data={pieData}
                      dataKey="totalSold"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No categories yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Top 5 best selling products</div>
            <div className="mt-4 overflow-x-auto">
              {data?.topProducts?.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-zinc-400">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Total sold</th>
                      <th className="py-2 pr-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {data.topProducts.map((p) => (
                      <tr key={p.productId}>
                        <td className="py-2 pr-4 text-gray-900 dark:text-white">{p.name}</td>
                        <td className="py-2 pr-4 text-zinc-300">{p.category || "—"}</td>
                        <td className="py-2 pr-4 text-zinc-300">{p.totalSold}</td>
                        <td className="py-2 pr-4 text-zinc-200">
                          ₹{Number(p.revenue).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                  No sales data yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Recent 5 enquiries</div>
            <div className="mt-4 overflow-x-auto">
              {data?.recentEnquiries?.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-zinc-400">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2 pr-4">Message</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {data.recentEnquiries.map((e) => (
                      <tr key={e.id}>
                        <td className="py-2 pr-4 text-gray-900 dark:text-white">{e.name}</td>
                        <td className="py-2 pr-4 text-zinc-300">{e.phone}</td>
                        <td className="py-2 pr-4 text-zinc-300">
                          {String(e.message || "").slice(0, 28)}
                          {String(e.message || "").length > 28 ? "..." : ""}
                        </td>
                        <td className="py-2 pr-4">
                          <StatusBadge status={e.status} />
                        </td>
                        <td className="py-2 pr-4 text-zinc-400">
                          {e.createdOn ? new Date(e.createdOn).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                  No enquiries yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
