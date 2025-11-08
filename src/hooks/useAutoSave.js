import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { autoSave } from '../utils/saveSystem';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 5000; // 5 seconds

export default function useAutoSave() {
  const gameState = useGameStore();
  const lastSaveTimeRef = useRef(Date.now());
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const performAutoSave = async () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // Only auto-save if enough time has passed
      if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
        const result = await autoSave(gameState);
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
  }, [
    gameState.cash,
    gameState.routes,
    gameState.fleet,
    gameState.gameWeek,
  ]);
}
