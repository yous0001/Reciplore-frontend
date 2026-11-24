import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL, getAuthHeaders } from '../store/authStore';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import { ErrorState, EmptyState } from '../components/ui/StatusState';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Latest Recipes');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minRating: '',
        maxRating: '',
        minViews: '',
        maxViews: '',
        category: '',
        country: '',
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    // Use refs to track previous values
    const prevParamsRef = useRef({});
    const isInitialMount = useRef(true);

    // Fetch categories for the filter dropdown
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/category/`, { headers: getAuthHeaders() });
            setCategories(response.data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    // Fetch countries from API
    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${API_URL}/country/`, { headers: getAuthHeaders() });
            const countryData = response.data.countries || [];
            setCountries(countryData);
        } catch (err) {
            console.error('Failed to fetch countries:', err);
        }
    };

    // Check for category filter from URL parameters
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setFilters(prev => ({
                ...prev,
                category: categoryParam
            }));

            // Remove the category parameter from URL after reading it
            // to prevent it from being reapplied on refresh
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('category');
            setSearchParams(newSearchParams);
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        fetchCategories();
        fetchCountries();
    }, []);

    // Count active filters
    useEffect(() => {
        const count = Object.values(filters).filter(value => value !== '').length;
        setActiveFiltersCount(count);
    }, [filters]);

    // Create a stable debounced function with useCallback
    const debouncedFetchRecipes = useCallback(
        debounce((params) => {
            fetchRecipes(params);
        }, 400),
        []
    );

    const fetchRecipes = async (params) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/recipe/list`, {
                headers: getAuthHeaders(),
                params,
                timeout: 8000,
            });

            const recipesData = response.data.recipes?.docs || [];
            const totalItems = response.data.recipes?.totalDocs || 0;
            const calculatedTotalPages = response.data.recipes?.totalPages || 1;
            const currentPage = response.data.recipes?.page || 1;
            const hasNext = response.data.recipes?.hasNextPage || false;
            const hasPrev = response.data.recipes?.hasPrevPage || false;

            setRecipes(recipesData);
            setTotalPages(calculatedTotalPages);
            setPage(currentPage);
            setHasNextPage(hasNext);
            setHasPrevPage(hasPrev);
        } catch (err) {
            console.error('API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch recipes: ' + err.message);
            setRecipes([]);
            setTotalPages(0);
            setHasNextPage(false);
            setHasPrevPage(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filterParams = {};
        if (filters.minRating) filterParams['Average_rating[gte]'] = filters.minRating;
        if (filters.maxRating) filterParams['Average_rating[lte]'] = filters.maxRating;
        if (filters.minViews) filterParams['views[gte]'] = filters.minViews;
        if (filters.maxViews) filterParams['views[lte]'] = filters.maxViews;
        if (filters.category) filterParams.category = filters.category;
        if (filters.country) filterParams.country = filters.country;
        if (searchTerm) filterParams.search = searchTerm;

        let sortParam = '';
        switch (activeCategory) {
            case 'Latest Recipes':
                sortParam = '-createdAt';
                break;
            case 'Most Popular Recipes':
                sortParam = '-views';
                break;
            case 'Top Rated Recipes':
                sortParam = '-Average_rating';
                break;
            default:
                sortParam = '-createdAt';
        }

        const params = {
            ...filterParams,
            sort: sortParam,
            page,
            limit,
        };

        // Skip the initial mount to prevent double fetch
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchRecipes(params);
            return;
        }

        // Use debounced fetch for search/filter changes, immediate fetch for page changes
        if (searchTerm || filters.minRating || filters.maxRating || filters.minViews || filters.maxViews || filters.category || filters.country) {
            debouncedFetchRecipes(params);
        } else {
            fetchRecipes(params);
        }
    }, [activeCategory, filters, searchTerm, page, limit, debouncedFetchRecipes]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFormSubmit = (e) => {
        e?.preventDefault();
        setShowFilters(false);

        const filterParams = {};
        if (filters.minRating) filterParams['Average_rating[gte]'] = filters.minRating;
        if (filters.maxRating) filterParams['Average_rating[lte]'] = filters.maxRating;
        if (filters.minViews) filterParams['views[gte]'] = filters.minViews;
        if (filters.maxViews) filterParams['views[lte]'] = filters.maxViews;
        if (filters.category) filterParams.category = filters.category;
        if (filters.country) filterParams.country = filters.country;
        if (searchTerm) filterParams.search = searchTerm;

        let sortParam = '';
        switch (activeCategory) {
            case 'Latest Recipes':
                sortParam = '-createdAt';
                break;
            case 'Most Popular Recipes':
                sortParam = '-views';
                break;
            case 'Top Rated Recipes':
                sortParam = '-Average_rating';
                break;
            default:
                sortParam = '-createdAt';
        }

        const params = {
            ...filterParams,
            sort: sortParam,
            page,
            limit,
        };

        fetchRecipes(params);
    };

    const clearFilters = () => {
        setFilters({
            minRating: '',
            maxRating: '',
            minViews: '',
            maxViews: '',
            category: '',
            country: '',
        });
        setPage(1);
        setShowFilters(false);
    };

    const renderSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
            ))}
        </div>
    );

    const sortOptions = [
        { title: 'Latest Recipes' },
        { title: 'Most Popular Recipes' },
        { title: 'Top Rated Recipes' },
    ];

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 0.5 }
    };

    const sidebarVariants = {
        hidden: { x: '100%' },
        visible: {
            x: 0,
            transition: { type: 'spring', damping: 25, stiffness: 200 }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex-1 max-w-7xl w-full mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
                <PageHeader
                    badge="Culinary Collection"
                    title="Explore Recipes"
                    subtitle="Browse hundreds of global dishes, filter by cuisine or rating, and save your favorites."
                />
                {/* Header with search and filter buttons */}
                <motion.div
                    className="flex flex-col md:flex-row gap-4 mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={activeCategory}
                            onChange={(e) => {
                                setActiveCategory(e.target.value);
                                setPage(1);
                            }}
                            className="w-full md:w-auto p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                        >
                            {sortOptions.map((category) => (
                                <option key={category.title} value={category.title}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Button */}
                    <motion.button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                {activeFiltersCount}
                            </span>
                        )}
                    </motion.button>
                </motion.div>

                {/* Active filters display */}
                {(filters.category || filters.country) && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {filters.category && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center">
                                Category: {categories.find(cat => cat._id === filters.category)?.name || filters.category}
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                                    className="ml-2 text-orange-600 hover:text-orange-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.country && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                                Cuisine: {countries.find(cat => cat._id === filters.country)?.name || filters.country}
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, country: '' }))}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Recipe Grid */}
                {loading ? (
                    renderSkeleton()
                ) : error ? (
                    <ErrorState message={error} onRetry={handleFormSubmit} />
                ) : recipes.length === 0 ? (
                    <EmptyState
                        title="No recipes found"
                        description="Try clearing your filters or searching with different keywords."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe._id} recipe={recipe} />
                            ))}
                        </div>

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                <AnimatePresence>
                    {showFilters && (
                        <>
                            <motion.div
                                className="fixed inset-0 z-40 bg-gradient-to-br from-gray-800 to-black"
                                variants={overlayVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                onClick={() => setShowFilters(false)}
                            />

                            <motion.div
                                className="fixed inset-y-0 right-0 max-w-full flex z-50"
                                variants={sidebarVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <div className="w-screen max-w-md">
                                    <div className="h-full flex flex-col bg-white shadow-xl">
                                        <div className="flex-1 py-6 px-4 sm:px-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                                                <button
                                                    type="button"
                                                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setShowFilters(false)}
                                                >
                                                    <span className="sr-only">Close panel</span>
                                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Filters - Added Category and Country */}
                                            <div className="space-y-6">
                                                {/* Category Filter */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                                                    <select
                                                        name="category"
                                                        value={filters.category}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="">All Categories</option>
                                                        {categories.map(category => (
                                                            <option key={category._id} value={category._id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Country Filter */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Cuisine</h3>
                                                    <select
                                                        name="country"
                                                        value={filters.country}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="">All Cuisines</option>
                                                        {countries.map(country => (
                                                            <option key={country._id} value={country._id}>
                                                                {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Rating (0-5)</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minRating"
                                                            placeholder="Min"
                                                            value={filters.minRating}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="5"
                                                            step="0.1"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxRating"
                                                            placeholder="Max"
                                                            value={filters.maxRating}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="5"
                                                            step="0.1"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Views</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minViews"
                                                            placeholder="Min"
                                                            value={filters.minViews}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxViews"
                                                            placeholder="Max"
                                                            value={filters.maxViews}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer with action buttons */}
                                        <div className="flex-shrink-0 px-4 py-5 bg-gray-50 space-y-3 sm:px-6 border-t border-gray-200">
                                            <motion.button
                                                type="button"
                                                onClick={handleFormSubmit}
                                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Apply Filters
                                            </motion.button>
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RecipeList;