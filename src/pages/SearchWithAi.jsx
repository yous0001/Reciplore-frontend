import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RecipeSearchBar from '../components/RecipeSearchBar'; // Adjust path if needed

export default function SearchWithAi() {
    const { query } = useParams();
    const [searchQuery, setSearchQuery] = useState(decodeURIComponent(query || ''));
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchRecipes = async (ingredients) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ai/serach-ai`, {
                ingredients,
            });
            console.log('Search API Response:', response.data); // Debug log
            if (response.data.message === 'Recipe suggestions retrieved successfully') {
                // Deduplicate recipes by originalTitle (or _id if available)
                const uniqueRecipes = response.data.enhancedRecipes.reduce((acc, recipe, index) => {
                    const key = recipe._id || recipe.originalTitle || `recipe-${index}`; // Fallback to index
                    if (!acc.some((r) => (r._id || r.originalTitle || `recipe-${index}`) === key)) {
                        acc.push(recipe);
                    } else {
                        console.log(`Duplicate recipe detected: ${recipe.recipeJson.title} with key ${key}`);
                    }
                    return acc;
                }, []);
                console.log('Unique Recipes:', uniqueRecipes); // Debug log
                setRecipes(uniqueRecipes);
            } else {
                setError(`Failed to load recipes: ${response.data.message || 'Invalid response'}`);
            }
        } catch (err) {
            setError(`Error fetching recipes: ${err.message}`);
            console.error('Axios Error:', err.response?.data, err.response?.status);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query) return; // Skip if no query
        const decodedQuery = decodeURIComponent(query);
        if (decodedQuery !== searchQuery) {
            setSearchQuery(decodedQuery);
        }
        let isCancelled = false;
        fetchRecipes(decodedQuery).then(() => {
            if (isCancelled) return;
        });
        return () => {
            isCancelled = true; // Cleanup to prevent state updates on unmounted component
        };
    }, [query]); // Only trigger on query change

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search-ai/${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleCardClick = (name) => {
        console.log('Navigating to:', name); // Debug log
        navigate(`/recommendation/${encodeURIComponent(name)}`);
    };

    if (loading) {
        return (
            <motion.div
                className="text-center text-black mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                Loading recipes...
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

    return (
        <div className="container mx-auto p-4 md:p-6 lg:px-16 xl:px-20 my-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md mx-auto mb-8"
            >
                <RecipeSearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                />
            </motion.div>

            {recipes.length === 0 ? (
                <motion.p
                    className="text-center text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    No recipes found. Try searching with different ingredients!
                </motion.p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, index) => (
                        <motion.div
                            key={recipe._id || recipe.originalTitle || `recipe-${index}`}
                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => handleCardClick(recipe.originalTitle)}
                        >
                            <img
                                src={recipe.image.imageUrl}
                                alt={recipe.recipeJson.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 truncate">
                                    {recipe.recipeJson.title}
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    {recipe.recipeJson.overview.cuisine} • {recipe.recipeJson.overview.totaltime}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}