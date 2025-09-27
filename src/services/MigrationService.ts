/**
 * @file src/services/MigrationService.ts
 * @description Handles data schema migrations between app versions
 * @purpose Ensure data compatibility when upgrading the app with schema changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '@/constants/storage';
import { StorageService } from './StorageService';
import { getStarterButtons } from '@/constants/defaultButtons';
import { ActivityButton } from '@/types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Migration function type
 */
type MigrationFunction = () => Promise<void>;

/**
 * Migration registry entry
 */
interface Migration {
  version: number;
  description: string;
  migrate: MigrationFunction;
}

/**
 * MigrationService handles schema versioning and data migrations
 * Ensures backward compatibility when app structure changes
 */
export class MigrationService {
  private static instance: MigrationService;
  private storageService: StorageService;
  private migrations: Migration[] = [];

  private constructor() {
    this.storageService = StorageService.getInstance();
    this.registerMigrations();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Register all migrations in order
   */
  private registerMigrations(): void {
    // Migration to v1 - Initial schema
    this.migrations.push({
      version: 1,
      description: 'Initial schema setup with starter buttons',
      migrate: async () => {
        await this.migrateToV1();
      }
    });

    // Future migrations would be added here
    // Example:
    // this.migrations.push({
    //   version: 2,
    //   description: 'Add tags to activities',
    //   migrate: async () => {
    //     await this.migrateToV2();
    //   }
    // });
  }

  /**
   * Check current schema version
   */
  async getCurrentVersion(): Promise<number> {
    try {
      const versionStr = await AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      if (versionStr === null) {
        return 0; // No version means fresh install
      }
      return parseInt(versionStr, 10);
    } catch (error) {
      console.error('Error reading schema version:', error);
      return 0;
    }
  }

  /**
   * Set schema version
   */
  async setVersion(version: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, version.toString());
  }

  /**
   * Run all necessary migrations
   */
  async migrate(): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();

      console.log(`Current schema version: ${currentVersion}`);
      console.log(`Target schema version: ${CURRENT_SCHEMA_VERSION}`);

      if (currentVersion >= CURRENT_SCHEMA_VERSION) {
        console.log('No migrations needed');
        return;
      }

      // Run migrations in sequence
      for (const migration of this.migrations) {
        if (migration.version > currentVersion && migration.version <= CURRENT_SCHEMA_VERSION) {
          console.log(`Running migration ${migration.version}: ${migration.description}`);

          try {
            await migration.migrate();
            await this.setVersion(migration.version);
            console.log(`Migration ${migration.version} completed successfully`);
          } catch (error) {
            console.error(`Migration ${migration.version} failed:`, error);
            throw new Error(`Failed to migrate to version ${migration.version}: ${error}`);
          }
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration process failed:', error);
      throw error;
    }
  }

  /**
   * Migration to v1 - Initial setup
   * Creates starter buttons and default settings
   */
  private async migrateToV1(): Promise<void> {
    // Check if buttons already exist
    const existingButtons = await this.storageService.loadButtons();

    if (existingButtons.length === 0) {
      // Create starter buttons for first launch
      const starterButtons = getStarterButtons();
      const buttonsToCreate: ActivityButton[] = starterButtons.map((button, index) => ({
        ...button,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        position: index,
        isVisible: true
      }));

      await this.storageService.saveButtons(buttonsToCreate);
      console.log('Created starter buttons:', buttonsToCreate.map(b => b.name));
    }

    // Initialize default settings if not present
    const settings = await this.storageService.loadSettings();
    await this.storageService.saveSettings(settings); // This will save defaults if not present
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion < CURRENT_SCHEMA_VERSION;
  }

  /**
   * Reset schema version (for debugging)
   * WARNING: This should only be used in development
   */
  async resetSchemaVersion(): Promise<void> {
    if (__DEV__) {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
      console.warn('Schema version has been reset');
    } else {
      console.error('Schema version reset is only allowed in development');
    }
  }

  /**
   * Get migration history
   */
  getMigrationHistory(): { version: number; description: string }[] {
    return this.migrations.map(m => ({
      version: m.version,
      description: m.description
    }));
  }

  /**
   * Validate data integrity after migration
   */
  async validateDataIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Check if all required keys exist
      const data = await this.storageService.loadAllData();

      // Validate buttons
      if (!Array.isArray(data.buttons)) {
        errors.push('Buttons data is not an array');
      } else {
        data.buttons.forEach((button, index) => {
          if (!button.id || !button.name || !button.color || !button.icon) {
            errors.push(`Button at index ${index} is missing required fields`);
          }
        });
      }

      // Validate activities
      if (!Array.isArray(data.activities)) {
        errors.push('Activities data is not an array');
      } else {
        data.activities.forEach((activity, index) => {
          if (!activity.id || !activity.buttonId || !activity.startTime) {
            errors.push(`Activity at index ${index} is missing required fields`);
          }
        });
      }

      // Validate settings
      if (typeof data.settings !== 'object') {
        errors.push('Settings data is not an object');
      }

      // Validate current activity if present
      if (data.currentActivity) {
        if (!data.currentActivity.id || !data.currentActivity.buttonId) {
          errors.push('Current activity is missing required fields');
        }
      }

    } catch (error) {
      errors.push(`Data validation error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}