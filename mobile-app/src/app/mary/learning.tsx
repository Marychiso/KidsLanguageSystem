
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

export default function LearningScreen() {
  const { language } = useLocalSearchParams<{
    language?: string;
  }>();

  const names: Record<string, string> = {
    english: 'English',
    french: 'French',
    turkish: 'Turkish',
    spanish: 'Spanish',
    chinese: 'Chinese',
    swahili: 'Swahili',
  };

  const selectedLanguage =
    names[language ?? ''] ?? 'Your Language';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/mary/language-selection');
          }
        }}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Go Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.emoji}>🚀🌍</Text>

        <Text style={styles.title}>
          Let's Learn {selectedLanguage}!
        </Text>

        <Text style={styles.subtitle}>
          Your next adventure is coming soon!
        </Text>

        <Text style={styles.description}>
          Lessons, Quizzes, Stories and Games
          will be available here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },
  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 55,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
    marginTop: 14,
  },
  description: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
  },
});
