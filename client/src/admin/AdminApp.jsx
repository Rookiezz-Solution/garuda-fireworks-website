import React from "react";
import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { Toaster } from "react-hot-toast";

export default function AdminApp() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #27272a",
            },
          }}
        />
        <AdminRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
