import React from 'react';

const RecipeCard = ({ recipe }) => {
    const {
        category,
        name,
        imageUrl,
        rating,
        tags,
        isFavourite,
        onToggleFavourite
    } = recipe;

    return (
        <div className="relative w-64 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
            {/* Recipe Image */}
            <img
                src={imageUrl || 'https://via.placeholder.com/256'}
                alt={name}
                className="w-full h-48 object-cover"
            />

            {/* Rating Badge */}
            {rating && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-xs">★</span>
                    <span className="text-xs font-bold">{rating}</span>
                </div>
            )}

            {/* Favorite Button */}
            <button
                onClick={onToggleFavourite}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
                <span className="text-xl">♥</span>
            </button>

            {/* Recipe Info */}
            <div className="p-4">
                {/* Category */}
                <p className="text-red-500 text-sm mb-1">{category}</p>

                {/* Name */}
                <h3 className="text-lg font-semibold mb-2">{name}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags?.map((tag, index) => (
                        <span
                            key={index}
                            className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;