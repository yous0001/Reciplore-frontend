import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-red-100 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load data</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing found',
  description = 'Try adjusting your filters or search query.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 rounded-2xl border border-gray-100 shadow-xs max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
