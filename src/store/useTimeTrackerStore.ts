/**
 * @file src/store/useTimeTrackerStore.ts
 * @description Main Zustand store for the Time Tracker app
 * @purpose Centralized state management with persistence and computed values
 */

import { create } from 'zustand';
import {
  Activity,
  ActivityButton,
  AppSettings,
  TimerState
} from '@/types/models';
import { StorageService } from '@/services/StorageService';
import { MigrationService } from '@/services/MigrationService';
import {
  generateId,
  generateActivityId,
  generateNextPosition
} from '@/utils/idUtils';
import {
  getTodayKey,
  calculateDuration,
  splitActivityAtMidnight,
  formatDateKey,
  getDayBounds
} from '@/utils/dateUtils';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';
import { getStarterButtons } from '@/constants/defaultButtons';

/**
 * Store state interface
 */
interface TimeTrackerState {
  // Core state
  currentActivity: Activity | null;
  buttons: ActivityButton[];
  activities: Activity[];
  settings: AppSettings;

  // UI state
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;

  // Timer state
  timerState: TimerState | null;

  // Actions - Activity management
  startActivity: (buttonId: string) => Promise<void>;
  stopCurrentActivity: () => Promise<void>;
  switchActivity: (buttonId: string) => Promise<void>;

  // Actions - Button management
  addButton: (button: Partial<ActivityButton>) => Promise<void>;
  updateButton: (id: string, updates: Partial<ActivityButton>) => Promise<void>;
  deleteButton: (id: string) => Promise<void>;
  reorderButtons: (newOrder: string[]) => Promise<void>;
  addPresetButton: (buttonName: string) => Promise<void>;

  // Actions - Settings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  toggleEditMode: () => void;

  // Actions - Data management
  loadData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;

  // Computed values
  getTodayActivities: () => Activity[];
  getVisibleButtons: () => ActivityButton[];
  getAvailablePresets: () => ActivityButton[];
  getCurrentDuration: () => number;
}

/**
 * Create the Time Tracker store
 */
export const useTimeTrackerStore = create<TimeTrackerState>((set, get) => ({
    // Initial state
    currentActivity: null,
    buttons: [],
    activities: [],
    settings: {
      gridColumns: 3,
      hapticEnabled: true,
      theme: 'auto'
    },
    isEditMode: false,
    isLoading: true,
    error: null,
    timerState: null,

    /**
     * Start tracking a new activity
     */
    startActivity: async (buttonId: string) => {
      const state = get();
      const button = state.buttons.find(b => b.id === buttonId);

      if (!button) {
        console.error(`Button with id ${buttonId} not found`);
        return;
      }

      // Stop current activity first (will save blank time if needed)
      if (state.currentActivity) {
        // If current is blank, just stop it without creating a new blank
        if (state.currentActivity.buttonId === 'blank') {
          const endTime = new Date();
          const duration = calculateDuration(state.currentActivity.startTime, endTime);
          
          const completedBlank: Activity = {
            ...state.currentActivity,
            endTime,
            duration
          };

          const splitActivities = splitActivityAtMidnight({
            ...completedBlank,
            endTime
          });

          // Update activities with completed blank
          set(state => ({
            activities: [...state.activities, ...splitActivities]
          }));

          await StorageService.getInstance().saveActivities([...state.activities, ...splitActivities]);
        } else {
          // Regular activity - use existing stop logic
          await get().stopCurrentActivity();
          // After stopping, we now have a blank activity running - stop it
          const blankActivity = get().currentActivity;
          if (blankActivity && blankActivity.buttonId === 'blank') {
            const endTime = new Date();
            const duration = calculateDuration(blankActivity.startTime, endTime);
            
            const completedBlank: Activity = {
              ...blankActivity,
              endTime,
              duration
            };

            if (duration > 0) { // Only save if there's actual duration
              const splitActivities = splitActivityAtMidnight({
                ...completedBlank,
                endTime
              });
              
              set(state => ({
                activities: [...state.activities, ...splitActivities]
              }));
              
              await StorageService.getInstance().saveActivities([...get().activities]);
            }
          }
        }
      }

      // Start new activity
      const startTime = new Date();
      const newActivity: Activity = {
        id: generateId(),
        buttonId: button.id,
        startTime,
        color: button.color,
        date: formatDateKey(startTime)
      };

      // Update state
      set({
        currentActivity: newActivity,
        timerState: {
          startTime,
          currentDuration: 0
        }
      });

      // Trigger haptic feedback
      if (state.settings.hapticEnabled) {
        await triggerHaptic(HAPTIC_PATTERNS.activityStart, true);
      }

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveCurrentActivity(newActivity);
    },

    /**
     * Stop the current activity
     */
    stopCurrentActivity: async () => {
      const state = get();

      if (!state.currentActivity) {
        return;
      }

      // Calculate end time and duration
      const endTime = new Date();
      const duration = calculateDuration(state.currentActivity.startTime, endTime);

      // Create completed activity
      const completedActivity: Activity = {
        ...state.currentActivity,
        endTime,
        duration
      };

      // Split activity at midnight if it crosses date boundaries
      const splitActivities = splitActivityAtMidnight({
        ...completedActivity,
        endTime: endTime // Ensure endTime is not undefined for splitting
      });

      // Start blank activity immediately after stopping current one
      const blankActivity: Activity = {
        id: generateId(),
        buttonId: 'blank',
        startTime: endTime,
        color: '#EBEBEB',
        date: formatDateKey(endTime)
      };

      // Update state with blank activity
      set(state => ({
        currentActivity: blankActivity,
        timerState: {
          startTime: endTime,
          currentDuration: 0
        },
        activities: [...state.activities, ...splitActivities]
      }));

      // Trigger haptic feedback
      if (state.settings.hapticEnabled) {
        await triggerHaptic(HAPTIC_PATTERNS.activityStop, true);
      }

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveCurrentActivity(blankActivity);
      await storage.saveActivities([...state.activities, ...splitActivities]);
    },

    /**
     * Switch to a different activity
     */
    switchActivity: async (buttonId: string) => {
      const state = get();

      if (state.currentActivity?.buttonId === buttonId) {
        // Same activity, just stop it
        await state.stopCurrentActivity();
      } else {
        // Switch to new activity
        await state.startActivity(buttonId);
      }

      // Trigger haptic for switch
      if (state.settings.hapticEnabled) {
        await triggerHaptic(HAPTIC_PATTERNS.activitySwitch, true);
      }
    },

    /**
     * Add a new button
     */
    addButton: async (buttonData: Partial<ActivityButton>) => {
      const state = get();
      const positions = state.buttons.map(b => b.position);

      const newButton: ActivityButton = {
        id: generateId(),
        name: buttonData.name || 'New Activity',
        color: buttonData.color || '#007AFF',
        icon: buttonData.icon || '⭐',
        isDefault: false,
        position: generateNextPosition(positions),
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...buttonData
      };

      const updatedButtons = [...state.buttons, newButton];

      set({ buttons: updatedButtons });

      // Trigger haptic feedback
      if (state.settings.hapticEnabled) {
        await triggerHaptic(HAPTIC_PATTERNS.addSuccess, true);
      }

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveButtons(updatedButtons);
    },

    /**
     * Update an existing button
     */
    updateButton: async (id: string, updates: Partial<ActivityButton>) => {
      const state = get();

      const updatedButtons = state.buttons.map(button =>
        button.id === id
          ? { ...button, ...updates, updatedAt: new Date() }
          : button
      );

      set({ buttons: updatedButtons });

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveButtons(updatedButtons);
    },

    /**
     * Soft delete a button (hide from grid but preserve data)
     */
    deleteButton: async (id: string) => {
      const state = get();

      const updatedButtons = state.buttons.map(button =>
        button.id === id
          ? { ...button, isVisible: false, updatedAt: new Date() }
          : button
      );

      set({ buttons: updatedButtons });

      // Trigger haptic feedback
      if (state.settings.hapticEnabled) {
        await triggerHaptic(HAPTIC_PATTERNS.deleteConfirm, true);
      }

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveButtons(updatedButtons);
    },

    /**
     * Reorder buttons in the grid
     */
    reorderButtons: async (newOrder: string[]) => {
      const state = get();

      // Update positions based on new order
      const updatedButtons = state.buttons.map(button => {
        const index = newOrder.indexOf(button.id);
        if (index !== -1) {
          return { ...button, position: index };
        }
        return button;
      });

      set({ buttons: updatedButtons });

      // Save to storage (async, no await)
      const storage = StorageService.getInstance();
      storage.saveButtons(updatedButtons);
    },

    /**
     * Add a preset button from defaults
     */
    addPresetButton: async (buttonName: string) => {
      const state = get();
      const presetButtons = getStarterButtons();
      const preset = presetButtons.find(b => b.name === buttonName);

      if (!preset) {
        console.error('Preset button not found:', buttonName);
        return;
      }

      await state.addButton({
        ...preset,
        isDefault: true,
        isVisible: true
      });
    },

    /**
     * Update app settings
     */
    updateSettings: async (updates: Partial<AppSettings>) => {
      const state = get();
      const updatedSettings = { ...state.settings, ...updates };

      set({ settings: updatedSettings });

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveSettings(updatedSettings);
    },

    /**
     * Toggle edit mode
     */
    toggleEditMode: () => {
      set(state => ({ isEditMode: !state.isEditMode }));
    },

    /**
     * Load all data from storage
     */
    loadData: async () => {
      set({ isLoading: true, error: null });

      try {
        // Run migrations first
        const migrationService = MigrationService.getInstance();
        await migrationService.migrate();

        // Load data from storage
        const storage = StorageService.getInstance();
        const data = await storage.loadAllData();

        // Resume current activity if exists (crash recovery)
        let timerState: TimerState | null = null;
        let recoveredActivity = data.currentActivity;

        if (recoveredActivity) {
          const now = new Date();
          const startTime = new Date(recoveredActivity.startTime);

          // Check if activity is too old (> 24 hours)
          const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          if (hoursSinceStart > 24) {
            console.log('Recovered activity is too old, auto-stopping it');
            // Auto-stop the old activity
            const endTime = new Date(startTime.getTime() + (8 * 60 * 60 * 1000)); // Assume 8 hours
            recoveredActivity = {
              ...recoveredActivity,
              endTime,
              duration: 8 * 60 * 60 // 8 hours in seconds
            };

            // Save as completed activity
            const activities = splitActivityAtMidnight(recoveredActivity as Activity & { endTime: Date });
            data.activities = [...data.activities, ...activities];
            await storage.saveActivities(data.activities);

            // Clear current activity
            recoveredActivity = null;
            await storage.saveCurrentActivity(null);
          } else {
            // Check if the activity crosses interval boundaries
            const activityInterval = formatDateKey(startTime);
            const currentInterval = getTodayKey();

            if (activityInterval !== currentInterval) {
              // Activity started in a previous interval, split it
              console.log('Current activity crosses interval boundary, splitting...');

              // Get the start of the current interval
              const currentIntervalBounds = getDayBounds(now);
              const intervalStart = currentIntervalBounds.start;

              const previousIntervalActivity = {
                ...recoveredActivity,
                endTime: intervalStart,
                duration: calculateDuration(startTime, intervalStart)
              };

              // Split the previous portion (in case it spans multiple intervals)
              const splitActivities = splitActivityAtMidnight(previousIntervalActivity);
              data.activities = [...data.activities, ...splitActivities];
              await storage.saveActivities(data.activities);

              // Update current activity to start from current interval
              recoveredActivity = {
                ...recoveredActivity,
                startTime: intervalStart,
                date: currentInterval
              };
              await storage.saveCurrentActivity(recoveredActivity);

              // Update timer state
              timerState = {
                startTime: intervalStart,
                currentDuration: calculateDuration(intervalStart, now)
              };
              console.log('Split activity at interval boundary and resumed from current interval');
            } else {
              // Activity started today, resume normally
              timerState = {
                startTime,
                currentDuration: calculateDuration(startTime, now)
              };
              console.log('Resumed activity timer from crash/restart');
            }
          }
        }

        // Check for first launch and initialize with starter buttons
        let finalButtons = data.buttons;
        if (data.buttons.length === 0) {
          console.log('First launch detected - initializing with starter buttons');
          const starterButtons = getStarterButtons();

          // Create 3 visible starter buttons
          const initialButtons: ActivityButton[] = [
            starterButtons[1], // Work
            starterButtons[2], // Meal
            starterButtons[3], // Exercise
          ].map((button, index) => ({
            ...button,
            id: generateId(),
            isVisible: true,
            position: index,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          // Add remaining buttons as hidden presets
          const hiddenButtons: ActivityButton[] = [
            starterButtons[0], // Sleep
            ...starterButtons.slice(4) // Rest of presets
          ].map((button, index) => ({
            ...button,
            id: generateId(),
            isVisible: false,
            position: initialButtons.length + index,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          finalButtons = [...initialButtons, ...hiddenButtons];

          // Save the initial buttons
          await StorageService.getInstance().saveButtons(finalButtons);
        }

        // If no activity is recovered, start blank activity
        if (!recoveredActivity) {
          const now = new Date();
          const blankActivity: Activity = {
            id: generateId(),
            buttonId: 'blank',
            startTime: now,
            color: '#EBEBEB',
            date: formatDateKey(now)
          };
          
          recoveredActivity = blankActivity;
          timerState = {
            startTime: now,
            currentDuration: 0
          };
          
          await storage.saveCurrentActivity(blankActivity);
        }

        set({
          currentActivity: recoveredActivity,
          buttons: finalButtons,
          activities: data.activities,
          settings: data.settings,
          timerState,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        set({
          error: 'Failed to load data',
          isLoading: false
        });
      }
    },

    /**
     * Clear all data (for debugging/reset)
     */
    clearAllData: async () => {
      const storage = StorageService.getInstance();
      await storage.clearAllData();

      set({
        currentActivity: null,
        buttons: [],
        activities: [],
        timerState: null
      });
    },

    /**
     * Delete a specific activity
     */
    deleteActivity: async (activityId: string) => {
      const state = get();
      const updatedActivities = state.activities.filter(a => a.id !== activityId);

      set({ activities: updatedActivities });

      // Save to storage
      const storage = StorageService.getInstance();
      await storage.saveActivities(updatedActivities);
    },

    /**
     * Get today's activities
     */
    getTodayActivities: () => {
      const state = get();
      const today = getTodayKey();
      return state.activities.filter(a => a.date === today);
    },

    /**
     * Get visible buttons for grid display
     */
    getVisibleButtons: () => {
      const state = get();
      return state.buttons
        .filter(b => b.isVisible)
        .sort((a, b) => a.position - b.position);
    },

    /**
     * Get available preset buttons
     */
    getAvailablePresets: () => {
      const state = get();
      const visibleNames = new Set(
        state.buttons
          .filter(b => b.isVisible && b.isDefault)
          .map(b => b.name)
      );

      return getStarterButtons().filter(b => !visibleNames.has(b.name)) as ActivityButton[];
    },

    /**
     * Get current activity duration
     */
    getCurrentDuration: () => {
      const state = get();
      if (!state.currentActivity || !state.timerState) {
        return 0;
      }
      return state.timerState.currentDuration;
    }
  })
);