import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RecipeSearchBar from '../components/RecipeSearchBar'; // Adjust path if needed

export default function FullBanner() {
    const [banner, setBanner] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search-ai/${encodeURIComponent(searchQuery)}`);
        }
    };

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/banner/web_recipe_banner`);
                console.log('Banner API Response:', response.data);
                if (response.data.success || response.data.sucess) {
                    setBanner(response.data.banners);
                } else {
                    setError(`Failed to load banner data: ${response.data.message || 'Invalid response'}`);
                }
            } catch (err) {
                setError(`Error fetching banner: ${err.message}`);
                console.error('Axios Error:', err.response?.data, err.response?.status);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    if (loading) {
        return (
            <motion.div
                className="text-center text-black mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                Loading...
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="text-center text-red-500 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                Error: {error}
            </motion.div>
        );
    }

    const backgroundImage = banner?.Images?.[0]?.secure_url || 'https://via.placeholder.com/1200x600';

    return (
        <div className="min-h-screen flex items-center justify-center py-5">
            <div
                className="h-[90vh] w-11/12 bg-cover bg-center bg-no-repeat mx-auto rounded-2xl flex flex-col lg:flex-row items-center justify-end"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                }}
            >
                {/* Right Section */}
                <motion.div
                    className="w-full lg:w-1/2 p-4 md:p-6 lg:px-16 xl:px-20 flex items-center rounded-xl m-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex flex-col justify-center items-start space-y-5">
                        <motion.h2
                            className="text-4xl leading-tight font-bold text-black"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            Discover fresh and easy recipes to inspire your meals every day.
                        </motion.h2>
                        <motion.p
                            className="text-base leading-relaxed text-black"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            Discover fresh and easy recipes for every meal. From quick breakfasts and light lunches to hearty dinners and indulgent desserts, find endless inspiration to make cooking simple, fun, and enjoyable for any occasion or gathering!
                        </motion.p>
                        <motion.button
                            onClick={() => navigate('/recipes')}
                            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 hover:-translate-y-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                        >
                            View Recipes
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}