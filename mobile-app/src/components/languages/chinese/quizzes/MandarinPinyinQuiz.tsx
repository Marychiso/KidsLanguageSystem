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

type Question = {
  level: number;
  prompt: string;
  spokenPrompt: string;
  choices: readonly string[];
  correct: string;
};

// Fifteen questions: Pinyin pronunciation, familiar characters, and four tones.
// Speech reads Chinese characters, never romanized Pinyin for the quiz prompt.
const QUESTIONS: readonly Question[] = [
  // Level 1: Choose the correctly tone-marked Pinyin for a written Chinese character.
  { level: 1, prompt: 'Choose the Pinyin for 猫 (cat) 🐱', spokenPrompt: '请选择正确的拼音。猫。', choices: ['máo', 'mào', 'māo', 'mǎo'], correct: 'māo' },
  { level: 1, prompt: 'Choose the Pinyin for 狗 (dog) 🐶', spokenPrompt: '请选择正确的拼音。狗。', choices: ['gòu', 'gǒu', 'gōu', 'góu'], correct: 'gǒu' },
  { level: 1, prompt: 'Choose the Pinyin for 水 (water) 💧', spokenPrompt: '请选择正确的拼音。水。', choices: ['shuì', 'shuī', 'shuí', 'shuǐ'], correct: 'shuǐ' },
  { level: 1, prompt: 'Choose the Pinyin for 花 (flower) 🌸', spokenPrompt: '请选择正确的拼音。花。', choices: ['huā', 'huá', 'huǎ', 'huà'], correct: 'huā' },
  { level: 1, prompt: 'Choose the Pinyin for 马 (horse) 🐴', spokenPrompt: '请选择正确的拼音。马。', choices: ['mā', 'mà', 'mǎ', 'má'], correct: 'mǎ' },

  // Level 2: Match familiar characters with the meanings taught in the lesson.
  { level: 2, prompt: 'What does 你 (nǐ) mean?', spokenPrompt: '你。这个字是什么意思？', choices: ['I / me', 'Good', 'You', 'Dad'], correct: 'You' },
  { level: 2, prompt: 'What does 我 (wǒ) mean?', spokenPrompt: '我。这个字是什么意思？', choices: ['I / me', 'Water', 'You', 'One'], correct: 'I / me' },
  { level: 2, prompt: 'What does 好 (hǎo) mean?', spokenPrompt: '好。这个字是什么意思？', choices: ['Flower', 'Dad', 'Horse', 'Good'], correct: 'Good' },
  { level: 2, prompt: 'What does 爸爸 (bàba) mean?', spokenPrompt: '爸爸。这个词是什么意思？', choices: ['Mom', 'Dad', 'Dog', 'You'], correct: 'Dad' },
  { level: 2, prompt: 'What does 三 (sān) mean?', spokenPrompt: '三。这个字是什么意思？', choices: ['Six', 'Two', 'Three', 'Five'], correct: 'Three' },

  // Level 3: Recognize all four Mandarin tones using Pinyin from the lesson.
  { level: 3, prompt: 'Which tone is mā (妈)?', spokenPrompt: '妈。请看拼音的声调。', choices: ['Second tone ↗', 'Fourth tone ↘', 'Third tone ↘↗', 'First tone →'], correct: 'First tone →' },
  { level: 3, prompt: 'Which tone is má (麻)?', spokenPrompt: '麻。请看拼音的声调。', choices: ['Second tone ↗', 'First tone →', 'Fourth tone ↘', 'Third tone ↘↗'], correct: 'Second tone ↗' },
  { level: 3, prompt: 'Which tone is mǎ (马)?', spokenPrompt: '马。请看拼音的声调。', choices: ['Fourth tone ↘', 'Third tone ↘↗', 'First tone →', 'Second tone ↗'], correct: 'Third tone ↘↗' },
  { level: 3, prompt: 'Which tone is mà (骂)?', spokenPrompt: '骂。请看拼音的声调。', choices: ['Third tone ↘↗', 'First tone →', 'Fourth tone ↘', 'Second tone ↗'], correct: 'Fourth tone ↘' },
  { level: 3, prompt: 'Which Pinyin uses the fourth tone for 二 (two)?', spokenPrompt: '二。请选择正确的拼音。', choices: ['ěr', 'ér', 'ēr', 'èr'], correct: 'èr' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Pinyin recognition', 'Character meanings', 'Mandarin tone challenge'];

export default function MandarinPinyinQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = QUESTIONS[index];

  const clearNarration = useCallback(() => {
    runId.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    void Speech.stop();
  }, []);

  useEffect(() => () => clearNarration(), [clearNarration]);

  const speak = useCallback((words: string, onDone?: () => void) => {
    clearNarration();
    const id = runId.current;
    if (!soundOn) {
      if (onDone) timer.current = setTimeout(() => {
        if (runId.current === id) onDone();
      }, 1050);
      return;
    }
    // A modest delay avoids clipping the beginning of speech on mobile.
    timer.current = setTimeout(() => {
      if (runId.current !== id) return;
      Speech.speak(words, {
        language: 'zh-CN', rate: 0.72, pitch: 1,
        onDone: () => {
          if (runId.current !== id || !onDone) return;
          timer.current = setTimeout(() => {
            if (runId.current === id) onDone();
          }, 750);
        },
        onError: () => {
          if (runId.current !== id || !onDone) return;
          timer.current = setTimeout(() => {
            if (runId.current === id) onDone();
          }, 1100);
        },
      });
    }, 350);
  }, [clearNarration, soundOn]);

  useEffect(() => {
    if (!finished) speak(question.spokenPrompt);
    return () => clearNarration();
  }, [index, finished, soundOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextQuestion = () => {
    if (index === QUESTIONS.length - 1) setFinished(true);
    else setIndex(i => i + 1);
    setSelected(null);
  };

  const choose = (answer: string) => {
    if (selected !== null || finished) return;
    setSelected(answer);
    const correct = answer === question.correct;
    if (correct) setScore(s => s + 1);
    // Feedback finishes before the next question appears.
    speak(correct ? '太棒了！答对了！' : '继续加油！再接再厉！', nextQuestion);
  };

  const goBack = () => {
    clearNarration();
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/mary/categories', params: { language: 'chinese', activity: 'quizzes' } });
  };

  const startAgain = () => {
    clearNarration();
    setScore(0);
    setIndex(0);
    setSelected(null);
    setFinished(false);
  };

  const toggleSound = () => {
    clearNarration();
    setSoundOn(v => !v);
  };

  const level = Math.floor(index / 5) + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={goBack} style={styles.smallButton} accessibilityRole="button">
            <Text style={styles.smallButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSound} style={styles.smallButton} accessibilityRole="button">
            <Text style={styles.smallButtonText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>中文 • MANDARIN CHINESE</Text>
        <Text style={styles.heading}>拼音与声调 Quiz 🇨🇳</Text>
        <Text style={styles.subtitle}>Practise Pinyin, meanings, and Mandarin tones!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.emoji}>🏆🎉🌟</Text>
            <Text style={styles.questionTitle}>太棒了！</Text>
            <Text style={styles.result}>{score} / {QUESTIONS.length}</Text>
            <Text style={styles.helper}>You finished all three levels!</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={startAgain} accessibilityRole="button">
              <Text style={styles.primaryText}>🔁 Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={goBack} accessibilityRole="button">
              <Text style={styles.secondaryText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Question {index + 1} of {QUESTIONS.length}</Text>
              <Text style={styles.progressText}>⭐ {score} points</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((index + 1) / QUESTIONS.length) * 100}%` }]} />
            </View>
            <Text style={styles.level}>LEVEL {level} · {LEVEL_NAMES[level - 1]}</Text>
            <View style={styles.card}>
              <Text style={styles.quizEmoji}>🀄</Text>
              <Text style={styles.questionTitle}>{question.prompt}</Text>
              <TouchableOpacity onPress={() => speak(question.spokenPrompt)} disabled={selected !== null} style={styles.listenButton} accessibilityRole="button">
                <Text style={styles.listenText}>🔊 Hear Mandarin</Text>
              </TouchableOpacity>
              <View style={styles.answers}>
                {question.choices.map((answer) => {
                  const answered = selected !== null;
                  const isCorrect = answer === question.correct;
                  const chosen = selected === answer;
                  const background = answered && isCorrect ? '#DDF5E4' : answered && chosen ? '#FFE3E3' : '#F0E9FF';
                  return (
                    <TouchableOpacity
                      key={answer}
                      onPress={() => choose(answer)}
                      disabled={answered}
                      style={[styles.answer, { backgroundColor: background }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Answer ${answer}`}
                    >
                      <Text style={styles.answerText}>{answer}</Text>
                      {answered && isCorrect && <Text style={styles.tick}>✓</Text>}
                      {answered && chosen && !isCorrect && <Text style={styles.tick}>✕</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selected !== null && (
                <Text style={styles.feedback}>
                  {selected === question.correct ? '🌟 太棒了！' : `💗 Good try! Answer: ${question.correct}`}
                </Text>
              )}
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  smallButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  smallButtonText: { color: PURPLE, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: PURPLE, fontWeight: '800', letterSpacing: 2, textAlign: 'center', fontSize: 12 },
  heading: { color: DARK, fontWeight: '900', textAlign: 'center', fontSize: 29, marginTop: 8 },
  subtitle: { color: '#766E8D', textAlign: 'center', fontSize: 15, marginTop: 8, marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  progressText: { color: '#6C6282', fontWeight: '700' },
  track: { backgroundColor: '#E1D8F7', height: 11, borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  fill: { backgroundColor: '#8C71D9', height: '100%', borderRadius: 12 },
  level: { color: PURPLE, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center', shadowColor: '#9276CA', shadowOpacity: 0.11, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  quizEmoji: { fontSize: 66, marginBottom: 10 },
  emoji: { fontSize: 60, marginVertical: 20 },
  questionTitle: { fontSize: 23, color: DARK, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  listenButton: { backgroundColor: '#E8F4FF', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, marginVertical: 20 },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 16 },
  answers: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  answer: { width: '47%', minHeight: 95, borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 12 },
  answerText: { fontSize: 23, fontWeight: '900', color: PURPLE, textAlign: 'center' },
  tick: { fontSize: 21, fontWeight: '900', color: '#338957' },
  feedback: { marginTop: 20, fontSize: 17, fontWeight: '800', textAlign: 'center', color: PURPLE },
  result: { fontSize: 48, fontWeight: '900', color: PURPLE, marginTop: 16 },
  helper: { color: '#766E8D', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
});
