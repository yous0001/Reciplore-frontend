import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Favorite = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError(null);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Please log in to view your favorites.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/get-favourite`, {
                    headers: { accessToken: `accessToken_${accessToken}` },
                });
                console.log('API Response:', response.data);
                setFavorites(response.data.favorites || []);
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch favorites: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handleToggleFavorite = async (recipeId) => {
        const accessToken = Cookies.get('accessToken');
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/get-favourite`,
                { recipeId },
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            setFavorites((prevFavorites) => {
                const isFavorited = prevFavorites.some((item) => item._id === recipeId);
                if (isFavorited) {
                    return prevFavorites.filter((item) => item._id !== recipeId);
                } else {
                    return [...prevFavorites, { _id: recipeId, name: 'Recipe Name', image: { secure_url: 'https://via.placeholder.com/80x80' } }];
                }
            });
        } catch (err) {
            console.log('Toggle Error:', err.response?.status, err.response?.data);
            setError('Failed to toggle favorite: ' + err.message);
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
                            <div key={item._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={item.image?.secure_url || 'https://via.placeholder.com/80x80'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-orange-200"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80'; }}
                                    />
                                    <div>
                                        <p className="text-lg font-semibold text-gray-700">{item.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleToggleFavorite(item._id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        Remove Favorite
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