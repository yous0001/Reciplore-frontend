import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeSearchBar from '../components/RecipeSearchBar';

export default function HomeBanner() {
    const [banner, setBanner] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/banner/web_home`);
                console.log('API response:', response);
                if (response.data.sucess) {
                    setBanner(response.data.banners);
                } else {
                    setError('Failed to load banner data');
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
                setError('Error fetching banner: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBanner();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div
            className="h-screen w-full bg-cover bg-center bg-no-repeat mx-auto"
            style={{
                backgroundImage: `url(${banner.Images[0].secure_url})`,
            }}
        >
            <div className="container mx-auto p-4 pt-6 md:p-6 lg:px-16 xl:px-20">
                <div className="flex flex-col justify-start items-start">
                    <h1 className="text-3xl leading-tight font-bold text-dark">
                        You don't know how to make the dish you have in mind?
                    </h1>
                    <p className="text-lg leading-relaxed text-dark">
                        Feed your imagination and spark your creativity. From cravings to creations, let your ideas flourish and uncover the perfect recipe waiting to be discovered.
                    </p>
                    <div className="mt-4">
                        <RecipeSearchBar />
                    </div>
                </div>
            </div>
        </div>
    );
}
