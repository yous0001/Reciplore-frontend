import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, User, Calendar, MessageSquare } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';
import { ErrorState } from '../components/ui/StatusState';

const FALLBACK_ING_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

const IngredientDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rate: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchIngredient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/ingredient/get`, {
        params: { slug },
        headers,
      });
      const fetched = response.data?.ingredient;
      setIngredient(fetched);

      if (fetched?._id) {
        const revRes = await axios
          .get(`${API_URL}/review/`, { params: { ingredientId: fetched._id }, headers })
          .catch(() => null);
        if (revRes?.data?.reviews) {
          setReviews(revRes.data.reviews);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch ingredient details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchIngredient();
  }, [fetchIngredient]);

  const handleAddToCart = async () => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      toast.error('Please log in to add to cart.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setAddingToCart(true);
    try {
      await axios.post(
        `${API_URL}/cart/add`,
        { ingredientId: ingredient._id, quantity },
        { headers: authHeaders }
      );
      toast.success('Added to cart!', { position: 'top-right', autoClose: 2500 });
      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setAddingToCart(false);
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
          ingredientId: ingredient._id,
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-9 w-28 bg-stone-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-stone-200 rounded-3xl" />
            <div className="h-96 bg-stone-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 px-4">
        <ErrorState message={error || 'Ingredient not found'} onRetry={fetchIngredient} />
      </div>
    );
  }

  const hasDiscount =
    ingredient.basePrice &&
    ingredient.appliedPrice &&
    ingredient.basePrice > ingredient.appliedPrice;

  const discountPercent = hasDiscount
    ? Math.round(((ingredient.basePrice - ingredient.appliedPrice) / ingredient.basePrice) * 100)
    : 0;

  const outOfStock = (ingredient.stock ?? 0) <= 0;
  const maxStock = ingredient.stock || 99;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl shadow-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Market
        </button>

        {/* Product Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Image Column */}
          <div className="relative h-80 lg:h-auto min-h-[360px] bg-stone-100">
            <img
              src={ingredient.image?.secure_url || FALLBACK_ING_IMG}
              alt={ingredient.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK_ING_IMG;
              }}
            />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold shadow-sm">
              <FaStar className="text-amber-400 w-3.5 h-3.5" />
              <span>{Number(ingredient.Average_rating || 0).toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({reviews.length})</span>
            </div>
            {hasDiscount && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                Save {discountPercent}%
              </div>
            )}
          </div>

          {/* Info & Cart Column */}
          <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    outOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  {outOfStock ? 'Out of stock' : `${ingredient.stock} in stock`}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 leading-tight">
                {ingredient.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-orange-600">
                  ${Number(ingredient.appliedPrice ?? ingredient.basePrice ?? 0).toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg line-through text-stone-400">
                    ${Number(ingredient.basePrice).toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {ingredient.description || 'Fresh culinary ingredient ready to elevate your recipes.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  Added by <strong className="text-stone-700">{ingredient.createdBy?.username || 'Reciplore'}</strong>
                </span>
                {ingredient.createdAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    {new Date(ingredient.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="inline-flex items-center justify-between border border-stone-200 rounded-xl bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Decrease quantity"
                  className="p-2.5 rounded-lg text-stone-700 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-stone-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock || outOfStock}
                  aria-label="Increase quantity"
                  className="p-2.5 rounded-lg text-stone-700 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || outOfStock}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            Customer Reviews ({reviews.length})
          </h2>

          <form
            onSubmit={handleReviewSubmit}
            className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-stone-800">Rate this ingredient</span>
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
                        star <= (hoverRating || newReview.rate) ? 'text-amber-400' : 'text-stone-300'
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
              placeholder="Share your thoughts on freshness, quality, or packaging..."
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

          {reviews.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">
              No reviews yet. Be the first to review this ingredient!
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
                          {rev.userID?.username || 'Customer'}
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
    </div>
  );
};

export default IngredientDetails;
