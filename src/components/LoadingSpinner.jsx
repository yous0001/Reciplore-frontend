import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-200 rounded-full animate-ping opacity-30"></div>
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3.5 bg-gray-100 rounded w-full"></div>
        <div className="h-3.5 bg-gray-100 rounded w-2/3"></div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div className="h-6 bg-orange-50 rounded-full w-20"></div>
          <div className="h-6 bg-gray-100 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function IngredientCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-2/3"></div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-orange-50 rounded w-20"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-2"></div>
      </div>
    </div>
  );
}
