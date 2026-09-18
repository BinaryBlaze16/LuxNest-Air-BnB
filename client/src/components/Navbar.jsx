import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, Globe, Menu, User as UserIcon, Moon, Sun, Heart, PlusCircle, LogOut, Calendar, Home, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar({ onOpenSearch, onOpenHost }) {
  const { user, profile, openAuthModal, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHostClick = () => {
    if (!user) {
      openAuthModal('login');
    } else if (onOpenHost) {
      onOpenHost();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand to-rose-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-brand to-rose-600 bg-clip-text text-transparent">
              LuxNest
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 -mt-1">
              Luxury Stays
            </span>
          </div>
        </Link>

        {/* Search Pill (Airbnb Style) */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center divide-x divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 rounded-full py-2 px-3 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-600"
        >
          <span className="px-3.5 text-slate-800 dark:text-slate-200">Anywhere</span>
          <span className="px-3.5 text-slate-800 dark:text-slate-200">Any week</span>
          <span className="pl-3.5 pr-2 text-slate-400 dark:text-slate-500 flex items-center gap-3">
            Add guests
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shadow-glow">
              <Search className="w-3.5 h-3.5" />
            </div>
          </span>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden flex items-center gap-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full py-2 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
        >
          <Search className="w-4 h-4 text-brand" />
          <span>Explore Stays</span>
        </button>

        {/* Right Action Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Host a Home */}
          <button
            onClick={handleHostClick}
            className="hidden lg:flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-brand" />
            <span>Host your home</span>
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-brand transition-colors" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 py-1.5 pl-3 pr-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:shadow-md transition-all duration-200"
            >
              <Menu className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {profile?.avatar || user?.user_metadata?.avatar_url ? (
                <img
                  src={profile?.avatar || user?.user_metadata?.avatar_url}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  {user ? user.email[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {profile?.name || user.user_metadata?.full_name || 'Traveler'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/bookings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-brand" />
                        My Trips & Bookings
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        Wishlist ({wishlist.length})
                      </Link>

                      <Link
                        to="/my-listings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Home className="w-4 h-4 text-emerald-500" />
                        My Properties
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          if (onOpenHost) onOpenHost();
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-amber-500" />
                        Host a New Stay
                      </button>

                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openAuthModal('signup');
                      }}
                      className="w-full text-left px-4 py-2.5 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      Log In
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      Host your home
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
