import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, PackageX } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/publicApi";

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "All">("All");
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(12);

  const { data: categories } = useQuery({
    queryKey: ["publicCategories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data?.data?.categories ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { data: products, isLoading } = useProducts(search, categoryId, sort);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, categoryId, sort]);

  const visibleProducts = products?.slice(0, visibleCount) ?? [];

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-6" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Our Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Explore our premium range of fireworks. Filter by category or search for your favorites.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-4 pb-4 mb-2 rounded-3xl shadow-sm border border-border">
          
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <select
                value={categoryId === "All" ? "" : String(categoryId)}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "All")}
                className="select-field px-4 py-2 rounded-xl border border-border bg-muted text-foreground"
              >
                <option value="">All Categories</option>
                {(categories || []).map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCategoryId("All")}
                className="px-4 py-2 rounded-xl font-semibold bg-muted text-foreground hover:bg-muted/80"
              >
                Clear Filter
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <div className="text-sm font-semibold text-muted-foreground">Sort</div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select-field px-4 py-2 rounded-xl border border-border bg-muted text-foreground"
              >
                <option value="price_low">Price Low→High</option>
                <option value="price_high">Price High→Low</option>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
              </select>
              <button
                type="button"
                onClick={() => setSort("newest")}
                className="px-4 py-2 rounded-xl font-semibold bg-muted text-foreground hover:bg-muted/80"
              >
                Clear Sort
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="w-full lg:w-80 relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
               <div key={i} className="animate-pulse bg-card rounded-3xl aspect-[3/4] border border-border" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
            {products.length > visibleCount && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 12)}
                  className="px-10 py-4 rounded-2xl font-black bg-secondary text-secondary-foreground shadow-xl shadow-secondary/20 hover:shadow-secondary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <PackageX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => { setSearch(""); setCategoryId("All"); }}
              className="mt-6 px-6 py-2 rounded-xl bg-secondary/20 text-secondary font-semibold hover:bg-secondary/30 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
