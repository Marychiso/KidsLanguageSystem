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

type ShapeItem = {
  french: string;
  english: string;
  exampleFrench: string;
  exampleEnglish: string;
  symbol: string;
  background: string;
};

const SHAPES: ShapeItem[] = [
  {
    french: 'Le cercle', english: 'Circle',
    exampleFrench: 'Le soleil est rond.',
    exampleEnglish: 'The sun is round.',
    symbol: '●', background: '#FFE6A7',
  },
  {
    french: 'Le carré', english: 'Square',
    exampleFrench: 'Cette fenêtre est carrée.',
    exampleEnglish: 'This window is square.',
    symbol: '■', background: '#DCEAFF',
  },
  {
    french: 'Le triangle', english: 'Triangle',
    exampleFrench: 'Ce panneau est un triangle.',
    exampleEnglish: 'This sign is a triangle.',
    symbol: '▲', background: '#FFE0E5',
  },
  {
    french: 'Le rectangle', english: 'Rectangle',
    exampleFrench: 'La porte est rectangulaire.',
    exampleEnglish: 'The door is rectangular.',
    symbol: '▰', background: '#E4F3E4',
  },
  {
    french: "L'étoile", english: 'Star',
    exampleFrench: "Voici une étoile brillante.",
    exampleEnglish: 'Here is a bright star.',
    symbol: '★', background: '#FFF0BE',
  },
  {
    french: 'Le cœur', english: 'Heart',
    exampleFrench: 'Ce cœur est rouge.',
    exampleEnglish: 'This heart is red.',
    symbol: '♥', background: '#FFE0EC',
  },
  {
    french: "L'ovale", english: 'Oval',
    exampleFrench: "Cet œuf a une forme ovale.",
    exampleEnglish: 'This egg has an oval shape.',
    symbol: '⬭', background: '#EBE4FF',
  },
  {
    french: 'Le losange', english: 'Diamond / Rhombus',
    exampleFrench: 'Ce cerf-volant a la forme d’un losange.',
    exampleEnglish: 'This kite is shaped like a diamond.',
    symbol: '◆', background: '#E0F7F4',
  },
  {
    french: 'Le croissant', english: 'Crescent',
    exampleFrench: 'La lune ressemble à un croissant.',
    exampleEnglish: 'The moon looks like a crescent.',
    symbol: '☾', background: '#E0E7FF',
  },
  {
    french: 'Le demi-cercle', english: 'Semicircle',
    exampleFrench: 'Voici un demi-cercle.',
    exampleEnglish: 'Here is a semicircle.',
    symbol: '◠', background: '#F9E3CE',
  },
];

const OPENING_DELAY_MS = 1600;

export default function FrenchShapesLesson() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  const speechGeneration = useRef(0);
  const voiceRef = useRef<string | undefined>(undefined);

  const current = SHAPES[index];

  const stopSpeech = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!soundOnRef.current) return;
    const generation = ++speechGeneration.current;
    try {
      await Speech.stop();
      if (generation !== speechGeneration.current || !soundOnRef.current) return;
      Speech.speak(text, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.82,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French Shapes speech error:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function selectVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const french = voices.filter(v => v.language.toLowerCase().startsWith('fr-fr'));
        const anyFrench = voices.filter(v => v.language.toLowerCase().startsWith('fr'));
        const best =
          french.find(v => v.quality === Speech.VoiceQuality.Enhanced) ??
          french[0] ??
          anyFrench.find(v => v.quality === Speech.VoiceQuality.Enhanced) ??
          anyFrench[0];
        if (active) voiceRef.current = best?.identifier;
      } catch (error) {
        console.warn('French Shapes voice selection:', error);
      }
    }
    void selectVoice();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (completed) return;
    setReady(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setReady(true);
      void speak(`${current.french}. ${current.exampleFrench}`);
    }, OPENING_DELAY_MS);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [index, completed, current.french, current.exampleFrench, speak, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeech();
    else if (ready && !completed) {
      void speak(`${current.french}. ${current.exampleFrench}`);
    }
  }

  function exitLesson() {
    stopSpeech();
    if (router.canGoBack()) router.back();
    else router.replace({
      pathname: '/mary/categories',
      params: { language: 'french', activity: 'lessons' },
    });
  }

  function nextShape() {
    if (!ready) return;
    stopSpeech();
    if (index === SHAPES.length - 1) setCompleted(true);
    else setIndex(previous => previous + 1);
  }

  function previousShape() {
    stopSpeech();
    if (index > 0) setIndex(previous => previous - 1);
    else exitLesson();
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={exitLesson} style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={toggleSound} style={styles.soundButton}>
            <Text style={styles.soundText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
          </Pressable>
        </View>

        {completed ? (
          <>
            <View style={styles.completedCard}>
              <Text style={styles.completedEmoji}>🏆 🇫🇷 🎉</Text>
              <Text style={styles.completedTitle}>Bravo !</Text>
              <Text style={styles.completedDescription}>
                Tu as appris les dix formes !
              </Text>
              <Text style={styles.englishMeaning}>
                Great job! You learned ten shapes in French.
              </Text>
              <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
            </View>
            <Pressable onPress={replay} style={styles.mainButton} accessibilityRole="button">
              <Text style={styles.mainButtonText}>🔄 Recommencer</Text>
            </Pressable>
            <Pressable onPress={exitLesson} style={styles.secondaryButton} accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Terminer ✓</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🇫🇷 🔺 🟡 🟦</Text>
              <Text style={styles.title}>Les Formes</Text>
              <Text style={styles.subtitle}>Let's learn shapes in French!</Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressText}>Forme {index + 1} sur {SHAPES.length}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((index + 1) / SHAPES.length) * 100}%` }]} />
              </View>
            </View>
            <View style={styles.lessonCard}>
              <Text style={styles.readyText}>{ready ? 'Écoute et répète !' : 'Prépare-toi...'}</Text>
              <View style={[styles.symbolBox, { backgroundColor: current.background }]}>
                <Text style={styles.symbol}>{current.symbol}</Text>
              </View>
              <Text style={styles.frenchName}>{current.french}</Text>
              <Text style={styles.englishMeaning}>{current.english}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleFrench}>{current.exampleFrench}</Text>
                <Text style={styles.exampleEnglish}>{current.exampleEnglish}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!ready || !soundOn}
                onPress={() => void speak(`${current.french}. ${current.exampleFrench}`)}
                style={[styles.listenButton, (!ready || !soundOn) && styles.disabled]}
              >
                <Text style={styles.listenText}>🔊 Écouter encore</Text>
              </Pressable>
            </View>
            <View style={styles.navigationRow}>
              <Pressable accessibilityRole="button" onPress={previousShape} style={styles.previousButton}>
                <Text style={styles.previousText}>← Précédent</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={nextShape} disabled={!ready} style={[styles.nextButton, !ready && styles.disabled]}>
                <Text style={styles.nextText}>{index === SHAPES.length - 1 ? 'Terminer ✓' : 'Suivant →'}</Text>
              </Pressable>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>🌟 Listen to each French shape name, then try saying it aloud!</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 18 },
  backButton: { backgroundColor: C.blue, borderRadius: 17, paddingHorizontal: 16, paddingVertical: 13 },
  backText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  soundButton: { backgroundColor: '#DDF7E5', borderRadius: 17, paddingHorizontal: 15, paddingVertical: 13 },
  soundText: { color: C.text, fontSize: 14, fontWeight: '800' },
  header: { backgroundColor: '#DDEBFF', padding: 23, borderRadius: 28, alignItems: 'center', marginBottom: 17 },
  headerEmoji: { fontSize: 35, marginBottom: 10, textAlign: 'center' },
  title: { color: C.text, fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: C.textSecondary, fontSize: 15, marginTop: 9, textAlign: 'center' },
  progressCard: { backgroundColor: '#FFF0C7', borderRadius: 20, padding: 17, marginBottom: 18 },
  progressText: { textAlign: 'center', fontWeight: '800', fontSize: 16, color: C.text, marginBottom: 11 },
  progressTrack: { height: 12, backgroundColor: C.white, overflow: 'hidden', borderRadius: 8 },
  progressFill: { backgroundColor: '#43A866', height: '100%', borderRadius: 8 },
  lessonCard: { backgroundColor: '#FFE5EF', padding: 22, borderRadius: 27, alignItems: 'center', marginBottom: 19 },
  readyText: { fontWeight: '800', color: C.text, fontSize: 19, marginBottom: 15 },
  symbolBox: { width: 190, height: 175, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  symbol: { fontSize: 106, color: C.primary, textAlign: 'center', includeFontPadding: false },
  frenchName: { fontSize: 30, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 5 },
  englishMeaning: { fontSize: 16, color: C.textSecondary, textAlign: 'center', lineHeight: 23 },
  exampleBox: { width: '100%', marginTop: 20, borderRadius: 18, backgroundColor: C.white, padding: 16, alignItems: 'center' },
  exampleFrench: { fontSize: 17, fontWeight: '800', color: C.text, textAlign: 'center', lineHeight: 25 },
  exampleEnglish: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 21 },
  listenButton: { backgroundColor: C.primary, paddingHorizontal: 22, paddingVertical: 15, borderRadius: 18, marginTop: 20 },
  listenText: { color: C.white, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  navigationRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  previousButton: { flex: 1, backgroundColor: C.blue, paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  previousText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  nextButton: { flex: 1, backgroundColor: C.primary, paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  nextText: { color: C.white, fontSize: 15, fontWeight: '800' },
  tipCard: { backgroundColor: '#E9E1FF', borderRadius: 19, padding: 17 },
  tipText: { textAlign: 'center', color: C.text, fontSize: 14, lineHeight: 21 },
  completedCard: { backgroundColor: '#FFF0C7', padding: 27, borderRadius: 27, alignItems: 'center', marginTop: 33, marginBottom: 20 },
  completedEmoji: { fontSize: 48, marginBottom: 16 },
  completedTitle: { fontSize: 31, fontWeight: '800', color: C.text, marginBottom: 12 },
  completedDescription: { fontSize: 19, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 12 },
  stars: { fontSize: 35, marginTop: 21 },
  mainButton: { backgroundColor: C.primary, padding: 17, borderRadius: 18, alignItems: 'center', marginBottom: 15 },
  mainButtonText: { color: C.white, fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: C.blue, padding: 16, borderRadius: 18, alignItems: 'center' },
  secondaryButtonText: { color: C.primary, fontSize: 16, fontWeight: '800' },
});
