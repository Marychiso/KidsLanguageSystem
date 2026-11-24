import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';

type Animal = {
  spanish: string;
  english: string;
  emoji: string;
  sentence: string;
  translation: string;
};

const ANIMALS: Animal[] = [
  { spanish: 'Gato', english: 'Cat', emoji: '🐱', sentence: 'Este es un gato.', translation: 'This is a cat.' },
  { spanish: 'Perro', english: 'Dog', emoji: '🐶', sentence: 'Este es un perro.', translation: 'This is a dog.' },
  { spanish: 'Vaca', english: 'Cow', emoji: '🐮', sentence: 'Esta es una vaca.', translation: 'This is a cow.' },
  { spanish: 'Caballo', english: 'Horse', emoji: '🐴', sentence: 'Este es un caballo.', translation: 'This is a horse.' },
  { spanish: 'Pájaro', english: 'Bird', emoji: '🐦', sentence: 'Este es un pájaro.', translation: 'This is a bird.' },
  { spanish: 'Pez', english: 'Fish', emoji: '🐟', sentence: 'Este es un pez.', translation: 'This is a fish.' },
  { spanish: 'León', english: 'Lion', emoji: '🦁', sentence: 'Este es un león.', translation: 'This is a lion.' },
  { spanish: 'Elefante', english: 'Elephant', emoji: '🐘', sentence: 'Este es un elefante.', translation: 'This is an elephant.' },
  { spanish: 'Conejo', english: 'Rabbit', emoji: '🐰', sentence: 'Este es un conejo.', translation: 'This is a rabbit.' },
  { spanish: 'Pato', english: 'Duck', emoji: '🦆', sentence: 'Este es un pato.', translation: 'This is a duck.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function SpanishAnimalsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);

  const animal = ANIMALS[index];
  const narrationId = useRef(0);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel callbacks as well as currently playing speech when cards change.
  const stopNarration = () => {
    narrationId.current += 1;
    if (pauseTimer.current !== null) {
      clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }
    void Speech.stop();
  };

  // Read the animal name, then pause clearly before the sample sentence.
  const speakAnimal = () => {
    stopNarration();
    if (!soundOn || finished) return;

    const id = narrationId.current;
    Speech.speak(animal.spanish, {
      language: 'es-ES',
      rate: 0.74,
      pitch: 1,
      onDone: () => {
        if (id !== narrationId.current) return;
        pauseTimer.current = setTimeout(() => {
          pauseTimer.current = null;
          if (id !== narrationId.current) return;
          Speech.speak(animal.sentence, {
            language: 'es-ES',
            rate: 0.76,
            pitch: 1,
          });
        }, 850);
      },
    });
  };

  useEffect(() => {
    if (finished || !soundOn) {
      stopNarration();
      return;
    }
    const timer = setTimeout(() => speakAnimal(), 350);
    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [index, soundOn, finished]);

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      void Speech.stop().then(() => {
        Speech.speak('¡Muy bien! ¡Has aprendido los animales en español!', {
          language: 'es-ES',
          rate: 0.8,
        });
      });
    }, 450);
    return () => {
      clearTimeout(timer);
      void Speech.stop();
    };
  }, [finished, soundOn]);

  const goBack = () => {
    stopNarration();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'spanish', activity: 'lessons' },
      });
    }
  };

  const next = () => {
    stopNarration();
    if (index === ANIMALS.length - 1) {
      setFinished(true);
    } else {
      setIndex((current) => current + 1);
    }
  };

  const previous = () => {
    if (index === 0) return;
    stopNarration();
    setIndex((current) => Math.max(0, current - 1));
  };

  const replay = () => {
    stopNarration();
    setIndex(0);
    setFinished(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity accessibilityRole="button" onPress={goBack} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              stopNarration();
              setSoundOn((current) => !current);
            }}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>ESPAÑOL • SPANISH</Text>
        <Text style={styles.heading}>Animales 🐾</Text>
        <Text style={styles.subtitle}>Learn animal names in Spanish!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🐾</Text>
            <Text style={styles.word}>¡Muy bien!</Text>
            <Text style={styles.english}>
              Amazing! You learned {ANIMALS.length} animals in Spanish.
            </Text>
            <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={replay}>
              <Text style={styles.primaryText}>🔁 Learn Again</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={goBack}>
              <Text style={styles.secondaryText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Animal {index + 1} of {ANIMALS.length}</Text>
              <Text style={styles.progressText}>
                {Math.round(((index + 1) / ANIMALS.length) * 100)}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${((index + 1) / ANIMALS.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.animalCircle}>
                <Text style={styles.emoji}>{animal.emoji}</Text>
              </View>
              <Text style={styles.word}>{animal.spanish}</Text>
              <Text style={styles.english}>{animal.english}</Text>

              <View style={styles.sentenceBox}>
                <Text style={styles.sentence}>{animal.sentence}</Text>
                <Text style={styles.translation}>{animal.translation}</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={!soundOn}
                onPress={speakAnimal}
                style={[styles.listenButton, !soundOn && styles.disabled]}
              >
                <Text style={styles.listenText}>🔊 Hear Spanish</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navigation}>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={index === 0}
                style={[styles.secondaryButton, styles.navButton, index === 0 && styles.disabled]}
                onPress={previous}
              >
                <Text style={styles.secondaryText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.primaryButton, styles.navButton]}
                onPress={next}
              >
                <Text style={styles.primaryText}>
                  {index === ANIMALS.length - 1 ? 'Finish 🎉' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  smallButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  smallButtonText: { color: PURPLE, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: PURPLE, fontWeight: '800', letterSpacing: 2, textAlign: 'center', fontSize: 12 },
  heading: { color: DARK, fontWeight: '900', textAlign: 'center', fontSize: 29, marginTop: 8 },
  subtitle: { color: '#766E8D', textAlign: 'center', fontSize: 15, marginTop: 8, marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  progressText: { color: '#6C6282', fontWeight: '700' },
  track: { backgroundColor: '#E1D8F7', height: 11, borderRadius: 12, overflow: 'hidden', marginBottom: 22 },
  fill: { backgroundColor: '#8C71D9', height: '100%', borderRadius: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 22,
    paddingVertical: 28, alignItems: 'center', shadowColor: '#9276CA',
    shadowOpacity: 0.11, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  animalCircle: {
    height: 170, width: 170, borderRadius: 85, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E9DDFF', marginBottom: 20,
  },
  emoji: { fontSize: 94 },
  celebration: { fontSize: 64, marginVertical: 30 },
  word: { fontSize: 34, color: DARK, fontWeight: '900', textAlign: 'center' },
  english: { fontSize: 18, color: '#7C728E', textAlign: 'center', marginTop: 6 },
  sentenceBox: {
    marginTop: 22, paddingHorizontal: 18, paddingVertical: 16,
    borderRadius: 20, backgroundColor: '#F6F1FF', width: '100%', alignItems: 'center',
  },
  sentence: { fontSize: 20, color: PURPLE, fontWeight: '800', textAlign: 'center' },
  translation: { fontSize: 15, color: '#766E8D', textAlign: 'center', marginTop: 6 },
  listenButton: {
    backgroundColor: '#E8F4FF', paddingHorizontal: 25, paddingVertical: 15,
    borderRadius: 20, marginTop: 24,
  },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 17 },
  navigation: { flexDirection: 'row', gap: 12, marginTop: 24 },
  navButton: { flex: 1 },
  primaryButton: {
    backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 20,
    borderRadius: 18, alignItems: 'center', marginTop: 14,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 20,
    borderRadius: 18, alignItems: 'center', marginTop: 14,
  },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.4 },
});
