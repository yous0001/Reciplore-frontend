import React from 'react';
import { BrainCircuit, Search, Utensils } from 'lucide-react';
import { FiSearch } from 'react-icons/fi';

const RecipeSearchBar = ({ value, onChange, onSearch }) => {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSearch();
            }}
            className="flex items-center w-full max-w-md"
        >
            <div className="relative w-full">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="     search by ingredients with Ai"
                    className="w-full p-3 pl-10 pr-3 rounded-l-md border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
                    
                />
                <BrainCircuit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
            </div>
            <button
                type="submit"
                className="bg-orange-500 text-white p-3.5 rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
                <FiSearch className="w-5 h-5" />
            </button>
        </form>
    );
};

export default RecipeSearchBar;