import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Adjust path
import IngredientCard from '../components/IngredientCard'; // Adjust path
import Cookies from 'js-cookie';
import { debounce } from 'lodash';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { restoreSession, isAuthenticated } = useAuthStore();

    const debouncedFetchIngredients = useCallback(
        debounce((params, accessToken) => {
            fetchIngredients(params, accessToken);
        }, 500),
        []
    );

    const fetchIngredients = async (params, accessToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ingredient/list`, {
                headers: { accessToken: `accessToken_${accessToken}` },
                params,
            });

            console.log('API Response:', response.data); // Debug API response
            const ingredientsData = response.data.ingredients?.docs || [];
            const totalItems = response.data.ingredients?.total || 0;
            const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / params.limit));

            setIngredients(ingredientsData);
            setTotalPages(calculatedTotalPages);
            console.log('Page:', params.page, 'Total Pages:', calculatedTotalPages, 'Total Items:', totalItems); // Debug pagination
        } catch (err) {
            console.error('API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch ingredients: ' + err.message);
            setIngredients([]);
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

        if (searchTerm || Object.values(filters).some((v) => v)) {
            debouncedFetchIngredients(params, accessToken);
        } else {
            fetchIngredients(params, accessToken);
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

    const getPaginationItems = () => {
        const maxVisiblePages = 5;
        const items = [];
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push({ type: 'page', number: 1, label: '1' });
        if (startPage > 2) items.push({ type: 'ellipsis', label: '...' });

        for (let i = startPage; i <= endPage; i++) {
            if (i !== 1 && i !== totalPages) {
                items.push({ type: 'page', number: i, label: i.toString() });
            }
        }

        if (endPage < totalPages - 1) items.push({ type: 'ellipsis', label: '...' });
        if (totalPages !== 1) items.push({ type: 'page', number: totalPages, label: totalPages.toString() });

        return items;
    };

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    const sortOptions = [
        { title: 'Lowest Price' },
        { title: 'Top Rated' },
        { title: 'Most Available' },
        { title: 'Top Selling' },
        { title: 'Top Discount' },
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

                {/* Sort Options */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Sort By</h3>
                    <div className="flex flex-col space-y-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.title}
                                onClick={() => {
                                    setActiveSort(option.title);
                                    setPage(1);
                                }}
                                className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    activeSort === option.title
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {option.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <input
                        type="number"
                        name="minAppliedPrice"
                        placeholder="Min Applied Price"
                        value={filters.minAppliedPrice}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxAppliedPrice"
                        placeholder="Max Applied Price"
                        value={filters.maxAppliedPrice}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="minAverageRating"
                        placeholder="Min Average Rating"
                        value={filters.minAverageRating}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxAverageRating"
                        placeholder="Max Average Rating"
                        value={filters.maxAverageRating}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="minStock"
                        placeholder="Min Stock"
                        value={filters.minStock}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxStock"
                        placeholder="Max Stock"
                        value={filters.maxStock}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="minSellings"
                        placeholder="Min Sellings"
                        value={filters.minSellings}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxSellings"
                        placeholder="Max Sellings"
                        value={filters.maxSellings}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="minDiscountAmount"
                        placeholder="Min Discount Amount"
                        value={filters.minDiscountAmount}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                        type="number"
                        name="maxDiscountAmount"
                        placeholder="Max Discount Amount"
                        value={filters.maxDiscountAmount}
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
                        placeholder="Search ingredients..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </form>

                {/* Ingredient Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ingredients.length > 0 ? (
                        ingredients.map((ingredient) => (
                            <IngredientCard key={ingredient._id} ingredient={ingredient} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No ingredients to display
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={page === 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="First page"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="Previous page"
                        >
                            Prev
                        </button>
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
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="Next page"
                        >
                            Next
                        </button>
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

export default Market;