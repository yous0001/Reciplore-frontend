import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80';

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category/`, {
          headers: getAuthHeaders(),
          timeout: 5000,
        });
        setCategories(response.data.categories || []);
      } catch (err) {
        console.warn('Failed to fetch categories for slider:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="shrink-0 flex flex-col items-center gap-2.5 animate-pulse">
              <div className="w-24 h-24 rounded-2xl bg-stone-200" />
              <div className="w-16 h-3 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
            Browse by Category
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Jump straight into your favorite meal type
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll categories left"
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-600 shadow-xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll categories right"
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-600 shadow-xs transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
      >
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => navigate(`/recipes?category=${category._id}`)}
            className="group shrink-0 w-32 bg-white rounded-2xl p-3 border border-stone-200/70 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col items-center gap-2.5 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100">
              <img
                src={category.image?.secure_url || FALLBACK_IMAGE}
                alt={category.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-bold text-stone-800 group-hover:text-orange-600 capitalize truncate w-full text-center transition-colors">
              {category.name.replace(/_/g, ' ')}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySlider;
