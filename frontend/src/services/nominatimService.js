/**
 * Nominatim Service - OpenStreetMap Geocoding
 * Free, open-source geocoding with no API key required
 * Documentation: https://nominatim.org/release-docs/latest/api/
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const REQUEST_DELAY = 1000; // 1 second between requests (Nominatim fair use policy)
let lastRequestTime = 0;

// Rate limiter to respect Nominatim's usage policy
const rateLimit = () => {
  return new Promise((resolve) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_DELAY) {
      setTimeout(() => {
        lastRequestTime = Date.now();
        resolve();
      }, REQUEST_DELAY - timeSinceLastRequest);
    } else {
      lastRequestTime = now;
      resolve();
    }
  });
};

/**
 * Search for a location by address (Forward Geocoding)
 * @param {string} query - Free-form search query
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Array of location results
 */
export async function searchLocation(query, options = {}) {
  try {
    await rateLimit();
    
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      addressdetails: '1',
      limit: options.limit || '5',
      // Allow worldwide search - no country restriction by default
      // Optionally pass countrycodes in options to restrict to specific countries
      ...(options.countrycodes ? { countrycodes: options.countrycodes } : {}),
      ...options
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PriyaTextiles-ECommerce/1.0' // Identify your app
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
}

/**
 * Reverse geocoding - Get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Location details with address components
 */
export async function reverseGeocode(lat, lng, options = {}) {
  try {
    await rateLimit();
    
    // Use zoom level 16 for better balance between accuracy and coverage
    // 18 is too detailed and may miss buildings/streets
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: options.zoom || '16', // Balanced zoom level
      'accept-language': 'en', // Force English for consistency
      namedetails: '1', // Get name details
      extratags: '1' // Get extra tags for better address parsing
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PriyaTextiles-ECommerce/1.0',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Extract and normalize address components
    const address = data.address || {};
    
    // Log for debugging
    console.log('Nominatim Response:', {
      coordinates: { lat, lng },
      display_name: data.display_name,
      address: address,
      type: data.type,
      class: data.class
    });
    
    return {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      formattedAddress: data.display_name || '',
      address: buildAddress(address),
      city: extractCity(address),
      state: extractState(address),
      country: address.country || '',
      pincode: address.postcode || '',
      addressComponents: address,
      locationType: data.type,
      locationClass: data.class,
      raw: data
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}

/**
 * Build a clean address string from components
 * @param {Object} addressComponents - Address components from Nominatim
 * @returns {string} Formatted address
 */
function buildAddress(addressComponents) {
  // Try to build the most specific address possible
  const parts = [
    addressComponents.house_number,
    addressComponents.road || addressComponents.street,
    addressComponents.neighbourhood || addressComponents.suburb || addressComponents.residential,
    addressComponents.hamlet || addressComponents.village,
  ].filter(Boolean);
  
  // If we have specific parts, use them
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  // Otherwise, try to get a meaningful address from other fields
  const fallbackParts = [
    addressComponents.building,
    addressComponents.amenity,
    addressComponents.commercial,
    addressComponents.industrial,
  ].filter(Boolean);
  
  return fallbackParts.length > 0 ? fallbackParts.join(', ') : '';
}

/**
 * Extract city name from address components
 * Nominatim can return city in different fields
 * @param {Object} addressComponents - Address components from Nominatim
 * @returns {string} City name
 */
function extractCity(addressComponents) {
  return (
    addressComponents.city ||
    addressComponents.town ||
    addressComponents.village ||
    addressComponents.municipality ||
    addressComponents.county ||
    addressComponents.state_district ||
    ''
  );
}

/**
 * Extract state from address components with fallback
 * @param {Object} addressComponents - Address components from Nominatim
 * @returns {string} State name
 */
function extractState(addressComponents) {
  return (
    addressComponents.state ||
    addressComponents['ISO3166-2-lvl4'] ||
    addressComponents.region ||
    ''
  );
}

/**
 * Structured search with separate address components
 * @param {Object} addressParts - Structured address parts
 * @returns {Promise<Array>} Array of location results
 */
export async function structuredSearch(addressParts) {
  try {
    await rateLimit();
    
    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      limit: '5',
      ...addressParts // { street, city, state, country, postalcode }
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PriyaTextiles-ECommerce/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in structured search:', error);
    throw error;
  }
}

/**
 * Get current user location using browser Geolocation API
 * Optimized for mobile devices
 * @returns {Promise<Object>} Current location coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      reject(new Error('Geolocation is not supported by your browser. Please use the search or click on the map.'));
      return;
    }

    console.log('📱 Requesting geolocation permission...');

    // Success callback
    const successCallback = (position) => {
      console.log('✅ Geolocation success:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      
      resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    };

    // Error callback
    const errorCallback = (error) => {
      console.error('❌ Geolocation error:', error);
      
      let errorMessage = 'Unable to get your location';
      let userFriendlyMessage = '';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied';
          userFriendlyMessage = 'Please allow location access in your browser settings, then try again.';
          console.error('🚫 Permission denied - User blocked location');
          break;
          
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable';
          userFriendlyMessage = 'Your device cannot determine your location. Try:\n• Moving to an area with better GPS signal\n• Enabling location services on your device\n• Using WiFi for better accuracy';
          console.error('📍 Position unavailable - GPS not working');
          break;
          
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          userFriendlyMessage = 'Location request timed out. Try:\n• Waiting for GPS signal\n• Moving outside for better signal\n• Using the search instead';
          console.error('⏱️ Timeout - GPS taking too long');
          break;
          
        default:
          errorMessage = 'Unknown location error';
          userFriendlyMessage = 'Could not get your location. Please use the search or click on the map.';
          console.error('❓ Unknown geolocation error:', error);
      }
      
      const finalError = new Error(userFriendlyMessage || errorMessage);
      finalError.code = error.code;
      reject(finalError);
    };

    // Geolocation options - optimized for mobile
    const options = {
      enableHighAccuracy: true,  // Use GPS for better accuracy
      timeout: 15000,            // Increased to 15 seconds for mobile
      maximumAge: 0              // Don't use cached position
    };

    console.log('🔍 Calling navigator.geolocation.getCurrentPosition...');
    
    // Request current position
    try {
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    } catch (err) {
      console.error('❌ Exception calling getCurrentPosition:', err);
      reject(new Error('Failed to request location. Please try again or use search.'));
    }
  });
}

/**
 * Cache for recent searches to reduce API calls
 */
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cached search wrapper
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Cached or fresh results
 */
export async function cachedSearch(query, options = {}) {
  const cacheKey = `${query}-${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const results = await searchLocation(query, options);
  searchCache.set(cacheKey, {
    data: results,
    timestamp: Date.now()
  });
  
  return results;
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      searchCache.delete(key);
    }
  }
}, CACHE_DURATION);

export default {
  searchLocation,
  reverseGeocode,
  structuredSearch,
  getCurrentLocation,
  cachedSearch
};
