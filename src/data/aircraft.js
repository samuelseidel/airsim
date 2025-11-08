// Aircraft types for the simulator
export const aircraftTypes = [
  // Turboprops (Budget tier)
  {
    id: 'atr72',
    name: 'ATR 72-600',
    manufacturer: 'ATR',
    category: 'turboprop',
    capacity: 70,
    range: 1528,
    speed: 510,
    fuelBurn: 1050,
    price: 8000000,
    maintenanceCost: 400000,
    unlockRevenue: 0,
  },
  {
    id: 'dhc8',
    name: 'Dash 8 Q400',
    manufacturer: 'De Havilland',
    category: 'turboprop',
    capacity: 78,
    range: 2040,
    speed: 667,
    fuelBurn: 1200,
    price: 10000000,
    maintenanceCost: 500000,
    unlockRevenue: 0,
  },

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
    id: 'crj900',
    name: 'Bombardier CRJ-900',
    manufacturer: 'Bombardier',
    category: 'regional',
    capacity: 90,
    range: 2956,
    speed: 786,
    fuelBurn: 2300,
    price: 17000000,
    maintenanceCost: 850000,
    unlockRevenue: 0,
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
  {
    id: 'erj190',
    name: 'Embraer E190',
    manufacturer: 'Embraer',
    category: 'regional',
    capacity: 114,
    range: 4537,
    speed: 828,
    fuelBurn: 2800,
    price: 22000000,
    maintenanceCost: 1100000,
    unlockRevenue: 5000000,
  },

  // Narrow-body Jets (Mid-tier)
  {
    id: 'a319',
    name: 'Airbus A319',
    manufacturer: 'Airbus',
    category: 'narrowbody',
    capacity: 156,
    range: 6850,
    speed: 828,
    fuelBurn: 2200,
    price: 45000000,
    maintenanceCost: 2250000,
    unlockRevenue: 8000000,
  },
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
    id: 'a321',
    name: 'Airbus A321',
    manufacturer: 'Airbus',
    category: 'narrowbody',
    capacity: 220,
    range: 5950,
    speed: 828,
    fuelBurn: 2700,
    price: 55000000,
    maintenanceCost: 2750000,
    unlockRevenue: 15000000,
  },
  {
    id: 'a321neo',
    name: 'Airbus A321neo',
    manufacturer: 'Airbus',
    category: 'narrowbody',
    capacity: 240,
    range: 7400,
    speed: 828,
    fuelBurn: 2400,
    price: 62000000,
    maintenanceCost: 3100000,
    unlockRevenue: 25000000,
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
  {
    id: 'b757',
    name: 'Boeing 757-200',
    manufacturer: 'Boeing',
    category: 'narrowbody',
    capacity: 200,
    range: 7222,
    speed: 850,
    fuelBurn: 3000,
    price: 48000000, // Older model, cheaper
    maintenanceCost: 2400000,
    unlockRevenue: 15000000,
  },

  // Wide-body Jets (Advanced tier)
  {
    id: 'b767',
    name: 'Boeing 767-300ER',
    manufacturer: 'Boeing',
    category: 'widebody',
    capacity: 269,
    range: 11070,
    speed: 851,
    fuelBurn: 5000,
    price: 95000000,
    maintenanceCost: 4750000,
    unlockRevenue: 35000000,
  },
  {
    id: 'a330',
    name: 'Airbus A330-300',
    manufacturer: 'Airbus',
    category: 'widebody',
    capacity: 295,
    range: 11750,
    speed: 871,
    fuelBurn: 5400,
    price: 110000000,
    maintenanceCost: 5500000,
    unlockRevenue: 40000000,
  },
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
    id: 'a350_1000',
    name: 'Airbus A350-1000',
    manufacturer: 'Airbus',
    category: 'widebody',
    capacity: 366,
    range: 16100,
    speed: 903,
    fuelBurn: 6200,
    price: 165000000,
    maintenanceCost: 8250000,
    unlockRevenue: 75000000,
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
  {
    id: 'b777x',
    name: 'Boeing 777-9X',
    manufacturer: 'Boeing',
    category: 'widebody',
    capacity: 426,
    range: 13940,
    speed: 905,
    fuelBurn: 6500,
    price: 200000000,
    maintenanceCost: 10000000,
    unlockRevenue: 125000000,
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

  // Crew cost: $400-800 per flight hour based on aircraft size
  const crewCost = aircraft.category === 'turboprop' ? 400 :
                   aircraft.category === 'regional' ? 500 :
                   aircraft.category === 'narrowbody' ? 600 :
                   aircraft.category === 'widebody' ? 700 : 800;
  const totalCrewCost = crewCost * flightHours;

  // Airport fees: per flight based on aircraft size
  const airportFees = aircraft.category === 'turboprop' ? 1500 :
                      aircraft.category === 'regional' ? 2000 :
                      aircraft.category === 'narrowbody' ? 3000 :
                      aircraft.category === 'widebody' ? 4500 : 5000;

  // Maintenance: 5% of aircraft value annually / 2000 flight hours
  const maintenanceCost = (aircraft.price * 0.05 / 2000) * flightHours;

  return fuelCost + totalCrewCost + airportFees + maintenanceCost;
}
