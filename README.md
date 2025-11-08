# ✈️ AirSim - Airline Manager Simulator

A browser-based airline management game built with React, Three.js, and react-globe.gl. Build your airline empire by creating routes, managing your fleet, and expanding globally.

![AirSim Demo](https://img.shields.io/badge/Status-Alpha-yellow)
![React](https://img.shields.io/badge/React-19.1-blue)
![Three.js](https://img.shields.io/badge/Three.js-Latest-green)

## 🎮 Features

### Core Gameplay
- **3D Globe Visualization** - Interactive Earth with real-time flight path animations
- **Route Management** - Create and manage profitable routes between 50+ major airports worldwide
- **Fleet System** - Purchase and assign aircraft from regional jets to superjumbos
- **Economic Simulation** - Realistic revenue/cost calculations based on distance, capacity, and demand
- **Time Compression** - 1x, 2x, 5x, 10x speed options for flexible gameplay
- **Auto-Save System** - Automatic saves every 30 seconds with manual save slots

### Aircraft Types
- **Regional Jets** - CRJ-700, Embraer E175 (70-88 seats, 3,200-3,700km range)
- **Narrow-body** - A320, B737 (180-210 seats, 5,400-6,600km range)
- **Wide-body** - B787, A350, B777 (296-396 seats, 13,600-15,000km range)
- **Super Heavy** - A380 (555 seats, 15,200km range)

### Game Mechanics
- **Progressive Unlocks** - New aircraft unlock based on weekly revenue milestones
- **Staff Management** - Pilots, crew, and ground staff with satisfaction tracking
- **Dynamic Pricing** - Smart default pricing based on distance and competition
- **Demand System** - Route demand calculated from city populations and distance
- **Maintenance** - Aircraft condition tracking and service scheduling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The game will be available at `http://localhost:5173`

### Deployment to Vercel

The project is configured for automatic deployment to Vercel:

#### Option 1: Automatic Deployment (Recommended)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project"
   - Import your `airsim` repository
   - Vercel auto-detects Vite configuration

2. **Deploy**:
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Game will be live at `https://your-project.vercel.app`

3. **Auto-Deploy on Push**:
   - Every push to `main` branch automatically deploys
   - Pull requests get preview deployments
   - No configuration needed!

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

#### Local Preview

```bash
npm run build
npm run preview
```

**Note**: The game uses IndexedDB for saves, which won't work in private browsing mode.

## 🎯 How to Play

### Starting Out
1. Click **New Game** on the welcome screen
2. You start with $8M cash and one CRJ-700 regional jet
3. Click **+ New Route** in the sidebar to create your first route

### Creating Routes
1. Select **Origin** and **Destination** airports from the dropdowns
2. Choose an available aircraft from your fleet
3. Set ticket price (or use auto-calculated default)
4. Click **Create Route** to start operations

### Growing Your Airline
- **Week 1 Goal**: $500K weekly revenue (2-3 routes)
- **Week 4 Goal**: $2M weekly revenue (unlock narrow-body aircraft)
- **Week 12 Goal**: $8M weekly revenue (unlock wide-body aircraft)
- Purchase new aircraft as revenue grows
- Expand to international routes for higher profit margins

### Tips for Success
- **Short-haul routes** (< 500km) command premium pricing
- **Large cities** generate more passenger demand
- **Load factors** around 70% indicate good route performance
- **Time compression** (5x default) speeds up progression
- **Auto-save** runs every 30 seconds, or manually save via menu

## 🏗️ Architecture

### Technology Stack
- **React 19** - UI framework
- **Three.js + react-globe.gl** - 3D visualization
- **Zustand** - State management
- **IndexedDB (idb)** - Client-side save system
- **GSAP** - Camera animations
- **Vite** - Build tool and dev server

### Project Structure
```
src/
├── components/          # UI components
│   ├── Globe.jsx       # 3D globe with routes
│   ├── TopBar.jsx      # Game stats and controls
│   ├── Sidebar.jsx     # Routes and fleet management
│   └── RouteCreator.jsx # Route creation modal
├── data/               # Game data
│   ├── airports.js     # Airport database (50+ cities)
│   └── aircraft.js     # Aircraft types and specs
├── store/              # State management
│   └── gameStore.js    # Zustand game state
├── hooks/              # Custom React hooks
│   ├── useGameLoop.js  # Fixed timestep game loop
│   └── useAutoSave.js  # Auto-save with debouncing
└── utils/              # Utility functions
    └── saveSystem.js   # IndexedDB save/load
```

### Economic Model
```javascript
// Revenue Calculation
passengers = capacity × loadFactor
dailyRevenue = passengers × ticketPrice × flightsPerDay

// Cost Calculation
fuelCost = fuelBurn × hours × $0.67/kg
crewCost = $500-800/hour based on aircraft size
airportFees = $2,000-5,000 per flight
maintenanceCost = 5% of aircraft value annually

// Profit
profit = revenue - costs
```

## 🎨 Design Principles

### Visual Feedback
- **Color-coded routes**: Green = profitable, Red = losing money
- **Animated arcs**: Flight path animations show active routes
- **Real-time notifications**: Success/error messages for all actions
- **Glow effects**: Selected airports and routes highlighted

### Progressive Disclosure
- Start with basic route creation
- Unlock advanced aircraft as revenue grows
- Gradual introduction of staff and maintenance systems
- Tutorial on first launch

### Performance Targets
- **60 FPS** with 20-30 simultaneous flight animations
- **Sub-2s load times** for save game loading
- **< 3MB initial bundle** (excluding Three.js textures)

## 📊 Game Balance

### Difficulty Tiers
- **Easy**: $10M start, one $30M aircraft, $5M credit
- **Medium**: $8M start, one $20M regional jet, $3M loan (default)
- **Hard**: $5M start, three aging turboprops, $8M loan

### Progression Milestones
- **Week 1**: $500K revenue → First profitable operations
- **Week 4**: $2M revenue → Unlock narrow-body jets
- **Week 12**: $8M revenue → Unlock wide-body jets
- **Week 26**: $25M revenue → Unlock A380 superjumbo

### Profit Margins
- **Early game** (1-5 aircraft): 60-80% margins
- **Mid game** (5-50 aircraft): 40-60% margins
- **Late game** (50+ aircraft): 30-50% margins

## 🔧 Development Status

### ✅ Completed
- [x] Basic globe visualization with airports
- [x] Route creation and management
- [x] Animated flight paths
- [x] Fleet system with 9 aircraft types
- [x] Economic simulation
- [x] Game loop with time compression
- [x] Save/load system
- [x] Auto-save functionality
- [x] Welcome screen and tutorial

### 🚧 Future Enhancements
- [ ] Staff management detailed UI
- [ ] Maintenance scheduling system
- [ ] Enhanced route analytics
- [ ] Competition AI
- [ ] Achievement system
- [ ] Random events (fuel price spikes, demand surges)
- [ ] Mobile responsive design

## 📝 License

MIT License

## 🙏 Acknowledgments

- **react-globe.gl** by Vasco Asturiano for the 3D globe library
- **Airlines Manager Tycoon** for game design inspiration
- Aircraft specifications from manufacturer public data

---

**Built with ❤️ using React, Three.js, and Zustand**

Happy flying! ✈️
