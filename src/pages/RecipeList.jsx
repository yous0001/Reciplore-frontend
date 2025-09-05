import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import RecipeCard from '../components/RecipeCard';
import Cookies from 'js-cookie';
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
            const accessToken = Cookies.get('accessToken');
            const config = accessToken
                ? { headers: { accessToken: `accessToken_${accessToken}` } }
                : {};

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/category/`, config);
            setCategories(response.data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    // Fetch countries from API - based on the provided response structure
    const fetchCountries = async () => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = accessToken
                ? { headers: { accessToken: `accessToken_${accessToken}` } }
                : {};

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/country/`, config);

            // Extract country names from the API response
            // Based on the structure: { countries: [{ name: "Country1" }, { name: "Country2" }, ...] }
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
        debounce((params, accessToken) => {
            fetchRecipes(params, accessToken);
        }, 500),
        []
    );

    const fetchRecipes = async (params, accessToken) => {
        setLoading(true);
        setError(null);

        try {
            // Conditionally add auth header
            const config = accessToken
                ? { headers: { accessToken: `accessToken_${accessToken}` }, params }
                : { params };

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, config);

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
        const accessToken = Cookies.get('accessToken');

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
            fetchRecipes(params, accessToken);
            return;
        }

        // Use debounced fetch for search/filter changes, immediate fetch for page changes
        if (searchTerm || filters.minRating || filters.maxRating || filters.minViews || filters.maxViews || filters.category || filters.country) {
            debouncedFetchRecipes(params, accessToken);
        } else {
            fetchRecipes(params, accessToken);
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

        // Force a refresh when form is explicitly submitted
        const accessToken = Cookies.get('accessToken');

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

        fetchRecipes(params, accessToken);
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

    // Generate pagination numbers with ellipsis
    const getPaginationItems = () => {
        const maxVisiblePages = 5;
        const items = [];

        if (totalPages <= 1) return items;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Always show first page
        if (startPage > 1) {
            items.push({ type: 'page', number: 1, label: '1' });
        }

        // Add ellipsis if needed
        if (startPage > 2) {
            items.push({ type: 'ellipsis', label: '...' });
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            items.push({ type: 'page', number: i, label: i.toString() });
        }

        // Add ellipsis if needed
        if (endPage < totalPages - 1) {
            items.push({ type: 'ellipsis', label: '...' });
        }

        // Always show last page if different from current end
        if (endPage < totalPages) {
            items.push({ type: 'page', number: totalPages, label: totalPages.toString() });
        }

        return items;
    };

    // Add a loading skeleton for better UX
    const renderSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
                <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                    <div className="p-4">
                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                    </div>
                </motion.div>
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
            {/* Main Content Area */}
            <div className="flex-1 pt-16 p-4 lg:p-6">
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
                    <div className="text-center text-red-500 py-10">{error}</div>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {recipes.length > 0 ? (
                                recipes.map((recipe, index) => (
                                    <motion.div
                                        key={recipe._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <RecipeCard recipe={recipe} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No recipes found matching your criteria
                                </div>
                            )}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                className="flex justify-center items-center mt-8 space-x-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={page === 1 || !hasPrevPage}
                                    className="px-3 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                    aria-label="First page"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1 || !hasPrevPage}
                                    className="px-3 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                    aria-label="Previous page"
                                >
                                    Prev
                                </button>
                                {getPaginationItems().map((item, index) => (
                                    <button
                                        key={`${item.type}-${item.label}-${index}`}
                                        onClick={() => item.type === 'page' && handlePageChange(item.number)}
                                        disabled={item.type === 'ellipsis' || page === item.number}
                                        className={`px-3 py-2 rounded-lg transition-colors shadow-sm ${item.type === 'ellipsis'
                                            ? 'bg-transparent text-gray-700 cursor-default'
                                            : page === item.number
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white'
                                            }`}
                                        aria-label={item.type === 'page' ? `Page ${item.label}` : undefined}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages || !hasNextPage}
                                    className="px-3 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                    aria-label="Next page"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={page >= totalPages || !hasNextPage}
                                    className="px-3 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                    aria-label="Last page"
                                >
                                    Last
                                </button>
                            </motion.div>
                        )}
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