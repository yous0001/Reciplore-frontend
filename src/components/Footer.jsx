import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        // Placeholder for newsletter signup logic
        alert('Newsletter signup submitted! (Implement backend logic here)');
    };

    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-16 xl:px-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="flex flex-col items-start">
                        <img
                            src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png"
                            alt="Reciplore Logo"
                            className="h-16 mb-4"
                        />
                        <p className="text-sm leading-relaxed">
                            Reciplore is your go-to platform for discovering delicious recipes tailored to your ingredients. Join our community and explore culinary creativity!
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/recipes" className="hover:text-white transition-colors">
                                    Search Recipes
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                                    Terms and Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space- y-2">
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                <a href="mailto:reciplore0@gmail.com" className="hover:text-white transition-colors">
                                    reciplore0@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-2" />
                                <a href="tel:+201276085914" className="hover:text-white transition-colors">
                                    +20 1276085914
                                </a>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                <span>eelu-sohag university - egypt</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Signup */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                        <p className="text-sm mb-4">Subscribe to our newsletter for the latest recipes and tips!</p>
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                                required
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Social Media and Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <a
                            href="https://x.com/reciplore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="Follow us on X"
                        >
                            <Twitter className="w-6 h-6" />
                        </a>
                        <a
                            href="https://instagram.com/reciplore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="Follow us on Instagram"
                        >
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a
                            href="https://facebook.com/reciplore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="Follow us on Facebook"
                        >
                            <Facebook className="w-6 h-6" />
                        </a>
                    </div>
                    <p className="text-sm">
                        &copy; {currentYear} Reciplore. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}