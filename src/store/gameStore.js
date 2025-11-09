import { create } from 'zustand';
import { calculateDistance, calculateRouteDemand, airports } from '../data/airports';
import { calculateOperatingCost, getAircraftType } from '../data/aircraft';

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
  gameSpeed: 60, // 60x speed default for faster gameplay
  isPaused: false,
  gameWeek: 1,

  // Fleet
  fleet: [], // Start with no aircraft - player must purchase their first plane

  // Routes
  routes: [],
  nextRouteId: 1,

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

    set((state) => ({
      routes: [...state.routes, route],
      nextRouteId: state.nextRouteId + 1,
      fleet: state.fleet.map(a => a.id === aircraftId ? aircraft : a),
      showRouteCreator: false,
    }));

    state.addNotification(`Route ${origin} → ${destination} created!`, 'success');
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

  // Game tick (called every frame)
  tick: (deltaTime) => {
    const state = get();
    if (state.isPaused) return;

    const gameTimeDelta = deltaTime * state.gameSpeed;
    const newGameTime = state.gameTime + gameTimeDelta;

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
    });
  },

  resetGame: () => {
    set({
      cash: 8000000,
      weeklyRevenue: 0,
      weeklyExpenses: 0,
      gameTime: 0,
      gameSpeed: 60,
      isPaused: false,
      gameWeek: 1,
      fleet: [], // Start with no aircraft
      routes: [],
      nextRouteId: 1,
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
