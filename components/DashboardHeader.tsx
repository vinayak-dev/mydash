import React from 'react';

type DashboardHeaderProps = {
  title: string;
  search: string;
  onSearch: (val: string) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
};

export default function DashboardHeader({ title, search, onSearch, startDate, endDate, onDateChange }: DashboardHeaderProps) {
  const DateFilter = ({ label, isOrderDate }: { label: string, isOrderDate?: boolean }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-800">{label}:</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-500">
        <input 
          type="date" 
          value={isOrderDate ? startDate : undefined}
          onChange={(e) => isOrderDate && onDateChange && onDateChange(e.target.value, endDate || "")}
          className="w-24 text-xs bg-transparent border-none outline-none text-gray-500 cursor-pointer" 
        />
        <span className="text-gray-300 text-xs">→</span>
        <input 
          type="date" 
          value={isOrderDate ? endDate : undefined}
          onChange={(e) => isOrderDate && onDateChange && onDateChange(startDate || "", e.target.value)}
          className="w-24 text-xs bg-transparent border-none outline-none text-gray-500 cursor-pointer" 
        />
        <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="bg-white px-6 pb-4 pt-5 border-b border-gray-200 shadow-sm relative z-10 w-full mb-2">
      <div className="flex flex-col gap-4">
        {/* Top row: Title and Dates */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="text-xl font-bold text-gray-900 pb-1 mr-8">{title}</h1>
          
          <div className="flex items-center gap-6 flex-1 flex-wrap">
            <DateFilter label="Order Date" isOrderDate={true} />
            <DateFilter label="Preview Date" />
            <DateFilter label="Production Date" />
            <DateFilter label="Delivery Date" />
          </div>
        </div>

        {/* Bottom row: Search and Process Manager Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-4 flex-1 text-sm">
            <div className="relative">
              <select className="appearance-none border border-gray-200 rounded px-4 py-1.5 pr-8 bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Bulk Action</option>
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            
            <div className="relative max-w-sm flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search Orders..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-sm bg-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold text-xs">Process Manager:</span>
              <div className="relative">
                <select className="appearance-none border border-gray-200 rounded px-3 py-1.5 pr-8 bg-white focus:outline-none focus:border-indigo-400 text-gray-500 min-w-[160px]">
                  <option value="">Select process m...</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button className="bg-[#1b2031] hover:bg-[#2d3550] text-white px-5 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
