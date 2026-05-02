import React from "react";

/**
 * DeleteConfirmModal
 * Props:
 *   open        – boolean
 *   title       – string  e.g. "Delete Product"
 *   description – string  e.g. 'Are you sure you want to delete "Gift Box"?'
 *   onCancel    – () => void
 *   onConfirm   – () => void
 *   loading     – boolean (shows "Deleting…" on confirm button)
 */
export default function DeleteConfirmModal({
  open,
  title = "Delete",
  description = "Are you sure? This action cannot be undone.",
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">{title}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</div>
          </div>

          <div className="mt-2 flex w-full gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 bg-gray-50 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              No, Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {loading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}