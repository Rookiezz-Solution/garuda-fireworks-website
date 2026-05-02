import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem("adminToken");
    if (!t) {
      setAdminUser(null);
      setLoading(false);
      return;
    }
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem("adminUser");
      }
    }

    setLoading(true);
    try {
      const res = await authApi.me();
      const user = res?.data?.data?.user ?? null;
      setAdminUser(user);
      if (user) localStorage.setItem("adminUser", JSON.stringify(user));
    } catch (e) {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe, token]);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
    window.location.href = "/admin";
  }, []);

  const value = useMemo(
    () => ({
      token,
      adminUser,
      isAuthenticated: Boolean(token),
      loading,
      refreshMe,
      logout,
    }),
    [token, adminUser, loading, refreshMe, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
