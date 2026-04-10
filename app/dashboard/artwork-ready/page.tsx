"use client";
import { useCallback, useEffect, useState } from "react";
import { Order } from "@/lib/fetchOrders";
import OrderTable from "@/components/OrderTable";
import DashboardHeader from "@/components/DashboardHeader";

const LIMIT = 10;
const AUTO_REFRESH_MS = 30_000;

export default function ArtworkReadyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (p: number, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/artwork-ready?page=${p}&limit=${LIMIT}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setOrders(json.orders ?? []);
      setTotalCount(json.totalCount ?? 0);
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch orders");
      setOrders([]);
      setTotalCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(page, true);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [page, fetchData]);

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.orderItemId?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
  const pendingDue = orders.filter((o) => o.amountDue > 0).length;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <DashboardHeader title="Artwork Ready" search={search} onSearch={setSearch} />

      <main className="max-w-screen-2xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">This Page</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className={`rounded-xl border px-5 py-4 shadow-sm ${pendingDue > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${pendingDue > 0 ? "text-red-500" : "text-gray-500"}`}>
              Pending Due
            </p>
            <p className={`text-2xl font-bold ${pendingDue > 0 ? "text-red-600" : "text-gray-900"}`}>
              {pendingDue}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-500 ml-auto">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
            {search ? `results` : `of ${totalCount} orders`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <OrderTable orders={filtered} loading={loading} />

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}
