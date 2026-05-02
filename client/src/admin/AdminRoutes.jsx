import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useAdminAuth } from "./context/AdminAuthContext";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Coupons from "./pages/Coupons";
import Orders from "./pages/Orders";

function FullscreenLoader({ label }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-center text-zinc-400">
      {label || "Loading..."}
    </div>
  );
}

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAdminAuth();
  if (loading) return <FullscreenLoader label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

function LoginRoute() {
  const { loading, isAuthenticated } = useAdminAuth();
  if (loading) return <FullscreenLoader label="Loading..." />;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLogin />;
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/orders" element={<Orders />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
