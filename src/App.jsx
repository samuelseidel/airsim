import { useState } from 'react';
import Globe from './components/Globe';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
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

  const {
    routes,
    selectedAirport,
    setSelectedAirport,
    showRouteCreator,
  } = useGameStore();

  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="app">
      <Globe
        routes={routes}
        selectedAirport={selectedAirport}
        onAirportClick={setSelectedAirport}
        hoveredRoute={hoveredRoute}
        onRouteClick={(routeId) => console.log('Route clicked:', routeId)}
      />

      <div className="ui-overlay">
        <TopBar />
        <Sidebar />
        <MobileNav />
        <Notifications />
      </div>

      {showRouteCreator && <RouteCreator />}
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

export default App;
