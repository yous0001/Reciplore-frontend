import React from 'react';
import { useNavigate } from 'react-router-dom';
import slugify from 'slugify';

const RecipeCard = ({ recipe }) => {
    const navigate = useNavigate();
    const rating = Math.round(recipe.Average_rating || 0);
    const isFavourite = recipe.isFavourite || false; // Assume isFavourite exists; replace with actual logic if needed
    recipe.slug = recipe.slug || slugify(recipe.name, {
        replacement: "_",
        lower: true,
    });
    console.log('Rendering RecipeCard:', recipe.slug);

    return (
        <div
            className="bg-white flex flex-col justify-between rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative w-full cursor-pointer"
            onClick={() => navigate(`/recipe/${recipe.slug}`)}
        >
            <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                {rating} ⭐
            </div>
            <img
                src={recipe.Images?.URLs?.[0]?.secure_url || 'https://via.placeholder.com/300x200'}
                alt={recipe.name || 'Recipe Image'}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }}
            />
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{recipe.name || 'Unnamed Recipe'}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{(recipe.description || '').substring(0, 50)}...</p>
            </div>
            <div className="p-5 flex justify-between items-end">
                <span className="text-orange-400 font-semibold">{recipe.category?.name || 'N/A'}</span>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                    {recipe.country?.name || 'N/A'}
                </span>
            </div>
            <button
                className="absolute top-2 right-2 text-4xl text-orange-500 transition-colors duration-200"
                onMouseEnter={(e) => (e.target.textContent = '♥')}
                onMouseLeave={(e) => (e.target.textContent = isFavourite ? '♥' : '♡')}
            >
                {isFavourite ? '♥' : '♡'}
            </button>
        </div>
    );
};

export default RecipeCard;