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

// Mandarin animal vocabulary: Hanzi + tone-marked Pinyin + accurate examples.
type MandarinCard = {
  kind: 'animal';
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
  { kind: 'animal', hanzi: '猫', pinyin: 'māo', english: 'Cat', emoji: '🐱', note: 'First tone: high and steady.', example: '这是一只猫。', examplePinyin: 'zhè shì yì zhī māo', exampleEnglish: 'This is a cat.' },
  { kind: 'animal', hanzi: '狗', pinyin: 'gǒu', english: 'Dog', emoji: '🐶', note: 'Third tone: dipping tone.', example: '这是一只狗。', examplePinyin: 'zhè shì yì zhī gǒu', exampleEnglish: 'This is a dog.' },
  { kind: 'animal', hanzi: '牛', pinyin: 'niú', english: 'Cow', emoji: '🐮', note: 'Second tone: rising tone.', example: '这是一头牛。', examplePinyin: 'zhè shì yì tóu niú', exampleEnglish: 'This is a cow.' },
  { kind: 'animal', hanzi: '马', pinyin: 'mǎ', english: 'Horse', emoji: '🐴', note: 'Third tone: dipping tone.', example: '这是一匹马。', examplePinyin: 'zhè shì yì pǐ mǎ', exampleEnglish: 'This is a horse.' },
  { kind: 'animal', hanzi: '鸟', pinyin: 'niǎo', english: 'Bird', emoji: '🐦', note: 'Third tone: dipping tone.', example: '这是一只鸟。', examplePinyin: 'zhè shì yì zhī niǎo', exampleEnglish: 'This is a bird.' },
  { kind: 'animal', hanzi: '鱼', pinyin: 'yú', english: 'Fish', emoji: '🐟', note: 'Second tone: rising tone.', example: '这是一条鱼。', examplePinyin: 'zhè shì yì tiáo yú', exampleEnglish: 'This is a fish.' },
  { kind: 'animal', hanzi: '狮子', pinyin: 'shīzi', english: 'Lion', emoji: '🦁', note: 'The second syllable zi has a neutral tone.', example: '这是一头狮子。', examplePinyin: 'zhè shì yì tóu shīzi', exampleEnglish: 'This is a lion.' },
  { kind: 'animal', hanzi: '大象', pinyin: 'dàxiàng', english: 'Elephant', emoji: '🐘', note: 'Both syllables have fourth tones.', example: '这是一头大象。', examplePinyin: 'zhè shì yì tóu dàxiàng', exampleEnglish: 'This is an elephant.' },
  { kind: 'animal', hanzi: '兔子', pinyin: 'tùzi', english: 'Rabbit', emoji: '🐰', note: 'The second syllable zi has a neutral tone.', example: '这是一只兔子。', examplePinyin: 'zhè shì yì zhī tùzi', exampleEnglish: 'This is a rabbit.' },
  { kind: 'animal', hanzi: '鸭子', pinyin: 'yāzi', english: 'Duck', emoji: '🦆', note: 'The first syllable is first tone; zi is neutral.', example: '这是一只鸭子。', examplePinyin: 'zhè shì yì zhī yāzi', exampleEnglish: 'This is a duck.' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function MandarinAnimalsLesson() {
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
        <Text style={styles.heading}>动物 🐼</Text>
        <Text style={styles.subtitle}>Animals • Meet your animal friends in Mandarin!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>太棒了！</Text>
            <Text style={styles.english}>Amazing! You learned {CARDS.length} animal names in Mandarin!</Text>
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
              <Text style={styles.kind}>{'🐾 ANIMAL FRIENDS'}</Text>
              <View style={styles.characterCircle}>
                <Text style={styles.hanzi}>{current.hanzi}</Text>
              </View>
              <Text style={styles.pinyin}>{current.pinyin}</Text>
              <Text style={styles.emoji}>{current.emoji}</Text>
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
