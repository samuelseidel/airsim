import { create } from 'zustand';

const SAVE_KEY = 'airsim_viral_save';

// Simple upgrade definitions
const UPGRADES = {
  planes: {
    name: 'Planes',
    icon: '✈️',
    basePrice: 100000,
    priceMultiplier: 1.15,
    effect: 'capacity',
  },
  speed: {
    name: 'Speed',
    icon: '⚡',
    basePrice: 50000,
    priceMultiplier: 1.20,
    effect: 'speed',
    maxLevel: 20,
  },
  earnings: {
    name: 'Earnings',
    icon: '💰',
    basePrice: 75000,
    priceMultiplier: 1.25,
    effect: 'earnings',
  },
  autoFly: {
    name: 'Auto-Fly',
    icon: '🤖',
    basePrice: 500000,
    priceMultiplier: 1.30,
    effect: 'auto',
    maxLevel: 10,
  },
};

const useViralGameStore = create((set, get) => ({
  // Core state
  money: 0,
  totalEarned: 0,
  planes: 1,
  planesFlyingCount: 0,

  // Upgrades
  upgrades: {
    planes: 0,
    speed: 0,
    earnings: 0,
    autoFly: 0,
  },

  // Prestige
  goldenPlanes: 0,
  totalPrestiges: 0,

  // Offline earnings
  lastPlayTime: Date.now(),
  offlineEarnings: 0,

  // UI state
  showUpgrades: false,
  notifications: [],

  // Calculate earnings per flight
  getEarningsPerFlight: () => {
    const state = get();
    const baseEarnings = 1000;
    const earningsMultiplier = 1 + (state.upgrades.earnings * 0.25);
    const goldenMultiplier = 1 + (state.goldenPlanes * 9); // 10x per golden plane
    return Math.floor(baseEarnings * earningsMultiplier * goldenMultiplier);
  },

  // Calculate flight duration
  getFlightDuration: () => {
    const state = get();
    const baseDuration = 3000; // 3 seconds
    const speedReduction = state.upgrades.speed * 0.10; // 10% faster per upgrade
    return Math.floor(baseDuration * (1 - speedReduction));
  },

  // Calculate auto-fly interval
  getAutoFlyInterval: () => {
    const state = get();
    if (state.upgrades.autoFly === 0) return null;
    const baseInterval = 30000; // 30 seconds
    const reduction = state.upgrades.autoFly * 0.10; // 10% faster per upgrade
    return Math.floor(baseInterval * (1 - reduction));
  },

  // Calculate total planes
  getTotalPlanes: () => {
    const state = get();
    return 1 + state.upgrades.planes + state.goldenPlanes;
  },

  // Calculate upgrade cost
  getUpgradeCost: (upgradeType) => {
    const state = get();
    const upgrade = UPGRADES[upgradeType];
    const currentLevel = state.upgrades[upgradeType];
    return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, currentLevel));
  },

  // Can afford upgrade?
  canAffordUpgrade: (upgradeType) => {
    const state = get();
    const cost = state.getUpgradeCost(upgradeType);
    const upgrade = UPGRADES[upgradeType];
    const currentLevel = state.upgrades[upgradeType];

    if (upgrade.maxLevel && currentLevel >= upgrade.maxLevel) return false;
    return state.money >= cost;
  },

  // Tap to fly a plane
  flyPlane: () => {
    const state = get();
    const earnings = state.getEarningsPerFlight();

    set({
      money: state.money + earnings,
      totalEarned: state.totalEarned + earnings,
      planesFlyingCount: state.planesFlyingCount + 1,
    });

    // Reset flying count after animation
    setTimeout(() => {
      set({ planesFlyingCount: Math.max(0, get().planesFlyingCount - 1) });
    }, state.getFlightDuration());

    return earnings;
  },

  // Buy upgrade
  buyUpgrade: (upgradeType) => {
    const state = get();
    if (!state.canAffordUpgrade(upgradeType)) return false;

    const cost = state.getUpgradeCost(upgradeType);

    set({
      money: state.money - cost,
      upgrades: {
        ...state.upgrades,
        [upgradeType]: state.upgrades[upgradeType] + 1,
      },
    });

    state.addNotification(`Upgraded ${UPGRADES[upgradeType].name}!`, 'success');
    state.saveGame();
    return true;
  },

  // Prestige (reset for golden plane)
  prestige: () => {
    const state = get();
    if (state.totalEarned < 10000000) return false; // Need $10M total

    set({
      money: 0,
      totalEarned: 0,
      upgrades: {
        planes: 0,
        speed: 0,
        earnings: 0,
        autoFly: 0,
      },
      goldenPlanes: state.goldenPlanes + 1,
      totalPrestiges: state.totalPrestiges + 1,
    });

    state.addNotification('🏆 Prestige! You earned a Golden Plane!', 'success');
    state.saveGame();
    return true;
  },

  // Calculate offline earnings
  calculateOfflineEarnings: () => {
    const state = get();
    const now = Date.now();
    const timePassed = now - state.lastPlayTime;
    const hoursOffline = timePassed / (1000 * 60 * 60);

    // Cap at 4 hours
    const cappedHours = Math.min(hoursOffline, 4);

    // Earn 50% of tap value every 30 seconds while offline
    const earningsPerFlight = state.getEarningsPerFlight() * 0.5;
    const totalPlanes = state.getTotalPlanes();
    const flightsPerHour = (60 * 60) / 30; // One flight every 30 seconds

    const offlineEarnings = Math.floor(cappedHours * flightsPerHour * totalPlanes * earningsPerFlight);

    if (offlineEarnings > 100) {
      set({
        offlineEarnings,
        lastPlayTime: now,
      });
    }
  },

  // Claim offline earnings
  claimOfflineEarnings: () => {
    const state = get();
    if (state.offlineEarnings > 0) {
      set({
        money: state.money + state.offlineEarnings,
        totalEarned: state.totalEarned + state.offlineEarnings,
        offlineEarnings: 0,
      });
      state.saveGame();
    }
  },

  // Toggle upgrades panel
  toggleUpgrades: () => {
    set({ showUpgrades: !get().showUpgrades });
  },

  // Add notification
  addNotification: (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
    };

    set({ notifications: [...get().notifications, notification] });

    setTimeout(() => {
      set({ notifications: get().notifications.filter(n => n.id !== notification.id) });
    }, 3000);
  },

  // Save game
  saveGame: () => {
    const state = get();
    const saveData = {
      money: state.money,
      totalEarned: state.totalEarned,
      upgrades: state.upgrades,
      goldenPlanes: state.goldenPlanes,
      totalPrestiges: state.totalPrestiges,
      lastPlayTime: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  },

  // Load game
  loadGame: () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({
          money: data.money || 0,
          totalEarned: data.totalEarned || 0,
          upgrades: data.upgrades || {
            planes: 0,
            speed: 0,
            earnings: 0,
            autoFly: 0,
          },
          goldenPlanes: data.goldenPlanes || 0,
          totalPrestiges: data.totalPrestiges || 0,
          lastPlayTime: data.lastPlayTime || Date.now(),
        });

        // Calculate offline earnings
        get().calculateOfflineEarnings();
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  },

  // Reset game
  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    set({
      money: 0,
      totalEarned: 0,
      planes: 1,
      planesFlyingCount: 0,
      upgrades: {
        planes: 0,
        speed: 0,
        earnings: 0,
        autoFly: 0,
      },
      goldenPlanes: 0,
      totalPrestiges: 0,
      lastPlayTime: Date.now(),
      offlineEarnings: 0,
      showUpgrades: false,
      notifications: [],
    });
  },
}));

export { UPGRADES };
export default useViralGameStore;
