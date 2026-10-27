
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type AlphabetQuizProps = {
  onExit: () => void;
};

type Stage = 'easy' | 'medium' | 'complete';
type FeedbackType = 'correct' | 'wrong' | null;

const EASY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MEDIUM_LETTERS = [
  'D', 'F', 'B', 'A', 'C',
  'E', 'T', 'R', 'H', 'Y',
];

const REQUIRED_MEDIUM_ANSWERS = 5;

// Pause before the child hears a new question.
const QUESTION_DELAY_MS = 1800;

// Pause after a correct answer before advancing.
const NEXT_ROUND_DELAY_MS = 1600;

const LETTER_COLORS = [
  '#FFE2EB',
  '#DDEBFF',
  '#FFF0C7',
  '#E4DAFF',
  '#DDF5E4',
  '#FFE5CC',
];

function shuffleLetters(items: string[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function pickTarget(
  letters: string[],
  previous?: string
) {
  const available = letters.filter(
    (letter) => letter !== previous
  );

  const choices = available.length
    ? available
    : letters;

  return choices[
    Math.floor(Math.random() * choices.length)
  ];
}

export default function AlphabetQuiz({
  onExit,
}: AlphabetQuizProps) {
  const [stage, setStage] = useState<Stage>('easy');
  const [easyIndex, setEasyIndex] = useState(0);

  const [easyComplete, setEasyComplete] =
    useState(false);

  const [mediumLetters, setMediumLetters] =
    useState<string[]>(MEDIUM_LETTERS);

  const [targetLetter, setTargetLetter] =
    useState('D');

  const [mediumCorrect, setMediumCorrect] =
    useState(0);

  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] =
    useState<FeedbackType>(null);

  const [selectedLetter, setSelectedLetter] =
    useState<string | null>(null);

  const [answerLocked, setAnswerLocked] =
    useState(false);

  const [questionReady, setQuestionReady] =
    useState(false);

  const selectedVoice = useRef<string | undefined>(
    undefined
  );

  const popAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const roundTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const speechGeneration = useRef(0);

  const easyTarget = EASY_LETTERS[easyIndex];

  const clearRoundTimer = useCallback(() => {
    if (roundTimer.current !== null) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }
  }, []);

  // Select a better-quality voice when the device
  // has one available.
  useEffect(() => {
    let active = true;

    async function loadVoices() {
      try {
        const voices =
          await Speech.getAvailableVoicesAsync();

        const englishUK = voices.filter(
          (voice) =>
            voice.language.toLowerCase().startsWith(
              'en-gb'
            )
        );

        const english = voices.filter(
          (voice) =>
            voice.language.toLowerCase().startsWith(
              'en'
            )
        );

        const bestVoice =
          englishUK.find(
            (voice) =>
              voice.quality === Speech.VoiceQuality.Enhanced
          ) ??
          englishUK[0] ??
          english.find(
            (voice) =>
              voice.quality === Speech.VoiceQuality.Enhanced
          ) ??
          english[0];

        if (active) {
          selectedVoice.current =
            bestVoice?.identifier;
        }
      } catch (error) {
        console.warn(
          'Could not load available voices:',
          error
        );
      }
    }

    void loadVoices();

    return () => {
      active = false;
    };
  }, []);

  const stopNarration = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (text: string) => {
    const generation = ++speechGeneration.current;

    try {
      await Speech.stop();

      // Don't start a previously queued utterance
      // if another question has replaced it.
      if (generation !== speechGeneration.current) {
        return;
      }

      Speech.speak(text, {
        language: 'en-GB',
        voice: selectedVoice.current,
        rate: 0.92,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn(
        'Alphabet Quiz narration error:',
        error
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      clearRoundTimer();
      stopNarration();
    };
  }, [clearRoundTimer, stopNarration]);

  // Speak only after the screen has settled.
  // The timer is cancelled if the question changes.
  useEffect(() => {
    if (stage === 'complete' || easyComplete) {
      setQuestionReady(false);
      return;
    }

    const instruction =
      stage === 'easy'
        ? `Tap ${easyTarget}`
        : `Find ${targetLetter}`;

    setQuestionReady(false);
    stopNarration();

    const timer = setTimeout(() => {
      setQuestionReady(true);
      void speak(instruction);
    }, QUESTION_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [
    stage,
    easyIndex,
    easyComplete,
    targetLetter,
    speak,
    stopNarration,
  ]);

  function animateLetter() {
    popAnimation.setValue(0.84);

    Animated.spring(popAnimation, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }

  function clearFeedback() {
    setFeedback('');
    setFeedbackType(null);
    setSelectedLetter(null);
  }

  function handleEasyAnswer(letter: string) {
    if (
      stage !== 'easy' ||
      answerLocked ||
      !questionReady ||
      easyComplete
    ) {
      return;
    }

    setSelectedLetter(letter);
    animateLetter();

    if (letter !== easyTarget) {
      setFeedback('❌ Try again!');
      setFeedbackType('wrong');
      void speak('Try again');
      return;
    }

    setAnswerLocked(true);
    setFeedback('🌟 Good job!');
    setFeedbackType('correct');

    void speak('Good job');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      if (easyIndex < EASY_LETTERS.length - 1) {
        setEasyIndex((previous) => previous + 1);
        clearFeedback();
        setAnswerLocked(false);
      } else {
        setEasyComplete(true);
        setFeedback('🎉 Easy level complete!');
        setSelectedLetter(null);
        void speak(
          'Great job! Easy level complete!'
        );
      }
    }, NEXT_ROUND_DELAY_MS);
  }

  function startMedium() {
    clearRoundTimer();
    stopNarration();

    const shuffled = shuffleLetters(MEDIUM_LETTERS);

    setMediumLetters(shuffled);
    setTargetLetter(pickTarget(shuffled));
    setMediumCorrect(0);
    setAnswerLocked(false);
    clearFeedback();
    setStage('medium');
  }

  function handleMediumAnswer(letter: string) {
    if (
      stage !== 'medium' ||
      answerLocked ||
      !questionReady
    ) {
      return;
    }

    setSelectedLetter(letter);
    animateLetter();

    if (letter !== targetLetter) {
      setFeedback('❌ Try again!');
      setFeedbackType('wrong');
      void speak('Try again');
      return;
    }

    const nextCount = mediumCorrect + 1;

    setAnswerLocked(true);
    setMediumCorrect(nextCount);
    setFeedback('⭐ Good job!');
    setFeedbackType('correct');

    void speak('Good job');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;
      clearFeedback();

      if (nextCount >= REQUIRED_MEDIUM_ANSWERS) {
        setStage('complete');
        void speak(
          'Amazing! You completed the Alphabet Quiz!'
        );
        return;
      }

      const shuffled = shuffleLetters(MEDIUM_LETTERS);

      setMediumLetters(shuffled);
      setTargetLetter(
        pickTarget(shuffled, targetLetter)
      );
      setAnswerLocked(false);
    }, NEXT_ROUND_DELAY_MS);
  }

  function backToEasy() {
    clearRoundTimer();
    stopNarration();

    clearFeedback();
    setAnswerLocked(false);
    setStage('easy');
  }

  function replayQuiz() {
    clearRoundTimer();
    stopNarration();

    setEasyIndex(0);
    setEasyComplete(false);
    setMediumCorrect(0);
    setTargetLetter('D');
    setMediumLetters(MEDIUM_LETTERS);
    setAnswerLocked(false);
    clearFeedback();
    setStage('easy');
  }

  function finishQuiz() {
    clearRoundTimer();
    stopNarration();
    onExit();
  }

  const letters =
    stage === 'easy'
      ? EASY_LETTERS
      : mediumLetters;

  const currentTarget =
    stage === 'easy'
      ? easyTarget
      : targetLetter;

  const completedCount =
    stage === 'easy'
      ? easyComplete
        ? EASY_LETTERS.length
        : easyIndex
      : mediumCorrect;

  const requiredCount =
    stage === 'easy'
      ? EASY_LETTERS.length
      : REQUIRED_MEDIUM_ANSWERS;

  const screenTitle =
    stage === 'easy'
      ? 'Letter Challenge!'
      : 'Find the Letter!';

  const instruction =
    stage === 'easy'
      ? `Tap ${currentTarget}`
      : `Find ${currentTarget}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        accessibilityRole="button"
        onPress={
          stage === 'medium'
            ? backToEasy
            : finishQuiz
        }
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          {stage === 'medium'
            ? '← Back to Easy Level'
            : '← Back to Quizzes'}
        </Text>
      </Pressable>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🎉 🌟
            </Text>

            <Text style={styles.completeTitle}>
              Alphabet Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You completed the letter challenge
              and found five letters in the
              medium level!
            </Text>

            <Text style={styles.stars}>
              ⭐ ⭐ ⭐
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={replayQuiz}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              🔄 Play Again
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={finishQuiz}
            style={styles.finishButton}
          >
            <Text style={styles.finishButtonText}>
              Finish Quiz ✓
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <View
            style={[
              styles.header,
              stage === 'medium' && styles.mediumHeader,
            ]}
          >
            <Text style={styles.headerEmoji}>
              {stage === 'easy'
                ? '🔤 🌈 ⭐'
                : '🎯 🔠 🚀'}
            </Text>

            <Text style={styles.headerTitle}>
              {screenTitle}
            </Text>

            <Text style={styles.headerSubtitle}>
              {stage === 'easy'
                ? 'Easy Level — Listen and tap!'
                : 'Medium Level — Find the letter!'}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Correct: {completedCount} / {requiredCount}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (completedCount / requiredCount) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionEmoji}>
              👂
            </Text>

            <Text style={styles.instructionText}>
              {stage === 'easy' && easyComplete
                ? 'Great job! 🎉'
                : instruction}
            </Text>

            <Text style={styles.readyText}>
              {stage === 'easy' && easyComplete
                ? 'Ready for the next level!'
                : questionReady
                  ? 'Your turn! Tap the letter.'
                  : 'Get ready...'}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => void speak(instruction)}
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Choose the correct letter! 👇
          </Text>

          <View style={styles.letterGrid}>
            {letters.map((letter, index) => {
              const selected =
                selectedLetter === letter;

              return (
                <Animated.View
                  key={letter}
                  style={[
                    styles.letterWrapper,
                    selected && {
                      transform: [
                        { scale: popAnimation },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      `Choose letter ${letter}`
                    }
                    disabled={
                      answerLocked ||
                      !questionReady ||
                      easyComplete
                    }
                    onPress={() =>
                      stage === 'easy'
                        ? handleEasyAnswer(letter)
                        : handleMediumAnswer(letter)
                    }
                    style={({ pressed }) => [
                      styles.letterButton,
                      {
                        backgroundColor:
                          LETTER_COLORS[
                            index % LETTER_COLORS.length
                          ],
                      },
                      selected &&
                        feedbackType === 'correct' &&
                        styles.correctLetter,
                      selected &&
                        feedbackType === 'wrong' &&
                        styles.wrongLetter,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.letterText}>
                      {letter}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {feedback !== '' && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}

          {stage === 'easy' ? (
            <Pressable
              accessibilityRole="button"
              onPress={startMedium}
              style={styles.mainButton}
            >
              <Text style={styles.mainButtonText}>
                {easyComplete
                  ? 'Continue to Medium Level →'
                  : 'Next Level →'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={finishQuiz}
              style={styles.finishButton}
            >
              <Text style={styles.finishButtonText}>
                Finish Quiz ✓
              </Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 50,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 20,
  },
  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  mediumHeader: {
    backgroundColor: '#E9E1FF',
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
  },
  progressCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 20,
    padding: 17,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
  progressTrack: {
    height: 12,
    backgroundColor: C.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#42A66B',
    borderRadius: 8,
  },
  instructionCard: {
    backgroundColor: '#FFE5EF',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    marginBottom: 22,
  },
  instructionEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  readyText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 17,
  },
  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 13,
    alignItems: 'center',
  },
  listenText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  letterWrapper: {
    width: '30%',
    marginBottom: 12,
  },
  letterButton: {
    height: 95,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.white,
  },
  letterText: {
    fontSize: 40,
    fontWeight: '800',
    color: C.text,
  },
  correctLetter: {
    borderColor: '#2FAA58',
    backgroundColor: '#D8F7E0',
  },
  wrongLetter: {
    borderColor: '#ED6672',
    backgroundColor: '#FFE0E5',
  },
  feedbackCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  feedbackText: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
  },
  mainButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 17,
  },
  mainButtonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  finishButton: {
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  completeCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 24,
  },
  completeEmoji: {
    fontSize: 55,
    marginBottom: 15,
  },
  completeTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  completeDescription: {
    fontSize: 17,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  stars: {
    fontSize: 35,
    marginTop: 20,
  },
});
