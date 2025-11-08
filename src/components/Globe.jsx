import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { airports } from '../data/airports';
import './Globe.css';

export default function GlobeComponent({
  routes = [],
  selectedAirport,
  onAirportClick,
  hoveredRoute,
  onRouteClick
}) {
  const globeRef = useRef();
  const [globeReady, setGlobeReady] = useState(false);

  // Configure camera controls
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 150;
      controls.maxDistance = 500;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.5;
      setGlobeReady(true);
    }
  }, []);

  // Prepare airport markers with size based on airport size
  const airportData = airports.map(airport => ({
    ...airport,
    altitude: 0.01,
    color: selectedAirport === airport.id ? '#FFD700' :
           airport.size === 'large' ? '#00ff88' : '#00aaff',
    size: airport.size === 'large' ? 0.3 : 0.2,
  }));

  // Prepare route arcs
  const routeArcs = routes.map(route => {
    const origin = airports.find(a => a.id === route.origin);
    const destination = airports.find(a => a.id === route.destination);

    if (!origin || !destination) return null;

    const isProfitable = route.profit > 0;
    const isHovered = hoveredRoute === route.id;

    return {
      ...route,
      startLat: origin.lat,
      startLng: origin.lng,
      endLat: destination.lat,
      endLng: destination.lng,
      color: isHovered ? ['#FFD700', '#FFD700'] :
             isProfitable ? ['#00ff88', '#00ff88'] : ['#ff4444', '#ff4444'],
      altitude: isHovered ? 0.4 : 0.3,
      stroke: isHovered ? 3 : isProfitable ? 2 : 1.5,
    };
  }).filter(Boolean);

  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        // Airport markers
        pointsData={airportData}
        pointAltitude="altitude"
        pointColor="color"
        pointRadius="size"
        pointLabel={d => `
          <div class="airport-tooltip">
            <strong>${d.name}</strong><br/>
            ${d.city}, ${d.country}<br/>
            Population: ${d.population.toLocaleString()}
          </div>
        `}
        onPointClick={point => onAirportClick && onAirportClick(point.id)}
        pointsMerge={false}

        // Route arcs
        arcsData={routeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude="altitude"
        arcStroke="stroke"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcsTransitionDuration={300}
        arcLabel={d => `
          <div class="route-tooltip">
            <strong>${d.origin} → ${d.destination}</strong><br/>
            Profit: $${d.profit?.toLocaleString() || 0}/flight<br/>
            Load: ${d.loadFactor || 0}%
          </div>
        `}
        onArcClick={arc => onRouteClick && onRouteClick(arc.id)}

        // Performance optimizations
        rendererConfig={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
}
