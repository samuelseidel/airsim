import { openDB } from 'idb';

const DB_NAME = 'AirSimDB';
const DB_VERSION = 1;
const SAVE_STORE = 'saves';
const AUTO_SAVE_STORE = 'autoSaves';

// Track IndexedDB availability (false in private browsing mode)
let isIndexedDBAvailable = true;
let indexedDBError = null;

// Check if IndexedDB is available (fails in private browsing mode)
async function checkIndexedDBAvailability() {
  try {
    const testDB = await openDB('__airsim_test__', 1);
    await testDB.close();
    await testDB.deleteDB;
    return true;
  } catch (error) {
    console.warn('IndexedDB not available:', error.message);
    indexedDBError = error.message;
    return false;
  }
}

// Initialize availability check
checkIndexedDBAvailability().then(available => {
  isIndexedDBAvailable = available;
  if (!available) {
    console.warn('Save system disabled: IndexedDB unavailable (possibly private browsing mode)');
  }
});

// Initialize the database
async function initDB() {
  if (!isIndexedDBAvailable) {
    throw new Error(`IndexedDB unavailable: ${indexedDBError || 'Unknown error'}. Please disable private browsing mode to use save features.`);
  }

  try {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create save stores if they don't exist
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
    indexedDBError = error.message;
    throw error;
  }
}

// Serialize game state for saving
function serializeState(state) {
  return {
    cash: state.cash,
    weeklyRevenue: state.weeklyRevenue,
    weeklyExpenses: state.weeklyExpenses,
    gameTime: state.gameTime,
    gameSpeed: state.gameSpeed,
    gameWeek: state.gameWeek,
    fleet: state.fleet,
    routes: state.routes,
    nextRouteId: state.nextRouteId,
    staff: state.staff,
    timestamp: Date.now(),
  };
}

// Manual save
export async function saveGame(state, saveName) {
  try {
    const db = await initDB();
    const serializedState = serializeState(state);

    const saveData = {
      id: Date.now(),
      name: saveName,
      data: serializedState,
      timestamp: Date.now(),
    };

    await db.put(SAVE_STORE, saveData);
    return { success: true, id: saveData.id };
  } catch (error) {
    console.error('Failed to save game:', error);
    return { success: false, error: error.message };
  }
}

// Auto-save (rotating 3 slots)
export async function autoSave(state) {
  try {
    const db = await initDB();
    const serializedState = serializeState(state);

    // Get current auto-saves to determine next slot
    const saves = await db.getAll(AUTO_SAVE_STORE);
    const nextSlot = saves.length === 0 ? 0 : (saves[saves.length - 1].slot + 1) % 3;

    const saveData = {
      slot: nextSlot,
      data: serializedState,
      timestamp: Date.now(),
    };

    await db.put(AUTO_SAVE_STORE, saveData);
    return { success: true, slot: nextSlot };
  } catch (error) {
    console.error('Failed to auto-save:', error);
    return { success: false, error: error.message };
  }
}

// Load game by ID
export async function loadGame(saveId) {
  try {
    const db = await initDB();
    const save = await db.get(SAVE_STORE, saveId);

    if (!save) {
      return { success: false, error: 'Save not found' };
    }

    return { success: true, data: save.data };
  } catch (error) {
    console.error('Failed to load game:', error);
    return { success: false, error: error.message };
  }
}

// Load latest auto-save
export async function loadAutoSave() {
  try {
    const db = await initDB();
    const saves = await db.getAll(AUTO_SAVE_STORE);

    if (saves.length === 0) {
      return { success: false, error: 'No auto-saves found' };
    }

    // Get most recent auto-save
    const latestSave = saves.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );

    return { success: true, data: latestSave.data };
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return { success: false, error: error.message };
  }
}

// List all manual saves
export async function listSaves() {
  try {
    const db = await initDB();
    const saves = await db.getAll(SAVE_STORE);

    return {
      success: true,
      saves: saves.map(s => ({
        id: s.id,
        name: s.name,
        timestamp: s.timestamp,
        week: s.data.gameWeek,
        cash: s.data.cash,
      }))
    };
  } catch (error) {
    console.error('Failed to list saves:', error);
    return { success: false, error: error.message };
  }
}

// Delete save
export async function deleteSave(saveId) {
  try {
    const db = await initDB();
    await db.delete(SAVE_STORE, saveId);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete save:', error);
    return { success: false, error: error.message };
  }
}
