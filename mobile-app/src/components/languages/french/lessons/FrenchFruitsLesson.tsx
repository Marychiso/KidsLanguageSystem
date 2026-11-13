import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Fruit = {
  french: string;
  english: string;
  emoji: string;
  sentence: string;
  translation: string;
  color: string;
};

const FRUITS: Fruit[] = [
  {
    french: 'La pomme',
    english: 'Apple',
    emoji: '🍎',
    sentence: 'La pomme est rouge.',
    translation: 'The apple is red.',
    color: '#FFE1E4',
  },
  {
    french: 'La banane',
    english: 'Banana',
    emoji: '🍌',
    sentence: 'La banane est jaune.',
    translation: 'The banana is yellow.',
    color: '#FFF1B8',
  },
  {
    french: "L'orange",
    english: 'Orange',
    emoji: '🍊',
    sentence: "L'orange est orange.",
    translation: 'The orange is orange.',
    color: '#FFE4CB',
  },
  {
    french: 'La fraise',
    english: 'Strawberry',
    emoji: '🍓',
    sentence: 'La fraise est rouge.',
    translation: 'The strawberry is red.',
    color: '#FFE0E9',
  },
  {
    french: 'Le raisin',
    english: 'Grapes',
    emoji: '🍇',
    sentence: 'Le raisin est violet.',
    translation: 'The grapes are purple.',
    color: '#EBE1FF',
  },
  {
    french: 'La pastèque',
    english: 'Watermelon',
    emoji: '🍉',
    sentence: 'La pastèque est verte à l’extérieur.',
    translation: 'The watermelon is green on the outside.',
    color: '#DFF4E2',
  },
  {
    french: 'La poire',
    english: 'Pear',
    emoji: '🍐',
    sentence: 'La poire est verte.',
    translation: 'The pear is green.',
    color: '#E7F7D5',
  },
  {
    french: "L'ananas",
    english: 'Pineapple',
    emoji: '🍍',
    sentence: "L'ananas est jaune à l’intérieur.",
    translation: 'The pineapple is yellow inside.',
    color: '#FFF1CA',
  },
  {
    french: 'La cerise',
    english: 'Cherry',
    emoji: '🍒',
    sentence: 'La cerise est rouge.',
    translation: 'The cherry is red.',
    color: '#FFE0E8',
  },
  {
    french: 'La pêche',
    english: 'Peach',
    emoji: '🍑',
    sentence: 'La pêche est sucrée.',
    translation: 'The peach is sweet.',
    color: '#FFE5D9',
  },
];

const OPENING_DELAY_MS = 1500;

export default function FrenchFruitsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const voiceRef = useRef<string | undefined>(undefined);
  const soundOnRef = useRef(true);
  const speechGeneration = useRef(0);

  const current = FRUITS[index];

  const stopSpeech = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (phrase: string) => {
    if (!soundOnRef.current) return;

    const generation = ++speechGeneration.current;
    try {
      await Speech.stop();
      if (generation !== speechGeneration.current || !soundOnRef.current) {
        return;
      }
      Speech.speak(phrase, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.82,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French Fruits narration:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function findFrenchVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const french = voices.filter((voice) =>
          voice.language.toLowerCase().startsWith('fr-fr')
        );
        const anyFrench = voices.filter((voice) =>
          voice.language.toLowerCase().startsWith('fr')
        );
        const chosen =
          french.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
          french[0] ??
          anyFrench[0];
        if (active) voiceRef.current = chosen?.identifier;
      } catch (error) {
        console.warn('French voice selection:', error);
      }
    }
    void findFrenchVoice();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (complete) return;
    setReady(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setReady(true);
      void speak(`${current.french}. ${current.sentence}`);
    }, OPENING_DELAY_MS);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [index, complete, current.french, current.sentence, speak, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeech();
    else if (ready && !complete) void speak(`${current.french}. ${current.sentence}`);
  }

  function exitLesson() {
    stopSpeech();
    if (router.canGoBack()) router.back();
    else
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'french', activity: 'lessons' },
      });
  }

  function nextFruit() {
    if (!ready) return;
    stopSpeech();
    if (index === FRUITS.length - 1) {
      setComplete(true);
    } else {
      setIndex((old) => old + 1);
    }
  }

  function previousFruit() {
    stopSpeech();
    if (complete) {
      setComplete(false);
      return;
    }
    if (index > 0) setIndex((old) => old - 1);
    else exitLesson();
  }

  function replayLesson() {
    stopSpeech();
    setIndex(0);
    setReady(false);
    setComplete(false);
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
            onPress={exitLesson}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={soundOn ? 'Turn sound off' : 'Turn sound on'}
            onPress={toggleSound}
            style={[styles.soundButton, !soundOn && styles.soundOff]}
          >
            <Text style={styles.soundText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </Pressable>
        </View>

        {complete ? (
          <>
            <View style={styles.completeCard}>
              <Text style={styles.completeEmoji}>🏆 🍓 🇫🇷</Text>
              <Text style={styles.completeTitle}>Bravo !</Text>
              <Text style={styles.completeDescription}>
                Tu connais dix fruits en français !
              </Text>
              <Text style={styles.englishText}>
                Great job! You learned 10 fruits in French.
              </Text>
              <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
            </View>
            <Pressable onPress={replayLesson} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>🔄 Recommencer</Text>
            </Pressable>
            <Pressable onPress={exitLesson} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Terminer ✓</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🇫🇷 🍎 🍇</Text>
              <Text style={styles.headerTitle}>Les Fruits</Text>
              <Text style={styles.headerSubtitle}>
                Learn the names of delicious fruits in French!
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressText}>
                Fruit {index + 1} sur {FRUITS.length}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((index + 1) / FRUITS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.fruitCard, { backgroundColor: current.color }]}>
              <Text style={styles.cardHeading}>
                {ready ? 'Écoute et répète !' : 'Prépare-toi...'}
              </Text>
              <View style={styles.emojiCircle}>
                <Text style={styles.fruitEmoji}>{current.emoji}</Text>
              </View>
              <Text style={styles.frenchName}>{current.french}</Text>
              <Text style={styles.englishText}>{current.english}</Text>
              <View style={styles.sentenceBox}>
                <Text style={styles.sentence}>{current.sentence}</Text>
                <Text style={styles.translation}>{current.translation}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => void speak(`${current.french}. ${current.sentence}`)}
                disabled={!ready || !soundOn}
                style={[
                  styles.listenButton,
                  (!ready || !soundOn) && styles.disabledButton,
                ]}
              >
                <Text style={styles.listenText}>🔊 Écouter encore</Text>
              </Pressable>
            </View>

            <View style={styles.navigationRow}>
              <Pressable
                accessibilityRole="button"
                onPress={previousFruit}
                style={styles.previousButton}
              >
                <Text style={styles.previousText}>← Précédent</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!ready}
                onPress={nextFruit}
                style={[styles.nextButton, !ready && styles.disabledButton]}
              >
                <Text style={styles.nextText}>
                  {index === FRUITS.length - 1 ? 'Terminer ✓' : 'Suivant →'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                🌟 Listen carefully, then say the fruit's French name aloud!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 48 },
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
  backText: { fontSize: 15, fontWeight: '800', color: C.primary },
  soundButton: {
    backgroundColor: '#DDF7E5',
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 17,
  },
  soundOff: { backgroundColor: '#F0EAF5' },
  soundText: { color: C.text, fontWeight: '800', fontSize: 14 },
  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 18,
  },
  headerEmoji: { fontSize: 40, marginBottom: 9 },
  headerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
  },
  progressCard: {
    backgroundColor: '#FFF0C7',
    padding: 17,
    borderRadius: 20,
    marginBottom: 18,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 11,
  },
  progressTrack: {
    height: 12,
    backgroundColor: C.white,
    borderRadius: 9,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#42A66B', borderRadius: 9 },
  fruitCard: {
    borderRadius: 28,
    padding: 23,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeading: {
    color: C.text,
    fontWeight: '800',
    fontSize: 19,
    marginBottom: 18,
  },
  emojiCircle: {
    width: 165,
    height: 165,
    borderRadius: 83,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  fruitEmoji: { fontSize: 91 },
  frenchName: {
    color: C.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  englishText: {
    color: C.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  sentenceBox: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  sentence: {
    color: C.text,
    fontWeight: '800',
    fontSize: 17,
    textAlign: 'center',
  },
  translation: {
    color: C.textSecondary,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 21,
  },
  listenButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 23,
    paddingVertical: 14,
    marginTop: 19,
    borderRadius: 18,
  },
  listenText: { color: C.white, fontSize: 16, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 19,
  },
  previousButton: {
    flex: 1,
    backgroundColor: C.blue,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  previousText: { color: C.primary, fontWeight: '800', fontSize: 15 },
  nextButton: {
    flex: 1,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  nextText: { color: C.white, fontWeight: '800', fontSize: 15 },
  tipCard: { backgroundColor: '#E9E1FF', padding: 17, borderRadius: 19 },
  tipText: { color: C.text, textAlign: 'center', fontSize: 14, lineHeight: 22 },
  completeCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  completeEmoji: { fontSize: 48, marginBottom: 15 },
  completeTitle: { color: C.text, fontWeight: '800', fontSize: 32 },
  completeDescription: {
    color: C.text,
    fontWeight: '800',
    fontSize: 19,
    textAlign: 'center',
    marginTop: 12,
  },
  stars: { fontSize: 34, marginTop: 20 },
  primaryButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 17,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: { color: C.white, fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    backgroundColor: C.blue,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: { color: C.primary, fontWeight: '800', fontSize: 16 },
});
