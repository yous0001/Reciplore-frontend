import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL, getAuthHeaders } from '../store/authStore';
import IngredientCard from '../components/IngredientCard';
import { IngredientCardSkeleton } from '../components/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import { ErrorState, EmptyState } from '../components/ui/StatusState';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

const Market = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSort, setActiveSort] = useState('Applied Price');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
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
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const { restoreSession, isAuthenticated } = useAuthStore();

    // Use refs to track previous values
    const prevParamsRef = useRef({});
    const isInitialMount = useRef(true);

    // Count active filters
    useEffect(() => {
        const count = Object.values(filters).filter(value => value !== '').length;
        setActiveFiltersCount(count);
    }, [filters]);

    const debouncedFetchIngredients = useCallback(
        debounce((params) => {
            fetchIngredients(params);
        }, 400),
        []
    );

    const fetchIngredients = async (params) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/ingredient/list`, {
                headers: getAuthHeaders(),
                params,
                timeout: 8000,
            });

            console.log('API Response:', response.data);
            
            // Check different possible response structures
            const ingredientsData = response.data.ingredients?.docs || 
                                  response.data.docs || 
                                  response.data.ingredients || 
                                  [];
            
            // Handle different pagination response structures
            let totalItems, calculatedTotalPages, currentPage, hasNext, hasPrev;
            
            if (response.data.ingredients) {
                // Structure with nested ingredients object
                totalItems = response.data.ingredients.total || response.data.ingredients.totalDocs || 0;
                calculatedTotalPages = response.data.ingredients.totalPages || 1;
                currentPage = response.data.ingredients.page || 1;
                hasNext = response.data.ingredients.hasNextPage || false;
                hasPrev = response.data.ingredients.hasPrevPage || false;
            } else if (response.data) {
                // Direct pagination properties
                totalItems = response.data.total || response.data.totalDocs || 0;
                calculatedTotalPages = response.data.totalPages || 1;
                currentPage = response.data.page || 1;
                hasNext = response.data.hasNextPage || false;
                hasPrev = response.data.hasPrevPage || false;
            } else {
                // Fallback values
                totalItems = ingredientsData.length;
                calculatedTotalPages = 1;
                currentPage = 1;
                hasNext = false;
                hasPrev = false;
            }

            setIngredients(ingredientsData);
            setTotalPages(calculatedTotalPages);
            setPage(currentPage);
            setHasNextPage(hasNext);
            setHasPrevPage(hasPrev);
            
            console.log('Page:', currentPage, 'Total Pages:', calculatedTotalPages, 'Total Items:', totalItems);
        } catch (err) {
            console.error('API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch ingredients: ' + err.message);
            setIngredients([]);
            setTotalPages(0);
            setHasNextPage(false);
            setHasPrevPage(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filterParams = {};
        if (filters.minAppliedPrice) filterParams['appliedPrice[gte]'] = filters.minAppliedPrice;
        if (filters.maxAppliedPrice) filterParams['appliedPrice[lte]'] = filters.maxAppliedPrice;
        if (filters.minAverageRating) filterParams['Average_rating[gte]'] = filters.minAverageRating;
        if (filters.maxAverageRating) filterParams['Average_rating[lte]'] = filters.maxAverageRating;
        if (filters.minStock) filterParams['stock[gte]'] = filters.minStock;
        if (filters.maxStock) filterParams['stock[lte]'] = filters.maxStock;
        if (filters.minSellings) filterParams['sellings[gte]'] = filters.minSellings;
        if (filters.maxSellings) filterParams['sellings[lte]'] = filters.maxSellings;
        if (filters.minDiscountAmount) filterParams['discount.amount[gte]'] = filters.minDiscountAmount;
        if (filters.maxDiscountAmount) filterParams['discount.amount[lte]'] = filters.maxDiscountAmount;
        if (searchTerm) filterParams.search = searchTerm;

        let sortParam = '';
        switch (activeSort) {
            case 'Lowest Price':
                sortParam = 'appliedPrice';
                break;
            case 'Top Rated':
                sortParam = '-Average_rating';
                break;
            case 'Most Available':
                sortParam = '-stock';
                break;
            case 'Top Selling':
                sortParam = '-sellings';
                break;
            case 'Top Discount':
                sortParam = '-discount.amount';
                break;
            default:
                sortParam = '-appliedPrice';
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
            fetchIngredients(params);
            return;
        }

        if (searchTerm || Object.values(filters).some((v) => v)) {
            debouncedFetchIngredients(params);
        } else {
            fetchIngredients(params);
        }
    }, [activeSort, filters, searchTerm, page, limit, debouncedFetchIngredients]);

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
        console.log('handlePageChange called with newPage:', newPage);
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFormSubmit = (e) => {
        e?.preventDefault();
        setShowFilters(false);

        const filterParams = {};
        if (filters.minAppliedPrice) filterParams['appliedPrice[gte]'] = filters.minAppliedPrice;
        if (filters.maxAppliedPrice) filterParams['appliedPrice[lte]'] = filters.maxAppliedPrice;
        if (filters.minAverageRating) filterParams['Average_rating[gte]'] = filters.minAverageRating;
        if (filters.maxAverageRating) filterParams['Average_rating[lte]'] = filters.maxAverageRating;
        if (filters.minStock) filterParams['stock[gte]'] = filters.minStock;
        if (filters.maxStock) filterParams['stock[lte]'] = filters.maxStock;
        if (filters.minSellings) filterParams['sellings[gte]'] = filters.minSellings;
        if (filters.maxSellings) filterParams['sellings[lte]'] = filters.maxSellings;
        if (filters.minDiscountAmount) filterParams['discount.amount[gte]'] = filters.minDiscountAmount;
        if (filters.maxDiscountAmount) filterParams['discount.amount[lte]'] = filters.maxDiscountAmount;
        if (searchTerm) filterParams.search = searchTerm;

        let sortParam = '';
        switch (activeSort) {
            case 'Lowest Price':
                sortParam = 'appliedPrice';
                break;
            case 'Top Rated':
                sortParam = '-Average_rating';
                break;
            case 'Most Available':
                sortParam = '-stock';
                break;
            case 'Top Selling':
                sortParam = '-sellings';
                break;
            case 'Top Discount':
                sortParam = '-discount.amount';
                break;
            default:
                sortParam = '-appliedPrice';
        }

        const params = {
            ...filterParams,
            sort: sortParam,
            page,
            limit,
        };

        fetchIngredients(params);
    };

    const clearFilters = () => {
        setFilters({
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
        });
        setPage(1);
        setShowFilters(false);
    };

    const renderSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <IngredientCardSkeleton key={index} />
            ))}
        </div>
    );

    const sortOptions = [
        { title: 'Lowest Price' },
        { title: 'Top Rated' },
        { title: 'Most Available' },
        { title: 'Top Selling' },
        { title: 'Top Discount' },
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
                    badge="Fresh Ingredients"
                    title="Culinary Market"
                    subtitle="Shop quality ingredients with live stock, discounts, and fast cart checkout."
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
                            placeholder="Search ingredients..."
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
                            value={activeSort}
                            onChange={(e) => {
                                setActiveSort(e.target.value);
                                setPage(1);
                            }}
                            className="w-full md:w-auto p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.title} value={option.title}>
                                    {option.title}
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

                {/* Ingredient Grid */}
                {loading ? (
                    renderSkeleton()
                ) : error ? (
                    <ErrorState message={error} onRetry={handleFormSubmit} />
                ) : ingredients.length === 0 ? (
                    <EmptyState
                        title="No ingredients found"
                        description="Try clearing your price or stock filters to see more ingredients."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {ingredients.map((ingredient) => (
                                <IngredientCard key={ingredient._id} ingredient={ingredient} />
                            ))}
                        </div>

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                {/* Filter Sidebar Overlay */}
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
                                    <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
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

                                            {/* Filters */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Applied Price</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minAppliedPrice"
                                                            placeholder="Min"
                                                            value={filters.minAppliedPrice}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxAppliedPrice"
                                                            placeholder="Max"
                                                            value={filters.maxAppliedPrice}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Rating (0-5)</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minAverageRating"
                                                            placeholder="Min"
                                                            value={filters.minAverageRating}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="5"
                                                            step="0.1"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxAverageRating"
                                                            placeholder="Max"
                                                            value={filters.maxAverageRating}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="5"
                                                            step="0.1"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Stock</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minStock"
                                                            placeholder="Min"
                                                            value={filters.minStock}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxStock"
                                                            placeholder="Max"
                                                            value={filters.maxStock}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sellings</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minSellings"
                                                            placeholder="Min"
                                                            value={filters.minSellings}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxSellings"
                                                            placeholder="Max"
                                                            value={filters.maxSellings}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Discount Amount (%)</h3>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            name="minDiscountAmount"
                                                            placeholder="Min %"
                                                            value={filters.minDiscountAmount}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="maxDiscountAmount"
                                                            placeholder="Max %"
                                                            value={filters.maxDiscountAmount}
                                                            onChange={handleFilterChange}
                                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                            min="0"
                                                            max="100"
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

export default Market;