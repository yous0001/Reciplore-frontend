import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecipeDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            setError(null);
            console.log('Fetching recipe for slug:', slug);

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/get`, {
                    params: { slug },
                });
                console.log('API Response:', response.data);
                setRecipe(response.data.recipe);
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch recipe details: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [slug]);

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error || !recipe) return <div className="text-center text-red-500 py-10">{error || 'Recipe not found'}</div>;

    const isFavourite = recipe.isFavourite || false; // Assume isFavourite exists; replace with actual logic if needed

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    ← Back
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Hero Image and Rating */}
                    <div className="lg:col-span-2 bg-white/90 rounded-xl shadow-2xl overflow-hidden relative backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 to-transparent"></div>
                        <img
                            src={recipe.Images.URLs[0].secure_url}
                            alt={recipe.name}
                            className="w-full h-96 object-cover relative z-10"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400'; }}
                        />
                        <div className="absolute top-6 left-6 bg-orange-500 text-white text-xl font-extrabold px-5 py-2 rounded-full shadow-lg z-20 animate-pulse-once">
                            {Math.round(recipe.Average_rating)} ⭐
                        </div>
                        <button
                            className="absolute top-6 right-6 text-5xl text-orange-500 transition-all duration-300 hover:text-orange-600 z-20"
                            onMouseEnter={(e) => (e.target.textContent = '♥')}
                            onMouseLeave={(e) => (e.target.textContent = isFavourite ? '♥' : '♡')}
                        >
                            {isFavourite ? '♥' : '♡'}
                        </button>
                        <div className="p-8 relative z-10">
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow-md">{recipe.name}</h1>
                            <p className="text-gray-700 text-xl leading-relaxed">{recipe.description}</p>
                        </div>
                    </div>

                    {/* Sidebar with Details */}
                    <div className="lg:col-span-1 bg-white/90 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Details</h2>
                        <div className="space-y-6">
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Category:</span> {recipe.category.name}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Country:</span> 
                                <span className="bg-orange-200 text-orange-800 text-base font-medium px-4 py-2 rounded-full ml-3 shadow-inner">
                                    {recipe.country.name}
                                </span>
                            </p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Views:</span> {recipe.views}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Created By:</span> {recipe.createdBy.username}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Created At:</span> {new Date(recipe.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Directions (Large Column) */}
                    <div className="lg:col-span-2 bg-white/90 rounded-xl shadow-2xl p-8 mt-10 lg:mt-0 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Directions</h2>
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{recipe.directions}</p>
                        {recipe.videoLink && (
                            <a href={recipe.videoLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300">
                                Watch Video Tutorial
                            </a>
                        )}
                    </div>

                    {/* Ingredients (Small Column, Vertical) */}
                    <div className="lg:col-span-1 bg-white/90 rounded-xl shadow-2xl p-8 mt-10 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Ingredients</h2>
                        <div className="space-y-6">
                            {recipe.ingredients.map((ing, index) => (
                                <div key={ing._id} className="flex items-center space-x-4 p-3 hover:bg-orange-50 rounded-lg transition-all duration-300">
                                    <img
                                        src={ing.ingredient.image.secure_url}
                                        alt={ing.ingredient.name}
                                        className="w-16 h-16 object-cover rounded-full border-2 border-orange-200"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64x64'; }}
                                    />
                                    <div>
                                        <p className="text-gray-700 text-lg">{ing.amount} {ing.ingredient.name}</p>
                                        <p className="text-gray-500 text-sm">(${ing.ingredient.appliedPrice.toFixed(2)})</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;