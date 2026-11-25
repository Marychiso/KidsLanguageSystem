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

// Fifteen questions using the ten animals taught in Spanish Animals.
// Level 1: recognize Spanish names; Level 2: translate into Spanish;
// Level 3: apply knowledge of animal sounds and characteristics.
const QUESTIONS: readonly Question[] = [
  { level: 1, prompt: 'Which animal is “Gato”?', spokenPrompt: '¿Cuál es el gato?', choices: ['🐶 Dog', '🐱 Cat', '🐦 Bird', '🐟 Fish'], correct: '🐱 Cat' },
  { level: 1, prompt: 'Which animal is “Perro”?', spokenPrompt: '¿Cuál es el perro?', choices: ['🐰 Rabbit', '🐶 Dog', '🐮 Cow', '🦆 Duck'], correct: '🐶 Dog' },
  { level: 1, prompt: 'Which animal is “Vaca”?', spokenPrompt: '¿Cuál es la vaca?', choices: ['🐴 Horse', '🦁 Lion', '🐮 Cow', '🐘 Elephant'], correct: '🐮 Cow' },
  { level: 1, prompt: 'Which animal is “Pájaro”?', spokenPrompt: '¿Cuál es el pájaro?', choices: ['🐦 Bird', '🐟 Fish', '🐱 Cat', '🐰 Rabbit'], correct: '🐦 Bird' },
  { level: 1, prompt: 'Which animal is “León”?', spokenPrompt: '¿Cuál es el león?', choices: ['🐘 Elephant', '🦁 Lion', '🐴 Horse', '🐶 Dog'], correct: '🦁 Lion' },

  { level: 2, prompt: '🐴 What is “horse” in Spanish?', spokenPrompt: 'Mira el dibujo y elige la palabra correcta en español.', choices: ['Conejo', 'Pato', 'Caballo', 'Perro'], correct: 'Caballo' },
  { level: 2, prompt: '🐟 What is “fish” in Spanish?', spokenPrompt: 'Mira el dibujo y elige la palabra correcta en español.', choices: ['Pez', 'León', 'Gato', 'Vaca'], correct: 'Pez' },
  { level: 2, prompt: '🐘 What is “elephant” in Spanish?', spokenPrompt: 'Mira el dibujo y elige la palabra correcta en español.', choices: ['Pájaro', 'Caballo', 'Conejo', 'Elefante'], correct: 'Elefante' },
  { level: 2, prompt: '🐰 What is “rabbit” in Spanish?', spokenPrompt: 'Mira el dibujo y elige la palabra correcta en español.', choices: ['Pato', 'Conejo', 'Perro', 'Pez'], correct: 'Conejo' },
  { level: 2, prompt: '🦆 What is “duck” in Spanish?', spokenPrompt: 'Mira el dibujo y elige la palabra correcta en español.', choices: ['Vaca', 'León', 'Pato', 'Gato'], correct: 'Pato' },

  { level: 3, prompt: 'Which animal says “miau” in Spanish?', spokenPrompt: '¿Qué animal dice miau?', choices: ['Perro', 'Gato', 'Pato', 'Vaca'], correct: 'Gato' },
  { level: 3, prompt: 'Which animal says “guau guau”?', spokenPrompt: '¿Qué animal dice guau guau?', choices: ['Pájaro', 'Conejo', 'Perro', 'Pez'], correct: 'Perro' },
  { level: 3, prompt: 'Which animal lives in water and has fins?', spokenPrompt: '¿Qué animal vive en el agua y tiene aletas?', choices: ['Pez', 'Caballo', 'León', 'Conejo'], correct: 'Pez' },
  { level: 3, prompt: 'Which animal has a long trunk?', spokenPrompt: '¿Qué animal tiene una trompa larga?', choices: ['Vaca', 'Pato', 'Elefante', 'Gato'], correct: 'Elefante' },
  { level: 3, prompt: 'Which animal has long ears and hops?', spokenPrompt: '¿Qué animal tiene orejas largas y salta?', choices: ['León', 'Pájaro', 'Caballo', 'Conejo'], correct: 'Conejo' },
];

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';
const LEVEL_NAMES = ['Meet the animals', 'Spanish animal names', 'Animal challenge'];

export default function SpanishAnimalsQuiz() {
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
        <Text style={styles.heading}>Animales Test 🇪🇸</Text>
        <Text style={styles.subtitle}>Listen carefully and choose the right animal!</Text>

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
              <Text style={styles.quizEmoji}>🐾</Text>
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
                <Text style={styles.feedback}>
                  {selected === question.correct ? '🌟 ¡Muy bien!' : `💗 Good try! The answer is ${question.correct}.`}
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
  answerText: { fontSize: 23, fontWeight: '900', color: PURPLE },
  tick: { fontSize: 21, fontWeight: '900', color: '#338957' },
  feedback: { marginTop: 20, fontSize: 17, fontWeight: '800', textAlign: 'center', color: PURPLE },
  result: { fontSize: 48, fontWeight: '900', color: PURPLE, marginTop: 16 },
  helper: { color: '#766E8D', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', marginTop: 14, minWidth: 190 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
});
