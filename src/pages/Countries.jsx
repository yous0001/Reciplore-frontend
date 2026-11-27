import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';
import PageHeader from '../components/ui/PageHeader';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=300&q=80';

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/country/`, { headers: getAuthHeaders(), timeout: 10000 })
      .then((res) => {
        const list = res.data?.countries || [];
        setCountries(list);
        setFiltered(list);
      })
      .catch((err) => console.warn('Countries fetch failed:', err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q ? countries.filter((c) => c.name.toLowerCase().includes(q)) : countries
    );
  }, [search, countries]);

  const handleClick = (country) => {
    navigate(`/recipes?country=${country._id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      <PageHeader
        badge="Explore"
        title="Cuisines by Country"
        subtitle="Choose a country to browse its signature recipes"
        backTo="/"
        backLabel="Home"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search bar */}
        <div className="relative max-w-sm mb-10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search countries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl bg-stone-200" />
                <div className="w-16 h-3 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-stone-400 py-20 text-base">
            No countries found{search ? ` for "${search}"` : ''}.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((country) => (
              <button
                key={country._id}
                type="button"
                onClick={() => handleClick(country)}
                className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={country.image?.secure_url || FALLBACK_IMAGE}
                    alt={country.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 group-hover:text-orange-600 capitalize truncate w-full text-center transition-colors leading-tight">
                  {country.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Countries;
