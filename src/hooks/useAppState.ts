/**
 * @file src/hooks/useAppState.ts
 * @description React hook for managing app state changes
 * @purpose Handle app lifecycle events (background/foreground) for timer persistence
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TimerService } from '@/services/TimerService';
import { StorageService } from '@/services/StorageService';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

/**
 * Hook for handling app state changes
 */
export const useAppState = () => {
  const appState = useRef(AppState.currentState);
  const timerService = useRef(TimerService.getInstance());
  const storageService = useRef(StorageService.getInstance());

  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const activities = useTimeTrackerStore(state => state.activities);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Handle app coming to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground');

        // Notify timer service
        timerService.current.handleAppStateChange('active');

        // Reload data to ensure sync
        const store = useTimeTrackerStore.getState();
        await store.loadData();
      }

      // Handle app going to background
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to the background');

        // Notify timer service
        timerService.current.handleAppStateChange('background');

        // Save current state to storage
        if (currentActivity) {
          await storageService.current.saveCurrentActivity(currentActivity);
        }
        if (activities.length > 0) {
          await storageService.current.saveActivities(activities);
        }
      }

      appState.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [currentActivity, activities]);

  return {
    currentState: appState.current
  };
};