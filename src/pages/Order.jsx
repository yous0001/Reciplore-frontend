import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { CreditCard, HandCoins } from 'lucide-react';

const Order = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { cart, couponCode, couponDetails } = state || {};
    const [orderDetails, setOrderDetails] = useState(null);
    const [selectedAddressID, setSelectedAddressID] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Please log in to check your order.');
                setLoading(false);
                toast.error('Please log in to check your order.', { position: 'top-right', autoClose: 3000 });
                return;
            }
            if (!cart) {
                setError('No cart data available.');
                setLoading(false);
                toast.error('No cart data available.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/order/cart-overview`,
                    { couponCode: couponCode || null },
                    { headers: { accessToken: `accessToken_${accessToken}` } }
                );
                console.log('Check Order Response:', response.data);
                setOrderDetails(response.data);
                setSelectedAddressID(response.data.addresses.find((addr) => addr.isDefault)?._id || '');
            } catch (err) {
                console.log('Check Order Error:', err.response?.status, err.response?.data);
                setError(err.response?.data?.message || 'Failed to check order: ' + err.message);
                toast.error(err.response?.data?.message || 'Failed to check order: ' + err.message, { position: 'top-right', autoClose: 3000 });
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [cart, couponCode]);

    const handleCreateOrder = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('Please log in to create an order.');
            toast.error('Please log in to create an order.', { position: 'top-right', autoClose: 3000 });
            return;
        }
        if (!selectedAddressID) {
            setError('Please select a shipping address.');
            toast.error('Please select a shipping address.', { position: 'top-right', autoClose: 3000 });
            return;
        }
        if (!contactNumber.trim()) {
            setError('Please enter a contact number.');
            toast.error('Please enter a contact number.', { position: 'top-right', autoClose: 3000 });
            return;
        }

        setOrderLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/order/cart`,
                {
                    shippingAddressID: selectedAddressID,
                    contactNumber,
                    paymentMethod,
                    couponCode: couponCode || null,
                },
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Create Order Response:', response.data);
            // Clear cart
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cart/clear`, {
                headers: { accessToken: `accessToken_${accessToken}` },
            });
            toast.success('Order created successfully!', { position: 'top-right', autoClose: 3000 });
            navigate('/orders');
        } catch (err) {
            console.log('Create Order Error:', err.response?.status, err.response?.data);
            setError(err.response?.data?.message || 'Failed to create order: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to create order: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!orderDetails) return <div className="text-center text-gray-600 py-10 text-xl">No order details available</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <button
                        onClick={() => navigate('/cart')}
                        className="mb-8 inline-flex items-center px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        ← Back to Cart
                    </button>
                    <div className="bg-white/90 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-300 pb-3">Checkout</h1>
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                                <p className="text-gray-700">Subtotal: ${orderDetails.subTotal.toFixed(2)}</p>
                                {orderDetails.coupondiscount > 0 && (
                                    <p className="text-gray-700">Coupon Discount: -${orderDetails.coupondiscount.toFixed(2)}</p>
                                )}
                                <p className="text-gray-700">VAT: ${orderDetails.vatAmount.toFixed(2)}</p>
                                <p className="text-gray-700">Shipping Fee: ${orderDetails.shippingFee.toFixed(2)}</p>
                                <p className="text-lg font-bold text-gray-900">Total: ${orderDetails.total.toFixed(2)}</p>
                            </div>

                            {/* Address Selection */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">Shipping Address</label>
                                <select
                                    value={selectedAddressID}
                                    onChange={(e) => setSelectedAddressID(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select an address</option>
                                    {orderDetails.addresses.map((address) => (
                                        <option key={address._id} value={address._id}>
                                            {address.addressLabel} - {address.streetName}, {address.city}, {address.country} {address.isDefault && '(Default)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Payment Method</label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setPaymentMethod('stripe')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex justify-center align-center ${
                                            paymentMethod === 'stripe'
                                                ? 'bg-orange-600 text-white shadow-md'
                                                : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                                        }`}
                                    >
                                        <CreditCard/>  Card 
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex justify-center align-center ${
                                            paymentMethod === 'cash'
                                                ? 'bg-orange-600 text-white shadow-md'
                                                : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                                        }`}
                                    >
                                        <HandCoins/>  Cash 
                                    </button>
                                </div>
                            </div>

                            {/* Make Order */}
                            <button
                                onClick={handleCreateOrder}
                                disabled={orderLoading}
                                className={`w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${
                                    orderLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:-translate-y-1'
                                }`}
                            >
                                {orderLoading ? 'Creating Order...' : 'Make Order'}
                            </button>
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Order;