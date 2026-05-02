import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function CategoryModal({ open, onClose, categories, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd?.({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete?.(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Category Modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop — blurred when delete modal is not open */}
        <div
          className={[
            "absolute inset-0 bg-black/50",
            deleteTarget ? "backdrop-blur-none" : "backdrop-blur-sm",
          ].join(" ")}
          onClick={onClose}
        />

        <div className="relative z-40 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Categories
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>

          {/* Add category form */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Add Category
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category Name"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={saving || !name.trim()}
                onClick={handleAdd}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>

          {/* Existing categories list */}
          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Existing Categories
            </div>
            {!categories?.length ? (
              <div className="py-4 text-center text-sm text-gray-400">No categories yet.</div>
            ) : (
              <div className="max-h-64 divide-y divide-gray-200 overflow-y-auto rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {c.description || "—"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal — z-50 so it floats above category modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? Products in this category will become uncategorized.`
            : ""
        }
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </>
  );
}