import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { ArrowLeft, Eye, User, Calendar, PlayCircle, ShoppingBag, ChevronRight, MessageSquare } from 'lucide-react';
import slugify from 'slugify';
import { API_URL, getAuthHeaders } from '../store/authStore';
import { ErrorState } from '../components/ui/StatusState';

const FALLBACK_RECIPE_IMG =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_ING_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';

const RecipeDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rate: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipeAndFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const recipeResponse = await axios.get(`${API_URL}/recipe/get`, {
        params: { slug },
        headers,
      });
      const fetchedRecipe = recipeResponse.data?.recipe;
      setRecipe(fetchedRecipe);

      if (fetchedRecipe?._id) {
        const [reviewsRes, favRes] = await Promise.all([
          axios.get(`${API_URL}/review/`, { params: { recipeId: fetchedRecipe._id }, headers }).catch(() => null),
          headers.accessToken
            ? axios.get(`${API_URL}/auth/get-favourite`, { headers }).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (reviewsRes?.data?.reviews) {
          setReviews(reviewsRes.data.reviews);
        }
        if (favRes?.data?.recipes?.docs) {
          setIsFavourite(favRes.data.recipes.docs.some((fav) => fav._id === fetchedRecipe._id));
        } else {
          setIsFavourite(fetchedRecipe.isFavourite || false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch recipe details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRecipeAndFavorites();
  }, [fetchRecipeAndFavorites]);

  const directionSteps = useMemo(() => {
    if (!recipe?.directions) return [];
    const raw = recipe.directions
      .split(/\r?\n+/)
      .map((line) => line.replace(/^\s*(step\s*\d+[:.]?|\d+[.)])\s*/i, '').trim())
      .filter(Boolean);
    return raw.length > 0 ? raw : [recipe.directions];
  }, [recipe?.directions]);

  const handleToggleFavourite = async () => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      toast.error('Please log in to save favorite recipes.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setToggleLoading(true);
    const prev = isFavourite;
    setIsFavourite(!prev);

    try {
      const response = await axios.post(
        `${API_URL}/auth/toggle-favourite/${recipe._id}`,
        {},
        { headers: authHeaders }
      );
      setIsFavourite(response.data.message?.toLowerCase().includes('added'));
      toast.success(response.data.message, { position: 'top-right', autoClose: 2500 });
    } catch (err) {
      setIsFavourite(prev);
      toast.error(err.response?.data?.message || 'Failed to update favorites', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      toast.error('Please log in to submit a review.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (newReview.rate < 1 || newReview.rate > 5) {
      toast.error('Please select a star rating between 1 and 5.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setReviewLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/review/add`,
        {
          rate: newReview.rate,
          comment: newReview.comment,
          recipeId: recipe._id,
        },
        { headers: authHeaders }
      );
      if (response.data?.review) {
        setReviews((prev) => [response.data.review, ...prev]);
      }
      setNewReview({ rate: 0, comment: '' });
      toast.success(response.data.message || 'Review submitted!', { position: 'top-right', autoClose: 2500 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-9 w-24 bg-stone-200 rounded-xl" />
          <div className="h-[420px] bg-stone-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-80 bg-stone-200 rounded-2xl" />
            <div className="h-80 bg-stone-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 px-4">
        <ErrorState message={error || 'Recipe not found'} onRetry={fetchRecipeAndFavorites} />
      </div>
    );
  }

  const heroImage = recipe.Images?.URLs?.[0]?.secure_url || FALLBACK_RECIPE_IMG;
  const avgRating = Number(recipe.Average_rating || 0).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Action */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl shadow-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </button>

        {/* Editorial Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-900/5 overflow-hidden">
          <div className="relative h-80 sm:h-[420px] w-full bg-stone-200">
            <img
              src={heroImage}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK_RECIPE_IMG;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent" />

            {/* Top Floating Actions */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-sm font-bold shadow-md">
                <FaStar className="text-amber-400 w-4 h-4" />
                <span>{avgRating}</span>
                <span className="text-stone-400 font-normal">({reviews.length})</span>
              </div>

              <button
                type="button"
                onClick={handleToggleFavourite}
                disabled={toggleLoading}
                aria-label={isFavourite ? 'Remove from favorites' : 'Save to favorites'}
                className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
              >
                {isFavourite ? (
                  <FaHeart className="text-orange-500 w-5 h-5" />
                ) : (
                  <FaRegHeart className="text-stone-700 w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Hero Title & Metadata */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider capitalize">
                  {recipe.category?.name?.replace(/_/g, ' ') || 'Recipe'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                  {recipe.country?.name || 'International'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight">
                {recipe.name}
              </h1>
            </div>
          </div>

          {/* Metadata Strip */}
          <div className="px-6 sm:px-10 py-5 bg-stone-50/70 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <strong className="text-stone-800">{recipe.createdBy?.username || 'Chef'}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-500" />
                <span>{(recipe.views || 0).toLocaleString()} views</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Recently'}</span>
              </span>
            </div>

            {recipe.videoLink && (
              <a
                href={recipe.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                Watch Video Tutorial
              </a>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Directions + Tags + Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Directions */}
            <section className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8">
              <h2 className="text-2xl font-display font-bold text-stone-900 mb-6">
                Preparation Steps
              </h2>
              <ol className="space-y-4">
                {directionSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-100"
                  >
                    <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-stone-700 text-base leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>

              {recipe.tags?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
                    Tags:
                  </span>
                  {recipe.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Reviews ({reviews.length})
                </h2>
              </div>

              {/* Add Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-800">Rate this recipe</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewReview((prev) => ({ ...prev, rate: star }))}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <FaStar
                          className={`w-5 h-5 ${
                            star <= (hoverRating || newReview.rate)
                              ? 'text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your cooking tips or how it turned out..."
                  className="w-full p-3.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {reviewLoading ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>

              {/* Review List */}
              {reviews.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-6">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl border border-stone-100 bg-stone-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center uppercase">
                            {(rev.userID?.username || 'U')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-900">
                              {rev.userID?.username || 'Community Member'}
                            </p>
                            {rev.createdAt && (
                              <p className="text-xs text-stone-400">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                          <FaStar className="w-3.5 h-3.5 text-amber-400" />
                          {rev.rate}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-sm text-stone-700 leading-relaxed pl-10">{rev.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Ingredients Shop Card */}
          <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-stone-900">
                Ingredients ({recipe.ingredients?.length || 0})
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                <ShoppingBag className="w-3.5 h-3.5" />
                Click to shop
              </span>
            </div>

            <div className="space-y-2.5">
              {(recipe.ingredients || []).map((ing, index) => {
                const ingObj = ing.ingredient || {};
                const ingName = ingObj.name || ing.name || 'Ingredient';
                const ingSlug =
                  ingObj.slug ||
                  slugify(ingName, { replacement: '_', lower: true }) ||
                  'unknown';
                const ingImg = ingObj.image?.secure_url || ing.image?.secure_url || FALLBACK_ING_IMG;

                return (
                  <button
                    key={ing._id || index}
                    type="button"
                    onClick={() => navigate(`/ingredient/${ingSlug}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl border border-stone-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all text-left group cursor-pointer"
                  >
                    <img
                      src={ingImg}
                      alt={ingName}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = FALLBACK_ING_IMG;
                      }}
                      className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate group-hover:text-orange-600 transition-colors">
                        {ingName}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{ing.amount || 'As needed'}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-500 shrink-0" />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
