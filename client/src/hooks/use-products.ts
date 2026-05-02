import { useQuery } from "@tanstack/react-query";
import api, { getProducts } from "@/api/publicApi";

export type ApiImage = { id: number; imageUrl: string };
export type ApiCategory = { id: number; name: string };
export type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  actualPrice: string | number;
  offerPrice: string | number | null;
  isCoupon: boolean;
  couponPrice: string | number | null;
  isFeatured: boolean;
  isAvailable: boolean;
  createdOn: string;
  modifiedOn: string;
  createdBy: string | null;
  modifiedBy: string | null;
  categoryId: number | null;
  tags: string | null;
  images: ApiImage[];
  category: ApiCategory | null;
};

export function useProducts(search?: string, categoryId?: number | "All", sort?: string) {
  return useQuery({
    queryKey: ["products", search, categoryId, sort],
    queryFn: async () => {
      const res = await getProducts({
        search: search?.trim() ? search.trim() : undefined,
        category: categoryId && categoryId !== "All" ? categoryId : undefined,
        sort: sort || undefined,
      });
      return (res.data?.data?.products ?? []) as ApiProduct[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/api/products/${id}`);
      return (res.data?.data?.product ?? null) as ApiProduct | null;
    },
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
