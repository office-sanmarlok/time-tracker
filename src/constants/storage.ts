/**
 * @file src/constants/storage.ts
 * @description AsyncStorage keys and configuration
 * @purpose Define all storage keys and settings for data persistence
 */

/**
 * AsyncStorage keys for different data types
 */
export const STORAGE_KEYS = {
  CURRENT_ACTIVITY: '@time_tracker/current_activity',
  BUTTONS: '@time_tracker/buttons',
  ACTIVITIES: '@time_tracker/activities',
  SETTINGS: '@time_tracker/settings',
  SCHEMA_VERSION: '@time_tracker/schema_version'
} as const;

/**
 * Current schema version for migration tracking
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Storage configuration settings
 */
export const STORAGE_CONFIG = {
  // Maximum number of days to keep in memory
  MAX_DAYS_IN_MEMORY: 30,

  // Maximum age of activities to keep (in days)
  MAX_ACTIVITY_AGE_DAYS: 365,

  // Debounce time for storage writes (milliseconds)
  WRITE_DEBOUNCE_MS: 500,

  // Retry configuration for failed storage operations
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];