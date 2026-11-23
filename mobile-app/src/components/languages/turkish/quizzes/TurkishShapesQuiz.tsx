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

// Fifteen questions reinforce the ten shapes in the Turkish Shapes lesson.
// Three levels gradually increase difficulty.
const LEVELS: Level[] = [
  {
    title: 'Seviye 1',
    subtitle: 'Recognize the shapes',
    questions: [
      { prompt: 'Which shape is Daire?', speechPrompt: 'Daire hangisi?', choices: ['🔺 Triangle', '🔴 Circle', '⭐ Star', '🟦 Square'], answer: '🔴 Circle', explanation: 'Doğru cevap daire.' },
      { prompt: 'Which shape is Kare?', speechPrompt: 'Kare hangisi?', choices: ['❤️ Heart', '🟦 Square', '🔴 Circle', '⬡ Hexagon'], answer: '🟦 Square', explanation: 'Doğru cevap kare.' },
      { prompt: 'Which shape is Üçgen?', speechPrompt: 'Üçgen hangisi?', choices: ['⭐ Star', '▭ Rectangle', '🔺 Triangle', '⬟ Pentagon'], answer: '🔺 Triangle', explanation: 'Doğru cevap üçgen.' },
      { prompt: 'Which shape is Yıldız?', speechPrompt: 'Yıldız hangisi?', choices: ['⭐ Star', '❤️ Heart', '⬭ Oval', '🟦 Square'], answer: '⭐ Star', explanation: 'Doğru cevap yıldız.' },
      { prompt: 'Which shape is Kalp?', speechPrompt: 'Kalp hangisi?', choices: ['⬡ Hexagon', '🔴 Circle', '❤️ Heart', '🔺 Triangle'], answer: '❤️ Heart', explanation: 'Doğru cevap kalp.' },
    ],
  },
  {
    title: 'Seviye 2',
    subtitle: 'Match the Turkish word',
    questions: [
      { prompt: 'What is rectangle in Turkish?', speechPrompt: 'Doğru Türkçe şekil adını seç.', choices: ['Daire', 'Dikdörtgen', 'Üçgen', 'Beşgen'], answer: 'Dikdörtgen', explanation: 'Doğru cevap dikdörtgen.' },
      { prompt: 'What is oval in Turkish?', speechPrompt: 'Doğru Türkçe şekil adını seç.', choices: ['Yıldız', 'Kare', 'Oval', 'Kalp'], answer: 'Oval', explanation: 'Doğru cevap oval.' },
      { prompt: 'What is rhombus in Turkish?', speechPrompt: 'Doğru Türkçe şekil adını seç.', choices: ['Altıgen', 'Eşkenar dörtgen', 'Dikdörtgen', 'Daire'], answer: 'Eşkenar dörtgen', explanation: 'Doğru cevap eşkenar dörtgen.' },
      { prompt: 'What is pentagon in Turkish?', speechPrompt: 'Doğru Türkçe şekil adını seç.', choices: ['Beşgen', 'Altıgen', 'Kare', 'Üçgen'], answer: 'Beşgen', explanation: 'Doğru cevap beşgen.' },
      { prompt: 'What is hexagon in Turkish?', speechPrompt: 'Doğru Türkçe şekil adını seç.', choices: ['Oval', 'Altıgen', 'Kalp', 'Beşgen'], answer: 'Altıgen', explanation: 'Doğru cevap altıgen.' },
    ],
  },
  {
    title: 'Seviye 3',
    subtitle: 'Shape challenge',
    questions: [
      { prompt: 'Which shape has three sides?', speechPrompt: 'Hangi şeklin üç kenarı vardır?', choices: ['Daire', 'Kare', 'Üçgen', 'Beşgen'], answer: 'Üçgen', explanation: 'Üçgenin üç kenarı vardır.' },
      { prompt: 'Which shape has five sides?', speechPrompt: 'Hangi şeklin beş kenarı vardır?', choices: ['Beşgen', 'Altıgen', 'Kare', 'Üçgen'], answer: 'Beşgen', explanation: 'Beşgenin beş kenarı vardır.' },
      { prompt: 'Which shape has six sides?', speechPrompt: 'Hangi şeklin altı kenarı vardır?', choices: ['Dikdörtgen', 'Altıgen', 'Yıldız', 'Oval'], answer: 'Altıgen', explanation: 'Altıgenin altı kenarı vardır.' },
      { prompt: 'Which shape has four equal sides and four right angles?', speechPrompt: 'Hangi şeklin dört eşit kenarı ve dört dik açısı vardır?', choices: ['Dikdörtgen', 'Eşkenar dörtgen', 'Kare', 'Daire'], answer: 'Kare', explanation: 'Karenin dört eşit kenarı ve dört dik açısı vardır.' },
      { prompt: 'Which shape looks like a stretched circle?', speechPrompt: 'Hangi şekil uzatılmış bir daireye benzer?', choices: ['Kalp', 'Oval', 'Üçgen', 'Yıldız'], answer: 'Oval', explanation: 'Oval, uzatılmış bir daireye benzer.' },
    ],
  },
];

const PURPLE = '#7956D8';
const TOTAL = LEVELS.reduce((sum, level) => sum + level.questions.length, 0);

export default function TurkishShapesQuiz() {
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
      : `Güzel deneme. ${question.explanation}`;

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
        <Text style={styles.heading}>Şekiller Testi 🇹🇷</Text>
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
              <Text style={styles.questionEmoji}>🧩</Text>
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
