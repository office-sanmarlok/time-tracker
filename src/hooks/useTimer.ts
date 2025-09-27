/**
 * @file src/hooks/useTimer.ts
 * @description React hook for managing timer updates
 * @purpose Provide real-time timer updates to components with proper cleanup
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { TimerService } from '@/services/TimerService';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

/**
 * Hook for timer functionality
 */
export const useTimer = () => {
  const [currentDuration, setCurrentDuration] = useState(0);
  const timerService = useRef(TimerService.getInstance());

  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const timerState = useTimeTrackerStore(state => state.timerState);

  // Subscribe to timer updates
  useEffect(() => {
    if (!currentActivity || !timerState) {
      setCurrentDuration(0);
      return;
    }

    // Start or resume timer
    timerService.current.resume(timerState.startTime);

    // Subscribe to updates
    const unsubscribe = timerService.current.subscribe((duration) => {
      setCurrentDuration(duration);
    });

    return () => {
      unsubscribe();
      timerService.current.stop();
    };
  }, [currentActivity, timerState]);

  // Format duration for display
  const formatDuration = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number): string => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, []);

  return {
    currentDuration,
    formattedDuration: formatDuration(currentDuration),
    isRunning: currentActivity !== null
  };
};

/**
 * Hook for activity timer on a button
 */
export const useActivityTimer = (buttonId: string) => {
  const { currentDuration, formattedDuration, isRunning } = useTimer();

  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const isActive = currentActivity?.buttonId === buttonId;

  return {
    duration: isActive ? currentDuration : 0,
    formattedDuration: isActive ? formattedDuration : '',
    isActive,
    isRunning: isActive && isRunning
  };
};