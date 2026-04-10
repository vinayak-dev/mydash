"use client";
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, Package } from 'lucide-react';

export default function DashboardCharts({ data }: { data: any }) {
  if (!data) return null;

  const dailyOrders = data?.dailyOrders || [];
  const topProducts = data?.getTopProductsSold || [];

  // Sort daily orders by date ascending just in case
  const sortedDailyOrders = [...dailyOrders].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const formattedChartData = sortedDailyOrders.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    sales: d.sales,
    orders: d.orders,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Daily Orders & Sales Chart
          </h3>
        </div>
        <div className="p-5 h-[350px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="sales" name="Sales (₹)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Orders Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[415px]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Daily Orders
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDailyOrders.map((d: any) => (
                <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-700">
                    {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs min-w-[2rem]">
                      {d.orders}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedDailyOrders.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-gray-400">
                    No daily orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[415px]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-500" />
            Top Products Sold
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium text-right">Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product: any, idx: number) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-gray-700 truncate max-w-[140px] block" title={product.productName}>
                        {product.productName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold text-xs min-w-[2rem]">
                      {product.count}
                    </span>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
