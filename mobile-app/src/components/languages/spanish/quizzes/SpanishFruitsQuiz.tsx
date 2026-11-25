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

// Fifteen fruit questions based on Spanish Fruits Lesson.
// Level 1: connect a Spanish fruit to its emoji;
// Level 2: translate English fruit names into Spanish;
// Level 3: understand simple Spanish fruit sentences.
const QUESTIONS: readonly Question[] = [
  { level: 1, prompt: 'Which fruit is “Manzana”?', spokenPrompt: 'Busca la manzana.', choices: ['🍌 Banana', '🍎 Apple', '🍐 Pear', '🍓 Strawberry'], correct: '🍎 Apple' },
  { level: 1, prompt: 'Which fruit is “Plátano”?', spokenPrompt: 'Busca el plátano.', choices: ['🍉 Watermelon', '🍊 Orange', '🍌 Banana', '🍇 Grape'], correct: '🍌 Banana' },
  { level: 1, prompt: 'Which fruit is “Fresa”?', spokenPrompt: 'Busca la fresa.', choices: ['🍓 Strawberry', '🍒 Cherry', '🍑 Peach', '🍍 Pineapple'], correct: '🍓 Strawberry' },
  { level: 1, prompt: 'Which fruit is “Sandía”?', spokenPrompt: 'Busca la sandía.', choices: ['🍐 Pear', '🍉 Watermelon', '🍇 Grape', '🍎 Apple'], correct: '🍉 Watermelon' },
  { level: 1, prompt: 'Which fruit is “Piña”?', spokenPrompt: 'Busca la piña.', choices: ['🍊 Orange', '🍑 Peach', '🍌 Banana', '🍍 Pineapple'], correct: '🍍 Pineapple' },

  { level: 2, prompt: 'What is “grape” in Spanish?', spokenPrompt: 'Elige la palabra en español para grape.', choices: ['Pera', 'Cereza', 'Uva', 'Fresa'], correct: 'Uva' },
  { level: 2, prompt: 'What is “orange” in Spanish?', spokenPrompt: 'Elige la palabra en español para orange.', choices: ['Naranja', 'Manzana', 'Melocotón', 'Sandía'], correct: 'Naranja' },
  { level: 2, prompt: 'What is “pear” in Spanish?', spokenPrompt: 'Elige la palabra en español para pear.', choices: ['Piña', 'Fresa', 'Uva', 'Pera'], correct: 'Pera' },
  { level: 2, prompt: 'What is “cherry” in Spanish?', spokenPrompt: 'Elige la palabra en español para cherry.', choices: ['Manzana', 'Cereza', 'Naranja', 'Plátano'], correct: 'Cereza' },
  { level: 2, prompt: 'What is “peach” in Spanish?', spokenPrompt: 'Elige la palabra en español para peach.', choices: ['Sandía', 'Pera', 'Melocotón', 'Piña'], correct: 'Melocotón' },

  { level: 3, prompt: '“La fresa es dulce.” Which fruit is sweet?', spokenPrompt: 'La fresa es dulce. ¿Qué fruta es dulce?', choices: ['🍇 Uva', '🍓 Fresa', '🍎 Manzana', '🍐 Pera'], correct: '🍓 Fresa' },
  { level: 3, prompt: '“La sandía es grande.” Which fruit is big?', spokenPrompt: 'La sandía es grande. ¿Qué fruta es grande?', choices: ['🍑 Melocotón', '🍒 Cereza', '🍉 Sandía', '🍊 Naranja'], correct: '🍉 Sandía' },
  { level: 3, prompt: '“La pera es verde.” Which fruit is green?', spokenPrompt: 'La pera es verde. ¿Qué fruta es verde?', choices: ['🍐 Pera', '🍍 Piña', '🍌 Plátano', '🍓 Fresa'], correct: '🍐 Pera' },
  { level: 3, prompt: '“La cereza es roja.” Which fruit is red?', spokenPrompt: 'La cereza es roja. ¿Qué fruta es roja?', choices: ['🍇 Uva', '🍊 Naranja', '🍑 Melocotón', '🍒 Cereza'], correct: '🍒 Cereza' },
  { level: 3, prompt: '“El plátano es amarillo.” Which fruit is yellow?', spokenPrompt: 'El plátano es amarillo. ¿Qué fruta es amarilla?', choices: ['🍎 Manzana', '🍌 Plátano', '🍉 Sandía', '🍐 Pera'], correct: '🍌 Plátano' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Recognize the fruits', 'Spanish fruit names', 'Fruit challenge'];

// Show the matching fruit only AFTER a child answers, so the illustration
// reinforces learning without revealing the correct answer beforehand.
const SPANISH_FRUIT_EMOJIS: Record<string, string> = {
  Manzana: '🍎',
  'Plátano': '🍌',
  Naranja: '🍊',
  Fresa: '🍓',
  Uva: '🍇',
  'Sandía': '🍉',
  Pera: '🍐',
  'Piña': '🍍',
  Cereza: '🍒',
  'Melocotón': '🍑',
};

function getCorrectFruitEmoji(answer: string): string {
  const leadingEmoji = answer.split(' ')[0];
  if (leadingEmoji && Object.values(SPANISH_FRUIT_EMOJIS).includes(leadingEmoji)) return leadingEmoji;
  return SPANISH_FRUIT_EMOJIS[answer] ?? '🧺';
}

export default function SpanishFruitsQuiz() {
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
        language: 'es-ES', rate: 0.76, pitch: 1,
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
    speak(correct ? '¡Muy bien! ¡Respuesta correcta!' : 'Buen intento. Sigue practicando.', nextQuestion);
  };

  const goBack = () => {
    clearNarration();
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/mary/categories', params: { language: 'spanish', activity: 'quizzes' } });
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
  const correctFruitEmoji = getCorrectFruitEmoji(question.correct);

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

        <Text style={styles.eyebrow}>ESPAÑOL • SPANISH</Text>
        <Text style={styles.heading}>Frutas Test 🇪🇸</Text>
        <Text style={styles.subtitle}>Listen carefully and choose the right fruit!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.emoji}>🏆🎉🌟</Text>
            <Text style={styles.questionTitle}>¡Excelente!</Text>
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
              <Text style={styles.quizEmoji}>🧺</Text>
              <Text style={styles.questionTitle}>{question.prompt}</Text>
              <TouchableOpacity onPress={() => speak(question.spokenPrompt)} disabled={selected !== null} style={styles.listenButton} accessibilityRole="button">
                <Text style={styles.listenText}>🔊 Hear Spanish</Text>
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
                <View style={styles.feedbackArea}>
                  <Text style={styles.correctFruitEmoji}>{correctFruitEmoji}</Text>
                  <Text style={styles.feedback}>
                    {selected === question.correct ? '🌟 ¡Muy bien!' : `💗 Good try! The answer is ${question.correct}.`}
                  </Text>
                </View>
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
  answerText: { fontSize: 23, fontWeight: '900', color: PURPLE },
  tick: { fontSize: 21, fontWeight: '900', color: '#338957' },
  feedbackArea: { alignItems: 'center', marginTop: 16 },
  correctFruitEmoji: { fontSize: 56 },
  feedback: { marginTop: 8, fontSize: 17, fontWeight: '800', textAlign: 'center', color: PURPLE },
  result: { fontSize: 48, fontWeight: '900', color: PURPLE, marginTop: 16 },
  helper: { color: '#766E8D', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
});
