export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Artwork Ready":        "bg-[#ffcf65] text-gray-900",
    "Artwork in Progress":  "bg-orange-400 text-white",
    "Processing":           "bg-[#0ce3ba] text-gray-900",
    "Work in Progress":     "bg-blue-400 text-white",
    "Pending payment":      "bg-[#a1a1a5] text-white",
    "Cancelled":            "bg-red-400 text-white",
    "Delivered":            "bg-purple-400 text-white",
    "Ordered":              "bg-indigo-400 text-white",
    "Info Pending":         "bg-gray-300 text-gray-800",
    "Image Pending":        "bg-gray-400 text-white",
  };
  const cls = map[status] ?? "bg-gray-200 text-gray-700";

  return (
    <span
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${cls} whitespace-nowrap min-w-[120px]`}
    >
      {status || "Unknown"}
    </span>
  );
}
