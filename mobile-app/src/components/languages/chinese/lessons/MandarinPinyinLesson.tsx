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

// Beginner Mandarin: characters are the written language; Pinyin helps show sounds.
// We teach the four marked tones, then familiar words and phrases.
type MandarinCard = {
  kind: 'tone' | 'word';
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
  { kind: 'tone', hanzi: '妈', pinyin: 'mā', english: 'Mom', emoji: '👩', note: 'First tone: high and steady — ā', example: '妈妈', examplePinyin: 'māma', exampleEnglish: 'Mom' },
  { kind: 'tone', hanzi: '麻', pinyin: 'má', english: 'Hemp (a plant)', emoji: '🌿', note: 'Second tone: voice rises — á', example: '麻', examplePinyin: 'má', exampleEnglish: 'Hemp' },
  { kind: 'tone', hanzi: '马', pinyin: 'mǎ', english: 'Horse', emoji: '🐴', note: 'Third tone: voice dips, then rises — ǎ', example: '小马', examplePinyin: 'xiǎo mǎ', exampleEnglish: 'Little horse' },
  { kind: 'tone', hanzi: '骂', pinyin: 'mà', english: 'To scold', emoji: '💬', note: 'Fourth tone: voice falls sharply — à', example: '骂', examplePinyin: 'mà', exampleEnglish: 'To scold' },
  { kind: 'word', hanzi: '你', pinyin: 'nǐ', english: 'You', emoji: '👋', note: 'Nǐ uses the third tone.', example: '你好', examplePinyin: 'nǐ hǎo', exampleEnglish: 'Hello' },
  { kind: 'word', hanzi: '好', pinyin: 'hǎo', english: 'Good', emoji: '😊', note: 'Hǎo uses the third tone.', example: '你好', examplePinyin: 'nǐ hǎo', exampleEnglish: 'Hello' },
  { kind: 'word', hanzi: '我', pinyin: 'wǒ', english: 'I / me', emoji: '🙋', note: 'Wǒ uses the third tone.', example: '我是学生', examplePinyin: 'wǒ shì xuésheng', exampleEnglish: 'I am a student' },
  { kind: 'word', hanzi: '爸爸', pinyin: 'bàba', english: 'Dad', emoji: '👨', note: 'The second ba is neutral (light and short).', example: '爸爸', examplePinyin: 'bàba', exampleEnglish: 'Dad' },
  { kind: 'word', hanzi: '猫', pinyin: 'māo', english: 'Cat', emoji: '🐱', note: 'Māo uses the first tone.', example: '小猫', examplePinyin: 'xiǎo māo', exampleEnglish: 'Kitten / little cat' },
  { kind: 'word', hanzi: '狗', pinyin: 'gǒu', english: 'Dog', emoji: '🐶', note: 'Gǒu uses the third tone.', example: '小狗', examplePinyin: 'xiǎo gǒu', exampleEnglish: 'Puppy / little dog' },
  { kind: 'word', hanzi: '水', pinyin: 'shuǐ', english: 'Water', emoji: '💧', note: 'Shuǐ uses the third tone.', example: '喝水', examplePinyin: 'hē shuǐ', exampleEnglish: 'Drink water' },
  { kind: 'word', hanzi: '花', pinyin: 'huā', english: 'Flower', emoji: '🌸', note: 'Huā uses the first tone.', example: '一朵花', examplePinyin: 'yì duǒ huā', exampleEnglish: 'One flower' },
  { kind: 'word', hanzi: '一', pinyin: 'yī', english: 'One', emoji: '1️⃣', note: 'Yī is first tone when spoken alone. In phrases its tone can change.', example: '一', examplePinyin: 'yī', exampleEnglish: 'One' },
  { kind: 'word', hanzi: '二', pinyin: 'èr', english: 'Two', emoji: '2️⃣', note: 'Èr uses the fourth tone.', example: '二', examplePinyin: 'èr', exampleEnglish: 'Two' },
  { kind: 'word', hanzi: '三', pinyin: 'sān', english: 'Three', emoji: '3️⃣', note: 'Sān uses the first tone.', example: '三', examplePinyin: 'sān', exampleEnglish: 'Three' },
  { kind: 'word', hanzi: '四', pinyin: 'sì', english: 'Four', emoji: '4️⃣', note: 'Sì uses the fourth tone.', example: '四', examplePinyin: 'sì', exampleEnglish: 'Four' },
  { kind: 'word', hanzi: '五', pinyin: 'wǔ', english: 'Five', emoji: '5️⃣', note: 'Wǔ uses the third tone.', example: '五', examplePinyin: 'wǔ', exampleEnglish: 'Five' },
  { kind: 'word', hanzi: '六', pinyin: 'liù', english: 'Six', emoji: '6️⃣', note: 'Liù uses the fourth tone.', example: '六', examplePinyin: 'liù', exampleEnglish: 'Six' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function MandarinPinyinLesson() {
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
    // Speak HANZI rather than romanized Pinyin; this selects Chinese TTS pronunciation.
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
        <Text style={styles.heading}>拼音与声调 🌟</Text>
        <Text style={styles.subtitle}>Pinyin & Tones • Learn Chinese sounds and simple words!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>太棒了！</Text>
            <Text style={styles.english}>Amazing! You practised Mandarin tones and {CARDS.length - 4} beginner word cards.</Text>
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
              <Text style={styles.kind}>{current.kind === 'tone' ? '🎵 TONE PRACTICE' : '📖 FIRST WORDS'}</Text>
              <View style={styles.characterCircle}>
                <Text style={styles.hanzi}>{current.hanzi}</Text>
              </View>
              <Text style={styles.pinyin}>{current.pinyin}</Text>
              <Text style={styles.emoji}>{current.emoji}</Text>
              <Text style={styles.word}>{current.english}</Text>
              <Text style={styles.note}>{current.note}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>Try this example</Text>
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
  emoji: { fontSize: 56, marginTop: 14 },
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
