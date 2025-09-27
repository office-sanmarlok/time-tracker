/**
 * @file src/components/PieChart.tsx
 * @description Pie chart visualization for daily activity tracking
 * @purpose Display time distribution with current time indicator
 */

import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Alert } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { ChartCalculationService } from '@/services/ChartCalculationService';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { Activity } from '@/types/models';
import { UI_COLORS } from '@/constants/colors';
import { formatDuration } from '@/utils/dateUtils';
import { triggerSelectionHaptic } from '@/constants/haptics';

interface PieChartProps {
  activities: Activity[];
  height: number;
  isCurrentDay: boolean;
}

const PieChartComponent: React.FC<PieChartProps> = ({
  activities,
  height,
  isCurrentDay,
}) => {
  const [currentTimeAngle, setCurrentTimeAngle] = useState(0);
  const chartService = useMemo(() => ChartCalculationService.getInstance(), []);

  const buttons = useTimeTrackerStore(state => state.buttons);
  const settings = useTimeTrackerStore(state => state.settings);
  const buttonMap = useMemo(() => {
    const map = new Map<string, string>();
    buttons.forEach(button => map.set(button.id, button.name));
    return map;
  }, [buttons]);

  // Calculate chart segments
  const segments = useMemo(() => {
    return chartService.calculateSegments(activities, isCurrentDay);
  }, [activities, isCurrentDay, chartService]);

  // Update current time indicator
  useEffect(() => {
    if (!isCurrentDay) return;

    const updateTimeIndicator = () => {
      setCurrentTimeAngle(chartService.getCurrentTimeAngle());
    };

    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isCurrentDay, chartService]);

  const { width } = Dimensions.get('window');
  const size = Math.min(width - 32, height);
  const center = size / 2;
  const radius = (size / 2) - 10;

  // Render empty state
  if (segments.length === 0 || (segments.length === 1 && segments[0].buttonId === 'unaccounted')) {
    return (
      <View style={[styles.container, { height }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill={UI_COLORS.unaccounted}
            fillOpacity={0.3}
          />
          {isCurrentDay && (
            <Line
              x1={center}
              y1={center}
              x2={center + radius * Math.cos((currentTimeAngle - 90) * Math.PI / 180)}
              y2={center + radius * Math.sin((currentTimeAngle - 90) * Math.PI / 180)}
              stroke={UI_COLORS.timeIndicator}
              strokeWidth={2}
            />
          )}
        </Svg>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No activities tracked</Text>
        </View>
      </View>
    );
  }

  // Render pie chart segments
  let startAngle = -90; // Start at 12 o'clock
  const paths = segments.map((segment, index) => {
    const angle = (segment.value / 100) * 360;
    const endAngle = startAngle + angle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Determine if arc should be large (> 180 degrees)
    const largeArc = angle > 180 ? 1 : 0;

    // Create SVG path
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    startAngle = endAngle;

    const handleSegmentPress = () => {
      triggerSelectionHaptic(settings.hapticEnabled);
      const buttonName = buttonMap.get(segment.buttonId) || segment.buttonId;
      const duration = formatDuration(segment.duration * 1000);
      Alert.alert(
        buttonName,
        `Time spent: ${duration}\n${segment.value.toFixed(1)}% of today`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    };

    return (
      <Path
        key={`segment-${index}`}
        d={pathData}
        fill={segment.color}
        fillOpacity={0.9}
        onPress={handleSegmentPress}
      />
    );
  });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={size} height={size}>
        <>
          {paths}
          {/* Current time indicator */}
          {isCurrentDay && (
            <Line
              x1={center}
              y1={center}
              x2={center + radius * Math.cos((currentTimeAngle - 90) * Math.PI / 180)}
              y2={center + radius * Math.sin((currentTimeAngle - 90) * Math.PI / 180)}
              stroke={UI_COLORS.timeIndicator}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}
          {/* Center circle */}
          <Circle
            cx={center}
            cy={center}
            r={10}
            fill={UI_COLORS.background}
          />
        </>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.slice(0, 3).map((segment, index) => {
          const name = segment.buttonId === 'unaccounted'
            ? 'Unaccounted'
            : buttonMap.get(segment.buttonId) || 'Unknown';
          const duration = formatDuration(segment.duration);

          return (
            <View key={`legend-${index}`} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {name}: {duration}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: UI_COLORS.textTertiary,
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
  },
});

// Memoize the component to prevent unnecessary re-renders
export const PieChart = React.memo(PieChartComponent, (prevProps, nextProps) => {
  // Only re-render if activities or height change significantly
  return (
    prevProps.height === nextProps.height &&
    prevProps.isCurrentDay === nextProps.isCurrentDay &&
    prevProps.activities.length === nextProps.activities.length &&
    prevProps.activities.every((activity, index) => {
      const nextActivity = nextProps.activities[index];
      return (
        activity.id === nextActivity.id &&
        activity.buttonId === nextActivity.buttonId &&
        activity.duration === nextActivity.duration
      );
    })
  );
});