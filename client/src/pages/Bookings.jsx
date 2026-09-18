import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, AlertCircle, Compass, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Bookings() {
  const { user, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch your trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this reservation? A full refund will be processed.')) {
      try {
        const res = await api.patch(`/bookings/${bookingId}/cancel`);
        if (res.data.success) {
          setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b)));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking.');
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Compass className="w-12 h-12 text-brand mx-auto" />
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Sign in to view your trips</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Keep track of your luxury reservations, check-in instructions, and payment receipts.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-2.5 px-6 rounded-2xl bg-brand text-white text-xs font-bold shadow-glow"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          Trips & Reservations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your upcoming vacation rentals and past travel history.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            No trips booked... yet!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Time to dust off your bags and start planning your next luxury escape.
          </p>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
          >
            Start exploring
          </Link>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const listing = booking.listing || {};
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row gap-4 p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'}
                  alt={listing.title}
                  className="w-full sm:w-40 h-40 rounded-2xl object-cover shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {listing.location}, {listing.country}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          isCancelled
                            ? 'bg-red-100 dark:bg-red-950/50 text-red-600'
                            : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <Link to={`/listings/${listing._id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand line-clamp-1">
                      {listing.title}
                    </Link>

                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand" />
                        {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p>
                        {booking.nights} night{booking.nights > 1 ? 's' : ''} • {booking.guests?.adults || 1} guests
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Paid</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">${booking.totalPrice}</span>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Cancel stay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
