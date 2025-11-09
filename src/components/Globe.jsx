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
  const [cameraDistance, setCameraDistance] = useState(300);

  // Get game time for day/night cycle
  const gameTime = useGameStore(state => state.gameTime);

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

    // Track camera distance for zoom-based airport sizing
    const updateCameraDistance = () => {
      if (globeRef.current && globeRef.current.camera()) {
        const camera = globeRef.current.camera();
        const distance = camera.position.length();
        setCameraDistance(distance);
      }
    };

    // Update camera distance on control changes
    controls.addEventListener('change', updateCameraDistance);
    updateCameraDistance(); // Initial update

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

  // Memoize airport data to prevent unnecessary recalculations
  const airportData = useMemo(() => {
    // Calculate size multiplier based on camera distance
    const zoomFactor = Math.max(0.8, Math.min(2, cameraDistance / 250));

    return airports.map(airport => {
      const baseRadius = airport.size === 'large' ? 0.35 : 0.25;
      const radius = baseRadius * zoomFactor;

      return {
        ...airport,
        altitude: 0.01,
        radius: radius,
        color: selectedAirport === airport.id ? '#FFD700' :
               airport.size === 'large' ? '#00ff88' : '#00aaff',
      };
    });
  }, [selectedAirport, cameraDistance]);

  // Memoize route arcs to prevent unnecessary recalculations
  const routeArcs = useMemo(() =>
    routes.map(route => {
      const origin = airports.find(a => a.id === route.origin);
      const destination = airports.find(a => a.id === route.destination);

      if (!origin || !destination) return null;

      const isProfitable = route.profit > 0;
      const isHovered = hoveredRoute === route.id;

      // Calculate realistic flight altitude based on distance
      const distance = route.distance || 0;
      let cruisingAltitudeKm;

      if (distance < 1000) {
        cruisingAltitudeKm = 9; // ~30,000 ft
      } else if (distance < 3000) {
        cruisingAltitudeKm = 10.5; // ~35,000 ft
      } else {
        cruisingAltitudeKm = 11.5; // ~38,000 ft
      }

      const normalizedAltitude = cruisingAltitudeKm / 63;
      const finalAltitude = isHovered ? normalizedAltitude * 1.2 : normalizedAltitude;

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

  // Custom object for rendering airport markers (circle with dot)
  const airportObject = useMemo(() => {
    return (d) => {
      // Create group to hold both circles
      const group = new THREE.Group();

      // Outer ring
      const ringGeometry = new THREE.RingGeometry(d.radius * 0.7, d.radius, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: d.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      group.add(ring);

      // Inner dot
      const dotGeometry = new THREE.CircleGeometry(d.radius * 0.35, 32);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: d.color,
        side: THREE.DoubleSide,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      group.add(dot);

      return group;
    };
  }, []);

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

        // Airport markers using 3D point objects (no HTML overlay!)
        pointsData={airportData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude="altitude"
        pointRadius="radius"
        pointColor="color"
        pointResolution={32}
        pointsMerge={false}
        pointLabel={d => `
          <div class="airport-tooltip">
            <strong>${d.name}</strong><br/>
            ${d.city}, ${d.country}<br/>
            Population: ${d.population.toLocaleString()}
          </div>
        `}
        onPointClick={point => onAirportClick && onAirportClick(point.id)}
        pointThreeObject={airportObject}

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
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}
