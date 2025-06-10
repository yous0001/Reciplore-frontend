import React, { useState } from 'react';
import axios from 'axios';
import "./Chat.css";
const Chat = () => {
  const [currentMode, setCurrentMode] = useState('ingredients');
  const [ingredients, setIngredients] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipeData, setRecipeData] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const toggleMode = (mode) => {
    setCurrentMode(mode);
  };

  const generateRecipe = async () => {
    // Reset UI
    setLoading(true);
    setError('');
    setRecipeData(null);
    setImageUrl('');

    // Validate input based on mode
    if (currentMode === 'ingredients' && !ingredients.trim()) {
      setLoading(false);
      setError('Please enter ingredients.');
      return;
    }
    if (currentMode === 'mood' && !mood.trim()) {
      setLoading(false);
      setError('Please enter a mood.');
      return;
    }

    try {
      const endpoint = currentMode === 'ingredients'
        ? 'http://localhost:3000/ai/chat/ingredients'
        : 'http://localhost:3000/ai/chat/mood';
      const payload = currentMode === 'ingredients'
        ? { ingredients: ingredients.trim() }
        : { mood: mood.trim() };

      const response = await axios.post(endpoint, payload);
      
      const { recipeJson: recipe, image: url } = response.data;
      setRecipeData(recipe);
      setImageUrl(url || 'https://via.placeholder.com/800x400?text=Recipe+Image');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Helper function to render list items with proper formatting
  const renderListItems = (items, isInstructions = false) => {
    if (!items || !items.length) return null;
    
    return items.map((item, index) => {
      if (isInstructions) {
        return (
          <li key={index} className="py-1">
            <strong className="text-orange-600">{item.action || 'Step ' + item.step}</strong>
            {item.description ? ': ' + item.description : ''}
          </li>
        );
      }
      
      return (
        <li key={index}>
          {item.quantity ? `${item.quantity} ` : ''}{item.name || 'Unknown ingredient'}
          {item.substitute ? <span className="text-gray-500"> (or {item.substitute})</span> : ''}
          {item.notes ? <span className="text-gray-500"> ({item.notes})</span> : ''}
        </li>
      );
    });
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-gray-100 font-sans min-h-screen">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center text-orange-900 mb-8 tracking-tight">
          Recipe Generator
        </h1>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 hover-scale">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg bg-orange-100 p-1">
              <label className={`toggle-label px-4 py-2 rounded-lg cursor-pointer font-medium text-orange-800 ${currentMode === 'ingredients' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="ingredients" 
                  className="hidden" 
                  checked={currentMode === 'ingredients'}
                  onChange={() => toggleMode('ingredients')} 
                />
                Ingredients
              </label>
              <label className={`toggle-label px-4 py-2 rounded-lg cursor-pointer font-medium text-orange-800 ${currentMode === 'mood' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="mood" 
                  className="hidden" 
                  checked={currentMode === 'mood'}
                  onChange={() => toggleMode('mood')} 
                />
                Mood
              </label>
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="ingredientsInput"
              type="text"
              placeholder="Enter ingredients (e.g., butter, flour, milk, cheese)"
              className={`flex-grow p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow shadow-sm ${currentMode !== 'ingredients' ? 'hidden' : ''}`}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <input
              id="moodInput"
              type="text"
              placeholder="Enter your mood (e.g., happy, sad, or 'happy but pressured')"
              className={`flex-grow p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow shadow-sm ${currentMode !== 'mood' ? 'hidden' : ''}`}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
            <button
              id="generateButton"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md"
              onClick={generateRecipe}
            >
              Generate Recipe
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div id="loading" className="text-center text-orange-700 mb-8 transition-visibility">
            <svg className="animate-spin h-10 w-10 mx-auto text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-lg font-medium">Whipping up your recipe...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div id="error" className="text-center text-red-600 bg-red-100 p-4 rounded-lg mb-8 font-medium transition-visibility">
            {error}
          </div>
        )}

        {/* Recipe Display */}
        {recipeData && (
          <div id="recipeContainer" className="bg-white p-8 rounded-xl shadow-xl fade-in">
            {/* Image */}
            {imageUrl && (
              <img
                id="recipeImage"
                src={imageUrl}
                alt="Recipe Image"
                className="w-full h-80 object-cover rounded-lg mb-8 shadow-md"
              />
            )}

            {/* Title */}
            <h2 id="recipeTitle" className="text-3xl font-bold text-orange-900 mb-6 tracking-tight">
              {recipeData.title || 'Untitled Recipe'}
            </h2>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Overview</h3>
              <ul id="overviewList" className="space-y-2 text-gray-700">
                <li>Cuisine: <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded">{recipeData.overview?.cuisine || 'N/A'}</span></li>
                <li>Difficulty: <span className="inline-block bg-orange-200 text-orange-900 text-sm font-medium px-2.5 py-0.5 rounded">{recipeData.overview?.difficulty || 'N/A'}</span></li>
                <li>Servings: {recipeData.overview?.servings || 'N/A'}</li>
                <li>Prep Time: {recipeData.overview?.preptime || recipeData.overview?.prepTime || 'N/A'}</li>
                <li>Cook Time: {recipeData.overview?.cooktime || recipeData.overview?.cookTime || 'N/A'}</li>
                <li>Total Time: {recipeData.overview?.totaltime || recipeData.overview?.totalTime || 'N/A'}</li>
                <li>Dietary Tags: {
                  (Array.isArray(recipeData.overview?.dietaryTags) && recipeData.overview?.dietaryTags.length
                    ? recipeData.overview.dietaryTags.map((tag, i) => (
                        <span key={i} className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded mr-1">{tag}</span>
                      ))
                    : (recipeData.overview?.dietarytags 
                        ? <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded mr-1">{recipeData.overview.dietarytags}</span>
                        : <span className="text-gray-500">None</span>)
                )}</li>
              </ul>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Description</h3>
              <p id="description" className="text-gray-600 leading-relaxed">
                {recipeData.description || 'No description available.'}
              </p>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Ingredients</h3>
              <ul id="ingredientsList" className="list-disc pl-6 text-gray-600 space-y-1">
                {renderListItems(recipeData.ingredients)}
              </ul>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Instructions</h3>
              <ol id="instructionsList" className="list-decimal pl-6 text-gray-600 space-y-2">
                {renderListItems(recipeData.instructions, true)}
              </ol>
            </div>

            {/* Tips and Variations */}
            {recipeData.tipsAndVariations && recipeData.tipsAndVariations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Tips and Variations</h3>
                <ul id="tipsList" className="list-disc pl-6 text-gray-600 space-y-1">
                  {recipeData.tipsAndVariations.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nutrition */}
            <div>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 border-b border-orange-200 pb-2">Nutrition (per serving)</h3>
              <ul id="nutritionList" className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Calories: {recipeData.nutrition?.calories || 'N/A'}</li>
                <li>Protein: {recipeData.nutrition?.protein || 'N/A'}</li>
                <li>Fat: {recipeData.nutrition?.fat || 'N/A'}</li>
                <li>Carbohydrates: {recipeData.nutrition?.carbohydrates || 'N/A'}</li>
                {recipeData.nutrition?.note && (
                  <li className="text-gray-500">Note: {recipeData.nutrition.note}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;