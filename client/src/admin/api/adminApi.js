import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  sendOtp: (identifier) => api.post("/api/auth/send-otp", { identifier }),
  verifyOtp: (identifier, otp) => api.post("/api/auth/verify-otp", { identifier, otp }),
  me: () => api.get("/api/auth/me"),
};

export const productApi = {
  getAll: (params) => api.get("/api/products", { params }),
  getFeatured: () => api.get("/api/products/featured"),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const categoryApi = {
  getAll: () => api.get("/api/categories"),
  create: (data) => api.post("/api/categories", data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const orderApi = {
  getAll: (params) => api.get("/api/orders", { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

export const dashboardApi = {
  getData: () => api.get("/api/admin/dashboard"),
};

export const couponApi = {
  getAll: () => api.get("/api/coupons"),
  create: (data) => api.post("/api/coupons", data),
  update: (id, data) => api.put(`/api/coupons/${id}`, data),
  delete: (id) => api.delete(`/api/coupons/${id}`),
};

export default api;
