import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, Package, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { name: 'Home', to: '/' },
  { name: 'Recipes', to: '/recipes' },
  { name: 'Market', to: '/market' },
  { name: 'Categories', to: '/categories' },
  { name: 'Countries', to: '/countries' },
  { name: 'AI Chef', to: '/chat' },
  { name: 'Diet Plan', to: '/diet-plan' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, restoreSession, logout } = useAuthStore();
  const profileRef = useRef(null);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg border-stone-200/80 shadow-sm'
          : 'bg-white/95 backdrop-blur-md border-stone-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Brand */}
          <NavLink to="/" className="flex items-center shrink-0 group">
            <img
              src="https://res.cloudinary.com/dfdmgqhwa/image/upload/v1740230885/recipesSystem/Reciplore-removebg_xnsmub.png"
              alt="Reciplore"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/favourites"
                  aria-label="Favorites"
                  className={({ isActive }) =>
                    `p-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-orange-600'
                    }`
                  }
                >
                  <Heart className="w-5 h-5" />
                </NavLink>
                <NavLink
                  to="/cart"
                  aria-label="Cart"
                  className={({ isActive }) =>
                    `p-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-orange-600'
                    }`
                  }
                >
                  <ShoppingCart className="w-5 h-5" />
                </NavLink>

                <div className="relative ml-1" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-stone-200 bg-white hover:border-orange-300 transition-all cursor-pointer"
                  >
                    {user?.profileImage?.secure_url || (typeof user?.profileImage === 'string' && user.profileImage) ? (
                      <img
                        src={user?.profileImage?.secure_url || user?.profileImage}
                        alt={user?.username || 'Profile'}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold uppercase">
                        {(user?.username || 'U')[0]}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-stone-800 max-w-[100px] truncate">
                      {user?.username || 'Account'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 z-50">
                      <NavLink
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        Orders
                      </NavLink>
                      <div className="my-1 border-t border-stone-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-orange-600 transition-colors"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-sm shadow-orange-500/20 transition-all"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-700 hover:bg-stone-50'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t border-stone-100 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/favourites"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <Heart className="w-4 h-4 text-orange-500" /> Favorites
                </NavLink>
                <NavLink
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <ShoppingCart className="w-4 h-4 text-orange-500" /> Cart
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <User className="w-4 h-4 text-orange-500" /> Profile
                </NavLink>
                <NavLink
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <Package className="w-4 h-4 text-orange-500" /> Orders
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <NavLink
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-semibold text-white"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
