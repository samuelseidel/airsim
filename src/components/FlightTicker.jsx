import useGameStore from '../store/gameStore';
import './FlightTicker.css';

export default function FlightTicker() {
  const routes = useGameStore(state => state.routes);
  const fleet = useGameStore(state => state.fleet);

  // Get active flights
  const activeFlights = routes
    .filter(route => route.active)
    .map(route => {
      const aircraft = fleet.find(a => a.id === route.aircraftId);
      return {
        registration: aircraft?.registration || 'N/A',
        route: `${route.origin} → ${route.destination}`,
      };
    });

  if (activeFlights.length === 0) {
    return null;
  }

  // Duplicate flights for seamless scrolling
  const displayFlights = [...activeFlights, ...activeFlights, ...activeFlights];

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
              <span className="flight-route">{flight.route}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
