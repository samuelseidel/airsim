import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { getAircraftType } from '../data/aircraft';
import './MobileNav.css';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('routes');

  const {
    fleet,
    routes,
    cash,
    setShowRouteCreator,
    removeRoute,
    purchaseAircraft,
    resetGame,
    weeklyRevenue,
  } = useGameStore();

  const handlePurchase = (aircraftTypeId) => {
    const type = getAircraftType(aircraftTypeId);
    if (window.confirm(`Purchase ${type.name} for $${(type.price / 1000000).toFixed(1)}M?`)) {
      purchaseAircraft(aircraftTypeId);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the game? This will delete all progress.')) {
      resetGame();
      setIsOpen(false);
    }
  };

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
    <>
      {/* Bottom navigation for mobile */}
      <div className="mobile-nav-container">
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {isOpen && (
          <div className="mobile-sheet-overlay" onClick={() => setIsOpen(false)}>
            <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
              {/* Tabs */}
              <div className="mobile-tabs">
                <button
                  className={`mobile-tab ${activeTab === 'routes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('routes')}
                >
                  Routes
                </button>
                <button
                  className={`mobile-tab ${activeTab === 'fleet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fleet')}
                >
                  Fleet
                </button>
                <button
                  className="mobile-tab reset-tab"
                  onClick={handleReset}
                >
                  🔄 Reset
                </button>
              </div>

              {/* Content */}
              <div className="mobile-content">
                {activeTab === 'routes' && (
                  <div className="mobile-section">
                    <div className="mobile-section-header">
                      <h3>Routes ({routes.length})</h3>
                      <button
                        className="mobile-add-btn"
                        onClick={() => {
                          setShowRouteCreator(true);
                          setIsOpen(false);
                        }}
                        disabled={fleet.filter(a => !a.assignedRoute).length === 0}
                      >
                        + New
                      </button>
                    </div>

                    {routes.length === 0 ? (
                      <div className="mobile-empty">
                        No routes yet. Tap "+ New" to create your first route!
                      </div>
                    ) : (
                      <div className="mobile-list">
                        {routes.map(route => (
                          <div key={route.id} className="mobile-route-item">
                            <div className="mobile-route-header">
                              <span className="mobile-route-name">{route.origin} ↔ {route.destination}</span>
                              <button
                                className="mobile-delete-btn"
                                onClick={() => removeRoute(route.id)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="mobile-route-stats">
                              <div className="mobile-stat">
                                <span className="mobile-stat-label">Profit</span>
                                <span className={`mobile-stat-value ${route.profit > 0 ? 'profit' : 'loss'}`}>
                                  ${Math.round(route.profit)}/day
                                </span>
                              </div>
                              <div className="mobile-stat">
                                <span className="mobile-stat-label">Load</span>
                                <span className="mobile-stat-value">{route.loadFactor}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'fleet' && (
                  <div className="mobile-section">
                    <div className="mobile-section-header">
                      <h3>Fleet ({fleet.length})</h3>
                    </div>

                    <div className="mobile-list">
                      {fleet.map(aircraft => {
                        const type = getAircraftType(aircraft.type);
                        return (
                          <div key={aircraft.id} className="mobile-fleet-item">
                            <div className="mobile-fleet-header">
                              <span className="mobile-fleet-name">{aircraft.name}</span>
                              <span className="mobile-fleet-condition">{aircraft.condition}%</span>
                            </div>
                            <div className="mobile-fleet-type">{type.name}</div>
                            <div className="mobile-fleet-status">
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

                    <div className="mobile-purchase-section">
                      <h4>Purchase Aircraft</h4>
                      {availableTypes.map(({ id, unlocked }) => {
                        const type = getAircraftType(id);
                        const canAfford = cash >= type.price;

                        return (
                          <div key={id} className={`mobile-purchase-item ${!unlocked ? 'locked' : ''}`}>
                            <div className="mobile-purchase-info">
                              <div className="mobile-purchase-name">{type.name}</div>
                              <div className="mobile-purchase-price">
                                ${(type.price / 1000000).toFixed(1)}M
                              </div>
                            </div>
                            <button
                              className="mobile-purchase-btn"
                              onClick={() => handlePurchase(id)}
                              disabled={!unlocked || !canAfford}
                            >
                              {!unlocked ? '🔒' : canAfford ? 'Buy' : 'Need $'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
