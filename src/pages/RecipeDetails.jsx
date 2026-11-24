import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_URL, getAuthHeaders, useAuthStore } from '../store/authStore';

const RecipeDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isFavourite, setIsFavourite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rate: 0, comment: '' });
    const [loading, setLoading] = useState(true);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reviewError, setReviewError] = useState(null);

    useEffect(() => {
        const fetchRecipeAndFavorites = async () => {
            setLoading(true);
            setError(null);

            try {
                const headers = getAuthHeaders();
                // Fetch recipe details
                const recipeResponse = await axios.get(`${API_URL}/recipe/get`, {
                    params: { slug },
                    headers,
                });
                const fetchedRecipe = recipeResponse.data.recipe;
                setRecipe(fetchedRecipe);

                // Fetch reviews (viewable by anyone)
                if (fetchedRecipe?._id) {
                    try {
                        const reviewsResponse = await axios.get(`${API_URL}/review/`, {
                            params: { recipeId: fetchedRecipe._id },
                            headers,
                        });
                        setReviews(reviewsResponse.data.reviews || []);
                    } catch (revErr) {
                        console.warn('Could not load reviews:', revErr.message);
                    }
                }

                // Favorite status
                if (headers.accessToken && fetchedRecipe?._id) {
                    try {
                        const favoritesResponse = await axios.get(`${API_URL}/auth/get-favourite`, {
                            headers,
                        });
                        const favorites = favoritesResponse.data.recipes?.docs || [];
                        setIsFavourite(favorites.some((fav) => fav._id === fetchedRecipe._id));
                    } catch {
                        setIsFavourite(fetchedRecipe.isFavourite || false);
                    }
                } else {
                    setIsFavourite(fetchedRecipe?.isFavourite || false);
                }
            } catch (err) {
                console.error('API Error in RecipeDetails:', err.message);
                setError('Failed to fetch recipe details: ' + (err.response?.data?.message || err.message));
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

        const authHeaders = getAuthHeaders();
        if (!authHeaders.accessToken) {
            setError('Please log in to favorite recipes.');
            toast.error('Please log in to favorite recipes.', { position: 'top-right', autoClose: 3000 });
            setIsFavourite(previousFavouriteState);
            setToggleLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/auth/toggle-favourite/${recipe._id}`,
                {},
                { headers: authHeaders }
            );
            setIsFavourite(response.data.message?.includes('added'));
            toast.success(response.data.message, { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.error('Toggle Favourite Error:', err.message);
            setError('Failed to toggle favorite: ' + (err.response?.data?.message || err.message));
            toast.error('Failed to toggle favorite: ' + (err.response?.data?.message || err.message), { position: 'top-right', autoClose: 3000 });
            setIsFavourite(previousFavouriteState);
        } finally {
            setToggleLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError(null);
        setReviewLoading(true);

        const authHeaders = getAuthHeaders();
        if (!authHeaders.accessToken) {
            setReviewError('Please log in to submit a review.');
            toast.error('Please log in to submit a review.', { position: 'top-right', autoClose: 3000 });
            setReviewLoading(false);
            return;
        }

        if (newReview.rate < 1 || newReview.rate > 5) {
            setReviewError('Rating must be between 1 and 5.');
            toast.error('Rating must be between 1 and 5.', { position: 'top-right', autoClose: 3000 });
            setReviewLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/review/add`,
                {
                    rate: newReview.rate,
                    comment: newReview.comment,
                    recipeId: recipe._id,
                },
                { headers: authHeaders }
            );
            setReviews((prev) => [response.data.review, ...prev]);
            setNewReview({ rate: 0, comment: '' });
            toast.success(response.data.message || 'Review added!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.error('Review Submit Error:', err.message);
            setReviewError(err.response?.data?.message || 'Failed to submit review');
            toast.error(err.response?.data?.message || 'Failed to submit review', { position: 'top-right', autoClose: 3000 });
        } finally {
            setReviewLoading(false);
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

                    {/* Reviews Section */}
                    <div className="lg:col-span-3 bg-white/90 rounded-xl shadow-2xl p-8 mt-10 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Reviews</h2>
                        {reviews.length === 0 ? (
                            <p className="text-gray-600 text-lg">No reviews yet. Be the first to share your thoughts!</p>
                        ) : (
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                {reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg"
                                    >
                                        <img
                                            src={review.userID?.profileImage?.secure_url || 'https://via.placeholder.com/40x40'}
                                            alt={review.userID?.username || 'User'}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40'; }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-semibold text-gray-900">{review.userID?.username || 'Anonymous'}</p>
                                                <div className="flex items-center text-orange-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={i < Math.round(review.rate) ? 'text-orange-500' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-gray-600 text-sm">{review.rate.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-base mt-2">{review.comment}</p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* Review Form */}
                        <motion.div
                            className="mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Add Your Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Rating (1–5)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        value={newReview.rate || ''}
                                        onChange={(e) => setNewReview({ ...newReview, rate: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter rating"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Comment</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        rows="4"
                                        placeholder="Share your thoughts..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className={`px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${
                                        reviewLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:-translate-y-1'
                                    }`}
                                >
                                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                </button>
                                {reviewError && (
                                    <p className="text-red-500 text-sm mt-2">{reviewError}</p>
                                )}
                            </form>
                        </motion.div>
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