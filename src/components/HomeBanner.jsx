import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RecipeSearchBar from '../components/RecipeSearchBar';
import { API_URL } from '../store/authStore';

const FALLBACK_BANNER_IMG = "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1920&q=80";

export default function HomeBanner() {
    const [banner, setBanner] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search-ai/${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${API_URL}/banner/web_home`, { timeout: 10000 });
                if (response.data.success || response.data.sucess) {
                    setBanner(response.data.banners);
                }
            } catch (err) {
                // Silently fallback to default aesthetic banner
                console.warn('Home banner unavailable, using fallback:', err.message);
            }
        };

        fetchBanner();
    }, []);

    const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_BANNER_IMG;

    return (
        <div
            className="min-h-[75vh] w-11/12 bg-cover bg-center bg-no-repeat mx-auto rounded-3xl my-6 flex items-center shadow-lg relative overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.65)), url(${backgroundImage})`,
            }}
        >
            <div className="container p-6 md:p-12 lg:px-16 xl:px-20 flex items-center w-full lg:w-3/5">
                <div className="flex flex-col justify-center items-start space-y-5">
                    <motion.span 
                        className="px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        Culinary Inspiration
                    </motion.span>

                    <motion.h1
                        className="text-4xl md:text-5xl leading-tight font-extrabold text-gray-900"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        What would you like to cook today?
                    </motion.h1>

                    <motion.p
                        className="text-base md:text-lg leading-relaxed text-gray-700 max-w-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Discover thousands of delicious recipes, search with AI by your available ingredients, or generate custom meal plans tailored to your mood and lifestyle.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-full max-w-lg pt-2"
                    >
                        <RecipeSearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onSearch={handleSearch}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}