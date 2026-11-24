import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, getAuthHeaders } from '../store/authStore';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80';

const CategorySlider = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/category/`, {
                headers: getAuthHeaders(),
                timeout: 10000,
            });
            const categoriesData = response.data.categories || [];
            setCategories(categoriesData);
        } catch (err) {
            console.warn('Failed to fetch categories for slider:', err.message);
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

    const handleImageError = (e) => {
        e.target.src = FALLBACK_IMAGE;
    };

    if (loading) {
        return (
            <div className="w-11/12 mx-auto py-6">
                <div className="flex space-x-6 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 flex flex-col items-center space-y-2 animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                            <div className="w-16 h-3 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="relative w-11/12 mx-auto overflow-hidden py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Explore Popular Categories</h2>
            
            {/* Slider container */}
            <div className="relative w-full h-36 overflow-hidden">
                {/* Slider track with animation */}
                <div className="absolute top-0 left-0 flex space-x-6 animate-slide">
                    {[...categories, ...categories].map((category, index) => (
                        <div
                            key={`${category._id}-${index}`}
                            className="flex-shrink-0 w-28 h-32 group relative flex flex-col items-center cursor-pointer transition-transform duration-300 transform hover:scale-105"
                            role="button"
                            tabIndex={0}
                            aria-label={`Select ${category.name} category`}
                            onClick={() => handleCategoryClick(category)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category)}
                        >
                            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md bg-orange-100 border-2 border-orange-200">
                                <img
                                    src={category.image?.secure_url || FALLBACK_IMAGE}
                                    alt={category.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={handleImageError}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-semibold text-gray-800 text-center capitalize truncate w-full">
                                {category.name.replace(/_/g, " ")}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes slide {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-slide {
                    animation: slide 25s linear infinite;
                }
                .animate-slide:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default CategorySlider;