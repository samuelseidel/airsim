import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { airports, calculateDistance } from '../data/airports';
import { getAircraftType } from '../data/aircraft';
import './RouteCreator.css';

export default function RouteCreator() {
  const {
    fleet,
    createRoute,
    setShowRouteCreator,
    calculateDefaultPrice,
  } = useGameStore();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const availableAircraft = fleet.filter(a => !a.assignedRoute);

  const handleCreate = () => {
    if (!origin || !destination || !selectedAircraft) {
      alert('Please fill all fields');
      return;
    }

    const distance = calculateDistance(
      airports.find(a => a.id === origin).lat,
      airports.find(a => a.id === origin).lng,
      airports.find(a => a.id === destination).lat,
      airports.find(a => a.id === destination).lng
    );

    const price = customPrice ? parseFloat(customPrice) : calculateDefaultPrice(distance);
    createRoute(origin, destination, selectedAircraft, price);
  };

  const getRouteInfo = () => {
    if (!origin || !destination || !selectedAircraft) return null;

    const originAirport = airports.find(a => a.id === origin);
    const destAirport = airports.find(a => a.id === destination);
    const aircraft = fleet.find(a => a.id === selectedAircraft);
    const aircraftType = getAircraftType(aircraft?.type);

    if (!originAirport || !destAirport || !aircraftType) return null;

    const distance = calculateDistance(
      originAirport.lat, originAirport.lng,
      destAirport.lat, destAirport.lng
    );

    const defaultPrice = calculateDefaultPrice(distance);
    const price = customPrice ? parseFloat(customPrice) : defaultPrice;

    const flightHours = distance / aircraftType.speed;
    const canReach = distance <= aircraftType.range;

    return {
      distance: Math.round(distance),
      flightHours: flightHours.toFixed(1),
      defaultPrice,
      price,
      canReach,
      capacity: aircraftType.capacity,
    };
  };

  const routeInfo = getRouteInfo();

  // Get available destinations based on aircraft range
  const getAvailableDestinations = () => {
    if (!origin || !selectedAircraft) {
      // No filtering if origin or aircraft not selected
      return airports.map(airport => ({
        ...airport,
        isReachable: true,
        distance: null,
      }));
    }

    const originAirport = airports.find(a => a.id === origin);
    const aircraft = fleet.find(a => a.id === selectedAircraft);
    const aircraftType = getAircraftType(aircraft?.type);

    if (!originAirport || !aircraftType) return [];

    return airports.map(airport => {
      const distance = calculateDistance(
        originAirport.lat, originAirport.lng,
        airport.lat, airport.lng
      );

      return {
        ...airport,
        distance: Math.round(distance),
        isReachable: distance <= aircraftType.range,
      };
    });
  };

  const availableDestinations = getAvailableDestinations();
  const reachableCount = availableDestinations.filter(d => d.isReachable && d.id !== origin).length;

  return (
    <div className="route-creator-overlay" onClick={() => setShowRouteCreator(false)}>
      <div className="route-creator" onClick={(e) => e.stopPropagation()}>
        <div className="route-creator-header">
          <h2>Create New Route</h2>
          <button className="close-btn" onClick={() => setShowRouteCreator(false)}>×</button>
        </div>

        <div className="route-creator-body">
          <div className="form-group">
            <label>Aircraft</label>
            <select value={selectedAircraft} onChange={(e) => setSelectedAircraft(e.target.value)}>
              <option value="">Select aircraft...</option>
              {availableAircraft.map(aircraft => {
                const type = getAircraftType(aircraft.type);
                return (
                  <option key={aircraft.id} value={aircraft.id}>
                    {aircraft.name} - {type.name} ({type.capacity} seats, {type.range}km range)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Origin Airport</label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">Select origin...</option>
              {airports.map(airport => (
                <option key={airport.id} value={airport.id}>
                  {airport.id} - {airport.name} ({airport.city})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Destination Airport
              {selectedAircraft && origin && (
                <span className="destination-count"> ({reachableCount} reachable)</span>
              )}
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={!origin || !selectedAircraft}
            >
              <option value="">
                {!selectedAircraft ? 'Select aircraft first...' :
                 !origin ? 'Select origin first...' :
                 'Select destination...'}
              </option>
              {availableDestinations
                .filter(airport => airport.isReachable && airport.id !== origin)
                .map(airport => (
                  <option key={airport.id} value={airport.id}>
                    {airport.id} - {airport.name} ({airport.city}) - {airport.distance}km
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ticket Price (optional)</label>
            <input
              type="number"
              placeholder={routeInfo ? `Default: $${routeInfo.defaultPrice}` : 'Auto-calculate'}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
          </div>

          {routeInfo && (
            <div className="route-info">
              <h3>Route Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Distance</span>
                  <span className="info-value">{routeInfo.distance} km</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Flight Time</span>
                  <span className="info-value">{routeInfo.flightHours} hrs</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ticket Price</span>
                  <span className="info-value">${routeInfo.price}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Capacity</span>
                  <span className="info-value">{routeInfo.capacity} seats</span>
                </div>
              </div>
              {!routeInfo.canReach && (
                <div className="warning">⚠️ Aircraft range insufficient for this route!</div>
              )}
            </div>
          )}
        </div>

        <div className="route-creator-footer">
          <button className="btn-secondary" onClick={() => setShowRouteCreator(false)}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!routeInfo || !routeInfo.canReach}
          >
            Create Route
          </button>
        </div>
      </div>
    </div>
  );
}
