import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { workersAPI } from '../api';
import WorkerCard from '../components/WorkerCard';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    sort: 'reputationScore',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const search = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = { ...filters, page: currentPage, limit: 10 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await workersAPI.getAll(params);
      setWorkers(reset ? data.workers : [...workers, ...data.workers]);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search(true);
    setPage(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilter = (key) => handleFilterChange(key, '');

  const sortOptions = [
    { value: 'reputationScore', label: '🏆 Reputation' },
    { value: 'rating', label: '⭐ Rating' },
    { value: 'jobs', label: '💼 Most Jobs' },
  ];

  const ratingOptions = ['', '4', '3', '2'];

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-4">Find Workers</h1>

      {/* Search input */}
      <div className="relative mb-3">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={filters.skill}
          onChange={(e) => handleFilterChange('skill', e.target.value)}
          placeholder="Search by skill (e.g. Electrician)"
          className="input-field pl-10 pr-10"
        />
        {filters.skill && (
          <button onClick={() => clearFilter('skill')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl border text-sm font-medium transition ${
            showFilters ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-white/10 text-white/60'
          }`}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        {sortOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => handleFilterChange('sort', o.value)}
            className={`shrink-0 px-3 py-2 rounded-xl border text-sm transition ${
              filters.sort === o.value ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-white/10 text-white/50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card mb-4 space-y-3 animate-slide-up">
          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">Location</label>
            <input
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City or area"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium mb-1.5 block">Minimum Rating</label>
            <div className="flex gap-2">
              {ratingOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => handleFilterChange('rating', r)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                    filters.rating === r ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-white/10 text-white/50'
                  }`}
                >
                  {r ? `${r}★+` : 'Any'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {(filters.location || filters.rating) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.location && (
            <span className="badge bg-primary-500/15 text-primary-400 border border-primary-500/20">
              📍 {filters.location}
              <button onClick={() => clearFilter('location')} className="ml-1"><X size={10} /></button>
            </span>
          )}
          {filters.rating && (
            <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
              ⭐ {filters.rating}+ stars
              <button onClick={() => clearFilter('rating')} className="ml-1"><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading && workers.length === 0 ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-white/5 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No workers found</p>
          <p className="text-sm mt-1">Try different filters or skills</p>
        </div>
      ) : (
        <>
          <p className="text-white/40 text-xs mb-3">{workers.length} workers found</p>
          <div className="space-y-3">
            {workers.map((w) => <WorkerCard key={w._id} worker={w} />)}
          </div>
          {page < totalPages && (
            <button
              onClick={() => { setPage(p => p + 1); search(); }}
              disabled={loading}
              className="btn-secondary w-full mt-4"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
