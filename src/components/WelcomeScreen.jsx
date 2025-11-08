import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { loadAutoSave, listSaves, loadGame } from '../utils/saveSystem';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onClose }) {
  const { loadGameState, resetGame, addNotification } = useGameStore();
  const [saves, setSaves] = useState([]);
  const [hasAutoSave, setHasAutoSave] = useState(false);

  useEffect(() => {
    // Check for saves
    const loadSavesList = async () => {
      const result = await listSaves();
      if (result.success) {
        setSaves(result.saves);
      }

      // Check for auto-save
      const autoSaveResult = await loadAutoSave();
      setHasAutoSave(autoSaveResult.success);
    };

    loadSavesList();
  }, []);

  const handleNewGame = () => {
    resetGame();
    addNotification('New game started! Create your first route.', 'success');
    onClose();
  };

  const handleLoadAutoSave = async () => {
    const result = await loadAutoSave();
    if (result.success) {
      loadGameState(result.data);
      addNotification('Auto-save loaded!', 'success');
      onClose();
    } else {
      addNotification('Failed to load auto-save', 'error');
    }
  };

  const handleLoadSave = async (saveId) => {
    const result = await loadGame(saveId);
    if (result.success) {
      loadGameState(result.data);
      addNotification('Game loaded!', 'success');
      onClose();
    } else {
      addNotification('Failed to load game', 'error');
    }
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-screen">
        <div className="welcome-header">
          <h1>✈️ AirSim</h1>
          <p className="welcome-subtitle">Build Your Airline Empire</p>
        </div>

        <div className="welcome-body">
          <div className="welcome-section">
            <button className="welcome-btn primary" onClick={handleNewGame}>
              New Game
            </button>

            {hasAutoSave && (
              <button className="welcome-btn" onClick={handleLoadAutoSave}>
                Continue (Auto-save)
              </button>
            )}
          </div>

          {saves.length > 0 && (
            <div className="welcome-section">
              <h3>Load Game</h3>
              <div className="saves-list">
                {saves.map(save => (
                  <div key={save.id} className="save-item" onClick={() => handleLoadSave(save.id)}>
                    <div className="save-name">{save.name}</div>
                    <div className="save-info">
                      Week {save.week} • ${(save.cash / 1000000).toFixed(1)}M
                    </div>
                    <div className="save-date">
                      {new Date(save.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="welcome-section tutorial">
            <h3>Quick Start</h3>
            <ul>
              <li>Click <strong>+ New Route</strong> in the sidebar to create your first route</li>
              <li>Select origin and destination airports from the dropdowns</li>
              <li>Assign one of your aircraft to the route</li>
              <li>Watch your airline grow as routes generate profit!</li>
              <li>Use time controls at the top to speed up or pause the simulation</li>
              <li>Purchase new aircraft as your revenue grows</li>
            </ul>
          </div>
        </div>

        <div className="welcome-footer">
          <p>Time compression: 5x by default • Auto-saves every 30 seconds</p>
        </div>
      </div>
    </div>
  );
}
