import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, Waves, Sparkles, Flame, Snowflake, Car, PawPrint, Tv, Utensils, Zap, Compass, Check } from 'lucide-react';

const PROPERTY_TYPES = ['All', 'Villa', 'House', 'Apartment', 'Cabin', 'Treehouse', 'Resort', 'Mansion'];

const AMENITY_OPTIONS = [
  { id: 'Fast Wifi', label: 'Fast Wifi', icon: Wifi },
  { id: 'Infinity Pool', label: 'Infinity Pool / Pool', icon: Waves },
  { id: 'Hot Tub', label: 'Hot Tub / Whirlpool', icon: Sparkles },
  { id: 'Air Conditioning', label: 'Air Conditioning', icon: Snowflake },
  { id: 'Chef Kitchen', label: 'Chef Kitchen', icon: Utensils },
  { id: 'Free Parking', label: 'Free Parking', icon: Car },
  { id: 'EV Charger', label: 'EV Charger', icon: Zap },
  { id: 'Indoor Fireplace', label: 'Indoor Fireplace', icon: Flame },
  { id: 'Pet Friendly', label: 'Pet Friendly', icon: PawPrint },
  { id: 'Dedicated Workspace', label: 'Dedicated Workspace', icon: Compass },
];

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters, onClearFilters }) {
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');
  const [localPropertyType, setLocalPropertyType] = useState(filters.propertyType || 'All');
  const [localBedrooms, setLocalBedrooms] = useState(filters.bedrooms || 0);
  const [localBathrooms, setLocalBathrooms] = useState(filters.bathrooms || 0);
  const [localAmenities, setLocalAmenities] = useState(filters.amenities || []);

  if (!isOpen) return null;

  const toggleAmenity = (amenityId) => {
    if (localAmenities.includes(amenityId)) {
      setLocalAmenities(localAmenities.filter((a) => a !== amenityId));
    } else {
      setLocalAmenities([...localAmenities, amenityId]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      propertyType: localPropertyType,
      bedrooms: localBedrooms,
      bathrooms: localBathrooms,
      amenities: localAmenities,
    });
    onClose();
  };

  const handleClear = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalPropertyType('All');
    setLocalBedrooms(0);
    setLocalBathrooms(0);
    setLocalAmenities([]);
    onClearFilters();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Filters & Preferences
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
            
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                Price range (per night)
              </h4>
              <p className="text-xs text-slate-400 mb-4">Nightly prices before taxes and fees</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Minimum</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-500 font-semibold">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/40">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maximum</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-500 font-semibold">$</span>
                    <input
                      type="number"
                      placeholder="3000+"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="pt-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                Property type
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {PROPERTY_TYPES.map((type) => {
                  const isSelected = localPropertyType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setLocalPropertyType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rooms and Beds */}
            <div className="pt-6 space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                Rooms and beds
              </h4>

              {/* Bedrooms */}
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Bedrooms</span>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setLocalBedrooms(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        localBedrooms === num
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Bathrooms</span>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setLocalBathrooms(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        localBathrooms === num
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="pt-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AMENITY_OPTIONS.map((item) => {
                  const isChecked = localAmenities.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAmenity(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                        isChecked
                          ? 'bg-brand/5 dark:bg-brand/10 border-brand text-brand font-semibold'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-brand' : 'text-slate-400'}`} />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-brand border-brand text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={handleClear}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 underline hover:text-brand transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={handleApply}
              className="py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              Show places
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
