import useGameStore from '../store/gameStore';
import { getAircraftType } from '../data/aircraft';
import './Sidebar.css';

export default function Sidebar() {
  const {
    fleet,
    routes,
    cash,
    setShowRouteCreator,
    removeRoute,
    purchaseAircraft,
    weeklyRevenue,
    departFlight,
    toggleManualMode,
  } = useGameStore();

  const handlePurchase = (aircraftTypeId) => {
    const type = getAircraftType(aircraftTypeId);
    if (window.confirm(`Purchase ${type.name} for $${(type.price / 1000000).toFixed(1)}M?`)) {
      purchaseAircraft(aircraftTypeId);
    }
  };

  // Available aircraft types based on weekly revenue
  const availableTypes = [
    { id: 'saab340', unlocked: true },
    { id: 'atr42', unlocked: true },
    { id: 'atr72', unlocked: true },
    { id: 'dhc8', unlocked: true },
    { id: 'crj700', unlocked: true },
    { id: 'erj175', unlocked: true },
    { id: 'a320', unlocked: weeklyRevenue >= 10000000 },
    { id: 'b737', unlocked: weeklyRevenue >= 10000000 },
    { id: 'b787', unlocked: weeklyRevenue >= 50000000 },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Routes ({routes.length})</h3>
          <button
            className="add-btn"
            onClick={() => setShowRouteCreator(true)}
            disabled={fleet.filter(a => !a.assignedRoute).length === 0}
          >
            + New Route
          </button>
        </div>

        <div className="routes-list">
          {routes.length === 0 ? (
            <div className="empty-state">
              No routes yet. Create your first route to start earning!
            </div>
          ) : (
            routes.map(route => {
              const statusLabels = {
                'ready': '✈️ Ready',
                'boarding': '👥 Boarding',
                'taxiing': '🛫 Taxiing',
                'enroute': '✈️ Flying',
                'landing': '🛬 Landing',
                'turnaround': '🔄 Turnaround'
              };

              return (
                <div key={route.id} className="route-item">
                  <div className="route-header">
                    <span className="route-name">
                      {route.flightNumber && <span className="flight-number">{route.flightNumber}</span>}
                      {route.origin} → {route.destination}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => removeRoute(route.id)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="route-status">
                    <span className={`aircraft-status status-${route.aircraftStatus || 'ready'}`}>
                      {statusLabels[route.aircraftStatus] || statusLabels.ready}
                    </span>
                    {route.manualMode && route.aircraftStatus === 'ready' && (
                      <button
                        className="depart-btn"
                        onClick={() => departFlight(route.id)}
                      >
                        Depart
                      </button>
                    )}
                    <button
                      className="auto-toggle-btn"
                      onClick={() => toggleManualMode(route.id)}
                      title={route.manualMode ? 'Switch to Auto' : 'Switch to Manual'}
                    >
                      {route.manualMode ? '🎮' : '🤖'}
                    </button>
                  </div>

                  <div className="route-stats">
                    <div className="route-stat">
                      <span className="route-stat-label">Profit</span>
                      <span className={`route-stat-value ${route.profit > 0 ? 'profit' : 'loss'}`}>
                        ${Math.round(route.profit)}/day
                      </span>
                    </div>
                    <div className="route-stat">
                      <span className="route-stat-label">Load</span>
                      <span className="route-stat-value">{route.loadFactor}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Fleet ({fleet.length})</h3>
        </div>

        <div className="fleet-list">
          {fleet.map(aircraft => {
            const type = getAircraftType(aircraft.type);
            return (
              <div key={aircraft.id} className="fleet-item">
                <div className="fleet-header">
                  <span className="fleet-name">{aircraft.name}</span>
                  <span className="fleet-condition">{aircraft.condition}%</span>
                </div>
                <div className="fleet-type">{type.name}</div>
                <div className="fleet-status">
                  {aircraft.assignedRoute ? (
                    <span className="status-active">✓ Active</span>
                  ) : (
                    <span className="status-idle">○ Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="purchase-section">
          <h4>Purchase Aircraft</h4>
          {availableTypes.map(({ id, unlocked }) => {
            const type = getAircraftType(id);
            const canAfford = cash >= type.price;

            return (
              <div key={id} className={`purchase-item ${!unlocked ? 'locked' : ''}`}>
                <div className="purchase-info">
                  <div className="purchase-name">{type.name}</div>
                  <div className="purchase-price">
                    ${(type.price / 1000000).toFixed(1)}M
                  </div>
                </div>
                <button
                  className="purchase-btn"
                  onClick={() => handlePurchase(id)}
                  disabled={!unlocked || !canAfford}
                >
                  {!unlocked ? '🔒 Locked' : canAfford ? 'Buy' : 'Need $'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
