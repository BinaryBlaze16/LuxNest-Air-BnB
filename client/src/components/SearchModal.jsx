import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Calendar, Users, Plus, Minus, Sparkles } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { name: 'Santorini, Greece', desc: 'Caldera cliffside villas & pools', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=200&q=80' },
  { name: 'Malibu, California', desc: 'Oceanfront sunset estates', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=200&q=80' },
  { name: 'Paris, France', desc: 'Eiffel view penthouses & lofts', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=80' },
  { name: 'Ubud, Bali', desc: 'Jungle treehouses & bamboo retreats', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=200&q=80' },
  { name: 'Kyoto, Japan', desc: 'Traditional zen machiyas & onsens', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Chamonix, French Alps', desc: 'Snow chalets & ski-in/out lodges', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=200&q=80' },
];

export default function SearchModal({ isOpen, onClose, onSearch }) {
  const [activeTab, setActiveTab] = useState('where'); // 'where' | 'when' | 'who'
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  if (!isOpen) return null;

  const totalGuests = adults + children;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({
      location: destination,
      checkIn,
      checkOut,
      guests: totalGuests,
    });
    onClose();
  };

  const handleSelectPopular = (placeName) => {
    setDestination(placeName.split(',')[0]);
    setActiveTab('when');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Navigation Tabs */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('where')}
                className={`py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'where'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Where
              </button>
              <button
                onClick={() => setActiveTab('when')}
                className={`py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'when'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                When
              </button>
              <button
                onClick={() => setActiveTab('who')}
                className={`py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'who'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Who {totalGuests > 1 && `(${totalGuests})`}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Content */}
          <div className="p-6">
            {activeTab === 'where' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Search Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search destinations (e.g. Santorini, Aspen, Paris, Tokyo...)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Popular Luxury Getaways
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                        key={dest.name}
                        onClick={() => handleSelectPopular(dest.name)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand dark:hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all duration-200 group"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dest.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{dest.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'when' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const nextWeek = new Date(today);
                      nextWeek.setDate(today.getDate() + 7);
                      const inTwoWeeks = new Date(today);
                      inTwoWeeks.setDate(today.getDate() + 14);
                      setCheckIn(nextWeek.toISOString().split('T')[0]);
                      setCheckOut(inTwoWeeks.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next Week
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const nextMonth = new Date(today);
                      nextMonth.setMonth(today.getMonth() + 1);
                      const nextMonthEnd = new Date(nextMonth);
                      nextMonthEnd.setDate(nextMonth.getDate() + 7);
                      setCheckIn(nextMonth.toISOString().split('T')[0]);
                      setCheckOut(nextMonthEnd.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next Month
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'who' && (
              <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800">
                {/* Adults */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Adults</p>
                    <p className="text-xs text-slate-400">Ages 13 or above</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Children</p>
                    <p className="text-xs text-slate-400">Ages 2–12</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Infants</p>
                    <p className="text-xs text-slate-400">Under 2</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">{infants}</span>
                    <button
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => {
                setDestination('');
                setCheckIn('');
                setCheckOut('');
                setAdults(1);
                setChildren(0);
                setInfants(0);
              }}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 underline hover:text-brand"
            >
              Reset
            </button>
            <button
              onClick={handleSearchSubmit}
              className="py-3 px-7 rounded-2xl bg-gradient-to-r from-brand to-rose-600 text-white font-semibold text-sm hover:opacity-95 transition-all shadow-glow flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Stays
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
