import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RecipeSearchBar from '../components/RecipeSearchBar'; // Adjust path if needed

export default function HomeBanner() {
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
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/banner/web_home`);
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
        <div
            className="h-screen w-47/48 bg-cover bg-center bg-no-repeat mx-auto rounded-2xl my-5 flex items-center"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            }}
        >
            <div className="container p-4 pt-6 md:p-6 lg:px-16 xl:px-20 flex items-center w-3/5">
                <div className="flex flex-col justify-center items-start space-y-5">
                    <motion.h1
                        className="text-4xl leading-tight font-bold text-black"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        You don't know how to make the dish you have in mind?
                    </motion.h1>

                    <motion.p
                        className="text-base leading-relaxed text-black"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Feed your imagination and spark your creativity. From cravings to creations,
                        let your ideas flourish and uncover the perfect recipe waiting to be discovered.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="w-full max-w-md"
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