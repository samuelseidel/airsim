import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { airports } from '../data/airports';
import { getAircraftType } from '../data/aircraft';
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
  const [cameraDistance, setCameraDistance] = useState(250); // Track zoom level

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

    // Track camera distance for zoom-responsive sizing
    const updateCameraDistance = () => {
      if (globeRef.current) {
        const camera = globeRef.current.camera();
        const distance = camera.position.length();
        setCameraDistance(distance);
      }
    };

    // Update on control changes
    controls.addEventListener('change', updateCameraDistance);

    // Initial update
    updateCameraDistance();

    // Cleanup function to prevent memory leaks
    return () => {
      controls.removeEventListener('change', updateCameraDistance);
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

    // Very bright directional light (sun) for dramatic day/night
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(sunX, sunY, sunZ);
    sunLight.castShadow = false; // Performance optimization
    scene.add(sunLight);

    // Add a point light at sun position for extra brightness
    const sunPointLight = new THREE.PointLight(0xffffdd, 2.0, 500);
    sunPointLight.position.set(sunX, sunY, sunZ);
    scene.add(sunPointLight);

    // Very dim ambient light to make night side dark
    const ambientLight = new THREE.AmbientLight(0x202040, 0.1);
    scene.add(ambientLight);

    // Subtle hemisphere light for sky effect
    const hemiLight = new THREE.HemisphereLight(0x6688ff, 0x001122, 0.2);
    scene.add(hemiLight);

    // Add atmospheric glow on the day side
    const glowGeometry = new THREE.SphereGeometry(102, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xffdd88) }, // Warm sunrise/sunset glow
        sunPosition: { value: new THREE.Vector3(sunX, sunY, sunZ).normalize() },
      },
      vertexShader: `
        uniform vec3 sunPosition;
        varying float intensity;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 vPosition = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);

          // Calculate intensity based on sun angle
          float sunDot = dot(vNormal, sunPosition);
          intensity = max(0.0, sunDot) * 0.5;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.6);
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
      scene.remove(sunPointLight);
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

      // Determine direction (outbound vs return)
      const isOutbound = progress < 0.5;

      // Interpolate position
      const lat = origin.lat + (destination.lat - origin.lat) * routeProgress;
      const lng = origin.lng + (destination.lng - origin.lng) * routeProgress;

      // Calculate bearing/heading for arrow rotation
      const latDiff = destination.lat - origin.lat;
      const lngDiff = destination.lng - origin.lng;
      // Calculate angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
      let bearing = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
      // Reverse direction if on return flight
      if (!isOutbound) {
        bearing = (bearing + 180) % 360;
      }

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
      // Add small offset to ensure plane is always visible above the arc
      const altitude = maxAltitude * altitudeMultiplier + 0.003;

      // Get aircraft registration and type
      const aircraft = fleet.find(a => a.id === route.aircraftId);
      const aircraftType = aircraft ? getAircraftType(aircraft.type) : null;
      const speed = aircraftType?.speed || 800; // km/h

      return {
        id: route.id,
        lat,
        lng,
        altitude,
        bearing,
        speed,
        registration: aircraft?.registration || 'N/A',
        route: `${route.origin} → ${route.destination}`,
      };
    }).filter(Boolean);

    setPlanePositions(positions);
  }, [routes, gameTime, fleet]);

  // Memoize airport data to prevent unnecessary recalculations
  const airportData = useMemo(() => {
    // Calculate zoom-responsive size multiplier
    // Camera distance ranges from 150 (zoomed in) to 500 (zoomed out)
    // We want larger markers when zoomed out, smaller when zoomed in
    const minDistance = 150;
    const maxDistance = 500;
    const normalizedZoom = (cameraDistance - minDistance) / (maxDistance - minDistance);
    const sizeMultiplier = 1 + normalizedZoom * 2; // 1x at min zoom, 3x at max zoom

    return airports.map(airport => ({
      ...airport,
      altitude: 0.01,
      color: selectedAirport === airport.id ? '#FFD700' :
             airport.size === 'large' ? '#00ff88' : '#00aaff',
      size: (airport.size === 'large' ? 0.3 : 0.2) * sizeMultiplier,
    }));
  }, [selectedAirport, cameraDistance]);

  // Memoize route arcs to prevent unnecessary recalculations
  const routeArcs = useMemo(() =>
    routes.map(route => {
      const origin = airports.find(a => a.id === route.origin);
      const destination = airports.find(a => a.id === route.destination);

      if (!origin || !destination) return null;

      const isHovered = hoveredRoute === route.id;

      // Calculate realistic flight altitude based on distance
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

      // Simple green narrow lines matching UI style
      const routeColor = isHovered ? ['#FFD700', '#FFD700'] : ['#00ff88', '#00ff88'];
      const strokeWidth = isHovered ? 2 : 1;

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
        arcDashLength={0}
        arcDashGap={0}
        arcDashAnimateTime={0}
        arcsTransitionDuration={0}
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
          <div class="plane-tooltip radar-style">
            <div class="radar-header">
              <strong>${d.registration}</strong>
            </div>
            <div class="radar-data">
              <span class="radar-label">SPD:</span> <span class="radar-value">${d.speed} kt</span><br/>
              <span class="radar-label">HDG:</span> <span class="radar-value">${Math.round(d.bearing)}°</span><br/>
              <span class="radar-label">RTE:</span> <span class="radar-value">${d.route}</span>
            </div>
          </div>
        `}
        objectThreeObject={d => {
          // Create 3D cone-shaped plane marker that's visible from all angles
          const group = new THREE.Group();

          // Main cone (arrow/plane shape)
          const coneGeometry = new THREE.ConeGeometry(0.4, 1.2, 8);
          const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: false
          });
          const cone = new THREE.Mesh(coneGeometry, coneMaterial);

          // Rotate cone to point "up" initially (along Y axis)
          cone.rotation.x = 0;

          group.add(cone);

          // Add glowing outline sphere for better visibility
          const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glow);

          // Rotate the entire group to face the bearing direction
          // The bearing is already calculated, we need to rotate the group
          // Convert to radians for Three.js
          const bearingRad = (d.bearing) * (Math.PI / 180);
          group.rotation.z = bearingRad;

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
