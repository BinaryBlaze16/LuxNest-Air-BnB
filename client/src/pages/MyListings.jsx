import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Home, Star, DollarSign, Calendar, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import HostListingModal from '../components/HostListingModal';

export default function MyListings() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'reservations'
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [listingsRes, reservationsRes] = await Promise.all([
        api.get('/listings/my-listings'),
        api.get('/bookings/host-reservations'),
      ]);

      if (listingsRes.data.success) {
        setListings(listingsRes.data.data);
      }
      if (reservationsRes.data.success) {
        setReservations(reservationsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await api.delete(`/listings/${listingId}`);
        setListings(listings.filter((l) => l._id !== listingId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete listing.');
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Home className="w-12 h-12 text-brand mx-auto" />
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Sign in to manage your hosted properties</h2>
        <button
          onClick={() => openAuthModal('login')}
          className="py-2.5 px-6 rounded-2xl bg-brand text-white text-xs font-bold shadow-glow"
        >
          Sign In
        </button>
      </div>
    );
  }

  const totalEarnings = reservations.reduce((sum, r) => sum + (r.status !== 'cancelled' ? r.totalPrice : 0), 0);

  return (
    <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            Host Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your vacation homes, pricing, and incoming guest reservations.
          </p>
        </div>

        <button
          onClick={() => setHostModalOpen(true)}
          className="py-2.5 px-5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Host a New Stay
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Listed Properties</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{listings.length}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest Bookings</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{reservations.length}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Revenue</span>
          <p className="text-2xl font-black text-brand mt-1">${totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('properties')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all ${
            activeTab === 'properties'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          My Properties ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all ${
            activeTab === 'reservations'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Guest Bookings ({reservations.length})
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-[16/11] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Tab 1: Properties List */}
      {!loading && activeTab === 'properties' && (
        <>
          {listings.length === 0 ? (
            <div className="text-center py-20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <Home className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                You don't have any properties listed yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Join thousands of luxury hosts earning with LuxNest by publishing your unique vacation home.
              </p>
              <button
                onClick={() => setHostModalOpen(true)}
                className="py-2.5 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                List your stay now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 text-[10px] font-bold">
                      {listing.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2">
                        {listing.location}, {listing.country}
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ${listing.price} <span className="text-xs font-normal text-slate-400">/ night</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/listings/${listing._id}`}
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        View stay page
                      </Link>

                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Guest Reservations */}
      {!loading && activeTab === 'reservations' && (
        <>
          {reservations.length === 0 ? (
            <div className="text-center py-20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                No guest reservations yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When travelers book your properties, their reservations and trip dates will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => {
                const guest = res.user || {};
                const listing = res.listing || {};
                const isCancelled = res.status === 'cancelled';

                return (
                  <div
                    key={res._id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={guest.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={guest.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {guest.name || 'Traveler'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              isCancelled
                                ? 'bg-red-100 dark:bg-red-950/50 text-red-600'
                                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Booked: <span className="text-slate-800 dark:text-slate-200 font-semibold">{listing.title}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(res.checkIn).toLocaleDateString()} → {new Date(res.checkOut).toLocaleDateString()} ({res.nights} nights, {res.guests?.adults || 1} guests)
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Earnings</span>
                      <span className="font-black text-base text-slate-900 dark:text-white">${res.totalPrice}</span>
                      <span className="text-[10px] text-emerald-500 font-bold capitalize">{res.paymentStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Host Modal */}
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
