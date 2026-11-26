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

// 15 questions based on MandarinShapesLesson (10 shapes).
// Level 1: match Chinese shape names to illustrated shape choices.
// Level 2: choose written Hanzi from an English shape meaning.
// Level 3: understand short Mandarin shape sentences from the lesson.
// A neutral puzzle-piece symbol appears until the child answers; the matching shape appears afterward.
const QUESTIONS: readonly Question[] = [
  // LEVEL 1: recognize shapes by Chinese names.
  { level: 1, prompt: 'Which shape is 圆形 (yuánxíng)?', spokenPrompt: '圆形。请选择正确的形状。', choices: ['■ Square', '● Circle', '▲ Triangle', '♥ Heart'], correct: '● Circle', answerHanzi: '圆形', answerPinyin: 'yuánxíng', answerEnglish: 'Circle', answerEmoji: '●' },
  { level: 1, prompt: 'Which shape is 三角形 (sānjiǎoxíng)?', spokenPrompt: '三角形。请选择正确的形状。', choices: ['★ Star', '▭ Rectangle', '▲ Triangle', '● Circle'], correct: '▲ Triangle', answerHanzi: '三角形', answerPinyin: 'sānjiǎoxíng', answerEnglish: 'Triangle', answerEmoji: '▲' },
  { level: 1, prompt: 'Which shape is 正方形 (zhèngfāngxíng)?', spokenPrompt: '正方形。请选择正确的形状。', choices: ['■ Square', '⬢ Hexagon', '◆ Rhombus', '⬭ Oval'], correct: '■ Square', answerHanzi: '正方形', answerPinyin: 'zhèngfāngxíng', answerEnglish: 'Square', answerEmoji: '■' },
  { level: 1, prompt: 'Which shape is 星形 (xīngxíng)?', spokenPrompt: '星形。请选择正确的形状。', choices: ['♥ Heart', '⬟ Pentagon', '⬢ Hexagon', '★ Star'], correct: '★ Star', answerHanzi: '星形', answerPinyin: 'xīngxíng', answerEnglish: 'Star', answerEmoji: '★' },
  { level: 1, prompt: 'Which shape is 心形 (xīnxíng)?', spokenPrompt: '心形。请选择正确的形状。', choices: ['● Circle', '♥ Heart', '▲ Triangle', '◆ Rhombus'], correct: '♥ Heart', answerHanzi: '心形', answerPinyin: 'xīnxíng', answerEnglish: 'Heart', answerEmoji: '♥' },
  // LEVEL 2: match English shape names to Chinese characters.
  { level: 2, prompt: 'Which Chinese word means rectangle? ▭', spokenPrompt: '请选择正确的中文形状名称。', choices: ['正方形', '椭圆形', '长方形', '三角形'], correct: '长方形', answerHanzi: '长方形', answerPinyin: 'chángfāngxíng', answerEnglish: 'Rectangle', answerEmoji: '▭' },
  { level: 2, prompt: 'Which Chinese word means oval? ⬭', spokenPrompt: '请选择正确的中文形状名称。', choices: ['椭圆形', '圆形', '菱形', '心形'], correct: '椭圆形', answerHanzi: '椭圆形', answerPinyin: 'tuǒyuánxíng', answerEnglish: 'Oval', answerEmoji: '⬭' },
  { level: 2, prompt: 'Which Chinese word means rhombus? ◆', spokenPrompt: '请选择正确的中文形状名称。', choices: ['三角形', '五边形', '正方形', '菱形'], correct: '菱形', answerHanzi: '菱形', answerPinyin: 'língxíng', answerEnglish: 'Rhombus', answerEmoji: '◆' },
  { level: 2, prompt: 'Which Chinese word means pentagon? ⬟', spokenPrompt: '请选择正确的中文形状名称。', choices: ['六边形', '五边形', '星形', '长方形'], correct: '五边形', answerHanzi: '五边形', answerPinyin: 'wǔbiānxíng', answerEnglish: 'Pentagon', answerEmoji: '⬟' },
  { level: 2, prompt: 'Which Chinese word means hexagon? ⬢', spokenPrompt: '请选择正确的中文形状名称。', choices: ['菱形', '圆形', '六边形', '五边形'], correct: '六边形', answerHanzi: '六边形', answerPinyin: 'liùbiānxíng', answerEnglish: 'Hexagon', answerEmoji: '⬢' },
  // LEVEL 3: understand short Mandarin sentences from the Shapes lesson.
  { level: 3, prompt: '“圆形没有角。” (Yuánxíng méiyǒu jiǎo.) Which shape has no corners?', spokenPrompt: '圆形没有角。', choices: ['■ Square', '▲ Triangle', '● Circle', '⬟ Pentagon'], correct: '● Circle', answerHanzi: '圆形', answerPinyin: 'yuánxíng', answerEnglish: 'Circle', answerEmoji: '●' },
  { level: 3, prompt: '“三角形有三个角。” (Sānjiǎoxíng yǒu sān ge jiǎo.) Which shape has three corners?', spokenPrompt: '三角形有三个角。', choices: ['⬢ Hexagon', '▲ Triangle', '▭ Rectangle', '● Circle'], correct: '▲ Triangle', answerHanzi: '三角形', answerPinyin: 'sānjiǎoxíng', answerEnglish: 'Triangle', answerEmoji: '▲' },
  { level: 3, prompt: '“五边形有五条边。” (Wǔbiānxíng yǒu wǔ tiáo biān.) Which shape has five sides?', spokenPrompt: '五边形有五条边。', choices: ['⬟ Pentagon', '⬢ Hexagon', '■ Square', '◆ Rhombus'], correct: '⬟ Pentagon', answerHanzi: '五边形', answerPinyin: 'wǔbiānxíng', answerEnglish: 'Pentagon', answerEmoji: '⬟' },
  { level: 3, prompt: '“六边形有六条边。” (Liùbiānxíng yǒu liù tiáo biān.) Which shape has six sides?', spokenPrompt: '六边形有六条边。', choices: ['⬭ Oval', '■ Square', '⬟ Pentagon', '⬢ Hexagon'], correct: '⬢ Hexagon', answerHanzi: '六边形', answerPinyin: 'liùbiānxíng', answerEnglish: 'Hexagon', answerEmoji: '⬢' },
  { level: 3, prompt: '“这是一个心形。” (Zhè shì yí ge xīnxíng.) Which shape is described?', spokenPrompt: '这是一个心形。', choices: ['★ Star', '♥ Heart', '● Circle', '◆ Rhombus'], correct: '♥ Heart', answerHanzi: '心形', answerPinyin: 'xīnxíng', answerEnglish: 'Heart', answerEmoji: '♥' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Recognize shapes', 'Match shape words', 'Understand shape sentences'];

export default function MandarinShapesQuiz() {
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
        <Text style={styles.heading}>形状 Quiz 🔺</Text>
        <Text style={styles.subtitle}>Recognize shapes, Chinese names, and simple Mandarin sentences!</Text>

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
              <Text style={styles.quizEmoji}>{selected === null ? '🧩' : question.answerEmoji}</Text>
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
