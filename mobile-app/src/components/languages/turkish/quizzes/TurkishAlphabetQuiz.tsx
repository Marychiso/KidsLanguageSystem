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
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

type Question = {
  prompt: string;
  speechPrompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

type Level = {
  title: string;
  subtitle: string;
  questions: Question[];
};

// All 29 letters of the Turkish alphabet are supported in the learning content.
// These are 15 sample questions, grouped into three increasingly challenging levels.
const LEVELS: Level[] = [
  {
    title: 'Seviye 1',
    subtitle: 'Find the Turkish letter',
    questions: [
      { prompt: 'Which letter is Ç?', speechPrompt: 'Ç harfini bul.', choices: ['C', 'Ç', 'Ş', 'G'], answer: 'Ç', explanation: 'Ç harfi. Çilek.' },
      { prompt: 'Which letter is Ş?', speechPrompt: 'Ş harfini bul.', choices: ['S', 'Ü', 'Ş', 'Ö'], answer: 'Ş', explanation: 'Ş harfi. Şeker.' },
      { prompt: 'Which letter is Ö?', speechPrompt: 'Ö harfini bul.', choices: ['O', 'Ö', 'U', 'Ü'], answer: 'Ö', explanation: 'Ö harfi. Ördek.' },
      { prompt: 'Which letter is Ü?', speechPrompt: 'Ü harfini bul.', choices: ['U', 'İ', 'Ü', 'I'], answer: 'Ü', explanation: 'Ü harfi. Üzüm.' },
      { prompt: 'Which letter is Ğ?', speechPrompt: 'Yumuşak ge harfini bul.', choices: ['G', 'Ğ', 'Ç', 'J'], answer: 'Ğ', explanation: 'Yumuşak ge. Dağ.' },
    ],
  },
  {
    title: 'Seviye 2',
    subtitle: 'Find the first letter',
    questions: [
      { prompt: 'Elma 🍎 starts with…', speechPrompt: 'Elma hangi harfle başlar?', choices: ['A', 'E', 'İ', 'O'], answer: 'E', explanation: 'Elma, E harfi ile başlar.' },
      { prompt: 'Kedi 🐱 starts with…', speechPrompt: 'Kedi hangi harfle başlar?', choices: ['G', 'K', 'D', 'T'], answer: 'K', explanation: 'Kedi, K harfi ile başlar.' },
      { prompt: 'Çilek 🍓 starts with…', speechPrompt: 'Çilek hangi harfle başlar?', choices: ['C', 'S', 'Ç', 'Ş'], answer: 'Ç', explanation: 'Çilek, Ç harfi ile başlar.' },
      { prompt: 'Üzüm 🍇 starts with…', speechPrompt: 'Üzüm hangi harfle başlar?', choices: ['U', 'Ö', 'O', 'Ü'], answer: 'Ü', explanation: 'Üzüm, Ü harfi ile başlar.' },
      { prompt: 'Şeftali 🍑 starts with…', speechPrompt: 'Şeftali hangi harfle başlar?', choices: ['Ş', 'S', 'Ç', 'Z'], answer: 'Ş', explanation: 'Şeftali, Ş harfi ile başlar.' },
    ],
  },
  {
    title: 'Seviye 3',
    subtitle: 'Turkish alphabet challenge',
    questions: [
      { prompt: 'Which letter comes after C?', speechPrompt: 'C harfinden sonra hangi harf gelir?', choices: ['D', 'Ç', 'E', 'Ş'], answer: 'Ç', explanation: 'C harfinden sonra Ç gelir.' },
      { prompt: 'Which letter comes after G?', speechPrompt: 'G harfinden sonra hangi harf gelir?', choices: ['H', 'İ', 'Ğ', 'I'], answer: 'Ğ', explanation: 'G harfinden sonra Ğ gelir.' },
      { prompt: 'Which is the dotted capital I?', speechPrompt: 'Noktalı büyük i hangisi?', choices: ['I', 'İ', 'J', 'L'], answer: 'İ', explanation: 'Noktalı büyük i, İ harfidir.' },
      { prompt: 'Which letter comes after O?', speechPrompt: 'O harfinden sonra hangi harf gelir?', choices: ['P', 'U', 'Ö', 'Ü'], answer: 'Ö', explanation: 'O harfinden sonra Ö gelir.' },
      { prompt: 'Which letter comes after S?', speechPrompt: 'S harfinden sonra hangi harf gelir?', choices: ['T', 'Ş', 'U', 'Ç'], answer: 'Ş', explanation: 'S harfinden sonra Ş gelir.' },
    ],
  },
];

const PURPLE = '#7956D8';
const TOTAL = LEVELS.reduce((sum, level) => sum + level.questions.length, 0);

export default function TurkishAlphabetQuiz() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [changingLevel, setChangingLevel] = useState(false);

  const mountedRef = useRef(true);
  const sequenceRef = useRef(0);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const level = LEVELS[levelIndex];
  const question = level.questions[questionIndex];
  const completedBefore = LEVELS.slice(0, levelIndex).reduce((sum, l) => sum + l.questions.length, 0);
  const currentNumber = completedBefore + questionIndex + 1;

  const say = useCallback((text: string, onDone?: () => void) => {
    Speech.stop();
    if (mutedRef.current) {
      onDone?.();
      return;
    }
    Speech.speak(text, {
      language: 'tr-TR',
      rate: 0.82,
      pitch: 1.0,
      onDone: () => {
        if (mountedRef.current) onDone?.();
      },
      onStopped: () => {},
      onError: () => {
        if (mountedRef.current) onDone?.();
      },
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      sequenceRef.current += 1;
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (finished || changingLevel || selected !== null) return;
    say(question.speechPrompt);
    // The question is intentionally read only when we enter a new card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, questionIndex, finished, changingLevel]);

  const moveForward = useCallback(() => {
    setSelected(null);
    if (questionIndex + 1 < LEVELS[levelIndex].questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else if (levelIndex + 1 < LEVELS.length) {
      setChangingLevel(true);
    } else {
      setFinished(true);
    }
  }, [levelIndex, questionIndex]);

  const choose = (choice: string) => {
    if (selected !== null || changingLevel || finished) return;
    setSelected(choice);
    const correct = choice === question.answer;
    if (correct) setScore((prev) => prev + 1);

    const thisSequence = ++sequenceRef.current;
    const feedback = correct
      ? `Aferin! ${question.explanation}`
      : `Güzel deneme. Doğru cevap ${question.answer}. ${question.explanation}`;

    say(feedback, () => {
      if (thisSequence !== sequenceRef.current) return;
      moveForward();
    });
  };

  const replay = () => {
    if (selected !== null || changingLevel || finished) return;
    say(question.speechPrompt);
  };

  const toggleSound = () => {
    if (!muted) {
      Speech.stop();
      setMuted(true);
      // If feedback is playing, let the child advance even when muting it.
      if (selected !== null) {
        sequenceRef.current += 1;
        moveForward();
      }
    } else {
      setMuted(false);
      if (selected === null && !changingLevel && !finished) {
        Speech.speak(question.speechPrompt, { language: 'tr-TR', rate: 0.82, pitch: 1.0 });
      }
    }
  };

  const restart = () => {
    sequenceRef.current += 1;
    Speech.stop();
    setLevelIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setChangingLevel(false);
    setFinished(false);
  };

  const goBack = () => {
    sequenceRef.current += 1;
    Speech.stop();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" onPress={goBack} style={styles.circleButton}>
          <Ionicons name="arrow-back" size={23} color={PURPLE} />
        </TouchableOpacity>
        <Text style={styles.heading}>Alfabe Testi 🇹🇷</Text>
        <TouchableOpacity accessibilityLabel={muted ? 'Turn sound on' : 'Turn sound off'} onPress={toggleSound} style={styles.circleButton}>
          <Ionicons name={muted ? 'volume-mute-outline' : 'volume-high-outline'} size={23} color={PURPLE} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {finished ? (
          <View style={styles.centerCard}>
            <Text style={styles.heroEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Harika iş!</Text>
            <Text style={styles.subtitle}>You completed all three levels!</Text>
            <Text style={styles.bigScore}>{score} / {TOTAL}</Text>
            <Text style={styles.subtitle}>Correct answers</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={restart}>
              <Text style={styles.primaryText}>Play Again ↻</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
              <Text style={styles.secondaryText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        ) : changingLevel ? (
          <View style={styles.centerCard}>
            <Text style={styles.heroEmoji}>🌟</Text>
            <Text style={styles.resultTitle}>Seviye {levelIndex + 1} tamam!</Text>
            <Text style={styles.subtitle}>Great work! Ready for the next level?</Text>
            <Text style={styles.scoreLabel}>Score: {score} / {completedBefore + level.questions.length}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => {
              Speech.stop();
              setLevelIndex((prev) => prev + 1);
              setQuestionIndex(0);
              setSelected(null);
              setChangingLevel(false);
            }}>
              <Text style={styles.primaryText}>Next Level →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level.title} · {level.subtitle}</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Question {currentNumber} of {TOTAL}</Text>
              <Text style={styles.progressText}>⭐ {score} correct</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${((currentNumber - 1) / TOTAL) * 100}%` }]} />
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.questionEmoji}>🔤</Text>
              <Text style={styles.questionText}>{question.prompt}</Text>
              <TouchableOpacity style={styles.speakButton} onPress={replay} disabled={selected !== null}>
                <Ionicons name="volume-high" size={20} color={PURPLE} />
                <Text style={styles.speakText}>Hear Turkish</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.chooseLabel}>Choose the correct answer:</Text>
            <View style={styles.options}>
              {question.choices.map((choice) => {
                const isSelected = selected === choice;
                const isCorrect = selected !== null && choice === question.answer;
                return (
                  <TouchableOpacity
                    key={choice}
                    disabled={selected !== null}
                    onPress={() => choose(choice)}
                    style={[
                      styles.option,
                      isCorrect && styles.correctOption,
                      isSelected && !isCorrect && styles.wrongOption,
                    ]}
                  >
                    <Text style={styles.optionText}>{choice}</Text>
                    {isCorrect && <Ionicons name="checkmark-circle" size={23} color="#268B59" />}
                    {isSelected && !isCorrect && <Ionicons name="close-circle" size={23} color="#DC5A69" />}
                  </TouchableOpacity>
                );
              })}
            </View>
            {selected !== null && (
              <Text style={styles.feedback}>
                {selected === question.answer ? '✅ Aferin! Great job!' : `💜 Nice try! The answer is ${question.answer}.`}
              </Text>
            )}
            <Text style={styles.hint}>The next question appears after the Turkish feedback finishes speaking.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  circleButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E0FA' },
  heading: { color: '#342650', fontSize: 20, fontWeight: '800' },
  content: { paddingHorizontal: 22, paddingBottom: 48 },
  levelBadge: { backgroundColor: '#EDE6FF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15, marginTop: 12, alignSelf: 'flex-start' },
  levelText: { color: PURPLE, fontWeight: '800', fontSize: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 9 },
  progressText: { color: '#665B7F', fontSize: 13, fontWeight: '700' },
  progressTrack: { backgroundColor: '#E5DEF4', borderRadius: 20, height: 10, overflow: 'hidden' },
  progressFill: { backgroundColor: '#9B7AF1', height: '100%', borderRadius: 20 },
  questionCard: { backgroundColor: '#FFFFFF', paddingHorizontal: 22, paddingVertical: 28, marginTop: 24, alignItems: 'center', borderRadius: 26, borderColor: '#E9E3FA', borderWidth: 1 },
  questionEmoji: { fontSize: 52, marginBottom: 12 },
  questionText: { color: '#342650', fontSize: 23, fontWeight: '800', textAlign: 'center', lineHeight: 32 },
  speakButton: { flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: '#F0EAFF', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 24, marginTop: 24 },
  speakText: { color: PURPLE, fontWeight: '800' },
  chooseLabel: { fontSize: 15, color: '#6E6385', fontWeight: '700', marginTop: 27, marginBottom: 15 },
  options: { gap: 12 },
  option: { backgroundColor: '#FFFFFF', borderColor: '#E7DFF6', borderWidth: 2, borderRadius: 19, minHeight: 66, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  optionText: { color: '#3B2C61', fontSize: 24, fontWeight: '800' },
  correctOption: { backgroundColor: '#E3F8EB', borderColor: '#79CBA0' },
  wrongOption: { backgroundColor: '#FFF0F2', borderColor: '#EEA0AB' },
  feedback: { textAlign: 'center', marginTop: 20, color: '#665096', fontWeight: '800', fontSize: 17 },
  hint: { textAlign: 'center', color: '#867B9A', fontSize: 12, marginTop: 24, lineHeight: 18 },
  centerCard: { marginTop: 45, borderRadius: 28, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9E3FA', padding: 30, alignItems: 'center' },
  heroEmoji: { fontSize: 68, marginBottom: 14 },
  resultTitle: { fontSize: 26, color: '#3B2C61', fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#756989', textAlign: 'center', marginTop: 12 },
  bigScore: { color: PURPLE, fontSize: 48, fontWeight: '900', marginTop: 24 },
  scoreLabel: { color: PURPLE, fontWeight: '800', fontSize: 20, marginTop: 26 },
  primaryButton: { backgroundColor: PURPLE, paddingHorizontal: 30, paddingVertical: 16, borderRadius: 18, marginTop: 30, width: '100%', alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  secondaryButton: { paddingVertical: 18 },
  secondaryText: { color: PURPLE, fontWeight: '700', fontSize: 15 },
});
