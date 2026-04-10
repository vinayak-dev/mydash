"use client";
import { useEffect, useState } from "react";

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/orders/details?id=${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order details");
        const data = await res.json();
        setDetails(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    async function fetchUsers() {
      try {
        const res = await fetch("https://api.buttistore.com/api/user/options");
        const data = await res.json();
        setUserOptions(data);
      } catch (err: any) {
        console.error("Failed to fetch user options:", err);
      }
    }
    fetchDetails();
    fetchUsers();
  }, [orderId]);

  const pms = userOptions.filter(u => u.role === "processManager");
  const croppingArtists = userOptions.filter(u => u.role === "croppingArtist");
  const coloringArtists = userOptions.filter(u => u.role === "coloringArtist");
  const correctionArtists = userOptions.filter(u => u.role === "correctionArtist");

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleDateChange = async (field: "epd" | "edd" | "deliveryDate", value: string) => {
    setDetails((prev: any) => ({ ...prev, [field]: value }));
    try {
      const res = await fetch(`/api/orders/details?id=${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`Failed to update ${field}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative flex flex-col w-full max-w-[1400px] h-full max-h-[90vh] bg-gray-50 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-white px-8 py-5 border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button className="bg-[#1b2031] hover:bg-[#2d3550] text-white px-10 py-1.5 rounded-md text-sm font-semibold transition-colors">
              Save
            </button>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">Send Confirmation Email</label>
              <div className="w-8 h-4 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="w-3.5 h-3.5 bg-white rounded-full absolute left-0.5 top-[1px] shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 w-full overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading details for {orderId}...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Left Column */}
              <div className="flex-1 w-full space-y-6">

                {/* Top Order Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Order No. <span className="text-[#ff745c]">#{orderId}</span>
                    </h2>
                    <p className="text-blue-600 font-semibold text-sm mt-1">{details?.latestStatus || "Pending payment"}</p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Preview Date</label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 bg-white text-sm focus-within:ring-1 focus-within:ring-indigo-300">
                        <input 
                          type="date" 
                          value={formatDateForInput(details?.epd)}
                          onChange={(e) => handleDateChange("epd", e.target.value)}
                          className="bg-transparent border-none outline-none text-gray-600 w-[110px] cursor-pointer" 
                        />
                        <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Date</label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 bg-white text-sm focus-within:ring-1 focus-within:ring-indigo-300">
                        <input 
                          type="date" 
                          value={formatDateForInput(details?.edd || details?.deliveryDate)}
                          onChange={(e) => handleDateChange("deliveryDate", e.target.value)}
                          className="bg-transparent border-none outline-none text-gray-600 w-[110px] cursor-pointer" 
                        />
                        <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Order Details Box */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <label className="text-sm font-semibold text-gray-800">Product<br />Name:</label>
                    <div className="space-y-4">
                      <select className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 bg-white focus:outline-none">
                        <option>{details?.productName || "Digi Painting"}</option>
                      </select>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 border border-dashed border-gray-300 rounded p-3 text-sm text-gray-700 bg-gray-50">
                          {details?.variantDetails || "3 Face | Size: B3 | Format: Textured Block | Process & Delivery Time: Standard |"} 
                          <br/>SKU: {details?.sku}
                        </div>
                        <button className="pt-2 text-gray-500 hover:text-gray-800">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="ml-[120px] max-w-[400px]">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-800 mb-2">
                      <span>Coupon Code</span>
                      <span>{details?.couponDetails?.code || "SURPRISE10"}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-end font-semibold text-sm mb-4">
                      <div>
                        <span className="text-gray-800">QTY : {details?.quantity || 1}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-500">Price</span>
                        <span className="text-gray-800">₹{details?.basePrice || details?.total || "3000"}</span>
                        <span className="text-gray-500 mt-2">Sales Price</span>
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold text-gray-800 mb-4">
                      ₹{details?.salesPrice || details?.total || "2797"}
                    </div>

                    <div className="border-t border-b border-gray-800 py-3 mb-4 space-y-2 text-sm font-bold">
                      <div className="flex justify-between">
                        <span className="text-gray-800">Total</span>
                        <span className="text-gray-800">₹{details?.total || "0"}</span>
                      </div>
                      <div className="flex justify-between text-[#ff745c]">
                        <span>Discount</span>
                        <span>- ₹{details?.discount || "0"}</span>
                      </div>
                      <div className="flex justify-between text-[#ff745c]">
                        <span>Bank Discount</span>
                        <span>- ₹{details?.bankDiscount || "0"}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-gray-800">Additional Fee</span>
                        <button>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-gray-800 mb-2 items-center">
                      <span>Grand Total</span>
                      <div className="flex items-center gap-2">
                        <span>₹{details?.total || "0"}</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                      </div>
                    </div>

                    <div className="flex justify-center border-t border-[#ff745c] pt-2 mb-8">
                      <div className="space-y-1 text-sm font-bold text-[#ff745c] text-center w-full max-w-[200px]">
                        <div className="flex justify-between">
                          <span>Amount Paid</span>
                          <span>₹{details?.amountPaid || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Due</span>
                          <span>₹{details?.amountDue || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4 mb-8">
                    <label className="text-sm font-semibold text-gray-800">Payment:</label>
                    <select className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 bg-white focus:outline-none font-semibold">
                      <option>{details?.paymentMethod || "Advance +Cod"}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr] gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-800 block mb-2">Contact:</label>
                      <div className="bg-gray-50 border border-gray-100 rounded p-4 relative text-xs text-gray-800 font-semibold space-y-3">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        <div className="grid grid-cols-[70px_1fr]">
                          <span className="text-gray-500">Email:</span>
                          <span>{details?.customerEmail || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[70px_1fr]">
                          <span className="text-gray-500">Phone:</span>
                          <span>{details?.customerNumber || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[70px_1fr]">
                          <span className="text-gray-500">WhatsApp:</span>
                          <span>{details?.whatsappNumber || details?.customerNumber || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-800 block mb-2">Address:</label>
                      <div className="bg-gray-50 border border-gray-100 rounded p-4 relative text-xs text-gray-800 font-semibold leading-relaxed">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        {details?.customerName || "Customer Name"} <br/>
                        {details?.address || "Address"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-semibold text-blue-600 px-1">
                    <button
                      onClick={() => setShowGallery(!showGallery)}
                      className="hover:underline"
                    >
                      {showGallery ? "Hide Order Image Gallery" : "Show Order Image Gallery"}
                    </button>
                    <div className="flex items-center gap-1 hover:underline cursor-pointer">
                      <span>Link to Images</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </div>
                  </div>

                  {showGallery && details?.imagesFile && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                      {Array.isArray(details.imagesFile) && details.imagesFile.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                          {details.imagesFile.map((imgUrl: string, idx: number) => {
                            const isPdf = imgUrl.toLowerCase().includes('.pdf');
                            return (
                              <div key={idx} className="relative group">
                                {isPdf ? (
                                  <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center flex-col gap-1 text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-[10px] font-semibold">PDF</span>
                                  </div>
                                ) : (
                                  <img src={imgUrl} alt={`Order Image ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                                )}
                                <a
                                  href={imgUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-x-0 bottom-0 py-1 bg-black/70 hover:bg-black/90 text-white text-[10px] text-center rounded-b-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Download
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 flex items-center justify-center py-4">No images uploaded for this order</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-gray-300 rounded overflow-hidden flex flex-col">
                    <div className="bg-[#1b2031] text-white text-xs font-semibold px-4 py-2">Notes</div>
                    <textarea className="w-full h-24 p-3 text-sm focus:outline-none resize-none bg-gray-50" placeholder="Notes..."></textarea>
                  </div>
                  <div className="border border-gray-300 rounded overflow-hidden flex flex-col">
                    <div className="bg-[#1b2031] text-white text-xs font-semibold px-4 py-2">Requirements</div>
                    <div className="flex bg-gray-50 h-24">
                      <textarea className="w-full h-full p-3 text-sm focus:outline-none resize-none bg-transparent" placeholder="Requirements..."></textarea>
                      <div className="flex items-end justify-end p-2 pb-3">
                        <div className="border border-gray-300 rounded px-4 py-1.5 bg-white text-[#ff745c] flex items-center justify-center cursor-pointer hover:bg-gray-50">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <details className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden group">
                  <summary className="bg-[#1b2031] cursor-pointer text-white font-semibold text-xs px-4 py-2 select-none group-open:bg-[#2d3550] transition-colors">
                    View Raw API Response
                  </summary>
                  <div className="p-4 bg-gray-50">
                    <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </div>
                </details>

              </div>

              {/* Right Column */}
              <div className="w-[340px] flex-shrink-0 space-y-6">

                {/* Status Section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-300 text-gray-700 font-semibold focus:outline-none appearance-none">
                    <option>{details?.latestStatus || "Pending payment"}</option>
                  </select>
                </div>

                {/* Assign Section */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="bg-[#1b2031] text-white text-xs font-semibold px-4 py-2">Assign</div>
                  <div className="p-4 space-y-4 bg-white">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Process Manager</label>
                      <select 
                        value={details?.processManager?._id || details?.processManager || ""}
                        onChange={() => {}}
                        className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
                      >
                        <option value="">Select Process Manager...</option>
                        {pms.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="text-xs font-bold text-gray-800">Cropping Artist</label>
                        <span className="text-[10px] text-gray-500">Orders in Hand: <span className="text-[#ff745c] font-bold">0</span></span>
                      </div>
                      <select 
                        value={details?.croppingArtist?._id || details?.croppingArtist || ""}
                        onChange={() => {}}
                        className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
                      >
                        <option value="">Select Cropping Artist...</option>
                        {croppingArtists.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="text-xs font-bold text-gray-800">Coloring Artist</label>
                        <span className="text-[10px] text-gray-500">Orders in Hand: <span className="text-[#ff745c] font-bold">0</span></span>
                      </div>
                      <select 
                        value={details?.coloringArtist?._id || details?.coloringArtist || ""}
                        onChange={() => {}}
                        className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
                      >
                        <option value="">Select Coloring Artist...</option>
                        {coloringArtists.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Correction Artist</label>
                      <select 
                        value={details?.correctionArtist?._id || details?.correctionArtist || ""}
                        onChange={() => {}}
                        className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
                      >
                        <option value="">Select Correction Artist...</option>
                        {correctionArtists.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Shipment Tracking */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="bg-[#1b2031] text-white text-xs font-semibold px-4 py-2">Shipment Tracking</div>
                  <div className="p-4 space-y-4 bg-white">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Shipping Provider</label>
                      <div className="relative">
                        <select className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-800 font-semibold focus:outline-none appearance-none bg-white">
                          <option>Delhivery</option>
                        </select>
                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">AWB Number</label>
                      <input type="text" className="w-full border-none bg-gray-50 rounded px-3 py-1.5 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Tracking Link</label>
                      <input type="text" className="w-full border-none bg-gray-50 rounded px-3 py-1.5 text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Order Logs */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="bg-[#1b2031] text-white text-xs font-semibold px-4 py-2">Order Logs</div>
                  <div className="py-4 bg-white">
                    <div className="px-4 text-xs">
                      <div className="font-semibold text-gray-800">Pending payment</div>
                      <div className="text-gray-500 mt-0.5">Apr 10, 2026 at 12:33 PM</div>
                    </div>
                    <div className="border-t border-gray-100 mt-4 px-4 pt-2 text-right">
                      <span className="text-[10px] text-blue-500 font-semibold">12:33 PM</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
