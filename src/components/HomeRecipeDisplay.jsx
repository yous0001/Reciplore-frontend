import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { RecipeCardSkeleton } from './LoadingSpinner';
import SortTabs from './ui/SortTabs';
import { API_URL, getAuthHeaders } from '../store/authStore';

/** Fetch one recipe list with retry on 5xx / timeout */
async function fetchRecipeList(params, headers, attempt = 0) {
  try {
    const res = await axios.get(`${API_URL}/recipe/list`, {
      headers,
      params,
      timeout: 12000,          // 12 s — covers Vercel cold-start
    });
    return res.data?.recipes?.docs || [];
  } catch (err) {
    const status = err.response?.status;
    // Retry once on 5xx or timeout (up to 2 attempts total)
    if (attempt < 1 && (!status || status >= 500)) {
      await new Promise((r) => setTimeout(r, 1200));
      return fetchRecipeList(params, headers, attempt + 1);
    }
    console.warn('HomeRecipeDisplay fetch failed:', params.sort, err.message);
    return [];           // Return empty on permanent failure
  }
}

const HomeRecipeDisplay = () => {
  const [latestRecipes, setLatestRecipes]           = useState([]);
  const [mostPopularRecipes, setMostPopularRecipes] = useState([]);
  const [topRatedRecipes, setTopRatedRecipes]       = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState(null);
  const [activeCategory, setActiveCategory]         = useState('Latest Recipes');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const headers = getAuthHeaders();
    const baseParams = { limit: 8 };

    const [latest, popular, rated] = await Promise.all([
      fetchRecipeList({ ...baseParams, sort: '-createdAt' }, headers),
      fetchRecipeList({ ...baseParams, sort: '-views'      }, headers),
      fetchRecipeList({ ...baseParams, sort: '-Average_rating' }, headers),
    ]);

    // If ALL three are empty something is genuinely wrong (backend down)
    if (!latest.length && !popular.length && !rated.length) {
      setError('Could not load recipes right now. The server may be waking up — please try again in a moment.');
    }

    setLatestRecipes(latest);
    setMostPopularRecipes(popular);
    setTopRatedRecipes(rated);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const categories = [
    { title: 'Latest Recipes',      recipes: latestRecipes },
    { title: 'Most Popular',        recipes: mostPopularRecipes },
    { title: 'Top Rated',           recipes: topRatedRecipes },
  ];

  const currentRecipes =
    categories.find((c) => c.title === activeCategory)?.recipes || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
            Curated Recipes
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Handpicked dishes trending across our community
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SortTabs
            options={categories.map((c) => c.title)}
            active={activeCategory}
            onChange={setActiveCategory}
          />
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 ml-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-stone-500 text-base mb-4">{error}</p>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      ) : currentRecipes.length === 0 ? (
        <div className="text-center text-stone-400 py-16 bg-white rounded-2xl border border-stone-100 shadow-xs">
          <p className="text-base">No recipes in this section yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeRecipeDisplay;
