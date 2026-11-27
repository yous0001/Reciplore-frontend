import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import slugify from 'slugify';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { API_URL, getAuthHeaders } from '../store/authStore';

const FALLBACK_RECIPE_IMG =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = useState(recipe.isFavourite || false);
  const [loading, setLoading] = useState(false);

  const rating = Number(recipe.Average_rating || 0).toFixed(1);
  const recipeSlug =
    recipe.slug ||
    slugify(recipe.name || 'recipe', {
      replacement: '_',
      lower: true,
    });

  const handleToggleFavourite = async (e) => {
    e.stopPropagation();
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      toast.error('Please log in to favorite recipes.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setLoading(true);
    const prev = isFavourite;
    setIsFavourite(!prev);

    try {
      const response = await axios.post(
        `${API_URL}/auth/toggle-favourite/${recipe._id}`,
        {},
        { headers: authHeaders }
      );
      const added = response.data?.message?.toLowerCase().includes('added');
      setIsFavourite(added);
      toast.success(response.data.message, { position: 'top-right', autoClose: 2500 });
    } catch (err) {
      setIsFavourite(prev);
      toast.error(err.response?.data?.message || 'Failed to update favorites', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      onClick={() => navigate(`/recipe/${recipeSlug}`)}
      className="group bg-white flex flex-col justify-between rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-pointer relative"
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={recipe.Images?.URLs?.[0]?.secure_url || FALLBACK_RECIPE_IMG}
          alt={recipe.name || 'Recipe'}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = FALLBACK_RECIPE_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          <FaStar className="text-amber-400 w-3.5 h-3.5" />
          <span>{rating}</span>
        </div>

        {/* Favourite Button */}
        <button
          type="button"
          aria-label={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleToggleFavourite}
          disabled={loading}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm transition-all cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:bg-white'
          }`}
        >
          {isFavourite ? (
            <FaHeart className="text-orange-500 w-4 h-4" />
          ) : (
            <FaRegHeart className="text-gray-600 group-hover:text-orange-500 w-4 h-4 transition-colors" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.name || 'Unnamed Recipe'}
          </h3>
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {recipe.description || 'Delicious curated recipe ready to explore.'}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/recipes?category=${recipe.category?._id || ''}`); }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 capitalize truncate max-w-[50%] hover:bg-orange-100 transition-colors cursor-pointer"
          >
            {recipe.category?.name?.replace(/_/g, ' ') || 'Recipe'}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/recipes?country=${recipe.country?._id || ''}`); }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 truncate max-w-[45%] hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {recipe.country?.name || 'Global'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;
