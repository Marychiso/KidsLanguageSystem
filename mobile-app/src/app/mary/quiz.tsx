
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

// All five English quizzes
import AlphabetQuiz from '@/components/quizzes/AlphabetQuiz';
import AnimalsQuiz from '@/components/quizzes/AnimalsQuiz';
import ColorsQuiz from '@/components/quizzes/ColorsQuiz';
import FruitsQuiz from '@/components/quizzes/FruitsQuiz';
import ShapesQuiz from '@/components/quizzes/ShapesQuiz';

const categoryNames: Record<string, string> = {
  alphabet: 'Alphabet',
  animals: 'Animals',
  colors: 'Colors',
  fruits: 'Fruits',
  shapes: 'Shapes',
};

const languageNames: Record<string, string> = {
  english: 'English',
  french: 'French',
  turkish: 'Turkish',
  spanish: 'Spanish',
  chinese: 'Chinese',
  swahili: 'Swahili',
};

export default function QuizScreen() {
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
    categoryNames[categoryId] ?? 'Quiz';

  // Return to the quiz categories.
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: languageId,
          activity: 'quizzes',
        },
      });
    }
  }

  // English Alphabet Quiz
  if (
    languageId === 'english' &&
    categoryId === 'alphabet'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <AlphabetQuiz onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Animals Quiz
  if (
    languageId === 'english' &&
    categoryId === 'animals'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <AnimalsQuiz onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Colors Quiz
  if (
    languageId === 'english' &&
    categoryId === 'colors'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <ColorsQuiz onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // English Fruits Quiz
  if (
    languageId === 'english' &&
    categoryId === 'fruits'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <FruitsQuiz onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // NEW: English Shapes Quiz
  if (
    languageId === 'english' &&
    categoryId === 'shapes'
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <ShapesQuiz onExit={handleBack} />
      </SafeAreaView>
    );
  }

  // Other languages: quizzes will be added later.
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to quiz categories"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </Pressable>

        <View style={styles.messageCard}>
          <Text style={styles.emoji}>
            🧠 🌈 ⭐
          </Text>

          <Text style={styles.title}>
            {languageName} {categoryName} Quiz
          </Text>

          <Text style={styles.description}>
            A fun new quiz is coming soon!
          </Text>

          <Text style={styles.subText}>
            Keep learning and practicing!
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            style={styles.chooseButton}
          >
            <Text style={styles.chooseText}>
              Choose Another Quiz →
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
    backgroundColor: '#E9E1FF',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    marginTop: 30,
  },

  emoji: {
    fontSize: 50,
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
    marginTop: 9,
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
