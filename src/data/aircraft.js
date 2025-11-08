// Aircraft types for the simulator
export const aircraftTypes = [
  // Regional Jets (Starting tier)
  {
    id: 'crj700',
    name: 'Bombardier CRJ-700',
    manufacturer: 'Bombardier',
    category: 'regional',
    capacity: 70,
    range: 3200, // km
    speed: 786, // km/h
    fuelBurn: 2100, // kg/hour
    price: 15000000, // USD
    maintenanceCost: 750000, // annual
    unlockRevenue: 0, // available from start
  },
  {
    id: 'erj175',
    name: 'Embraer E175',
    manufacturer: 'Embraer',
    category: 'regional',
    capacity: 88,
    range: 3700,
    speed: 828,
    fuelBurn: 2300,
    price: 18000000,
    maintenanceCost: 900000,
    unlockRevenue: 0,
  },

  // Narrow-body Jets (Mid-tier)
  {
    id: 'a320',
    name: 'Airbus A320',
    manufacturer: 'Airbus',
    category: 'narrowbody',
    capacity: 180,
    range: 6100,
    speed: 828,
    fuelBurn: 2500,
    price: 50000000,
    maintenanceCost: 2500000,
    unlockRevenue: 10000000, // $10M weekly revenue
  },
  {
    id: 'b737',
    name: 'Boeing 737-800',
    manufacturer: 'Boeing',
    category: 'narrowbody',
    capacity: 189,
    range: 5436,
    speed: 842,
    fuelBurn: 2600,
    price: 52000000,
    maintenanceCost: 2600000,
    unlockRevenue: 10000000,
  },
  {
    id: 'b737max',
    name: 'Boeing 737 MAX 8',
    manufacturer: 'Boeing',
    category: 'narrowbody',
    capacity: 210,
    range: 6570,
    speed: 839,
    fuelBurn: 2300, // more fuel efficient
    price: 58000000,
    maintenanceCost: 2900000,
    unlockRevenue: 25000000,
  },

  // Wide-body Jets (Advanced tier)
  {
    id: 'b787',
    name: 'Boeing 787-9 Dreamliner',
    manufacturer: 'Boeing',
    category: 'widebody',
    capacity: 296,
    range: 14140,
    speed: 913,
    fuelBurn: 5400,
    price: 150000000,
    maintenanceCost: 7500000,
    unlockRevenue: 50000000,
  },
  {
    id: 'a350',
    name: 'Airbus A350-900',
    manufacturer: 'Airbus',
    category: 'widebody',
    capacity: 315,
    range: 15000,
    speed: 903,
    fuelBurn: 5800,
    price: 155000000,
    maintenanceCost: 7750000,
    unlockRevenue: 50000000,
  },
  {
    id: 'b777',
    name: 'Boeing 777-300ER',
    manufacturer: 'Boeing',
    category: 'widebody',
    capacity: 396,
    range: 13649,
    speed: 905,
    fuelBurn: 7000,
    price: 180000000,
    maintenanceCost: 9000000,
    unlockRevenue: 100000000,
  },

  // Super Heavy (Elite tier)
  {
    id: 'a380',
    name: 'Airbus A380',
    manufacturer: 'Airbus',
    category: 'superheavy',
    capacity: 555,
    range: 15200,
    speed: 903,
    fuelBurn: 11000,
    price: 400000000,
    maintenanceCost: 20000000,
    unlockRevenue: 150000000,
  },
];

// Get aircraft by ID
export function getAircraftType(id) {
  return aircraftTypes.find(a => a.id === id);
}

// Get unlocked aircraft based on weekly revenue
export function getUnlockedAircraft(weeklyRevenue) {
  return aircraftTypes.filter(a => a.unlockRevenue <= weeklyRevenue);
}

// Calculate operating cost per hour
export function calculateOperatingCost(aircraftId, distance) {
  const aircraft = getAircraftType(aircraftId);
  if (!aircraft) return 0;

  const flightHours = distance / aircraft.speed;

  // Fuel cost: kg/hour * hours * $0.67/kg
  const fuelCost = aircraft.fuelBurn * flightHours * 0.67;

  // Crew cost: $500-800 per flight hour based on aircraft size
  const crewCost = aircraft.category === 'regional' ? 500 :
                   aircraft.category === 'narrowbody' ? 600 :
                   aircraft.category === 'widebody' ? 700 : 800;
  const totalCrewCost = crewCost * flightHours;

  // Airport fees: per flight based on aircraft size
  const airportFees = aircraft.category === 'regional' ? 2000 :
                      aircraft.category === 'narrowbody' ? 3000 :
                      aircraft.category === 'widebody' ? 4500 : 5000;

  // Maintenance: 5% of aircraft value annually / 2000 flight hours
  const maintenanceCost = (aircraft.price * 0.05 / 2000) * flightHours;

  return fuelCost + totalCrewCost + airportFees + maintenanceCost;
}
