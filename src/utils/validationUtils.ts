/**
 * @file src/utils/validationUtils.ts
 * @description Data validation utilities
 * @purpose Ensure data integrity and type safety at runtime
 */

import { isValidId } from './idUtils';

/**
 * Validation result type
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate an Activity object
 */
export const validateActivity = (activity: any): ValidationResult => {
  const errors: string[] = [];

  if (!activity) {
    errors.push('Activity is null or undefined');
    return { isValid: false, errors };
  }

  // Required fields
  if (!activity.id || !isValidId(activity.id)) {
    errors.push('Invalid or missing activity ID');
  }

  if (!activity.buttonId || !isValidId(activity.buttonId)) {
    errors.push('Invalid or missing button ID reference');
  }

  if (!activity.startTime) {
    errors.push('Missing start time');
  } else if (!(activity.startTime instanceof Date)) {
    errors.push('Start time must be a Date object');
  }

  if (!activity.color || !/^#[0-9A-F]{6}$/i.test(activity.color)) {
    errors.push('Invalid or missing color (must be hex format)');
  }

  if (!activity.date || !/^\d{4}-\d{2}-\d{2}$/.test(activity.date)) {
    errors.push('Invalid or missing date (must be YYYY-MM-DD format)');
  }

  // Optional fields validation
  if (activity.endTime && !(activity.endTime instanceof Date)) {
    errors.push('End time must be a Date object');
  }

  if (activity.duration !== undefined && typeof activity.duration !== 'number') {
    errors.push('Duration must be a number');
  }

  if (activity.duration !== undefined && activity.duration < 0) {
    errors.push('Duration cannot be negative');
  }

  // Logical validation
  if (activity.startTime && activity.endTime) {
    if (activity.endTime < activity.startTime) {
      errors.push('End time cannot be before start time');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate an ActivityButton object
 */
export const validateActivityButton = (button: any): ValidationResult => {
  const errors: string[] = [];

  if (!button) {
    errors.push('Button is null or undefined');
    return { isValid: false, errors };
  }

  // Required fields
  if (!button.id || !isValidId(button.id)) {
    errors.push('Invalid or missing button ID');
  }

  if (!button.name || typeof button.name !== 'string') {
    errors.push('Invalid or missing button name');
  } else if (button.name.length > 50) {
    errors.push('Button name exceeds maximum length (50 characters)');
  }

  if (!button.color || !/^#[0-9A-F]{6}$/i.test(button.color)) {
    errors.push('Invalid or missing color (must be hex format)');
  }

  if (!button.icon || typeof button.icon !== 'string') {
    errors.push('Invalid or missing icon');
  } else if (button.icon.length > 2) {
    errors.push('Icon must be a single emoji character');
  }

  if (typeof button.isDefault !== 'boolean') {
    errors.push('isDefault must be a boolean');
  }

  if (typeof button.position !== 'number' || button.position < 0) {
    errors.push('Position must be a non-negative number');
  }

  if (typeof button.isVisible !== 'boolean') {
    errors.push('isVisible must be a boolean');
  }

  if (!button.createdAt || !(button.createdAt instanceof Date)) {
    errors.push('Invalid or missing creation date');
  }

  if (!button.updatedAt || !(button.updatedAt instanceof Date)) {
    errors.push('Invalid or missing update date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate AppSettings object
 */
export const validateAppSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (!settings) {
    errors.push('Settings is null or undefined');
    return { isValid: false, errors };
  }

  if (typeof settings.gridColumns !== 'number' || settings.gridColumns < 2 || settings.gridColumns > 4) {
    errors.push('Grid columns must be a number between 2 and 4');
  }

  if (typeof settings.hapticEnabled !== 'boolean') {
    errors.push('hapticEnabled must be a boolean');
  }

  if (!['light', 'dark', 'auto'].includes(settings.theme)) {
    errors.push('Theme must be one of: light, dark, auto');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate an array of activities for a day
 */
export const validateDayActivities = (activities: any[]): ValidationResult => {
  const errors: string[] = [];

  if (!Array.isArray(activities)) {
    errors.push('Activities must be an array');
    return { isValid: false, errors };
  }

  // Check for overlapping activities
  const sortedActivities = [...activities].sort((a, b) =>
    a.startTime.getTime() - b.startTime.getTime()
  );

  for (let i = 0; i < sortedActivities.length - 1; i++) {
    const current = sortedActivities[i];
    const next = sortedActivities[i + 1];

    if (current.endTime && current.endTime > next.startTime) {
      errors.push(`Activity ${current.id} overlaps with activity ${next.id}`);
    }
  }

  // Validate each activity
  activities.forEach((activity, index) => {
    const result = validateActivity(activity);
    if (!result.isValid) {
      errors.push(`Activity at index ${index}: ${result.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize user input for text fields
 */
export const sanitizeText = (text: string, maxLength: number = 50): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove control characters and trim
  let sanitized = text.replace(/[\x00-\x1F\x7F]/g, '').trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Validate hex color format
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Validate emoji character
 */
export const isValidEmoji = (emoji: string): boolean => {
  if (!emoji || emoji.length === 0 || emoji.length > 2) {
    return false;
  }

  // Basic emoji validation - checks for common emoji ranges
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(emoji);
};