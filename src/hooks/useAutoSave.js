import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { autoSave } from '../utils/saveSystem';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 5000; // 5 seconds

export default function useAutoSave() {
  const lastSaveTimeRef = useRef(Date.now());
  const debounceTimerRef = useRef(null);

  // Only subscribe to specific fields to prevent excessive re-renders
  const cash = useGameStore(state => state.cash);
  const routes = useGameStore(state => state.routes);
  const fleet = useGameStore(state => state.fleet);
  const gameWeek = useGameStore(state => state.gameWeek);

  useEffect(() => {
    const performAutoSave = async () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // Only auto-save if enough time has passed
      if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
        // Get full state only when actually saving
        const fullState = useGameStore.getState();
        const result = await autoSave(fullState);
        if (result.success) {
          lastSaveTimeRef.current = now;
          console.log('Auto-saved to slot', result.slot);
        }
      }
    };

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cash, routes, fleet, gameWeek]);
}
