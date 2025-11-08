// Major airports with coordinates for the airline simulator
export const airports = [
  // North America
  { id: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, size: 'large', population: 8336817 },
  { id: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', lat: 33.9416, lng: -118.4085, size: 'large', population: 3979576 },
  { id: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, size: 'large', population: 2693976 },
  { id: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', country: 'USA', lat: 32.8998, lng: -97.0403, size: 'large', population: 1343573 },
  { id: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870, size: 'large', population: 467963 },
  { id: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088, size: 'medium', population: 753675 },
  { id: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.3790, size: 'large', population: 873965 },
  { id: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'USA', lat: 39.8561, lng: -104.6737, size: 'medium', population: 715522 },
  { id: 'ATL', name: 'Atlanta Hartsfield', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277, size: 'large', population: 498715 },
  { id: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248, size: 'large', population: 2930000 },
  { id: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815, size: 'medium', population: 675218 },
  { id: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721, size: 'large', population: 9209944 },

  // South America
  { id: 'GRU', name: 'São Paulo Guarulhos', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731, size: 'large', population: 12325232 },
  { id: 'GIG', name: 'Rio de Janeiro Intl', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8099, lng: -43.2505, size: 'large', population: 6748000 },
  { id: 'EZE', name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lng: -58.5358, size: 'large', population: 3075646 },
  { id: 'BOG', name: 'Bogotá El Dorado', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469, size: 'medium', population: 7412566 },
  { id: 'LIM', name: 'Lima Jorge Chávez', city: 'Lima', country: 'Peru', lat: -12.0219, lng: -77.1143, size: 'medium', population: 9674755 },

  // Europe
  { id: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543, size: 'large', population: 9002488 },
  { id: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, size: 'large', population: 2165423 },
  { id: 'FRA', name: 'Frankfurt Main', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, size: 'large', population: 753056 },
  { id: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, size: 'large', population: 872680 },
  { id: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spain', lat: 40.4936, lng: -3.5668, size: 'large', population: 3223334 },
  { id: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389, size: 'large', population: 2872800 },
  { id: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lng: 2.0833, size: 'medium', population: 1636762 },
  { id: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3537, lng: 11.7750, size: 'medium', population: 1471508 },
  { id: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519, size: 'large', population: 15462452 },
  { id: 'SVO', name: 'Moscow Sheremetyevo', city: 'Moscow', country: 'Russia', lat: 55.9726, lng: 37.4146, size: 'large', population: 12506468 },

  // Middle East
  { id: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, size: 'large', population: 3411200 },
  { id: 'DOH', name: 'Doha Hamad Intl', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6080, size: 'large', population: 2382000 },
  { id: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lng: 54.6511, size: 'medium', population: 1483000 },
  { id: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056, size: 'large', population: 9500000 },

  // Asia
  { id: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'China', lat: 22.3080, lng: 113.9185, size: 'large', population: 7496981 },
  { id: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China', lat: 40.0799, lng: 116.6031, size: 'large', population: 21540000 },
  { id: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083, size: 'large', population: 27058479 },
  { id: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929, size: 'large', population: 13960000 },
  { id: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, size: 'large', population: 9776000 },
  { id: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, size: 'large', population: 5850342 },
  { id: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501, size: 'large', population: 10722000 },
  { id: 'DEL', name: 'Delhi Indira Gandhi', city: 'Delhi', country: 'India', lat: 28.5562, lng: 77.1000, size: 'large', population: 30291000 },
  { id: 'BOM', name: 'Mumbai Chhatrapati Shivaji', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656, size: 'large', population: 20411000 },
  { id: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7099, size: 'medium', population: 1768000 },

  // Oceania
  { id: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753, size: 'large', population: 5312163 },
  { id: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne', country: 'Australia', lat: -37.6690, lng: 144.8410, size: 'large', population: 5078193 },
  { id: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lng: 174.7850, size: 'medium', population: 1657200 },

  // Africa
  { id: 'JNB', name: 'Johannesburg O.R. Tambo', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lng: 28.2460, size: 'large', population: 5635127 },
  { id: 'CPT', name: 'Cape Town Intl', city: 'Cape Town', country: 'South Africa', lat: -33.9715, lng: 18.6021, size: 'medium', population: 4617560 },
  { id: 'LOS', name: 'Lagos Murtala Muhammed', city: 'Lagos', country: 'Nigeria', lat: 6.5774, lng: 3.3212, size: 'medium', population: 14368332 },
  { id: 'NBO', name: 'Nairobi Jomo Kenyatta', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lng: 36.9278, size: 'medium', population: 4397073 },
];

// Calculate route demand based on city populations and distance
export function calculateRouteDemand(origin, destination) {
  const originAirport = airports.find(a => a.id === origin);
  const destinationAirport = airports.find(a => a.id === destination);

  if (!originAirport || !destinationAirport) return 0;

  const distance = calculateDistance(
    originAirport.lat, originAirport.lng,
    destinationAirport.lat, destinationAirport.lng
  );

  // Formula: Base_Demand = (Pop_Origin^0.8 × Pop_Destination^0.8) / Distance_km^1.2
  const baseDemand = Math.pow(originAirport.population, 0.8) *
                     Math.pow(destinationAirport.population, 0.8) /
                     Math.pow(distance, 1.2);

  // Normalize to a 0-1000 scale
  return Math.min(1000, Math.round(baseDemand / 1000));
}

// Calculate great circle distance between two points
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}
