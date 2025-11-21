// pages/BrowsePage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import { services } from '../utils/api';
import ServiceCard from '../components/ServiceCard';
import Filters from '../components/Filters';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filters from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch services when filters change
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: searchParams.get('page') || 1,
          limit: 12,
        };

        // Add filters
        if (searchQuery) params.search = searchQuery;
        if (type) params.type = type;
        if (sort) params.sort = sort;
        if (priceRange) params.price = priceRange;

        const data = await services.getAll(params);
        setServiceList(data.services || []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ q: searchQuery });
  };

  // Handle filter changes
  const handleTypeChange = (value) => {
    setType(value);
    updateFilters({ type: value });
  };

  const handleSortChange = (value) => {
    setSort(value);
    updateFilters({ sort: value });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    updateFilters({ price: value });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setType('');
    setSort('newest');
    setPriceRange('');
    setSearchParams({});
  };

  // Pagination
  const handlePageChange = (page) => {
    updateFilters({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse Services</h1>
        <p className="text-dark-400 mt-1">
          Find beats, loops, drum kits, and collaborations
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search services, producers..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filters */}
      <Filters
        type={type}
        setType={handleTypeChange}
        sort={sort}
        setSort={handleSortChange}
        priceRange={priceRange}
        setPriceRange={handlePriceChange}
        onClear={handleClearFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark-400">
          {loading ? (
            'Loading...'
          ) : (
            <>
              Showing {serviceList.length} of {pagination.total || 0} services
            </>
          )}
        </p>

        {/* View Mode Toggle */}
        <div className="flex border border-dark-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-2xl overflow-hidden">
              <Skeleton className="aspect-video" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-error-500/10 border border-error-500/30 rounded-2xl p-6 text-center">
          <p className="text-error-400 mb-4">Failed to load services: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && serviceList.length === 0 && (
        <EmptyState
          icon={Search}
          title="No services found"
          description="Try adjusting your filters or search query"
          action={handleClearFilters}
          actionLabel="Clear Filters"
        />
      )}

      {/* Services Grid */}
      {!loading && !error && serviceList.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {serviceList.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, and pages around current
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === pagination.page
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return (
                  <span key={page} className="text-dark-500 px-1">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}