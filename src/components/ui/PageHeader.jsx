import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Reusable page header with optional badge, subtitle, and back navigation.
 */
export default function PageHeader({
  badge,
  title,
  subtitle,
  showBack = false,
  actions,
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <div className={`mb-8 ${className}`}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {badge && (
            <span className="inline-block px-3.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
              {badge}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-gray-600 text-base md:text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
