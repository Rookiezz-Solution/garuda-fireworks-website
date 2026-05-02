import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { couponApi } from "../api/adminApi";
import toast from "react-hot-toast";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function isExpired(coupon) {
  if (!coupon?.expiryDate) return false;
  return new Date(coupon.expiryDate).getTime() < Date.now();
}

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "code",     label: "Code" },
  { key: "discount", label: "Discount" },
  { key: "minOrder", label: "Min Order" },
  { key: "uses",     label: "Uses" },
  { key: "expiry",   label: "Expiry" },
  { key: "status",   label: "Status" },
];

export default function Coupons() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Default: sort by id descending (newest first)
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    expiryDate: "",
    description: "",
    isActive: true,
  });

  const resetForm = (coupon) => {
    setForm({
      code: coupon?.code || "",
      discountType: coupon?.discountType || "percentage",
      discountValue: coupon?.discountValue ? String(coupon.discountValue) : "",
      minOrderValue: coupon?.minOrderValue ? String(coupon.minOrderValue) : "",
      maxUses: coupon?.maxUses === null || coupon?.maxUses === undefined ? "" : String(coupon.maxUses),
      expiryDate: coupon?.expiryDate ? String(coupon.expiryDate).slice(0, 10) : "",
      description: coupon?.description || "",
      isActive: coupon?.isActive === undefined ? true : Boolean(coupon.isActive),
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await couponApi.getAll();
      setCoupons(res?.data?.data?.coupons ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); resetForm(null); setOpen(true); };
  const openEdit = (coupon) => { setEditing(coupon); resetForm(coupon); setOpen(true); };

  const submit = async () => {
    if (!form.code.trim()) return toast.error("Code is required");
    if (!String(form.discountValue).trim()) return toast.error("Discount value is required");
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderValue: form.minOrderValue || null,
        maxUses: form.maxUses || null,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        description: form.description || null,
        isActive: form.isActive,
      };
      if (editing?.id) {
        await couponApi.update(editing.id, payload);
        toast.success("Coupon updated");
      } else {
        await couponApi.create(payload);
        toast.success("Coupon created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await couponApi.delete(coupon.id);
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span className="text-gray-400">↑</span>;
    return sortDir === "asc"
      ? <span className="text-orange-500">↑</span>
      : <span className="text-orange-500">↓</span>;
  };

  const sortedRows = useMemo(() => {
    const list = [...(coupons || [])];
    const dir = sortDir === "desc" ? -1 : 1;
    const valueFor = (c) => {
      if (sortKey === "id")       return Number(c.id || 0);
      if (sortKey === "code")     return String(c.code || "");
      if (sortKey === "discount") return Number(c.discountValue || 0);
      if (sortKey === "minOrder") return Number(c.minOrderValue || 0);
      if (sortKey === "uses")     return Number(c.usedCount || 0);
      if (sortKey === "expiry")   return c.expiryDate ? new Date(c.expiryDate).getTime() : 0;
      if (sortKey === "status")   return isExpired(c) ? "expired" : c.isActive ? "active" : "inactive";
      return 0;
    };
    list.sort((a, b) => {
      const av = valueFor(a), bv = valueFor(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return list;
  }, [coupons, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pagedRows = useMemo(
    () => sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedRows, page],
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Header title="Coupons" />
      <div className="px-6 py-6 md:ml-72">

        {/* Toolbar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold">Coupons</div>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Add Coupon
            </button>
          </div>
        </div>

        {/* Table + Pagination */}
        <div className="mt-6 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading coupons...</div>
            ) : sortedRows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    <tr>
                      {COLUMNS.map(({ key, label }) => (
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
                      <th className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {pagedRows.map((c) => {
                      const expired = isExpired(c);
                      const statusText = expired ? "Expired" : c.isActive ? "Active" : "Inactive";
                      const statusClass = expired
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                        : c.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                            {c.code}
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-zinc-200">
                            {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {c.minOrderValue ? `₹${c.minOrderValue}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                          </td>
                          <td className={["px-4 py-3", expired ? "text-red-500" : "text-gray-700 dark:text-zinc-300"].join(" ")}>
                            {formatDate(c.expiryDate)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={[
                              "inline-flex w-20 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                              statusClass,
                            ].join(" ")}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(c)}
                                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(c)}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/15"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No coupons yet.</div>
            )}
          </div>

          {/* Pagination — matches OrderTable style, only shown when > 10 records */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedRows.length)} of{" "}
                {sortedRows.length} coupons
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
                      <span key={`ellipsis-${idx}`} className="px-1 text-sm text-gray-400">…</span>
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
      </div>

      {/* Add / Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold">{editing ? "Edit Coupon" : "Add Coupon"}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: "Code", field: "code", type: "text" },
                { label: "Discount Value", field: "discountValue", type: "text", inputMode: "decimal" },
                { label: "Min Order Value", field: "minOrderValue", type: "text", inputMode: "decimal" },
                { label: "Max Uses", field: "maxUses", type: "text", inputMode: "numeric" },
                { label: "Expiry Date", field: "expiryDate", type: "date" },
              ].map(({ label, field, type, inputMode }) => (
                <div key={field}>
                  <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">{label}</div>
                  <input
                    type={type}
                    inputMode={inputMode}
                    value={form[field]}
                    onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>
              ))}

              <div>
                <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Discount Type</div>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm((s) => ({ ...s, discountType: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="percentage">percentage</option>
                  <option value="fixed">fixed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Description</div>
                <input
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </div>

              <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={submit}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}