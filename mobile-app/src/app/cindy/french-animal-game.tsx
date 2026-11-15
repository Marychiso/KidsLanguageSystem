import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import FrenchAnimalGame from '@/components/languages/french/games/FrenchAnimalGame';
import { LearningColors as C } from '@/constants/learning-theme';

export default function FrenchAnimalGameScreen() {
  const [ready, setReady] = useState(false);

  // Mount the game after the browser or device is ready for audio.
  useEffect(() => {
    setReady(true);
  }, []);

  if (ready) return <FrenchAnimalGame />;

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.loading}>
        <Text style={styles.animals}>🐶 🐱 🐮 🐦</Text>
        <ActivityIndicator
          size="large"
          color={C.primary}
          accessibilityLabel="Chargement du jeu"
        />
        <Text style={styles.message}>Le jardin se prépare…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  animals: { fontSize: 38, textAlign: 'center' },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textSecondary,
    textAlign: 'center',
  },
});