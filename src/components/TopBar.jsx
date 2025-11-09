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
    resetGame,
    gameTime,
    fleet
  } = useGameStore();

  const weeklyProfit = weeklyRevenue - weeklyExpenses;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor((seconds / 3600) % 24);
    const minutes = Math.floor((seconds / 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimeIcon = (seconds) => {
    const hours = Math.floor((seconds / 3600) % 24);
    if (hours >= 6 && hours < 12) return '🌅'; // Morning
    if (hours >= 12 && hours < 18) return '☀️'; // Afternoon
    if (hours >= 18 && hours < 21) return '🌆'; // Evening
    return '🌙'; // Night
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the game? This will delete all progress.')) {
      resetGame();
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-section">
        <h1 className="game-title">✈️ AirSim</h1>
      </div>

      <div className="top-bar-section stats">
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{getTimeIcon(gameTime)} {formatTime(gameTime)}</span>
        </div>
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
      </div>

      <div className="top-bar-section controls">
        <button
          className={`control-btn ${isPaused ? 'paused' : ''}`}
          onClick={togglePause}
        >
          {isPaused ? '▶️ Play' : '⏸ Pause'}
        </button>

        <div className="speed-controls">
          {[1, 5, 10, 30, 60].map(speed => (
            <button
              key={speed}
              className={`speed-btn ${gameSpeed === speed ? 'active' : ''}`}
              onClick={() => setGameSpeed(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button
          className="control-btn reset-btn"
          onClick={handleReset}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}
