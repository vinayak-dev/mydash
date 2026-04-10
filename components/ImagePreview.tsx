"use client";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs border border-gray-200">
        N/A
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt}
        className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200 hover:opacity-80 hover:scale-105 transition-transform shadow-sm"
        onClick={() => setOpen(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Full-size modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-600 shadow-md transition"
            >
              ✕
            </button>
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500 truncate">{alt}</p>
              <a
                href={src}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
