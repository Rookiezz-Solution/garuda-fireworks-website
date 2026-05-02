import React, { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

// Stable placeholder — imported once, never causes re-render flicker
const PLACEHOLDER = "/placeholder.jpg";

function ProductImage({ src, alt }) {
  // If no src at all, show the "No Image" box immediately — no <img> rendered
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500 dark:text-gray-400">
        No Image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        // Prevent infinite error loop; swap to placeholder once
        if (e.target.src !== window.location.origin + PLACEHOLDER) {
          e.target.onerror = null;
          e.target.src = PLACEHOLDER;
        }
      }}
    />
  );
}

export default function ProductGrid({
  products,
  getImageUrl,
  onView,
  onEdit,
  onDelete,
  onToggleAvailable,
}) {
  if (!products?.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => {
        const image = getImageUrl ? getImageUrl(p) : p.images?.[0]?.imageUrl || null;
        return (
          <div
            key={p.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex gap-4">
              {/* Image box — fixed size, no layout shift */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <ProductImage src={image} alt={p.name} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {p.name}
                  </div>
                  {p.isFeatured && (
                    <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500 dark:text-orange-300">
                      Featured
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {p.category?.name || "Uncategorized"}
                </div>
                <div className="mt-2 flex items-end gap-2">
                  {p.offerPrice ? (
                    <>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{String(p.offerPrice)}
                      </div>
                      <div className="text-xs text-gray-500 line-through dark:text-gray-400">
                        ₹{String(p.actualPrice)}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{String(p.actualPrice)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onToggleAvailable?.(p)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  p.isAvailable
                    ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300"
                    : "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-700/40 dark:bg-zinc-900/40 dark:text-zinc-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    p.isAvailable ? "bg-green-400" : "bg-zinc-400 dark:bg-zinc-500",
                  ].join(" ")}
                />
                {p.isAvailable ? "Available" : "Unavailable"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onView?.(p)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit?.(p)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(p)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}