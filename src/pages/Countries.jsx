import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Adjust path
import RecipeCard from '../components/RecipeCard'; // Adjust path
import Cookies from 'js-cookie';
import { debounce } from 'lodash';
import { FaGlobe } from 'react-icons/fa'; // Default icon

const Countries = () => {
    const [countries, setCountries] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [activeSort, setActiveSort] = useState('Latest Recipes');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minRating: '',
        maxRating: '',
        minViews: '',
        maxViews: '',
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Debounced fetch for search and filters
    const debouncedFetchRecipes = useCallback(
        debounce((params, accessToken) => {
            fetchRecipes(params, accessToken);
        }, 500),
        []
    );

    // Fetch countries
    const fetchCountries = async (accessToken) => {
        try {
            const headers = (accessToken) ? { accessToken: `accessToken_${accessToken}` } : {}
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/country/`, {
                headers,
            });
            console.log('Countries API Response:', response.data); // Debug
            const countriesData = response.data.countries || [];
            console.log('Country Names:', countriesData.map((c) => c.name)); // Debug
            setCountries(countriesData);
        } catch (err) {
            console.error('Countries API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch countries: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch recipes for a country
    const fetchRecipes = async (params, accessToken) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/recipe/list`, {
                headers: (accessToken) ? { accessToken: `accessToken_${accessToken}` } : {},
                params,
            });
            console.log('Recipes API Response:', response.data); // Debug
            const recipesData = response.data.recipes?.docs || [];
            const totalItems = response.data.recipes?.total || 0;
            const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / params.limit));

            setRecipes(recipesData);
            setTotalPages(calculatedTotalPages);
            console.log('Page:', params.page, 'Total Pages:', calculatedTotalPages); // Debug
        } catch (err) {
            console.error('Recipes API Error:', err.response?.status, err.response?.data);
            setError('Failed to fetch recipes: ' + err.message);
            setRecipes([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const accessToken = Cookies.get('accessToken');

        if (!selectedCountry) {
            fetchCountries(accessToken);
        } else {
            const filterParams = {};
            if (filters.minRating) filterParams['Average_rating[gte]'] = filters.minRating;
            if (filters.maxRating) filterParams['Average_rating[lte]'] = filters.maxRating;
            if (filters.minViews) filterParams['views[gte]'] = filters.minViews;
            if (filters.maxViews) filterParams['views[lte]'] = filters.maxViews;
            if (searchTerm) filterParams.search = searchTerm;
            filterParams.country = selectedCountry._id;

            let sortParam = '';
            switch (activeSort) {
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

            if (searchTerm || filters.minRating || filters.maxRating || filters.minViews || filters.maxViews) {
                debouncedFetchRecipes(params, accessToken);
            } else {
                fetchRecipes(params, accessToken);
            }
        }
    }, [selectedCountry, activeSort, filters, searchTerm, page, limit, debouncedFetchRecipes]);

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
        console.log('handlePageChange called with newPage:', newPage); // Debug
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

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setPage(1);
        setRecipes([]);
        setSearchTerm('');
        setFilters({ minRating: '', maxRating: '', minViews: '', maxViews: '' });
    };

    const goBackToCountries = () => {
        setSelectedCountry(null);
        setRecipes([]);
        setPage(1);
        setTotalPages(0);
    };

    // Pagination items
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
        { title: 'Latest Recipes' },
        { title: 'Most Popular Recipes' },
        { title: 'Top Rated Recipes' },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Sidebar */}
            {selectedCountry && (
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                            {sortOptions.map((sort) => (
                                <button
                                    key={sort.title}
                                    onClick={() => {
                                        setActiveSort(sort.title);
                                        setPage(1);
                                    }}
                                    className={`text-left px-4 py-2 rounded-lg transition-colors duration-200 ${activeSort === sort.title
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {sort.title}
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
            )}

            {/* Main Content */}
            <div className={`flex-1 ${selectedCountry ? 'lg:ml-64' : ''} p-4 lg:p-6`}>
                {/* Mobile Sidebar Toggle */}
                {selectedCountry && (
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden mb-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                        {isSidebarOpen ? 'Close Filters' : 'Open Filters'}
                    </button>
                )}

                {/* Countries or Recipes */}
                {!selectedCountry ? (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore Countries</h1>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {countries.length > 0 ? (
                                countries.map((country) => (
                                    <div
                                        key={country._id}
                                        onClick={() => selectCountry(country)}
                                        className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 transform hover:scale-105"
                                        role="button"
                                        aria-label={`Select ${country.name} country`}
                                    >
                                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-orange-100 to-orange-300 flex items-center justify-center">
                                            <FaGlobe className="w-16 h-16 md:w-20 md:h-20 text-gray-600 group-hover:text-orange-500 transition-colors duration-300" />
                                            <div className="absolute inset-0 bg-transparent bg-opacity-10 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-full"></div>
                                        </div>
                                        <h2 className="mt-3 text-base md:text-lg font-semibold text-gray-900 text-center line-clamp-2">
                                            {country.name}
                                        </h2>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No countries to display
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Back Button and Country Title */}
                        <div className="flex items-center mb-6">
                            <button
                                onClick={goBackToCountries}
                                className="mr-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-orange-500 hover:text-white"
                            >
                                Back to Countries
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">{selectedCountry.name} Recipes</h1>
                        </div>

                        {/* Search */}
                        <form onSubmit={handleFormSubmit} className="mb-6">
                            <input
                                type="text"
                                placeholder={`Search ${selectedCountry.name} recipes...`}
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
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={page <= 1}
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
                                        className={`px-3 py-2 rounded-lg transition-colors ${item.type === 'ellipsis'
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
                )}
            </div>
        </div>
    );
};

export default Countries;