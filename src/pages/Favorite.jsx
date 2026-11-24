import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import slugify from 'slugify';
import { API_URL, getAuthHeaders } from '../store/authStore';

const Favorite = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggleLoading, setToggleLoading] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError(null);
            const authHeaders = getAuthHeaders();
            if (!authHeaders.accessToken) {
                setError('Please log in to view your favorites.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/auth/get-favourite`, {
                    headers: authHeaders,
                });
                const recipes = (response.data.recipes?.docs || []).map((recipe) => ({
                    ...recipe,
                    slug: recipe.slug || slugify(recipe.name, { replacement: '_', lower: true }),
                }));
                setFavorites(recipes);
            } catch (err) {
                console.error('API Error:', err.message);
                setError('Failed to fetch favorites: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handleToggleFavorite = async (recipeId, e) => {
        e.stopPropagation();
        setToggleLoading((prev) => ({ ...prev, [recipeId]: true }));
        setError(null);
        const authHeaders = getAuthHeaders();
        if (!authHeaders.accessToken) {
            setError('Please log in to favorite recipes.');
            setToggleLoading((prev) => ({ ...prev, [recipeId]: false }));
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/auth/toggle-favourite/${recipeId}`,
                {},
                { headers: authHeaders }
            );
            const isAdded = response.data.message?.includes('added');
            if (isAdded) {
                const favoritesResponse = await axios.get(`${API_URL}/auth/get-favourite`, {
                    headers: authHeaders,
                });
                const recipes = (favoritesResponse.data.recipes?.docs || []).map((recipe) => ({
                    ...recipe,
                    slug: recipe.slug || slugify(recipe.name, { replacement: '_', lower: true }),
                }));
                setFavorites(recipes);
            } else {
                setFavorites((prev) => prev.filter((recipe) => recipe._id !== recipeId));
            }
        } catch (err) {
            console.error('Toggle Error:', err.message);
            setError(err.response?.data?.message || 'Failed to toggle favorite');
        } finally {
            setToggleLoading((prev) => ({ ...prev, [recipeId]: false }));
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (favorites.length === 0) return <div className="text-center text-gray-600 py-10 text-xl">No favorite recipes</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    ← Back
                </button>
                <div className="bg-white/90 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Your Favorites</h1>
                    <div className="space-y-6">
                        {favorites.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-300"
                            >
                                <div
                                    className="flex items-center space-x-4 cursor-pointer flex-grow"
                                    onClick={() => navigate(`/recipe/${item.slug}`)}
                                >
                                    <img
                                        src={item.Images?.URLs?.[0]?.secure_url || 'https://via.placeholder.com/80x80'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-orange-200"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80'; }}
                                    />
                                    <div>
                                        <p className="text-lg font-semibold text-gray-700">{item.name}</p>
                                        <p className="text-sm text-gray-500">{(item.description || '').substring(0, 50)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={(e) => handleToggleFavorite(item._id, e)}
                                        disabled={toggleLoading[item._id]}
                                        className={`flex items-center px-3 py-1 bg-orange-500 text-white rounded-lg transition-all duration-300 ${
                                            toggleLoading[item._id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                                        }`}
                                    >
                                        {toggleLoading[item._id] ? (
                                            'Loading...'
                                        ) : (
                                            <>
                                                <FaHeart className="mr-2" /> Remove Favorite
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Favorite;