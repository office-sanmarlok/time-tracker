/**
 * @file src/components/FunctionalFigmaChart.tsx
 * @description Functional pie chart with Figma's exact visual style
 * @purpose Display actual time tracking data using Figma's design
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { Activity } from '@/types/models';

interface ChartSegment {
  buttonId: string;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export const FunctionalFigmaChart: React.FC = () => {
  const activities = useTimeTrackerStore(state => state.activities);
  const buttons = useTimeTrackerStore(state => state.buttons);
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);

  // Get today's activities
  const todayActivities = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(a => a.date === today);
  }, [activities]);

  // Calculate segments based on actual time data
  const segments = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    // Total seconds elapsed today
    const totalSecondsToday = Math.floor((now.getTime() - dayStart.getTime()) / 1000);

    if (totalSecondsToday === 0) return [];

    // Group activities by button and calculate total duration
    const timeByButton = new Map<string, number>();

    // Add completed activities
    todayActivities.forEach(activity => {
      const current = timeByButton.get(activity.buttonId) || 0;
      timeByButton.set(activity.buttonId, current + activity.duration);
    });

    // Add current activity if exists
    if (currentActivity) {
      const currentDuration = Math.floor((now.getTime() - new Date(currentActivity.startTime).getTime()) / 1000);
      const current = timeByButton.get(currentActivity.buttonId) || 0;
      timeByButton.set(currentActivity.buttonId, current + currentDuration);
    }

    // Calculate total tracked time
    let totalTrackedSeconds = 0;
    timeByButton.forEach(duration => {
      totalTrackedSeconds += duration;
    });

    // Create segments
    const chartSegments: ChartSegment[] = [];
    let currentAngle = -90; // Start from top

    // Define Figma colors for our activities
    const figmaColors = {
      sleeping: '#9E9E9E',
      studying: '#FF5722',
      cycling: '#00BCD4',
      eating: '#CDDC39',
    };

    // Add tracked activities
    timeByButton.forEach((duration, buttonId) => {
      const button = buttons.find(b => b.id === buttonId);
      const percentage = (duration / totalSecondsToday) * 100;
      const angleSpan = (percentage / 100) * 360;

      chartSegments.push({
        buttonId,
        color: figmaColors[buttonId as keyof typeof figmaColors] || button?.color || '#888',
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSpan,
      });

      currentAngle += angleSpan;
    });

    // Add untracked time if any
    const untrackedPercentage = ((totalSecondsToday - totalTrackedSeconds) / totalSecondsToday) * 100;
    if (untrackedPercentage > 0) {
      const angleSpan = (untrackedPercentage / 100) * 360;
      chartSegments.push({
        buttonId: 'untracked',
        color: '#E5E5E5',
        percentage: untrackedPercentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSpan,
      });
    }

    return chartSegments;
  }, [todayActivities, currentActivity, buttons]);

  // Generate SVG path for a segment
  const createSegmentPath = (segment: ChartSegment, radius: number, innerRadius: number, centerX: number, centerY: number) => {
    const startAngleRad = (segment.startAngle * Math.PI) / 180;
    const endAngleRad = (segment.endAngle * Math.PI) / 180;

    // Outer arc points
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    // Inner arc points
    const x3 = centerX + innerRadius * Math.cos(startAngleRad);
    const y3 = centerY + innerRadius * Math.sin(startAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

    // Create donut segment path
    return `
      M ${x3} ${y3}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x3} ${y3}
      Z
    `.trim();
  };

  const chartSize = 261;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const outerRadius = 130;
  const innerRadius = 85;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        {/* Gray background with shadow */}
        <Svg width={288} height={288} viewBox="0 0 288 288" style={styles.shadow}>
          <Circle cx={144} cy={144} r={144} fill="#E5E5E5" />
        </Svg>

        {/* The functional chart */}
        <Svg
          width={chartSize}
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          style={styles.chart}
        >
          <Defs>
            {/* Orange gradient for studying */}
            <LinearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor="#FF4906" />
              <Stop offset="0.515519" stopColor="#FF8B60" />
              <Stop offset="1" stopColor="#FFA685" />
            </LinearGradient>
          </Defs>

          <G>
            {/* Background circle for empty state */}
            {segments.length === 0 && (
              <Circle cx={centerX} cy={centerY} r={outerRadius} fill="#E5E5E5" />
            )}

            {/* Render segments */}
            {segments.map((segment, index) => {
              const isStudying = segment.buttonId === 'studying';
              return (
                <Path
                  key={`segment-${index}`}
                  d={createSegmentPath(segment, outerRadius, innerRadius, centerX, centerY)}
                  fill={isStudying ? 'url(#orangeGradient)' : segment.color}
                  opacity={segment.buttonId === 'untracked' ? 0.5 : 1}
                />
              );
            })}

            {/* White center for donut effect */}
            <Circle cx={centerX} cy={centerY} r={innerRadius} fill="white" />
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
  },
  chartWrapper: {
    width: 288,
    height: 288,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chart: {
    position: 'absolute',
    transform: [{ rotate: '5deg' }], // Maintain Figma's rotation
  },
});