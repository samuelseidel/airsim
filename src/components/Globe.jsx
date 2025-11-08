import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { airports } from '../data/airports';
import useGameStore from '../store/gameStore';
import './Globe.css';

export default function GlobeComponent({
  routes = [],
  selectedAirport,
  onAirportClick,
  hoveredRoute,
  onRouteClick
}) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [planePositions, setPlanePositions] = useState([]);

  // Get game time for day/night cycle and active routes
  const gameTime = useGameStore(state => state.gameTime);
  const fleet = useGameStore(state => state.fleet);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure camera controls with cleanup
  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 150;
    controls.maxDistance = 500;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    // Cleanup function to prevent memory leaks
    return () => {
      if (controls && controls.dispose) {
        controls.dispose();
      }
    };
  }, []);

  // Setup realistic day/night lighting
  useEffect(() => {
    if (!globeRef.current) return;

    const scene = globeRef.current.scene();
    const camera = globeRef.current.camera();

    // Remove existing lights
    const existingLights = scene.children.filter(child => child.isLight);
    existingLights.forEach(light => scene.remove(light));

    // Calculate sun position based on game time
    // Game time is in seconds, convert to hours
    const hours = (gameTime / 3600) % 24;
    const sunAngle = (hours / 24) * Math.PI * 2 - Math.PI / 2; // 0 hours = midnight

    // Sun position (directional light)
    const sunDistance = 300;
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = 50; // Keep sun slightly above equator
    const sunZ = Math.sin(sunAngle) * sunDistance;

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(sunX, sunY, sunZ);
    scene.add(sunLight);

    // Ambient light (soft fill light for dark side)
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    scene.add(ambientLight);

    // Hemisphere light (sky and ground light)
    const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.4);
    scene.add(hemiLight);

    // Add subtle atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(102, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x88ccff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.3);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    // Cleanup
    return () => {
      scene.remove(sunLight);
      scene.remove(ambientLight);
      scene.remove(hemiLight);
      scene.remove(glowMesh);
      glowGeometry.dispose();
      glowMaterial.dispose();
    };
  }, [gameTime]); // Update lighting when game time changes

  // Calculate plane positions along routes
  useEffect(() => {
    if (!routes || routes.length === 0) {
      setPlanePositions([]);
      return;
    }

    const activeRoutes = routes.filter(r => r.active);

    const positions = activeRoutes.map(route => {
      const origin = airports.find(a => a.id === route.origin);
      const destination = airports.find(a => a.id === route.destination);

      if (!origin || !destination) return null;

      // Calculate flight duration in seconds
      const flightDurationSeconds = (route.distance / 800) * 3600; // Assuming avg speed 800 km/h

      // Calculate how many times the flight has completed
      const cycleTime = flightDurationSeconds * 2; // Round trip time
      const progress = (gameTime % cycleTime) / cycleTime;

      // Calculate position along the route (0 to 1)
      let routeProgress;
      if (progress < 0.5) {
        // Outbound flight
        routeProgress = progress * 2;
      } else {
        // Return flight (reverse direction)
        routeProgress = 1 - ((progress - 0.5) * 2);
      }

      // Interpolate position
      const lat = origin.lat + (destination.lat - origin.lat) * routeProgress;
      const lng = origin.lng + (destination.lng - origin.lng) * routeProgress;

      // Calculate altitude based on route progress (nearly flat, realistic)
      const distance = route.distance || 0;
      let maxAltitude;

      // Very low altitudes to match realistic flight paths
      if (distance < 1000) {
        maxAltitude = 0.005; // Short-haul: very low, almost flat
      } else if (distance < 3000) {
        maxAltitude = 0.008; // Medium-haul: slightly higher but still nearly flat
      } else {
        maxAltitude = 0.01; // Long-haul: barely visible arc
      }

      // Gentle parabolic altitude (highest at midpoint but very subtle)
      const altitudeMultiplier = Math.sin(routeProgress * Math.PI);
      const altitude = maxAltitude * altitudeMultiplier;

      // Get aircraft registration
      const aircraft = fleet.find(a => a.id === route.aircraftId);

      return {
        id: route.id,
        lat,
        lng,
        altitude,
        registration: aircraft?.registration || 'N/A',
        route: `${route.origin} → ${route.destination}`,
      };
    }).filter(Boolean);

    setPlanePositions(positions);
  }, [routes, gameTime, fleet]);

  // Memoize airport data to prevent unnecessary recalculations
  const airportData = useMemo(() =>
    airports.map(airport => ({
      ...airport,
      altitude: 0.01,
      color: selectedAirport === airport.id ? '#FFD700' :
             airport.size === 'large' ? '#00ff88' : '#00aaff',
      size: airport.size === 'large' ? 0.3 : 0.2,
    }))
  , [selectedAirport]);

  // Memoize route arcs to prevent unnecessary recalculations
  const routeArcs = useMemo(() =>
    routes.map(route => {
      const origin = airports.find(a => a.id === route.origin);
      const destination = airports.find(a => a.id === route.destination);

      if (!origin || !destination) return null;

      const isProfitable = route.profit > 0;
      const isHovered = hoveredRoute === route.id;
      const isActive = route.active;

      // Calculate realistic flight altitude based on distance
      // Real commercial flights: ~35,000-42,000 ft (10-13 km)
      // Earth radius: 6,371 km, Globe radius: 100 units
      // Normalized: (10-13 km / 6371 km) * 100 = 0.15-0.20 units
      // Using very small values for almost flat, realistic appearance
      const distance = route.distance || 0;
      let normalizedAltitude;

      if (distance < 1000) {
        normalizedAltitude = 0.005; // Short-haul: very low, almost flat
      } else if (distance < 3000) {
        normalizedAltitude = 0.008; // Medium-haul: slightly higher but still nearly flat
      } else {
        normalizedAltitude = 0.01; // Long-haul: barely visible arc
      }

      // Add slight boost for hover effect
      const finalAltitude = isHovered ? normalizedAltitude * 1.5 : normalizedAltitude;

      // Bright, clear colors for all routes
      let routeColor;
      let strokeWidth;

      if (isHovered) {
        // Golden for hovered
        routeColor = ['#FFD700', '#FFD700'];
        strokeWidth = 4;
      } else if (isActive) {
        // Bright colors for active routes
        routeColor = isProfitable ? ['#00ff88', '#00ff88'] : ['#ff4444', '#ff4444'];
        strokeWidth = 2.5;
      } else {
        // Still visible but dimmer for inactive routes
        routeColor = isProfitable ? ['#00aa55', '#00aa55'] : ['#aa2222', '#aa2222'];
        strokeWidth = 1.5;
      }

      return {
        ...route,
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        color: routeColor,
        altitude: finalAltitude,
        stroke: strokeWidth,
      };
    }).filter(Boolean)
  , [routes, hoveredRoute]);


  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.15}

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

        // Plane markers
        objectsData={planePositions}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="altitude"
        objectLabel={d => `
          <div class="plane-tooltip">
            <strong>${d.registration}</strong><br/>
            ${d.route}
          </div>
        `}
        objectThreeObject={() => {
          // Create a simple, clean plane marker
          const group = new THREE.Group();

          // Core plane marker (bright golden sphere)
          const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
          const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: false,
            opacity: 1
          });
          const core = new THREE.Mesh(coreGeometry, coreMaterial);
          group.add(core);

          // Add a subtle static glow
          const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.4
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glow);

          // Add a larger outer glow for visibility
          const outerGlowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
          const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.2
          });
          const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
          group.add(outerGlow);

          return group;
        }}

        // Performance optimizations
        rendererConfig={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}
