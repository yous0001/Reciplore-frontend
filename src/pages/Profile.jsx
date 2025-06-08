import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore'; // Adjust the path as needed
import { NavLink } from 'react-router-dom';
import { LogOut, Edit, Trash2, Upload } from 'lucide-react';

export default function Profile() {
    const { user, isAuthenticated, logout, deleteUser, updateUser, uploadProfileImage, deleteProfileImage, isCheckingAuth } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({ name: '', age: '', phoneNumbers: [''] });
    const [imageFile, setImageFile] = useState(null);

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

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUser({
                name: updatedData.name,
                age: updatedData.age ? parseInt(updatedData.age) : null,
                phoneNumbers: updatedData.phoneNumbers ? [updatedData.phoneNumbers] : [],
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            try {
                await uploadProfileImage(file);
                setImageFile(null);
            } catch (error) {
                console.error('Upload error:', error);
            }
        }
    };

    const handleDeleteImage = async () => {
        if (window.confirm('Are you sure you want to delete your profile image?')) {
            try {
                await deleteProfileImage();
            } catch (error) {
                console.error('Delete image error:', error);
            }
        }
    };

    const handleDeleteUser = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
            try {
                await deleteUser();
            } catch (error) {
                console.error('Delete user error:', error);
            }
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
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
                                    src={user.profileImage || '/default-profile.png'} // Local fallback
                                    alt="Profile"
                                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg transition-transform hover:scale-105"
                                    onError={(e) => { e.target.src = '/default-profile.png'; }} // Fallback if image fails
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
                                <h3 className="text-lg font-medium text-gray-700">Addresses</h3>
                                <div className="mt-2 space-y-4">
                                    {user.addresses?.map((address) => (
                                        <div key={address._id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                            <p><span className="font-medium text-gray-600">Label:</span> {address.addressLabel}</p>
                                            <p><span className="font-medium text-gray-600">City:</span> {address.city}, {address.country}</p>
                                            <p><span className="font-medium text-gray-600">Postal Code:</span> {address.postalCode}</p>
                                            <p><span className="font-medium text-gray-600">Building/Floor:</span> {address.buildingNumber}, Floor {address.floorNumber}</p>
                                            <p><span className="font-medium text-gray-600">Notes:</span> {address.notes}</p>
                                            <p><span className="font-medium text-gray-600">Default:</span> {address.isDefault ? 'Yes' : 'No'}</p>
                                            <p className="text-sm text-gray-500">
                                                Created: {new Date(address.createdAt).toLocaleDateString()} | Updated: {new Date(address.updatedAt).toLocaleDateString()}
                                            </p>
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
        </div>
    );
}