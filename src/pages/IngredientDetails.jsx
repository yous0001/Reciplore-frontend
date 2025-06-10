import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const IngredientDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [ingredient, setIngredient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchIngredient = async () => {
            setLoading(true);
            setError(null);
            console.log('Fetching ingredient for slug:', slug);

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ingredient/get`, {
                    params: { slug },
                });
                console.log('API Response:', response.data);
                setIngredient(response.data.ingredient);
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch ingredient details: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIngredient();
    }, [slug]);

    const handleAddToCart = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('Please log in to add to cart.');
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/cart/add`,
                {
                    ingredientId: ingredient._id,
                    quantity,
                },
                {
                    headers: { accessToken: `accessToken_${accessToken}` },
                }
            );
            toast.success('Ingredient added to cart successfully!', {
                position: 'top-right',
                autoClose: 3000,
            });
        } catch (err) {
            console.log('Cart Error:', err.response?.status, err.response?.data);
            setError('Failed to add to cart: ' + err.message);
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error || !ingredient) return <div className="text-center text-red-500 py-10">{error || 'Ingredient not found'}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    ← Back
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Image and Rating */}
                    <div className="bg-white/90 rounded-xl shadow-2xl overflow-hidden relative backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 to-transparent"></div>
                        <img
                            src={ingredient.image.secure_url}
                            alt={ingredient.name}
                            className="w-full h-96 object-cover relative z-10"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400'; }}
                        />
                        <div className="absolute top-6 left-6 bg-orange-500 text-white text-xl font-extrabold px-5 py-2 rounded-full shadow-lg z-20 animate-pulse-once">
                            {Math.round(ingredient.Average_rating)} ⭐
                        </div>
                        <div className="p-8 relative z-10">
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow-md">{ingredient.name}</h1>
                        </div>
                    </div>

                    {/* Details and Add to Cart */}
                    <div className="bg-white/90 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Details</h2>
                        <div className="space-y-6">
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Description:</span> {ingredient.description}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Base Price:</span> ${ingredient.basePrice.toFixed(2)}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Applied Price:</span> ${ingredient.appliedPrice.toFixed(2)}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Stock:</span> {ingredient.stock}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Created By:</span> {ingredient.createdBy.username}</p>
                            <p className="text-gray-700 text-lg"><span className="font-semibold text-orange-600">Created At:</span> {new Date(ingredient.createdAt).toLocaleDateString()}</p>
                            <div className="mt-6">
                                <label className="block text-gray-700 text-lg mb-2">Quantity:</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                                    className="w-24 px-3 py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                                />
                                <button
                                    onClick={handleAddToCart}
                                    className="ml-4 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngredientDetails;