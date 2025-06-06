import React from 'react'
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: "Home", to: "/" },
    { name: "Recipes", to: "/recipes" },
    { name: "Market", to: "/market" },
    { name: "Categories", to: "/categories" },
    { name: "Countries", to: "/countries" },
    { name: "Chat", to: "/chat" }
];
export default function Navbar() {
    return (
        <header className="fixed top-0 w-full bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <NavLink to="/">
                            <img src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png" alt="Logo" className="h-16 w-auto" />
                        </NavLink>
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-orange-400 font-semibold"
                                        : "text-gray-700 transition-all hover:text-primary hover:text-orange-400"
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Auth buttons */}
                    <div className="flex items-center space-x-4">
                        <NavLink
                            to="/auth/login"
                            className="text-gray-700 hover:text-primary"
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/auth/register"
                            className="px-4 py-1 bg-primary text-gray-700 rounded hover:bg-primary-dark"
                        >
                            Register
                        </NavLink>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            className="text-gray-700 hover:text-primary"
                            aria-label="Open menu"
                        >
                            {/* Example icon (hamburger) */}
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
                                    d="M4 8h16M4 16h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};


