import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, ChevronDown, ChevronUp, Lock, Sparkles, Plus, Minus, AlertCircle, CheckCircle2, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';
import api from '../api';

export default function BookingWidget({ listing, isHost = false, onBookingCompleted }) {
  const { user, profile, openAuthModal } = useAuth();
  
  // Default dates: tomorrow to +5 days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(tomorrow.getDate() + 4);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(nextWeek.toISOString().split('T')[0]);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [reservedDates, setReservedDates] = useState([]);
  
  const maxAllowedGuests = listing.maxGuests || 4;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch booked date ranges for this listing
  const fetchReservedDates = async () => {
    try {
      const res = await api.get(`/bookings/listing/${listing._id}`);
      if (res.data.success) {
        setReservedDates(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch listing booked dates:', err);
    }
  };

  useEffect(() => {
    if (listing?._id) {
      fetchReservedDates();
    }
  }, [listing?._id]);

  // Close guest dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute stay duration
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.max(0, end - start);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Check if chosen range conflicts with existing confirmed booking
  const hasConflict = reservedDates.some((b) => {
    const bStart = new Date(b.checkIn);
    const bEnd = new Date(b.checkOut);
    return start < bEnd && end > bStart;
  });

  // Pricing calculations
  const pricePerNight = listing.price;
  const baseTotal = pricePerNight * nights;
  const cleaningFee = listing.cleaningFee || 60;
  const serviceFee = listing.serviceFee || Math.round(baseTotal * 0.12);
  const taxes = Math.round((baseTotal + cleaningFee + serviceFee) * 0.08);
  const totalPrice = baseTotal + cleaningFee + serviceFee + taxes;

  const totalStandardGuests = adults + children;
  const isAtMaxGuests = totalStandardGuests >= maxAllowedGuests;

  const handleReserveClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (isHost) {
      alert('You are the host of this listing. You cannot book your own property.');
      return;
    }
    if (hasConflict) {
      alert('The selected dates are already booked by another traveler. Please pick different dates.');
      return;
    }
    setCheckoutModalOpen(true);
  };

  return (
    <>
      <div className="sticky top-28 w-full glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl">
        {/* Host Mode Notice */}
        {isHost && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>You are hosting this stay</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Manage incoming traveler reservations, view payouts, and update availability.
            </p>
            <Link
              to="/my-listings"
              className="inline-block mt-2.5 py-1.5 px-3 rounded-xl bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition-colors"
            >
              Go to Host Dashboard
            </Link>
          </div>
        )}

        {/* Header Price & Rating */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="font-extrabold text-2xl text-slate-900 dark:text-white">
              ${pricePerNight.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
              / night
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
            <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900 dark:fill-amber-400 dark:text-amber-400" />
            <span>{listing.rating > 0 ? listing.rating.toFixed(2) : '5.0'}</span>
            <span className="text-slate-400 font-normal">({listing.reviewCount || 12})</span>
          </div>
        </div>

        {/* Date & Guest Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 overflow-visible mb-4">
          
          {/* Date Picker Range */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
              />
            </div>

            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Checkout
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none mt-0.5"
              />
            </div>
          </div>

          {/* Guest Selector */}
          <div className="relative p-3" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Guests (Max: {maxAllowedGuests})
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {totalStandardGuests} guest{totalStandardGuests > 1 ? 's' : ''}
                  {infants > 0 && `, ${infants} infant${infants > 1 ? 's' : ''}`}
                  {pets > 0 && `, ${pets} pet${pets > 1 ? 's' : ''}`}
                </span>
              </div>
              {guestDropdownOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Guest Dropdown */}
            {guestDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 p-4 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                  <span>Guest Capacity</span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${isAtMaxGuests ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {totalStandardGuests} / {maxAllowedGuests} Max
                  </span>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Adults</p>
                    <p className="text-[10px] text-slate-400">Age 13+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{adults}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAtMaxGuests) setAdults(adults + 1);
                      }}
                      disabled={isAtMaxGuests}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Children</p>
                    <p className="text-[10px] text-slate-400">Ages 2–12</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{children}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAtMaxGuests) setChildren(children + 1);
                      }}
                      disabled={isAtMaxGuests}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Infants</p>
                    <p className="text-[10px] text-slate-400">Under 2 (no charge)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{infants}</span>
                    <button
                      type="button"
                      onClick={() => setInfants(Math.min(5, infants + 1))}
                      disabled={infants >= 5}
                      className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Maximum Notice */}
                {isAtMaxGuests && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    This stay allows a maximum of {maxAllowedGuests} guests.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setGuestDropdownOpen(false)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-900 dark:bg-white text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Conflict Alert */}
        {hasConflict && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>These dates are already booked by another traveler. Please choose other dates.</span>
          </div>
        )}

        {/* Reserved Dates List Badge */}
        {reservedDates.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Current Bookings on this Property ({reservedDates.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {reservedDates.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                >
                  {new Date(b.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(b.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reserve Action Button */}
        <button
          type="button"
          onClick={handleReserveClick}
          disabled={hasConflict}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            hasConflict
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : isHost
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-glow'
              : 'bg-gradient-to-r from-brand to-rose-600 hover:from-brand-dark hover:to-rose-700 text-white shadow-glow hover:shadow-lg'
          }`}
        >
          {isHost ? (
            <>
              <Crown className="w-4 h-4" />
              <span>You Host This Property</span>
            </>
          ) : hasConflict ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Dates Unavailable</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Reserve This Stay</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2.5">
          {isHost ? 'View and manage guest reservations in host panel' : "You won't be charged until next step"}
        </p>

        {/* Price Breakdown */}
        <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex justify-between">
            <span className="underline">${pricePerNight.toLocaleString()} × {nights} nights</span>
            <span>${baseTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">LuxNest service fee</span>
            <span>${serviceFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Taxes & fees</span>
            <span>${taxes}</span>
          </div>

          <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
            <span>Total before taxes</span>
            <span className="text-brand">${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        listing={listing}
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        guests={{ adults, children, infants, pets }}
        pricing={{ baseTotal, cleaningFee, serviceFee, taxes, totalPrice }}
        onBookingSuccess={() => {
          fetchReservedDates();
          if (onBookingCompleted) onBookingCompleted();
        }}
      />
    </>
  );
}
