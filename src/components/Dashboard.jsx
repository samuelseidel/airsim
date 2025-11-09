import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { getAircraftType } from '../data/aircraft';
import './Dashboard.css';

export default function Dashboard() {
  const {
    cash,
    weeklyRevenue,
    fleet,
    routes,
    activeFlights,
    departFlight,
    toggleManualMode,
    removeRoute,
    setShowRouteCreator,
    gameTime,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('flights');

  // Format currency
  const formatMoney = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${Math.floor(amount)}`;
  };

  // Format time remaining
  const formatTimeRemaining = (flight) => {
    const remaining = flight.arrivalTime - gameTime;
    if (remaining <= 0) return 'Arrived';
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate flight progress percentage
  const getFlightProgress = (flight) => {
    const totalDuration = flight.arrivalTime - flight.departureTime;
    const elapsed = gameTime - flight.departureTime;
    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  // Status labels with colors
  const statusConfig = {
    'ready': { label: 'Ready', emoji: '✈️', color: '#00ff88' },
    'boarding': { label: 'Boarding', emoji: '👥', color: '#FFD700' },
    'taxiing': { label: 'Taxiing', emoji: '🛫', color: '#FFA500' },
    'enroute': { label: 'Flying', emoji: '✈️', color: '#00BFFF' },
    'landing': { label: 'Landing', emoji: '🛬', color: '#FFA500' },
    'turnaround': { label: 'Turnaround', emoji: '🔄', color: '#FFD700' }
  };

  // Count active vs available aircraft
  const activeAircraftCount = fleet.filter(a => a.assignedRoute).length;
  const availableAircraftCount = fleet.length - activeAircraftCount;

  return (
    <div className="dashboard">
      {/* Header with Key Metrics */}
      <div className="dashboard-header">
        <div className="company-info">
          <h1>Airline Operations Center</h1>
          <p className="subtitle">Real-time Flight Management Dashboard</p>
        </div>

        <div className="key-metrics">
          <div className="metric-card">
            <div className="metric-label">Cash</div>
            <div className="metric-value cash">{formatMoney(cash)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Weekly Revenue</div>
            <div className="metric-value">{formatMoney(weeklyRevenue)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Fleet</div>
            <div className="metric-value">{fleet.length} Aircraft</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active Routes</div>
            <div className="metric-value">{routes.length} Routes</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          🛫 Active Flights ({activeFlights.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          🗺️ Routes ({routes.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          ✈️ Fleet ({fleet.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => setActiveTab('operations')}
        >
          🎮 Operations
        </button>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* ACTIVE FLIGHTS TAB */}
        {activeTab === 'flights' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Active Flights</h2>
              <span className="panel-subtitle">{activeFlights.length} flights in progress</span>
            </div>

            {activeFlights.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✈️</div>
                <p>No active flights</p>
                <p className="empty-hint">Switch to Routes tab to depart aircraft</p>
              </div>
            ) : (
              <div className="flights-grid">
                {activeFlights.map(flight => {
                  const status = statusConfig[flight.phase] || statusConfig.ready;
                  const progress = getFlightProgress(flight);

                  return (
                    <div key={flight.id} className="flight-card">
                      <div className="flight-header">
                        <div className="flight-number-badge">{flight.flightNumber}</div>
                        <div className="flight-status" style={{ color: status.color }}>
                          {status.emoji} {status.label}
                        </div>
                      </div>

                      <div className="flight-route">
                        <span className="airport">{flight.origin}</span>
                        <span className="route-arrow">→</span>
                        <span className="airport">{flight.destination}</span>
                      </div>

                      <div className="flight-progress-bar">
                        <div
                          className="flight-progress-fill"
                          style={{ width: `${progress}%`, backgroundColor: status.color }}
                        />
                      </div>

                      <div className="flight-details">
                        <div className="flight-detail">
                          <span className="detail-label">Progress</span>
                          <span className="detail-value">{Math.round(progress)}%</span>
                        </div>
                        <div className="flight-detail">
                          <span className="detail-label">ETA</span>
                          <span className="detail-value">{formatTimeRemaining(flight)}</span>
                        </div>
                        <div className="flight-detail">
                          <span className="detail-label">Passengers</span>
                          <span className="detail-value">{flight.passengers}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ROUTES TAB */}
        {activeTab === 'routes' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Routes Overview</h2>
              <button
                className="primary-btn"
                onClick={() => setShowRouteCreator(true)}
                disabled={availableAircraftCount === 0}
              >
                + Create Route
              </button>
            </div>

            {routes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <p>No routes configured</p>
                <p className="empty-hint">Create your first route to start operations</p>
              </div>
            ) : (
              <div className="routes-table">
                <div className="table-header">
                  <div className="table-cell">Route</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Profit/Day</div>
                  <div className="table-cell">Load Factor</div>
                  <div className="table-cell">Mode</div>
                  <div className="table-cell">Actions</div>
                </div>

                {routes.map(route => {
                  const status = statusConfig[route.aircraftStatus] || statusConfig.ready;
                  const canDepart = route.manualMode && route.aircraftStatus === 'ready';

                  return (
                    <div key={route.id} className="table-row">
                      <div className="table-cell route-cell">
                        <div className="flight-number-badge small">{route.flightNumber}</div>
                        <span className="route-path">{route.origin} → {route.destination}</span>
                      </div>

                      <div className="table-cell">
                        <span className="status-badge" style={{
                          backgroundColor: `${status.color}22`,
                          color: status.color,
                          border: `1px solid ${status.color}`
                        }}>
                          {status.emoji} {status.label}
                        </span>
                      </div>

                      <div className="table-cell">
                        <span className={route.profit > 0 ? 'profit' : 'loss'}>
                          {formatMoney(route.profit)}/day
                        </span>
                      </div>

                      <div className="table-cell">
                        <span className="load-factor">{route.loadFactor}%</span>
                      </div>

                      <div className="table-cell">
                        <button
                          className="mode-toggle-btn"
                          onClick={() => toggleManualMode(route.id)}
                          title={route.manualMode ? 'Switch to Auto' : 'Switch to Manual'}
                        >
                          {route.manualMode ? '🎮 Manual' : '🤖 Auto'}
                        </button>
                      </div>

                      <div className="table-cell actions-cell">
                        {canDepart && (
                          <button
                            className="depart-btn"
                            onClick={() => departFlight(route.id)}
                          >
                            Depart
                          </button>
                        )}
                        <button
                          className="delete-btn-small"
                          onClick={() => removeRoute(route.id)}
                          title="Remove route"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FLEET TAB */}
        {activeTab === 'fleet' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Fleet Overview</h2>
              <div className="fleet-summary">
                <span className="summary-badge active">{activeAircraftCount} Active</span>
                <span className="summary-badge available">{availableAircraftCount} Available</span>
              </div>
            </div>

            {fleet.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✈️</div>
                <p>No aircraft in fleet</p>
                <p className="empty-hint">Purchase aircraft to start operations</p>
              </div>
            ) : (
              <div className="fleet-grid">
                {fleet.map(aircraft => {
                  const type = getAircraftType(aircraft.type);
                  const assignedRoute = routes.find(r => r.id === aircraft.assignedRoute);

                  return (
                    <div key={aircraft.id} className="aircraft-card">
                      <div className="aircraft-header">
                        <h3 className="aircraft-name">{aircraft.name}</h3>
                        <div className={`aircraft-status-badge ${aircraft.assignedRoute ? 'active' : 'idle'}`}>
                          {aircraft.assignedRoute ? '✓ Active' : '○ Available'}
                        </div>
                      </div>

                      <div className="aircraft-type">{type.name}</div>

                      <div className="aircraft-stats">
                        <div className="stat-item">
                          <span className="stat-label">Condition</span>
                          <span className="stat-value condition">{aircraft.condition}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Capacity</span>
                          <span className="stat-value">{type.capacity} pax</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Range</span>
                          <span className="stat-value">{type.range} km</span>
                        </div>
                      </div>

                      {assignedRoute && (
                        <div className="aircraft-assignment">
                          <span className="assignment-label">Assigned to:</span>
                          <span className="assignment-route">
                            {assignedRoute.flightNumber} ({assignedRoute.origin}→{assignedRoute.destination})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OPERATIONS TAB */}
        {activeTab === 'operations' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2>Operations Control</h2>
              <span className="panel-subtitle">Manual flight management</span>
            </div>

            <div className="operations-grid">
              <div className="operations-card">
                <h3>Ready for Departure</h3>
                <div className="ready-flights-list">
                  {routes.filter(r => r.manualMode && r.aircraftStatus === 'ready').length === 0 ? (
                    <p className="empty-hint">No aircraft ready for manual departure</p>
                  ) : (
                    routes
                      .filter(r => r.manualMode && r.aircraftStatus === 'ready')
                      .map(route => (
                        <div key={route.id} className="ready-flight-item">
                          <div className="ready-flight-info">
                            <div className="flight-number-badge">{route.flightNumber}</div>
                            <span>{route.origin} → {route.destination}</span>
                          </div>
                          <button
                            className="depart-btn large"
                            onClick={() => departFlight(route.id)}
                          >
                            Depart Flight
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="operations-card">
                <h3>Quick Stats</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <div className="quick-stat-value">{activeFlights.length}</div>
                    <div className="quick-stat-label">Flights in Air</div>
                  </div>
                  <div className="quick-stat">
                    <div className="quick-stat-value">
                      {routes.filter(r => r.manualMode).length}
                    </div>
                    <div className="quick-stat-label">Manual Routes</div>
                  </div>
                  <div className="quick-stat">
                    <div className="quick-stat-value">
                      {routes.filter(r => !r.manualMode).length}
                    </div>
                    <div className="quick-stat-label">Auto Routes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
