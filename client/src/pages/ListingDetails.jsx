import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Sparkles,
  Award,
  Shield,
  Key,
  Calendar,
  Wifi,
  Waves,
  Car,
  Snowflake,
  Utensils,
  Zap,
  Flame,
  PawPrint,
  Compass,
  Check,
  ChevronLeft,
  X,
  Crown,
  Users,
  DollarSign,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import BookingWidget from '../components/BookingWidget';
import ReviewSection from '../components/ReviewSection';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { useTheme } from '../context/ThemeContext';

export default function ListingDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();
  const { isDarkMode } = useTheme();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Host-specific reservations state
  const [propertyReservations, setPropertyReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Guest-specific booking on this property state
  const [myTripOnProperty, setMyTripOnProperty] = useState(null);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${id}`);
      if (res.data.success) {
        setListing(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Listing not found.');
    } finally {
      setLoading(false);
    }
  };

  const isHost = Boolean(
    listing &&
    ((profile?._id && listing.owner?._id && (profile._id === listing.owner._id || profile._id === listing.owner)) ||
     (user?.email && listing.owner?.email && user.email === listing.owner.email))
  );

  // Fetch reservations if the current user is host
  const fetchHostReservations = async () => {
    if (!isHost || !user) return;
    try {
      setLoadingReservations(true);
      const res = await api.get('/bookings/host-reservations');
      if (res.data.success) {
        const filtered = (res.data.data || []).filter(
          (b) => (b.listing?._id || b.listing) === id
        );
        setPropertyReservations(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch host property reservations:', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Check if current user has booked this property
  const checkMyBookings = async () => {
    if (!user || isHost) return;
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        const activeTrip = (res.data.data || []).find(
          (b) => (b.listing?._id || b.listing) === id && b.status !== 'cancelled'
        );
        setMyTripOnProperty(activeTrip || null);
      }
    } catch (err) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (listing) {
      if (isHost) {
        fetchHostReservations();
      } else if (user) {
        checkMyBookings();
      }
    }
  }, [listing, user, isHost]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-2/3" />
        <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Listing not found</h2>
        <p className="text-slate-500">The property you are looking for may have been removed.</p>
        <Link to="/" className="inline-block py-2.5 px-6 rounded-2xl bg-brand text-white text-xs font-bold shadow-glow">
          Back to all stays
        </Link>
      </div>
    );
  }

  const saved = isSaved(listing._id);
  const images = listing.images?.length > 0
    ? listing.images
    : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' }];

  const coordinates = listing.geometry?.coordinates || [25.3753, 36.4618];
  const [lng, lat] = coordinates;

  const tileLayerUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const hostTotalEarnings = propertyReservations.reduce(
    (sum, r) => sum + (r.status !== 'cancelled' ? r.totalPrice : 0),
    0
  );

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back Link & Header Title */}
        <div className="mb-4 flex flex-col gap-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand transition-colors mb-1">
            <ChevronLeft className="w-4 h-4" /> Back to explore
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  {listing.title}
                </h1>
                {isHost && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Your Property
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900 dark:fill-amber-400 dark:text-amber-400" />
                  <span className="font-bold">{listing.rating > 0 ? listing.rating.toFixed(2) : '5.0'}</span>
                  <span className="underline">({listing.reviewCount || 12} reviews)</span>
                </span>
                <span>•</span>
                {listing.isGuestFavorite && (
                  <>
                    <span className="flex items-center gap-1 text-brand">
                      <Sparkles className="w-3.5 h-3.5 fill-brand" /> Guest favorite
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="underline">{listing.location}, {listing.country}</span>
              </div>
            </div>

            {/* Share & Wishlist Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => toggleWishlist(listing._id)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold transition-colors ${
                  saved ? 'text-brand border-brand' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-brand text-brand' : ''}`} />
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guest Active Reservation Banner */}
        {myTripOnProperty && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm">You have an active reservation for this stay!</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {new Date(myTripOnProperty.checkIn).toLocaleDateString()} → {new Date(myTripOnProperty.checkOut).toLocaleDateString()} ({myTripOnProperty.nights} nights)
                </p>
              </div>
            </div>
            <Link
              to="/bookings"
              className="py-2 px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-sm hover:bg-emerald-600 transition-colors shrink-0 flex items-center gap-1"
            >
              View My Trip <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Gallery Grid (Airbnb Signature 5-photo layout) */}
        <div className="relative rounded-3xl overflow-hidden mt-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[350px] md:h-[450px]">
            {/* Primary Large Image */}
            <div
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="md:col-span-2 relative h-full cursor-pointer overflow-hidden group"
            >
              <img
                src={images[0]?.url}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* 2nd & 3rd Image */}
            <div className="hidden md:flex flex-col gap-2 h-full">
              <div
                onClick={() => {
                  setLightboxIndex(1 % images.length);
                  setLightboxOpen(true);
                }}
                className="relative h-1/2 cursor-pointer overflow-hidden group"
              >
                <img
                  src={images[1]?.url || images[0]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div
                onClick={() => {
                  setLightboxIndex(2 % images.length);
                  setLightboxOpen(true);
                }}
                className="relative h-1/2 cursor-pointer overflow-hidden group"
              >
                <img
                  src={images[2]?.url || images[0]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* 4th & 5th Image */}
            <div className="hidden md:flex flex-col gap-2 h-full">
              <div
                onClick={() => {
                  setLightboxIndex(3 % images.length);
                  setLightboxOpen(true);
                }}
                className="relative h-1/2 cursor-pointer overflow-hidden group"
              >
                <img
                  src={images[3]?.url || images[0]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div
                onClick={() => {
                  setLightboxIndex(4 % images.length);
                  setLightboxOpen(true);
                }}
                className="relative h-1/2 cursor-pointer overflow-hidden group"
              >
                <img
                  src={images[4]?.url || images[1]?.url || images[0]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            className="absolute bottom-4 right-4 py-2 px-4 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white font-bold text-xs shadow-md hover:scale-105 transition-all border border-black/10"
          >
            Show all {images.length} photos
          </button>
        </div>

        {/* Content & Booking Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Host & Specs Card */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Entire {listing.propertyType || 'Villa'} hosted by {listing.owner?.name || 'Local Host'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {listing.maxGuests || 4} guests • {listing.bedrooms || 2} bedrooms • {listing.beds || 2} beds • {listing.bathrooms || 2} baths
                </p>
              </div>
              <img
                src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={listing.owner?.name || 'Host'}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand/40 shadow-md"
              />
            </div>

            {/* Host Property Management & Guest Reservations Panel (Shown only to Host) */}
            {isHost && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-brand/5 to-transparent border border-amber-500/20 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-glow">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                        Host Property Control Center
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Live bookings placed by travelers on this property
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/my-listings"
                    className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    Host Dashboard
                  </Link>
                </div>

                {/* Host Summary Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bookings</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{propertyReservations.length}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payouts</span>
                    <p className="text-xl font-black text-emerald-500 mt-0.5">${hostTotalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Guest Cap</span>
                    <p className="text-xl font-black text-brand mt-0.5">{listing.maxGuests || 4} guests</p>
                  </div>
                </div>

                {/* List of property reservations */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Guest Reservations on this Stay
                  </h5>
                  {loadingReservations ? (
                    <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ) : propertyReservations.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      No bookings have been placed on this property yet. Your listing is live and ready for guests!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {propertyReservations.map((res) => {
                        const guest = res.user || {};
                        return (
                          <div
                            key={res._id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={guest.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                                alt={guest.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h6 className="font-bold text-xs text-slate-900 dark:text-white truncate">{guest.name || 'Traveler'}</h6>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' : 'bg-slate-100 text-slate-600'}`}>
                                    {res.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  {new Date(res.checkIn).toLocaleDateString()} → {new Date(res.checkOut).toLocaleDateString()} ({res.nights} nights, {res.guests?.adults || 1} guests)
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black text-sm text-slate-900 dark:text-white">${res.totalPrice}</span>
                              <span className="block text-[9px] text-emerald-500 font-bold uppercase">{res.paymentStatus}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Luxury Highlights */}
            <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <Key className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Self check-in</h4>
                  <p className="text-xs text-slate-500">Check yourself in with the smart keypad lock.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {listing.owner?.isSuperhost ? 'Experienced Superhost' : 'Verified Host'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {listing.owner?.name || 'This host'} has 100% 5-star ratings from recent guests.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Free cancellation</h4>
                  <p className="text-xs text-slate-500">Cancel up to 48 hours before check-in for a full refund.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">About this space</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(listing.amenities || ['Fast Wifi', 'Air Conditioning', 'Infinity Pool', 'Chef Kitchen']).map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="pb-6 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Where you'll be</h3>
              <p className="text-xs text-slate-500">{listing.location}, {listing.country}</p>
              
              <div className="h-72 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0">
                <MapContainer
                  center={[lat, lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="w-full h-full z-0"
                >
                  <TileLayer url={tileLayerUrl} />
                  <Circle
                    center={[lat, lng]}
                    radius={600}
                    pathOptions={{ color: '#FF385C', fillColor: '#FF385C', fillOpacity: 0.2 }}
                  />
                </MapContainer>
              </div>
            </div>

            {/* Review Section */}
            <ReviewSection
              listing={listing}
              onReviewAdded={(newReview) => {
                setListing({
                  ...listing,
                  reviews: [newReview, ...(listing.reviews || [])],
                  reviewCount: (listing.reviewCount || 0) + 1,
                });
              }}
              onReviewDeleted={(deletedReviewId) => {
                setListing({
                  ...listing,
                  reviews: (listing.reviews || []).filter((r) => r._id !== deletedReviewId),
                  reviewCount: Math.max(0, (listing.reviewCount || 1) - 1),
                });
              }}
            />
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget
              listing={listing}
              isHost={isHost}
              onBookingCompleted={() => {
                if (isHost) fetchHostReservations();
                else checkMyBookings();
              }}
            />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[lightboxIndex]?.url}
            alt="Fullscreen view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
