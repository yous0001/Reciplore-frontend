import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function RecommendationDetails() {
    const { name } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recommendation/${name}`);
                console.log('Recommendation API Response:', response.data); // Debug log
                if (response.data.success || response.data.sucess || response.data.recommendation) {
                    setRecipe(response.data.recommendation);
                } else {
                    setError(`Failed to load recipe details: ${response.data.message || 'Invalid response'}`);
                }
            } catch (err) {
                setError(`Error fetching recipe: ${err.message}`);
                console.error('Axios Error:', err.response?.data, err.response?.status);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, [name]);

    if (loading) {
        return (
            <motion.div
                className="text-center text-gray-800 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                Loading recipe...
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="text-center text-red-600 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                Error: {error}
            </motion.div>
        );
    }

    const { recipeJson, image } = recipe;

    return (
        <div className="container mx-auto p-4 md:p-8 lg:px-20 xl:px-24 my-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Header with Back Button and Image */}
                <div className="relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                        aria-label="Back to search"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <img
                        src={image.imageUrl}
                        alt={recipeJson.title}
                        className="w-full h-80 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h1 className="text-4xl font-serif font-bold text-white drop-shadow-md">
                            {recipeJson.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    {/* Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-gray-700 text-lg"><strong>Cuisine:</strong> {recipeJson.overview.cuisine}</p>
                            <p className="text-gray-700 text-lg"><strong>Difficulty:</strong> {recipeJson.overview.difficulty}</p>
                            <p className="text-gray-700 text-lg"><strong>Servings:</strong> {recipeJson.overview.servings}</p>
                        </div>
                        <div>
                            <p className="text-gray-700 text-lg"><strong>Prep Time:</strong> {recipeJson.overview.preptime}</p>
                            <p className="text-gray-700 text-lg"><strong>Cook Time:</strong> {recipeJson.overview.cooktime}</p>
                            <p className="text-gray-700 text-lg"><strong>Total Time:</strong> {recipeJson.overview.totaltime}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">{recipeJson.description}</p>

                    {/* Ingredients */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Ingredients</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            {recipeJson.ingredients.map((ingredient, index) => (
                                <li key={index} className="text-gray-700 text-lg">
                                    {ingredient.quantity} {ingredient.name}
                                    {ingredient.notes && <span className="text-gray-500 text-sm"> ({ingredient.notes})</span>}
                                    {ingredient.substitute && <span className="text-gray-500 text-sm"> ({ingredient.substitute})</span>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Instructions</h2>
                        <ol className="list-decimal pl-6 space-y-3">
                            {recipeJson.instructions.map((step) => (
                                <li key={step.step} className="text-gray-700 text-lg">
                                    <strong className="text-gray-800">{step.action}:</strong> {step.description}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Tips and Variations */}
                    {recipeJson.tipsAndVariations && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Tips and Variations</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {recipeJson.tipsAndVariations.map((tip, index) => (
                                    <li key={index} className="text-gray-700 text-lg">{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Nutrition */}
                    {recipeJson.nutrition && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Nutritional Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <p className="text-gray-700 text-lg"><strong>Calories:</strong> {recipeJson.nutrition.calories}</p>
                                <p className="text-gray-700 text-lg"><strong>Protein:</strong> {recipeJson.nutrition.protein}</p>
                                <p className="text-gray-700 text-lg"><strong>Fat:</strong> {recipeJson.nutrition.fat}</p>
                                <p className="text-gray-700 text-lg"><strong>Carbohydrates:</strong> {recipeJson.nutrition.carbohydrates}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}