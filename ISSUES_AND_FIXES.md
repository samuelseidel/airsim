# AirSim - Common Issues Analysis & Fixes

## Critical Issues Found

Based on research of common errors in react-globe.gl, Three.js, Zustand, and IndexedDB implementations, here are the issues identified in our codebase:

---

## 🔴 CRITICAL ISSUES

### 1. **Globe Component - Memory Leaks** (src/components/Globe.jsx)

**Problem:**
- No cleanup function for Three.js objects
- Globe controls configured but never cleaned up
- Could cause memory leaks when component unmounts
- `globeReady` state set but never used

**Evidence from Research:**
- Three.js objects must be disposed manually or they remain in GPU memory
- react-globe.gl controls() creates OrbitControls that need cleanup

**Current Code (Lines 17-28):**
```javascript
useEffect(() => {
  if (globeRef.current) {
    const controls = globeRef.current.controls();
    controls.enableDamping = true;
    // ... more settings
    setGlobeReady(true);
  }
}, []); // NO CLEANUP!
```

**Fix:**
```javascript
useEffect(() => {
  if (!globeRef.current) return;

  const controls = globeRef.current.controls();
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 150;
  controls.maxDistance = 500;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.5;

  // Cleanup function
  return () => {
    if (controls) {
      controls.dispose();
    }
  };
}, []);
```

---

### 2. **Globe Component - Performance Issues** (src/components/Globe.jsx)

**Problem:**
- Creates new arrays on EVERY render (airportData, routeArcs)
- This triggers unnecessary re-renders in react-globe.gl
- Causes performance degradation with many routes

**Current Code (Lines 31-60):**
```javascript
// Runs on EVERY render!
const airportData = airports.map(airport => ({ ... }));
const routeArcs = routes.map(route => { ... });
```

**Fix:**
Use `useMemo` to memoize these calculations:

```javascript
const airportData = useMemo(() =>
  airports.map(airport => ({
    ...airport,
    altitude: 0.01,
    color: selectedAirport === airport.id ? '#FFD700' :
           airport.size === 'large' ? '#00ff88' : '#00aaff',
    size: airport.size === 'large' ? 0.3 : 0.2,
  }))
, [selectedAirport]);

const routeArcs = useMemo(() =>
  routes.map(route => {
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
  }).filter(Boolean)
, [routes, hoveredRoute]);
```

---

### 3. **Globe Component - No Resize Handler** (src/components/Globe.jsx)

**Problem:**
- Uses hardcoded `window.innerWidth` and `window.innerHeight`
- Won't respond to window resize events
- Common issue in Three.js applications

**Current Code (Lines 112-113):**
```javascript
width={window.innerWidth}
height={window.innerHeight}
```

**Fix:**
Add window resize listener:

```javascript
const [dimensions, setDimensions] = useState({
  width: window.innerWidth,
  height: window.innerHeight
});

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

// Then use:
width={dimensions.width}
height={dimensions.height}
```

---

## 🟡 HIGH PRIORITY ISSUES

### 4. **useAutoSave - Excessive Re-renders** (src/hooks/useAutoSave.js)

**Problem:**
- `const gameState = useGameStore()` gets the ENTIRE store
- Causes useEffect to run on EVERY state change
- Debounce mechanism recreates on every change = broken debouncing

**Evidence from Research:**
- Zustand best practice: use selectors to subscribe only to needed state
- Getting entire store is a common mistake

**Current Code (Line 9):**
```javascript
const gameState = useGameStore(); // BAD - subscribes to EVERYTHING
```

**Fix:**
Use Zustand selectors:

```javascript
export default function useAutoSave() {
  const lastSaveTimeRef = useRef(Date.now());
  const debounceTimerRef = useRef(null);

  // Only subscribe to specific fields
  const cash = useGameStore(state => state.cash);
  const routes = useGameStore(state => state.routes);
  const fleet = useGameStore(state => state.fleet);
  const gameWeek = useGameStore(state => state.gameWeek);

  useEffect(() => {
    const performAutoSave = async () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
        // Get full state only when saving
        const fullState = useGameStore.getState();
        const result = await autoSave(fullState);
        if (result.success) {
          lastSaveTimeRef.current = now;
          console.log('Auto-saved to slot', result.slot);
        }
      }
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cash, routes, fleet, gameWeek]);
}
```

---

### 5. **IndexedDB - No Private Browsing Detection** (src/utils/saveSystem.js)

**Problem:**
- IndexedDB doesn't work in private/incognito mode
- No error handling or user notification
- Game will appear broken to users in private mode

**Evidence from Research:**
- Firefox bug #781982: IndexedDB does not function in private browsing mode
- Common complaint: "Your browser does not support indexedDB"

**Fix:**
Add detection and graceful degradation:

```javascript
// Add at top of saveSystem.js
let isIndexedDBAvailable = true;

async function checkIndexedDBAvailability() {
  try {
    const testDB = await openDB('__test__', 1);
    await testDB.close();
    return true;
  } catch (error) {
    console.warn('IndexedDB not available:', error);
    return false;
  }
}

// Update initDB to check availability
async function initDB() {
  if (!isIndexedDBAvailable) {
    throw new Error('IndexedDB not available. Please disable private browsing mode.');
  }

  try {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(SAVE_STORE)) {
          db.createObjectStore(SAVE_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(AUTO_SAVE_STORE)) {
          db.createObjectStore(AUTO_SAVE_STORE, { keyPath: 'slot' });
        }
      },
    });
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    isIndexedDBAvailable = false;
    throw error;
  }
}

// Initialize on module load
checkIndexedDBAvailability().then(available => {
  isIndexedDBAvailable = available;
});
```

---

### 6. **Zustand Store - Using require() Instead of import** (src/store/gameStore.js)

**Problem:**
- Line 239: `const { airports } = require('../data/airports');`
- Using CommonJS in ES6 module
- Can cause bundling issues and is inconsistent

**Current Code (Line 239):**
```javascript
getAirport: (id) => {
  const { airports } = require('../data/airports');
  return airports.find(a => a.id === id);
},
```

**Fix:**
Move import to top of file:

```javascript
import { airports } from '../data/airports';

// Then in store:
getAirport: (id) => {
  return airports.find(a => a.id === id);
},
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 7. **useGameLoop - Unnecessary Dependency** (src/hooks/useGameLoop.js)

**Problem:**
- Dependency array `[tick]` might cause loop recreation
- `tick` function is stable in Zustand, so dependency is unnecessary

**Current Code (Line 43):**
```javascript
}, [tick]);
```

**Fix:**
```javascript
}, []); // Empty array - tick is stable from Zustand
```

---

### 8. **Missing Error Boundaries**

**Problem:**
- No error boundaries to catch rendering errors
- If Globe or any component crashes, entire app crashes

**Fix:**
Add ErrorBoundary component:

```javascript
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Then wrap App in index.jsx:
```javascript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 📊 Summary of Issues

| Issue | Severity | Impact | Fixed |
|-------|----------|--------|-------|
| Globe memory leaks | 🔴 Critical | Memory grows over time, crashes | ❌ |
| Performance - re-renders | 🔴 Critical | Stuttering with many routes | ❌ |
| No resize handler | 🔴 Critical | Broken UI on resize | ❌ |
| useAutoSave excessive updates | 🟡 High | Unnecessary saves, performance | ❌ |
| No private browsing detection | 🟡 High | Broken saves in incognito | ❌ |
| require() instead of import | 🟡 High | Bundling issues | ❌ |
| Unnecessary useEffect deps | 🟢 Medium | Minor performance | ❌ |
| No error boundaries | 🟢 Medium | Poor error handling | ❌ |

---

## 🔧 Additional Recommendations

### Performance Optimizations

1. **Lazy load Globe component:**
```javascript
const Globe = lazy(() => import('./components/Globe'));
```

2. **Use React.memo for expensive components:**
```javascript
export default React.memo(GlobeComponent);
```

3. **Implement route virtualization** if routes > 100

4. **Add loading states** for better UX

### Browser Compatibility

1. **Add IndexedDB fallback** to localStorage for small saves
2. **Test in Safari** (known react-globe.gl issues)
3. **Add WebGL detection** before loading Globe

### Code Quality

1. **Add TypeScript** for better type safety
2. **Add PropTypes** or TypeScript interfaces
3. **Add unit tests** for game logic
4. **Add E2E tests** for critical flows

---

## Next Steps

1. Apply fixes in order of severity (Critical → High → Medium)
2. Test each fix independently
3. Add monitoring/logging for production issues
4. Create regression tests

---

*Generated: 2025-11-08*
*Based on: react-globe.gl, Three.js, Zustand, IndexedDB research*
