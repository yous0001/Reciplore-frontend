import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore'; // Adjust the path as needed
import { NavLink } from 'react-router-dom';
import { LogOut, Edit, Trash2, Upload, Plus } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user, isAuthenticated, logout, deleteUser, updateUser, uploadProfileImage, deleteProfileImage, isCheckingAuth } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({ name: '', age: '', phoneNumbers: [''] });
    const [imageFile, setImageFile] = useState(null);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
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
        useAuthStore.getState().restoreSession();
    }, []);

    useEffect(() => {
        if (user) {
            setUpdatedData({
                name: user.username || '',
                age: user.age || '',
                phoneNumbers: user.phoneNumbers?.[0] || '',
            });
        }
    }, [user]);

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
            useAuthStore.setState((state) => ({
                user: {
                    ...state.user,
                    addresses: [...(state.user.addresses || []), response.data.address],
                },
            }));
            setIsAddAddressModalOpen(false);
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
            toast.success('Address added successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.log('Add Address Error:', err.response?.status, err.response?.data);
            setAddressError(err.response?.data?.message || 'Failed to add address: ' + err.message);
            toast.error(err.response?.data?.message || 'Failed to add address: ' + err.message, { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            toast.error('Please log in to delete an address.', { position: 'top-right', autoClose: 3000 });
            return;
        }

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/address/${addressId}`,
                { headers: { accessToken: `accessToken_${accessToken}` } }
            );
            console.log('Delete Address Response:', response.data);
            useAuthStore.setState((state) => ({
                user: {
                    ...state.user,
                    addresses: state.user.addresses.filter((addr) => addr._id !== addressId),
                },
            }));
            toast.success('Address deleted successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (err) {
            console.log('Delete Address Error:', err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || 'Failed to delete address: ' + err.message, { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUser({
                name: updatedData.name,
                age: updatedData.age ? parseInt(updatedData.age) : null,
                phoneNumbers: updatedData.phoneNumbers ? [updatedData.phoneNumbers] : [],
            });
            setIsEditing(false);
            toast.success('Profile updated successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update profile: ' + error.message, { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            try {
                await uploadProfileImage(file);
                setImageFile(null);
                toast.success('Profile image uploaded successfully!', { position: 'top-right', autoClose: 3000 });
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload profile image: ' + error.message, { position: 'top-right', autoClose: 3000 });
            }
        }
    };

    const handleDeleteImage = async () => {
        if (window.confirm('Are you sure you want to delete your profile image?')) {
            try {
                await deleteProfileImage();
                toast.success('Profile image deleted successfully!', { position: 'top-right', autoClose: 3000 });
            } catch (error) {
                console.error('Delete image error:', error);
                toast.error('Failed to delete profile image: ' + error.message, { position: 'top-right', autoClose: 3000 });
            }
        }
    };

    const handleDeleteUser = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
            try {
                await deleteUser();
                toast.success('Account deleted successfully!', { position: 'top-right', autoClose: 3000 });
            } catch (error) {
                console.error('Delete user error:', error);
                toast.error('Failed to delete account: ' + error.message, { position: 'top-right', autoClose: 3000 });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully!', { position: 'top-right', autoClose: 3000 });
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout: ' + error.message, { position: 'top-right', autoClose: 3000 });
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <p className="text-gray-700 text-lg font-medium">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                        <h1 className="text-3xl font-bold">Profile</h1>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                <img
                                    src={user.profileImage || '/default-profile.png'}
                                    alt="Profile"
                                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg transition-transform hover:scale-105"
                                    onError={(e) => { e.target.src = '/default-profile.png'; }}
                                />
                                <label htmlFor="imageUpload" className="absolute bottom-2 right-2 bg-orange-500 p-2 rounded-full cursor-pointer hover:bg-orange-600">
                                    <Upload size={18} color="white" />
                                </label>
                                <input
                                    id="imageUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                {user.profileImage && (
                                    <button
                                        onClick={handleDeleteImage}
                                        className="absolute bottom-2 left-2 bg-red-500 p-2 rounded-full hover:bg-red-600"
                                    >
                                        <Trash2 size={18} color="white" />
                                    </button>
                                )}
                            </div>
                            <h2 className="text-2xl font-semibold mt-4 text-gray-800">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.name}
                                        onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    user.username
                                )}
                            </h2>
                            <p className="text-gray-600">{user.role}</p>
                        </div>
                        <div className="grid gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-medium text-gray-700">Personal Information</h3>
                                <div className="mt-2 space-y-2">
                                    {isEditing ? (
                                        <form onSubmit={handleUpdate} className="space-y-2">
                                            <div>
                                                <label className="font-medium text-gray-600">Age:</label>
                                                <input
                                                    type="number"
                                                    value={updatedData.age}
                                                    onChange={(e) => setUpdatedData({ ...updatedData, age: e.target.value })}
                                                    className="border rounded px-2 py-1 w-full mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="font-medium text-gray-600">Phone:</label>
                                                <input
                                                    type="text"
                                                    value={updatedData.phoneNumbers}
                                                    onChange={(e) => setUpdatedData({ ...updatedData, phoneNumbers: e.target.value })}
                                                    className="border rounded px-2 py-1 w-full mt-1"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="mt-2 ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <p><span className="font-medium text-gray-600">Email:</span> {user.email}</p>
                                            <p><span className="font-medium text-gray-600">User ID:</span> {user._id}</p>
                                            <p><span className="font-medium text-gray-600">Age:</span> {user.age || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-600">Phone:</span> {user.phoneNumbers?.[0] || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-600">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                                            <p><span className="font-medium text-gray-600">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}</p>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                <Edit size={18} className="mr-2" /> Edit Profile
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-700">Addresses</h3>
                                    <button
                                        onClick={() => {
                                            setIsAddAddressModalOpen(true);
                                            setAddressError(null);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                                    >
                                        <Plus size={18} className="mr-2" /> Add New Address
                                    </button>
                                </div>
                                <div className="mt-2 space-y-4">
                                    {user.addresses?.map((address) => (
                                        <div key={address._id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative">
                                            <p><span className="font-medium text-gray-600">Label:</span> {address.addressLabel || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-600">City:</span> {address.city}, {address.country}</p>
                                            <p><span className="font-medium text-gray-600">Postal Code:</span> {address.postalCode}</p>
                                            <p><span className="font-medium text-gray-600">Building/Floor:</span> {address.buildingNumber}, Floor {address.floorNumber}</p>
                                            <p><span className="font-medium text-gray-600">Street:</span> {address.streetName}</p>
                                            <p><span className="font-medium text-gray-600">Notes:</span> {address.notes || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-600">Default:</span> {address.isDefault ? 'Yes' : 'No'}</p>
                                            <p className="text-sm text-gray-500">
                                                Created: {new Date(address.createdAt).toLocaleDateString()} | Updated: {new Date(address.updatedAt).toLocaleDateString()}
                                            </p>
                                            <button
                                                onClick={() => handleDeleteAddress(address._id)}
                                                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full hover:bg-red-600"
                                            >
                                                <Trash2 size={18} color="white" />
                                            </button>
                                        </div>
                                    )) || <p className="text-gray-500">No addresses available.</p>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleDeleteUser}
                                className="mr-4 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Delete Account
                            </button>
                            <NavLink
                                to="/"
                                onClick={handleLogout}
                                className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <LogOut size={18} className="mr-2" /> Logout
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {isAddAddressModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
                    onClick={() => {
                        setIsAddAddressModalOpen(false);
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
                        className="bg-white rounded-lg shadow-lg p-6 border border-orange-200 w-full max-w-sm max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Address</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-1">Country *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">City *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Postal Code *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Building Number *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Floor Number *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Street Name *</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Address Label</label>
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
                                <label className="block text-gray-600 text-sm font-medium mb-1">Notes</label>
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
                                <p className="text-red-500 text-sm font-semibold">{addressError}</p>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsAddAddressModalOpen(false);
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
                                    className="px-4 py-2 bg-transparent border border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddAddress}
                                    className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-200 hover:-translate-y-1"
                                >
                                    Save Address
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}