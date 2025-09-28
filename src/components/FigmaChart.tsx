/**
 * @file src/components/FigmaChart.tsx
 * @description Exact replica of Figma pie chart using SVG paths
 * @purpose Reproduce the exact visual from Figma design
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop, ClipPath, Rect, Circle } from 'react-native-svg';

export const FigmaChart: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        {/* Gray background circle with shadow */}
        <Svg width={288} height={288} viewBox="0 0 288 288" style={styles.shadow}>
          <Circle cx={144} cy={144} r={144} fill="#E5E5E5" />
        </Svg>

        {/* The actual chart */}
        <Svg
          width={261}
          height={261}
          viewBox="0 0 261 261"
          style={styles.chart}
        >
          <Defs>
            <LinearGradient
              id="orangeGradient"
              x1="251.657"
              y1="28.4761"
              x2="-16.7751"
              y2="179.27"
            >
              <Stop offset="0" stopColor="#FF4906" />
              <Stop offset="0.515519" stopColor="#FF8B60" />
              <Stop offset="1" stopColor="#FFA685" />
            </LinearGradient>
            <ClipPath id="clip0">
              <Rect width="260.798" height="260.506" fill="white" />
            </ClipPath>
          </Defs>

          <G clipPath="url(#clip0)">
            {/* Orange segment (Studying) */}
            <Path
              d="M236.988 159C247.658 161.856 258.794 155.513 259.984 144.532C261.423 131.251 260.807 117.787 258.121 104.618C254.098 84.8954 245.542 66.3761 233.126 50.5219C220.711 34.6677 204.778 21.9123 186.582 13.2623C174.432 7.48594 161.495 3.64587 148.24 1.84335C137.291 0.354267 128.448 9.63619 128.654 20.6824L128.982 38.3558C129.188 49.3939 138.463 57.902 149.14 60.7153C153.471 61.8565 157.7 63.4008 161.771 65.336C171.888 70.1456 180.748 77.2378 187.651 86.0532C194.554 94.8685 199.311 105.166 201.548 116.132C202.446 120.535 202.928 124.998 202.996 129.462C203.162 140.504 209.19 151.56 219.86 154.415L236.988 159Z"
              fill="url(#orangeGradient)"
            />

            {/* Lime segment (Eating) */}
            <Path
              d="M21.0705 139.885C10.0578 140.822 1.73608 150.576 4.35494 161.309C8.86231 179.782 17.3961 197.125 29.4418 212.056C41.4939 226.995 56.6542 239.016 73.7779 247.343C83.7099 252.172 95.0043 246.119 98.2638 235.566L103.48 218.678C106.74 208.123 100.587 197.136 91.3208 191.126C84.9422 186.989 79.2218 181.85 74.3972 175.87C69.5728 169.89 65.7615 163.214 63.0703 156.109C59.1606 145.786 49.7372 137.444 38.7342 138.381L21.0705 139.885Z"
              fill="#CDDC39"
            />

            {/* Cyan segment (Cycling) */}
            <Path
              d="M104.817 237.365C102.216 248.1 108.825 259.071 119.833 259.993C145.549 262.147 171.493 256.616 194.268 243.868C217.037 231.124 235.3 211.915 246.886 188.89C251.852 179.022 245.944 167.656 235.43 164.27L218.553 158.837C208.039 155.452 196.972 161.47 190.834 170.654C184.547 180.06 176.083 187.939 166.044 193.558C156.001 199.18 144.849 202.277 133.531 202.721C122.492 203.153 111.58 209.452 108.979 220.188L104.817 237.365Z"
              fill="#00BCD4"
            />
          </G>

          {/* White center circle for donut effect */}
          <Circle cx={130.5} cy={130.5} r={85} fill="white" />
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
    transform: [{ rotate: '5deg' }], // Slight rotation as in Figma
  },
});