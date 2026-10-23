import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

const pages = [
  {
    title: 'A garden of letters',
    text: 'Ally walks through a bright garden. She sees many letters around her.',
  },
  {
    title: 'More letters!',
    text: 'She keeps walking and finds more letters along the way.',
  },
  {
    title: 'All together',
    text:
      'At the end, all the letters from A to Z stood and shined together. ' +
      'Ally smiled and said, "So many letters!"',
  },
];

const ending = 'She waved goodbye and walked home smiling.';

const firstWords = [
  { letter: 'A', word: 'Apple', picture: '🍎' },
  { letter: 'B', word: 'Ball', picture: '⚽' },
  { letter: 'C', word: 'Cat', picture: '🐱' },
  { letter: 'D', word: 'Dog', picture: '🐶' },
  { letter: 'E', word: 'Elephant', picture: '🐘' },
];

const nextWords = [
  { letter: 'J', word: 'Juice', picture: '🧃' },
  { letter: 'K', word: 'Kite', picture: '🪁' },
  { letter: 'L', word: 'Lion', picture: '🦁' },
  { letter: 'M', word: 'Monkey', picture: '🐵' },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const pastelColors = [C.blue, C.yellow, C.pink, C.green, C.lavender];

function JumpingLetter({
  letter,
  index,
  animate,
  onPress,
}: {
  letter: string;
  index: number;
  animate: boolean;
  onPress: () => void;
}) {
  const jump = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    jump.setValue(0);

    if (!animate) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 160),
        Animated.timing(jump, {
          toValue: -16,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(jump, {
          toValue: 0,
          duration: 500,
          easing: Easing.bounce,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.delay(1100),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
      jump.setValue(0);
    };
  }, [animate, index, jump]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: jump }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hear letter ${letter}`}
        onPress={onPress}
        style={[
          styles.floatingLetter,
          {
            backgroundColor:
              pastelColors[index % pastelColors.length],
          },
        ]}
      >
        <Text style={styles.floatingLetterText}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AlphabetStory() {
  const [page, setPage] = useState(0);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const focusRef = useRef(false);
  const foregroundRef = useRef(AppState.currentState === 'active');
  const requestId = useRef(0);
  const readFollowingPages = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const stopNarration = useCallback(() => {
    requestId.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusRef.current = true;
      setFocused(true);

      return () => {
        focusRef.current = false;
        setFocused(false);
        readFollowingPages.current = false;
        stopNarration();
      };
    }, [stopNarration]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const isActive = state === 'active';
      foregroundRef.current = isActive;
      setForeground(isActive);

      if (!isActive && focusRef.current) {
        readFollowingPages.current = false;
        stopNarration();
      }
    });

    return () => subscription.remove();
  }, [stopNarration]);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function speak(text: string) {
    const thisRequest = ++requestId.current;
    setMessage('');

    function isCurrent() {
      return (
        thisRequest === requestId.current &&
        focusRef.current &&
        foregroundRef.current
      );
    }

    try {
      await Speech.stop();
      if (!isCurrent()) return;

      const voices = await Speech.getAvailableVoicesAsync();
      if (!isCurrent()) return;

      const preferred = voices.find((voice) =>
        voice.name.toLowerCase().includes('google uk english female'),
      );

      const selected =
        preferred ??
        voices.find(
          (voice) =>
            voice.language.toLowerCase().replace('_', '-') === 'en-gb',
        ) ??
        voices.find((voice) =>
          voice.language.toLowerCase().startsWith('en'),
        );

      Speech.speak(text, {
        language: selected?.language ?? 'en-GB',
        ...(selected ? { voice: selected.identifier } : {}),
        rate: 0.85,
        pitch: 1,
        onError: () => {
          if (isCurrent()) {
            setMessage('Could not play the voice. Please try again.');
          }
        },
      });
    } catch {
      if (isCurrent()) {
        setMessage('Could not play the voice. Please try again.');
      }
    }
  }

  function narrationFor(index: number) {
    return index === 2
      ? `${pages[index].text} ${ending}`
      : pages[index].text;
  }

  function hearLetter(letter: string, word?: string) {
    readFollowingPages.current = false;
    setSelectedLetter(letter);

    void speak(
      word ? `${letter} is for ${word}.` : `The letter ${letter}.`,
    );
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    const shouldRead = readFollowingPages.current;
    stopNarration();
    setPage(nextPage);
    setSelectedLetter(null);
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (shouldRead) {
      void speak(narrationFor(nextPage));
    }
  }

  function openStories() {
    readFollowingPages.current = false;
    stopNarration();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'english',
        activity: 'stories',
      },
    });
  }

  function goBack() {
    if (page > 0) {
      changePage(page - 1);
      return;
    }

    readFollowingPages.current = false;
    stopNarration();

    if (router.canGoBack()) {
      router.back();
    } else {
      openStories();
    }
  }

  function replay() {
    readFollowingPages.current = true;
    changePage(0);
  }

  const words = page === 0 ? firstWords : nextWords;
  const sceneLetters =
    page === 0 ? ['A', 'B', 'C'] : page === 1 ? ['J', 'K', 'L'] : ['X', 'Y', 'Z'];

  const animate = focused && foreground && !reduceMotion;

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              onPress={goBack}
              style={styles.backButton}
            >
              <Text style={styles.linkText}>← Back</Text>
            </Pressable>

            <Text style={styles.pageNumber}>{page + 1} / 3</Text>
          </View>

          <Text style={styles.title}>Ally’s Alphabet Walk</Text>

          <View style={styles.scene}>
            <Text
              accessible={false}
              style={styles.sun}
            >
              ☀️
            </Text>

            <Text
              accessible={false}
              style={styles.cloud}
            >
              ☁️
            </Text>

            <View style={styles.hill} />
            <View style={styles.path} />

            <Text
              accessible={false}
              style={styles.tree}
            >
              🌳
            </Text>

            <Text
              accessibilityLabel="Ally in the garden"
              style={styles.ally}
            >
              {page === 2 ? '🙋🏽‍♀️' : '🚶🏽‍♀️'}
            </Text>

            <View style={styles.sceneLetters}>
              {sceneLetters.map((letter, index) => (
                <JumpingLetter
                  key={`${page}-${letter}`}
                  letter={letter}
                  index={index}
                  animate={animate}
                  onPress={() => hearLetter(letter)}
                />
              ))}
            </View>

            <Text accessible={false} style={styles.flowers}>
              🌷  🌼  🌷
            </Text>

            {page === 2 && (
              <Text accessible={false} style={styles.sparkles}>
                ✨
              </Text>
            )}
          </View>

          <View style={styles.storyCard}>
            <Text style={styles.sceneTitle}>
              {pages[page].title}
            </Text>

            <Text style={styles.storyText}>
              {pages[page].text}
            </Text>

            {page === 2 && (
              <Text style={styles.ending}>{ending} ✨</Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                readFollowingPages.current = true;
                void speak(narrationFor(page));
              }}
              style={({ pressed }) => [
                styles.readButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkText}>🔊 Read to me</Text>
            </Pressable>

            {!!message && (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.message}
              >
                {message}
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>
            {page === 2 ? 'Tap a letter' : 'Tap a picture'}
          </Text>

          {page < 2 ? (
            <View style={styles.wordGrid}>
              {words.map((item, index) => (
                <Pressable
                  key={item.letter}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.letter} is for ${item.word}`}
                  onPress={() => hearLetter(item.letter, item.word)}
                  style={({ pressed }) => [
                    styles.wordCard,
                    {
                      backgroundColor:
                        pastelColors[index % pastelColors.length],
                    },
                    selectedLetter === item.letter && styles.selected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cardLetter}>{item.letter}</Text>
                  <Text accessible={false} style={styles.picture}>
                    {item.picture}
                  </Text>
                  <Text style={styles.word}>{item.word}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.alphabetGrid}>
              {alphabet.map((letter, index) => (
                <Pressable
                  key={letter}
                  accessibilityRole="button"
                  accessibilityLabel={`Hear letter ${letter}`}
                  onPress={() => hearLetter(letter)}
                  style={({ pressed }) => [
                    styles.alphabetTile,
                    {
                      backgroundColor:
                        pastelColors[index % pastelColors.length],
                    },
                    selectedLetter === letter && styles.selected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.alphabetLetter}>{letter}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.controls}>
            {page === 2 && (
              <Pressable
                accessibilityRole="button"
                onPress={replay}
                style={({ pressed }) => [
                  styles.replayButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.linkText}>↻ Replay</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (page === 2) {
                  openStories();
                } else {
                  changePage(page + 1);
                }
              }}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.nextText}>
                {page === 2 ? 'Finish ✓' : 'Next →'}
              </Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: C.blue,
    borderRadius: 16,
  },
  linkText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  pageNumber: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  scene: {
    height: 220,
    backgroundColor: C.blue,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sun: {
    position: 'absolute',
    right: 14,
    top: 8,
    fontSize: 42,
  },
  cloud: {
    position: 'absolute',
    left: '36%',
    top: 8,
    fontSize: 42,
  },
  hill: {
    position: 'absolute',
    left: -30,
    right: -30,
    bottom: -30,
    height: 110,
    backgroundColor: '#BFE5B0',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  path: {
    position: 'absolute',
    bottom: -35,
    left: '22%',
    width: 100,
    height: 105,
    backgroundColor: '#F8DDB5',
    borderRadius: 45,
    transform: [{ rotate: '35deg' }],
  },
  tree: {
    position: 'absolute',
    left: 0,
    top: 38,
    fontSize: 84,
  },
  ally: {
    position: 'absolute',
    bottom: 20,
    left: 22,
    fontSize: 65,
  },
  sceneLetters: {
    position: 'absolute',
    left: 98,
    right: 10,
    bottom: 62,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  floatingLetter: {
    width: 48,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  floatingLetterText: {
    color: C.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  flowers: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    fontSize: 25,
  },
  sparkles: {
    position: 'absolute',
    left: '53%',
    top: 55,
    fontSize: 30,
  },
  storyCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 18,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 10,
  },
  storyText: {
    color: C.text,
    fontSize: 17,
    lineHeight: 27,
  },
  ending: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  readButton: {
    minHeight: 46,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: C.lavender,
    borderRadius: 15,
    marginTop: 16,
  },
  message: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 12,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  wordCard: {
    width: '48%',
    minHeight: 140,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardLetter: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 25,
    fontWeight: '900',
    color: C.primary,
  },
  picture: {
    fontSize: 46,
    marginTop: 12,
    marginBottom: 8,
  },
  word: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  alphabetTile: {
    width: 48,
    minHeight: 52,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  alphabetLetter: {
    color: C.primary,
    fontSize: 25,
    fontWeight: '800',
  },
  selected: {
    borderColor: C.primary,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  replayButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.lavender,
    borderRadius: 18,
    padding: 12,
  },
  nextButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 12,
  },
  nextText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});