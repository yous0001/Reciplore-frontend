import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Adjust path
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { restoreSession, isAuthenticated } = useAuthStore();

    // Debounced fetch for search and filters only
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

            console.log('API Response:', response.data); // Debug API response
            const recipesData = response.data.recipes?.docs || [];
            const totalItems = response.data.recipes?.total || 0;
            const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / params.limit));

            setRecipes(recipesData);
            setTotalPages(calculatedTotalPages);
            console.log('Page:', params.page, 'Total Pages:', calculatedTotalPages, 'Total Items:', totalItems); // Debug pagination
        } catch (err) {
            console.error('API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch recipes: ' + err.message);
            setRecipes([]);
            setTotalPages(0);
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
        console.log('handlePageChange called with newPage:', newPage); // Debug page change
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Generate pagination numbers with ellipsis
    const getPaginationItems = () => {
        const maxVisiblePages = 5;
        const items = [];
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push({ type: 'page', number: 1, label: '1' });

        if (startPage > 2) {
            items.push({ type: 'ellipsis', label: '...' });
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i !== 1 && i !== totalPages) {
                items.push({ type: 'page', number: i, label: i.toString() });
            }
        }

        if (endPage < totalPages - 1) {
            items.push({ type: 'ellipsis', label: '...' });
        }

        if (totalPages !== 1) {
            items.push({ type: 'page', number: totalPages, label: totalPages.toString() });
        }

        return items;
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

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
                    />
                    <input
                        type="number"
                        name="maxRating"
                        placeholder="Max Rating"
                        value={filters.maxRating}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="minViews"
                        placeholder="Min Views"
                        value={filters.minViews}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxViews"
                        placeholder="Max Views"
                        value={filters.maxViews}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
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
                {totalPages > 0 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        {/* First Page */}
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={page === 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="First page"
                        >
                            First
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
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
                            disabled={page >= totalPages}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="Next page"
                        >
                            Next
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={page >= totalPages}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="Last page"
                        >
                            Last
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeList;