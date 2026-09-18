import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, Award, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function ListingCard({ listing, showTotalWithTaxes = false }) {
  const { isSaved, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' }];

  const saved = isSaved(listing._id);

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing._id);
  };

  // Pricing calculation
  const nightlyPrice = listing.price;
  const estimatedStayNights = 5;
  const totalPriceBeforeTaxes = nightlyPrice * estimatedStayNights + (listing.cleaningFee || 50) + (listing.serviceFee || 35);

  return (
    <div className="group relative flex flex-col">
      <Link to={`/listings/${listing._id}`} className="block">
        
        {/* Image Carousel Container */}
        <div className="relative aspect-[20/19] w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-300 group-hover:shadow-card-hover">
          <img
            src={images[currentImageIndex]?.url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Guest Favorite / Superhost Badge */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
            {listing.isGuestFavorite && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-md text-xs font-bold text-slate-900 dark:text-white border border-black/5">
                <Sparkles className="w-3.5 h-3.5 text-brand fill-brand" />
                <span>Guest favorite</span>
              </div>
            )}
            {listing.owner?.isSuperhost && !listing.isGuestFavorite && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-md text-xs font-bold text-slate-900 dark:text-white border border-black/5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Superhost</span>
              </div>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-6 h-6 transition-colors duration-200 stroke-[2] ${
                saved
                  ? 'fill-brand text-brand stroke-brand'
                  : 'fill-black/30 text-white stroke-white drop-shadow-md hover:fill-black/50'
              }`}
            />
          </button>

          {/* Carousel Arrows (hover only) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="opacity-0 group-hover:opacity-100 absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md hover:scale-110 hover:bg-white transition-all z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md hover:scale-110 hover:bg-white transition-all z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex
                        ? 'w-4 bg-white shadow-md'
                        : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Details */}
        <div className="mt-3 flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {listing.location}, {listing.country}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900 dark:fill-amber-400 dark:text-amber-400" />
              <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {listing.title}
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            {listing.category} • {listing.propertyType || 'Villa'}
          </p>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-1 text-sm">
            {showTotalWithTaxes ? (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white">
                  ${totalPriceBeforeTaxes.toLocaleString()} total
                </span>
                <span className="text-[11px] text-slate-400 underline">before taxes ({estimatedStayNights} nights)</span>
              </div>
            ) : (
              <>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ${nightlyPrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">night</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
