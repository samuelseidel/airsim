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
    performMaintenance,
    weeklyRevenue,
    gameTime,
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
            routes.map(route => (
              <div key={route.id} className="route-item">
                <div className="route-header">
                  <span className="route-name">{route.origin} ↔ {route.destination}</span>
                  <button
                    className="delete-btn"
                    onClick={() => removeRoute(route.id)}
                  >
                    ×
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
            ))
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
            const maintenanceCost = type.price * 0.02;
            const needsMaintenance = aircraft.hoursUntilMaintenance <= 0;
            const maintenanceSoon = aircraft.hoursUntilMaintenance <= 50 && aircraft.hoursUntilMaintenance > 0;

            // Calculate time remaining for maintenance
            let maintenanceTimeRemaining = null;
            if (aircraft.inMaintenance && aircraft.maintenanceEndTime) {
              const remainingSeconds = Math.max(0, aircraft.maintenanceEndTime - gameTime);
              const hours = Math.floor(remainingSeconds / 3600);
              const minutes = Math.floor((remainingSeconds % 3600) / 60);
              maintenanceTimeRemaining = `${hours}h ${minutes}m`;
            }

            return (
              <div key={aircraft.id} className={`fleet-item ${needsMaintenance ? 'needs-maintenance' : ''} ${aircraft.inMaintenance ? 'in-maintenance' : ''}`}>
                <div className="fleet-header">
                  <span className="fleet-name">{aircraft.registration}</span>
                  <span className="fleet-condition">{aircraft.condition}%</span>
                </div>
                <div className="fleet-type">{type.name}</div>

                <div className="fleet-maintenance">
                  {aircraft.inMaintenance ? (
                    <>
                      <span className="maintenance-status in-progress">🔧 In Maintenance</span>
                      <span className="maintenance-time">{maintenanceTimeRemaining}</span>
                    </>
                  ) : needsMaintenance ? (
                    <>
                      <span className="maintenance-status required">⚠️ Maintenance Required</span>
                      <button
                        className="maintenance-btn urgent"
                        onClick={() => performMaintenance(aircraft.id)}
                        disabled={cash < maintenanceCost}
                      >
                        Maintain (${(maintenanceCost / 1000).toFixed(0)}k)
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`maintenance-hours ${maintenanceSoon ? 'warning' : ''}`}>
                        {Math.round(aircraft.hoursUntilMaintenance)}h until maintenance
                      </span>
                      {maintenanceSoon && (
                        <button
                          className="maintenance-btn"
                          onClick={() => performMaintenance(aircraft.id)}
                          disabled={cash < maintenanceCost}
                        >
                          Maintain (${(maintenanceCost / 1000).toFixed(0)}k)
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="fleet-status">
                  {aircraft.inMaintenance ? (
                    <span className="status-maintenance">🔧 Maintenance</span>
                  ) : aircraft.assignedRoute ? (
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
