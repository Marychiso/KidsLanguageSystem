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
  Platform,
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
    title: 'Un jardín de letras',
    text:
      'Ally pasea por un bonito jardín. ' +
      'Ve muchas letras a su alrededor.',
  },
  {
    title: '¡Más letras!',
    text:
      'Sigue caminando y descubre nuevas letras por el camino. ' +
      '¡También encuentra la eñe!',
  },
  {
    title: 'Todas juntas',
    text:
      'Al final, las veintisiete letras del abecedario brillan juntas, ' +
      'de la a a la zeta, incluida la eñe. ' +
      'Ally sonríe y dice: «¡Cuántas letras!»',
  },
];

const ending =
  'Se despide con la mano y vuelve a casa sonriendo.';

const firstWords = [
  { letter: 'A', word: 'Árbol', picture: '🌳' },
  { letter: 'B', word: 'Balón', picture: '⚽' },
  { letter: 'C', word: 'Casa', picture: '🏠' },
  { letter: 'D', word: 'Delfín', picture: '🐬' },
  { letter: 'E', word: 'Elefante', picture: '🐘' },
];

const nextWords = [
  { letter: 'J', word: 'Jirafa', picture: '🦒' },
  { letter: 'K', word: 'Koala', picture: '🐨' },
  { letter: 'L', word: 'León', picture: '🦁' },
  { letter: 'M', word: 'Manzana', picture: '🍎' },
];

const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const letterNames: Record<string, string> = {
  A: 'a',
  B: 'be',
  C: 'ce',
  D: 'de',
  E: 'e',
  F: 'efe',
  G: 'ge',
  H: 'hache',
  I: 'i',
  J: 'jota',
  K: 'ka',
  L: 'ele',
  M: 'eme',
  N: 'ene',
  Ñ: 'eñe',
  O: 'o',
  P: 'pe',
  Q: 'cu',
  R: 'erre',
  S: 'ese',
  T: 'te',
  U: 'u',
  V: 'uve',
  W: 'uve doble',
  X: 'equis',
  Y: 'ye',
  Z: 'zeta',
};

const pastelColors = [
  C.blue,
  C.yellow,
  C.pink,
  C.green,
  C.lavender,
];

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

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
          useNativeDriver: Platform.OS !== 'web',
          isInteraction: false,
        }),
        Animated.timing(jump, {
          toValue: 0,
          duration: 500,
          easing: Easing.bounce,
          useNativeDriver: Platform.OS !== 'web',
          isInteraction: false,
        }),
        Animated.delay(1100),
      ])
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
        accessibilityLabel={`Escuchar la letra ${letterNames[letter]}`}
        onPress={onPress}
        style={[
          styles.floatingLetter,
          {
            backgroundColor:
              pastelColors[index % pastelColors.length],
          },
        ]}
      >
        <Text style={styles.floatingLetterText}>
          {letter}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SpanishAlphabetStory() {
  const [page, setPage] = useState(0);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedLetter, setSelectedLetter] =
    useState<string | null>(null);

  const mounted = useRef(true);
  const active = useRef(false);
  const requestId = useRef(0);
  const readFollowingPages = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const voiceRef = useRef<Speech.Voice | undefined>(undefined);

  const loadVoice = useCallback(async () => {
    const voices = await Speech.getAvailableVoicesAsync();

    const spanishVoices = voices.filter((voice) =>
      /^es(?:[-_]|$)/i.test(voice.language)
    );

    const spainVoices = spanishVoices.filter((voice) =>
      /^es[-_]ES$/i.test(voice.language)
    );

    const selected =
      spainVoices.find(
        (voice) => voice.quality === Speech.VoiceQuality.Enhanced
      ) ??
      spainVoices[0] ??
      spanishVoices[0];

    voiceRef.current = selected;
    return selected;
  }, []);

  const stopNarration = useCallback(() => {
    requestId.current += 1;
    return Speech.stop().catch(() => {});
  }, []);

  useEffect(() => {
    mounted.current = true;

    void loadVoice().catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted.current) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted.current) {
          setReduceMotion(enabled);
        }
      }
    );

    return () => {
      mounted.current = false;
      active.current = false;
      readFollowingPages.current = false;
      subscription.remove();
      void stopNarration();
    };
  }, [loadVoice, stopNarration]);

  useFocusEffect(
    useCallback(() => {
      active.current = isForeground();
      setFocused(true);
      setForeground(active.current);

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          active.current = state === 'active';

          if (mounted.current) {
            setForeground(active.current);
          }

          if (!active.current) {
            readFollowingPages.current = false;
            void stopNarration();
          }
        }
      );

      return () => {
        active.current = false;
        readFollowingPages.current = false;
        subscription.remove();
        void stopNarration();

        if (mounted.current) {
          setFocused(false);
        }
      };
    }, [stopNarration])
  );

  function isCurrent(request: number) {
    return (
      mounted.current &&
      active.current &&
      request === requestId.current
    );
  }

  async function speak(text: string) {
    if (!mounted.current || !active.current) return;

    const stopping = stopNarration();
    const thisRequest = requestId.current;

    setMessage('');

    try {
      await stopping;
      if (!isCurrent(thisRequest)) return;

      let selected = voiceRef.current;

      if (!selected) {
        selected = await loadVoice();
      }

      if (!isCurrent(thisRequest)) return;

      if (!selected) {
        readFollowingPages.current = false;
        setMessage(
          'No hay una voz en español disponible en este dispositivo.'
        );
        return;
      }

      Speech.speak(text, {
        language: selected.language,
        voice: selected.identifier,
        rate: 0.83,
        pitch: 1,
        volume: 1,

        onError: () => {
          if (isCurrent(thisRequest)) {
            readFollowingPages.current = false;
            setMessage(
              'No se pudo iniciar la voz. Inténtalo de nuevo.'
            );
          }
        },
      });
    } catch {
      if (isCurrent(thisRequest)) {
        readFollowingPages.current = false;
        setMessage(
          'No se pudo iniciar la voz. Inténtalo de nuevo.'
        );
      }
    }
  }

  function narrationFor(index: number) {
    return index === pages.length - 1
      ? `${pages[index].text} ${ending}`
      : pages[index].text;
  }

  function hearLetter(letter: string, word?: string) {
    readFollowingPages.current = false;
    setSelectedLetter(letter);

    const name = letterNames[letter];

    void speak(
      word
        ? `${name}, de ${word.toLowerCase()}.`
        : `La letra ${name}.`
    );
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    setPage(nextPage);
    setSelectedLetter(null);
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (readFollowingPages.current) {
      void speak(narrationFor(nextPage));
    } else {
      void stopNarration();
    }
  }

  function openStories() {
    readFollowingPages.current = false;
    void stopNarration();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'spanish',
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
    void stopNarration();

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
    page === 0
      ? ['A', 'B', 'C']
      : page === 1
        ? ['N', 'Ñ', 'O']
        : ['X', 'Y', 'Z'];

  const animate = focused && foreground && !reduceMotion;
  const lastPage = page === pages.length - 1;

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
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkText}>← Volver</Text>
            </Pressable>

            <Text style={styles.pageNumber}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text style={styles.title}>
            Un paseo entre letras con Ally
          </Text>

          <View style={styles.scene}>
            <Text accessible={false} style={styles.sun}>
              ☀️
            </Text>

            <Text accessible={false} style={styles.cloud}>
              ☁️
            </Text>

            <View style={styles.hill} />
            <View style={styles.path} />

            <Text accessible={false} style={styles.tree}>
              🌳
            </Text>

            <Text
              accessibilityLabel="Ally en el jardín"
              style={styles.ally}
            >
              {lastPage ? '🙋🏽‍♀️' : '🚶🏽‍♀️'}
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

            {lastPage && (
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

            {lastPage && (
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
              <Text style={styles.linkText}>🔊 Escuchar</Text>
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
            {lastPage ? 'Toca una letra' : 'Toca una imagen'}
          </Text>

          {!lastPage ? (
            <View style={styles.wordGrid}>
              {words.map((item, index) => (
                <Pressable
                  key={item.letter}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `${letterNames[item.letter]}, ` +
                    `de ${item.word.toLowerCase()}`
                  }
                  accessibilityState={{
                    selected: selectedLetter === item.letter,
                  }}
                  onPress={() =>
                    hearLetter(item.letter, item.word)
                  }
                  style={({ pressed }) => [
                    styles.wordCard,
                    {
                      backgroundColor:
                        pastelColors[index % pastelColors.length],
                    },
                    selectedLetter === item.letter &&
                      styles.selected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cardLetter}>
                    {item.letter}
                  </Text>

                  <Text
                    accessible={false}
                    style={styles.picture}
                  >
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
                  accessibilityLabel={
                    `Escuchar la letra ${letterNames[letter]}`
                  }
                  accessibilityState={{
                    selected: selectedLetter === letter,
                  }}
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
                  <Text style={styles.alphabetLetter}>
                    {letter}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.controls}>
            {lastPage && (
              <Pressable
                accessibilityRole="button"
                onPress={replay}
                style={({ pressed }) => [
                  styles.replayButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.linkText}>
                  ↻ Escuchar de nuevo
                </Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (lastPage) {
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
                {lastPage ? 'Terminar ✓' : 'Siguiente →'}
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
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});