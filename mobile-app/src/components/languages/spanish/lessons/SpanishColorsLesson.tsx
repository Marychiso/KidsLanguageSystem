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

type Color = {
  spanish: string;
  english: string;
  hex: string;
  sentence: string;
  translation: string;
};

const COLORS: Color[] = [
  { spanish: 'Rojo', english: 'Red', hex: '#E84C56', sentence: 'La manzana es roja.', translation: 'The apple is red.' },
  { spanish: 'Azul', english: 'Blue', hex: '#3988EB', sentence: 'El cielo es azul.', translation: 'The sky is blue.' },
  { spanish: 'Amarillo', english: 'Yellow', hex: '#F4CC3C', sentence: 'El sol es amarillo.', translation: 'The sun is yellow.' },
  { spanish: 'Verde', english: 'Green', hex: '#42B76A', sentence: 'La hoja es verde.', translation: 'The leaf is green.' },
  { spanish: 'Naranja', english: 'Orange', hex: '#F59A39', sentence: 'La naranja es naranja.', translation: 'The orange is orange.' },
  { spanish: 'Morado', english: 'Purple', hex: '#965ACF', sentence: 'La flor es morada.', translation: 'The flower is purple.' },
  { spanish: 'Rosa', english: 'Pink', hex: '#ED8CB8', sentence: 'El globo es rosa.', translation: 'The balloon is pink.' },
  { spanish: 'Negro', english: 'Black', hex: '#24242B', sentence: 'El gato es negro.', translation: 'The cat is black.' },
  { spanish: 'Blanco', english: 'White', hex: '#FFFFFF', sentence: 'La nieve es blanca.', translation: 'The snow is white.' },
  { spanish: 'Marrón', english: 'Brown', hex: '#936040', sentence: 'El oso es marrón.', translation: 'The bear is brown.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function SpanishColorsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);

  const color = COLORS[index];
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

  // Read the color name, then pause clearly before the sample sentence.
  const speakColor = () => {
    stopNarration();
    if (!soundOn || finished) return;

    const id = narrationId.current;
    Speech.speak(color.spanish, {
      language: 'es-ES',
      rate: 0.74,
      pitch: 1,
      onDone: () => {
        if (id !== narrationId.current) return;
        pauseTimer.current = setTimeout(() => {
          pauseTimer.current = null;
          if (id !== narrationId.current) return;
          Speech.speak(color.sentence, {
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
    const timer = setTimeout(() => speakColor(), 350);
    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [index, soundOn, finished]);

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      void Speech.stop().then(() => {
        Speech.speak('¡Muy bien! ¡Has aprendido los colores en español!', {
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
    if (index === COLORS.length - 1) {
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
        <Text style={styles.heading}>Colores 🎨</Text>
        <Text style={styles.subtitle}>Learn the colors in Spanish!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🎨</Text>
            <Text style={styles.word}>¡Muy bien!</Text>
            <Text style={styles.english}>
              Amazing! You learned {COLORS.length} colors in Spanish.
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
              <Text style={styles.progressText}>Color {index + 1} of {COLORS.length}</Text>
              <Text style={styles.progressText}>
                {Math.round(((index + 1) / COLORS.length) * 100)}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${((index + 1) / COLORS.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.colorCircle}>
                <View
                  accessibilityLabel={`${color.english} color swatch`}
                  style={[styles.swatch, { backgroundColor: color.hex }]}
                />
              </View>
              <Text style={styles.word}>{color.spanish}</Text>
              <Text style={styles.english}>{color.english}</Text>

              <View style={styles.sentenceBox}>
                <Text style={styles.sentence}>{color.sentence}</Text>
                <Text style={styles.translation}>{color.translation}</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={!soundOn}
                onPress={speakColor}
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
                  {index === COLORS.length - 1 ? 'Finish 🎉' : 'Next →'}
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
  colorCircle: {
    height: 170, width: 170, borderRadius: 85, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E9DDFF', marginBottom: 20,
  },
  swatch: { width: 118, height: 118, borderRadius: 59, borderColor: '#B9B1C8', borderWidth: 1 },
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
