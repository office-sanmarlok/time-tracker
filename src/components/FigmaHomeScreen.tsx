/**
 * @file src/components/FigmaHomeScreen.tsx
 * @description Main screen exactly replicating Figma design
 * @purpose Clean implementation matching Figma mockup
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

const { width: screenWidth } = Dimensions.get('window');

export const FigmaHomeScreen: React.FC = () => {
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const switchActivity = useTimeTrackerStore(state => state.switchActivity);
  const stopTracking = useTimeTrackerStore(state => state.stopTracking);

  // Activity data matching Figma
  const activities = [
    { id: 'sleeping', name: 'Sleeping', color: '#9E9E9E', row: 0, col: 0 },
    { id: 'studying', name: 'Studying', color: '#FF5722', row: 0, col: 1 },
    { id: 'cycling', name: 'Cycling', color: '#00BCD4', row: 0, col: 2 },
    { id: 'eating', name: 'Eating', color: '#CDDC39', row: 1, col: 0 },
  ];

  // Chart dimensions
  const chartSize = 288;
  const center = chartSize / 2;
  const radius = 120;

  // Calculate pie segments (simplified for demo)
  const segments = [
    { color: '#9E9E9E', startAngle: 0, endAngle: 90 },
    { color: '#FF5722', startAngle: 90, endAngle: 180 },
    { color: '#00BCD4', startAngle: 180, endAngle: 270 },
    { color: '#CDDC39', startAngle: 270, endAngle: 360 },
  ];

  const createPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const handleToggle = (activityId: string) => {
    if (currentActivity?.buttonId === activityId) {
      stopTracking();
    } else {
      switchActivity(activityId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize} style={styles.chart}>
          {/* Gray background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="#E5E5E5"
          />

          {/* Pie segments */}
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
            />
          ))}

          {/* White center circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.7}
            fill="white"
          />
        </Svg>
      </View>

      {/* Toggle Switches Grid */}
      <View style={styles.toggleGrid}>
        {activities.map(activity => {
          const isActive = currentActivity?.buttonId === activity.id;
          return (
            <View
              key={activity.id}
              style={[
                styles.toggleItem,
                activity.row === 0 && activity.col === 0 && styles.firstCol,
                activity.row === 0 && activity.col === 1 && styles.middleCol,
                activity.row === 0 && activity.col === 2 && styles.lastCol,
                activity.row === 1 && styles.secondRow,
              ]}
            >
              <Text style={styles.toggleLabel}>{activity.name}</Text>
              <View style={styles.switchContainer}>
                <View style={[styles.switchTrack, isActive && { backgroundColor: activity.color + '30' }]}>
                  <View style={[
                    styles.switchThumb,
                    isActive && {
                      backgroundColor: activity.color,
                      transform: [{ translateX: 20 }]
                    }
                  ]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  chart: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleGrid: {
    paddingHorizontal: 34,
    marginTop: 20,
  },
  toggleItem: {
    position: 'absolute',
    width: 75,
    height: 60,
  },
  firstCol: {
    left: 34,
    top: 0,
  },
  middleCol: {
    left: 163,
    top: 0,
  },
  lastCol: {
    left: 291,
    top: 0,
  },
  secondRow: {
    left: 37,
    top: 82,
  },
  toggleLabel: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#000000',
    marginBottom: 8,
  },
  switchContainer: {
    width: 69,
    height: 30,
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});