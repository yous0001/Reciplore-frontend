import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { API_URL } from '../store/authStore';

const FALLBACK_HALF_BANNER =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

export default function HalfBanner({ bannerName, header, paragraph, to = '/recipes', ctaLabel = 'Explore Now' }) {
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`${API_URL}/banner/${bannerName}`, { timeout: 3000 });
        if (response.data.success || response.data.sucess) {
          setBanner(response.data.banners);
        }
      } catch (err) {
        console.warn(`Banner ${bannerName} unavailable, using fallback:`, err.message);
      }
    };
    fetchBanner();
  }, [bannerName]);

  const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_HALF_BANNER;

  return (
    <div
      className="flex-1 rounded-3xl overflow-hidden shadow-lg relative min-h-[300px] flex items-end bg-cover bg-center group"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/55 to-stone-900/20 group-hover:from-stone-950/95 transition-colors" />
      <div className="relative z-10 p-8 space-y-3 text-white">
        <h3 className="text-2xl font-display font-bold leading-snug">{header}</h3>
        <p className="text-stone-200 text-sm leading-relaxed line-clamp-3">{paragraph}</p>
        <button
          onClick={() => navigate(to)}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 hover:bg-orange-500 hover:text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
