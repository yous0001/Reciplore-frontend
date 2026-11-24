import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2 } from 'lucide-react';
import slugify from 'slugify';
import { toast } from 'react-toastify';
import { API_URL, getAuthHeaders } from '../store/authStore';
import PageHeader from '../components/ui/PageHeader';
import { ErrorState, EmptyState } from '../components/ui/StatusState';
import { RecipeCardSkeleton } from '../components/LoadingSpinner';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=300&q=80';

const Favorite = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      setError('Please log in to view your favorite recipes.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/get-favourite`, {
        headers: authHeaders,
      });
      const recipes = (response.data.recipes?.docs || []).map((recipe) => ({
        ...recipe,
        slug: recipe.slug || slugify(recipe.name || 'recipe', { replacement: '_', lower: true }),
      }));
      setFavorites(recipes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (recipeId, e) => {
    e.stopPropagation();
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) return;

    setToggleLoading((prev) => ({ ...prev, [recipeId]: true }));
    try {
      await axios.post(
        `${API_URL}/auth/toggle-favourite/${recipeId}`,
        {},
        { headers: authHeaders }
      );
      setFavorites((prev) => prev.filter((recipe) => recipe._id !== recipeId));
      toast.success('Removed from favorites', { position: 'top-right', autoClose: 2500 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove favorite', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setToggleLoading((prev) => ({ ...prev, [recipeId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          badge="Saved Collection"
          title="Your Favorite Recipes"
          subtitle="Quickly revisit the dishes you loved and saved for later."
          showBack
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFavorites} />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorite recipes yet"
            description="Tap the heart icon on any recipe to save it to your collection."
            actionLabel="Browse Recipes"
            onAction={() => navigate('/recipes')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {favorites.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/recipe/${item.slug}`)}
                className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-orange-200 transition-all p-4 flex items-center gap-4 cursor-pointer"
              >
                <img
                  src={item.Images?.URLs?.[0]?.secure_url || FALLBACK_IMG}
                  alt={item.name}
                  loading="lazy"
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {item.description || 'Tap to view full recipe instructions.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveFavorite(item._id, e)}
                  disabled={toggleLoading[item._id]}
                  aria-label="Remove from favorites"
                  className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorite;
