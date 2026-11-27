import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import SortTabs from '../components/ui/SortTabs';
import { ErrorState, EmptyState } from '../components/ui/StatusState';

const SORT_OPTIONS = ['Latest Recipes', 'Most Popular Recipes', 'Top Rated Recipes'];

const INITIAL_FILTERS = {
  minRating: '',
  maxRating: '',
  minViews: '',
  maxViews: '',
  category: '',
  country: '',
};

const RecipeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Initialize filters from URL params on first render (avoids race condition) ──
  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    category: searchParams.get('category') || '',
    country:  searchParams.get('country')  || '',
  }));

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Latest Recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  // Strip filter params from URL after reading them (keep URL clean)
  useEffect(() => {
    const hasCategory = searchParams.get('category');
    const hasCountry  = searchParams.get('country');
    if (hasCategory || hasCountry) {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      next.delete('country');
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filter dropdown data once
  useEffect(() => {
    const loadMetadata = async () => {
      const headers = getAuthHeaders();
      const [catRes, countryRes] = await Promise.all([
        axios.get(`${API_URL}/category/`, { headers }).catch(() => ({ data: { categories: [] } })),
        axios.get(`${API_URL}/country/`, { headers }).catch(() => ({ data: { countries: [] } })),
      ]);
      setCategories(catRes.data?.categories || []);
      setCountries(countryRes.data?.countries || []);
    };
    loadMetadata();
  }, []);

  const sortParam = useMemo(() => {
    switch (activeCategory) {
      case 'Most Popular Recipes':
        return '-views';
      case 'Top Rated Recipes':
        return '-Average_rating';
      default:
        return '-createdAt';
    }
  }, [activeCategory]);

  const queryParams = useMemo(() => {
    const params = { sort: sortParam, page, limit };
    if (filters.minRating) params['Average_rating[gte]'] = filters.minRating;
    if (filters.maxRating) params['Average_rating[lte]'] = filters.maxRating;
    if (filters.minViews) params['views[gte]'] = filters.minViews;
    if (filters.maxViews) params['views[lte]'] = filters.maxViews;
    if (filters.category) params.category = filters.category;
    if (filters.country) params.country = filters.country;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [sortParam, page, limit, filters, debouncedSearch]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/recipe/list`, {
        headers: getAuthHeaders(),
        params: queryParams,
        timeout: 8000,
      });
      const data = response.data?.recipes || {};
      setRecipes(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setTotalDocs(data.totalDocs || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch recipes');
      setRecipes([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearSingleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setShowFilters(false);
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.category) {
      const cat = categories.find((c) => c._id === filters.category);
      chips.push({ key: 'category', label: `Category: ${(cat?.name || 'Selected').replace(/_/g, ' ')}` });
    }
    if (filters.country) {
      const country = countries.find((c) => c._id === filters.country);
      chips.push({ key: 'country', label: `Cuisine: ${country?.name || 'Selected'}` });
    }
    if (filters.minRating) chips.push({ key: 'minRating', label: `Min Rating: ${filters.minRating}★` });
    if (filters.maxRating) chips.push({ key: 'maxRating', label: `Max Rating: ${filters.maxRating}★` });
    if (filters.minViews) chips.push({ key: 'minViews', label: `Min Views: ${filters.minViews}` });
    if (filters.maxViews) chips.push({ key: 'maxViews', label: `Max Views: ${filters.maxViews}` });
    return chips;
  }, [filters, categories, countries]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          badge="Culinary Collection"
          title="Explore Recipes"
          subtitle={
            totalDocs > 0
              ? `Discover ${totalDocs.toLocaleString()} curated dishes across global cuisines.`
              : 'Browse global dishes, filter by cuisine or rating, and save your favorites.'
          }
        />

        {/* Search & Sort Toolbar */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipes by name, description, or tag..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer shrink-0 ${
                activeFilterChips.length > 0
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterChips.length > 0 && (
                <span className="ml-0.5 px-2 py-0.5 text-xs font-bold rounded-full bg-orange-500 text-white">
                  {activeFilterChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Sort Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
            <SortTabs
              options={SORT_OPTIONS}
              active={activeCategory}
              onChange={(opt) => {
                setActiveCategory(opt);
                setPage(1);
              }}
            />
          </div>

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1">
                Active:
              </span>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearSingleFilter(chip.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold hover:bg-orange-100 transition-colors cursor-pointer capitalize"
                >
                  {chip.label}
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRecipes} />
        ) : recipes.length === 0 ? (
          <EmptyState
            title="No recipes match your filters"
            description="Try adjusting your search keywords, category, or rating filter."
            actionLabel="Reset Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Filter Recipes</h2>
                  <p className="text-xs text-stone-500">Narrow down by cuisine, category, or rating</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 capitalize"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Country / Cuisine
                  </label>
                  <select
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">All Cuisines</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Presets */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Minimum Rating
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['', '3', '4', '4.5'].map((val) => (
                      <button
                        key={val || 'any'}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, minRating: val }));
                          setPage(1);
                        }}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          filters.minRating === val
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-orange-300'
                        }`}
                      >
                        {val ? `${val}+ ★` : 'Any'}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minRating"
                      min="0"
                      max="5"
                      step="0.5"
                      placeholder="Min (0-5)"
                      value={filters.minRating}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxRating"
                      min="0"
                      max="5"
                      step="0.5"
                      placeholder="Max (0-5)"
                      value={filters.maxRating}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Views */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Popularity (Views)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minViews"
                      min="0"
                      placeholder="Min views"
                      value={filters.minViews}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxViews"
                      min="0"
                      placeholder="Max views"
                      value={filters.maxViews}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 shadow-md transition-all cursor-pointer"
                >
                  Show Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecipeList;
