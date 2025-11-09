import { create } from 'zustand';
import { calculateDistance, calculateRouteDemand, airports } from '../data/airports';
import { calculateOperatingCost, getAircraftType } from '../data/aircraft';

// Flight phases
const FLIGHT_PHASES = {
  TAXI_TAKEOFF: 'taxi_takeoff',
  CLIMB: 'climb',
  CRUISE: 'cruise',
  DESCENT: 'descent',
  LANDING: 'landing',
  TURNAROUND: 'turnaround',
};

// Get realistic speeds and altitudes for aircraft by category
const getPhaseParameters = (aircraftCategory) => {
  // Speeds in km/h, altitudes in meters
  const params = {
    turboprop: {
      taxi_takeoff: { speed: 50, altitude: 0, duration: 600 }, // 10 min
      climb: { speed: 300, altitude: 7600, duration: 900 }, // 15 min to 25,000 ft
      descent: { speed: 350, altitude: 0, duration: 1200 }, // 20 min
      landing: { speed: 80, altitude: 0, duration: 300 }, // 5 min
      turnaround: { speed: 0, altitude: 0, duration: 3600 }, // 1 hour
    },
    regional: {
      taxi_takeoff: { speed: 60, altitude: 0, duration: 600 },
      climb: { speed: 400, altitude: 9100, duration: 1200 }, // 20 min to 30,000 ft
      descent: { speed: 450, altitude: 0, duration: 1500 }, // 25 min
      landing: { speed: 100, altitude: 0, duration: 300 },
      turnaround: { speed: 0, altitude: 0, duration: 3600 },
    },
    narrowbody: {
      taxi_takeoff: { speed: 70, altitude: 0, duration: 600 },
      climb: { speed: 500, altitude: 10700, duration: 1500 }, // 25 min to 35,000 ft
      descent: { speed: 550, altitude: 0, duration: 1800 }, // 30 min
      landing: { speed: 120, altitude: 0, duration: 300 },
      turnaround: { speed: 0, altitude: 0, duration: 5400 }, // 1.5 hours
    },
    widebody: {
      taxi_takeoff: { speed: 80, altitude: 0, duration: 720 }, // 12 min
      climb: { speed: 550, altitude: 12200, duration: 1800 }, // 30 min to 40,000 ft
      descent: { speed: 600, altitude: 0, duration: 2100 }, // 35 min
      landing: { speed: 140, altitude: 0, duration: 360 },
      turnaround: { speed: 0, altitude: 0, duration: 7200 }, // 2 hours
    },
    superheavy: {
      taxi_takeoff: { speed: 90, altitude: 0, duration: 900 }, // 15 min
      climb: { speed: 600, altitude: 12800, duration: 2100 }, // 35 min to 42,000 ft
      descent: { speed: 650, altitude: 0, duration: 2400 }, // 40 min
      landing: { speed: 150, altitude: 0, duration: 420 },
      turnaround: { speed: 0, altitude: 0, duration: 10800 }, // 3 hours
    },
  };

  return params[aircraftCategory] || params.narrowbody;
};

// Generate aircraft registration number
const generateRegistration = () => {
  const prefixes = ['N', 'D-', 'OK-', 'G-', 'F-', 'PH-', 'OE-', 'SE-', 'LN-', 'EI-'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  if (prefix === 'N') {
    // US format: N12345
    return `N${Math.floor(10000 + Math.random() * 90000)}`;
  } else {
    // European format: OK-DSA
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const reg = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    return `${prefix}${reg}`;
  }
};

const useGameStore = create((set, get) => ({
  // Game state
  cash: 8000000, // $8M starting capital (medium difficulty)
  weeklyRevenue: 0,
  weeklyExpenses: 0,
  gameTime: 0, // in seconds
  gameSpeed: 5, // 5x speed default
  isPaused: false,
  gameWeek: 1,

  // Fleet
  fleet: [], // Start with no aircraft - player must purchase their first plane

  // Routes
  routes: [],
  nextRouteId: 1,

  // Active flights
  activeFlights: [],
  nextFlightId: 1,

  // Staff
  staff: {
    pilots: { count: 10, satisfaction: 80 },
    crew: { count: 20, satisfaction: 80 },
    ground: { count: 15, satisfaction: 80 },
  },

  // UI state
  selectedAirport: null,
  selectedRoute: null,
  showRouteCreator: false,
  notifications: [],

  // Actions
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  // Route creation
  createRoute: (origin, destination, aircraftId, ticketPrice) => {
    const state = get();
    const aircraft = state.fleet.find(a => a.id === aircraftId);
    const aircraftType = getAircraftType(aircraft?.type);

    if (!aircraft || !aircraftType) return;

    const distance = calculateDistance(
      state.getAirport(origin).lat,
      state.getAirport(origin).lng,
      state.getAirport(destination).lat,
      state.getAirport(destination).lng
    );

    // Check if aircraft has sufficient range
    if (distance > aircraftType.range) {
      state.addNotification('Route exceeds aircraft range!', 'error');
      return;
    }

    const demand = calculateRouteDemand(origin, destination);
    const operatingCost = calculateOperatingCost(aircraft.type, distance);

    // Calculate flights per day (simplified)
    const flightHours = distance / aircraftType.speed;
    const turnaroundTime = 2; // hours
    const totalTripTime = flightHours * 2 + turnaroundTime; // round trip + turnaround
    const flightsPerDay = Math.floor(24 / totalTripTime);

    const route = {
      id: `route-${state.nextRouteId}`,
      origin,
      destination,
      aircraftId,
      distance,
      demand,
      ticketPrice: ticketPrice || state.calculateDefaultPrice(distance),
      loadFactor: 70, // initial estimate
      flightsPerDay,
      dailyRevenue: 0,
      dailyCost: 0,
      profit: 0,
      active: true,
    };

    // Calculate economics
    const passengers = Math.round((aircraftType.capacity * route.loadFactor) / 100);
    route.dailyRevenue = passengers * route.ticketPrice * flightsPerDay;
    route.dailyCost = operatingCost * flightsPerDay;
    route.profit = route.dailyRevenue - route.dailyCost;

    // Update aircraft assignment
    aircraft.assignedRoute = route.id;
    aircraft.location = origin;

    // Create initial flight for this route
    const flight = state.createFlight(route.id, origin, destination, aircraftId);

    set((state) => ({
      routes: [...state.routes, route],
      nextRouteId: state.nextRouteId + 1,
      fleet: state.fleet.map(a => a.id === aircraftId ? aircraft : a),
      activeFlights: flight ? [...state.activeFlights, flight] : state.activeFlights,
      nextFlightId: flight ? state.nextFlightId + 1 : state.nextFlightId,
      showRouteCreator: false,
    }));

    state.addNotification(`Route ${origin} ↔ ${destination} created!`, 'success');
  },

  // Create a new flight
  createFlight: (routeId, origin, destination, aircraftId) => {
    const state = get();
    const aircraft = state.fleet.find(a => a.id === aircraftId);
    const aircraftType = getAircraftType(aircraft?.type);

    if (!aircraftType) return null;

    const originAirport = state.getAirport(origin);
    const destAirport = state.getAirport(destination);
    const distance = calculateDistance(originAirport.lat, originAirport.lng, destAirport.lat, destAirport.lng);

    const phaseParams = getPhaseParameters(aircraftType.category);
    const cruiseSpeed = aircraftType.speed;

    // Calculate total flight duration
    const taxiTakeoffDuration = phaseParams.taxi_takeoff.duration;
    const climbDuration = phaseParams.climb.duration;
    const descentDuration = phaseParams.descent.duration;
    const landingDuration = phaseParams.landing.duration;

    // Calculate cruise distance and duration
    const cruiseDistance = distance;
    const cruiseDuration = (cruiseDistance / cruiseSpeed) * 3600; // convert hours to seconds

    const totalFlightDuration = taxiTakeoffDuration + climbDuration + cruiseDuration + descentDuration + landingDuration;

    return {
      id: `flight-${state.nextFlightId}`,
      routeId,
      aircraftId,
      registration: aircraft.registration,
      origin,
      destination,
      distance,
      phase: FLIGHT_PHASES.TAXI_TAKEOFF,
      phaseProgress: 0,
      totalProgress: 0,
      currentSpeed: 0,
      currentAltitude: 0,
      departureTime: state.gameTime,
      estimatedArrival: state.gameTime + totalFlightDuration,
      totalFlightDuration,
      phaseParams,
      cruiseSpeed,
      isOutbound: true, // true for origin->destination, false for destination->origin
    };
  },

  // Remove route
  removeRoute: (routeId) => {
    const state = get();
    const route = state.routes.find(r => r.id === routeId);
    if (route) {
      // Unassign aircraft
      const aircraft = state.fleet.find(a => a.id === route.aircraftId);
      if (aircraft) {
        aircraft.assignedRoute = null;
      }
    }

    set((state) => ({
      routes: state.routes.filter(r => r.id !== routeId),
      fleet: state.fleet.map(a => a.id === route?.aircraftId ? { ...a, assignedRoute: null } : a),
      activeFlights: state.activeFlights.filter(f => f.routeId !== routeId),
    }));
  },

  // Purchase aircraft
  purchaseAircraft: (aircraftTypeId) => {
    const state = get();
    const aircraftType = getAircraftType(aircraftTypeId);

    if (!aircraftType) return;

    if (state.cash < aircraftType.price) {
      state.addNotification('Insufficient funds!', 'error');
      return;
    }

    const newAircraft = {
      id: `aircraft-${Date.now()}`,
      type: aircraftTypeId,
      name: `${aircraftType.name}-${state.fleet.length + 1}`,
      registration: generateRegistration(),
      condition: 100,
      assignedRoute: null,
      totalFlightHours: 0,
      hoursSinceService: 0,
      location: 'JFK',
    };

    set((state) => ({
      fleet: [...state.fleet, newAircraft],
      cash: state.cash - aircraftType.price,
    }));

    state.addNotification(`Purchased ${aircraftType.name}!`, 'success');
  },

  // Update flight simulation
  updateFlights: (deltaTime) => {
    const state = get();
    const updatedFlights = [];

    state.activeFlights.forEach(flight => {
      let newFlight = { ...flight };
      const phaseParams = flight.phaseParams;

      // Update based on current phase
      switch (flight.phase) {
        case FLIGHT_PHASES.TAXI_TAKEOFF:
          newFlight.phaseProgress += deltaTime;
          newFlight.currentSpeed = phaseParams.taxi_takeoff.speed;
          newFlight.currentAltitude = 0;

          if (newFlight.phaseProgress >= phaseParams.taxi_takeoff.duration) {
            newFlight.phase = FLIGHT_PHASES.CLIMB;
            newFlight.phaseProgress = 0;
          }
          break;

        case FLIGHT_PHASES.CLIMB:
          newFlight.phaseProgress += deltaTime;
          const climbProgress = newFlight.phaseProgress / phaseParams.climb.duration;
          newFlight.currentSpeed = phaseParams.climb.speed;
          newFlight.currentAltitude = phaseParams.climb.altitude * Math.min(climbProgress, 1);

          if (newFlight.phaseProgress >= phaseParams.climb.duration) {
            newFlight.phase = FLIGHT_PHASES.CRUISE;
            newFlight.phaseProgress = 0;
          }
          break;

        case FLIGHT_PHASES.CRUISE:
          const cruiseDuration = (flight.distance / flight.cruiseSpeed) * 3600;
          newFlight.phaseProgress += deltaTime;
          newFlight.currentSpeed = flight.cruiseSpeed;
          newFlight.currentAltitude = phaseParams.climb.altitude;

          if (newFlight.phaseProgress >= cruiseDuration) {
            newFlight.phase = FLIGHT_PHASES.DESCENT;
            newFlight.phaseProgress = 0;
          }
          break;

        case FLIGHT_PHASES.DESCENT:
          newFlight.phaseProgress += deltaTime;
          const descentProgress = newFlight.phaseProgress / phaseParams.descent.duration;
          newFlight.currentSpeed = phaseParams.descent.speed;
          newFlight.currentAltitude = phaseParams.climb.altitude * (1 - Math.min(descentProgress, 1));

          if (newFlight.phaseProgress >= phaseParams.descent.duration) {
            newFlight.phase = FLIGHT_PHASES.LANDING;
            newFlight.phaseProgress = 0;
          }
          break;

        case FLIGHT_PHASES.LANDING:
          newFlight.phaseProgress += deltaTime;
          newFlight.currentSpeed = phaseParams.landing.speed;
          newFlight.currentAltitude = 0;

          if (newFlight.phaseProgress >= phaseParams.landing.duration) {
            newFlight.phase = FLIGHT_PHASES.TURNAROUND;
            newFlight.phaseProgress = 0;
          }
          break;

        case FLIGHT_PHASES.TURNAROUND:
          newFlight.phaseProgress += deltaTime;
          newFlight.currentSpeed = 0;
          newFlight.currentAltitude = 0;

          if (newFlight.phaseProgress >= phaseParams.turnaround.duration) {
            // Flight complete - create return flight
            const route = state.routes.find(r => r.id === flight.routeId);
            if (route && route.active) {
              // Swap origin and destination for return flight
              const newOrigin = flight.isOutbound ? flight.destination : flight.origin;
              const newDestination = flight.isOutbound ? flight.origin : flight.destination;

              const returnFlight = state.createFlight(
                flight.routeId,
                newOrigin,
                newDestination,
                flight.aircraftId
              );

              if (returnFlight) {
                returnFlight.isOutbound = !flight.isOutbound;
                updatedFlights.push(returnFlight);
              }
            }
            return; // Don't add current flight to updated list
          }
          break;
      }

      // Calculate total progress percentage (0-100%)
      const phaseDurations = {
        [FLIGHT_PHASES.TAXI_TAKEOFF]: phaseParams.taxi_takeoff.duration,
        [FLIGHT_PHASES.CLIMB]: phaseParams.climb.duration,
        [FLIGHT_PHASES.CRUISE]: (flight.distance / flight.cruiseSpeed) * 3600,
        [FLIGHT_PHASES.DESCENT]: phaseParams.descent.duration,
        [FLIGHT_PHASES.LANDING]: phaseParams.landing.duration,
        [FLIGHT_PHASES.TURNAROUND]: 0, // Don't count turnaround in flight progress
      };

      const phaseOrder = [
        FLIGHT_PHASES.TAXI_TAKEOFF,
        FLIGHT_PHASES.CLIMB,
        FLIGHT_PHASES.CRUISE,
        FLIGHT_PHASES.DESCENT,
        FLIGHT_PHASES.LANDING,
      ];

      let completedDuration = 0;
      const currentPhaseIndex = phaseOrder.indexOf(newFlight.phase);

      for (let i = 0; i < currentPhaseIndex; i++) {
        completedDuration += phaseDurations[phaseOrder[i]];
      }
      completedDuration += newFlight.phaseProgress;

      const totalFlightDuration = phaseOrder.reduce((sum, phase) => sum + phaseDurations[phase], 0);
      newFlight.totalProgress = Math.min((completedDuration / totalFlightDuration) * 100, 100);

      updatedFlights.push(newFlight);
    });

    set({ activeFlights: updatedFlights });
  },

  // Game tick (called every frame)
  tick: (deltaTime) => {
    const state = get();
    if (state.isPaused) return;

    const gameTimeDelta = deltaTime * state.gameSpeed;
    const newGameTime = state.gameTime + gameTimeDelta;

    // Update flight simulations
    state.updateFlights(gameTimeDelta);

    // Check if week changed
    const oldWeek = Math.floor(state.gameTime / (7 * 24 * 3600));
    const newWeek = Math.floor(newGameTime / (7 * 24 * 3600));

    if (newWeek > oldWeek) {
      // Week changed - calculate weekly finances
      let weeklyRev = 0;
      let weeklyExp = 0;

      state.routes.forEach(route => {
        weeklyRev += route.dailyRevenue * 7;
        weeklyExp += route.dailyCost * 7;
      });

      // Staff costs
      const staffCosts = (state.staff.pilots.count * 8000 +
                         state.staff.crew.count * 4000 +
                         state.staff.ground.count * 3000) * 4; // monthly to weekly

      weeklyExp += staffCosts;

      const weeklyProfit = weeklyRev - weeklyExp;

      set({
        cash: state.cash + weeklyProfit,
        weeklyRevenue: weeklyRev,
        weeklyExpenses: weeklyExp,
        gameWeek: newWeek + 1,
      });

      state.addNotification(
        `Week ${newWeek + 1}: Profit $${weeklyProfit.toLocaleString()}`,
        weeklyProfit > 0 ? 'success' : 'error'
      );
    }

    set({ gameTime: newGameTime });
  },

  // UI helpers
  setSelectedAirport: (airportId) => set({ selectedAirport: airportId }),
  setSelectedRoute: (routeId) => set({ selectedRoute: routeId }),
  setShowRouteCreator: (show) => set({ showRouteCreator: show }),

  addNotification: (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notification.id),
      }));
    }, 5000);
  },

  // Helper functions
  getAirport: (id) => {
    return airports.find(a => a.id === id);
  },

  calculateDefaultPrice: (distance) => {
    // $0.10-$0.15 per km base rate
    const baseRate = 0.12;
    let price = distance * baseRate;

    // Distance modifiers
    if (distance < 500) price *= 1.2; // short-haul premium
    else if (distance > 3000) price *= 0.85; // long-haul discount

    return Math.round(price);
  },

  // Save/Load functionality
  loadGameState: (saveData) => {
    set({
      cash: saveData.cash,
      weeklyRevenue: saveData.weeklyRevenue,
      weeklyExpenses: saveData.weeklyExpenses,
      gameTime: saveData.gameTime,
      gameSpeed: saveData.gameSpeed,
      gameWeek: saveData.gameWeek,
      fleet: saveData.fleet,
      routes: saveData.routes,
      nextRouteId: saveData.nextRouteId,
      staff: saveData.staff,
      activeFlights: saveData.activeFlights || [],
      nextFlightId: saveData.nextFlightId || 1,
    });
  },

  resetGame: () => {
    set({
      cash: 8000000,
      weeklyRevenue: 0,
      weeklyExpenses: 0,
      gameTime: 0,
      gameSpeed: 5,
      isPaused: false,
      gameWeek: 1,
      fleet: [], // Start with no aircraft
      routes: [],
      nextRouteId: 1,
      activeFlights: [],
      nextFlightId: 1,
      staff: {
        pilots: { count: 10, satisfaction: 80 },
        crew: { count: 20, satisfaction: 80 },
        ground: { count: 15, satisfaction: 80 },
      },
      selectedAirport: null,
      selectedRoute: null,
      notifications: [],
    });
  },
}));

export default useGameStore;
