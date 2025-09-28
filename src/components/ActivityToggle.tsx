/**
 * @file src/components/ActivityToggle.tsx
 * @description Toggle switch component for activities
 * @purpose Display activities as toggle switches like in Figma design
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { ActivityButton } from '@/types/models';
import { UI_COLORS } from '@/constants/colors';

interface ActivityToggleProps {
  button: ActivityButton;
  isActive: boolean;
  onToggle: (buttonId: string) => void;
}

export const ActivityToggle: React.FC<ActivityToggleProps> = ({
  button,
  isActive,
  onToggle,
}) => {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onToggle(button.id)}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={[styles.colorDot, { backgroundColor: button.color }]} />
          <Text style={styles.label}>{button.name}</Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={() => onToggle(button.id)}
          trackColor={{
            false: '#E0E0E0',
            true: button.color + '40' // 25% opacity
          }}
          thumbColor={isActive ? button.color : '#f4f3f4'}
          ios_backgroundColor="#E0E0E0"
          style={styles.switch}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: UI_COLORS.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: UI_COLORS.textPrimary,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});