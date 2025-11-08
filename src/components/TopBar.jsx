import { useState } from 'react';
import useGameStore from '../store/gameStore';
import './TopBar.css';

export default function TopBar() {
  const {
    cash,
    weeklyRevenue,
    weeklyExpenses,
    gameWeek,
    gameSpeed,
    isPaused,
    setGameSpeed,
    togglePause,
    fleet,
    routes
  } = useGameStore();

  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const activeRoutes = routes.filter(r => r.active).length;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="top-bar">
      <div className="top-bar-section">
        <h1 className="game-title">✈️ AirSim</h1>
      </div>

      <div className="top-bar-section stats">
        <div className="stat">
          <span className="stat-label">Cash</span>
          <span className="stat-value cash">{formatCurrency(cash)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Week {gameWeek}</span>
          <span className={`stat-value ${weeklyProfit >= 0 ? 'profit' : 'loss'}`}>
            {weeklyProfit >= 0 ? '+' : ''}{formatCurrency(weeklyProfit)}/wk
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Fleet</span>
          <span className="stat-value">{fleet.length} aircraft</span>
        </div>
        <div className="stat">
          <span className="stat-label">Routes</span>
          <span className="stat-value">{activeRoutes} active</span>
        </div>
      </div>

      <div className="top-bar-section controls">
        <button
          className={`control-btn ${isPaused ? 'paused' : ''}`}
          onClick={togglePause}
        >
          {isPaused ? '▶️ Play' : '⏸ Pause'}
        </button>

        <div className="speed-controls">
          {[1, 2, 5, 10].map(speed => (
            <button
              key={speed}
              className={`speed-btn ${gameSpeed === speed ? 'active' : ''}`}
              onClick={() => setGameSpeed(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
