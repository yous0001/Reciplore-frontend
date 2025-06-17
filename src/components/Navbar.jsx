import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, Package, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // Adjust the path as needed

const navItems = [
    { name: "Home", to: "/" },
    { name: "Recipes", to: "/recipes" },
    { name: "Market", to: "/market" },
    { name: "Categories", to: "/categories" },
    { name: "Countries", to: "/countries" },
    { name: "Chat", to: "/chat" },
    { name: "diet plan", to: "/diet-plan" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, restoreSession, isCheckingAuth, logout } = useAuthStore();
    const profileRef = useRef(null);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (isCheckingAuth) return null;

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setIsOpen(false);
    };

    return (
        <>
        <header
            className={` w-full z-50 transition-all duration-1500 transform ${scrolled ? 'fixed top-0 translate-y-0 shadow-md bg-white' : '-translate-y-0'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <NavLink to="/">
                            <img
                                src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png"
                                alt="Logo"
                                className="h-16 w-auto transition-transform hover:scale-105"
                            />
                        </NavLink>
                    </div>

                    <nav className="hidden md:flex space-x-8 items-center">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-orange-400 font-semibold border-b-2 border-orange-400"
                                        : "text-gray-700 hover:text-orange-400 transition-all duration-200"
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-400 focus:outline-none transition-all duration-200"
                                >
                                    <img
                                        src={user?.profileImage || '/default-profile.png'}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-orange-400 transition-all"
                                        onError={(e) => { e.target.src = '/default-profile.png'; }}
                                    />
                                    <span className="text-sm font-medium">{user?.username || 'Profile'}</span>
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                                        <NavLink
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-md transition-all"
                                        >
                                            Profile
                                        </NavLink>
                                        <NavLink
                                            to="/orders"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center transition-all"
                                        >
                                            <Package size={18} className="mr-2" /> Orders
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-md flex items-center transition-all"
                                        >
                                            <LogOut size={18} className="mr-2" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <NavLink
                                    to="/auth/login"
                                    className="text-gray-700 hover:text-orange-400 transition-all duration-200"
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/auth/register"
                                    className="px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 rounded shadow-md transition-all duration-200"
                                >
                                    Register
                                </NavLink>
                            </>
                        )}
                        <NavLink
                            to="/favourites"
                            className="text-gray-700 hover:text-orange-400 transition-all duration-200"
                        >
                            <Heart size={20} />
                        </NavLink>
                        <NavLink
                            to="/cart"
                            className="text-gray-700 hover:text-orange-400 transition-all duration-200"
                        >
                            <ShoppingCart size={20} />
                        </NavLink>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-orange-400 focus:outline-none transition-all duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden mt-2 space-y-2 pb-4 bg-white rounded-b-lg shadow-lg">
                        <div className="flex flex-col space-y-2 px-4 pt-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "block px-4 py-2 text-orange-400 font-semibold bg-gray-100 rounded"
                                            : "block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-all"
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                        <div className="border-t border-gray-300 pt-4 mt-2 px-4 space-y-2">
                            {isAuthenticated ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left rounded"
                                    >
                                        <img
                                            src={user?.profileImage || '/default-profile.png'}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-300"
                                            onError={(e) => { e.target.src = '/default-profile.png'; }}
                                        />
                                        <span>Profile</span>
                                    </button>
                                    {isProfileOpen && (
                                        <div className="mt-2 space-y-2 bg-white border border-gray-300 rounded-md shadow">
                                            <NavLink
                                                to="/profile"
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    setIsOpen(false);
                                                }}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center rounded"
                                            >
                                                <User size={18} className="mr-2" /> Profile
                                            </NavLink>
                                            <NavLink
                                                to="/orders"
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    setIsOpen(false);
                                                }}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center rounded"
                                            >
                                                <Package size={18} className="mr-2" /> Orders
                                            </NavLink>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded flex items-center"
                                            >
                                                <LogOut size={18} className="mr-2" /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <NavLink
                                        to="/auth/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/auth/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 rounded text-center"
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}
                            <NavLink
                                to="/favourites"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                                <Heart size={18} /> Favourites
                            </NavLink>
                            <NavLink
                                to="/cart"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                                <ShoppingCart size={18} /> Cart
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>
        </header>
        {scrolled ? <div className='my-16'/> : ""}
        </>
    );
}