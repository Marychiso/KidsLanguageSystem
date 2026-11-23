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

type FruitItem = {
  name: string;
  english: string;
  emoji: string;
  sentence: string;
  translation: string;
  accent: string;
};

const FRUITS: FruitItem[] = [
  { name: 'Elma', english: 'Apple', emoji: '🍎', sentence: 'Bu kırmızı bir elma.', translation: 'This is a red apple.', accent: '#F26D79' },
  { name: 'Muz', english: 'Banana', emoji: '🍌', sentence: 'Muz sarıdır.', translation: 'The banana is yellow.', accent: '#F5C94C' },
  { name: 'Portakal', english: 'Orange', emoji: '🍊', sentence: 'Portakal turuncudur.', translation: 'The orange is orange.', accent: '#F7A24B' },
  { name: 'Çilek', english: 'Strawberry', emoji: '🍓', sentence: 'Çilek kırmızıdır.', translation: 'The strawberry is red.', accent: '#F46C84' },
  { name: 'Üzüm', english: 'Grapes', emoji: '🍇', sentence: 'Üzüm çok lezzetlidir.', translation: 'Grapes are very delicious.', accent: '#A180DD' },
  { name: 'Karpuz', english: 'Watermelon', emoji: '🍉', sentence: 'Karpuz büyüktür.', translation: 'The watermelon is big.', accent: '#65BE87' },
  { name: 'Armut', english: 'Pear', emoji: '🍐', sentence: 'Armut yeşildir.', translation: 'The pear is green.', accent: '#B4CB63' },
  { name: 'Ananas', english: 'Pineapple', emoji: '🍍', sentence: 'Ananas sarıdır.', translation: 'The pineapple is yellow.', accent: '#E8BC57' },
  { name: 'Kiraz', english: 'Cherry', emoji: '🍒', sentence: 'Kiraz küçüktür.', translation: 'The cherry is small.', accent: '#E86D85' },
  { name: 'Şeftali', english: 'Peach', emoji: '🍑', sentence: 'Şeftali tatlıdır.', translation: 'The peach is sweet.', accent: '#F6AA8D' },
];

const THEME = {
  background: '#F7F4FF',
  ink: '#352D56',
  muted: '#766B91',
  purple: '#7753CF',
  lavender: '#E9DFFF',
  white: '#FFFFFF',
};

export default function TurkishFruitsLesson() {
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
    (fruit: FruitItem) => {
      if (!soundOn || !mountedRef.current) return;
      stopSpeaking();
      Speech.speak(`${fruit.name}. ${fruit.sentence}`, {
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
      if (mountedRef.current) speak(FRUITS[index]);
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
    if (index === FRUITS.length - 1) setComplete(true);
    else setIndex((previous) => previous + 1);
  };

  const previous = () => {
    stopSpeaking();
    if (complete) {
      setComplete(false);
      setIndex(FRUITS.length - 1);
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

  const fruit = FRUITS[index];
  const progress = complete ? 100 : ((index + 1) / FRUITS.length) * 100;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={THEME.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerEyebrow}>TÜRKÇE 🇹🇷</Text>
          <Text style={styles.headerText}>Meyveler · Fruits</Text>
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
          <Text style={styles.progressLabel}>{complete ? 'Harika! · Completed' : `Fruit ${index + 1} of ${FRUITS.length}`}</Text>
          <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {complete ? (
        <View style={styles.doneContainer}>
          <Text style={styles.celebration}>🎉🍎🎉</Text>
          <Text style={styles.doneTitle}>Aferin!</Text>
          <Text style={styles.doneSubTitle}>Well done!</Text>
          <Text style={styles.doneDescription}>You learned all ten Turkish fruits. Great job!</Text>
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
              <Text style={styles.cardPrompt}>Bu hangi meyve?</Text>
              <Text style={styles.cardPromptEnglish}>What fruit is this?</Text>
              <View style={[styles.fruitStage, { backgroundColor: `${fruit.accent}1D` }]}>
                <Text style={styles.fruitEmoji}>{fruit.emoji}</Text>
              </View>
              <Text style={styles.turkishName}>{fruit.name}</Text>
              <Text style={styles.englishName}>{fruit.english}</Text>
              <View style={styles.sentenceBox}>
                <Text style={styles.sentenceTurkish}>{fruit.sentence}</Text>
                <Text style={styles.sentenceEnglish}>{fruit.translation}</Text>
              </View>
              <TouchableOpacity style={styles.hearButton} onPress={() => speak(fruit)} disabled={!soundOn} accessibilityRole="button">
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
              <Text style={styles.nextText}>{index === FRUITS.length - 1 ? 'Finish' : 'Next'}</Text>
              <Ionicons name={index === FRUITS.length - 1 ? 'checkmark' : 'chevron-forward'} size={21} color="#FFFFFF" />
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
  fruitStage: { width: '100%', height: 190, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 14 },
  fruitEmoji: { fontSize: 108 },
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
