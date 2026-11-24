import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../store/authStore';

const FALLBACK_FULL_BANNER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80";

export default function FullBanner() {
    const [banner, setBanner] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${API_URL}/banner/web_recipe_banner`, { timeout: 10000 });
                if (response.data.success || response.data.sucess) {
                    setBanner(response.data.banners);
                }
            } catch (err) {
                console.warn('Full banner unavailable, using fallback:', err.message);
            }
        };

        fetchBanner();
    }, []);

    const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_FULL_BANNER;

    return (
        <div className="py-8">
            <div
                className="h-[60vh] min-h-[400px] w-11/12 bg-cover bg-center bg-no-repeat mx-auto rounded-3xl flex flex-col lg:flex-row items-center justify-end shadow-lg relative overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(0,0,0,0.6)), url(${backgroundImage})`,
                }}
            >
                <motion.div
                    className="w-full lg:w-1/2 p-6 md:p-12 flex items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col justify-center items-start space-y-4 text-white">
                        <span className="px-3 py-1 bg-orange-500/90 text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                            Explore Flavors
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                            Discover fresh, wholesome recipes every day
                        </h2>
                        <p className="text-sm md:text-base text-gray-200 max-w-md leading-relaxed">
                            From quick weeknight dinners to gourmet weekend projects, find step-by-step instructions and ingredient lists for any occasion.
                        </p>
                        <button
                            onClick={() => navigate('/recipes')}
                            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:bg-orange-600 transition-all duration-300 hover:scale-105 cursor-pointer mt-2"
                        >
                            Browse All Recipes
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}