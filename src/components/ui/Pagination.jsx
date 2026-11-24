import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination bar with ellipsis support.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const getItems = () => {
    const maxVisible = 5;
    const items = [];
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(1);
      if (start > 2) items.push('...');
    }
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    if (end < totalPages) {
      if (end < totalPages - 1) items.push('...');
      items.push(totalPages);
    }
    return items;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {getItems().map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`min-w-[2.5rem] h-10 px-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              item === page
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
