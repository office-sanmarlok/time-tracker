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

// Development mode: Set to true for 1-minute cycle, false for 24-hour cycle
const DEV_MODE = true;
const CYCLE_DURATION = DEV_MODE ? 60 : 24 * 60 * 60; // 1 minute or 24 hours in seconds

export const ClockChart: React.FC = () => {
  const activities = useTimeTrackerStore(state => state.activities);
  const currentActivity = useTimeTrackerStore(state => state.currentActivity);
  const buttons = useTimeTrackerStore(state => state.buttons);

  // Update continuously for smooth animation
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every 100ms for smooth continuous motion
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for smoother animation

    return () => clearInterval(timer);
  }, []);

  // Calculate the current time angle (0° = top, clockwise)
  const currentTimeAngle = useMemo(() => {
    const now = currentTime;

    if (DEV_MODE) {
      // In dev mode: 1 minute = full rotation
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      // Calculate exact position within the minute
      const totalSeconds = seconds + milliseconds / 1000;
      return (totalSeconds / 60) * 360; // 60 seconds = 360 degrees
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
      // In dev mode: Only show activities from current 1-minute interval
      cycleStart = new Date(currentTime);
      cycleStart.setSeconds(0, 0); // Start of current minute

      // Filter activities for current minute interval
      // The date field now contains YYYY-MM-DD HH:mm format in dev mode
      const currentInterval = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
      relevantActivities = activities.filter(a => a.date === currentInterval);
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
          color: '#EBEBEB'
        });
      }

      // Add activity segment
      const button = buttons.find(b => b.id === activity.buttonId);
      const color = activity.buttonId === 'blank' 
        ? '#EBEBEB'  // Light gray for blank/inactive time
        : (figmaColors[activity.buttonId] || button?.color || '#888');
      
      segments.push({
        startTime: activityStart,
        endTime: activityEnd,
        buttonId: activity.buttonId,
        color
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
        // With blank activity tracking, gaps should not exist
        // But keep this for backward compatibility
        if (effectiveStart > lastEndTime) {
          segments.push({
            startTime: lastEndTime,
            endTime: effectiveStart,
            buttonId: 'blank',
            color: '#EBEBEB'
          });
        }

        // Add current activity up to current time (continuously updating)
        const button = buttons.find(b => b.id === currentActivity.buttonId);
        const color = currentActivity.buttonId === 'blank'
          ? '#EBEBEB'  // Light gray for blank/inactive time
          : (figmaColors[currentActivity.buttonId] || button?.color || '#888');
        
        segments.push({
          startTime: effectiveStart,
          endTime: currentTime, // This continuously updates every 100ms
          buttonId: currentActivity.buttonId,
          color
        });

        lastEndTime = currentTime;
      }
    }

    // With blank activity tracking, this should not happen
    // But keep for edge cases
    if (lastEndTime < currentTime) {
      segments.push({
        startTime: lastEndTime,
        endTime: currentTime,
        buttonId: 'blank',
        color: '#EBEBEB'
      });
    }

    return segments;
  }, [activities, currentActivity, currentTime, buttons]);

  // Convert time to angle (0° = top, clockwise)
  const timeToAngle = (time: Date) => {
    if (DEV_MODE) {
      // Dev mode: Map time to 1-minute cycle
      const seconds = time.getSeconds();
      const milliseconds = time.getMilliseconds();

      // Calculate exact position within the minute
      const totalSeconds = seconds + milliseconds / 1000;
      // Subtract 90 to start from top (12 o'clock position)
      return (totalSeconds / 60) * 360 - 90;
    } else {
      // Production mode: Map to 24-hour day
      const midnight = new Date(time);
      midnight.setHours(0, 0, 0, 0);

      const secondsSinceMidnight = (time.getTime() - midnight.getTime()) / 1000;
      const secondsInDay = 24 * 60 * 60;

      // Subtract 90 to start from top (12 o'clock position)
      return (secondsSinceMidnight / secondsInDay) * 360 - 90;
    }
  };

  // Create simple arc path for segment
  const createSegmentPath = (segment: TimeSegment, radius: number, innerRadius: number, centerX: number, centerY: number, nextSegment?: TimeSegment) => {
    const MIN_GAP_ANGLE = 50; // Minimum degrees between segments to prevent overlap
    
    let startAngle = timeToAngle(segment.startTime);
    let endAngle = timeToAngle(segment.endTime);

    // Ensure angles are valid
    if (isNaN(startAngle) || isNaN(endAngle)) {
      return null;
    }

    // Calculate angle difference properly
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) {
      angleDiff += 360;
    }

    // Prevent full circle or negative segments
    if (angleDiff <= 0 || angleDiff >= 360) {
      return null;
    }

    // Check if next segment exists and is close
    if (nextSegment) {
      const nextStartAngle = timeToAngle(nextSegment.startTime);
      if (!isNaN(nextStartAngle)) {
        let gapToNext = nextStartAngle - endAngle;
        if (gapToNext < 0) gapToNext += 360;
        
        // If segments are too close, trim the current segment
        if (gapToNext < MIN_GAP_ANGLE) {
          endAngle = nextStartAngle - MIN_GAP_ANGLE / 2;
          if (endAngle < startAngle) endAngle += 360;
        }
      }
    }

    // Apply standard gap for visual separation
    const GAP_ANGLE = 50; // Increased gap to prevent overlap
    if (angleDiff > GAP_ANGLE * 2) {
      startAngle += GAP_ANGLE / 2;
      endAngle -= GAP_ANGLE / 2;
      angleDiff = endAngle - startAngle;
      if (angleDiff < 0) angleDiff += 360;
    }

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // Calculate middle radius and stroke width
    const middleRadius = (radius + innerRadius) / 2;
    const strokeWidth = radius - innerRadius - 4; // Slightly thinner for cleaner look
    
    // Calculate arc points at middle radius
    const x1 = centerX + middleRadius * Math.cos(startAngleRad);
    const y1 = centerY + middleRadius * Math.sin(startAngleRad);
    const x2 = centerX + middleRadius * Math.cos(endAngleRad);
    const y2 = centerY + middleRadius * Math.sin(endAngleRad);
    
    const largeArc = angleDiff > 180 ? 1 : 0;

    // Return simple arc path
    return {
      d: `M ${x1} ${y1} A ${middleRadius} ${middleRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      strokeWidth: strokeWidth,
      color: segment.color,
      isStudying: segment.buttonId === 'studying'
    };
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
          <Circle cx={144} cy={144} r={144} fill="#F5F5F5" />
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
              fill="#EBEBEB"
              fillRule="evenodd"
            />

            {/* Activity segments painted on top */}
            {(() => {
              // Filter out blank segments first
              const visibleSegments = segments.filter(segment => 
                segment.buttonId !== 'blank' && segment.buttonId !== 'inactive'
              );
              
              return visibleSegments.map((segment, index) => {
                const nextSegment = visibleSegments[index + 1]; // Pass next segment for overlap check
                const pathData = createSegmentPath(segment, outerRadius, innerRadius, centerX, centerY, nextSegment);
                
                if (!pathData) return null;
                
                return (
                  <Path
                    key={`segment-${index}`}
                    d={pathData.d}
                    stroke={pathData.isStudying ? 'url(#studyingGradient)' : pathData.color}
                    strokeWidth={pathData.strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                  />
                );
              });
            })()}

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
            <Text style={styles.devSubtext}>1 min cycle</Text>
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
    marginTop: 40,  // Added spacing to avoid iPhone notch/bezel
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