import React from 'react';
import { Search } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';

const RecipeSearchBar = ({ value, onChange, onSearch }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="flex items-center">
            <div className="relative w-full max-w-md">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="Find what do you want to cook today"
                    className="w-full p-3 pl-10 pr-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
            <button
                type="submit"
                className="bg-red-500 text-white p-3 rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                <FiSearch className="w-5 h-5" />
            </button>
        </form>
    );
};

export default RecipeSearchBar;