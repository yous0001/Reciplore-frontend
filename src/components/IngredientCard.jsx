import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import slugify from 'slugify';
import { ShoppingCart, Check } from 'lucide-react';
import { FaStar } from 'react-icons/fa';
import { API_URL, getAuthHeaders } from '../store/authStore';

const FALLBACK_ING_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';

const IngredientCard = ({ ingredient }) => {
  const navigate = useNavigate();
  const [inCart, setInCart] = useState(ingredient.inCart || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const hasDiscount =
    ingredient.basePrice &&
    ingredient.appliedPrice &&
    ingredient.basePrice > ingredient.appliedPrice;

  const discountPercent = hasDiscount
    ? Math.round(((ingredient.basePrice - ingredient.appliedPrice) / ingredient.basePrice) * 100)
    : 0;

  const outOfStock = ingredient.stock === 0;

  const handleClick = () => {
    const slug =
      ingredient.slug ||
      slugify(ingredient.name || 'ingredient', { replacement: '_', lower: true });
    navigate(`/ingredient/${slug}`);
  };

  const handleToggleCart = async (e) => {
    e.stopPropagation();
    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      toast.error('Please log in to manage cart.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (outOfStock && !inCart) {
      toast.warning('This ingredient is currently out of stock.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setIsUpdating(true);
    try {
      if (inCart) {
        await axios.put(
          `${API_URL}/cart/remove/${ingredient._id}`,
          {},
          { headers: authHeaders }
        );
        toast.success('Removed from cart', { position: 'top-right', autoClose: 2500 });
      } else {
        await axios.post(
          `${API_URL}/cart/add`,
          { ingredientId: ingredient._id, quantity: 1 },
          { headers: authHeaders }
        );
        toast.success('Added to cart!', { position: 'top-right', autoClose: 2500 });
      }
      setInCart(!inCart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <img
          src={ingredient.image?.secure_url || FALLBACK_ING_IMG}
          alt={ingredient.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = FALLBACK_ING_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          <FaStar className="text-amber-400 w-3.5 h-3.5" />
          <span>{Number(ingredient.Average_rating || 0).toFixed(1)}</span>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {ingredient.name}
          </h3>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-orange-600">
                ${Number(ingredient.appliedPrice ?? ingredient.basePrice ?? 0).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm line-through text-gray-400">
                  ${Number(ingredient.basePrice).toFixed(2)}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                outOfStock
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : `${ingredient.stock ?? 0} left`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleCart}
          disabled={isUpdating || (outOfStock && !inCart)}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            inCart
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm hover:from-orange-600 hover:to-amber-600'
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-4 h-4" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default IngredientCard;
