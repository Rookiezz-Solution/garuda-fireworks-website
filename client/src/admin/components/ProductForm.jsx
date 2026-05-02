import React, { useEffect, useMemo, useState } from "react";

function Field({ label, children, error }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-700 dark:text-zinc-300">{label}</div>
      {children}
      {error ? <div className="mt-1 text-xs text-red-400">{error}</div> : null}
    </div>
  );
}

// ─── Stable image preview ────────────────────────────────────────────────────
// Only mounts an <img> when there is an actual URL to show.
// When there is no URL (no file selected, no existing image, image cleared)
// it shows a placeholder box — no broken-image network request at all.
function ImagePreview({ src }) {
  if (!src) {
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-950">
        No image selected
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <img
        key={src} // key change forces a clean remount instead of in-place src swap
        src={src}
        alt="Preview"
        className="h-28 w-full object-cover"
        loading="eager"
        decoding="sync"
        onError={(e) => {
          e.target.onerror = null;
          // Swap to placeholder box by hiding the img and showing text
          e.target.style.display = "none";
          const box = e.target.parentElement;
          if (box && !box.querySelector(".img-error-msg")) {
            const msg = document.createElement("div");
            msg.className =
              "img-error-msg flex h-28 w-full items-center justify-center text-xs text-gray-400";
            msg.textContent = "Image failed to load";
            box.appendChild(msg);
          }
        }}
      />
    </div>
  );
}

export default function ProductForm({ open, onClose, onSubmit, categories, initial }) {
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    actualPrice: "",
    offerPrice: "",
    tags: "",
    isFeatured: false,
    isAvailable: true,
    isCoupon: false,
    couponPrice: "",
  });

  const [imageFile, setImageFile]           = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [blobUrl, setBlobUrl]               = useState("");   // stable blob URL
  const [clearImage, setClearImage]         = useState(false);
  const [errors, setErrors]                 = useState({});
  const [saving, setSaving]                 = useState(false);

  const isEdit = Boolean(initial?.id);
  const title  = isEdit ? "Edit Product" : "Add Product";

  // ── Reset form when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      name:         initial?.name || "",
      categoryId:   initial?.categoryId ? String(initial.categoryId) : "",
      description:  initial?.description || "",
      actualPrice:  initial?.actualPrice ? String(initial.actualPrice) : "",
      offerPrice:   initial?.offerPrice ? String(initial.offerPrice) : "",
      tags:         initial?.tags || "",
      isFeatured:   Boolean(initial?.isFeatured),
      isAvailable:  initial?.isAvailable === undefined ? true : Boolean(initial?.isAvailable),
      isCoupon:     Boolean(initial?.isCoupon),
      couponPrice:  initial?.couponPrice ? String(initial.couponPrice) : "",
    });
    setImageFile(null);
    setBlobUrl("");
    setExistingImageUrl(initial?.images?.[0]?.imageUrl || "");
    setClearImage(false);
  }, [open, initial]);

  // ── Create / revoke blob URL only when imageFile actually changes ────────
  useEffect(() => {
    if (!imageFile) {
      setBlobUrl("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url); // cleanup on next change or unmount
  }, [imageFile]);

  // ── Derive the single source-of-truth preview src ───────────────────────
  // Priority: new blob > cleared (null) > existing URL
  const previewSrc = useMemo(() => {
    if (clearImage) return "";          // user explicitly cleared
    if (blobUrl)    return blobUrl;     // new file selected
    return existingImageUrl || "";      // existing from server
  }, [clearImage, blobUrl, existingImageUrl]);

  const validate = () => {
    const next = {};
    if (!form.name.trim())                               next.name        = "Product Name is required";
    if (!form.categoryId)                                next.categoryId  = "Category is required";
    if (!String(form.actualPrice).trim())                next.actualPrice = "Actual Price is required";
    if (form.isCoupon && !String(form.couponPrice).trim()) next.couponPrice = "Coupon Price is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name",         form.name);
      fd.set("categoryId",   String(Number(form.categoryId)));
      fd.set("description",  form.description || "");
      fd.set("actualPrice",  String(form.actualPrice));
      fd.set("offerPrice",   form.offerPrice || "");
      fd.set("tags",         form.tags || "");
      fd.set("isFeatured",   String(Boolean(form.isFeatured)));
      fd.set("isAvailable",  String(Boolean(form.isAvailable)));
      fd.set("isCoupon",     String(Boolean(form.isCoupon)));
      fd.set("couponPrice",  form.isCoupon ? String(form.couponPrice || "") : "");
      if (imageFile)  fd.set("image",      imageFile);
      if (clearImage) fd.set("clearImage", "true");

      await onSubmit?.(fd);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900" style={{ maxHeight: "90vh" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        {/* Fields */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Product Name*" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </Field>

          <Field label="Category*" error={errors.categoryId}>
            <div className="relative">
              <select
                value={form.categoryId}
                onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
              className="select-field w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option value="">Select category</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </Field>

          <Field label="Actual Price*" error={errors.actualPrice}>
            <input
              value={form.actualPrice}
              onChange={(e) => setForm((s) => ({ ...s, actualPrice: e.target.value }))}
              inputMode="decimal"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </Field>

          <Field label="Offer Price">
            <input
              value={form.offerPrice}
              onChange={(e) => setForm((s) => ({ ...s, offerPrice: e.target.value }))}
              inputMode="decimal"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </Field>

          <Field label="Tags (comma separated)">
            <input
              value={form.tags}
              onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </Field>

          {/* Upload Image — always stable, never flickers */}
          <Field label="Upload Image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setImageFile(f);
                if (f) setClearImage(false);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setBlobUrl("");
                  setExistingImageUrl("");
                  setClearImage(true);
                }}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Clear Image
              </button>
            </div>
            {/* Only renders <img> when there is actually something to show */}
            <div className="mt-2">
              <ImagePreview src={previewSrc} />
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              className="min-h-[92px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </Field>
        </div>

        {/* Checkboxes */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { key: "isFeatured",  label: "Is Featured" },
            { key: "isAvailable", label: "Is Available" },
            { key: "isCoupon",    label: "Is Coupon" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        {form.isCoupon && (
          <div className="mt-4">
            <Field label="Coupon Price" error={errors.couponPrice}>
              <input
                value={form.couponPrice}
                onChange={(e) => setForm((s) => ({ ...s, couponPrice: e.target.value }))}
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </Field>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
