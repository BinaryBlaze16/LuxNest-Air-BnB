import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, List, Sparkles, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import api from '../api';
import CategoryBar from '../components/CategoryBar';
import FilterModal from '../components/FilterModal';
import SearchModal from '../components/SearchModal';
import HostListingModal from '../components/HostListingModal';
import ListingCard from '../components/ListingCard';
import MapView from '../components/MapView';

export default function Home({
  searchModalOpen,
  setSearchModalOpen,
  hostModalOpen,
  setHostModalOpen,
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTotalWithTaxes, setShowTotalWithTaxes] = useState(false);

  // Active filters
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    propertyType: 'All',
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    search: '',
    location: '',
  });

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.propertyType && filters.propertyType !== 'All') params.append('propertyType', filters.propertyType);
      if (filters.bedrooms > 0) params.append('bedrooms', filters.bedrooms);
      if (filters.bathrooms > 0) params.append('bathrooms', filters.bathrooms);
      if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);

      const res = await api.get(`/listings?${params.toString()}`);
      if (res.data.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Unable to load listings. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, filters]);

  const activeFilterCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.propertyType !== 'All' ? 1 : 0) +
    (filters.bedrooms > 0 ? 1 : 0) +
    (filters.bathrooms > 0 ? 1 : 0) +
    filters.amenities.length;

  const handleApplyFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      propertyType: 'All',
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      search: '',
      location: '',
    });
  };

  const handleSearch = (searchData) => {
    setFilters((prev) => ({
      ...prev,
      location: searchData.location,
    }));
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Category Navigation Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenFilter={() => setFilterModalOpen(true)}
        showTotalWithTaxes={showTotalWithTaxes}
        setShowTotalWithTaxes={setShowTotalWithTaxes}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Active Filter Pill / Clear Bar */}
        {(activeFilterCount > 0 || filters.location || filters.search) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active filters:</span>
            {filters.location && (
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
                Location: {filters.location}
              </span>
            )}
            {filters.minPrice && (
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                Min: ${filters.minPrice}
              </span>
            )}
            {filters.maxPrice && (
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                Max: ${filters.maxPrice}
              </span>
            )}
            {filters.propertyType !== 'All' && (
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                Type: {filters.propertyType}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-brand hover:underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[20/19] rounded-3xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              {error}
            </h3>
            <button
              onClick={fetchListings}
              className="py-2.5 px-5 rounded-2xl bg-brand text-white text-xs font-bold hover:bg-brand-dark shadow-glow inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              No stays found matching your criteria
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try changing or clearing your filters, searching for a different destination, or exploring other categories.
            </p>
            <button
              onClick={handleClearFilters}
              className="py-3 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 shadow-md"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* View Toggle: Grid View or Map View */}
        {!loading && !error && listings.length > 0 && (
          <>
            {showMap ? (
              <div className="h-[75vh] w-full mt-2">
                <MapView listings={listings} />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
              >
                {listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    showTotalWithTaxes={showTotalWithTaxes}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Floating Show Map / Show List Button (Airbnb signature) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 py-3 px-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 dark:border-black/20"
        >
          {showMap ? (
            <>
              <List className="w-4 h-4" />
              <span>Show list</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Show map</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={handleSearch}
      />

      {/* Host Listing Modal */}
      <HostListingModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        onListingCreated={(newListing) => {
          setListings([newListing, ...listings]);
        }}
      />
    </div>
  );
}
