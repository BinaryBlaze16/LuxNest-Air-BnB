import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Custom price pill marker creator
const createPriceMarker = (price, isActive = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="custom-map-marker ${isActive ? 'active' : ''}">$${price}</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });
};

function ChangeMapView({ listings }) {
  const map = useMap();
  useEffect(() => {
    if (listings && listings.length > 0) {
      const validPoints = listings
        .filter((l) => l.geometry?.coordinates && l.geometry.coordinates.length === 2)
        .map((l) => [l.geometry.coordinates[1], l.geometry.coordinates[0]]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [listings, map]);
  return null;
}

export default function MapView({ listings }) {
  const { isDarkMode } = useTheme();

  const validListings = (listings || []).filter(
    (l) => l.geometry?.coordinates && l.geometry.coordinates.length === 2
  );

  const defaultCenter = validListings.length > 0
    ? [validListings[0].geometry.coordinates[1], validListings[0].geometry.coordinates[0]]
    : [36.4618, 25.3753]; // Default Santorini

  const tileLayerUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={3}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileLayerUrl}
        />
        <ChangeMapView listings={validListings} />

        {validListings.map((listing) => {
          const [lng, lat] = listing.geometry.coordinates;
          const imageUrl = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80';

          return (
            <Marker
              key={listing._id}
              position={[lat, lng]}
              icon={createPriceMarker(listing.price)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-56 p-1 text-slate-900 dark:text-slate-100">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-2">
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="truncate">{listing.location}, {listing.country}</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {listing.rating?.toFixed(2) || '5.0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    {listing.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">
                      ${listing.price} <span className="font-normal text-slate-400 text-[10px]">/ night</span>
                    </span>
                    <Link
                      to={`/listings/${listing._id}`}
                      className="px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-semibold hover:bg-brand-dark transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
