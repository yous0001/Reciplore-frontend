import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { API_URL } from '../store/authStore';

const FALLBACK_FULL_BANNER =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80';

export default function FullBanner() {
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`${API_URL}/banner/web_recipe_banner`, { timeout: 3000 });
        if (response.data.success || response.data.sucess) {
          setBanner(response.data.banners);
        }
      } catch (err) {
        console.warn('Full banner unavailable, using fallback:', err.message);
      }
    };
    fetchBanner();
  }, []);

  const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_FULL_BANNER;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div
        className="relative min-h-[380px] rounded-3xl overflow-hidden shadow-xl flex items-center justify-end bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/20 via-stone-950/70 to-stone-950/90" />

        <div className="relative z-10 w-full lg:w-1/2 p-8 sm:p-12 space-y-5 text-white">
          <span className="inline-block px-3.5 py-1 bg-white/15 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider rounded-full">
            Fresh Ingredients Delivered
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
            From recipe inspiration straight to your shopping cart.
          </h2>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
            Shop curated pantry staples, spices, and fresh produce directly from our culinary marketplace.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => navigate('/market')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              Visit Market
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/recipes')}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm rounded-xl border border-white/25 transition-all cursor-pointer"
            >
              Explore Recipes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
