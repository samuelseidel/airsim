import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

export default function useGameLoop() {
  const tick = useGameStore(state => state.tick);
  const lastTimeRef = useRef(Date.now());
  const accumulatorRef = useRef(0);

  useEffect(() => {
    const FIXED_TIME_STEP = 1 / 60; // 60 FPS
    const MAX_DELTA = 0.25; // 250ms max to prevent spiral of death

    let animationFrameId;

    const gameLoop = () => {
      const currentTime = Date.now();
      let deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Clamp delta time to prevent huge jumps
      if (deltaTime > MAX_DELTA) {
        deltaTime = MAX_DELTA;
      }

      accumulatorRef.current += deltaTime;

      // Fixed time step updates
      while (accumulatorRef.current >= FIXED_TIME_STEP) {
        tick(FIXED_TIME_STEP);
        accumulatorRef.current -= FIXED_TIME_STEP;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty array - tick function is stable from Zustand
}
