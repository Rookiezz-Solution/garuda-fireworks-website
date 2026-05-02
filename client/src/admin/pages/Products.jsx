import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import ProductForm from "../components/ProductForm";
import CategoryModal from "../components/CategoryModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { categoryApi, productApi } from "../api/adminApi";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function sortToApi(sort) {
  if (sort === "price_low") return "price_asc";
  if (sort === "price_high") return "price_desc";
  if (sort === "featured") return "featured";
  return "newest";
}

const getImageUrl = (product) => {
  if (product?.images?.length > 0) {
    const url = product.images[0].imageUrl;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  }
  return null;
};

// Single arrow icon matching Orders/Coupons style
function SortArrow({ active, dir }) {
  if (!active) return <span className="text-gray-400">↑</span>;
  return <span className="text-orange-500">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [columnSortKey, setColumnSortKey] = useState(null);
  const [columnSortDir, setColumnSortDir] = useState("asc");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // product object
  const [deleting, setDeleting] = useState(false);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      categoryId: categoryFilter || undefined,
      sort: sortToApi(sort),
      limit: 9,
      page,
    }),
    [search, categoryFilter, sort, page],
  );

  const loadCategories = async () => {
    const res = await categoryApi.getAll();
    setCategories(res?.data?.data?.categories ?? []);
  };

  const loadProducts = async ({ reset, pageOverride } = {}) => {
    const nextPage = reset ? 1 : pageOverride ?? page;
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await productApi.getAll({ ...params, page: nextPage });
      const next = res?.data?.data?.products ?? [];
      setProducts((prev) => (reset ? next : [...prev, ...next]));
      setHasMore(next.length >= 9);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    (async () => { await loadCategories(); })();
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      loadProducts({ reset: true });
      return;
    }
    const t = setTimeout(() => { loadProducts({ reset: true }); }, 350);
    return () => clearTimeout(t);
  }, [search, categoryFilter, sort]);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setShowForm(true); };

  const submitProduct = async (data) => {
    try {
      if (editing?.id) {
        await productApi.update(editing.id, data);
        toast.success("Product updated");
      } else {
        await productApi.create(data);
        toast.success("Product created");
      }
      await loadProducts({ reset: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Save failed");
      throw e;
    }
  };

  const toggleColumnSort = (key) => {
    if (columnSortKey === key) setColumnSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setColumnSortKey(key); setColumnSortDir("asc"); }
  };

  const displayedProducts = useMemo(() => {
    if (!columnSortKey) return products;
    const dir = columnSortDir === "desc" ? -1 : 1;
    const valueFor = (p) => {
      if (columnSortKey === "name") return String(p.name || "");
      if (columnSortKey === "category") return String(p.category?.name || "");
      if (columnSortKey === "price") return Number(p.offerPrice ?? p.actualPrice ?? 0);
      return 0;
    };
    const next = [...(products || [])];
    next.sort((a, b) => {
      const av = valueFor(a), bv = valueFor(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return next;
  }, [products, columnSortDir, columnSortKey]);

  // Opens the delete confirm modal instead of window.confirm
  const requestDeleteProduct = (p) => setDeleteTarget(p);

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.delete(deleteTarget.id);
      toast.success("Product deleted");
      // Remove immediately from local state for instant feedback
      setProducts((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const toggleAvailable = async (p) => {
    const next = !p.isAvailable;
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, isAvailable: next } : x)));
    try {
      await productApi.update(p.id, { isAvailable: next });
      toast.success("Availability updated");
    } catch (e) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, isAvailable: p.isAvailable } : x)));
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
    }
  };

  const addCategory = async (data) => {
    try {
      await categoryApi.create(data);
      toast.success("Category created");
      await loadCategories();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Create category failed");
      throw e;
    }
  };

  const deleteCategory = async (c) => {
    try {
      await categoryApi.delete(c.id);
      toast.success("Category deleted");
      await loadCategories();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Delete category failed");
    }
  };

  const SORT_COLS = [
    { key: "name",     label: "Name" },
    { key: "category", label: "Category" },
    { key: "price",    label: "Price" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Header title="Products" />
      <div className="px-6 py-6 md:ml-72">

        {/* ── Toolbar card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

          {/* Row 1: title + filters + add button */}
          <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-lg font-semibold">Products</div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-56"
              />

              {/* Category filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-field w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-48"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Sort select */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                className="select-field w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-950 sm:w-48"
                >
                  <option value="price_low">Price low–high</option>
                  <option value="price_high">Price high–low</option>
                  <option value="newest">Newest</option>
                  <option value="featured">Featured</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>

              {/* Add Product dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddMenuOpen((v) => !v)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto"
                >
                  Add Product
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {addMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
                    <button
                      type="button"
                      onClick={() => { setAddMenuOpen(false); openCreate(); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddMenuOpen(false); setShowCategoryModal(true); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Manage Categories
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: column sort bar — separate divider row */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-800">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
            {SORT_COLS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleColumnSort(key)}
                className={[
                  "inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold transition-colors",
                  columnSortKey === key
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-300"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {label}
                <SortArrow active={columnSortKey === key} dir={columnSortDir} />
              </button>
            ))}
            {columnSortKey && (
              <button
                type="button"
                onClick={() => { setColumnSortKey(null); setColumnSortDir("asc"); }}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Loading products...
            </div>
          ) : (
            <ProductGrid
              products={displayedProducts}
              getImageUrl={getImageUrl}
              onView={(p) => toast(p.description ? `${p.name}: ${p.description}` : p.name)}
              onEdit={openEdit}
              onDelete={requestDeleteProduct}
              onToggleAvailable={toggleAvailable}
            />
          )}
        </div>

        {/* Load more */}
        <div className="mt-6 flex justify-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                loadProducts({ reset: false, pageOverride: nextPage });
              }}
              disabled={loadingMore}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm text-gray-900 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">End of results</div>
          )}
        </div>
      </div>

      {/* Product form modal */}
      <ProductForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={submitProduct}
        categories={categories}
        initial={editing}
      />

      {/* Category modal — passes onDelete that uses the shared confirm modal */}
      <CategoryModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Product"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : ""}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteProduct}
        loading={deleting}
      />
    </div>
  );
}
