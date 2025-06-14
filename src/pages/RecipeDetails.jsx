import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import slugify from 'slugify';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const RecipeDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isFavourite, setIsFavourite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipeAndFavorites = async () => {
            setLoading(true);
            setError(null);
            console.log('Fetching recipe for slug:', slug);

            try {
                // Fetch recipe details
                const recipeResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/get`, {
                    params: { slug },
                });
                console.log('API Response - recipe.ingredients:', recipeResponse.data.recipe.ingredients);
                setRecipe(recipeResponse.data.recipe);

                // Fetch favorite recipes
                const accessToken = Cookies.get('accessToken');
                if (accessToken) {
                    const favoritesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/get-favourite`, {
                        headers: { accessToken: `accessToken_${accessToken}` },
                    });
                    console.log('Favorites API Response:', favoritesResponse.data);
                    const favorites = favoritesResponse.data.recipes?.docs || [];
                    setIsFavourite(favorites.some((fav) => fav._id === recipeResponse.data.recipe._id));
                } else {
                    setIsFavourite(recipeResponse.data.recipe.isFavourite || false);
                }
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch recipe or favorites: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeAndFavorites();
    }, [slug]);

    const handleToggleFavourite = async () => {
        setError(null);
        setToggleLoading(true);
        const previousFavouriteState = isFavourite;
        setIsFavourite(!isFavourite); // Optimistic update

        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('Please log in to favorite recipes.');
            toast.error('Please log in to favorite recipes.', { position: 'top-right', autoClose: 3000 });
            setIsFavourite(previousFavouriteState); // Revert optimistic update
            setToggleLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/toogle-favourite/${recipe._id}`,
                {},
                {
                    headers: { accessToken: `accessToken_${accessToken}` },
                }
            );
            console.log('Toggle Favourite Response:', response.data);
            setIsFavourite(response.data.message.includes('added'));
            toast.success(response.data.message, { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.error('Toggle Favourite Error:', err.response?.status, err.response?.data);
            setError('Failed to toggle favorite: ' + err.message);
            toast.error('Failed to toggle favorite: ' + err.message, { position: 'top-right', autoClose: 3000 });
            setIsFavourite(previousFavouriteState); // Revert optimistic update
        } finally {
            setToggleLoading(false);
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error || !recipe) return <div className="text-center text-red-500 py-10">{error || 'Recipe not found'}</div>;

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
                            onClick={handleToggleFavourite}
                            disabled={toggleLoading}
                            className={`absolute top-6 right-6 text-3xl text-orange-500 transition-all duration-300 z-20 ${
                                toggleLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-orange-600'
                            }`}
                        >
                            {isFavourite ? <FaHeart /> : <FaRegHeart />}
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
                                <div
                                    key={ing._id}
                                    className="flex items-center space-x-4 p-3 hover:bg-orange-50 rounded-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        console.log('Clicked ingredient:', ing.ingredient);
                                        navigate(`/ingredient/${ing.ingredient?.slug || slugify(ing.ingredient?.name, {
                                            replacement: "_",
                                            lower: true,
                                        }) || 'unknown'}`);
                                    }}
                                >
                                    <img
                                        src={ing.ingredient?.image?.secure_url || ing.image?.secure_url || 'https://via.placeholder.com/64x64'}
                                        alt={ing.ingredient?.name || ing.name || 'Unknown Ingredient'}
                                        className="w-16 h-16 object-cover rounded-full border-2 border-orange-200"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64x64'; }}
                                    />
                                    <div>
                                        <p className="text-gray-700 text-lg">{ing.amount} {ing.ingredient?.name || ing.name || 'Unknown'}</p>
                                        <p className="text-gray-500 text-sm">(${ing.ingredient?.appliedPrice?.toFixed(2) || '0.00'})</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="text-center text-red-500 py-4">{error}</div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetails;