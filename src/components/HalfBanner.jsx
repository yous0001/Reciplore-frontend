import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HalfBanner({ bannerName, header, paragraph ,classnames}) {
    const [banner, setBanner] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/banner/${bannerName}`);
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
    }, [bannerName]);

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

    const backgroundImage = banner?.Images?.[0]?.secure_url || 'https://via.placeholder.com/1200x300';

    return (
        <div className={"bg-gradient-to-br flex items-center justify-center py-5 "+classnames}>
            <div
                className="h-120 w-full bg-cover bg-center bg-no-repeat mx-auto rounded-2xl flex items-center justify-start"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                }}
            >
                <motion.div
                    className="w-full p-2 md:p-4 lg:p-8 m-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col justify-center items-start space-y-6 gap-y-6">
                        <motion.h2
                            className="text-2xl leading-tight font-bold"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {header}
                        </motion.h2>
                        <motion.p
                            className="text-sm leading-relaxed "
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {paragraph}
                        </motion.p>
                        <motion.button
                            onClick={() => navigate('/recipes')}
                            className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 hover:-translate-y-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            View Recipes
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}