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

type Shape = {
  spanish: string;
  english: string;
  symbol: string;
  color: string;
  sentence: string;
  translation: string;
};

const SHAPES: Shape[] = [
  { spanish: 'Círculo', english: 'Circle', symbol: 'circle', color: '#EF617C', sentence: 'El círculo es redondo.', translation: 'The circle is round.' },
  { spanish: 'Cuadrado', english: 'Square', symbol: 'square', color: '#559AE9', sentence: 'El cuadrado tiene cuatro lados iguales.', translation: 'The square has four equal sides.' },
  { spanish: 'Triángulo', english: 'Triangle', symbol: 'triangle', color: '#F1A33B', sentence: 'El triángulo tiene tres lados.', translation: 'The triangle has three sides.' },
  { spanish: 'Rectángulo', english: 'Rectangle', symbol: 'rectangle', color: '#57B88F', sentence: 'El rectángulo tiene cuatro lados.', translation: 'The rectangle has four sides.' },
  { spanish: 'Estrella', english: 'Star', symbol: 'star', color: '#E8B83D', sentence: 'La estrella tiene cinco puntas.', translation: 'The star has five points.' },
  { spanish: 'Corazón', english: 'Heart', symbol: 'heart', color: '#E675AB', sentence: 'El corazón es rojo.', translation: 'The heart is red.' },
  { spanish: 'Óvalo', english: 'Oval', symbol: 'oval', color: '#9274D9', sentence: 'El óvalo es alargado.', translation: 'The oval is elongated.' },
  { spanish: 'Rombo', english: 'Rhombus', symbol: 'diamond', color: '#E79B55', sentence: 'El rombo tiene cuatro lados iguales.', translation: 'The rhombus has four equal sides.' },
  { spanish: 'Pentágono', english: 'Pentagon', symbol: 'pentagon', color: '#41B8BB', sentence: 'El pentágono tiene cinco lados.', translation: 'The pentagon has five sides.' },
  { spanish: 'Hexágono', english: 'Hexagon', symbol: 'hexagon', color: '#7E80D8', sentence: 'El hexágono tiene seis lados.', translation: 'The hexagon has six sides.' },
];

function ShapePicture({ shape }: { shape: Shape }) {
  switch (shape.symbol) {
    case 'circle':
      return <View style={{ width: 116, height: 116, borderRadius: 58, backgroundColor: shape.color }} />;
    case 'square':
      return <View style={{ width: 112, height: 112, backgroundColor: shape.color }} />;
    case 'rectangle':
      return <View style={{ width: 137, height: 83, backgroundColor: shape.color }} />;
    case 'oval':
      return <View style={{ width: 142, height: 87, borderRadius: 75, backgroundColor: shape.color }} />;
    case 'diamond':
      return <View style={{ width: 90, height: 90, backgroundColor: shape.color, transform: [{ rotate: '45deg' }] }} />;
    case 'triangle':
      return <View style={{ width: 0, height: 0, borderLeftWidth: 65, borderRightWidth: 65, borderBottomWidth: 115, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: shape.color }} />;
    case 'star':
      return <Text style={{ fontSize: 141, lineHeight: 159, color: shape.color }}>★</Text>;
    case 'heart':
      return <Text style={{ fontSize: 145, lineHeight: 165, color: shape.color }}>♥</Text>;
    case 'pentagon':
      return <Text style={{ fontSize: 130, lineHeight: 154, color: shape.color }}>⬟</Text>;
    case 'hexagon':
      return <Text style={{ fontSize: 130, lineHeight: 154, color: shape.color }}>⬢</Text>;
    default:
      return null;
  }
}

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function SpanishShapesLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);

  const shape = SHAPES[index];
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

  // Read the shape name, then pause clearly before its example sentence.
  const speakShape = () => {
    stopNarration();
    if (!soundOn || finished) return;

    const id = narrationId.current;
    Speech.speak(shape.spanish, {
      language: 'es-ES',
      rate: 0.74,
      pitch: 1,
      onDone: () => {
        if (id !== narrationId.current) return;
        pauseTimer.current = setTimeout(() => {
          pauseTimer.current = null;
          if (id !== narrationId.current) return;
          Speech.speak(shape.sentence, {
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
    const timer = setTimeout(() => speakShape(), 350);
    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [index, soundOn, finished]);

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      void Speech.stop().then(() => {
        Speech.speak('¡Muy bien! ¡Has aprendido las formas en español!', {
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
    if (index === SHAPES.length - 1) {
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
        <Text style={styles.heading}>Formas 🔺</Text>
        <Text style={styles.subtitle}>Learn the shapes in Spanish!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🍓</Text>
            <Text style={styles.word}>¡Muy bien!</Text>
            <Text style={styles.english}>
              Amazing! You learned all {SHAPES.length} Spanish shapes.
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
              <Text style={styles.progressText}>Shape {index + 1} of {SHAPES.length}</Text>
              <Text style={styles.progressText}>
                {Math.round(((index + 1) / SHAPES.length) * 100)}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${((index + 1) / SHAPES.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.shapeCircle}>
                <ShapePicture shape={shape} />
              </View>
              <Text style={styles.word}>{shape.spanish}</Text>
              <Text style={styles.english}>{shape.english}</Text>

              <View style={styles.sentenceBox}>
                <Text style={styles.sentence}>{shape.sentence}</Text>
                <Text style={styles.translation}>{shape.translation}</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={!soundOn}
                onPress={speakShape}
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
                  {index === SHAPES.length - 1 ? 'Finish 🎉' : 'Next →'}
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
  shapeCircle: {
    height: 190, width: 190, borderRadius: 95, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#F5EEFF', marginBottom: 20,
  },
  
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
