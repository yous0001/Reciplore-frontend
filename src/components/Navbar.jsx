import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, User } from 'lucide-react';

const navItems = [
    { name: "Home", to: "/" },
    { name: "Recipes", to: "/recipes" },
    { name: "Market", to: "/market" },
    { name: "Categories", to: "/categories" },
    { name: "Countries", to: "/countries" },
    { name: "Chat", to: "/chat" }
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    return (
        <header className="fixed top-0 w-full bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <NavLink to="/">
                            <img
                                src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png"
                                alt="Logo"
                                className="h-16 w-auto"
                            />
                        </NavLink>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-orange-400 font-semibold"
                                        : "text-gray-700 hover:text-orange-400 transition-all"
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Auth + Icons (desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <NavLink to="/profile" className="text-gray-700 hover:text-orange-400">
                                <User size={20} />
                            </NavLink>
                        ) : (
                            <>
                                <NavLink
                                    to="/auth/login"
                                    className="text-gray-700 hover:text-orange-400"
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/auth/register"
                                    className="px-4 py-1 text-gray-700 hover:text-orange-400"
                                >
                                    Register
                                </NavLink>
                            </>
                        )}
                        <NavLink
                            to="/favourites"
                            className="text-gray-700 hover:text-orange-400"
                        >
                            <Heart size={20} />
                        </NavLink>
                        <NavLink
                            to="/cart"
                            className="text-gray-700 hover:text-orange-400"
                        >
                            <ShoppingCart size={20} />
                        </NavLink>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-orange-400 focus:outline-none"
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

                {/* Mobile Dropdown Menu */}
                {isOpen && (
                    <div className="md:hidden mt-2 space-y-2 pb-4">
                        <div className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                        <div className="border-t pt-2 mt-2 space-y-2">
                            {isLoggedIn ? (
                                <NavLink
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    <User size={18} /> Profile
                                </NavLink>
                            ) : (
                                <>
                                    <NavLink
                                        to="/auth/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/auth/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-white bg-orange-400 hover:bg-orange-500 mx-4 rounded text-center"
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}
                            <NavLink
                                to="/favourites"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                <Heart size={18} /> Favourites
                            </NavLink>
                            <NavLink
                                to="/cart"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                <ShoppingCart size={18} /> Cart
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
