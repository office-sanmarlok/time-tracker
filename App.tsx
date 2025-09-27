import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from '@/components/HomeScreen';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { useAppState } from '@/hooks/useAppState';
import { usePersistence } from '@/hooks/usePersistence';
import { UI_COLORS } from '@/constants/colors';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  const isLoading = useTimeTrackerStore(state => state.isLoading);
  const loadData = useTimeTrackerStore(state => state.loadData);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Initialize app state handling
  useAppState();

  // Initialize auto-persistence
  usePersistence();

  // Load data on mount - only once
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={UI_COLORS.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <SafeAreaProvider>
          <View style={[styles.container, isDark && styles.containerDark]}>
            <HomeScreen />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  containerDark: {
    backgroundColor: UI_COLORS.backgroundDark,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
