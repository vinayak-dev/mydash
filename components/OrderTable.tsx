import { Order } from "@/lib/fetchOrders";
import StatusBadge from "./StatusBadge";
import ImagePreview from "./ImagePreview";
import Link from "next/link";
import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";

function fmtDate(date: string) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

interface Props {
  orders: Order[];
  loading: boolean;
}

export default function OrderTable({ orders, loading }: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">No orders found</p>
      </div>
    );
  }

  const columns = [
    "TIMING",
    "Order Date",
    "Order ID",
    "Customer",
    "SKU",
    "Image",
    "Status",
    "Total",
    "Shipment",
    "Process Manager",
    "EPD",
    "EDD",
    "Artists",
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            <th className="px-4 py-3 text-center">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </th>
            {columns.map((col) => {
              if (col === "TIMING") {
                return (
                  <th key={col} className="px-2 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </th>
                );
              }
              return (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-semibold text-gray-800 tracking-wide whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    <div className="flex flex-col">
                      <svg className="w-2 h-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" /></svg>
                      <svg className="w-2 h-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o, idx) => {
            const hasDue = o.amountDue > 0;
            return (
              <tr
                key={o.orderItemId || idx}
                className={`transition-colors ${
                  hasDue
                    ? "bg-red-50 hover:bg-red-100"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                </td>

                {/* Timing */}
                <td className="px-2 py-3 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${hasDue ? "bg-[#ff4e4e]" : "bg-[#0ce3ba]"}`}></div>
                    <span className={`text-[10px] font-bold ${hasDue ? "text-[#ff4e4e]" : "text-[#0ce3ba]"}`}>
                      {hasDue ? "Late" : "On Time"}
                    </span>
                  </div>
                </td>

                {/* Order Date */}
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-800">
                  {fmtDate(o.createdAt)}
                  <div className="text-gray-500 font-normal">12:33 PM</div>
                </td>

                {/* Order ID */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedOrderId(o.orderItemId)}
                    className="font-bold text-sm text-gray-900 cursor-pointer hover:underline transition-all focus:outline-none"
                  >
                    {o.orderItemId || "—"}
                  </button>
                </td>

                {/* Customer */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-gray-800 text-sm">{o.customerName || "—"}</div>
                  {o.customerNumber && <div className="text-gray-500 text-xs">{o.customerNumber}</div>}
                </td>

                {/* SKU */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-800 text-xs">
                    {o.sku || "—"}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 max-w-[150px] truncate" title={o.productName}>
                    {o.productName}
                  </div>
                  {o.variantDetails && (
                    <div className="text-gray-400 text-xs mt-0.5 max-w-[150px] truncate" title={o.variantDetails}>
                      {o.variantDetails}
                    </div>
                  )}
                </td>

                {/* Image */}
                <td className="px-4 py-3">
                  <ImagePreview src={o.image} alt={o.productName} />
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={o.latestStatus} />
                </td>

                {/* Total */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-bold text-gray-800 text-sm">{money(o.total)}</div>
                  {hasDue ? (
                    <div className="text-red-500 text-xs font-semibold mt-0.5">Due: {money(o.amountDue)}</div>
                  ) : (
                    <div className="text-green-600 text-xs font-semibold mt-0.5">Paid</div>
                  )}
                </td>

                {/* Shipment */}
                <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs font-medium">
                  {o.shipment || "—"}
                </td>

                {/* Process Manager */}
                <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                  {o.processManager || "—"}
                </td>

                {/* EPD */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {fmtDate(o.epd)}
                </td>

                {/* EDD */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {fmtDate(o.edd) !== "—" ? fmtDate(o.edd) : fmtDate(o.deliveryDate)}
                </td>

                {/* Artists */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {o.artists || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {selectedOrderId && (
        <OrderDetailsModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}
