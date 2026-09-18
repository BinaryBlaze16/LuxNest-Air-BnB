import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, AlertCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ListingCard from '../components/ListingCard';
import api from '../api';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      setLoading(true);
      try {
        if (wishlist.length === 0) {
          setSavedListings([]);
          setLoading(false);
          return;
        }

        const res = await api.get('/listings');
        if (res.data.success) {
          const filtered = res.data.data.filter((item) => wishlist.includes(item._id));
          setSavedListings(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, [wishlist]);

  return (
    <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
          Your Wishlists
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {wishlist.length} saved propert{wishlist.length === 1 ? 'y' : 'ies'} ready for your next adventure.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[20/19] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && savedListings.length === 0 && (
        <div className="text-center py-20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <Heart className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any listing to save your favorite luxury stays here.
          </p>
          <Link
            to="/"
            className="inline-block py-2.5 px-6 rounded-2xl bg-brand text-white text-xs font-bold shadow-glow"
          >
            Explore luxury stays
          </Link>
        </div>
      )}

      {!loading && savedListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
