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

// Mandarin fruit vocabulary: Hanzi, tone-marked Pinyin, matching fruit emojis, and example sentences.
type MandarinCard = {
  kind: 'fruit';
  hanzi: string;
  pinyin: string;
  english: string;
  emoji: string;
  note: string;
  example: string;
  examplePinyin: string;
  exampleEnglish: string;
};

const CARDS: MandarinCard[] = [
  { kind: 'fruit', hanzi: '苹果', pinyin: 'píngguǒ', english: 'Apple', emoji: '🍎', note: '苹 píng is a second tone; 果 guǒ is a third tone.', example: '苹果是红色的。', examplePinyin: 'píngguǒ shì hóngsè de', exampleEnglish: 'The apple is red.' },
  { kind: 'fruit', hanzi: '香蕉', pinyin: 'xiāngjiāo', english: 'Banana', emoji: '🍌', note: 'Both syllables in xiāngjiāo use the first tone.', example: '香蕉是黄色的。', examplePinyin: 'xiāngjiāo shì huángsè de', exampleEnglish: 'The banana is yellow.' },
  { kind: 'fruit', hanzi: '橙子', pinyin: 'chéngzi', english: 'Orange', emoji: '🍊', note: '橙 chéng has the second tone; 子 zi is neutral.', example: '橙子是甜的。', examplePinyin: 'chéngzi shì tián de', exampleEnglish: 'The orange is sweet.' },
  { kind: 'fruit', hanzi: '草莓', pinyin: 'cǎoméi', english: 'Strawberry', emoji: '🍓', note: '草 cǎo uses the third tone; 莓 méi uses the second.', example: '草莓是红色的。', examplePinyin: 'cǎoméi shì hóngsè de', exampleEnglish: 'The strawberry is red.' },
  { kind: 'fruit', hanzi: '葡萄', pinyin: 'pútao', english: 'Grapes', emoji: '🍇', note: '葡 pú has the second tone; 萄 tao is neutral in this word.', example: '葡萄很好吃。', examplePinyin: 'pútao hěn hǎochī', exampleEnglish: 'Grapes are delicious.' },
  { kind: 'fruit', hanzi: '西瓜', pinyin: 'xīguā', english: 'Watermelon', emoji: '🍉', note: 'Both syllables in xīguā have the first tone.', example: '西瓜很大。', examplePinyin: 'xīguā hěn dà', exampleEnglish: 'The watermelon is big.' },
  { kind: 'fruit', hanzi: '梨', pinyin: 'lí', english: 'Pear', emoji: '🍐', note: '梨 lí uses the rising second tone.', example: '这个梨很甜。', examplePinyin: 'zhège lí hěn tián', exampleEnglish: 'This pear is sweet.' },
  { kind: 'fruit', hanzi: '菠萝', pinyin: 'bōluó', english: 'Pineapple', emoji: '🍍', note: '菠 bō has the first tone; 萝 luó has the second.', example: '菠萝是黄色的。', examplePinyin: 'bōluó shì huángsè de', exampleEnglish: 'The pineapple is yellow.' },
  { kind: 'fruit', hanzi: '樱桃', pinyin: 'yīngtáo', english: 'Cherry', emoji: '🍒', note: '樱 yīng has the first tone; 桃 táo has the second.', example: '樱桃很小。', examplePinyin: 'yīngtáo hěn xiǎo', exampleEnglish: 'Cherries are small.' },
  { kind: 'fruit', hanzi: '桃子', pinyin: 'táozi', english: 'Peach', emoji: '🍑', note: '桃 táo has the second tone; 子 zi is neutral.', example: '桃子很好吃。', examplePinyin: 'táozi hěn hǎochī', exampleEnglish: 'Peaches are delicious.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function MandarinFruitsLesson() {
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
    // Speak HANZI rather than Pinyin so the Chinese TTS reads the fruit word.
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
        <Text style={styles.heading}>水果 🍎</Text>
        <Text style={styles.subtitle}>Fruits • Discover delicious fruit names in Mandarin!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>太棒了！</Text>
            <Text style={styles.english}>Amazing! You learned {CARDS.length} fruit names in Mandarin!</Text>
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
              <Text style={styles.kind}>{'🍉 FRUIT EXPLORERS'}</Text>
              <View style={styles.characterCircle}>
                <Text style={styles.hanzi}>{current.hanzi}</Text>
              </View>
              <Text style={styles.pinyin}>{current.pinyin}</Text>
              <View style={styles.fruitFrame} accessibilityLabel={`${current.english} fruit illustration`}>
                <Text style={styles.fruitEmoji}>{current.emoji}</Text>
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
  fruitFrame: { marginTop: 18, width: 112, height: 112, borderRadius: 30, backgroundColor: '#F2EDF9', borderWidth: 1, borderColor: '#E1D8EE', alignItems: 'center', justifyContent: 'center' },
  fruitEmoji: { fontSize: 70 },
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
