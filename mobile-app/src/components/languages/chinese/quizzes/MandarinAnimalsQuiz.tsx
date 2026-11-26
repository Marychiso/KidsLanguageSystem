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

// 15 questions based on the 10 animals in MandarinAnimalsLesson.
// Level 1: read Chinese and identify an emoji. Level 2: identify written Chinese.
// Level 3: understand short Mandarin animal sentences.
// Paw prints represent the animal category without revealing the answer.
const QUESTIONS: readonly Question[] = [
  // LEVEL 1 — Match a Mandarin animal to its picture.
  { level: 1, prompt: 'Which animal is 猫 (māo)?', spokenPrompt: '猫。请选择正确的动物。', choices: ['🐶', '🐱', '🐴', '🐰'], correct: '🐱', answerHanzi: '猫', answerPinyin: 'māo', answerEnglish: 'Cat', answerEmoji: '🐱' },
  { level: 1, prompt: 'Which animal is 狗 (gǒu)?', spokenPrompt: '狗。请选择正确的动物。', choices: ['🐟', '🐮', '🐶', '🐦'], correct: '🐶', answerHanzi: '狗', answerPinyin: 'gǒu', answerEnglish: 'Dog', answerEmoji: '🐶' },
  { level: 1, prompt: 'Which animal is 马 (mǎ)?', spokenPrompt: '马。请选择正确的动物。', choices: ['🐴', '🐰', '🦆', '🐱'], correct: '🐴', answerHanzi: '马', answerPinyin: 'mǎ', answerEnglish: 'Horse', answerEmoji: '🐴' },
  { level: 1, prompt: 'Which animal is 鸟 (niǎo)?', spokenPrompt: '鸟。请选择正确的动物。', choices: ['🐘', '🐟', '🦁', '🐦'], correct: '🐦', answerHanzi: '鸟', answerPinyin: 'niǎo', answerEnglish: 'Bird', answerEmoji: '🐦' },
  { level: 1, prompt: 'Which animal is 鱼 (yú)?', spokenPrompt: '鱼。请选择正确的动物。', choices: ['🐮', '🐟', '🦆', '🐶'], correct: '🐟', answerHanzi: '鱼', answerPinyin: 'yú', answerEnglish: 'Fish', answerEmoji: '🐟' },

  // LEVEL 2 — Match an English animal to the Mandarin characters.
  // Spoken prompts intentionally do not say the Chinese answer.
  { level: 2, prompt: 'Which Chinese word means cow? 🐮', spokenPrompt: '请选择正确的中文动物名称。', choices: ['马', '牛', '狗', '猫'], correct: '牛', answerHanzi: '牛', answerPinyin: 'niú', answerEnglish: 'Cow', answerEmoji: '🐮' },
  { level: 2, prompt: 'Which Chinese word means lion? 🦁', spokenPrompt: '请选择正确的中文动物名称。', choices: ['兔子', '鸭子', '狮子', '大象'], correct: '狮子', answerHanzi: '狮子', answerPinyin: 'shīzi', answerEnglish: 'Lion', answerEmoji: '🦁' },
  { level: 2, prompt: 'Which Chinese word means elephant? 🐘', spokenPrompt: '请选择正确的中文动物名称。', choices: ['大象', '狮子', '兔子', '鸭子'], correct: '大象', answerHanzi: '大象', answerPinyin: 'dàxiàng', answerEnglish: 'Elephant', answerEmoji: '🐘' },
  { level: 2, prompt: 'Which Chinese word means rabbit? 🐰', spokenPrompt: '请选择正确的中文动物名称。', choices: ['鸟', '马', '鱼', '兔子'], correct: '兔子', answerHanzi: '兔子', answerPinyin: 'tùzi', answerEnglish: 'Rabbit', answerEmoji: '🐰' },
  { level: 2, prompt: 'Which Chinese word means duck? 🦆', spokenPrompt: '请选择正确的中文动物名称。', choices: ['鸭子', '狮子', '猫', '牛'], correct: '鸭子', answerHanzi: '鸭子', answerPinyin: 'yāzi', answerEnglish: 'Duck', answerEmoji: '🦆' },

  // LEVEL 3 — Read or listen to the sentences taught in Mandarin Animals.
  { level: 3, prompt: '“这是一只猫。” (Zhè shì yì zhī māo.) Which animal is it?', spokenPrompt: '这是一只猫。', choices: ['Dog 🐶', 'Cat 🐱', 'Duck 🦆', 'Bird 🐦'], correct: 'Cat 🐱', answerHanzi: '猫', answerPinyin: 'māo', answerEnglish: 'Cat', answerEmoji: '🐱' },
  { level: 3, prompt: '“这是一头牛。” (Zhè shì yì tóu niú.) Which animal is it?', spokenPrompt: '这是一头牛。', choices: ['Horse 🐴', 'Lion 🦁', 'Cow 🐮', 'Elephant 🐘'], correct: 'Cow 🐮', answerHanzi: '牛', answerPinyin: 'niú', answerEnglish: 'Cow', answerEmoji: '🐮' },
  { level: 3, prompt: '“这是一头狮子。” (Zhè shì yì tóu shīzi.) Which animal is it?', spokenPrompt: '这是一头狮子。', choices: ['Lion 🦁', 'Rabbit 🐰', 'Elephant 🐘', 'Dog 🐶'], correct: 'Lion 🦁', answerHanzi: '狮子', answerPinyin: 'shīzi', answerEnglish: 'Lion', answerEmoji: '🦁' },
  { level: 3, prompt: '“这是一只兔子。” (Zhè shì yì zhī tùzi.) Which animal is it?', spokenPrompt: '这是一只兔子。', choices: ['Cat 🐱', 'Duck 🦆', 'Bird 🐦', 'Rabbit 🐰'], correct: 'Rabbit 🐰', answerHanzi: '兔子', answerPinyin: 'tùzi', answerEnglish: 'Rabbit', answerEmoji: '🐰' },
  { level: 3, prompt: '“这是一条鱼。” (Zhè shì yì tiáo yú.) Which animal is it?', spokenPrompt: '这是一条鱼。', choices: ['Bird 🐦', 'Fish 🐟', 'Horse 🐴', 'Dog 🐶'], correct: 'Fish 🐟', answerHanzi: '鱼', answerPinyin: 'yú', answerEnglish: 'Fish', answerEmoji: '🐟' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Recognize animals', 'Match Mandarin words', 'Understand animal sentences'];

export default function MandarinAnimalsQuiz() {
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
        <Text style={styles.heading}>动物 Quiz 🐼</Text>
        <Text style={styles.subtitle}>Recognize animals, words, and simple Mandarin sentences!</Text>

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
              <Text style={styles.quizEmoji}>{selected === null ? '🐾' : question.answerEmoji}</Text>
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
