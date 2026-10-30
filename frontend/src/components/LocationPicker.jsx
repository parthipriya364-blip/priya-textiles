import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaSearchLocation, FaTimes, FaSearch } from 'react-icons/fa';
import { reverseGeocode, searchLocation, getCurrentLocation } from '../services/nominatimService';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix Leaflet default marker icon issue with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultCenter = {
  lat: 11.0168, // Tamil Nadu center
  lng: 76.9558,
};

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Component to handle map position updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation, onClose }) {
  const [marker, setMarker] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force map re-render on mobile
  const markerRef = useRef(null);
  const searchRef = useRef(null);
  
  // Detect if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        setMapKey(prev => prev + 1); // Force map re-render
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showSearchResults]);

  // Get user's current location
  const handleGetCurrentLocation = useCallback(async () => {
    setLoading(true);
    setAddress(''); // Clear previous address
    
    try {
      console.log('🌍 [Mobile] Requesting current location...');
      console.log('📱 Device:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent)
      });
      
      // Check HTTPS (required for geolocation on modern mobile browsers)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('⚠️ Not using HTTPS - geolocation may not work on mobile');
        alert('Location access requires HTTPS. The site may not work properly over HTTP.');
      }
      
      const position = await getCurrentLocation();
      
      console.log('✅ Got GPS coordinates:', {
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy + ' meters'
      });
      
      const pos = {
        lat: position.lat,
        lng: position.lng,
      };
      
      setMarker(pos);
      console.log('🗺️ Starting reverse geocoding for:', pos);
      
      await handleReverseGeocode(pos);
      
      // Show success message on mobile
      if (isMobile) {
        console.log('✅ Location set successfully on mobile device');
      }
    } catch (error) {
      console.error('❌ Error getting location:', error);
      
      // Mobile-friendly error message
      const isMobileDevice = /Mobile|Android|iPhone/i.test(navigator.userAgent);
      let mobileInstructions = '';
      
      if (isMobileDevice) {
        if (error.code === 1) { // PERMISSION_DENIED
          mobileInstructions = '\n\n📱 On Mobile:\n• Tap the location icon (🔒) in your browser\n• Allow location access\n• Refresh and try again';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          mobileInstructions = '\n\n📱 Tips:\n• Move outside for better GPS signal\n• Turn on WiFi for better accuracy\n• Enable High Accuracy mode in device settings';
        }
      }
      
      alert(error.message + mobileInstructions);
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  // Reverse geocode to get address from coordinates
  const handleReverseGeocode = useCallback(async (location) => {
    try {
      console.log('📍 Reverse geocoding for:', location);
      
      const result = await reverseGeocode(location.lat, location.lng);
      
      console.log('✅ Reverse geocode result:', {
        formattedAddress: result.formattedAddress,
        address: result.address,
        city: result.city,
        state: result.state,
        pincode: result.pincode,
        country: result.country
      });
      
      setAddress(result.formattedAddress);

      // Send location data to parent
      if (onLocationSelect) {
        onLocationSelect({
          lat: result.lat,
          lng: result.lng,
          address: result.address,
          city: result.city,
          state: result.state,
          country: result.country,
          pincode: result.pincode,
          formattedAddress: result.formattedAddress,
        });
      }
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      setAddress('Unable to fetch address for this location. Try clicking on the map again.');
      alert('Could not fetch address for this location. Please try:\n1. Clicking a different area on the map\n2. Searching for your location\n3. Checking your internet connection');
    }
  }, [onLocationSelect]);

  // Handle map click
  const handleMapClick = useCallback((latlng) => {
    const location = {
      lat: latlng.lat,
      lng: latlng.lng,
    };
    setMarker(location);
    handleReverseGeocode(location);
  }, [handleReverseGeocode]);

  // Handle marker drag
  const handleMarkerDrag = useCallback((e) => {
    const latlng = e.target.getLatLng();
    const location = {
      lat: latlng.lat,
      lng: latlng.lng,
    };
    setMarker(location);
    handleReverseGeocode(location);
  }, [handleReverseGeocode]);

  // Handle search input
  const handleSearchInput = useCallback(async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchLocation(query, { 
        limit: 5
        // Removed countrycodes restriction - now searches worldwide
      });
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search result selection
  const handleSelectSearchResult = useCallback((result) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    setMarker(location);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    handleReverseGeocode(location);
  }, [handleReverseGeocode]);

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <h3>📍 Select Delivery Location</h3>
        <div className="location-header-actions">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="btn-current-location"
            disabled={loading}
            aria-label="Use my current location"
          >
            <FaSearchLocation />
            {loading ? (
              <>
                <span className="btn-loading-dots">Getting Location</span>
                <span className="btn-spinner"></span>
              </>
            ) : (
              'Use My Location'
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-close-map"
              title="Close Map"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="location-search" ref={searchRef}>
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
            placeholder="🔍 Search for a location or address..."
            className="location-search-input"
          />
          {searchLoading && <div className="search-spinner"></div>}
        </div>
        
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="search-result-item"
                onClick={() => handleSelectSearchResult(result)}
              >
                <FaMapMarkerAlt className="result-icon" />
                <div className="result-text">
                  <strong>{result.name || result.display_name.split(',')[0]}</strong>
                  <p>{result.display_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          key={mapKey} // Force re-render on mobile/desktop switch
          center={marker || defaultCenter}
          zoom={marker ? 15 : 7}
          style={{ 
            height: isMobile ? '350px' : '400px', 
            width: '100%', 
            borderRadius: '8px',
            touchAction: 'pan-y pinch-zoom' // Better mobile touch handling
          }}
          scrollWheelZoom={!isMobile} // Disable scroll zoom on mobile
          touchZoom={true}
          tap={true}
          dragging={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={3}
          />
          
          {marker && (
            <Marker
              position={marker}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDrag,
              }}
              ref={markerRef}
            />
          )}
          
          <MapClickHandler onMapClick={handleMapClick} />
          <MapUpdater center={marker} zoom={marker ? 15 : 7} />
        </MapContainer>
      </div>

      {address && (
        <div className="selected-location">
          <FaMapMarkerAlt />
          <div>
            <strong>Selected Location:</strong>
            <p>{address}</p>
            {marker && (
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>
                📌 Coordinates: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
              </small>
            )}
          </div>
        </div>
      )}

      <p className="location-hint">
        💡 Click on the map, search for an address, or use your current location. Drag the marker to adjust.
      </p>
    </div>
  );
}
