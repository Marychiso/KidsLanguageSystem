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
  answerHanzi: string;
  answerPinyin: string;
  answerEnglish: string;
  answerEmoji: string;
};

// 15 questions based on MandarinFruitsLesson (10 fruits).
// Level 1: match Chinese names to illustrated fruit choices.
// Level 2: choose written Hanzi from an English fruit meaning.
// Level 3: understand short Mandarin sentences from the lesson.
// The neutral fruit basket is used until a child answers; the answer fruit appears afterward.
const QUESTIONS: readonly Question[] = [
  // LEVEL 1 — identify fruits by their Chinese names.
  { level: 1, prompt: 'Which fruit is 苹果 (píngguǒ)?', spokenPrompt: '苹果。请选择正确的水果。', choices: ['🍌 Banana', '🍎 Apple', '🍐 Pear', '🍑 Peach'], correct: '🍎 Apple', answerHanzi: '苹果', answerPinyin: 'píngguǒ', answerEnglish: 'Apple', answerEmoji: '🍎' },
  { level: 1, prompt: 'Which fruit is 香蕉 (xiāngjiāo)?', spokenPrompt: '香蕉。请选择正确的水果。', choices: ['🍓 Strawberry', '🍇 Grapes', '🍌 Banana', '🍍 Pineapple'], correct: '🍌 Banana', answerHanzi: '香蕉', answerPinyin: 'xiāngjiāo', answerEnglish: 'Banana', answerEmoji: '🍌' },
  { level: 1, prompt: 'Which fruit is 草莓 (cǎoméi)?', spokenPrompt: '草莓。请选择正确的水果。', choices: ['🍓 Strawberry', '🍒 Cherry', '🍎 Apple', '🍊 Orange'], correct: '🍓 Strawberry', answerHanzi: '草莓', answerPinyin: 'cǎoméi', answerEnglish: 'Strawberry', answerEmoji: '🍓' },
  { level: 1, prompt: 'Which fruit is 西瓜 (xīguā)?', spokenPrompt: '西瓜。请选择正确的水果。', choices: ['🍐 Pear', '🍊 Orange', '🍑 Peach', '🍉 Watermelon'], correct: '🍉 Watermelon', answerHanzi: '西瓜', answerPinyin: 'xīguā', answerEnglish: 'Watermelon', answerEmoji: '🍉' },
  { level: 1, prompt: 'Which fruit is 葡萄 (pútao)?', spokenPrompt: '葡萄。请选择正确的水果。', choices: ['🍒 Cherry', '🍇 Grapes', '🍍 Pineapple', '🍓 Strawberry'], correct: '🍇 Grapes', answerHanzi: '葡萄', answerPinyin: 'pútao', answerEnglish: 'Grapes', answerEmoji: '🍇' },
  // LEVEL 2 — match English fruit names to Chinese characters.
  { level: 2, prompt: 'Which Chinese word means orange? 🍊', spokenPrompt: '请选择正确的中文水果名称。', choices: ['桃子', '橙子', '梨', '苹果'], correct: '橙子', answerHanzi: '橙子', answerPinyin: 'chéngzi', answerEnglish: 'Orange', answerEmoji: '🍊' },
  { level: 2, prompt: 'Which Chinese word means pear? 🍐', spokenPrompt: '请选择正确的中文水果名称。', choices: ['梨', '草莓', '樱桃', '菠萝'], correct: '梨', answerHanzi: '梨', answerPinyin: 'lí', answerEnglish: 'Pear', answerEmoji: '🍐' },
  { level: 2, prompt: 'Which Chinese word means pineapple? 🍍', spokenPrompt: '请选择正确的中文水果名称。', choices: ['葡萄', '香蕉', '菠萝', '西瓜'], correct: '菠萝', answerHanzi: '菠萝', answerPinyin: 'bōluó', answerEnglish: 'Pineapple', answerEmoji: '🍍' },
  { level: 2, prompt: 'Which Chinese word means cherry? 🍒', spokenPrompt: '请选择正确的中文水果名称。', choices: ['橙子', '桃子', '苹果', '樱桃'], correct: '樱桃', answerHanzi: '樱桃', answerPinyin: 'yīngtáo', answerEnglish: 'Cherry', answerEmoji: '🍒' },
  { level: 2, prompt: 'Which Chinese word means peach? 🍑', spokenPrompt: '请选择正确的中文水果名称。', choices: ['桃子', '草莓', '梨', '葡萄'], correct: '桃子', answerHanzi: '桃子', answerPinyin: 'táozi', answerEnglish: 'Peach', answerEmoji: '🍑' },
  // LEVEL 3 — read lesson sentences and identify the fruit discussed.
  { level: 3, prompt: '“香蕉是黄色的。” (Xiāngjiāo shì huángsè de.) Which fruit is yellow?', spokenPrompt: '香蕉是黄色的。', choices: ['🍎 Apple', '🍌 Banana', '🍇 Grapes', '🍓 Strawberry'], correct: '🍌 Banana', answerHanzi: '香蕉', answerPinyin: 'xiāngjiāo', answerEnglish: 'Banana', answerEmoji: '🍌' },
  { level: 3, prompt: '“西瓜很大。” (Xīguā hěn dà.) Which fruit is big?', spokenPrompt: '西瓜很大。', choices: ['🍒 Cherry', '🍐 Pear', '🍑 Peach', '🍉 Watermelon'], correct: '🍉 Watermelon', answerHanzi: '西瓜', answerPinyin: 'xīguā', answerEnglish: 'Watermelon', answerEmoji: '🍉' },
  { level: 3, prompt: '“草莓是红色的。” (Cǎoméi shì hóngsè de.) Which fruit is red?', spokenPrompt: '草莓是红色的。', choices: ['🍓 Strawberry', '🍌 Banana', '🍍 Pineapple', '🍐 Pear'], correct: '🍓 Strawberry', answerHanzi: '草莓', answerPinyin: 'cǎoméi', answerEnglish: 'Strawberry', answerEmoji: '🍓' },
  { level: 3, prompt: '“樱桃很小。” (Yīngtáo hěn xiǎo.) Which fruit is small?', spokenPrompt: '樱桃很小。', choices: ['🍊 Orange', '🍉 Watermelon', '🍒 Cherry', '🍍 Pineapple'], correct: '🍒 Cherry', answerHanzi: '樱桃', answerPinyin: 'yīngtáo', answerEnglish: 'Cherry', answerEmoji: '🍒' },
  { level: 3, prompt: '“葡萄很好吃。” (Pútao hěn hǎochī.) Which fruit is delicious?', spokenPrompt: '葡萄很好吃。', choices: ['🍎 Apple', '🍇 Grapes', '🍑 Peach', '🍊 Orange'], correct: '🍇 Grapes', answerHanzi: '葡萄', answerPinyin: 'pútao', answerEnglish: 'Grapes', answerEmoji: '🍇' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Recognize fruits', 'Match fruit words', 'Understand fruit sentences'];

export default function MandarinFruitsQuiz() {
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
    speak(correct ? `太棒了！答对了！${question.answerHanzi}。` : `继续加油！正确答案是${question.answerHanzi}。`, nextQuestion);
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
        <Text style={styles.heading}>水果 Quiz 🍓</Text>
        <Text style={styles.subtitle}>Recognize fruits, words, and simple Mandarin sentences!</Text>

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
              <Text style={styles.quizEmoji}>{selected === null ? '🧺' : question.answerEmoji}</Text>
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
                  {selected === question.correct ? '🌟 太棒了！' : '💗 Good try!'}{'\n'}{question.answerEmoji} {question.answerHanzi} ({question.answerPinyin}) — {question.answerEnglish}
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
  questionTitle: { fontSize: 21, color: DARK, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  listenButton: { backgroundColor: '#E8F4FF', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, marginVertical: 20 },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 16 },
  answers: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  answer: { width: '47%', minHeight: 95, borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 12 },
  answerText: { fontSize: 21, fontWeight: '900', color: PURPLE, textAlign: 'center' },
  tick: { fontSize: 21, fontWeight: '900', color: '#338957' },
  feedback: { marginTop: 20, fontSize: 17, fontWeight: '800', textAlign: 'center', color: PURPLE },
  result: { fontSize: 48, fontWeight: '900', color: PURPLE, marginTop: 16 },
  helper: { color: '#766E8D', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
});
