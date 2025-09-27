/**
 * @file src/utils/idUtils.ts
 * @description ID generation and validation utilities
 * @purpose Provide consistent ID generation and validation across the app
 */

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * Generate a new UUID v4
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Validate if a string is a valid UUID
 */
export const isValidId = (id: string): boolean => {
  return uuidValidate(id);
};

/**
 * Generate a temporary ID for optimistic updates
 * Prefixed with 'temp_' for easy identification
 */
export const generateTempId = (): string => {
  return `temp_${generateId()}`;
};

/**
 * Check if an ID is temporary
 */
export const isTempId = (id: string): boolean => {
  return id.startsWith('temp_');
};

/**
 * Generate a button position based on existing buttons
 */
export const generateNextPosition = (existingPositions: number[]): number => {
  if (existingPositions.length === 0) {
    return 0;
  }
  return Math.max(...existingPositions) + 1;
};

/**
 * Generate a unique activity ID with timestamp prefix
 * This helps with sorting and debugging
 */
export const generateActivityId = (): string => {
  const timestamp = Date.now();
  return `act_${timestamp}_${generateId()}`;
};

/**
 * Extract timestamp from activity ID
 */
export const extractTimestampFromActivityId = (id: string): number | null => {
  if (!id.startsWith('act_')) {
    return null;
  }

  const parts = id.split('_');
  if (parts.length < 2) {
    return null;
  }

  const timestamp = parseInt(parts[1], 10);
  return isNaN(timestamp) ? null : timestamp;
};