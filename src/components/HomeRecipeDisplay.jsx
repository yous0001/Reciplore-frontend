import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Adjust path
import RecipeCard from './RecipeCard';
import Cookies from 'js-cookie';

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

            const accessToken = Cookies.get('accessToken');
            const headers = (accessToken) ? { accessToken: `accessToken_${accessToken}` } : {}
            try {
                const [latestRes, popularRes, ratedRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, {
                        headers: headers,
                        params: { sort: '-createdAt', limit: 8 },
                    }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, {
                        headers: headers,
                        params: { sort: '-views', limit: 8 },
                    }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, {
                        headers: headers,
                        params: { sort: '-Average_rating', limit: 8 },
                    }),
                ]);

                console.log('Latest Response:', latestRes.data.recipes.docs);
                console.log('Popular Response:', popularRes.data.recipes.docs);
                console.log('Rated Response:', ratedRes.data.recipes.docs);

                setLatestRecipes(latestRes.data.recipes.docs || []);
                setMostPopularRecipes(popularRes.data.recipes.docs || []);
                setTopRatedRecipes(ratedRes.data.recipes.docs || []);
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch recipes: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    const categories = [
        { title: 'Latest Recipes', recipes: latestRecipes },
        { title: 'Most Popular Recipes', recipes: mostPopularRecipes },
        { title: 'Top Rated Recipes', recipes: topRatedRecipes },
    ];

    const currentRecipes = categories.find(cat => cat.title === activeCategory)?.recipes || [];

    return (
        <div className="container mx-auto px-4 lg:px-2 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="flex justify-center space-x-6 mb-8">
                {categories.map((category) => (
                    <button
                        key={category.title}
                        onClick={() => setActiveCategory(category.title)}
                        className={`text-lg font-medium px-4 py-2 transition-colors duration-200 ${activeCategory === category.title
                            ? 'text-gray-900 border-b-2 border-orange-500'
                            : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                            }`}
                    >
                        {category.title}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentRecipes.length > 0 ? (
                    currentRecipes.map((recipe) => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No recipes to display
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeRecipeDisplay;