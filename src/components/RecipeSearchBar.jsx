import React from 'react';
import { Sparkles, Search } from 'lucide-react';

const RecipeSearchBar = ({ value, onChange, onSearch }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="flex items-center w-full max-w-xl bg-white rounded-2xl p-1.5 shadow-xl shadow-stone-900/10 border border-stone-200/80 focus-within:ring-2 focus-within:ring-orange-400 transition-all"
    >
      <div className="relative flex-1 flex items-center">
        <Sparkles className="ml-3.5 text-orange-500 w-5 h-5 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search by ingredients with AI (e.g. chicken, garlic, lemon)"
          className="w-full px-3 py-2.5 bg-transparent text-stone-800 placeholder-stone-400 text-sm md:text-base focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
};

export default RecipeSearchBar;
