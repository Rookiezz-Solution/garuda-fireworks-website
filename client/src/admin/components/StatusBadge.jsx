export default function StatusBadge({ status, clickable, className }) {
  const key = String(status || "").toLowerCase();

  const colors = {
    enquiry: "bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-300",
    ordered: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    dispatched: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  const cls = colors[key] || "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full px-3 h-full text-xs font-medium",
        cls,
        clickable ? "cursor-pointer" : "",
        className || "",
      ].join(" ")}
    >
      {key || "unknown"}
    </span>
  );
}