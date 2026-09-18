import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, profile, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.wishlist) {
      const ids = profile.wishlist.map((item) => (typeof item === 'string' ? item : item._id));
      setWishlist(ids);
    } else if (!user) {
      const local = JSON.parse(localStorage.getItem('luxnest_guest_wishlist') || '[]');
      setWishlist(local);
    }
  }, [user, profile]);

  const toggleWishlist = async (listingId) => {
    if (!user) {
      // Guest mode or prompt login
      let updated;
      if (wishlist.includes(listingId)) {
        updated = wishlist.filter((id) => id !== listingId);
      } else {
        updated = [...wishlist, listingId];
      }
      setWishlist(updated);
      localStorage.setItem('luxnest_guest_wishlist', JSON.stringify(updated));
      return;
    }

    // Optimistic update
    const previous = [...wishlist];
    const isCurrentlySaved = wishlist.includes(listingId);
    const updated = isCurrentlySaved
      ? wishlist.filter((id) => id !== listingId)
      : [...wishlist, listingId];
    
    setWishlist(updated);

    try {
      await api.post(`/users/wishlist/${listingId}`);
    } catch (err) {
      console.error('Failed to toggle wishlist on server:', err);
      // Rollback on error
      setWishlist(previous);
    }
  };

  const isSaved = (listingId) => wishlist.includes(listingId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isSaved, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
