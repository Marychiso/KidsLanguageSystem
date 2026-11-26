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

// 15 questions based on the 10 MandarinColorsLesson colors.
// Level 1: identify displayed colors; Level 2: match written Chinese;
// Level 3: understand familiar lesson sentences.
// The neutral paint palette avoids revealing the correct answer.
const QUESTIONS: readonly Question[] = [
  // LEVEL 1: Recognize color words and their matching color icons.
  { level: 1, prompt: 'Which color is 红色 (hóngsè)?', spokenPrompt: '红色。请选择正确的颜色。', choices: ['🔵 Blue', '🔴 Red', '🟢 Green', '🟡 Yellow'], correct: '🔴 Red', answerHanzi: '红色', answerPinyin: 'hóngsè', answerEnglish: 'Red', answerEmoji: '🔴' },
  { level: 1, prompt: 'Which color is 蓝色 (lánsè)?', spokenPrompt: '蓝色。请选择正确的颜色。', choices: ['⚫ Black', '🟣 Purple', '🔵 Blue', '🟠 Orange'], correct: '🔵 Blue', answerHanzi: '蓝色', answerPinyin: 'lánsè', answerEnglish: 'Blue', answerEmoji: '🔵' },
  { level: 1, prompt: 'Which color is 黄色 (huángsè)?', spokenPrompt: '黄色。请选择正确的颜色。', choices: ['🟡 Yellow', '🟢 Green', '🟤 Brown', '🔴 Red'], correct: '🟡 Yellow', answerHanzi: '黄色', answerPinyin: 'huángsè', answerEnglish: 'Yellow', answerEmoji: '🟡' },
  { level: 1, prompt: 'Which color is 绿色 (lǜsè)?', spokenPrompt: '绿色。请选择正确的颜色。', choices: ['🩷 Pink', '🔵 Blue', '🟠 Orange', '🟢 Green'], correct: '🟢 Green', answerHanzi: '绿色', answerPinyin: 'lǜsè', answerEnglish: 'Green', answerEmoji: '🟢' },
  { level: 1, prompt: 'Which color is 黑色 (hēisè)?', spokenPrompt: '黑色。请选择正确的颜色。', choices: ['⚪ White', '🟡 Yellow', '⚫ Black', '🟣 Purple'], correct: '⚫ Black', answerHanzi: '黑色', answerPinyin: 'hēisè', answerEnglish: 'Black', answerEmoji: '⚫' },
  // LEVEL 2: Match English colors to written Chinese. Voice never speaks the answer.
  { level: 2, prompt: 'Which Chinese word means orange? 🟠', spokenPrompt: '请选择正确的中文颜色名称。', choices: ['粉色', '橙色', '绿色', '紫色'], correct: '橙色', answerHanzi: '橙色', answerPinyin: 'chéngsè', answerEnglish: 'Orange', answerEmoji: '🟠' },
  { level: 2, prompt: 'Which Chinese word means purple? 🟣', spokenPrompt: '请选择正确的中文颜色名称。', choices: ['紫色', '红色', '蓝色', '棕色'], correct: '紫色', answerHanzi: '紫色', answerPinyin: 'zǐsè', answerEnglish: 'Purple', answerEmoji: '🟣' },
  { level: 2, prompt: 'Which Chinese word means pink? 🩷', spokenPrompt: '请选择正确的中文颜色名称。', choices: ['黄色', '白色', '棕色', '粉色'], correct: '粉色', answerHanzi: '粉色', answerPinyin: 'fěnsè', answerEnglish: 'Pink', answerEmoji: '🩷' },
  { level: 2, prompt: 'Which Chinese word means white? ⚪', spokenPrompt: '请选择正确的中文颜色名称。', choices: ['黑色', '粉色', '白色', '蓝色'], correct: '白色', answerHanzi: '白色', answerPinyin: 'báisè', answerEnglish: 'White', answerEmoji: '⚪' },
  { level: 2, prompt: 'Which Chinese word means brown? 🟤', spokenPrompt: '请选择正确的中文颜色名称。', choices: ['橙色', '棕色', '绿色', '红色'], correct: '棕色', answerHanzi: '棕色', answerPinyin: 'zōngsè', answerEnglish: 'Brown', answerEmoji: '🟤' },
  // LEVEL 3: Understand color sentences from the Mandarin Colors lesson.
  { level: 3, prompt: '“苹果是红色的。” (Píngguǒ shì hóngsè de.) What color is the apple?', spokenPrompt: '苹果是红色的。', choices: ['Blue 🔵', 'Yellow 🟡', 'Red 🔴', 'Green 🟢'], correct: 'Red 🔴', answerHanzi: '红色', answerPinyin: 'hóngsè', answerEnglish: 'Red', answerEmoji: '🔴' },
  { level: 3, prompt: '“天空是蓝色的。” (Tiānkōng shì lánsè de.) What color is the sky?', spokenPrompt: '天空是蓝色的。', choices: ['Blue 🔵', 'White ⚪', 'Purple 🟣', 'Black ⚫'], correct: 'Blue 🔵', answerHanzi: '蓝色', answerPinyin: 'lánsè', answerEnglish: 'Blue', answerEmoji: '🔵' },
  { level: 3, prompt: '“香蕉是黄色的。” (Xiāngjiāo shì huángsè de.) What color is the banana?', spokenPrompt: '香蕉是黄色的。', choices: ['Pink 🩷', 'Green 🟢', 'Orange 🟠', 'Yellow 🟡'], correct: 'Yellow 🟡', answerHanzi: '黄色', answerPinyin: 'huángsè', answerEnglish: 'Yellow', answerEmoji: '🟡' },
  { level: 3, prompt: '“草是绿色的。” (Cǎo shì lǜsè de.) What color is the grass?', spokenPrompt: '草是绿色的。', choices: ['Brown 🟤', 'Green 🟢', 'Red 🔴', 'Blue 🔵'], correct: 'Green 🟢', answerHanzi: '绿色', answerPinyin: 'lǜsè', answerEnglish: 'Green', answerEmoji: '🟢' },
  { level: 3, prompt: '“雪是白色的。” (Xuě shì báisè de.) What color is the snow?', spokenPrompt: '雪是白色的。', choices: ['Black ⚫', 'Pink 🩷', 'White ⚪', 'Yellow 🟡'], correct: 'White ⚪', answerHanzi: '白色', answerPinyin: 'báisè', answerEnglish: 'White', answerEmoji: '⚪' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Recognize colors', 'Match color words', 'Understand color sentences'];

export default function MandarinColorsQuiz() {
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
        <Text style={styles.heading}>颜色 Quiz 🎨</Text>
        <Text style={styles.subtitle}>Recognize colors, words, and simple Mandarin sentences!</Text>

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
              <Text style={styles.quizEmoji}>{selected === null ? '🎨' : question.answerEmoji}</Text>
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
