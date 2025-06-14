import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import slugify from 'slugify';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const RecipeCard = ({ recipe }) => {
    const navigate = useNavigate();
    const [isFavourite, setIsFavourite] = useState(recipe.isFavourite || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const rating = Math.round(recipe.Average_rating || 0);
    recipe.slug = recipe.slug || slugify(recipe.name, {
        replacement: "_",
        lower: true,
    });

    const handleToggleFavourite = async (e) => {
        e.stopPropagation(); // Prevent card click navigation
        setError(null);
        setLoading(true);

        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('Please log in to favorite recipes.');
            toast.error('Please log in to favorite recipes.', { position: 'top-right', autoClose: 3000 });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/toogle-favourite/${recipe._id}`,
                {},
                {
                    headers: { accessToken: `accessToken_${accessToken}` },
                }
            );
            console.log('Toggle Favourite Response:', response.data);
            setIsFavourite(response.data.message.includes('added'));
            toast.success(response.data.message, { position: 'top-right', autoClose: 3000 });
            setError(null);
        } catch (err) {
            console.error('Toggle Favourite Error:', err.response?.status, err.response?.data);
            setError('Failed to toggle favorite: ' + err.message);
            toast.error('Failed to toggle favorite: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="bg-white flex flex-col justify-between rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative w-full cursor-pointer"
            onClick={() => navigate(`/recipe/${recipe.slug}`)}
        >
            <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                {rating} ⭐
            </div>
            <img
                src={recipe.Images?.URLs?.[0]?.secure_url || 'https://via.placeholder.com/300x200'}
                alt={recipe.name || 'Recipe Image'}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }}
            />
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{recipe.name || 'Unnamed Recipe'}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{(recipe.description || '').substring(0, 50)}...</p>
            </div>
            <div className="p-5 flex justify-between items-end">
                <span className="text-orange-400 font-semibold">{recipe.category?.name || 'N/A'}</span>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                    {recipe.country?.name || 'N/A'}
                </span>
            </div>
            <button
                onClick={handleToggleFavourite}
                disabled={loading}
                className={`absolute top-2 right-2 text-2xl text-orange-500 transition-colors duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-orange-600'
                }`}
            >
                {isFavourite ? <FaHeart /> : <FaRegHeart />}
            </button>
            {error && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default RecipeCard;