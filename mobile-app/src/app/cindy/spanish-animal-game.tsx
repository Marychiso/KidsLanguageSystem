import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';

import SpanishAnimalGame from '@/components/languages/spanish/games/SpanishAnimalGame';
import { LearningColors as C } from '@/constants/learning-theme';

export default function SpanishAnimalGameScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: 'spanish',
          activity: 'games',
        },
      });
    }
  }

  if (ready) {
    return <SpanishAnimalGame />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        accessibilityRole="button"
        onPress={goBack}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <View style={styles.loading}>
        <Text style={styles.animals}>🐶 🐱 🐮 🐦</Text>

        <ActivityIndicator
          size="large"
          color={C.primary}
          accessibilityLabel="Cargando el juego de animales"
        />

        <Text style={styles.message}>
          Preparando el jardín…
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
  backButton: {
    alignSelf: 'flex-start',
    margin: 16,
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: C.blue,
  },
  backText: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 15,
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