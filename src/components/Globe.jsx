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

      // Calculate altitude based on route progress (parabolic arc)
      const distance = route.distance || 0;
      let maxAltitude;

      // Realistic but visible flight altitudes (much reduced from before)
      if (distance < 1000) {
        maxAltitude = 0.02; // Short-haul: lower arc
      } else if (distance < 3000) {
        maxAltitude = 0.03; // Medium-haul: medium arc
      } else {
        maxAltitude = 0.04; // Long-haul: higher arc
      }

      // Parabolic altitude (highest at midpoint)
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

      // Calculate realistic flight altitude based on distance
      // Using much lower values for a flatter, more realistic arc appearance
      const distance = route.distance || 0;
      let normalizedAltitude;

      if (distance < 1000) {
        normalizedAltitude = 0.02; // Short-haul: lower arc
      } else if (distance < 3000) {
        normalizedAltitude = 0.03; // Medium-haul: medium arc
      } else {
        normalizedAltitude = 0.04; // Long-haul: higher arc but still relatively flat
      }

      // Add slight boost for hover effect
      const finalAltitude = isHovered ? normalizedAltitude * 1.3 : normalizedAltitude;

      return {
        ...route,
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        color: isHovered ? ['#FFD700', '#FFD700'] :
               isProfitable ? ['#00ff88', '#00ff88'] : ['#ff4444', '#ff4444'],
        altitude: finalAltitude,
        stroke: isHovered ? 3 : isProfitable ? 2 : 1.5,
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
        objectThreeObject={d => {
          // Create a small glowing sphere for the plane
          const geometry = new THREE.SphereGeometry(0.3, 16, 16);
          const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.9
          });
          const sphere = new THREE.Mesh(geometry, material);

          // Add a glow effect
          const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          sphere.add(glow);

          return sphere;
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
