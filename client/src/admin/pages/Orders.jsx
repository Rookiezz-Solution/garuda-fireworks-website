import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import OrderTable from "../components/OrderTable";
import { orderApi } from "../api/adminApi";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["", "enquiry", "ordered", "processing", "dispatched", "delivered", "cancelled"];

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [search, status, startDate, endDate],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll(params);
      setOrders(res?.data?.data?.orders ?? []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load orders";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      load();
      return;
    }
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
  }, [params]);

  useEffect(() => {
    if (tab === "enquiries") setStatus("enquiry");
    else if (status === "enquiry") setStatus("");
  }, [tab]);

  const changeStatus = async (order, nextStatus) => {
    const prev = order.status;
    if (prev === nextStatus) return;
    setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    try {
      await orderApi.updateStatus(order.id, nextStatus);
      toast.success(`Order #${order.id} set to ${nextStatus}`);
    } catch (e) {
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status: prev } : o)));
      const msg = e?.response?.data?.message || e?.message || "Status update failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Header title="Orders" />
      <div className="px-6 py-6 md:ml-72">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={[
                  "rounded-xl px-3 py-1.5 text-sm font-semibold",
                  tab === "orders"
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
                ].join(" ")}
              >
                Orders
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name or order id"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-72"
              />
              {tab === "orders" ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="select-field w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-48"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s || "all"} value={s}>
                      {s ? s : "All status"}
                    </option>
                  ))}
                </select>
              ) : null}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-44"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-44"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Loading orders...
            </div>
          ) : (
            <OrderTable orders={orders} onChangeStatus={changeStatus} />
          )}
        </div>
      </div>
    </div>
  );
}
