/**
 * @file src/utils/dateUtils.ts
 * @description Date utility functions for the Time Tracker app
 * @purpose Provide consistent date formatting and manipulation functions
 */

import { format, startOfDay, endOfDay, isToday, differenceInMilliseconds } from 'date-fns';

/**
 * Format date for storage (YYYY-MM-DD)
 */
export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get today's date key
 */
export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

/**
 * Check if a date string is today
 */
export const isDateToday = (dateStr: string): boolean => {
  try {
    const date = new Date(dateStr);
    return isToday(date);
  } catch {
    return false;
  }
};

/**
 * Get start and end of day for a date
 */
export const getDayBounds = (date: Date): { start: Date; end: Date } => {
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  };
};

/**
 * Calculate duration between two dates in milliseconds
 */
export const calculateDuration = (start: Date, end: Date): number => {
  return differenceInMilliseconds(end, start);
};

/**
 * Format duration from milliseconds to human-readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
};

/**
 * Format duration for display on button (HH:MM:SS)
 */
export const formatTimerDisplay = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Get minutes since midnight for current time indicator
 */
export const getMinutesSinceMidnight = (date: Date = new Date()): number => {
  return date.getHours() * 60 + date.getMinutes();
};

/**
 * Calculate angle for pie chart time indicator (0-360 degrees)
 */
export const getCurrentTimeAngle = (): number => {
  const minutesSinceMidnight = getMinutesSinceMidnight();
  return (minutesSinceMidnight / (24 * 60)) * 360;
};

/**
 * Check if an activity crosses midnight
 */
export const crossesMidnight = (startTime: Date, endTime?: Date): boolean => {
  if (!endTime) return false;
  return formatDateKey(startTime) !== formatDateKey(endTime);
};

/**
 * Split activity that crosses midnight into multiple activities
 */
export const splitActivityAtMidnight = <T extends { startTime: Date; endTime: Date }>(
  activity: T
): Array<T & { duration: number; date: string }> => {
  if (!crossesMidnight(activity.startTime, activity.endTime)) {
    return [{
      ...activity,
      duration: calculateDuration(activity.startTime, activity.endTime),
      date: formatDateKey(activity.startTime)
    }];
  }

  const activities = [];
  let currentStart = activity.startTime;
  let currentEnd = endOfDay(currentStart);

  while (currentEnd < activity.endTime) {
    activities.push({
      ...activity,
      startTime: currentStart,
      endTime: currentEnd,
      duration: calculateDuration(currentStart, currentEnd),
      date: formatDateKey(currentStart)
    });

    currentStart = startOfDay(new Date(currentEnd.getTime() + 1));
    currentEnd = currentEnd.getTime() + 86400000 < activity.endTime.getTime()
      ? endOfDay(currentStart)
      : activity.endTime;
  }

  // Add the final segment
  activities.push({
    ...activity,
    startTime: currentStart,
    endTime: activity.endTime,
    duration: calculateDuration(currentStart, activity.endTime),
    date: formatDateKey(currentStart)
  });

  return activities;
};

/**
 * Calculate total tracked time for a day
 */
export const calculateTotalTrackedTime = (
  activities: Array<{ duration?: number }>
): number => {
  return activities.reduce((total, activity) => {
    return total + (activity.duration || 0);
  }, 0);
};

/**
 * Calculate unaccounted time for a day (in milliseconds)
 */
export const calculateUnaccountedTime = (
  totalTrackedTime: number,
  isCurrentDay: boolean = false
): number => {
  const totalDayMilliseconds = 24 * 60 * 60 * 1000;

  if (isCurrentDay) {
    // For current day, only count up to now
    const now = new Date();
    const dayStart = startOfDay(now);
    const elapsedToday = calculateDuration(dayStart, now);
    return Math.max(0, elapsedToday - totalTrackedTime);
  }

  return Math.max(0, totalDayMilliseconds - totalTrackedTime);
};