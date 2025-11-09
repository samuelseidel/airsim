import { useEffect, useRef } from 'react';
import useViralGameStore, { UPGRADES } from '../store/viralGameStore';
import './ViralGame.css';

export default function ViralGame() {
  const {
    money,
    totalEarned,
    planesFlyingCount,
    offlineEarnings,
    showUpgrades,
    upgrades,
    goldenPlanes,
    notifications,
    getTotalPlanes,
    getEarningsPerFlight,
    getUpgradeCost,
    canAffordUpgrade,
    flyPlane,
    buyUpgrade,
    prestige,
    claimOfflineEarnings,
    toggleUpgrades,
    loadGame,
    saveGame,
    getAutoFlyInterval,
  } = useViralGameStore();

  const autoFlyTimerRef = useRef(null);

  // Load game on mount
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame();
    }, 10000);
    return () => clearInterval(interval);
  }, [saveGame]);

  // Auto-fly timer
  useEffect(() => {
    const interval = getAutoFlyInterval();
    if (interval) {
      autoFlyTimerRef.current = setInterval(() => {
        const totalPlanes = getTotalPlanes();
        for (let i = 0; i < totalPlanes; i++) {
          flyPlane();
        }
      }, interval);
    }

    return () => {
      if (autoFlyTimerRef.current) {
        clearInterval(autoFlyTimerRef.current);
      }
    };
  }, [upgrades.autoFly, flyPlane, getAutoFlyInterval, getTotalPlanes]);

  // Handle tap
  const handleTap = () => {
    const earnings = flyPlane();

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Play sound effect (placeholder)
    // You can add actual sound here
  };

  // Format money
  const formatMoney = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${Math.floor(amount)}`;
  };

  const totalPlanes = getTotalPlanes();
  const canPrestige = totalEarned >= 10000000;

  return (
    <div className="viral-game">
      {/* Offline Earnings Popup */}
      {offlineEarnings > 0 && (
        <div className="offline-popup">
          <div className="offline-content">
            <h2>🎉 Welcome Back!</h2>
            <p>You earned while away:</p>
            <div className="offline-amount">{formatMoney(offlineEarnings)}</div>
            <button className="claim-button" onClick={claimOfflineEarnings}>
              CLAIM EARNINGS
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification notification-${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* Money Counter */}
      <div className="money-display">
        <div className="money-amount">{formatMoney(money)}</div>
        {goldenPlanes > 0 && (
          <div className="golden-planes">
            ⭐ {goldenPlanes} Golden Plane{goldenPlanes > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Main Tap Area */}
      <div className="tap-area">
        <div className="globe">🌍</div>

        {/* Planes */}
        <div className="planes-container">
          {Array.from({ length: totalPlanes }).map((_, i) => (
            <button
              key={i}
              className={`plane ${planesFlyingCount > i ? 'flying' : ''} ${goldenPlanes > i ? 'golden' : ''}`}
              onClick={handleTap}
            >
              {goldenPlanes > i ? '⭐' : '✈️'}
            </button>
          ))}
        </div>

        {/* Tap hint */}
        {money < 1000 && (
          <div className="tap-hint">
            👆 Tap planes to fly!
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button
          className="buy-plane-button"
          onClick={() => buyUpgrade('planes')}
          disabled={!canAffordUpgrade('planes')}
        >
          ✈️ BUY PLANE
          <div className="button-cost">{formatMoney(getUpgradeCost('planes'))}</div>
        </button>

        <button className="upgrades-button" onClick={toggleUpgrades}>
          ⬆️ UPGRADES
        </button>

        {canPrestige && (
          <button className="prestige-button" onClick={prestige}>
            ⭐ PRESTIGE
          </button>
        )}
      </div>

      {/* Upgrades Panel */}
      {showUpgrades && (
        <div className="upgrades-overlay" onClick={toggleUpgrades}>
          <div className="upgrades-panel" onClick={(e) => e.stopPropagation()}>
            <div className="upgrades-header">
              <h2>UPGRADES</h2>
              <button className="close-button" onClick={toggleUpgrades}>×</button>
            </div>

            <div className="upgrades-list">
              {Object.entries(UPGRADES).map(([key, upgrade]) => {
                const level = upgrades[key];
                const cost = getUpgradeCost(key);
                const canAfford = canAffordUpgrade(key);
                const maxed = upgrade.maxLevel && level >= upgrade.maxLevel;

                return (
                  <div key={key} className={`upgrade-item ${!canAfford || maxed ? 'disabled' : ''}`}>
                    <div className="upgrade-icon">{upgrade.icon}</div>
                    <div className="upgrade-info">
                      <div className="upgrade-name">
                        {upgrade.name}
                        {upgrade.maxLevel && ` (${level}/${upgrade.maxLevel})`}
                      </div>
                      <div className="upgrade-effect">
                        {key === 'planes' && 'Add +1 plane'}
                        {key === 'speed' && 'Flights 10% faster'}
                        {key === 'earnings' && 'Earn 25% more per flight'}
                        {key === 'autoFly' && 'Planes fly automatically'}
                      </div>
                    </div>
                    <button
                      className="upgrade-buy-button"
                      onClick={() => buyUpgrade(key)}
                      disabled={!canAfford || maxed}
                    >
                      {maxed ? 'MAX' : formatMoney(cost)}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Prestige Info */}
            <div className="prestige-info">
              <h3>⭐ PRESTIGE</h3>
              <p>
                {canPrestige
                  ? 'You can prestige! Reset for 1 Golden Plane (10x multiplier)'
                  : `Earn ${formatMoney(10000000 - totalEarned)} more to unlock prestige`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-display">
        <div>Planes: {totalPlanes}</div>
        <div>Per Flight: {formatMoney(getEarningsPerFlight())}</div>
      </div>
    </div>
  );
}
