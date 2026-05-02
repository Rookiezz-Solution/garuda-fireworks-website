import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  right,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
