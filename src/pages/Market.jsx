import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';
import IngredientCard from '../components/IngredientCard';
import { IngredientCardSkeleton } from '../components/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import SortTabs from '../components/ui/SortTabs';
import { ErrorState, EmptyState } from '../components/ui/StatusState';

const SORT_OPTIONS = [
  'Lowest Price',
  'Top Rated',
  'Most Available',
  'Top Selling',
  'Top Discount',
];

const INITIAL_FILTERS = {
  minAppliedPrice: '',
  maxAppliedPrice: '',
  minAverageRating: '',
  maxAverageRating: '',
  minStock: '',
  maxStock: '',
  minSellings: '',
  maxSellings: '',
  minDiscountAmount: '',
  maxDiscountAmount: '',
};

const Market = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSort, setActiveSort] = useState('Lowest Price');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input cleanly
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sortParam = useMemo(() => {
    switch (activeSort) {
      case 'Lowest Price':
        return 'appliedPrice';
      case 'Top Rated':
        return '-Average_rating';
      case 'Most Available':
        return '-stock';
      case 'Top Selling':
        return '-sellings';
      case 'Top Discount':
        return '-discount.amount';
      default:
        return 'appliedPrice';
    }
  }, [activeSort]);

  const queryParams = useMemo(() => {
    const params = { sort: sortParam, page, limit };
    if (filters.minAppliedPrice) params['appliedPrice[gte]'] = filters.minAppliedPrice;
    if (filters.maxAppliedPrice) params['appliedPrice[lte]'] = filters.maxAppliedPrice;
    if (filters.minAverageRating) params['Average_rating[gte]'] = filters.minAverageRating;
    if (filters.maxAverageRating) params['Average_rating[lte]'] = filters.maxAverageRating;
    if (filters.minStock) params['stock[gte]'] = filters.minStock;
    if (filters.maxStock) params['stock[lte]'] = filters.maxStock;
    if (filters.minSellings) params['sellings[gte]'] = filters.minSellings;
    if (filters.maxSellings) params['sellings[lte]'] = filters.maxSellings;
    if (filters.minDiscountAmount) params['discount.amount[gte]'] = filters.minDiscountAmount;
    if (filters.maxDiscountAmount) params['discount.amount[lte]'] = filters.maxDiscountAmount;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [sortParam, page, limit, filters, debouncedSearch]);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/ingredient/list`, {
        headers: getAuthHeaders(),
        params: queryParams,
        timeout: 8000,
      });
      const data = response.data?.ingredients || {};
      setIngredients(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setTotalDocs(data.totalDocs || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch ingredients');
      setIngredients([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

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
    if (filters.minAppliedPrice) chips.push({ key: 'minAppliedPrice', label: `Min Price: $${filters.minAppliedPrice}` });
    if (filters.maxAppliedPrice) chips.push({ key: 'maxAppliedPrice', label: `Max Price: $${filters.maxAppliedPrice}` });
    if (filters.minAverageRating) chips.push({ key: 'minAverageRating', label: `Min Rating: ${filters.minAverageRating}★` });
    if (filters.maxAverageRating) chips.push({ key: 'maxAverageRating', label: `Max Rating: ${filters.maxAverageRating}★` });
    if (filters.minStock) chips.push({ key: 'minStock', label: `Min Stock: ${filters.minStock}` });
    if (filters.maxStock) chips.push({ key: 'maxStock', label: `Max Stock: ${filters.maxStock}` });
    if (filters.minSellings) chips.push({ key: 'minSellings', label: `Min Sold: ${filters.minSellings}` });
    if (filters.maxSellings) chips.push({ key: 'maxSellings', label: `Max Sold: ${filters.maxSellings}` });
    if (filters.minDiscountAmount) chips.push({ key: 'minDiscountAmount', label: `Min Discount: ${filters.minDiscountAmount}%` });
    if (filters.maxDiscountAmount) chips.push({ key: 'maxDiscountAmount', label: `Max Discount: ${filters.maxDiscountAmount}%` });
    return chips;
  }, [filters]);

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
          badge="Fresh Ingredients"
          title="Culinary Market"
          subtitle={
            totalDocs > 0
              ? `Shop ${totalDocs.toLocaleString()} quality ingredients with live stock, discounts, and fast cart checkout.`
              : 'Shop quality ingredients with live stock, discounts, and fast cart checkout.'
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
                placeholder="Search ingredients by name or description..."
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
              active={activeSort}
              onChange={(opt) => {
                setActiveSort(opt);
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold hover:bg-orange-100 transition-colors cursor-pointer"
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
              <IngredientCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchIngredients} />
        ) : ingredients.length === 0 ? (
          <EmptyState
            title="No ingredients match your filters"
            description="Try clearing your price, stock, or rating filters to see more ingredients."
            actionLabel="Reset Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ingredients.map((ingredient) => (
                <IngredientCard key={ingredient._id} ingredient={ingredient} />
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
                  <h2 className="text-lg font-bold text-stone-900">Filter Ingredients</h2>
                  <p className="text-xs text-stone-500">Narrow down by price, rating, stock, or discount</p>
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
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Price Range ($)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minAppliedPrice"
                      min="0"
                      placeholder="Min ($)"
                      value={filters.minAppliedPrice}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxAppliedPrice"
                      min="0"
                      placeholder="Max ($)"
                      value={filters.maxAppliedPrice}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
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
                          setFilters((prev) => ({ ...prev, minAverageRating: val }));
                          setPage(1);
                        }}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          filters.minAverageRating === val
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
                      name="minAverageRating"
                      min="0"
                      max="5"
                      step="0.5"
                      placeholder="Min (0-5)"
                      value={filters.minAverageRating}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxAverageRating"
                      min="0"
                      max="5"
                      step="0.5"
                      placeholder="Max (0-5)"
                      value={filters.maxAverageRating}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Discount (%)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minDiscountAmount"
                      min="0"
                      max="100"
                      placeholder="Min %"
                      value={filters.minDiscountAmount}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      min="0"
                      max="100"
                      placeholder="Max %"
                      value={filters.maxDiscountAmount}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-2">
                    Stock Availability
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="minStock"
                      min="0"
                      placeholder="Min stock"
                      value={filters.minStock}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="number"
                      name="maxStock"
                      min="0"
                      placeholder="Max stock"
                      value={filters.maxStock}
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

export default Market;
