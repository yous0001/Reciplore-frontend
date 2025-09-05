import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const FALLBACK_IMAGE = 'https://via.placeholder.com/150?text=Category';

const CategorySlider = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = accessToken 
                ? { headers: { accessToken: `accessToken_${accessToken}` } } 
                : {};
            
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/category/`, config);
            console.log('Categories API Response:', response.data);
            const categoriesData = response.data.categories || [];
            setCategories(categoriesData);
        } catch (err) {
            console.error('Categories API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch categories: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/recipes?category=${category._id}`);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleImageError = (e, categoryName) => {
        console.error(`Image failed to load for category ${categoryName}:`, e.target.src);
        e.target.src = FALLBACK_IMAGE;
    };

    if (loading) return <div className="text-center text-gray-700 py-5">Loading categories...</div>;
    if (error) return <div className="text-center text-red-500 py-5">{error}</div>;
    if (categories.length === 0) return <div className="text-center text-gray-500 py-5">No categories available</div>;

    return (
        <div className="relative w-full overflow-hidden py-6 bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recipe Categories</h2>
            
            {/* Slider container */}
            <div className="relative w-full h-40 overflow-hidden">
                {/* Slider track with animation */}
                <div className="absolute top-0 left-0 flex space-x-6 animate-slide">
                    {/* Double the categories for seamless looping */}
                    {[...categories, ...categories].map((category, index) => (
                        <div
                            key={`${category._id}-${index}`}
                            className="flex-shrink-0 w-32 h-32 group relative flex flex-col items-center cursor-pointer transition-transform duration-300 transform hover:scale-105"
                            role="button"
                            tabIndex={0}
                            aria-label={`Select ${category.name} category`}
                            onClick={() => handleCategoryClick(category)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category)}
                        >
                            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-orange-100 to-orange-300">
                                <img
                                    src={category.image?.secure_url || FALLBACK_IMAGE}
                                    alt={category.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => handleImageError(e, category.name)}
                                />
                                <div className="absolute inset-0 bg-transparent bg-opacity-10 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-full"></div>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900 text-center line-clamp-2">
                                {category.name}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom CSS for the animation */}
            <style>{`
                @keyframes slide {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-slide {
                    animation: slide 30s linear infinite;
                }
                .animate-slide:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default CategorySlider;