/**
 * @file src/services/StorageService.ts
 * @description Handles all data persistence operations with AsyncStorage
 * @purpose Provide a centralized service for storing and retrieving app data with error handling and retry logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Activity,
  ActivityButton,
  AppSettings,
  StoredActivities
} from '@/types/models';
import {
  STORAGE_KEYS,
  STORAGE_CONFIG,
  StorageKey
} from '@/constants/storage';

/**
 * StorageService handles all AsyncStorage operations
 * Includes retry logic, error handling, and data validation
 */
export class StorageService {
  private static instance: StorageService;
  private retryDelays = new Map<string, NodeJS.Timeout>();

  /**
   * Get singleton instance
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Generic method to save data with retry logic
   */
  private async saveWithRetry<T>(
    key: StorageKey,
    data: T,
    attempt: number = 0
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await AsyncStorage.setItem(key, serialized);

      // Clear any pending retry for this key
      const retryTimeout = this.retryDelays.get(key);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        this.retryDelays.delete(key);
      }
    } catch (error) {
      if (attempt < STORAGE_CONFIG.MAX_RETRY_ATTEMPTS) {
        // Schedule retry with exponential backoff
        const delay = STORAGE_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);

        return new Promise((resolve, reject) => {
          const timeout = setTimeout(async () => {
            try {
              await this.saveWithRetry(key, data, attempt + 1);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, delay);

          this.retryDelays.set(key, timeout);
        });
      } else {
        console.error(`Failed to save to ${key} after ${attempt} attempts:`, error);
        throw error;
      }
    }
  }

  /**
   * Generic method to load data with error handling
   */
  private async loadWithRetry<T>(
    key: StorageKey,
    defaultValue: T,
    attempt: number = 0
  ): Promise<T> {
    try {
      const serialized = await AsyncStorage.getItem(key);
      if (serialized === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(serialized);

      // Convert date strings back to Date objects
      if (key === STORAGE_KEYS.CURRENT_ACTIVITY && parsed) {
        parsed.startTime = new Date(parsed.startTime);
        if (parsed.endTime) {
          parsed.endTime = new Date(parsed.endTime);
        }
      }

      if (key === STORAGE_KEYS.BUTTONS && Array.isArray(parsed)) {
        parsed.forEach((button: ActivityButton) => {
          button.createdAt = new Date(button.createdAt);
          button.updatedAt = new Date(button.updatedAt);
        });
      }

      if (key === STORAGE_KEYS.ACTIVITIES) {
        Object.keys(parsed).forEach(date => {
          parsed[date].forEach((activity: Activity) => {
            activity.startTime = new Date(activity.startTime);
            if (activity.endTime) {
              activity.endTime = new Date(activity.endTime);
            }
          });
        });
      }

      return parsed;
    } catch (error) {
      if (attempt < STORAGE_CONFIG.MAX_RETRY_ATTEMPTS) {
        const delay = STORAGE_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.loadWithRetry(key, defaultValue, attempt + 1);
      } else {
        console.error(`Failed to load from ${key} after ${attempt} attempts:`, error);
        return defaultValue;
      }
    }
  }

  /**
   * Save current activity
   */
  async saveCurrentActivity(activity: Activity | null): Promise<void> {
    if (activity === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);
    } else {
      await this.saveWithRetry(STORAGE_KEYS.CURRENT_ACTIVITY, activity);
    }
  }

  /**
   * Load current activity
   */
  async loadCurrentActivity(): Promise<Activity | null> {
    return this.loadWithRetry<Activity | null>(
      STORAGE_KEYS.CURRENT_ACTIVITY,
      null
    );
  }

  /**
   * Save buttons configuration
   */
  async saveButtons(buttons: ActivityButton[]): Promise<void> {
    await this.saveWithRetry(STORAGE_KEYS.BUTTONS, buttons);
  }

  /**
   * Load buttons configuration
   */
  async loadButtons(): Promise<ActivityButton[]> {
    return this.loadWithRetry<ActivityButton[]>(
      STORAGE_KEYS.BUTTONS,
      []
    );
  }

  /**
   * Save activities history
   * Groups activities by date for efficient storage
   */
  async saveActivities(activities: Activity[]): Promise<void> {
    // Group activities by date
    const grouped: StoredActivities = {};

    activities.forEach(activity => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });

    // Remove old activities beyond retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STORAGE_CONFIG.MAX_ACTIVITY_AGE_DAYS);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    Object.keys(grouped).forEach(date => {
      if (date < cutoffDateStr) {
        delete grouped[date];
      }
    });

    await this.saveWithRetry(STORAGE_KEYS.ACTIVITIES, grouped);
  }

  /**
   * Load activities history
   * Can load all or specific date range
   */
  async loadActivities(date?: string): Promise<Activity[]> {
    const stored = await this.loadWithRetry<StoredActivities>(
      STORAGE_KEYS.ACTIVITIES,
      {}
    );

    if (date) {
      return stored[date] || [];
    }

    // Return all activities flattened
    const activities: Activity[] = [];
    Object.values(stored).forEach(dayActivities => {
      activities.push(...dayActivities);
    });

    return activities;
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    await this.saveWithRetry(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Load app settings
   */
  async loadSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      gridColumns: 3,
      hapticEnabled: true,
      theme: 'auto'
    };

    return this.loadWithRetry<AppSettings>(
      STORAGE_KEYS.SETTINGS,
      defaultSettings
    );
  }

  /**
   * Load all data at once (for app startup)
   */
  async loadAllData(): Promise<{
    currentActivity: Activity | null;
    buttons: ActivityButton[];
    activities: Activity[];
    settings: AppSettings;
  }> {
    const [currentActivity, buttons, activities, settings] = await Promise.all([
      this.loadCurrentActivity(),
      this.loadButtons(),
      this.loadActivities(),
      this.loadSettings()
    ]);

    return {
      currentActivity,
      buttons,
      activities,
      settings
    };
  }

  /**
   * Clear all stored data (for debugging/reset)
   */
  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  /**
   * Get storage size info (for debugging)
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    totalSize: number;
    breakdown: Record<string, number>;
  }> {
    const keys = await AsyncStorage.getAllKeys();
    const breakdown: Record<string, number> = {};
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        breakdown[key] = size;
        totalSize += size;
      }
    }

    return {
      totalKeys: keys.length,
      totalSize,
      breakdown
    };
  }
}