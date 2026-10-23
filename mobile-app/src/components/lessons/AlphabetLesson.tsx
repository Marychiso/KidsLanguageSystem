
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type AlphabetLessonProps = {
  onExit: () => void;
};

// Same alphabet and example words used on the website
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const words: Record<string, string> = {
  A: 'Apple',
  B: 'Ball',
  C: 'Cat',
  D: 'Dog',
  E: 'Egg',
  F: 'Fish',
  G: 'Goat',
  H: 'Hat',
  I: 'Ice cream',
  J: 'Juice',
  K: 'Kite',
  L: 'Lion',
  M: 'Monkey',
  N: 'Nest',
  O: 'Orange',
  P: 'Pen',
  Q: 'Queen',
  R: 'Rabbit',
  S: 'Sun',
  T: 'Tiger',
  U: 'Umbrella',
  V: 'Van',
  W: 'Whale',
  X: 'Xylophone',
  Y: 'Yam',
  Z: 'Zebra',
};

const wordEmojis: Record<string, string> = {
  A: '🍎',
  B: '⚽',
  C: '🐱',
  D: '🐶',
  E: '🥚',
  F: '🐟',
  G: '🐐',
  H: '🎩',
  I: '🍦',
  J: '🧃',
  K: '🪁',
  L: '🦁',
  M: '🐵',
  N: '🪺',
  O: '🍊',
  P: '🖊️',
  Q: '👑',
  R: '🐰',
  S: '☀️',
  T: '🐯',
  U: '☂️',
  V: '🚐',
  W: '🐳',
  X: '🎵',
  Y: '🍠',
  Z: '🦓',
};

const cardColors = [
  '#FFE2EC',
  '#DDF3E6',
  '#DDEBFF',
  '#FFF0C7',
  '#E9E1FF',
];

export default function AlphabetLesson({
  onExit,
}: AlphabetLessonProps) {
  const [selectedLetter, setSelectedLetter] = useState<
    string | null
  >(null);

  const [viewedLetters, setViewedLetters] = useState<
    string[]
  >([]);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const lessonCompleted = viewedLetters.length >= 5;

  // Stop speech when leaving the component
  useEffect(() => {
    return () => {
      void Speech.stop().catch(() => {});
    };
  }, []);

  // Animate the selected letter
  useEffect(() => {
    if (!selectedLetter) {
      scaleValue.setValue(1);
      return;
    }

    scaleValue.setValue(0.8);

    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [selectedLetter, scaleValue]);

  // Pronounce the chosen letter and example word
  async function speakLetter(letter: string) {
    const sentence = `${letter} is for ${words[letter]}`;

    try {
      await Speech.stop();

      Speech.speak(sentence, {
        language: 'en-GB',
        rate: 0.8,
        pitch: 1,
      });
    } catch (error) {
      console.warn('Unable to play speech:', error);
    }
  }

  // Open the selected letter
  function handleLetterPress(letter: string) {
    setSelectedLetter(letter);

    setViewedLetters((previous) => {
      if (previous.includes(letter)) {
        return previous;
      }

      return [...previous, letter];
    });

    void speakLetter(letter);
  }

  // Return to the alphabet grid
  function backToGrid() {
    void Speech.stop().catch(() => {});
    setSelectedLetter(null);
  }

  // Exit the lesson
  function handleFinish() {
    void Speech.stop().catch(() => {});
    onExit();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {selectedLetter === null ? (
        <>
          {/* Back to categories */}
          <Pressable
            onPress={handleFinish}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          {/* Lesson header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              🔤🌈✨
            </Text>

            <Text style={styles.headerTitle}>
              Alphabet Adventure!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's learn our ABCs together!
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Pick a Letter! ⭐
          </Text>

          <Text style={styles.instructions}>
            Tap any letter to discover a word and hear
            how it sounds.
          </Text>

          {/* Alphabet grid */}
          <View style={styles.alphabetGrid}>
            {alphabet.map((letter, index) => {
              const hasViewed =
                viewedLetters.includes(letter);

              return (
                <Pressable
                  key={letter}
                  accessibilityRole="button"
                  accessibilityLabel={`Learn letter ${letter}`}
                  onPress={() => handleLetterPress(letter)}
                  style={({ pressed }) => [
                    styles.letterButton,
                    {
                      backgroundColor:
                        cardColors[index % cardColors.length],
                    },
                    hasViewed && styles.viewedLetter,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.letterText}>
                    {letter}
                  </Text>

                  {hasViewed && (
                    <Text style={styles.viewedCheck}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Lesson progress */}
          <View style={styles.progressCard}>
            <Text style={styles.progressEmoji}>
              🌟
            </Text>

            <Text style={styles.progressTitle}>
              Your Alphabet Journey
            </Text>

            <Text style={styles.progressText}>
              {viewedLetters.length} of 26 letters explored!
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (viewedLetters.length / 26) * 100
                    }%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressHint}>
              {lessonCompleted
                ? 'Amazing! You reached your first 5 letters! 🎉'
                : 'Explore 5 different letters to reach your first goal!'}
            </Text>
          </View>

          <Pressable
            onPress={handleFinish}
            accessibilityRole="button"
            style={styles.finishButton}
          >
            <Text style={styles.finishText}>
              Finish Lesson ✓
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Back to alphabet grid */}
          <Pressable
            onPress={backToGrid}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Letters
            </Text>
          </Pressable>

          {/* Individual letter view */}
          <View style={styles.detailCard}>
            <Text style={styles.detailHeading}>
              Meet the Letter! 🌟
            </Text>

            <Animated.View
              style={[
                styles.bigLetterCircle,
                {
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              <Text style={styles.bigLetter}>
                {selectedLetter}
              </Text>
            </Animated.View>

            <Text style={styles.wordEmoji}>
              {wordEmojis[selectedLetter]}
            </Text>

            <Text style={styles.wordSentence}>
              {selectedLetter} is for{' '}
              {words[selectedLetter]}!
            </Text>

            <Pressable
              onPress={() =>
                void speakLetter(selectedLetter)
              }
              accessibilityRole="button"
              accessibilityLabel="Hear pronunciation again"
              style={({ pressed }) => [
                styles.speakButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.speakText}>
                🔊 Listen Again
              </Text>
            </Pressable>
          </View>

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              🎉 Wonderful job, little superstar!
            </Text>

            <Text style={styles.encouragementHint}>
              Let's discover another letter!
            </Text>
          </View>

          <Pressable
            onPress={backToGrid}
            accessibilityRole="button"
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>
              Choose Another Letter →
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 45,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 18,
  },

  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  header: {
    backgroundColor: '#DDEBFF',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
  },

  headerEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 9,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },

  instructions: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },

  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
    marginBottom: 22,
  },

  letterButton: {
    width: '15%',
    minHeight: 56,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  letterText: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
  },

  viewedLetter: {
    borderWidth: 2,
    borderColor: '#42A66B',
  },

  viewedCheck: {
    position: 'absolute',
    top: 1,
    right: 5,
    fontSize: 11,
    color: '#248044',
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },

  progressCard: {
    backgroundColor: '#FFF0C7',
    padding: 22,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },

  progressEmoji: {
    fontSize: 33,
    marginBottom: 8,
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },

  progressText: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 8,
  },

  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 8,
    backgroundColor: C.white,
    marginTop: 16,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#42A66B',
  },

  progressHint: {
    fontSize: 12,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },

  finishButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  finishText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
  },

  detailCard: {
    backgroundColor: '#FFE6EF',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },

  detailHeading: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 18,
  },

  bigLetterCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  bigLetter: {
    fontSize: 100,
    fontWeight: '900',
    color: C.primary,
  },

  wordEmoji: {
    fontSize: 68,
    marginBottom: 13,
  },

  wordSentence: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 22,
  },

  speakButton: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minHeight: 48,
    justifyContent: 'center',
  },

  speakText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
  },

  encouragementCard: {
    backgroundColor: C.green,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  encouragementText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  encouragementHint: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 8,
  },

  nextButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },

  nextText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
