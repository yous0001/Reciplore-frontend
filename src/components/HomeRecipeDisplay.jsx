import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { RecipeCardSkeleton } from './LoadingSpinner';
import SortTabs from './ui/SortTabs';
import { API_URL, getAuthHeaders } from '../store/authStore';

const HomeRecipeDisplay = () => {
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [mostPopularRecipes, setMostPopularRecipes] = useState([]);
  const [topRatedRecipes, setTopRatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Latest Recipes');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      try {
        const [latestRes, popularRes, ratedRes] = await Promise.all([
          axios.get(`${API_URL}/recipe/list`, {
            headers,
            params: { sort: '-createdAt', limit: 8 },
            timeout: 5000,
          }).catch(() => ({ data: { recipes: { docs: [] } } })),
          axios.get(`${API_URL}/recipe/list`, {
            headers,
            params: { sort: '-views', limit: 8 },
            timeout: 5000,
          }).catch(() => ({ data: { recipes: { docs: [] } } })),
          axios.get(`${API_URL}/recipe/list`, {
            headers,
            params: { sort: '-Average_rating', limit: 8 },
            timeout: 5000,
          }).catch(() => ({ data: { recipes: { docs: [] } } })),
        ]);

        setLatestRecipes(latestRes.data?.recipes?.docs || []);
        setMostPopularRecipes(popularRes.data?.recipes?.docs || []);
        setTopRatedRecipes(ratedRes.data?.recipes?.docs || []);
      } catch (err) {
        console.error('API Error in HomeRecipeDisplay:', err.message);
        setError('Unable to load recipes right now. Please check back shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const categories = [
    { title: 'Latest Recipes', recipes: latestRecipes },
    { title: 'Most Popular Recipes', recipes: mostPopularRecipes },
    { title: 'Top Rated Recipes', recipes: topRatedRecipes },
  ];

  const currentRecipes = categories.find((cat) => cat.title === activeCategory)?.recipes || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-stone-500 py-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <p className="text-base">{error}</p>
        </div>
      ) : currentRecipes.length === 0 ? (
        <div className="text-center text-stone-500 py-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <p className="text-base">No recipes available in this section yet.</p>
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
