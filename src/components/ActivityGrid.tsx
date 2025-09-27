/**
 * @file src/components/ActivityGrid.tsx
 * @description Grid layout for activity buttons
 * @purpose Display activity buttons in responsive grid with drag-and-drop reordering
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityButton } from './ActivityButton';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { ActivityButton as ActivityButtonType } from '@/types/models';
import { triggerHaptic, HAPTIC_PATTERNS } from '@/constants/haptics';

interface ActivityGridProps {
  onButtonLongPress: (button: ActivityButtonType) => void;
  isEditMode: boolean;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({
  onButtonLongPress,
  isEditMode,
}) => {
  const buttons = useTimeTrackerStore(state => state.buttons);
  const settings = useTimeTrackerStore(state => state.settings);
  const switchActivity = useTimeTrackerStore(state => state.switchActivity);
  const reorderButtons = useTimeTrackerStore(state => state.reorderButtons);

  const visibleButtons = useMemo(() => {
    return buttons
      .filter(b => b.isVisible)
      .sort((a, b) => a.position - b.position);
  }, [buttons]);

  const handleButtonPress = (buttonId: string) => {
    if (!isEditMode) {
      switchActivity(buttonId);
    }
  };

  const renderButton = ({ item }: { item: ActivityButtonType }) => {
    return (
      <ActivityButton
        button={item}
        onPress={() => handleButtonPress(item.id)}
        onLongPress={() => onButtonLongPress(item)}
        isEditMode={isEditMode}
        gridColumns={settings.gridColumns}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
          data={visibleButtons}
          keyExtractor={item => item.id}
          numColumns={settings.gridColumns}
          key={settings.gridColumns} // Force re-render when columns change
          columnWrapperStyle={settings.gridColumns > 1 ? styles.row : undefined}
          renderItem={({ item }) => (
            <ActivityButton
              button={item}
              onPress={() => handleButtonPress(item.id)}
              onLongPress={() => onButtonLongPress(item)}
              isEditMode={isEditMode}
              gridColumns={settings.gridColumns}
            />
          )}
          contentContainerStyle={styles.grid}
          scrollEnabled={false}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={4}
          windowSize={10}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-evenly',
  },
});