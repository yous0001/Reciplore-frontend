import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../store/authStore';

const FALLBACK_HALF_BANNER = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

export default function HalfBanner({ bannerName, header, paragraph, classnames = "" }) {
    const [banner, setBanner] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${API_URL}/banner/${bannerName}`, { timeout: 3000 });
                if (response.data.success || response.data.sucess) {
                    setBanner(response.data.banners);
                }
            } catch (err) {
                console.warn(`Banner ${bannerName} unavailable, using fallback:`, err.message);
            }
        };

        fetchBanner();
    }, [bannerName]);

    const backgroundImage = banner?.Images?.[0]?.secure_url || FALLBACK_HALF_BANNER;

    return (
        <div className={`flex-1 rounded-3xl overflow-hidden shadow-md relative min-h-[300px] flex items-center ${classnames}`}>
            <div
                className="w-full h-full min-h-[300px] bg-cover bg-center p-8 flex items-center rounded-3xl relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url(${backgroundImage})`,
                }}
            >
                <motion.div
                    className="w-full space-y-4 text-white z-10"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold leading-snug">
                        {header}
                    </h2>
                    <p className="text-sm text-gray-200 leading-relaxed max-w-md">
                        {paragraph}
                    </p>
                    <button
                        onClick={() => navigate('/recipes')}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow transition-all duration-200 hover:scale-105 cursor-pointer mt-2"
                    >
                        Explore Now
                    </button>
                </motion.div>
            </div>
        </div>
    );
}