import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80';

// ── Skeleton card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100">
    <div className="w-20 h-20 rounded-xl bg-stone-200" />
    <div className="w-16 h-3 bg-stone-200 rounded" />
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/category/`, { headers: getAuthHeaders(), timeout: 10000 })
      .then((res) => {
        const list = res.data?.categories || [];
        setCategories(list);
        setFiltered(list);
      })
      .catch((err) => console.warn('Categories fetch failed:', err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories
    );
  }, [search, categories]);

  // ── Full-page loading skeleton (hides all text until data arrives) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-16">
        {/* Header skeleton */}
        <div className="bg-white border-b border-stone-100 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
            <div className="w-20 h-5 bg-stone-200 rounded-full mb-4" />
            <div className="w-56 h-9 bg-stone-200 rounded-xl mb-3" />
            <div className="w-72 h-4 bg-stone-100 rounded" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="w-48 h-10 bg-stone-200 rounded-xl mb-10 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      {/* Page header — only shown when data is ready */}
      <div className="bg-white border-b border-stone-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block px-3.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Browse
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            All Categories
          </h1>
          <p className="mt-2 text-stone-500 text-base md:text-lg max-w-2xl">
            Pick a category to explore its recipes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search */}
        <div className="relative max-w-sm mb-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-stone-400 py-20 text-base">
            No categories found{search ? ` for "${search}"` : ''}.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => navigate(`/recipes?category=${cat._id}`)}
                className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={cat.image?.secure_url || FALLBACK_IMAGE}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 group-hover:text-orange-600 capitalize truncate w-full text-center transition-colors leading-tight">
                  {cat.name.replace(/_/g, ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
