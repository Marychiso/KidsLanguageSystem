
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Stack,
  router,
} from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type LetterItem = {
  letter: string;
  word: string;
  meaning: string;
  emoji: string;
};

const LETTERS: LetterItem[] = [
  { letter: 'A', word: 'Avion', meaning: 'Airplane', emoji: '✈️' },
  { letter: 'B', word: 'Ballon', meaning: 'Ball', emoji: '⚽' },
  { letter: 'C', word: 'Chat', meaning: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dauphin', meaning: 'Dolphin', emoji: '🐬' },
  { letter: 'E', word: 'Éléphant', meaning: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fleur', meaning: 'Flower', emoji: '🌸' },
  { letter: 'G', word: 'Gâteau', meaning: 'Cake', emoji: '🎂' },
  { letter: 'H', word: 'Hibou', meaning: 'Owl', emoji: '🦉' },
  { letter: 'I', word: 'Île', meaning: 'Island', emoji: '🏝️' },
  { letter: 'J', word: 'Jardin', meaning: 'Garden', emoji: '🌻' },
  { letter: 'K', word: 'Kangourou', meaning: 'Kangaroo', emoji: '🦘' },
  { letter: 'L', word: 'Lion', meaning: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Maison', meaning: 'House', emoji: '🏠' },
  { letter: 'N', word: 'Nuage', meaning: 'Cloud', emoji: '☁️' },
  { letter: 'O', word: 'Orange', meaning: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Pomme', meaning: 'Apple', emoji: '🍎' },
  { letter: 'Q', word: 'Quatre', meaning: 'Four', emoji: '4️⃣' },
  { letter: 'R', word: 'Robot', meaning: 'Robot', emoji: '🤖' },
  { letter: 'S', word: 'Soleil', meaning: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tortue', meaning: 'Turtle', emoji: '🐢' },
  { letter: 'U', word: 'Usine', meaning: 'Factory', emoji: '🏭' },
  { letter: 'V', word: 'Vélo', meaning: 'Bicycle', emoji: '🚲' },
  { letter: 'W', word: 'Wagon', meaning: 'Wagon', emoji: '🚃' },
  { letter: 'X', word: 'Xylophone', meaning: 'Xylophone', emoji: '🎼' },
  { letter: 'Y', word: 'Yaourt', meaning: 'Yogurt', emoji: '🥣' },
  { letter: 'Z', word: 'Zèbre', meaning: 'Zebra', emoji: '🦓' },
];

const OPENING_DELAY_MS = 1600;

export default function FrenchAlphabetLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);

  const soundOnRef = useRef(true);
  const speechGeneration = useRef(0);
  const voiceRef = useRef<string | undefined>(undefined);

  const current = LETTERS[index];

  const stopSpeech = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!soundOnRef.current) return;

    const generation = ++speechGeneration.current;

    try {
      await Speech.stop();

      if (
        generation !== speechGeneration.current ||
        !soundOnRef.current
      ) {
        return;
      }

      Speech.speak(text, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.8,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French speech error:', error);
    }
  }, []);

  // Find an available French voice.
  useEffect(() => {
    let active = true;

    async function loadFrenchVoice() {
      try {
        const voices =
          await Speech.getAvailableVoicesAsync();

        const frenchVoices = voices.filter(
          (voice) =>
            voice.language
              .toLowerCase()
              .startsWith('fr-fr')
        );

        const otherFrench = voices.filter(
          (voice) =>
            voice.language
              .toLowerCase()
              .startsWith('fr')
        );

        const selected =
          frenchVoices.find(
            (voice) =>
              voice.quality ===
              Speech.VoiceQuality.Enhanced
          ) ??
          frenchVoices[0] ??
          otherFrench[0];

        if (active) {
          voiceRef.current = selected?.identifier;
        }
      } catch (error) {
        console.warn('French voice unavailable:', error);
      }
    }

    void loadFrenchVoice();

    return () => {
      active = false;
    };
  }, []);

  // Announce each new letter after a short pause.
  useEffect(() => {
    if (completed) return;

    setReady(false);
    stopSpeech();

    const timer = setTimeout(() => {
      setReady(true);
      void speak(`${current.letter}. ${current.word}.`);
    }, OPENING_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [
    index,
    completed,
    current.letter,
    current.word,
    speak,
    stopSpeech,
  ]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;

    soundOnRef.current = next;
    setSoundOn(next);

    if (!next) {
      stopSpeech();
    } else if (ready && !completed) {
      void speak(`${current.letter}. ${current.word}.`);
    }
  }

  function goBack() {
    stopSpeech();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: 'french',
          activity: 'lessons',
        },
      });
    }
  }

  function nextLetter() {
    if (!ready) return;

    stopSpeech();

    if (index < LETTERS.length - 1) {
      setIndex((previous) => previous + 1);
    } else {
      setCompleted(true);
    }
  }

  function previousLetter() {
    stopSpeech();

    if (completed) {
      setCompleted(false);
      return;
    }

    if (index > 0) {
      setIndex((previous) => previous - 1);
    } else {
      goBack();
    }
  }

  function replay() {
    stopSpeech();
    setIndex(0);
    setReady(false);
    setCompleted(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={toggleSound}
            accessibilityLabel={
              soundOn ? 'Turn sound off' : 'Turn sound on'
            }
            style={[
              styles.soundButton,
              !soundOn && styles.mutedButton,
            ]}
          >
            <Text style={styles.soundText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </Pressable>
        </View>

        {completed ? (
          <>
            <View style={styles.celebration}>
              <Text style={styles.celebrationEmoji}>
                🏆 🇫🇷 🎉
              </Text>

              <Text style={styles.celebrationTitle}>
                Bravo !
              </Text>

              <Text style={styles.celebrationText}>
                Tu connais l'alphabet français !
              </Text>

              <Text style={styles.translation}>
                Great job! You explored all 26 letters
                of the French alphabet.
              </Text>

              <Text style={styles.stars}>
                ⭐ ⭐ ⭐
              </Text>
            </View>

            <Pressable
              onPress={replay}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>
                🔄 Recommencer
              </Text>
            </Pressable>

            <Pressable
              onPress={goBack}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>
                Terminer ✓
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.flag}>🇫🇷</Text>

              <Text style={styles.title}>
                L'Alphabet Français
              </Text>

              <Text style={styles.subtitle}>
                Discover French letters and words!
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressText}>
                Lettre {index + 1} sur {LETTERS.length}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        ((index + 1) / LETTERS.length) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.lessonCard}>
              <Text style={styles.cardHeading}>
                {ready
                  ? 'Écoute et répète !'
                  : 'Prépare-toi...'}
              </Text>

              <View style={styles.letterCircle}>
                <Text style={styles.bigLetter}>
                  {current.letter}
                </Text>
              </View>

              <Text style={styles.emoji}>
                {current.emoji}
              </Text>

              <Text style={styles.frenchWord}>
                {current.word}
              </Text>

              <Text style={styles.translation}>
                {current.meaning}
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={!soundOn || !ready}
                onPress={() =>
                  void speak(
                    `${current.letter}. ${current.word}.`
                  )
                }
                style={[
                  styles.listenButton,
                  (!soundOn || !ready) &&
                    styles.disabledButton,
                ]}
              >
                <Text style={styles.listenText}>
                  🔊 Écouter encore
                </Text>
              </Pressable>
            </View>

            <View style={styles.navigationRow}>
              <Pressable
                accessibilityRole="button"
                onPress={previousLetter}
                style={styles.previousButton}
              >
                <Text style={styles.previousText}>
                  ← Précédent
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={nextLetter}
                disabled={!ready}
                style={[
                  styles.nextButton,
                  !ready && styles.disabledButton,
                ]}
              >
                <Text style={styles.nextText}>
                  {index === LETTERS.length - 1
                    ? 'Terminer ✓'
                    : 'Suivant →'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                🌟 Tip: Listen to the French word
                and try saying it aloud!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: C.blue,
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderRadius: 17,
  },
  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  soundButton: {
    backgroundColor: '#DDF7E5',
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 17,
  },
  mutedButton: {
    backgroundColor: '#F0EAF5',
  },
  soundText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '800',
  },
  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 17,
  },
  flag: {
    fontSize: 43,
    marginBottom: 9,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  progressCard: {
    backgroundColor: '#FFF0C7',
    padding: 17,
    borderRadius: 19,
    marginBottom: 18,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 11,
  },
  progressTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#43A866',
    borderRadius: 8,
  },
  lessonCard: {
    backgroundColor: '#FFE5EF',
    padding: 25,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 19,
  },
  cardHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 16,
  },
  letterCircle: {
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigLetter: {
    fontSize: 86,
    fontWeight: '800',
    color: C.primary,
  },
  emoji: {
    fontSize: 65,
    marginBottom: 10,
  },
  frenchWord: {
    fontSize: 29,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  translation: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 17,
    paddingHorizontal: 23,
    paddingVertical: 14,
    marginTop: 20,
  },
  listenText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  previousButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: C.blue,
  },
  previousText: {
    fontSize: 15,
    color: C.primary,
    fontWeight: '800',
  },
  nextButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: C.primary,
  },
  nextText: {
    color: C.white,
    fontWeight: '800',
    fontSize: 15,
  },
  tipCard: {
    backgroundColor: '#E9E1FF',
    borderRadius: 19,
    padding: 17,
  },
  tipText: {
    color: C.text,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  celebration: {
    backgroundColor: '#FFF0C7',
    padding: 30,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
  celebrationEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    marginBottom: 13,
  },
  celebrationText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 13,
  },
  stars: {
    fontSize: 35,
    marginTop: 22,
  },
  primaryButton: {
    backgroundColor: C.primary,
    padding: 17,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: C.blue,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  secondaryText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
