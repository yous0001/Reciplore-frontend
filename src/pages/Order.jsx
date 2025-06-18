import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { CreditCard, HandCoins, Plus } from 'lucide-react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressError, setAddressError] = useState(null);
    const [addressForm, setAddressForm] = useState({
        country: '',
        city: '',
        postalCode: '',
        buildingNumber: '',
        floorNumber: '',
        streetName: '',
        addressLabel: '',
        notes: '',
    });

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

    const handleAddressFormChange = (e) => {
        const { name, value } = e.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddAddress = async () => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setAddressError('Please log in to add an address.');
            toast.error('Please log in to add an address.', { position: 'top-right', autoClose: 3000 });
            return;
        }

        const requiredFields = ['country', 'city', 'postalCode', 'buildingNumber', 'floorNumber', 'streetName'];
        for (const field of requiredFields) {
            if (!addressForm[field].trim()) {
                const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
                setAddressError(`Please fill in the ${fieldName}.`);
                toast.error(`Please fill in the ${fieldName}.`, { position: 'top-right', autoClose: 3000 });
                return;
            }
        }

        setOrderLoading(true);
        setAddressError(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/address/add`,
                {
                    country: addressForm.country,
                    city: addressForm.city,
                    postalCode: parseInt(addressForm.postalCode),
                    buildingNumber: addressForm.buildingNumber,
                    floorNumber: addressForm.floorNumber,
                    streetName: addressForm.streetName,
                    addressLabel: addressForm.addressLabel || undefined,
                    notes: addressForm.notes || undefined,
                },
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Add Address Response:', response.data);
            setOrderDetails((prev) => ({
                ...prev,
                addresses: [...prev.addresses, response.data.address],
            }));
            setSelectedAddressID(response.data.address._id);
            setIsModalOpen(false);
            setAddressForm({
                country: '',
                city: '',
                postalCode: '',
                buildingNumber: '',
                floorNumber: '',
                streetName: '',
                addressLabel: '',
                notes: '',
            });
            toast.success('Address added successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.log('Add Address Error:', err.response?.status, err.response?.data);
            setAddressError(err.response?.data?.message || 'Failed to add address: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to add address: ' + err.message, { position: 'top-right', autoClose: 3000 });
        } finally {
            setOrderLoading(false);
        }
    };

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
                                            {address.addressLabel || 'Address'} - {address.streetName}, {address.city}, {address.country} {address.isDefault && '(Default)'}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(true);
                                        setAddressError(null);
                                    }}
                                    className="mt-2 inline-flex items-center px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-100 transition-all duration-300 transform hover:scale-105"
                                >
                                    <Plus size={18} className="mr-2" /> Add New Address
                                </button>
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
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                                            paymentMethod === 'stripe'
                                                ? 'bg-orange-600 text-white shadow-md'
                                                : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                                        }`}
                                    >
                                        <CreditCard size={18} className="mr-2" /> Card
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                                            paymentMethod === 'cash'
                                                ? 'bg-orange-600 text-white shadow-md'
                                                : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                                        }`}
                                    >
                                        <HandCoins size={18} /> Cash
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

                {/* Add Address Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
                        onClick={() => {
                            setIsModalOpen(false);
                            setAddressForm({
                                country: '',
                                city: '',
                                postalCode: '',
                                buildingNumber: '',
                                floorNumber: '',
                                streetName: '',
                                addressLabel: '',
                                notes: '',
                            });
                            setAddressError(null);
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/90 rounded-2xl shadow-lg p-5 backdrop-blur-lg border border-orange-300/50 w-full max-w-sm max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add New Address</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., Egypt"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., Tahta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Postal Code *</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={addressForm.postalCode}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., 82621"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm">Building Number *</label>
                                    <input
                                        type="text"
                                        name="buildingNumber"
                                        value={addressForm.buildingNumber}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., A6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Floor Number *</label>
                                    <input
                                        type="text"
                                        name="floorNumber"
                                        value={addressForm.floorNumber}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., 7"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Street Name *</label>
                                    <input
                                        type="text"
                                        name="streetName"
                                        value={addressForm.streetName}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., Elsahel"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Address Label</label>
                                    <input
                                        type="text"
                                        name="addressLabel"
                                        value={addressForm.addressLabel}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., Home (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={addressForm.notes}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="e.g., This is my home address (optional)"
                                        rows={3}
                                    />
                                </div>
                                {addressError && (
                                    <p className="text-red-500 text-sm">{addressError}</p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setAddressForm({
                                                country: '',
                                                city: '',
                                                postalCode: '',
                                                buildingNumber: '',
                                                floorNumber: '',
                                                streetName: '',
                                                addressLabel: '',
                                                notes: '',
                                            });
                                            setAddressError(null);
                                        }}
                                        className="px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-100 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddAddress}
                                        disabled={orderLoading}
                                        className={`px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl transition-all duration-300 ${
                                            orderLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:-translate-y-1'
                                        }`}
                                    >
                                        {orderLoading ? 'Saving...' : 'Save Address'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Order;