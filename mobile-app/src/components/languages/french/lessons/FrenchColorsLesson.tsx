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

type ColorItem = {
  french: string;
  english: string;
  hex: string;
  emoji: string;
  example: string;
  exampleEnglish: string;
};

const COLORS: ColorItem[] = [
  { french: 'Rouge', english: 'Red', hex: '#F34D56', emoji: '🍎', example: 'Une pomme rouge.', exampleEnglish: 'A red apple.' },
  { french: 'Bleu', english: 'Blue', hex: '#438FEA', emoji: '☁️', example: 'Le ciel est bleu.', exampleEnglish: 'The sky is blue.' },
  { french: 'Jaune', english: 'Yellow', hex: '#FFD748', emoji: '☀️', example: 'Un soleil jaune.', exampleEnglish: 'A yellow sun.' },
  { french: 'Vert', english: 'Green', hex: '#4EBE76', emoji: '🌳', example: 'Un arbre vert.', exampleEnglish: 'A green tree.' },
  { french: 'Orange', english: 'Orange', hex: '#FF9D44', emoji: '🥕', example: 'Une carotte orange.', exampleEnglish: 'An orange carrot.' },
  { french: 'Rose', english: 'Pink', hex: '#FF86B8', emoji: '🌸', example: 'Une fleur rose.', exampleEnglish: 'A pink flower.' },
  { french: 'Violet', english: 'Purple', hex: '#A27BE8', emoji: '🍇', example: 'Un raisin violet.', exampleEnglish: 'A purple grape.' },
  { french: 'Noir', english: 'Black', hex: '#30343D', emoji: '🐈‍⬛', example: 'Un chat noir.', exampleEnglish: 'A black cat.' },
  { french: 'Blanc', english: 'White', hex: '#FFFFFF', emoji: '☁️', example: 'Un nuage blanc.', exampleEnglish: 'A white cloud.' },
  { french: 'Marron', english: 'Brown', hex: '#98613E', emoji: '🐻', example: 'Un ours marron.', exampleEnglish: 'A brown bear.' },
];

const OPENING_DELAY_MS = 1600;

export default function FrenchColorsLesson() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [completed, setCompleted] = useState(false);

  const soundOnRef = useRef(true);
  const voiceRef = useRef<string | undefined>(undefined);
  const speechGeneration = useRef(0);
  const current = COLORS[index];

  const stopSpeech = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!soundOnRef.current) return;
    const generation = ++speechGeneration.current;

    try {
      await Speech.stop();
      if (generation !== speechGeneration.current || !soundOnRef.current) {
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
      console.warn('French Colors narration error:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function findFrenchVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const frFrance = voices.filter((v) =>
          v.language.toLowerCase().startsWith('fr-fr')
        );
        const french = voices.filter((v) =>
          v.language.toLowerCase().startsWith('fr')
        );
        const best =
          frFrance.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ??
          frFrance[0] ??
          french.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ??
          french[0];
        if (active) voiceRef.current = best?.identifier;
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
    if (completed) return;

    setReady(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setReady(true);
      void speak(`${current.french}. ${current.example}`);
    }, OPENING_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [index, completed, current.french, current.example, speak, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeech();
    else if (ready && !completed) {
      void speak(`${current.french}. ${current.example}`);
    }
  }

  function goBack() {
    stopSpeech();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'french', activity: 'lessons' },
      });
    }
  }

  function nextColor() {
    if (!ready) return;
    stopSpeech();
    if (index < COLORS.length - 1) {
      setIndex((previous) => previous + 1);
    } else {
      setCompleted(true);
    }
  }

  function previousColor() {
    stopSpeech();
    if (completed) {
      setCompleted(false);
    } else if (index > 0) {
      setIndex((previous) => previous - 1);
    } else {
      goBack();
    }
  }

  function restartLesson() {
    stopSpeech();
    setReady(false);
    setIndex(0);
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
            style={[styles.soundButton, !soundOn && styles.mutedButton]}
          >
            <Text style={styles.soundText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </Pressable>
        </View>

        {completed ? (
          <>
            <View style={styles.celebration}>
              <Text style={styles.celebrationEmoji}>🏆 🎨 🇫🇷</Text>
              <Text style={styles.celebrationTitle}>Bravo !</Text>
              <Text style={styles.celebrationMessage}>
                Tu connais les couleurs !
              </Text>
              <Text style={styles.translation}>
                Great job! You explored all 10 French colors.
              </Text>
              <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
            </View>
            <Pressable onPress={restartLesson} style={styles.primaryButton}>
              <Text style={styles.primaryText}>🔄 Recommencer</Text>
            </Pressable>
            <Pressable onPress={goBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Terminer ✓</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🎨 🇫🇷 🌈</Text>
              <Text style={styles.headerTitle}>Les Couleurs</Text>
              <Text style={styles.headerSubtitle}>
                Discover colors in French!
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressText}>
                Couleur {index + 1} sur {COLORS.length}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((index + 1) / COLORS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.lessonCard}>
              <Text style={styles.prompt}>
                {ready ? 'Écoute et répète !' : 'Prépare-toi...'}
              </Text>
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: current.hex },
                  current.french === 'Blanc' && styles.whiteCircle,
                ]}
              >
                <Text style={styles.colorEmoji}>{current.emoji}</Text>
              </View>
              <Text style={styles.frenchWord}>{current.french}</Text>
              <Text style={styles.translation}>{current.english}</Text>
              <View style={styles.exampleCard}>
                <Text style={styles.exampleFrench}>{current.example}</Text>
                <Text style={styles.exampleEnglish}>
                  {current.exampleEnglish}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!ready || !soundOn}
                onPress={() => void speak(`${current.french}. ${current.example}`)}
                style={[
                  styles.listenButton,
                  (!ready || !soundOn) && styles.disabledButton,
                ]}
              >
                <Text style={styles.listenText}>🔊 Écouter encore</Text>
              </Pressable>
            </View>

            <View style={styles.navigationRow}>
              <Pressable onPress={previousColor} style={styles.previousButton}>
                <Text style={styles.previousText}>← Précédent</Text>
              </Pressable>
              <Pressable
                onPress={nextColor}
                disabled={!ready}
                style={[styles.nextButton, !ready && styles.disabledButton]}
              >
                <Text style={styles.nextText}>
                  {index === COLORS.length - 1 ? 'Terminer ✓' : 'Suivant →'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                🌟 Look around! Can you find something in this color?
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
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 50 },
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
  backText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  soundButton: {
    backgroundColor: '#DDF7E5',
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 17,
  },
  mutedButton: { backgroundColor: '#F0EAF5' },
  soundText: { color: C.text, fontSize: 14, fontWeight: '800' },
  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 17,
  },
  headerEmoji: { fontSize: 38, marginBottom: 9 },
  headerTitle: {
    color: C.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: C.textSecondary,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 19,
    padding: 17,
    marginBottom: 18,
  },
  progressText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '800',
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
    backgroundColor: '#43A866',
    height: '100%',
    borderRadius: 8,
  },
  lessonCard: {
    backgroundColor: '#FFE5EF',
    padding: 25,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 19,
  },
  prompt: {
    color: C.text,
    fontWeight: '800',
    fontSize: 19,
    marginBottom: 20,
  },
  colorCircle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  whiteCircle: { borderColor: '#C7C7D6' },
  colorEmoji: { fontSize: 69 },
  frenchWord: {
    color: C.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 5,
  },
  translation: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  exampleCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    alignItems: 'center',
    width: '100%',
    padding: 17,
    marginTop: 20,
  },
  exampleFrench: {
    fontSize: 18,
    color: C.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  exampleEnglish: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 17,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 20,
  },
  listenText: { color: C.white, fontSize: 16, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  previousButton: {
    flex: 1,
    backgroundColor: C.blue,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
  },
  previousText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  nextButton: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
  },
  nextText: { color: C.white, fontSize: 15, fontWeight: '800' },
  tipCard: { backgroundColor: '#E9E1FF', borderRadius: 19, padding: 17 },
  tipText: {
    color: C.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  celebration: {
    backgroundColor: '#FFF0C7',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
  },
  celebrationEmoji: { fontSize: 45, marginBottom: 15 },
  celebrationTitle: {
    color: C.text,
    fontWeight: '800',
    fontSize: 32,
    marginBottom: 12,
  },
  celebrationMessage: {
    color: C.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  stars: { fontSize: 34, marginTop: 20 },
  primaryButton: {
    backgroundColor: C.primary,
    padding: 17,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryText: { color: C.white, fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    backgroundColor: C.blue,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  secondaryText: { color: C.primary, fontWeight: '800', fontSize: 16 },
});
