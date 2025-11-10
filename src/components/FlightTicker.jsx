import useGameStore from '../store/gameStore';
import './FlightTicker.css';

// Format time in HH:MM format
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format altitude in feet
const formatAltitude = (meters) => {
  const feet = Math.round(meters * 3.28084);
  return feet.toLocaleString();
};

// Format speed in knots
const formatSpeed = (kmh) => {
  const knots = Math.round(kmh * 0.539957);
  return knots;
};

// Get phase display name
const getPhaseDisplay = (phase) => {
  const phaseNames = {
    taxi_takeoff: 'TAXI/TAKEOFF',
    climb: 'CLIMBING',
    cruise: 'CRUISE',
    descent: 'DESCENDING',
    landing: 'LANDING',
    turnaround: 'ON GROUND',
  };
  return phaseNames[phase] || phase.toUpperCase();
};

export default function FlightTicker() {
  const activeFlights = useGameStore(state => state.activeFlights);
  const gameTime = useGameStore(state => state.gameTime);

  // Filter out flights that are in turnaround (on ground)
  const flyingFlights = activeFlights.filter(flight => flight.phase !== 'turnaround');

  if (flyingFlights.length === 0) {
    return null;
  }

  // Duplicate flights for seamless scrolling
  const displayFlights = [...flyingFlights, ...flyingFlights, ...flyingFlights];

  return (
    <div className="flight-ticker">
      <div className="flight-ticker-label">
        ✈️ ACTIVE FLIGHTS
      </div>
      <div className="flight-ticker-track">
        <div className="flight-ticker-content">
          {displayFlights.map((flight, index) => (
            <div key={index} className="flight-ticker-item">
              <span className="flight-registration">{flight.registration}</span>
              <span className="flight-route">{flight.origin} ↔ {flight.destination}</span>
              <span className="flight-phase">{getPhaseDisplay(flight.phase)}</span>
              <span className="flight-speed">{formatSpeed(flight.currentSpeed)} kt</span>
              <span className="flight-altitude">{formatAltitude(flight.currentAltitude)} ft</span>
              <span className="flight-progress">{Math.round(flight.totalProgress)}%</span>
              <span className="flight-departure">DEP {formatTime(flight.departureTime)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
