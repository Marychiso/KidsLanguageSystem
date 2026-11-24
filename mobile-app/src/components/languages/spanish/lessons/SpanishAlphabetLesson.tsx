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

// The modern Spanish alphabet contains 27 letters, including Ñ.
// CH and LL are combinations of letters, not separate alphabet letters.
const LETTERS = [
  { letter: 'A', name: 'a', word: 'Árbol', english: 'Tree', emoji: '🌳' },
  { letter: 'B', name: 'be', word: 'Barco', english: 'Boat', emoji: '⛵' },
  { letter: 'C', name: 'ce', word: 'Casa', english: 'House', emoji: '🏠' },
  { letter: 'D', name: 'de', word: 'Delfín', english: 'Dolphin', emoji: '🐬' },
  { letter: 'E', name: 'e', word: 'Elefante', english: 'Elephant', emoji: '🐘' },
  { letter: 'F', name: 'efe', word: 'Flor', english: 'Flower', emoji: '🌸' },
  { letter: 'G', name: 'ge', word: 'Gato', english: 'Cat', emoji: '🐱' },
  { letter: 'H', name: 'hache', word: 'Helado', english: 'Ice cream', emoji: '🍦' },
  { letter: 'I', name: 'i', word: 'Isla', english: 'Island', emoji: '🏝️' },
  { letter: 'J', name: 'jota', word: 'Jirafa', english: 'Giraffe', emoji: '🦒' },
  { letter: 'K', name: 'ka', word: 'Koala', english: 'Koala', emoji: '🐨' },
  { letter: 'L', name: 'ele', word: 'Luna', english: 'Moon', emoji: '🌙' },
  { letter: 'M', name: 'eme', word: 'Manzana', english: 'Apple', emoji: '🍎' },
  { letter: 'N', name: 'ene', word: 'Nube', english: 'Cloud', emoji: '☁️' },
  { letter: 'Ñ', name: 'eñe', word: 'Ñandú', english: 'Rhea (bird)', emoji: '🐦' },
  { letter: 'O', name: 'o', word: 'Oso', english: 'Bear', emoji: '🐻' },
  { letter: 'P', name: 'pe', word: 'Pato', english: 'Duck', emoji: '🦆' },
  { letter: 'Q', name: 'cu', word: 'Queso', english: 'Cheese', emoji: '🧀' },
  { letter: 'R', name: 'erre', word: 'Ratón', english: 'Mouse', emoji: '🐭' },
  { letter: 'S', name: 'ese', word: 'Sol', english: 'Sun', emoji: '☀️' },
  { letter: 'T', name: 'te', word: 'Tortuga', english: 'Turtle', emoji: '🐢' },
  { letter: 'U', name: 'u', word: 'Uvas', english: 'Grapes', emoji: '🍇' },
  { letter: 'V', name: 'uve', word: 'Vaca', english: 'Cow', emoji: '🐄' },
  { letter: 'W', name: 'uve doble', word: 'Wifi', english: 'Wi-Fi', emoji: '📶' },
  { letter: 'X', name: 'equis', word: 'Xilófono', english: 'Xylophone', emoji: '🎶' },
  { letter: 'Y', name: 'ye', word: 'Yogur', english: 'Yogurt', emoji: '🥣' },
  { letter: 'Z', name: 'zeta', word: 'Zapato', english: 'Shoe', emoji: '👟' },
] as const;

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function SpanishAlphabetLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);
  const current = LETTERS[index];

  // Track the active narration so old callbacks cannot speak after
  // a child changes letters, mutes the lesson, or leaves the screen.
  const narrationId = useRef(0);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopNarration = () => {
    narrationId.current += 1;
    if (pauseTimer.current !== null) {
      clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }
    void Speech.stop();
  };

  // Speak the letter's Spanish NAME first. Once the voice finishes,
  // wait 850 ms, then say the example word as a separate utterance.
  const speakLetterAndWord = () => {
    stopNarration();
    if (!soundOn || finished) return;

    const id = narrationId.current;
    Speech.speak(current.name, {
      language: 'es-ES',
      rate: 0.72,
      pitch: 1,
      onDone: () => {
        if (id !== narrationId.current) return;
        pauseTimer.current = setTimeout(() => {
          pauseTimer.current = null;
          if (id !== narrationId.current) return;
          Speech.speak(current.word, {
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
    const timer = setTimeout(() => speakLetterAndWord(), 350);
    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [index, soundOn, finished]);

  const speakCurrent = () => speakLetterAndWord();

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      Speech.speak('¡Muy bien! ¡Has aprendido las veintisiete letras del alfabeto español!', {
        language: 'es-ES',
        rate: 0.8,
      });
    }, 400);
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
    if (index === LETTERS.length - 1) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const previous = () => {
    stopNarration();
    setIndex((prev) => Math.max(0, prev - 1));
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
              setSoundOn((value) => !value);
            }}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>ESPAÑOL • SPANISH</Text>
        <Text style={styles.heading}>Alfabeto Español 🇪🇸</Text>
        <Text style={styles.subtitle}>Learn the 27 letters of the Spanish alphabet!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>¡Muy bien!</Text>
            <Text style={styles.english}>Amazing! You learned all 27 Spanish letters.</Text>
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
              <Text style={styles.progressText}>Letter {index + 1} of {LETTERS.length}</Text>
              <Text style={styles.progressText}>{Math.round(((index + 1) / LETTERS.length) * 100)}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((index + 1) / LETTERS.length) * 100}%` }]} />
            </View>

            <View style={styles.card}>
              <View style={styles.letterCircle}>
                <Text style={styles.bigLetter}>{current.letter}</Text>
              </View>
              <Text style={styles.emoji}>{current.emoji}</Text>
              <Text style={styles.word}>{current.word}</Text>
              <Text style={styles.english}>{current.english}</Text>
              {current.letter === 'Ñ' && (
                <Text style={styles.note}>Ñ is called “eñe” and is a separate letter in Spanish.</Text>
              )}
              {current.letter === 'H' && (
                <Text style={styles.note}>H is normally silent at the beginning of Spanish words like “helado.”</Text>
              )}
              <TouchableOpacity accessibilityRole="button" onPress={speakCurrent} style={styles.listenButton}>
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
              <TouchableOpacity accessibilityRole="button" style={[styles.primaryButton, styles.navButton]} onPress={next}>
                <Text style={styles.primaryText}>{index === LETTERS.length - 1 ? 'Finish 🎉' : 'Next →'}</Text>
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
  letterCircle: {
    height: 126, width: 126, borderRadius: 63, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E9DDFF',
  },
  bigLetter: { fontSize: 82, fontWeight: '900', color: PURPLE, lineHeight: 106 },
  emoji: { fontSize: 74, marginTop: 18, marginBottom: 4 },
  celebration: { fontSize: 65, marginVertical: 30 },
  word: { fontSize: 32, color: DARK, fontWeight: '900', textAlign: 'center' },
  english: { fontSize: 18, color: '#7C728E', textAlign: 'center', marginTop: 6 },
  note: { textAlign: 'center', color: '#655B76', fontSize: 14, marginTop: 12, lineHeight: 21 },
  listenButton: {
    backgroundColor: '#E8F4FF', paddingHorizontal: 25, paddingVertical: 15,
    borderRadius: 20, marginTop: 24,
  },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 17 },
  navigation: { flexDirection: 'row', gap: 12, marginTop: 24 },
  navButton: { flex: 1 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.4 },
});
