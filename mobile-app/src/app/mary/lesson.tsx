
import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  Stack,
  router,
  useLocalSearchParams,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

// All five English lesson components
import AlphabetLesson from '@/components/lessons/AlphabetLesson';
import AnimalsLesson from '@/components/lessons/AnimalsLesson';
import ColorsLesson from '@/components/lessons/ColorsLesson';
import FruitsLesson from '@/components/lessons/FruitsLesson';
import ShapesLesson from '@/components/lessons/ShapesLesson';

// Five lesson categories
const categoryNames: Record<string, string> = {
  alphabet: 'Alphabet',
  animals: 'Animals',
  colors: 'Colors',
  fruits: 'Fruits',
  shapes: 'Shapes',
};

// Available languages
const languageNames: Record<string, string> = {
  english: 'English',
  french: 'French',
  turkish: 'Turkish',
  spanish: 'Spanish',
  chinese: 'Chinese',
  swahili: 'Swahili',
};

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    language?: string;
    category?: string;
  }>();

  const languageId =
    typeof params.language === 'string'
      ? params.language.toLowerCase()
      : 'english';

  const categoryId =
    typeof params.category === 'string'
      ? params.category.toLowerCase()
      : '';

  const languageName =
    languageNames[languageId] ?? 'Language';

  const categoryName =
    categoryNames[categoryId] ?? 'Lesson';

  // Return to the Categories screen.
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: languageId,
          activity: 'lessons',
        },
      });
    }
  }

  // English Alphabet Lesson
  if (
    languageId === 'english' &&
    categoryId === 'alphabet'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <AlphabetLesson onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Animals Lesson
  if (
    languageId === 'english' &&
    categoryId === 'animals'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <AnimalsLesson onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Colors Lesson
  if (
    languageId === 'english' &&
    categoryId === 'colors'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <ColorsLesson onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Fruits Lesson
  if (
    languageId === 'english' &&
    categoryId === 'fruits'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <FruitsLesson onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // NEW: English Shapes Lesson
  if (
    languageId === 'english' &&
    categoryId === 'shapes'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <ShapesLesson onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // Temporary screen for lessons not yet developed
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to categories"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </Pressable>

        <View style={styles.messageCard}>
          <Text style={styles.emoji}>
            🌈📚✨
          </Text>

          <Text style={styles.title}>
            {languageName} {categoryName} Lesson
          </Text>

          <Text style={styles.description}>
            A new learning adventure is coming soon!
          </Text>

          <Text style={styles.subText}>
            We are preparing something fun for you!
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose another category"
            onPress={handleBack}
            style={styles.chooseButton}
          >
            <Text style={styles.chooseText}>
              Choose Another Category →
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 20,
  },

  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  messageCard: {
    backgroundColor: C.green,
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    marginTop: 30,
  },

  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    lineHeight: 24,
  },

  subText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },

  chooseButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 15,
    marginTop: 25,
  },

  chooseText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});
