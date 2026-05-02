import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X, Ticket } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
const linkIdle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white";
const linkActive = "bg-orange-500/15 text-orange-400 border border-orange-500/30";

export default function Sidebar() {
  const { logout } = useAdminAuth();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    ],
    [],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/80 p-2 text-gray-900 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200"
        aria-label="Toggle sidebar"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => setOpen(false)}
      />

      <aside
        className={[
          "fixed z-50 h-full w-72 border-r border-gray-200 bg-white px-4 py-6 transition-transform md:translate-x-0 dark:border-zinc-900 dark:bg-[#0a0a0a]",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 px-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">🎆 Garuda Admin</span>
        </div>

        <div className="my-5 h-px bg-gray-200 dark:bg-zinc-900" />

        <nav className="space-y-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")
              }
              onClick={() => setOpen(false)}
            >
              <it.icon className="h-4 w-4" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="my-5 h-px bg-gray-200 dark:bg-zinc-900" />

        <button
          type="button"
          onClick={logout}
          className={[linkBase, linkIdle, "w-full justify-start"].join(" ")}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
