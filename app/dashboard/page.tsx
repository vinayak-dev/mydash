"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Order } from "@/lib/fetchOrders";
import OrderTable from "@/components/OrderTable";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardCharts from "@/components/DashboardCharts";

type Tab = "processing" | "wip" | "artwork-ready";

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: "processing", label: "Processing", color: "yellow" },
  { key: "wip", label: "Work in Progress", color: "blue" },
  { key: "artwork-ready", label: "Artwork Ready", color: "green" },
];

const LIMIT = 10;
const AUTO_REFRESH_MS = 30_000;

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("processing");
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
  });
  const [overview, setOverview] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState({ jan: 0, feb: 0, mar: 0 });
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (t: Tab, p: number, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${t}?page=${p}&limit=${LIMIT}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setOrders(json.orders ?? []);
      setTotalCount(json.totalCount ?? 0);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch orders");
      setOrders([]);
      setTotalCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Reset and fetch when tab changes
  useEffect(() => {
    setPage(1);
    setSearch("");
    fetchData(tab, 1);
  }, [tab, fetchData]);

  // Fetch Overview Data
  useEffect(() => {
    async function fetchOverview() {
      let url = "/api/orders/overview?id=62807ff1b886b850a23da02e";
      if (startDate) url += `&startDate=${startDate}T00:00:00Z`;
      if (endDate) url += `&endDate=${endDate}T23:59:59Z`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error("Failed to fetch overview", err);
      }
    }
    fetchOverview();
  }, [startDate, endDate]);

  // Fetch Monthly Stats
  useEffect(() => {
    async function fetchMonthlyStats() {
      const year = new Date().getFullYear();
      const getLastDay = (m: number) => new Date(year, m, 0).getDate();
      
      const fetchMonth = async (m: number) => {
        const start = `${year}-${String(m).padStart(2, '0')}-01T00:00:00Z`;
        const end = `${year}-${String(m).padStart(2, '0')}-${getLastDay(m)}T23:59:59Z`;
        const url = `/api/orders/overview?id=62807ff1b886b850a23da02e&startDate=${start}&endDate=${end}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          return data?.ordered?.[0]?.totalSaleAmount || 0;
        } catch {
          return 0;
        }
      };

      try {
        const [jan, feb, mar] = await Promise.all([
          fetchMonth(1),
          fetchMonth(2),
          fetchMonth(3),
        ]);
        setMonthlyStats({ jan, feb, mar });
      } catch (err) {
        console.error("Failed to fetch monthly stats", err);
      }
    }
    fetchMonthlyStats();
  }, []);

  // Fetch when page changes
  useEffect(() => {
    fetchData(tab, page);
  }, [page]); // eslint-disable-line

  // Auto-refresh timer
  useEffect(() => {
    setCountdown(AUTO_REFRESH_MS / 1000);

    intervalRef.current = setInterval(() => {
      fetchData(tab, page, true);
      setCountdown(AUTO_REFRESH_MS / 1000);
    }, AUTO_REFRESH_MS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [tab, page, fetchData]);

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.orderItemId?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const title = TABS.find((t) => t.key === tab)?.label || "Dashboard";

  const overviewTotalSales = overview?.ordered?.[0]?.totalSaleAmount || 0;
  const overviewCount = overview?.ordered?.[0]?.count || 0;
  const displayDates = startDate && endDate ? `From ${startDate} to ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Until ${endDate}` : "All Time Overview"));

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <DashboardHeader 
        title={title} 
        search={search} 
        onSearch={setSearch} 
        startDate={startDate}
        endDate={endDate}
        onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }}
      />

      <main className="max-w-screen-2xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Global Overview Stats */}
        <div className="bg-[#1b2031] text-white rounded-xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-2">
            <h2 className="text-lg font-bold tracking-wide">Overview Stats</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-lg border border-gray-700/50 backdrop-blur-sm">
              <span>From</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-transparent border-none outline-none text-gray-200 cursor-pointer w-[110px]"
              />
              <span>To</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-transparent border-none outline-none text-gray-200 cursor-pointer w-[110px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-12 text-right relative z-10">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Total Sales Amount</p>
              <p className="text-2xl font-bold text-[#0ce3ba]">₹{overviewTotalSales.toLocaleString("en-IN")}</p>
            </div>
            <div className="w-px h-10 bg-gray-700 hidden sm:block"></div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Total Orders</p>
              <p className="text-2xl font-bold">{overviewCount}</p>
            </div>
            <div className="w-px h-10 bg-gray-700 hidden lg:block mx-2"></div>
            <div className="hidden lg:flex items-center gap-8 bg-black/10 px-6 py-2 rounded-xl">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Jan</p>
                <p className="text-lg font-bold text-white">₹{monthlyStats.jan.toLocaleString("en-IN")}</p>
              </div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Feb</p>
                <p className="text-lg font-bold text-white">₹{monthlyStats.feb.toLocaleString("en-IN")}</p>
              </div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Mar</p>
                <p className="text-lg font-bold text-white">₹{monthlyStats.mar.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>



        {/* Charts & Tables */}
        <DashboardCharts data={overview} />

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {tab === t.key && !loading && totalCount > 0 && (
                <span className="ml-2 text-xs bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + pagination info */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-500 ml-auto">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
            {search ? `results` : `of ${totalCount} orders`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <OrderTable orders={filtered} loading={loading} />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + Math.max(1, page - 3);
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm transition ${
                      p === page
                        ? "bg-indigo-600 text-white font-semibold shadow"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
            <span>Row highlighted = amount due pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200" />
            <span>Click image thumbnail to preview full size</span>
          </div>
        </div>
      </main>
    </div>
  );
}
