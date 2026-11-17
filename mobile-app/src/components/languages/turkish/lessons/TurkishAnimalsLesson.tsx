import React, { useCallback, useEffect, useState } from 'react';
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
  turkish: string;
  english: string;
  emoji: string;
  sentence: string;
  translation: string;
};

const ANIMALS: Animal[] = [
  { turkish: 'Kedi', english: 'Cat', emoji: '🐱', sentence: 'Bu bir kedi.', translation: 'This is a cat.' },
  { turkish: 'Köpek', english: 'Dog', emoji: '🐶', sentence: 'Bu bir köpek.', translation: 'This is a dog.' },
  { turkish: 'İnek', english: 'Cow', emoji: '🐮', sentence: 'Bu bir inek.', translation: 'This is a cow.' },
  { turkish: 'At', english: 'Horse', emoji: '🐴', sentence: 'Bu bir at.', translation: 'This is a horse.' },
  { turkish: 'Kuş', english: 'Bird', emoji: '🐦', sentence: 'Bu bir kuş.', translation: 'This is a bird.' },
  { turkish: 'Balık', english: 'Fish', emoji: '🐟', sentence: 'Bu bir balık.', translation: 'This is a fish.' },
  { turkish: 'Aslan', english: 'Lion', emoji: '🦁', sentence: 'Bu bir aslan.', translation: 'This is a lion.' },
  { turkish: 'Fil', english: 'Elephant', emoji: '🐘', sentence: 'Bu bir fil.', translation: 'This is an elephant.' },
  { turkish: 'Tavşan', english: 'Rabbit', emoji: '🐰', sentence: 'Bu bir tavşan.', translation: 'This is a rabbit.' },
  { turkish: 'Ördek', english: 'Duck', emoji: '🦆', sentence: 'Bu bir ördek.', translation: 'This is a duck.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function TurkishAnimalsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);

  const animal = ANIMALS[index];
  const narration = `${animal.turkish}. ${animal.sentence}`;

  // Speak automatically on the first card and whenever the animal changes.
  // Stop old speech so rapidly tapping Next cannot overlap narration.
  useEffect(() => {
    if (finished || !soundOn) {
      void Speech.stop();
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void Speech.stop().then(() => {
        if (!cancelled) {
          Speech.speak(narration, {
            language: 'tr-TR',
            rate: 0.78,
            pitch: 1,
          });
        }
      });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      void Speech.stop();
    };
  }, [index, soundOn, finished, narration]);

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      void Speech.stop().then(() => {
        Speech.speak('Harika! Bütün hayvanları öğrendin!', {
          language: 'tr-TR',
          rate: 0.8,
        });
      });
    }, 450);
    return () => {
      clearTimeout(timer);
      void Speech.stop();
    };
  }, [finished, soundOn]);

  const hearAgain = useCallback(() => {
    if (!soundOn || finished) return;
    void Speech.stop().then(() => {
      Speech.speak(narration, { language: 'tr-TR', rate: 0.78, pitch: 1 });
    });
  }, [soundOn, finished, narration]);

  const goBack = () => {
    void Speech.stop();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'turkish', activity: 'lessons' },
      });
    }
  };

  const next = () => {
    void Speech.stop();
    if (index === ANIMALS.length - 1) {
      setFinished(true);
    } else {
      setIndex((current) => current + 1);
    }
  };

  const previous = () => {
    if (index === 0) return;
    void Speech.stop();
    setIndex((current) => Math.max(0, current - 1));
  };

  const replay = () => {
    void Speech.stop();
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
              void Speech.stop();
              setSoundOn((current) => !current);
            }}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>TÜRKÇE • TURKISH</Text>
        <Text style={styles.heading}>Hayvanlar 🐾</Text>
        <Text style={styles.subtitle}>Learn animal names in Turkish!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🐾</Text>
            <Text style={styles.word}>Harika!</Text>
            <Text style={styles.english}>
              Amazing! You learned {ANIMALS.length} animals in Turkish.
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
              <Text style={styles.word}>{animal.turkish}</Text>
              <Text style={styles.english}>{animal.english}</Text>

              <View style={styles.sentenceBox}>
                <Text style={styles.sentence}>{animal.sentence}</Text>
                <Text style={styles.translation}>{animal.translation}</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={!soundOn}
                onPress={hearAgain}
                style={[styles.listenButton, !soundOn && styles.disabled]}
              >
                <Text style={styles.listenText}>🔊 Hear Turkish</Text>
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
