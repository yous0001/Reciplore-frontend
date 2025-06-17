import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaHome, FaEye, FaCreditCard, FaTimesCircle } from 'react-icons/fa';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Please log in to view your orders.');
                setLoading(false);
                toast.error('Please log in to view your orders.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/order`, {
                    headers: { accessToken: `accessToken_${accessToken}` },
                });
                console.log('Orders API Response:', response.data);
                setOrders(response.data.orders || []);
            } catch (err) {
                console.log('Orders API Error:', err.response?.status, err.response?.data);
                setError(err.response?.data?.message || 'Failed to fetch orders: ' + err.message);
                toast.error(err.response?.data?.message || 'Failed to fetch orders: ' + err.message, { position: 'top-right', autoClose: 3000 });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handlePayOrder = async (orderId) => {
        const accessToken = Cookies.get('accessToken');
        setActionLoading((prev) => ({ ...prev, [orderId]: 'pay' }));
        setError(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/order/stripe/${orderId}`,
                {},
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Pay Order Response:', response.data);
            if (response.data.checkOutSession?.url) {
                window.location.href = response.data.checkOutSession.url;
            } else {
                throw new Error('No checkout URL provided');
            }
        } catch (err) {
            console.log('Pay Order Error:', err.response?.status, err.response?.data);
            setError(err.response?.data?.message || 'Failed to initiate payment: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to initiate payment: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setActionLoading((prev) => ({ ...prev, [orderId]: null }));
        }
    };

    const handleCancelOrder = async (orderId) => {
        const accessToken = Cookies.get('accessToken');
        setActionLoading((prev) => ({ ...prev, [orderId]: 'cancel' }));
        setError(null);

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/order/cancel/${orderId}`,
                {},
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Cancel Order Response:', response.data);
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o))
            );
            toast.success('Order cancelled successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.log('Cancel Order Error:', err.response?.status, err.response?.data);
            setError(err.response?.data?.message || 'Failed to cancel order: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to cancel order: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setActionLoading((prev) => ({ ...prev, [orderId]: null }));
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!orders.length) return <div className="text-center text-gray-600 py-10 text-xl">No orders found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <button
                        onClick={() => navigate('/')}
                        className="mb-6 inline-flex items-center px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-full hover:bg-orange-100 transition-all duration-300 transform hover:scale-105"
                    >
                        <FaHome className="mr-2 text-base" /> Back to Home
                    </button>
                    <div className="bg-white/95 rounded-2xl shadow-xl p-6 backdrop-blur-md border border-orange-200">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-300 pb-2">Your Orders</h1>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="p-4 bg-orange-50/80 rounded-lg border-l-4 border-orange-500 shadow-sm hover:bg-orange-100 transition-all duration-300 transform hover:scale-[1.01]"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-6)}</h2>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                order.orderStatus === 'pending'
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : order.orderStatus === 'delivered'
                                                    ? 'bg-green-200 text-green-800'
                                                    : 'bg-red-200 text-red-800'
                                            }`}
                                        >
                                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Ordered:</span> {new Date(order.orderedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Total:</span> ${order.total.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Payment:</span> {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 font-semibold">Items:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {order.items.map((item) => (
                                                <li key={item._id}>
                                                    {item.quantity} x {item.ingredientId.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => navigate(`/order/${order._id}`)}
                                            className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
                                        >
                                            <FaEye className="mr-2 text-base" /> View Details
                                        </button>
                                        {order.paymentMethod === 'stripe' && order.orderStatus === 'pending' && (
                                            <button
                                                onClick={() => handlePayOrder(order._id)}
                                                disabled={actionLoading[order._id] === 'pay'}
                                                className={`inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                                                    actionLoading[order._id] === 'pay' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                                                }`}
                                            >
                                                <FaCreditCard className="mr-2 text-base" /> Pay Now
                                            </button>
                                        )}
                                        {order.orderStatus === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={actionLoading[order._id] === 'cancel'}
                                                className={`inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                                                    actionLoading[order._id] === 'cancel' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                                                }`}
                                            >
                                                <FaTimesCircle className="mr-2 text-base" /> Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-4">{error}</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Orders;