import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import RecipeSearchBar from '../components/RecipeSearchBar';
import { API_URL } from '../store/authStore';

const FALLBACK_BANNER_IMG =
  'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1920&q=80';

const QUICK_PROMPTS = ['Chicken, Garlic', 'Pasta, Basil', 'Salmon, Lemon'];

export default function HomeBanner() {
  const [banner, setBanner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (customQuery) => {
    const q = (customQuery ?? searchQuery).trim();
    if (q) {
      navigate(`/search-ai/${encodeURIComponent(q)}`);
    }
  };

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`${API_URL}/banner/web_home`, { timeout: 3000 });
        if (response.data.success || response.data.sucess) {
          setBanner(response.data.banners);
        }
      } catch (err) {
        console.warn('Home banner unavailable, using fallback:', err.message);
      }
    };
    fetchBanner();
  }, []);

  const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_BANNER_IMG;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div
        className="relative min-h-[500px] lg:min-h-[560px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/10 flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Editorial dark-to-warm overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/70 to-stone-900/20" />

        <div className="relative z-10 w-full lg:w-3/5 p-8 sm:p-12 lg:p-16 space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 border border-orange-400/30 backdrop-blur-md text-orange-200 text-xs font-bold uppercase tracking-wider rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            AI-Powered Culinary Discovery
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] tracking-tight"
          >
            Cook extraordinary meals with what you have.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-stone-200 text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Enter the ingredients in your kitchen and let Reciplore suggest chef-worthy recipes, step-by-step instructions, and fresh market ingredients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="pt-2 space-y-3"
          >
            <RecipeSearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => handleSearch()}
            />

            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300">
              <span className="font-medium text-stone-400">Try:</span>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSearch(prompt)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-orange-500/80 border border-white/15 text-stone-100 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
