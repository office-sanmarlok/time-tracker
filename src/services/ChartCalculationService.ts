/**
 * @file src/services/ChartCalculationService.ts
 * @description Calculates data for pie chart visualization
 * @purpose Transform activity data into chart-ready segments with proper grouping
 */

import { Activity, ChartSegment } from '@/types/models';
import {
  calculateTotalTrackedTime,
  calculateUnaccountedTime,
  getCurrentTimeAngle
} from '@/utils/dateUtils';
import { UI_COLORS } from '@/constants/colors';

/**
 * ChartCalculationService transforms activity data for visualization
 */
export class ChartCalculationService {
  private static instance: ChartCalculationService;

  /**
   * Get singleton instance
   */
  static getInstance(): ChartCalculationService {
    if (!ChartCalculationService.instance) {
      ChartCalculationService.instance = new ChartCalculationService();
    }
    return ChartCalculationService.instance;
  }

  /**
   * Calculate chart segments from activities
   */
  calculateSegments(activities: Activity[], isCurrentDay: boolean = false): ChartSegment[] {
    if (activities.length === 0) {
      // Return full unaccounted time for empty state
      return this.getEmptyDaySegments();
    }

    // Group activities by buttonId
    const grouped = this.groupActivitiesByButton(activities);

    // Convert to chart segments
    const segments: ChartSegment[] = [];
    const totalMinutesInDay = 24 * 60 * 60 * 1000; // milliseconds

    // Calculate segments for each button
    for (const [buttonId, buttonActivities] of grouped.entries()) {
      const totalDuration = buttonActivities.reduce(
        (sum, activity) => sum + (activity.duration || 0),
        0
      );

      if (totalDuration > 0) {
        segments.push({
          buttonId,
          value: (totalDuration / totalMinutesInDay) * 100,
          duration: totalDuration,
          color: buttonActivities[0].color,
          label: buttonId // Will be replaced with button name in component
        });
      }
    }

    // Note: With blank activity tracking, there should be no unaccounted time
    // as blank activities fill all gaps. But we'll keep this for backward compatibility
    // and edge cases where data might be missing.
    const totalTracked = calculateTotalTrackedTime(activities);
    const unaccountedTime = calculateUnaccountedTime(totalTracked, isCurrentDay);

    if (unaccountedTime > 0) {
      segments.push({
        buttonId: 'unaccounted',
        value: (unaccountedTime / totalMinutesInDay) * 100,
        duration: unaccountedTime,
        color: UI_COLORS.unaccounted,
        label: 'Unaccounted'
      });
    }

    // Sort segments by size (largest first) for better visualization
    segments.sort((a, b) => b.duration - a.duration);

    return segments;
  }

  /**
   * Group activities by button ID
   */
  private groupActivitiesByButton(activities: Activity[]): Map<string, Activity[]> {
    const grouped = new Map<string, Activity[]>();

    activities.forEach(activity => {
      const buttonId = activity.buttonId;
      if (!grouped.has(buttonId)) {
        grouped.set(buttonId, []);
      }
      grouped.get(buttonId)!.push(activity);
    });

    return grouped;
  }

  /**
   * Get segments for empty day (all unaccounted)
   */
  private getEmptyDaySegments(): ChartSegment[] {
    return [{
      buttonId: 'unaccounted',
      value: 100,
      duration: 24 * 60 * 60 * 1000,
      color: UI_COLORS.unaccounted,
      label: 'No activities tracked'
    }];
  }

  /**
   * Calculate angle for current time indicator
   */
  getCurrentTimeAngle(): number {
    return getCurrentTimeAngle();
  }

  /**
   * Convert segment to SVG path data
   * Used for rendering pie chart segments
   */
  getSegmentPath(
    segment: ChartSegment,
    startAngle: number,
    centerX: number,
    centerY: number,
    radius: number
  ): string {
    const angle = (segment.value / 100) * 360;
    const endAngle = startAngle + angle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Determine if arc should be large (> 180 degrees)
    const largeArc = angle > 180 ? 1 : 0;

    // Create SVG path
    return [
      `M ${centerX} ${centerY}`,     // Move to center
      `L ${x1} ${y1}`,               // Line to start point
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Arc to end point
      'Z'                            // Close path
    ].join(' ');
  }

  /**
   * Get time indicator line coordinates
   */
  getTimeIndicatorCoordinates(
    centerX: number,
    centerY: number,
    radius: number
  ): { x1: number; y1: number; x2: number; y2: number } {
    const angle = this.getCurrentTimeAngle() - 90; // Adjust for 12 o'clock start
    const rad = (angle * Math.PI) / 180;

    return {
      x1: centerX,
      y1: centerY,
      x2: centerX + radius * Math.cos(rad),
      y2: centerY + radius * Math.sin(rad)
    };
  }

  /**
   * Calculate statistics for activities
   */
  calculateStatistics(activities: Activity[]): {
    totalTracked: number;
    unaccounted: number;
    mostActive: string | null;
    averageSessionLength: number;
  } {
    const totalTracked = calculateTotalTrackedTime(activities);
    const unaccounted = calculateUnaccountedTime(totalTracked, true);

    // Find most active button
    const grouped = this.groupActivitiesByButton(activities);
    let mostActive: string | null = null;
    let maxDuration = 0;

    for (const [buttonId, buttonActivities] of grouped.entries()) {
      const totalDuration = buttonActivities.reduce(
        (sum, activity) => sum + (activity.duration || 0),
        0
      );
      if (totalDuration > maxDuration) {
        maxDuration = totalDuration;
        mostActive = buttonId;
      }
    }

    // Calculate average session length
    const completedActivities = activities.filter(a => a.duration);
    const averageSessionLength = completedActivities.length > 0
      ? completedActivities.reduce((sum, a) => sum + (a.duration || 0), 0) / completedActivities.length
      : 0;

    return {
      totalTracked,
      unaccounted,
      mostActive,
      averageSessionLength
    };
  }

  /**
   * Get segment at specific angle (for touch interaction)
   */
  getSegmentAtAngle(
    segments: ChartSegment[],
    touchAngle: number
  ): ChartSegment | null {
    let currentAngle = 0;

    for (const segment of segments) {
      const segmentAngle = (segment.value / 100) * 360;
      if (touchAngle >= currentAngle && touchAngle < currentAngle + segmentAngle) {
        return segment;
      }
      currentAngle += segmentAngle;
    }

    return null;
  }

  /**
   * Format segment label with duration
   */
  formatSegmentLabel(segment: ChartSegment, buttonName?: string): string {
    const hours = Math.floor(segment.duration / (60 * 60 * 1000));
    const minutes = Math.floor((segment.duration % (60 * 60 * 1000)) / (60 * 1000));

    const timeStr = hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

    const name = buttonName || segment.label || 'Unknown';
    return `${name}: ${timeStr} (${segment.value.toFixed(1)}%)`;
  }
}