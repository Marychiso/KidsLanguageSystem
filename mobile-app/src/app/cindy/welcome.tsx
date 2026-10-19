import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';
import WavingKids from '@/components/waving-kids';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panel}>
          <Text style={styles.brand}>Kids Language Learning</Text>

          <Text style={styles.tagline}>
            Little words. Big adventures.
          </Text>

          <View style={styles.illustration}>
            <WavingKids />

            <View style={styles.bookBadge}>
              <Text style={styles.book}>📖</Text>
              <Text style={styles.bookLabel}>
                A new adventure awaits
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            A world of words{'\n'}starts here!
          </Text>

          <View style={styles.features}>
            <View style={[styles.chip, { backgroundColor: C.blue }]}>
              <Text style={styles.chipText}>📚 Learn</Text>
            </View>

            <View style={[styles.chip, { backgroundColor: C.yellow }]}>
              <Text style={styles.chipText}>🎮 Play</Text>
            </View>

            <View style={[styles.chip, { backgroundColor: C.green }]}>
              <Text style={styles.chipText}>🌱 Grow</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cindy/register')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>Get Started →</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cindy/login')}
            style={styles.signInButton}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    alignItems: 'center',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
  },
  illustration: {
    width: '100%',
    backgroundColor: C.blue,
    borderRadius: 36,
    alignItems: 'center',
    padding: 24,
    marginTop: 28,
    marginBottom: 28,
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.yellow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  book: {
    fontSize: 22,
  },
  bookLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
    flexShrink: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 24,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  button: {
    width: '100%',
    minHeight: 56,
    backgroundColor: C.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  signInButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  signInText: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  signInLink: {
    color: C.primary,
    fontWeight: '700',
  },
});