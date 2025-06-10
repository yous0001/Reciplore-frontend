import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantityUpdates, setQuantityUpdates] = useState({});

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            setError(null);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Please log in to view your cart.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
                    headers: { accessToken: `accessToken_${accessToken}` },
                });
                console.log('API Response:', response.data);
                setCart(response.data.cart);
            } catch (err) {
                console.log('API Error:', err.response?.status, err.response?.data);
                setError('Failed to fetch cart: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleRemoveIngredient = async (ingredientId) => {
        const accessToken = Cookies.get('accessToken');
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/cart/remove/${ingredientId}`,
                {},
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            setCart((prevCart) => ({
                ...prevCart,
                ingredients: prevCart.ingredients.filter((item) => item.IngredientID._id !== ingredientId),
                subTotal: prevCart.ingredients
                    .filter((item) => item.IngredientID._id !== ingredientId)
                    .reduce((sum, item) => sum + item.IngredientID.appliedPrice * item.quantity, 0),
            }));
        } catch (err) {
            console.log('Remove Error:', err.response?.status, err.response?.data);
            setError('Failed to remove ingredient: ' + err.message);
        }
    };

    const handleUpdateQuantity = async (ingredientId, newQuantity) => {
        const accessToken = Cookies.get('accessToken');
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/cart/update/${ingredientId}`,
                { quantity: newQuantity },
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Update Response:', response.data);
            setCart((prevCart) => {
                const updatedIngredients = prevCart.ingredients.map((item) =>
                    item.IngredientID._id === ingredientId
                        ? { ...item, quantity: newQuantity, price: item.IngredientID.appliedPrice * newQuantity }
                        : item
                );
                const newSubTotal = updatedIngredients.reduce(
                    (sum, item) => sum + item.IngredientID.appliedPrice * item.quantity,
                    0
                );
                console.log('New Subtotal Calculation:', newSubTotal);
                return {
                    ...prevCart,
                    ingredients: updatedIngredients,
                    subTotal: newSubTotal,
                };
            });
            setQuantityUpdates((prev) => ({ ...prev, [ingredientId]: newQuantity }));
        } catch (err) {
            console.log('Update Error:', err.response?.status, err.response?.data);
            setError('Failed to update quantity: ' + err.message);
        }
    };

    const handleClearCart = async () => {
        const accessToken = Cookies.get('accessToken');
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart/clear`, {
                headers: { accessToken: `accessToken_${accessToken}` },
            });
            setCart(null); // Set cart to null to trigger empty message
        } catch (err) {
            console.log('Clear Error:', err.response?.status, err.response?.data);
            setError('Failed to clear cart: ' + err.message);
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!cart) return <div className="text-center text-gray-600 py-10 text-xl">Cart is empty</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-16">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    ← Back
                </button>
                <div className="bg-white/90 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Your Cart</h1>
                    <div className="space-y-6">
                        {cart.ingredients.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={item.IngredientID.image.secure_url}
                                        alt={item.IngredientID.name}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-orange-200"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80'; }}
                                    />
                                    <div>
                                        <p className="text-lg font-semibold text-gray-700">{item.IngredientID.name}</p>
                                        <p className="text-sm text-gray-500">Price per unit: ${item.IngredientID.appliedPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="number"
                                        value={quantityUpdates[item.IngredientID._id] || item.quantity}
                                        onChange={(e) => handleUpdateQuantity(item.IngredientID._id, Math.max(1, e.target.value))}
                                        className="w-16 px-2 py-1 border-2 border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                        onClick={() => handleRemoveIngredient(item.IngredientID._id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">${(item.IngredientID.appliedPrice * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="mt-8 pt-4 border-t-2 border-orange-300 flex justify-between items-center">
                            <p className="text-2xl font-bold text-gray-900">Subtotal: ${cart.subTotal.toFixed(2)}</p>
                            <button
                                onClick={handleClearCart}
                                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;