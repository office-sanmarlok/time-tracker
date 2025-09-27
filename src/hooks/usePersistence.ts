/**
 * @file src/hooks/usePersistence.ts
 * @description React hook for data persistence
 * @purpose Auto-save store changes to AsyncStorage with debouncing
 */

import { useEffect, useRef } from 'react';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { StorageService } from '@/services/StorageService';
import { STORAGE_CONFIG } from '@/constants/storage';

/**
 * Hook for automatic data persistence
 */
export const usePersistence = () => {
  const storageService = useRef(StorageService.getInstance());
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useTimeTrackerStore.subscribe(
      (state) => ({
        buttons: state.buttons,
        activities: state.activities,
        settings: state.settings,
        currentActivity: state.currentActivity
      }),
      async (current, previous) => {
        // Clear existing timeouts
        const clearTimeoutForKey = (key: string) => {
          if (saveTimeouts.current[key]) {
            clearTimeout(saveTimeouts.current[key]);
            delete saveTimeouts.current[key];
          }
        };

        // Save buttons if changed
        if (current.buttons !== previous.buttons) {
          clearTimeoutForKey('buttons');
          saveTimeouts.current.buttons = setTimeout(async () => {
            await storageService.current.saveButtons(current.buttons);
            delete saveTimeouts.current.buttons;
          }, STORAGE_CONFIG.WRITE_DEBOUNCE_MS);
        }

        // Save activities if changed
        if (current.activities !== previous.activities) {
          clearTimeoutForKey('activities');
          saveTimeouts.current.activities = setTimeout(async () => {
            await storageService.current.saveActivities(current.activities);
            delete saveTimeouts.current.activities;
          }, STORAGE_CONFIG.WRITE_DEBOUNCE_MS);
        }

        // Save settings if changed
        if (current.settings !== previous.settings) {
          clearTimeoutForKey('settings');
          saveTimeouts.current.settings = setTimeout(async () => {
            await storageService.current.saveSettings(current.settings);
            delete saveTimeouts.current.settings;
          }, STORAGE_CONFIG.WRITE_DEBOUNCE_MS);
        }

        // Save current activity immediately (no debounce)
        if (current.currentActivity !== previous.currentActivity) {
          await storageService.current.saveCurrentActivity(current.currentActivity);
        }
      }
    );

    return () => {
      unsubscribe();

      // Clear all pending timeouts
      Object.values(saveTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return null;
};