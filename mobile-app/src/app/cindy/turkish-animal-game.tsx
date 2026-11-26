import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import TurkishAnimalGame from '@/components/languages/turkish/games/TurkishAnimalGame';
import { LearningColors as C } from '@/constants/learning-theme';

export default function TurkishAnimalGameScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (ready) {
    return <TurkishAnimalGame />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.loading}>
        <Text style={styles.animals}>🐶 🐱 🐮 🐦</Text>

        <ActivityIndicator
          size="large"
          color={C.primary}
          accessibilityLabel="Oyun yükleniyor"
        />

        <Text style={styles.message}>
          Bahçe hazırlanıyor…
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