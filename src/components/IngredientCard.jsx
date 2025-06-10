import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import slugify from 'slugify';

const IngredientCard = ({ ingredient }) => {
    const navigate = useNavigate();
    const [inCart, setInCart] = useState(ingredient.inCart || false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        const slug = ingredient.slug || slugify(ingredient.name, { replacement: '_', lower: true });
        navigate(`/ingredient/${slug}`);
    };

    const handleToggleCart = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            toast.error('Please log in to manage cart.', { position: 'top-right', autoClose: 3000 });
            return;
        }

        setIsAnimating(true);
        try {
            if (inCart) {
                // Remove from cart
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/cart/remove/${ingredient._id}`,
                    {},
                    { headers: { accessToken: `accessToken_${accessToken}` } }
                );
                toast.success('Ingredient removed from cart!', { position: 'top-right', autoClose: 3000 });
            } else {
                // Add to cart
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
                    { ingredientId: ingredient._id, quantity: 1 },
                    { headers: { accessToken: `accessToken_${accessToken}` } }
                );
                toast.success('Ingredient added to cart!', { position: 'top-right', autoClose: 3000 });
            }
            setInCart(!inCart);
        } catch (err) {
            console.error('Cart Error:', err.response?.status, err.response?.data);
            toast.error(`Failed to ${inCart ? 'remove from' : 'add to'} cart: ${err.message}`, {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setTimeout(() => setIsAnimating(false), 300); // Sync with animation duration
        }
    };

    return (
        <div
            className="bg-white/90 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden backdrop-blur-sm relative"
            onClick={handleClick}
        >
            <style>
                {`
                    @keyframes cartButtonClick {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .cart-button-animate {
                        animation: cartButtonClick 0.3s ease-in-out;
                    }
                `}
            </style>
            <div className="relative w-full h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-600/30 to-transparent"></div>
                {ingredient.image?.secure_url ? (
                    <img
                        src={ingredient.image.secure_url}
                        alt={ingredient.name}
                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200 relative z-10"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 relative z-10">
                        No Image
                    </div>
                )}
                <div className="absolute top-6 left-6 bg-orange-500 text-white text-xl font-extrabold px-4 py-2 rounded-full shadow-lg z-20 animate-pulse-once">
                    {Math.round(ingredient.Average_rating)} ⭐
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{ingredient.name}</h3>
                <p className="text-gray-700 text-lg">
                    <span className="font-semibold text-orange-600">Price:</span>
                    {ingredient.basePrice !== ingredient.appliedPrice ? (
                        <>
                            <span className="line-through text-gray-500">${ingredient.basePrice?.toFixed(2) || '0.00'}</span>
                            <span className="ml-2 text-gray-700">${ingredient.appliedPrice?.toFixed(2) || '0.00'}</span>
                        </>
                    ) : (
                        <span className="text-gray-700">${ingredient.appliedPrice?.toFixed(2) || '0.00'}</span>
                    )}
                </p>
                <p className="text-gray-700">Rating: {(ingredient.Average_rating || 0).toFixed(1)}/5</p>
                <p className="text-gray-700">Stock: {ingredient.stock || 0}</p>
                <p className="text-gray-700">Sellings: {ingredient.sellings || 0}</p>
                <p className="text-orange-500">Discount: {(ingredient.discount?.amount || 0)}%</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); handleToggleCart(); }}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 ${isAnimating ? 'cart-button-animate' : ''} ${inCart ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                disabled={isAnimating}
            >
                {isAnimating ? 'Processing...' : inCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
        </div>
    );
};

export default IngredientCard;