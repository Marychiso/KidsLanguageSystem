import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimalGame from '@/components/games/AnimalGame';
import { LearningColors as C } from '@/constants/learning-theme';

export default function AnimalGameScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Effects run on the device/browser, not during server rendering.
    // Mount the game here so its audio players can initialise safely.
    setReady(true);
  }, []);

  if (ready) {
    return <AnimalGame />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.loading}>
        <Text style={styles.animals}>🐶 🐱 🐮 🐦</Text>

        <ActivityIndicator
          size="large"
          color={C.primary}
          accessibilityLabel="Loading animal game"
        />

        <Text style={styles.message}>
          Getting the garden ready…
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },

  animals: {
    fontSize: 38,
    textAlign: 'center',
  },

  message: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSecondary,
    textAlign: 'center',
  },
});