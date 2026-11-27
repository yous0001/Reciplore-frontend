import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { API_URL, getAuthHeaders } from '../store/authStore';

// ── Country name → flag emoji ──────────────────────────────────────────────
// Converts a 2-letter ISO-3166-1 alpha-2 code to a flag emoji
const isoToFlag = (iso) =>
  iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

// Name → ISO code map (covers common culinary nations + extras)
const NAME_TO_ISO = {
  afghan: 'AF', afghanistan: 'AF',
  albanian: 'AL', albania: 'AL',
  algerian: 'DZ', algeria: 'DZ',
  american: 'US', 'united states': 'US', usa: 'US',
  argentinian: 'AR', argentina: 'AR',
  australian: 'AU', australia: 'AU',
  austrian: 'AT', austria: 'AT',
  bangladeshi: 'BD', bangladesh: 'BD',
  belgian: 'BE', belgium: 'BE',
  bolivian: 'BO', bolivia: 'BO',
  brazilian: 'BR', brazil: 'BR',
  british: 'GB', uk: 'GB', england: 'GB', 'united kingdom': 'GB',
  bulgarian: 'BG', bulgaria: 'BG',
  burmese: 'MM', myanmar: 'MM',
  cambodian: 'KH', cambodia: 'KH',
  canadian: 'CA', canada: 'CA',
  chilean: 'CL', chile: 'CL',
  chinese: 'CN', china: 'CN',
  colombian: 'CO', colombia: 'CO',
  congolese: 'CD', congo: 'CD',
  croatian: 'HR', croatia: 'HR',
  cuban: 'CU', cuba: 'CU',
  czech: 'CZ', czechia: 'CZ',
  danish: 'DK', denmark: 'DK',
  dutch: 'NL', netherlands: 'NL', holland: 'NL',
  ecuadorian: 'EC', ecuador: 'EC',
  egyptian: 'EG', egypt: 'EG',
  ethiopian: 'ET', ethiopia: 'ET',
  finnish: 'FI', finland: 'FI',
  french: 'FR', france: 'FR',
  georgian: 'GE', georgia: 'GE',
  german: 'DE', germany: 'DE',
  ghanaian: 'GH', ghana: 'GH',
  greek: 'GR', greece: 'GR',
  guatemalan: 'GT', guatemala: 'GT',
  haitian: 'HT', haiti: 'HT',
  hungarian: 'HU', hungary: 'HU',
  indian: 'IN', india: 'IN',
  indonesian: 'ID', indonesia: 'ID',
  iranian: 'IR', iran: 'IR', persian: 'IR',
  iraqi: 'IQ', iraq: 'IQ',
  irish: 'IE', ireland: 'IE',
  israeli: 'IL', israel: 'IL',
  italian: 'IT', italy: 'IT',
  jamaican: 'JM', jamaica: 'JM',
  japanese: 'JP', japan: 'JP',
  jordanian: 'JO', jordan: 'JO',
  kenyan: 'KE', kenya: 'KE',
  korean: 'KR', korea: 'KR', 'south korea': 'KR',
  'north korean': 'KP', 'north korea': 'KP',
  kuwaiti: 'KW', kuwait: 'KW',
  laotian: 'LA', laos: 'LA',
  lebanese: 'LB', lebanon: 'LB',
  libyan: 'LY', libya: 'LY',
  malaysian: 'MY', malaysia: 'MY',
  maldivian: 'MV', maldives: 'MV',
  maltese: 'MT', malta: 'MT',
  mexican: 'MX', mexico: 'MX',
  moroccan: 'MA', morocco: 'MA',
  nepalese: 'NP', nepal: 'NP',
  nicaraguan: 'NI', nicaragua: 'NI',
  nigerian: 'NG', nigeria: 'NG',
  norwegian: 'NO', norway: 'NO',
  omani: 'OM', oman: 'OM',
  pakistani: 'PK', pakistan: 'PK',
  panamanian: 'PA', panama: 'PA',
  peruvian: 'PE', peru: 'PE',
  philippine: 'PH', filipino: 'PH', philippines: 'PH',
  polish: 'PL', poland: 'PL',
  portuguese: 'PT', portugal: 'PT',
  puerto: 'PR', 'puerto rico': 'PR',
  qatari: 'QA', qatar: 'QA',
  romanian: 'RO', romania: 'RO',
  russian: 'RU', russia: 'RU',
  saudi: 'SA', 'saudi arabia': 'SA',
  scottish: 'GB',
  senegalese: 'SN', senegal: 'SN',
  singaporean: 'SG', singapore: 'SG',
  somali: 'SO', somalia: 'SO',
  south_african: 'ZA', 'south africa': 'ZA', southafrican: 'ZA',
  spanish: 'ES', spain: 'ES',
  srilankan: 'LK', 'sri lanka': 'LK', 'sri lankan': 'LK',
  sudanese: 'SD', sudan: 'SD',
  swedish: 'SE', sweden: 'SE',
  swiss: 'CH', switzerland: 'CH',
  syrian: 'SY', syria: 'SY',
  taiwanese: 'TW', taiwan: 'TW',
  thai: 'TH', thailand: 'TH',
  tunisian: 'TN', tunisia: 'TN',
  turkish: 'TR', turkey: 'TR',
  ugandan: 'UG', uganda: 'UG',
  ukrainian: 'UA', ukraine: 'UA',
  emirati: 'AE', uae: 'AE', 'united arab emirates': 'AE',
  uruguayan: 'UY', uruguay: 'UY',
  uzbek: 'UZ', uzbekistan: 'UZ',
  venezuelan: 'VE', venezuela: 'VE',
  vietnamese: 'VN', vietnam: 'VN',
  yemeni: 'YE', yemen: 'YE',
  zambian: 'ZM', zambia: 'ZM',
  zimbabwean: 'ZW', zimbabwe: 'ZW',
};

/** Returns a flag emoji for a country name, or a globe emoji as fallback */
const getFlag = (name = '') => {
  const key = name.trim().toLowerCase().replace(/_/g, ' ');
  // Try exact match first, then first word
  const iso = NAME_TO_ISO[key] || NAME_TO_ISO[key.split(' ')[0]];
  return iso ? isoToFlag(iso) : '🌍';
};

// ── Skeleton card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100">
    <div className="w-16 h-16 rounded-full bg-stone-200" />
    <div className="w-20 h-3 bg-stone-200 rounded" />
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────
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

  // ── Full-page loading skeleton (hides all text until data arrives) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-16">
        {/* Header skeleton */}
        <div className="bg-white border-b border-stone-100 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
            <div className="w-20 h-5 bg-stone-200 rounded-full mb-4" />
            <div className="w-64 h-9 bg-stone-200 rounded-xl mb-3" />
            <div className="w-80 h-4 bg-stone-100 rounded" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="w-48 h-10 bg-stone-200 rounded-xl mb-10 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      {/* Page header — only shown when data is ready */}
      <div className="bg-white border-b border-stone-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="inline-block px-3.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Explore
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Cuisines by Country
          </h1>
          <p className="mt-2 text-stone-500 text-base md:text-lg max-w-2xl">
            Choose a country to browse its signature recipes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search */}
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
        {filtered.length === 0 ? (
          <p className="text-center text-stone-400 py-20 text-base">
            No countries found{search ? ` for "${search}"` : ''}.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((country) => (
              <button
                key={country._id}
                type="button"
                onClick={() => navigate(`/recipes?country=${country._id}`)}
                className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer"
              >
                {/* Flag emoji */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border border-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <span className="text-4xl leading-none select-none" role="img" aria-label={country.name}>
                    {getFlag(country.name)}
                  </span>
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
