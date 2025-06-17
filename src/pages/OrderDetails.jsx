import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCreditCard, FaTimesCircle, FaMoneyBillWave, FaTag } from 'react-icons/fa';
import { BsStripe } from 'react-icons/bs';

const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
            when: 'beforeChildren',
            staggerChildren: 0.1,
        },
    },
};

const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Please log in to view order details.');
                setLoading(false);
                toast.error('Please log in to view order details.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/order/${orderId}`, {
                    headers: { accessToken: `accessToken_${accessToken}` },
                });
                console.log('Order Details API Response:', response.data);
                setOrder(response.data.order || null);
            } catch (err) {
                console.log('Order Details API Error:', err.response?.status, err.response?.data);
                setError(err.response?.data?.message || 'Failed to fetch order details: ' + err.message);
                toast.error(err.response?.data?.message || 'Failed to fetch order details: ' + err.message, { position: 'top-right', autoClose: 3000 });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handlePayOrder = async () => {
        const accessToken = Cookies.get('accessToken');
        setActionLoading('pay');
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
            setActionLoading(null);
        }
    };

    const handleCancelOrder = async () => {
        const accessToken = Cookies.get('accessToken');
        setActionLoading('cancel');
        setError(null);

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/order/cancel/${orderId}`,
                {},
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Cancel Order Response:', response.data);
            setOrder((prev) => ({ ...prev, orderStatus: 'cancelled' }));
            toast.success('Order cancelled successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.log('Cancel Order Error:', err.response?.status, err.response?.data);
            setError(err.response?.data?.message || 'Failed to cancel order: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to cancel order: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
    if (!order) return <div className="text-center text-gray-600 py-10 text-xl">Order not found</div>;

    const couponDiscount = order.couponId ? (order.subTotal + order.vat + order.shippingFee - order.total).toFixed(2) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-100 to-white overflow-hidden bg-orange-50/10">
            <div className="container mx-auto px-4 lg:px-6 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white/90 rounded-3xl shadow-lg p-8 backdrop-blur-lg border border-orange-300/50"
                >
                    <button
                        onClick={() => navigate('/orders')}
                        className="mb-6 inline-flex items-center px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-100 transition-all duration-300 transform hover:scale-110 shadow-md"
                    >
                        <FaArrowLeft className="mr-2 text-base" /> Back to Orders
                    </button>
                    <motion.div variants={childVariants} className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-black text-gray-900 border-b-4 border-orange-400 pb-2">
                            Order #{order._id.slice(-6)}
                        </h1>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                order.orderStatus === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800'
                                    : order.orderStatus === 'delivered'
                                    ? 'bg-gradient-to-r from-green-300 to-green-400 text-green-800'
                                    : 'bg-gradient-to-r from-red-300 to-red-400 text-red-800'
                            }`}
                        >
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                    </motion.div>
                    <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Ordered:</span> {new Date(order.orderedAt).toLocaleDateString()}
                            </p>
                            <p>
                                <span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                            </p>
                            <p>
                                <span className="font-medium">Shipping Address:</span> {order.shippingAddress || order.shippingAddressID}
                            </p>
                            <p>
                                <span className="font-medium">Contact Number:</span> {order.contactNumber}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Subtotal:</span> ${order.subTotal.toFixed(2)}
                            </p>
                            {couponDiscount && (
                                <p className="inline-flex items-center">
                                    <span className="font-medium">Coupon Discount:</span> -${couponDiscount}
                                    <span className="ml-2 inline-flex items-center px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                                        <FaTag className="mr-1 text-xs" /> Coupon Applied
                                    </span>
                                </p>
                            )}
                            <p>
                                <span className="font-medium">VAT:</span> ${order.vat.toFixed(2)}
                            </p>
                            <p>
                                <span className="font-medium">Shipping Fee:</span> ${order.shippingFee.toFixed(2)}
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                                <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                            </p>
                            <p className="inline-flex items-center">
                                <span className="font-medium">Payment:</span> {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                                <span
                                    className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        order.paymentMethod === 'stripe'
                                            ? 'bg-blue-200 text-blue-800'
                                            : 'bg-green-200 text-green-800'
                                    }`}
                                >
                                    {order.paymentMethod === 'stripe' ? (
                                        <BsStripe className="mr-1 text-xs" />
                                    ) : (
                                        <FaMoneyBillWave className="mr-1 text-xs" />
                                    )}
                                    {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                                </span>
                            </p>
                        </div>
                    </motion.div>
                    <motion.div variants={childVariants}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
                        <ul className="space-y-3">
                            {order.items.map((item) => (
                                <motion.li
                                    key={item._id}
                                    variants={childVariants}
                                    className="flex items-center p-3 bg-orange-50/50 rounded-lg hover:bg-orange-100 transition-all duration-300"
                                >
                                    <img
                                        src={item.ingredientId.image?.secure_url || '/placeholder.png'}
                                        alt={item.ingredientId.name}
                                        className="w-12 h-12 rounded-lg object-cover border border-orange-200 mr-4 transform hover:scale-110 transition-all duration-300"
                                        onError={(e) => (e.target.src = '/placeholder.png')}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">{item.quantity} x {item.ingredientId.name}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            ${item.price.toFixed(2)} each = ${(item.quantity * item.price).toFixed(2)}
                                        </p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div variants={childVariants} className="mt-6 flex flex-wrap gap-3">
                        {order.paymentMethod === 'stripe' && order.orderStatus === 'pending' && (
                            <button
                                onClick={handlePayOrder}
                                disabled={actionLoading === 'pay'}
                                className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-110 hover:from-orange-600 hover:to-orange-700 shadow-md ${
                                    actionLoading === 'pay' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <FaCreditCard className="mr-2 text-base" /> Pay Now
                            </button>
                        )}
                        {order.orderStatus === 'pending' && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={actionLoading === 'cancel'}
                                className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-110 hover:from-red-600 hover:to-red-700 shadow-md ${
                                    actionLoading === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <FaTimesCircle className="mr-2 text-base" /> Cancel Order
                            </button>
                        )}
                    </motion.div>
                    {error && (
                        <motion.p variants={childVariants} className="text-red-500 text-sm mt-4">
                            {error}
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default OrderDetails;