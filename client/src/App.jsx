import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SearchModal from './components/SearchModal';
import HostListingModal from './components/HostListingModal';

// Pages
import Home from './pages/Home';
import ListingDetails from './pages/ListingDetails';
import Bookings from './pages/Bookings';
import MyListings from './pages/MyListings';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

export default function App() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Navigation Header */}
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenHost={() => setHostModalOpen(true)}
      />

      {/* Main Routed Page Content */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                searchModalOpen={searchModalOpen}
                setSearchModalOpen={setSearchModalOpen}
                hostModalOpen={hostModalOpen}
                setHostModalOpen={setHostModalOpen}
              />
            }
          />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={(searchData) => {
          // Handled via URL/state in Home
        }}
      />
      <HostListingModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
