/**
 * @file src/services/TimerService.ts
 * @description Manages timer functionality for activity tracking
 * @purpose Handle timer start/stop/resume with proper cleanup and background support
 */

import { calculateDuration } from '@/utils/dateUtils';

/**
 * Callback function type for timer updates
 */
type TimerCallback = (duration: number) => void;

/**
 * TimerService manages activity timers
 * Provides accurate timing with interval updates
 */
export class TimerService {
  private static instance: TimerService;
  private interval: NodeJS.Timeout | null = null;
  private startTime: Date | null = null;
  private callbacks: Set<TimerCallback> = new Set();
  private lastUpdate: number = 0;

  /**
   * Get singleton instance
   */
  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  /**
   * Start a new timer
   */
  start(startTime: Date = new Date()): void {
    this.stop(); // Stop any existing timer
    this.startTime = startTime;
    this.lastUpdate = Date.now();

    // Initial callback
    this.notifyCallbacks();

    // Set up interval for updates (every second)
    this.interval = setInterval(() => {
      this.notifyCallbacks();
    }, 1000);
  }

  /**
   * Stop the current timer
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.startTime = null;
    this.lastUpdate = 0;
  }

  /**
   * Resume a timer from a previous start time
   */
  resume(startTime: Date): void {
    this.start(startTime);
  }

  /**
   * Register a callback for timer updates
   */
  subscribe(callback: TimerCallback): () => void {
    this.callbacks.add(callback);

    // If timer is running, immediately notify the new subscriber
    if (this.startTime) {
      const duration = calculateDuration(this.startTime, new Date());
      callback(duration);
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get current duration
   */
  getCurrentDuration(): number {
    if (!this.startTime) {
      return 0;
    }
    return calculateDuration(this.startTime, new Date());
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.interval !== null && this.startTime !== null;
  }

  /**
   * Get the start time
   */
  getStartTime(): Date | null {
    return this.startTime;
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    if (!this.startTime) {
      return;
    }

    const now = Date.now();

    // Skip if called too frequently (debounce)
    if (now - this.lastUpdate < 900) {
      return;
    }

    this.lastUpdate = now;
    const duration = calculateDuration(this.startTime, new Date());

    this.callbacks.forEach(callback => {
      try {
        callback(duration);
      } catch (error) {
        console.error('Timer callback error:', error);
      }
    });
  }

  /**
   * Handle app state changes (background/foreground)
   */
  handleAppStateChange(nextState: 'active' | 'background' | 'inactive'): void {
    if (nextState === 'active' && this.startTime && !this.interval) {
      // Resume timer when app becomes active
      this.resume(this.startTime);
    } else if (nextState === 'background' && this.interval) {
      // Keep startTime but clear interval to save battery
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    this.callbacks.clear();
  }
}