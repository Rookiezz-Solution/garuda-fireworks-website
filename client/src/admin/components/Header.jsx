import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "A";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Header({ title }) {
  const { adminUser } = useAdminAuth();
  const initials = useMemo(() => getInitials(adminUser?.name), [adminUser?.name]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("adminTheme") !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("adminTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-black/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Toggle theme"
            type="button"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-sm font-semibold text-orange-600 dark:text-orange-300">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{adminUser?.name || "Admin"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{adminUser?.email || adminUser?.phone}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
