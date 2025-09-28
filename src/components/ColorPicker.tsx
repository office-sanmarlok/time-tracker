/**
 * @file src/components/ColorPicker.tsx
 * @description Color spectrum picker component with hue slider and saturation/brightness grid
 * @purpose Allow users to pick any color from the full spectrum
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  LinearGradient,
  Defs,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';

interface ColorPickerProps {
  initialColor?: string;
  onColorSelect: (color: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const PICKER_WIDTH = Math.min(screenWidth * 0.7, 280);
const HUE_SLIDER_HEIGHT = 25;
const SV_PICKER_HEIGHT = 150;

export const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor = '#FF5722',
  onColorSelect,
}) => {
  // Convert hex to HSV
  const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
      } else if (max === g) {
        h = ((b - r) / diff + 2) * 60;
      } else {
        h = ((r - g) / diff + 4) * 60;
      }
    }

    const s = max === 0 ? 0 : (diff / max) * 100;
    const v = max * 100;

    return { h, s, v };
  };

  // Convert HSV to hex
  const hsvToHex = (h: number, s: number, v: number): string => {
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const initialHsv = hexToHsv(initialColor);
  const [hue, setHue] = useState(initialHsv.h);
  const [saturation, setSaturation] = useState(initialHsv.s);
  const [brightness, setBrightness] = useState(initialHsv.v);

  const currentColor = hsvToHex(hue, saturation, brightness);

  // Hue slider pan responder
  const huePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newHue = Math.max(0, Math.min(360, (x / PICKER_WIDTH) * 360));
        setHue(newHue);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newHue = Math.max(0, Math.min(360, (x / PICKER_WIDTH) * 360));
        setHue(newHue);
      },
    })
  ).current;

  // Saturation/Brightness picker pan responder
  const svPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        const newSaturation = Math.max(0, Math.min(100, (x / PICKER_WIDTH) * 100));
        const newBrightness = Math.max(0, Math.min(100, 100 - (y / SV_PICKER_HEIGHT) * 100));
        setSaturation(newSaturation);
        setBrightness(newBrightness);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        const newSaturation = Math.max(0, Math.min(100, (x / PICKER_WIDTH) * 100));
        const newBrightness = Math.max(0, Math.min(100, 100 - (y / SV_PICKER_HEIGHT) * 100));
        setSaturation(newSaturation);
        setBrightness(newBrightness);
      },
    })
  ).current;

  const hueColor = hsvToHex(hue, 100, 100);
  const huePosition = (hue / 360) * PICKER_WIDTH;
  const svPositionX = (saturation / 100) * PICKER_WIDTH;
  const svPositionY = ((100 - brightness) / 100) * SV_PICKER_HEIGHT;

  // Preset colors for quick selection
  const presetColors = [
    '#FF5722', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#00BCD4', '#009688',
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
    '#FF9800', '#795548', '#9E9E9E', '#607D8B'
  ];

  return (
    <View style={styles.container}>
      {/* Saturation/Brightness Picker */}
      <View
        style={styles.svPicker}
        {...svPanResponder.panHandlers}
      >
        <Svg width={PICKER_WIDTH} height={SV_PICKER_HEIGHT}>
          <Defs>
            <LinearGradient id="saturation" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor={hueColor} />
            </LinearGradient>
            <LinearGradient id="brightness" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="transparent" />
              <Stop offset="100%" stopColor="#000000" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={PICKER_WIDTH} height={SV_PICKER_HEIGHT} fill="url(#saturation)" />
          <Rect x="0" y="0" width={PICKER_WIDTH} height={SV_PICKER_HEIGHT} fill="url(#brightness)" />
          <Circle
            cx={svPositionX}
            cy={svPositionY}
            r="10"
            fill="transparent"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Circle
            cx={svPositionX}
            cy={svPositionY}
            r="8"
            fill="transparent"
            stroke="#000000"
            strokeWidth="1"
          />
        </Svg>
      </View>

      {/* Hue Slider */}
      <View
        style={styles.hueSlider}
        {...huePanResponder.panHandlers}
      >
        <Svg width={PICKER_WIDTH} height={HUE_SLIDER_HEIGHT}>
          <Defs>
            <LinearGradient id="hueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FF0000" />
              <Stop offset="16.66%" stopColor="#FFFF00" />
              <Stop offset="33.33%" stopColor="#00FF00" />
              <Stop offset="50%" stopColor="#00FFFF" />
              <Stop offset="66.66%" stopColor="#0000FF" />
              <Stop offset="83.33%" stopColor="#FF00FF" />
              <Stop offset="100%" stopColor="#FF0000" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="5"
            width={PICKER_WIDTH}
            height={HUE_SLIDER_HEIGHT - 10}
            fill="url(#hueGradient)"
            rx="10"
          />
          <Circle
            cx={huePosition}
            cy={HUE_SLIDER_HEIGHT / 2}
            r="12"
            fill={hueColor}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </Svg>
      </View>

      {/* Color Preview and Hex Value */}
      <View style={styles.previewSection}>
        <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
        <View style={styles.hexContainer}>
          <Text style={styles.hexLabel}>HEX:</Text>
          <Text style={styles.hexValue}>{currentColor}</Text>
        </View>
      </View>

      {/* Preset Colors */}
      <View style={styles.presetSection}>
        <Text style={styles.presetLabel}>Quick Colors:</Text>
        <View style={styles.presetGrid}>
          {presetColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.presetColor, { backgroundColor: color }]}
              onPress={() => {
                const hsv = hexToHsv(color);
                setHue(hsv.h);
                setSaturation(hsv.s);
                setBrightness(hsv.v);
              }}
            />
          ))}
        </View>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => onColorSelect(currentColor)}
      >
        <Text style={styles.applyButtonText}>Apply Color</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  svPicker: {
    width: PICKER_WIDTH,
    height: SV_PICKER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hueSlider: {
    width: PICKER_WIDTH,
    height: HUE_SLIDER_HEIGHT,
    marginBottom: 15,
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hexContainer: {
    flex: 1,
  },
  hexLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  hexValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  presetSection: {
    width: PICKER_WIDTH,
    marginBottom: 15,
  },
  presetLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  presetColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    margin: 3,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 1,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});