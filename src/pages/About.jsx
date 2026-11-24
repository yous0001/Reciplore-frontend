import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Sparkles, ShoppingBag, Globe } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Utensils,
      title: 'Curated Global Recipes',
      description: 'Explore hundreds of authentic recipes across diverse cuisines, complete with step-by-step instructions, ingredient lists, and video tutorials.',
    },
    {
      icon: Sparkles,
      title: 'AI Recipe & Diet Assistant',
      description: 'Generate custom recipes from whatever ingredients are in your fridge, match meals to your mood, or receive personalized AI diet plans.',
    },
    {
      icon: ShoppingBag,
      title: 'Culinary Marketplace',
      description: 'Shop fresh ingredients directly from recipe pages with transparent pricing, discounts, cart management, and secure Stripe checkout.',
    },
    {
      icon: Globe,
      title: 'Explore by Country & Category',
      description: 'Filter dishes by culinary tradition, dietary category, rating, and popularity to discover your next favorite meal.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            About Reciplore
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Cook Smarter, Discover More
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reciplore brings together global recipe discovery, AI-powered meal planning, and an integrated ingredient marketplace in one seamless kitchen companion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-orange-100"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/recipes')}
            className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Explore Recipes Now
          </button>
        </div>
      </div>
    </div>
  );
}
