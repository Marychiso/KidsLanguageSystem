import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Rect, Polygon, Path, Ellipse } from 'react-native-svg';

type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'heart' | 'oval' | 'diamond' | 'pentagon' | 'hexagon';

type ShapeItem = {
  id: ShapeId;
  name: string;
  english: string;
  sentence: string;
  translation: string;
  accent: string;
};

const SHAPES: ShapeItem[] = [
  { id: 'circle', name: 'Daire', english: 'Circle', sentence: 'Daire yuvarlaktır.', translation: 'The circle is round.', accent: '#F26D79' },
  { id: 'square', name: 'Kare', english: 'Square', sentence: 'Karenin dört eşit kenarı vardır.', translation: 'A square has four equal sides.', accent: '#589BEE' },
  { id: 'triangle', name: 'Üçgen', english: 'Triangle', sentence: 'Üçgenin üç kenarı vardır.', translation: 'A triangle has three sides.', accent: '#F7A24B' },
  { id: 'rectangle', name: 'Dikdörtgen', english: 'Rectangle', sentence: 'Dikdörtgenin dört köşesi vardır.', translation: 'A rectangle has four corners.', accent: '#51BC91' },
  { id: 'star', name: 'Yıldız', english: 'Star', sentence: 'Yıldızın beş ucu vardır.', translation: 'The star has five points.', accent: '#F4C94D' },
  { id: 'heart', name: 'Kalp', english: 'Heart', sentence: 'Kalp sevgiyi simgeler.', translation: 'The heart symbolizes love.', accent: '#F177A7' },
  { id: 'oval', name: 'Oval', english: 'Oval', sentence: 'Oval, uzatılmış bir daireye benzer.', translation: 'An oval looks like a stretched circle.', accent: '#A48DEC' },
  { id: 'diamond', name: 'Eşkenar dörtgen', english: 'Rhombus / Diamond', sentence: 'Eşkenar dörtgenin dört eşit kenarı vardır.', translation: 'A rhombus has four equal sides.', accent: '#F3A068' },
  { id: 'pentagon', name: 'Beşgen', english: 'Pentagon', sentence: 'Beşgenin beş kenarı vardır.', translation: 'A pentagon has five sides.', accent: '#45B8C1' },
  { id: 'hexagon', name: 'Altıgen', english: 'Hexagon', sentence: 'Altıgenin altı kenarı vardır.', translation: 'A hexagon has six sides.', accent: '#8C82DC' },
];

function ShapePicture({ shape }: { shape: ShapeItem }) {
  const props = { fill: shape.accent, stroke: '#66548F', strokeWidth: 2, strokeLinejoin: 'round' as const };
  return (
    <Svg width={160} height={160} viewBox="0 0 100 100" accessibilityLabel={shape.english}>
      {shape.id === 'circle' && <Circle cx="50" cy="50" r="36" {...props} />}
      {shape.id === 'square' && <Rect x="18" y="18" width="64" height="64" {...props} />}
      {shape.id === 'triangle' && <Polygon points="50,12 91,85 9,85" {...props} />}
      {shape.id === 'rectangle' && <Rect x="8" y="29" width="84" height="42" {...props} />}
      {shape.id === 'star' && <Polygon points="50,7 62,36 94,38 69,59 77,91 50,73 23,91 31,59 6,38 38,36" {...props} />}
      {shape.id === 'heart' && <Path d="M50 88 C39 77 9 60 9 37 C9 12 39 9 50 29 C61 9 91 12 91 37 C91 60 61 77 50 88 Z" {...props} />}
      {shape.id === 'oval' && <Ellipse cx="50" cy="50" rx="29" ry="42" {...props} />}
      {shape.id === 'diamond' && <Polygon points="50,7 87,50 50,93 13,50" {...props} />}
      {shape.id === 'pentagon' && <Polygon points="50,8 91,40 75,89 25,89 9,40" {...props} />}
      {shape.id === 'hexagon' && <Polygon points="27,13 73,13 94,50 73,87 27,87 6,50" {...props} />}
    </Svg>
  );
}

const THEME = {
  background: '#F7F4FF',
  ink: '#352D56',
  muted: '#766B91',
  purple: '#7753CF',
  lavender: '#E9DFFF',
  white: '#FFFFFF',
};

export default function TurkishShapesLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const stopSpeaking = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    void Speech.stop();
  }, []);

  const speak = useCallback(
    (shape: ShapeItem) => {
      if (!soundOn || !mountedRef.current) return;
      stopSpeaking();
      Speech.speak(`${shape.name}. ${shape.sentence}`, {
        language: 'tr-TR',
        rate: 0.82,
        pitch: 1.0,
      });
    },
    [soundOn, stopSpeaking],
  );

  // Speak the first card automatically and again after every card change.
  useEffect(() => {
    if (complete || !soundOn) {
      stopSpeaking();
      return;
    }
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) speak(SHAPES[index]);
    }, 400);
    return stopSpeaking;
  }, [index, complete, soundOn, speak, stopSpeaking]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const goBack = () => {
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace('/mary/categories');
  };

  const next = () => {
    stopSpeaking();
    if (index === SHAPES.length - 1) setComplete(true);
    else setIndex((previous) => previous + 1);
  };

  const previous = () => {
    stopSpeaking();
    if (complete) {
      setComplete(false);
      setIndex(SHAPES.length - 1);
    } else if (index > 0) {
      setIndex((previous) => previous - 1);
    } else {
      goBack();
    }
  };

  const restart = () => {
    stopSpeaking();
    setIndex(0);
    setComplete(false);
  };

  const shape = SHAPES[index];
  const progress = complete ? 100 : ((index + 1) / SHAPES.length) * 100;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={THEME.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerEyebrow}>TÜRKÇE 🇹🇷</Text>
          <Text style={styles.headerText}>Meyveler · Shapes</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (soundOn) stopSpeaking();
            setSoundOn((wasOn) => !wasOn);
          }}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          <Ionicons name={soundOn ? 'volume-high' : 'volume-mute'} size={23} color={THEME.purple} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{complete ? 'Harika! · Completed' : `Shape ${index + 1} of ${SHAPES.length}`}</Text>
          <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {complete ? (
        <View style={styles.doneContainer}>
          <Text style={styles.celebration}>🎉⭐🎉</Text>
          <Text style={styles.doneTitle}>Aferin!</Text>
          <Text style={styles.doneSubTitle}>Well done!</Text>
          <Text style={styles.doneDescription}>You learned all ten Turkish shapes. Great job!</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={restart} accessibilityRole="button">
            <Ionicons name="refresh" size={19} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Learn Again · Tekrar Öğren</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={goBack} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Back to Categories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardPrompt}>Bu hangi şekil?</Text>
              <Text style={styles.cardPromptEnglish}>What shape is this?</Text>
              <View style={[styles.shapeStage, { backgroundColor: `${shape.accent}1D` }]}>
                <ShapePicture shape={shape} />
              </View>
              <Text style={styles.turkishName}>{shape.name}</Text>
              <Text style={styles.englishName}>{shape.english}</Text>
              <View style={styles.sentenceBox}>
                <Text style={styles.sentenceTurkish}>{shape.sentence}</Text>
                <Text style={styles.sentenceEnglish}>{shape.translation}</Text>
              </View>
              <TouchableOpacity style={styles.hearButton} onPress={() => speak(shape)} disabled={!soundOn} accessibilityRole="button">
                <Ionicons name="volume-high-outline" size={22} color={soundOn ? THEME.purple : THEME.muted} />
                <Text style={[styles.hearText, !soundOn && { color: THEME.muted }]}>Hear Turkish · Dinle</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.previousButton} onPress={previous} accessibilityRole="button">
              <Ionicons name="chevron-back" size={20} color={THEME.purple} />
              <Text style={styles.previousText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={next} accessibilityRole="button">
              <Text style={styles.nextText}>{index === SHAPES.length - 1 ? 'Finish' : 'Next'}</Text>
              <Ionicons name={index === SHAPES.length - 1 ? 'checkmark' : 'chevron-forward'} size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  iconButton: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerEyebrow: { color: THEME.purple, fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  headerText: { color: THEME.ink, fontSize: 16, fontWeight: '800', marginTop: 2 },
  progressArea: { paddingHorizontal: 24, marginTop: 15, marginBottom: 12 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: THEME.muted, fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 10, backgroundColor: '#E8DFF6', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: THEME.purple, borderRadius: 10 },
  scrollContent: { padding: 18, flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: THEME.white, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center', shadowColor: '#BCA8DA', shadowOpacity: 0.12, shadowRadius: 16, elevation: 3 },
  cardPrompt: { fontSize: 17, color: THEME.ink, fontWeight: '800' },
  cardPromptEnglish: { fontSize: 13, color: THEME.muted, marginTop: 4 },
  shapeStage: { width: '100%', height: 190, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 14 },
  turkishName: { fontSize: 32, color: THEME.ink, fontWeight: '900', textAlign: 'center' },
  englishName: { fontSize: 17, color: THEME.muted, marginTop: 2 },
  sentenceBox: { backgroundColor: '#F7F2FF', width: '100%', paddingVertical: 15, paddingHorizontal: 12, borderRadius: 18, alignItems: 'center', marginTop: 20 },
  sentenceTurkish: { color: THEME.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  sentenceEnglish: { color: THEME.muted, fontSize: 13, marginTop: 5, textAlign: 'center' },
  hearButton: { backgroundColor: '#F0E7FF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, paddingHorizontal: 25, paddingVertical: 13, borderRadius: 16, marginTop: 18 },
  hearText: { color: THEME.purple, fontWeight: '800', fontSize: 14 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  previousButton: { flex: 1, paddingVertical: 15, backgroundColor: THEME.lavender, borderRadius: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  previousText: { color: THEME.purple, fontSize: 16, fontWeight: '800' },
  nextButton: { flex: 1.3, paddingVertical: 15, backgroundColor: THEME.purple, borderRadius: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  doneContainer: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' },
  celebration: { fontSize: 54 },
  doneTitle: { fontSize: 42, fontWeight: '900', color: THEME.purple, marginTop: 18 },
  doneSubTitle: { fontSize: 24, fontWeight: '800', color: THEME.ink, marginTop: 5 },
  doneDescription: { color: THEME.muted, textAlign: 'center', lineHeight: 24, fontSize: 16, marginTop: 12, marginBottom: 28 },
  primaryButton: { width: '100%', backgroundColor: THEME.purple, borderRadius: 18, padding: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: { marginTop: 15, paddingVertical: 15 },
  secondaryButtonText: { color: THEME.purple, fontWeight: '800', fontSize: 15 },
});
