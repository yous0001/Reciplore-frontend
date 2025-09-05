import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import RecipeCard from '../components/RecipeCard';
import Cookies from 'js-cookie';
import { debounce } from 'lodash';

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
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { restoreSession, isAuthenticated } = useAuthStore();
    
    // Use refs to track previous values
    const prevParamsRef = useRef({});
    const isInitialMount = useRef(true);

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
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, {
                headers: { accessToken: `accessToken_${accessToken}` },
                params,
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
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('No access token available');
            setLoading(false);
            return;
        }

        const filterParams = {};
        if (filters.minRating) filterParams['Average_rating[gte]'] = filters.minRating;
        if (filters.maxRating) filterParams['Average_rating[lte]'] = filters.maxRating;
        if (filters.minViews) filterParams['views[gte]'] = filters.minViews;
        if (filters.maxViews) filterParams['views[lte]'] = filters.maxViews;
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
        if (searchTerm || filters.minRating || filters.maxRating || filters.minViews || filters.maxViews) {
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
        e.preventDefault();
        // Force a refresh when form is explicitly submitted
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
            const filterParams = {};
            if (filters.minRating) filterParams['Average_rating[gte]'] = filters.minRating;
            if (filters.maxRating) filterParams['Average_rating[lte]'] = filters.maxRating;
            if (filters.minViews) filterParams['views[gte]'] = filters.minViews;
            if (filters.maxViews) filterParams['views[lte]'] = filters.maxViews;
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
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
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
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const categories = [
        { title: 'Latest Recipes' },
        { title: 'Most Popular Recipes' },
        { title: 'Top Rated Recipes' },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters & Sort</h2>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
                        ✕
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Sort By</h3>
                    <div className="flex flex-col space-y-2">
                        {categories.map((category) => (
                            <button
                                key={category.title}
                                onClick={() => {
                                    setActiveCategory(category.title);
                                    setPage(1);
                                }}
                                className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    activeCategory === category.title
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <input
                        type="number"
                        name="minRating"
                        placeholder="Min Rating"
                        value={filters.minRating}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="0"
                        max="5"
                        step="0.1"
                    />
                    <input
                        type="number"
                        name="maxRating"
                        placeholder="Max Rating"
                        value={filters.maxRating}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="0"
                        max="5"
                        step="0.1"
                    />
                    <input
                        type="number"
                        name="minViews"
                        placeholder="Min Views"
                        value={filters.minViews}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="0"
                    />
                    <input
                        type="number"
                        name="maxViews"
                        placeholder="Max Views"
                        value={filters.maxViews}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min="0"
                    />
                    <button 
                        type="submit" 
                        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 p-4 lg:p-6">
                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden mb-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                    {isSidebarOpen ? 'Close Filters' : 'Open Filters'}
                </button>

                {/* Search */}
                <form onSubmit={handleFormSubmit} className="mb-6">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </form>

                {/* Recipe Grid */}
                {loading ? (
                    renderSkeleton()
                ) : error ? (
                    <div className="text-center text-red-500 py-10">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recipes.length > 0 ? (
                                recipes.map((recipe) => (
                                    <RecipeCard key={recipe._id} recipe={recipe} />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No recipes to display
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-2">
                                {/* First Page */}
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={page === 1 || !hasPrevPage}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                                    aria-label="First page"
                                >
                                    First
                                </button>

                                {/* Previous Page */}
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1 || !hasPrevPage}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                                    aria-label="Previous page"
                                >
                                    Prev
                                </button>

                                {/* Page Numbers and Ellipsis */}
                                {getPaginationItems().map((item, index) => (
                                    <button
                                        key={`${item.type}-${item.label}-${index}`}
                                        onClick={() => item.type === 'page' && handlePageChange(item.number)}
                                        disabled={item.type === 'ellipsis' || page === item.number}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            item.type === 'ellipsis'
                                                ? 'bg-transparent text-gray-700 cursor-default'
                                                : page === item.number
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white'
                                        }`}
                                        aria-label={item.type === 'page' ? `Page ${item.label}` : undefined}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {/* Next Page */}
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages || !hasNextPage}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                                    aria-label="Next page"
                                >
                                    Next
                                </button>

                                {/* Last Page */}
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={page >= totalPages || !hasNextPage}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                                    aria-label="Last page"
                                >
                                    Last
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeList;