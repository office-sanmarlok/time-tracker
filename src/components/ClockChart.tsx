/**
 * @file src/components/ClockChart.tsx
 * @description 24-hour clock chart that paints activities chronologically
 * @purpose Visual timeline of the day showing when each activity occurred
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, G, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';

interface TimeSegment {
  startTime: Date;
  endTime: Date;
  buttonId: string;
  color: string;
}

// Development mode: Set to true for 5-minute cycle, false for 24-hour cycle
const DEV_MODE = true;
const CYCLE_DURATION = DEV_MODE ? 5 * 60 : 24 * 60 * 60; // 5 minutes or 24 hours in seconds

export const ClockChart: React.FC = () => {
  const activities = useTimeTrackerStore(state => state.activities);
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const buttons = useTimeTrackerStore(state => state.buttons);

  // Update more frequently in dev mode
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateInterval = DEV_MODE ? 1000 : 10000; // 1 second in dev, 10 seconds in prod
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, []);

  // Calculate the current time angle (0° = midnight/cycle start at top)
  const currentTimeAngle = useMemo(() => {
    const now = currentTime;

    if (DEV_MODE) {
      // In dev mode: 5 minutes = full rotation
      const cycleStart = new Date(now);
      const minutes = cycleStart.getMinutes();
      const seconds = cycleStart.getSeconds();

      // Calculate position within current 5-minute cycle
      const secondsIntoCycle = (minutes % 5) * 60 + seconds;
      return (secondsIntoCycle / 300) * 360; // 300 seconds = 5 minutes
    } else {
      // Production mode: 24 hours = full rotation
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);

      const secondsSinceMidnight = (now.getTime() - midnight.getTime()) / 1000;
      const secondsInDay = 24 * 60 * 60;

      return (secondsSinceMidnight / secondsInDay) * 360;
    }
  }, [currentTime]);

  // Build chronological segments for the cycle
  const segments = useMemo(() => {
    let relevantActivities: typeof activities = [];
    let cycleStart: Date;

    if (DEV_MODE) {
      // In dev mode: Only show activities from current 5-minute cycle
      cycleStart = new Date(currentTime);
      const minutes = Math.floor(cycleStart.getMinutes() / 5) * 5;
      cycleStart.setMinutes(minutes, 0, 0);

      // Filter activities within current 5-minute window
      relevantActivities = activities.filter(a => {
        const activityTime = new Date(a.startTime);
        return activityTime >= cycleStart && activityTime < currentTime;
      });
    } else {
      // Production mode: Show today's activities
      const today = new Date().toISOString().split('T')[0];
      relevantActivities = activities.filter(a => a.date === today);
      cycleStart = new Date();
      cycleStart.setHours(0, 0, 0, 0);
    }

    // Figma colors
    const figmaColors: { [key: string]: string } = {
      sleeping: '#9E9E9E',
      studying: '#FF5722',
      cycling: '#00BCD4',
      eating: '#CDDC39',
    };

    const segments: TimeSegment[] = [];

    // Sort activities by start time
    const sortedActivities = [...relevantActivities].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    let lastEndTime = cycleStart;

    // Process each activity
    sortedActivities.forEach(activity => {
      const activityStart = new Date(activity.startTime);
      const activityEnd = activity.endTime ? new Date(activity.endTime) : currentTime;

      // Add gray segment for gap if there's untracked time
      if (activityStart > lastEndTime) {
        segments.push({
          startTime: lastEndTime,
          endTime: activityStart,
          buttonId: 'inactive',
          color: '#E5E5E5'
        });
      }

      // Add activity segment
      const button = buttons.find(b => b.id === activity.buttonId);
      segments.push({
        startTime: activityStart,
        endTime: activityEnd,
        buttonId: activity.buttonId,
        color: figmaColors[activity.buttonId] || button?.color || '#888'
      });

      lastEndTime = activityEnd;
    });

    // Add current activity if exists
    if (currentActivity) {
      const activityStart = new Date(currentActivity.startTime);

      // In dev mode, ensure activity start is within current cycle
      let effectiveStart = activityStart;
      if (DEV_MODE) {
        // If activity started before current cycle, use cycle start
        if (activityStart < cycleStart) {
          effectiveStart = cycleStart;
        }
        // If activity started after current time (shouldn't happen), use current time
        if (activityStart > currentTime) {
          effectiveStart = currentTime;
        }
      }

      // Only add segment if it's within our time window
      if (effectiveStart >= cycleStart && effectiveStart <= currentTime) {
        // Add gray gap if needed
        if (effectiveStart > lastEndTime) {
          segments.push({
            startTime: lastEndTime,
            endTime: effectiveStart,
            buttonId: 'inactive',
            color: '#E5E5E5'
          });
        }

        // Add current activity up to current time
        const button = buttons.find(b => b.id === currentActivity.buttonId);
        segments.push({
          startTime: effectiveStart,
          endTime: currentTime,
          buttonId: currentActivity.buttonId,
          color: figmaColors[currentActivity.buttonId] || button?.color || '#888'
        });

        lastEndTime = currentTime;
      }
    }

    // Add gray for remaining time until current moment
    if (lastEndTime < currentTime) {
      segments.push({
        startTime: lastEndTime,
        endTime: currentTime,
        buttonId: 'inactive',
        color: '#E5E5E5'
      });
    }

    return segments;
  }, [activities, currentActivity, currentTime, buttons]);

  // Convert time to angle (0° = midnight/cycle start at top, clockwise)
  const timeToAngle = (time: Date) => {
    if (DEV_MODE) {
      // Dev mode: Map time to 5-minute cycles
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();

      // Calculate position within current 5-minute cycle
      const secondsIntoCycle = (minutes % 5) * 60 + seconds;
      return (secondsIntoCycle / 300) * 360 - 90; // -90 to start from top
    } else {
      // Production mode: Map to 24-hour day
      const midnight = new Date(time);
      midnight.setHours(0, 0, 0, 0);

      const secondsSinceMidnight = (time.getTime() - midnight.getTime()) / 1000;
      const secondsInDay = 24 * 60 * 60;

      return (secondsSinceMidnight / secondsInDay) * 360 - 90; // -90 to start from top
    }
  };

  // Create path for a segment
  const createSegmentPath = (segment: TimeSegment, radius: number, innerRadius: number, centerX: number, centerY: number) => {
    const startAngle = timeToAngle(segment.startTime);
    const endAngle = timeToAngle(segment.endTime);

    // Ensure angles are valid
    if (isNaN(startAngle) || isNaN(endAngle)) {
      return ''; // Return empty path if angles are invalid
    }

    // Calculate angle difference properly
    let angleDiff = endAngle - startAngle;

    // Handle wrap-around
    if (angleDiff < 0) {
      angleDiff += 360;
    }

    // Prevent full circle or negative segments
    if (angleDiff <= 0 || angleDiff >= 360) {
      return ''; // Return empty path for invalid segments
    }

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

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

    const largeArc = angleDiff > 180 ? 1 : 0;

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

  // Calculate red line position
  const redLineAngleRad = ((currentTimeAngle - 90) * Math.PI) / 180;
  const redLineX = centerX + outerRadius * Math.cos(redLineAngleRad);
  const redLineY = centerY + outerRadius * Math.sin(redLineAngleRad);

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        {/* Shadow background */}
        <Svg width={288} height={288} viewBox="0 0 288 288" style={styles.shadow}>
          <Circle cx={144} cy={144} r={144} fill="#F0F0F0" />
        </Svg>

        {/* Main clock chart */}
        <Svg
          width={chartSize}
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          style={styles.chart}
        >
          <Defs>
            {/* Orange gradient for studying */}
            <LinearGradient id="studyingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor="#FF4906" />
              <Stop offset="0.515519" stopColor="#FF8B60" />
              <Stop offset="1" stopColor="#FFA685" />
            </LinearGradient>
          </Defs>

          <G>
            {/* Full gray background circle for unused time */}
            <Path
              d={`
                M ${centerX - outerRadius} ${centerY}
                A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}
                A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}
                Z
                M ${centerX - innerRadius} ${centerY}
                A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}
                A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}
                Z
              `.trim()}
              fill="#E5E5E5"
              fillRule="evenodd"
            />

            {/* Activity segments painted on top */}
            {segments.map((segment, index) => {
              const isStudying = segment.buttonId === 'studying';
              return (
                <Path
                  key={`segment-${index}`}
                  d={createSegmentPath(segment, outerRadius, innerRadius, centerX, centerY)}
                  fill={isStudying ? 'url(#studyingGradient)' : segment.color}
                />
              );
            })}

            {/* White center circle */}
            <Circle cx={centerX} cy={centerY} r={innerRadius} fill="white" />

            {/* Current time indicator (red line) */}
            <Line
              x1={centerX}
              y1={centerY}
              x2={redLineX}
              y2={redLineY}
              stroke="#FF0000"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Center dot */}
            <Circle cx={centerX} cy={centerY} r={3} fill="#FF0000" />
          </G>
        </Svg>

        {/* Dev mode indicator */}
        {DEV_MODE && (
          <View style={styles.devIndicator}>
            <Text style={styles.devText}>DEV MODE</Text>
            <Text style={styles.devSubtext}>5 min cycle</Text>
          </View>
        )}
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
  devIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF5722',
    padding: 6,
    borderRadius: 4,
  },
  devText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  devSubtext: {
    color: 'white',
    fontSize: 8,
  },
});