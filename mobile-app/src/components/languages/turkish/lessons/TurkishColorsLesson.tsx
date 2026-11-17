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
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

type ColorItem = {
  name: string;
  english: string;
  hex: string;
  sentence: string;
  translation: string;
  emoji: string;
};

const COLORS: ColorItem[] = [
  { name: 'Kırmızı', english: 'Red', hex: '#EF5350', sentence: 'Elma kırmızıdır.', translation: 'The apple is red.', emoji: '🍎' },
  { name: 'Mavi', english: 'Blue', hex: '#3F86E8', sentence: 'Gökyüzü mavidir.', translation: 'The sky is blue.', emoji: '☁️' },
  { name: 'Sarı', english: 'Yellow', hex: '#F6CB35', sentence: 'Limon sarıdır.', translation: 'The lemon is yellow.', emoji: '🍋' },
  { name: 'Yeşil', english: 'Green', hex: '#44B778', sentence: 'Yaprak yeşildir.', translation: 'The leaf is green.', emoji: '🍃' },
  { name: 'Turuncu', english: 'Orange', hex: '#F59B43', sentence: 'Portakal turuncudur.', translation: 'The orange is orange.', emoji: '🍊' },
  { name: 'Mor', english: 'Purple', hex: '#9764CC', sentence: 'Üzüm mordur.', translation: 'The grape is purple.', emoji: '🍇' },
  { name: 'Pembe', english: 'Pink', hex: '#F285B2', sentence: 'Çiçek pembedir.', translation: 'The flower is pink.', emoji: '🌸' },
  { name: 'Siyah', english: 'Black', hex: '#303242', sentence: 'Kedi siyahtır.', translation: 'The cat is black.', emoji: '🐈‍⬛' },
  { name: 'Beyaz', english: 'White', hex: '#FFFFFF', sentence: 'Kar beyazdır.', translation: 'The snow is white.', emoji: '❄️' },
  { name: 'Kahverengi', english: 'Brown', hex: '#946447', sentence: 'Ayı kahverengidir.', translation: 'The bear is brown.', emoji: '🐻' },
];

const THEME = {
  background: '#F7F4FF',
  ink: '#352D56',
  muted: '#766B91',
  purple: '#7753CF',
  lavender: '#E9DFFF',
  green: '#2C9A68',
  white: '#FFFFFF',
};

export default function TurkishColorsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [complete, setComplete] = useState(false);
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const stopSpeaking = useCallback(() => {
    if (speakTimer.current) {
      clearTimeout(speakTimer.current);
      speakTimer.current = null;
    }
    void Speech.stop();
  }, []);

  const speak = useCallback((item: ColorItem) => {
    if (!soundOn || !alive.current) return;
    stopSpeaking();
    Speech.speak(`${item.name}. ${item.sentence}`, {
      language: 'tr-TR',
      rate: 0.82,
      pitch: 1.0,
    });
  }, [soundOn, stopSpeaking]);

  // Auto-play on the first card, and on every card change.
  useEffect(() => {
    if (complete || !soundOn) {
      stopSpeaking();
      return;
    }
    speakTimer.current = setTimeout(() => {
      if (alive.current) speak(COLORS[index]);
    }, 350);
    return stopSpeaking;
  }, [index, complete, soundOn, speak, stopSpeaking]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
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
    if (index === COLORS.length - 1) setComplete(true);
    else setIndex((old) => old + 1);
  };

  const previous = () => {
    stopSpeaking();
    if (complete) {
      setComplete(false);
      setIndex(COLORS.length - 1);
    } else if (index > 0) setIndex((old) => old - 1);
    else goBack();
  };

  const restart = () => {
    stopSpeaking();
    setIndex(0);
    setComplete(false);
  };

  const item = COLORS[index];
  const progress = complete ? 100 : ((index + 1) / COLORS.length) * 100;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerEyebrow}>TÜRKÇE 🇹🇷</Text>
          <Text style={styles.headerText}>Renkler · Colors</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (soundOn) stopSpeaking();
            setSoundOn((old) => !old);
          }}
          accessibilityRole="button"
          accessibilityLabel={soundOn ? 'Turn sound off' : 'Turn sound on'}
          style={styles.iconButton}
        >
          <Ionicons name={soundOn ? 'volume-high' : 'volume-mute'} size={23} color={THEME.purple} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{complete ? 'Harika! · Completed' : `Color ${index + 1} of ${COLORS.length}`}</Text>
          <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {complete ? (
        <View style={styles.doneContainer}>
          <Text style={styles.celebration}>🎉🌈🎉</Text>
          <Text style={styles.doneTitle}>Aferin!</Text>
          <Text style={styles.doneSubTitle}>Well done!</Text>
          <Text style={styles.doneDescription}>You learned all ten Turkish colors. Great job!</Text>
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
              <Text style={styles.cardPrompt}>Bu hangi renk?</Text>
              <Text style={styles.cardPromptEnglish}>What color is this?</Text>
              <View style={styles.colorStage}>
                <View style={[styles.colorCircle, { backgroundColor: item.hex, borderColor: item.hex === '#FFFFFF' ? '#D5D0E3' : '#FFFFFF' }]} />
                <Text style={styles.objectEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.turkishName}>{item.name}</Text>
              <Text style={styles.englishName}>{item.english}</Text>
              <View style={styles.sentenceBox}>
                <Text style={styles.sentenceTurkish}>{item.sentence}</Text>
                <Text style={styles.sentenceEnglish}>{item.translation}</Text>
              </View>
              <TouchableOpacity
                style={styles.hearButton}
                onPress={() => speak(item)}
                disabled={!soundOn}
                accessibilityRole="button"
              >
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
              <Text style={styles.nextText}>{index === COLORS.length - 1 ? 'Finish' : 'Next'}</Text>
              <Ionicons name={index === COLORS.length - 1 ? 'checkmark' : 'chevron-forward'} size={21} color="#FFFFFF" />
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
  colorStage: { height: 185, width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  colorCircle: { width: 138, height: 138, borderRadius: 69, borderWidth: 3, shadowColor: '#2D244A', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  objectEmoji: { fontSize: 42, position: 'absolute', right: '13%', bottom: 4 },
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
