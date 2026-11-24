import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = React.useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success('Subscribed! Welcome to the Reciplore kitchen.', {
      position: 'top-right',
      autoClose: 3000,
    });
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png"
                alt="Reciplore"
                className="h-14 w-auto object-contain brightness-110 group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Your modern kitchen companion for discovering authentic global recipes, AI meal planning, and shopping fresh culinary ingredients.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/recipes" className="text-stone-400 hover:text-orange-400 transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link to="/market" className="text-stone-400 hover:text-orange-400 transition-colors">
                  Ingredient Market
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-stone-400 hover:text-orange-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/countries" className="text-stone-400 hover:text-orange-400 transition-colors">
                  Cuisines by Country
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-stone-400 hover:text-orange-400 transition-colors">
                  AI Chef Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Company & Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-stone-400 hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-orange-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-stone-400 hover:text-orange-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="mailto:reciplore0@gmail.com" className="hover:text-white transition-colors truncate">
                  reciplore0@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="tel:+201276085914" className="hover:text-white transition-colors">
                  +20 1276085914
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Sohag, Egypt</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Weekly Inspiration
            </h3>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              Get handpicked seasonal recipes and cooking tips straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {currentYear} Reciplore. All rights reserved.</p>
          <p>Crafted with care for home cooks & food lovers.</p>
        </div>
      </div>
    </footer>
  );
}
