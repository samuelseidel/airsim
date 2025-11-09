import { useState } from 'react';
import Dashboard from './components/Dashboard';
import RouteCreator from './components/RouteCreator';
import Notifications from './components/Notifications';
import WelcomeScreen from './components/WelcomeScreen';
import useGameStore from './store/gameStore';
import useGameLoop from './hooks/useGameLoop';
import useAutoSave from './hooks/useAutoSave';
import './App.css';

function App() {
  useGameLoop();
  useAutoSave();

  const { showRouteCreator } = useGameStore();
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="app">
      <Dashboard />

      <Notifications />
      {showRouteCreator && <RouteCreator />}
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

export default App;
