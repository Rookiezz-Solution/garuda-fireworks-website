import React, { useMemo, useState } from "react";

const ORDER_STATUSES = [
  "enquiry",
  "ordered",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  enquiry:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  ordered:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  dispatched: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  delivered:  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled:  "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  default:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const PAGE_SIZE = 10;

export default function OrderTable({ orders, onChangeStatus }) {
  const [openOrderId, setOpenOrderId] = useState(null);
  const toggleOrder = (id) => setOpenOrderId((prev) => (prev === id ? null : id));

  // Default: sort by id descending
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => orders || [], [orders]);

  const sortedRows = useMemo(() => {
    const dir = sortDir === "desc" ? -1 : 1;
    const valueFor = (o) => {
      const itemsCount = o.items?.reduce((sum, it) => sum + Number(it.quantity || 0), 0) || 0;
      if (sortKey === "id") return Number(o.id || 0);
      if (sortKey === "customer") return String(o.customer?.name || "");
      if (sortKey === "phone") return String(o.customer?.phone || "");
      if (sortKey === "items") return itemsCount;
      if (sortKey === "total") return Number(o.total || 0);
      if (sortKey === "status") return String(o.status || "");
      if (sortKey === "date") return o.createdOn ? new Date(o.createdOn).getTime() : 0;
      return 0;
    };
    const next = [...rows];
    next.sort((a, b) => {
      const av = valueFor(a);
      const bv = valueFor(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return next;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pagedRows = useMemo(
    () => sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedRows, page],
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span className="text-gray-400">↑</span>;
    return sortDir === "asc" ? (
      <span className="text-orange-500">↑</span>
    ) : (
      <span className="text-orange-500">↓</span>
    );
  };

  if (!sortedRows.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No orders found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950 dark:text-gray-400">
              <tr>
                {[
                  { key: "id", label: "Order ID" },
                  { key: "customer", label: "Customer" },
                  { key: "phone", label: "Phone" },
                  { key: "items", label: "Items" },
                  { key: "total", label: "Total" },
                  { key: "status", label: "Status" },
                  { key: "date", label: "Date" },
                ].map(({ key, label }) => (
                  <th key={key} className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                      onClick={() => toggleSort(key)}
                    >
                      {label} {sortIcon(key)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {pagedRows.map((o) => {
                const isOpen = openOrderId === o.id;
                const itemsCount =
                  o.items?.reduce((sum, it) => sum + Number(it.quantity || 0), 0) || 0;
                return (
                  <React.Fragment key={o.id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40"
                      onClick={() => toggleOrder(o.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        #{o.id}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-zinc-200">
                        {o.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                        {o.customer?.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">{itemsCount}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-zinc-200">
                        ₹{String(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            className={[
                              "inline-flex w-24 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                              STATUS_STYLES[o.status] || STATUS_STYLES.default,
                            ].join(" ")}
                          >
                            {o.status}
                          </span>
                          <select
                            value={o.status}
                            onChange={(e) => onChangeStatus?.(o, e.target.value)}
                          className="select-field rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {o.createdOn ? new Date(o.createdOn).toLocaleString() : "—"}
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={7} className="px-4 pb-4 pt-2">
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              Order Items
                            </div>
                            <div className="mt-3 overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="text-gray-500 dark:text-gray-400">
                                  <tr>
                                    <th className="py-2 pr-4">Product</th>
                                    <th className="py-2 pr-4">Quantity</th>
                                    <th className="py-2 pr-4">Price</th>
                                    <th className="py-2 pr-4">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                  {(o.items || []).map((it) => (
                                    <tr key={it.id}>
                                      <td className="py-2 pr-4 text-gray-900 dark:text-zinc-200">
                                        {it.product?.name || "—"}
                                      </td>
                                      <td className="py-2 pr-4 text-gray-700 dark:text-zinc-300">
                                        {it.quantity}
                                      </td>
                                      <td className="py-2 pr-4 text-gray-700 dark:text-zinc-300">
                                        ₹{String(it.price)}
                                      </td>
                                      <td className="py-2 pr-4 text-gray-900 dark:text-zinc-200">
                                        ₹{Number(it.quantity) * Number(it.price)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — only shown when more than 10 records */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedRows.length)} of{" "}
            {sortedRows.length} orders
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              «
            </button>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={[
                      "rounded-lg px-3 py-1 text-sm font-medium",
                      p === page
                        ? "bg-orange-500/15 text-orange-600 dark:text-orange-300"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ›
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
