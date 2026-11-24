import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeCard from './RecipeCard';
import { RecipeCardSkeleton } from './LoadingSpinner';
import { API_URL, getAuthHeaders } from '../store/authStore';

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

            const headers = getAuthHeaders();
            try {
                const [latestRes, popularRes, ratedRes] = await Promise.all([
                    axios.get(`${API_URL}/recipe/list`, {
                        headers,
                        params: { sort: '-createdAt', limit: 8 },
                        timeout: 5000,
                    }).catch(() => ({ data: { recipes: { docs: [] } } })),
                    axios.get(`${API_URL}/recipe/list`, {
                        headers,
                        params: { sort: '-views', limit: 8 },
                        timeout: 5000,
                    }).catch(() => ({ data: { recipes: { docs: [] } } })),
                    axios.get(`${API_URL}/recipe/list`, {
                        headers,
                        params: { sort: '-Average_rating', limit: 8 },
                        timeout: 5000,
                    }).catch(() => ({ data: { recipes: { docs: [] } } })),
                ]);

                setLatestRecipes(latestRes.data?.recipes?.docs || []);
                setMostPopularRecipes(popularRes.data?.recipes?.docs || []);
                setTopRatedRecipes(ratedRes.data?.recipes?.docs || []);
            } catch (err) {
                console.error('API Error in HomeRecipeDisplay:', err.message);
                setError('Unable to load recipes right now. Please check back shortly.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const categories = [
        { title: 'Latest Recipes', recipes: latestRecipes },
        { title: 'Most Popular Recipes', recipes: mostPopularRecipes },
        { title: 'Top Rated Recipes', recipes: topRatedRecipes },
    ];

    const currentRecipes = categories.find(cat => cat.title === activeCategory)?.recipes || [];

    return (
        <div className="container mx-auto px-4 py-8 bg-transparent">
            <div className="flex justify-center space-x-4 md:space-x-8 mb-8 border-b border-gray-200 pb-2">
                {categories.map((category) => (
                    <button
                        key={category.title}
                        onClick={() => setActiveCategory(category.title)}
                        className={`text-base md:text-lg font-semibold px-4 py-2.5 transition-all duration-200 cursor-pointer ${
                            activeCategory === category.title
                                ? 'text-orange-600 border-b-2 border-orange-500'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {category.title}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <p className="text-base">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentRecipes.length > 0 ? (
                        currentRecipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-16 bg-white rounded-2xl border border-gray-100">
                            <p className="text-lg font-medium text-gray-700">No recipes found</p>
                            <p className="text-sm text-gray-400 mt-1">Check back soon or explore other categories!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomeRecipeDisplay;
