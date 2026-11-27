import React, { useState } from 'react';
import axios from 'axios';
import {
  Sparkles, ChefHat, Smile, Loader2, AlertCircle,
  Clock, Users, Utensils, Flame, Leaf, Info,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';

// ── Helpers ──────────────────────────────────────────────────────────────
const MOODS = ['Happy', 'Cozy', 'Energetic', 'Romantic', 'Adventurous', 'Comfort', 'Healthy', 'Festive'];

const InfoRow = ({ label, value, badge }) =>
  value ? (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-stone-500 shrink-0 w-28">{label}</span>
      {badge ? (
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold capitalize">
          {value}
        </span>
      ) : (
        <span className="text-stone-800 font-medium capitalize">{value}</span>
      )}
    </div>
  ) : null;

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
      {Icon && <Icon className="w-5 h-5 text-orange-500" />}
      <h3 className="text-lg font-bold text-stone-900 font-display">{title}</h3>
    </div>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const Chat = () => {
  const [mode, setMode]           = useState('ingredients');
  const [ingredients, setIngredients] = useState('');
  const [mood, setMood]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [recipeData, setRecipeData] = useState(null);
  const [imageUrl, setImageUrl]   = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setRecipeData(null);
    setImageUrl('');

    const input = mode === 'ingredients' ? ingredients : mood;
    if (!input.trim()) {
      setError(mode === 'ingredients' ? 'Please enter at least one ingredient.' : 'Please enter or select a mood.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'ingredients'
        ? `${API_URL}/ai/chat/ingredients`
        : `${API_URL}/ai/chat/mood`;
      const payload  = mode === 'ingredients' ? { ingredients: input.trim() } : { mood: input.trim() };

      const { data } = await axios.post(endpoint, payload, {
        headers: getAuthHeaders(),
        timeout: 60000,
      });

      setRecipeData(data.recipeJson);
      setImageUrl(data.image || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const overview = recipeData?.overview || {};
  const tags     = Array.isArray(overview.dietaryTags)
    ? overview.dietaryTags
    : overview.dietarytags
      ? [overview.dietarytags]
      : [];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recipe Creation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight mb-3 drop-shadow">
            Your AI Chef
          </h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto leading-relaxed">
            Tell me what's in your fridge or how you feel — I'll craft the perfect recipe just for you.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* ── Input Card ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden mb-8">
          {/* Mode tabs */}
          <div className="flex border-b border-stone-100">
            {[
              { id: 'ingredients', icon: Utensils, label: 'By Ingredients' },
              { id: 'mood',        icon: Smile,    label: 'By Mood'        },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all cursor-pointer ${
                  mode === id
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {mode === 'ingredients' ? (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  What ingredients do you have?
                </label>
                <textarea
                  rows={3}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. chicken breast, garlic, lemon, olive oil, rosemary…"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition"
                />
                <p className="text-xs text-stone-400 mt-1.5">Separate ingredients with commas</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  How are you feeling today?
                </label>
                {/* Quick mood chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        mood === m
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Or describe your mood in your own words…"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Crafting your recipe…
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  Generate Recipe
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6 animate-pulse">
              <ChefHat className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-stone-700 font-semibold text-lg">Your AI Chef is cooking…</p>
            <p className="text-stone-400 text-sm mt-1">This may take up to 30 seconds</p>
          </div>
        )}

        {/* ── Recipe Result ── */}
        {!loading && recipeData && (
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
            {/* Hero image */}
            {imageUrl && (
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={recipeData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <h2 className="absolute bottom-5 left-6 right-6 text-2xl sm:text-3xl font-extrabold text-white font-display drop-shadow leading-snug">
                  {recipeData.title || 'Your Recipe'}
                </h2>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Title (if no image) */}
              {!imageUrl && (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display mb-6">
                  {recipeData.title || 'Your Recipe'}
                </h2>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: Clock,  label: 'Prep',     val: overview.preptime  || overview.prepTime  },
                  { icon: Flame,  label: 'Cook',     val: overview.cooktime  || overview.cookTime  },
                  { icon: Users,  label: 'Servings', val: overview.servings  },
                  { icon: Utensils, label: 'Difficulty', val: overview.difficulty },
                ].map(({ icon: Icon, label, val }) =>
                  val ? (
                    <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-stone-500">{label}</span>
                      <span className="text-sm font-bold text-stone-800 capitalize">{val}</span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Overview */}
              <Section title="Overview" icon={Info}>
                <div className="space-y-2.5 bg-stone-50 rounded-2xl p-4">
                  <InfoRow label="Cuisine"    value={overview.cuisine}    badge />
                  <InfoRow label="Total Time" value={overview.totaltime || overview.totalTime} />
                  {tags.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-stone-500 shrink-0 w-28">Dietary</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t, i) => (
                          <span key={i} className="inline-block px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* Description */}
              {recipeData.description && (
                <Section title="Description" icon={Leaf}>
                  <p className="text-stone-600 leading-relaxed text-sm">{recipeData.description}</p>
                </Section>
              )}

              {/* Ingredients */}
              {recipeData.ingredients?.length > 0 && (
                <Section title="Ingredients" icon={Utensils}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recipeData.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>
                          {ing.quantity && <strong className="text-stone-900">{ing.quantity} </strong>}
                          {ing.name || 'Unknown'}
                          {ing.substitute && <span className="text-stone-400"> (or {ing.substitute})</span>}
                          {ing.notes    && <span className="text-stone-400"> — {ing.notes}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Instructions */}
              {recipeData.instructions?.length > 0 && (
                <Section title="Instructions" icon={ChefHat}>
                  <ol className="space-y-4">
                    {recipeData.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                          {step.step || i + 1}
                        </span>
                        <div className="text-sm text-stone-700 pt-0.5">
                          {step.action && <strong className="text-stone-900">{step.action}: </strong>}
                          {step.description}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* Tips */}
              {recipeData.tipsAndVariations?.length > 0 && (
                <Section title="Tips & Variations" icon={Sparkles}>
                  <ul className="space-y-2">
                    {recipeData.tipsAndVariations.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Nutrition */}
              {recipeData.nutrition && (
                <Section title="Nutrition per Serving" icon={Flame}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Calories',   val: recipeData.nutrition.calories      },
                      { label: 'Protein',    val: recipeData.nutrition.protein       },
                      { label: 'Fat',        val: recipeData.nutrition.fat           },
                      { label: 'Carbs',      val: recipeData.nutrition.carbohydrates },
                    ].map(({ label, val }) =>
                      val ? (
                        <div key={label} className="flex flex-col items-center p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                          <span className="text-xs text-stone-500 mb-1">{label}</span>
                          <span className="text-sm font-bold text-stone-900">{val}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                  {recipeData.nutrition.note && (
                    <p className="mt-3 text-xs text-stone-400 italic">{recipeData.nutrition.note}</p>
                  )}
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
