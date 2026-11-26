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

// Mandarin shape vocabulary: Hanzi, tone-marked Pinyin, matching shape emojis, and example sentences.
type MandarinCard = {
  kind: 'shape';
  hanzi: string;
  pinyin: string;
  english: string;
  symbol: string;
  color: string;
  note: string;
  example: string;
  examplePinyin: string;
  exampleEnglish: string;
};

const CARDS: MandarinCard[] = [
  { kind: 'shape', hanzi: '圆形', pinyin: 'yuánxíng', english: 'Circle', symbol: '●', color: '#EE6D81', note: 'A circle is round, with no corners.', example: '圆形没有角。', examplePinyin: 'yuánxíng méiyǒu jiǎo', exampleEnglish: 'A circle has no corners.' },
  { kind: 'shape', hanzi: '正方形', pinyin: 'zhèngfāngxíng', english: 'Square', symbol: '■', color: '#579BEA', note: 'A square has four equal sides.', example: '正方形有四条边。', examplePinyin: 'zhèngfāngxíng yǒu sì tiáo biān', exampleEnglish: 'A square has four sides.' },
  { kind: 'shape', hanzi: '三角形', pinyin: 'sānjiǎoxíng', english: 'Triangle', symbol: '▲', color: '#F3A63D', note: '三 sān means three; 角 jiǎo means corner.', example: '三角形有三个角。', examplePinyin: 'sānjiǎoxíng yǒu sān ge jiǎo', exampleEnglish: 'A triangle has three corners.' },
  { kind: 'shape', hanzi: '长方形', pinyin: 'chángfāngxíng', english: 'Rectangle', symbol: '▰', color: '#51B994', note: 'A rectangle has four sides and four corners.', example: '长方形有四个角。', examplePinyin: 'chángfāngxíng yǒu sì ge jiǎo', exampleEnglish: 'A rectangle has four corners.' },
  { kind: 'shape', hanzi: '星形', pinyin: 'xīngxíng', english: 'Star', symbol: '★', color: '#E8B640', note: '星 xīng means star; 形 xíng means shape.', example: '我画了一颗星星。', examplePinyin: 'wǒ huà le yì kē xīngxing', exampleEnglish: 'I drew a star.' },
  { kind: 'shape', hanzi: '心形', pinyin: 'xīnxíng', english: 'Heart', symbol: '♥', color: '#E775AE', note: '心 xīn means heart; 形 xíng means shape.', example: '这是一个心形。', examplePinyin: 'zhè shì yí ge xīnxíng', exampleEnglish: 'This is a heart shape.' },
  { kind: 'shape', hanzi: '椭圆形', pinyin: 'tuǒyuánxíng', english: 'Oval', symbol: '⬭', color: '#9871D8', note: 'An oval is rounded and longer in one direction.', example: '这是一个椭圆形。', examplePinyin: 'zhè shì yí ge tuǒyuánxíng', exampleEnglish: 'This is an oval.' },
  { kind: 'shape', hanzi: '菱形', pinyin: 'língxíng', english: 'Rhombus', symbol: '◆', color: '#E69B5B', note: 'A rhombus has four equal-length sides.', example: '菱形有四条边。', examplePinyin: 'língxíng yǒu sì tiáo biān', exampleEnglish: 'A rhombus has four sides.' },
  { kind: 'shape', hanzi: '五边形', pinyin: 'wǔbiānxíng', english: 'Pentagon', symbol: '⬟', color: '#48B6BF', note: '五 wǔ means five; 边 biān means side.', example: '五边形有五条边。', examplePinyin: 'wǔbiānxíng yǒu wǔ tiáo biān', exampleEnglish: 'A pentagon has five sides.' },
  { kind: 'shape', hanzi: '六边形', pinyin: 'liùbiānxíng', english: 'Hexagon', symbol: '⬢', color: '#8082D7', note: '六 liù means six; 边 biān means side.', example: '六边形有六条边。', examplePinyin: 'liùbiānxíng yǒu liù tiáo biān', exampleEnglish: 'A hexagon has six sides.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function MandarinShapesLesson() {
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
    // Speak HANZI rather than Pinyin so the Chinese TTS reads the shape name.
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
        <Text style={styles.heading}>形状 🔺</Text>
        <Text style={styles.subtitle}>Shapes • Explore shape names in Mandarin!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>太棒了！</Text>
            <Text style={styles.english}>Amazing! You learned {CARDS.length} shape names in Mandarin!</Text>
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
              <Text style={styles.kind}>{'🔷 SHAPE EXPLORERS'}</Text>
              <View style={styles.characterCircle}>
                <Text style={styles.hanzi}>{current.hanzi}</Text>
              </View>
              <Text style={styles.pinyin}>{current.pinyin}</Text>
              <View style={styles.shapeFrame} accessibilityLabel={`${current.english} shape illustration`}>
                {current.english === 'Oval' ? (
                  <View style={{ width: 82, height: 53, backgroundColor: current.color, borderRadius: 40 }} />
                ) : current.english === 'Rectangle' ? (
                  <View style={{ width: 83, height: 52, backgroundColor: current.color, borderRadius: 3 }} />
                ) : (
                  <Text style={[styles.shapeSymbol, { color: current.color }]}>{current.symbol}</Text>
                )}
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
  shapeFrame: { marginTop: 18, width: 112, height: 112, borderRadius: 30, backgroundColor: '#F2EDF9', borderWidth: 1, borderColor: '#E1D8EE', alignItems: 'center', justifyContent: 'center' },
  shapeSymbol: { fontSize: 76, fontWeight: '900', textAlign: 'center', includeFontPadding: false },
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
