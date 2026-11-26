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

// Mandarin color vocabulary: Hanzi, tone-marked Pinyin, matched color swatches, and example sentences.
type MandarinCard = {
  kind: 'color';
  hanzi: string;
  pinyin: string;
  english: string;
  swatch: string;
  note: string;
  example: string;
  examplePinyin: string;
  exampleEnglish: string;
};

const CARDS: MandarinCard[] = [
  { kind: 'color', hanzi: '红色', pinyin: 'hóngsè', english: 'Red', swatch: '#EF5350', note: '红 hóng is a second tone; 色 sè is a fourth tone.', example: '苹果是红色的。', examplePinyin: 'píngguǒ shì hóngsè de', exampleEnglish: 'The apple is red.' },
  { kind: 'color', hanzi: '蓝色', pinyin: 'lánsè', english: 'Blue', swatch: '#4285F4', note: '蓝 lán has a rising second tone.', example: '天空是蓝色的。', examplePinyin: 'tiānkōng shì lánsè de', exampleEnglish: 'The sky is blue.' },
  { kind: 'color', hanzi: '黄色', pinyin: 'huángsè', english: 'Yellow', swatch: '#F4CC35', note: '黄 huáng has a rising second tone.', example: '香蕉是黄色的。', examplePinyin: 'xiāngjiāo shì huángsè de', exampleEnglish: 'The banana is yellow.' },
  { kind: 'color', hanzi: '绿色', pinyin: 'lǜsè', english: 'Green', swatch: '#43B96C', note: 'The vowel ü in lǜ is not the English letter u.', example: '草是绿色的。', examplePinyin: 'cǎo shì lǜsè de', exampleEnglish: 'The grass is green.' },
  { kind: 'color', hanzi: '橙色', pinyin: 'chéngsè', english: 'Orange', swatch: '#F59639', note: '橙 chéng has a rising second tone.', example: '橙子是橙色的。', examplePinyin: 'chéngzi shì chéngsè de', exampleEnglish: 'The orange is orange.' },
  { kind: 'color', hanzi: '紫色', pinyin: 'zǐsè', english: 'Purple', swatch: '#965ACF', note: '紫 zǐ has a third tone.', example: '葡萄可以是紫色的。', examplePinyin: 'pútao kěyǐ shì zǐsè de', exampleEnglish: 'Grapes can be purple.' },
  { kind: 'color', hanzi: '粉色', pinyin: 'fěnsè', english: 'Pink', swatch: '#F29BC5', note: '粉 fěn has a third tone.', example: '这朵花是粉色的。', examplePinyin: 'zhè duǒ huā shì fěnsè de', exampleEnglish: 'This flower is pink.' },
  { kind: 'color', hanzi: '黑色', pinyin: 'hēisè', english: 'Black', swatch: '#292B33', note: '黑 hēi has a high, level first tone.', example: '这只猫是黑色的。', examplePinyin: 'zhè zhī māo shì hēisè de', exampleEnglish: 'This cat is black.' },
  { kind: 'color', hanzi: '白色', pinyin: 'báisè', english: 'White', swatch: '#FFFFFF', note: '白 bái has a rising second tone.', example: '雪是白色的。', examplePinyin: 'xuě shì báisè de', exampleEnglish: 'Snow is white.' },
  { kind: 'color', hanzi: '棕色', pinyin: 'zōngsè', english: 'Brown', swatch: '#94623E', note: '棕 zōng has a high, level first tone.', example: '这只熊是棕色的。', examplePinyin: 'zhè zhī xióng shì zōngsè de', exampleEnglish: 'This bear is brown.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function MandarinColorsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);
  const current = CARDS[index];

  const narrationId = useRef(0);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopNarration() {
    narrationId.current += 1;
    if (pauseTimer.current !== null) {
      clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }
    void Speech.stop();
  }

  function speakCurrent() {
    stopNarration();
    if (!soundOn || finished) return;
    const id = narrationId.current;
    // Speak HANZI rather than Pinyin so the Chinese TTS reads the color word.
    Speech.speak(current.hanzi, {
      language: 'zh-CN', rate: 0.72, pitch: 1,
      onDone: () => {
        if (id !== narrationId.current) return;
        pauseTimer.current = setTimeout(() => {
          pauseTimer.current = null;
          if (id !== narrationId.current) return;
          Speech.speak(current.example, { language: 'zh-CN', rate: 0.77, pitch: 1 });
        }, 850);
      },
    });
  }

  useEffect(() => {
    if (finished || !soundOn) {
      stopNarration();
      return;
    }
    const timer = setTimeout(speakCurrent, 350);
    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [index, soundOn, finished]);

  function goBack() {
    stopNarration();
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/mary/categories', params: { language: 'chinese', activity: 'lessons' } });
  }

  function next() {
    stopNarration();
    if (index === CARDS.length - 1) setFinished(true);
    else setIndex(i => i + 1);
  }

  function previous() {
    stopNarration();
    setIndex(i => Math.max(0, i - 1));
  }

  function replay() {
    stopNarration();
    setIndex(0);
    setFinished(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <TouchableOpacity accessibilityRole="button" style={styles.smallButton} onPress={goBack}>
            <Text style={styles.smallButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.smallButton} onPress={() => {
            stopNarration();
            setSoundOn(v => !v);
          }}>
            <Text style={styles.smallButtonText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>中文 • MANDARIN CHINESE</Text>
        <Text style={styles.heading}>颜色 🎨</Text>
        <Text style={styles.subtitle}>Colors • Discover the rainbow in Mandarin!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>太棒了！</Text>
            <Text style={styles.english}>Amazing! You learned {CARDS.length} color names in Mandarin!</Text>
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
              <Text style={styles.progressText}>Card {index + 1} of {CARDS.length}</Text>
              <Text style={styles.progressText}>{Math.round(((index + 1) / CARDS.length) * 100)}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((index + 1) / CARDS.length) * 100}%` }]} />
            </View>

            <View style={styles.card}>
              <Text style={styles.kind}>{'🎨 COLOR EXPLORERS'}</Text>
              <View style={styles.characterCircle}>
                <Text style={styles.hanzi}>{current.hanzi}</Text>
              </View>
              <Text style={styles.pinyin}>{current.pinyin}</Text>
              <View style={styles.swatchFrame} accessibilityLabel={`${current.english} color swatch`}>
                <View style={[styles.swatch, { backgroundColor: current.swatch }]} />
              </View>
              <Text style={styles.word}>{current.english}</Text>
              <Text style={styles.note}>{current.note}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>Say this sentence</Text>
                <Text style={styles.exampleHanzi}>{current.example}</Text>
                <Text style={styles.examplePinyin}>{current.examplePinyin}</Text>
                <Text style={styles.exampleEnglish}>{current.exampleEnglish}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" style={styles.listenButton} onPress={speakCurrent}>
                <Text style={styles.listenText}>🔊 Hear Mandarin</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navigation}>
              <TouchableOpacity accessibilityRole="button" disabled={index === 0}
                style={[styles.secondaryButton, styles.navButton, index === 0 && styles.disabled]} onPress={previous}>
                <Text style={styles.secondaryText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={[styles.primaryButton, styles.navButton]} onPress={next}>
                <Text style={styles.primaryText}>{index === CARDS.length - 1 ? 'Finish 🎉' : 'Next →'}</Text>
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
  eyebrow: { color: PURPLE, fontWeight: '800', letterSpacing: 1.2, textAlign: 'center', fontSize: 12 },
  heading: { color: DARK, fontWeight: '900', textAlign: 'center', fontSize: 29, marginTop: 8 },
  subtitle: { color: '#766E8D', textAlign: 'center', fontSize: 15, marginTop: 8, marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  progressText: { color: '#6C6282', fontWeight: '700' },
  track: { backgroundColor: '#E1D8F7', height: 11, borderRadius: 12, overflow: 'hidden', marginBottom: 22 },
  fill: { backgroundColor: '#8C71D9', height: '100%', borderRadius: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center', shadowColor: '#9276CA', shadowOpacity: 0.11, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  kind: { fontSize: 12, fontWeight: '900', color: PURPLE, letterSpacing: 1.5 },
  characterCircle: { minHeight: 132, minWidth: 132, paddingHorizontal: 10, borderRadius: 34, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E9DDFF', marginTop: 16 },
  hanzi: { fontSize: 68, color: PURPLE, fontWeight: '800', textAlign: 'center' },
  pinyin: { fontSize: 31, color: DARK, fontWeight: '800', marginTop: 12 },
  swatchFrame: { marginTop: 18, width: 112, height: 112, borderRadius: 30, padding: 7, backgroundColor: '#F2EDF9', borderWidth: 1, borderColor: '#E1D8EE' },
  swatch: { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: '#DFDFDF' },
  celebration: { fontSize: 60, marginVertical: 24 },
  word: { fontSize: 27, color: DARK, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  english: { fontSize: 17, color: '#7C728E', textAlign: 'center', marginTop: 7 },
  note: { textAlign: 'center', color: '#655B76', fontSize: 14, marginTop: 12, lineHeight: 21 },
  exampleBox: { backgroundColor: '#F6F2FF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center', width: '100%', marginTop: 18 },
  exampleTitle: { color: PURPLE, fontWeight: '800', fontSize: 12 },
  exampleHanzi: { fontSize: 35, color: DARK, fontWeight: '900', marginTop: 6 },
  examplePinyin: { fontSize: 19, color: PURPLE, fontWeight: '700', marginTop: 4 },
  exampleEnglish: { fontSize: 13, color: '#7C728E', marginTop: 4 },
  listenButton: { backgroundColor: '#E8F4FF', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 20, marginTop: 24 },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 17 },
  navigation: { flexDirection: 'row', gap: 12, marginTop: 18 },
  navButton: { flex: 1 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.4 },
});
