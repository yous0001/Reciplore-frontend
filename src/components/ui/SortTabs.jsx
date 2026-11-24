import React from 'react';

/**
 * Reusable pill-style sort tab selector.
 */
export default function SortTabs({ options, active, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
