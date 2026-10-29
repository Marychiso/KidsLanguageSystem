
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

type Props = {
  onExit: () => void;
};

type Stage = 'easy' | 'objects' | 'odd' | 'complete';
type ShapeName = 'circle' | 'square' | 'triangle';

type OddQuestion = {
  choices: ShapeName[];
  correctIndex: number;
};

const SHAPES: ShapeName[] = [
  'circle',
  'square',
  'triangle',
];

const OBJECTS: {
  shape: ShapeName;
  emoji: string;
  name: string;
  background: string;
}[] = [
  {
    shape: 'circle',
    emoji: '🕒',
    name: 'Clock',
    background: '#DDEFFF',
  },
  {
    shape: 'square',
    emoji: '🪟',
    name: 'Window',
    background: '#E5E0FF',
  },
  {
    shape: 'triangle',
    emoji: '🍕',
    name: 'Pizza Slice',
    background: '#FFF0CF',
  },
];

const ODD_GOAL = 3;
const OPENING_DELAY = 1800;
const ANSWER_DELAY = 1600;
const TEXT_REVEAL_DELAY = 250;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function createOddQuestion(): OddQuestion {
  const main =
    SHAPES[Math.floor(Math.random() * SHAPES.length)];

  const alternatives = SHAPES.filter(
    (shape) => shape !== main
  );

  const odd =
    alternatives[
      Math.floor(Math.random() * alternatives.length)
    ];

  const correctIndex = Math.floor(Math.random() * 4);

  const choices: ShapeName[] = [
    main,
    main,
    main,
    main,
  ];

  choices[correctIndex] = odd;

  return {
    choices,
    correctIndex,
  };
}

function ShapePicture({
  name,
  size = 85,
}: {
  name: ShapeName;
  size?: number;
}) {
  if (name === 'circle') {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#F75D78',
          borderWidth: 3,
          borderColor: '#DA4160',
        }}
      />
    );
  }

  if (name === 'square') {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          backgroundColor: '#599BFF',
          borderWidth: 3,
          borderColor: '#3776D9',
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size / 2,
        borderRightWidth: size / 2,
        borderBottomWidth: size,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#F7C84C',
      }}
    />
  );
}

export default function ShapesQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('easy');
  const [round, setRound] = useState(0);

  const [easyQuestions, setEasyQuestions] =
    useState<ShapeName[]>([...SHAPES]);

  const [objectQuestions, setObjectQuestions] =
    useState<ShapeName[]>(() => shuffle(SHAPES));

  const [oddCorrect, setOddCorrect] = useState(0);

  const [oddQuestion, setOddQuestion] =
    useState<OddQuestion>(() => createOddQuestion());

  const [oddQuestionNumber, setOddQuestionNumber] =
    useState(0);

  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);

  // NEW: Keep the question hidden during preparation.
  const [questionVisible, setQuestionVisible] =
    useState(false);

  // NEW: User-controlled sound setting.
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);

  const [selected, setSelected] =
    useState<number | null>(null);

  const [correctSelection, setCorrectSelection] =
    useState(false);

  const [feedback, setFeedback] = useState('');
  const [feedbackCorrect, setFeedbackCorrect] =
    useState(false);

  const voiceRef = useRef<string | undefined>(
    undefined
  );

  const speechGeneration = useRef(0);

  const advanceTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const popAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  const stopVoice = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  // NEW: Narration respects the Sound On/Off setting.
  const speak = useCallback(async (text: string) => {
    if (!soundOnRef.current) {
      return;
    }

    const generation = ++speechGeneration.current;

    try {
      await Speech.stop();

      if (
        generation !== speechGeneration.current ||
        !soundOnRef.current
      ) {
        return;
      }

      Speech.speak(text, {
        language: 'en-GB',
        voice: voiceRef.current,
        rate: 0.92,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('Shapes Quiz speech:', error);
    }
  }, []);

  // Find the best available British English voice.
  useEffect(() => {
    let active = true;

    async function chooseVoice() {
      try {
        const voices =
          await Speech.getAvailableVoicesAsync();

        const british = voices.filter(
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

        const best =
          british.find(
            (voice) =>
              voice.quality ===
              Speech.VoiceQuality.Enhanced
          ) ??
          british[0] ??
          english.find(
            (voice) =>
              voice.quality ===
              Speech.VoiceQuality.Enhanced
          ) ??
          english[0];

        if (active) {
          voiceRef.current = best?.identifier;
        }
      } catch (error) {
        console.warn(
          'Shapes Quiz voice selection:',
          error
        );
      }
    }

    void chooseVoice();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      stopVoice();
    };
  }, [clearAdvanceTimer, stopVoice]);

  const currentShape =
    stage === 'easy'
      ? easyQuestions[Math.min(round, 2)]
      : stage === 'objects'
        ? objectQuestions[Math.min(round, 2)]
        : 'circle';

  const questionText =
    stage === 'easy'
      ? `Tap the ${currentShape}`
      : stage === 'objects'
        ? `Find the ${currentShape} shape`
        : 'Find the different shape';

  // NEW: Only display the instruction when narration begins.
  useEffect(() => {
    if (stage === 'complete') {
      setReady(false);
      setQuestionVisible(false);
      return;
    }

    const text =
      stage === 'easy'
        ? `Tap the ${easyQuestions[Math.min(round, 2)]}`
        : stage === 'objects'
          ? `Find the ${
              objectQuestions[Math.min(round, 2)]
            } shape`
          : 'Find the different shape';

    setReady(false);
    setQuestionVisible(false);
    stopVoice();

    let cancelled = false;
    let revealTimer:
      | ReturnType<typeof setTimeout>
      | undefined;

    const openingTimer = setTimeout(() => {
      // Begin speaking first.
      void speak(text).then(() => {
        if (cancelled) {
          return;
        }

        // Show the instruction just after speech starts.
        revealTimer = setTimeout(() => {
          if (!cancelled) {
            setQuestionVisible(true);
            setReady(true);
          }
        }, soundOnRef.current ? TEXT_REVEAL_DELAY : 0);
      });
    }, OPENING_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(openingTimer);

      if (revealTimer !== undefined) {
        clearTimeout(revealTimer);
      }

      stopVoice();
    };
  }, [
    stage,
    round,
    oddQuestionNumber,
    easyQuestions,
    objectQuestions,
    speak,
    stopVoice,
  ]);

  // Completion narration.
  useEffect(() => {
    if (stage !== 'complete') {
      return;
    }

    const timer = setTimeout(() => {
      void speak(
        'Amazing! You are a Shapes Superstar!'
      );
    }, 650);

    return () => clearTimeout(timer);
  }, [stage, speak]);

  // NEW: Toggle sound without resetting the current question.
  function toggleSound() {
    const next = !soundOnRef.current;

    soundOnRef.current = next;
    setSoundOn(next);

    if (!next) {
      stopVoice();
    } else if (
      stage !== 'complete' &&
      questionVisible &&
      !locked
    ) {
      void speak(questionText);
    }
  }

  function bounce() {
    popAnimation.setValue(0.85);

    Animated.spring(popAnimation, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }

  function resetAnswer() {
    setReady(false);
    setQuestionVisible(false);
    setLocked(false);
    setSelected(null);
    setFeedback('');
    setCorrectSelection(false);
    setFeedbackCorrect(false);
  }

  function beginStage(next: Stage) {
    clearAdvanceTimer();
    stopVoice();
    resetAnswer();
    setRound(0);

    if (next === 'easy') {
      setEasyQuestions([...SHAPES]);
    }

    if (next === 'objects') {
      setObjectQuestions(shuffle(SHAPES));
    }

    if (next === 'odd') {
      setOddCorrect(0);
      setOddQuestion(createOddQuestion());
      setOddQuestionNumber(
        (previous) => previous + 1
      );
    }

    setStage(next);
  }

  function advanceQuestion() {
    if (stage === 'easy') {
      if (round < 2) {
        resetAnswer();
        setRound((previous) => previous + 1);
      } else {
        beginStage('objects');
      }
    } else if (stage === 'objects') {
      if (round < 2) {
        resetAnswer();
        setRound((previous) => previous + 1);
      } else {
        beginStage('odd');
      }
    }
  }

  function handleShapeAnswer(
    shape: ShapeName,
    index: number
  ) {
    if (
      !ready ||
      locked ||
      (stage !== 'easy' && stage !== 'objects')
    ) {
      return;
    }

    const correct = shape === currentShape;

    setSelected(index);
    bounce();

    if (!correct) {
      setFeedback('❌ Try again!');
      setCorrectSelection(false);
      setFeedbackCorrect(false);
      void speak('Try again');
      return;
    }

    setLocked(true);
    setReady(false);
    setCorrectSelection(true);
    setFeedbackCorrect(true);
    setFeedback('🌟 Good job!');

    void speak('Good job!');

    clearAdvanceTimer();

    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      advanceQuestion();
    }, ANSWER_DELAY);
  }

  function handleOddAnswer(index: number) {
    if (
      stage !== 'odd' ||
      !ready ||
      locked
    ) {
      return;
    }

    const correct =
      index === oddQuestion.correctIndex;

    setSelected(index);
    bounce();

    if (!correct) {
      setFeedback('❌ Try again!');
      setCorrectSelection(false);
      setFeedbackCorrect(false);
      void speak('Try again');
      return;
    }

    setLocked(true);
    setReady(false);
    setCorrectSelection(true);
    setFeedbackCorrect(true);
    setFeedback('✨ Correct! Great work!');

    const nextCount = oddCorrect + 1;
    setOddCorrect(nextCount);

    void speak('Correct! Great work!');

    clearAdvanceTimer();

    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      resetAnswer();

      if (nextCount >= ODD_GOAL) {
        setStage('complete');
      } else {
        setOddQuestion(createOddQuestion());
        setOddQuestionNumber(
          (previous) => previous + 1
        );
      }
    }, ANSWER_DELAY);
  }

  function handleBack() {
    clearAdvanceTimer();
    stopVoice();

    if (stage === 'odd') {
      beginStage('objects');
    } else if (stage === 'objects') {
      beginStage('easy');
    } else {
      onExit();
    }
  }

  function replayQuiz() {
    setOddCorrect(0);
    beginStage('easy');
  }

  function finishQuiz() {
    clearAdvanceTimer();
    stopVoice();
    onExit();
  }

  const total = stage === 'odd' ? ODD_GOAL : 3;
  const progress =
    stage === 'odd' ? oddCorrect : round;

  const level =
    stage === 'easy'
      ? 1
      : stage === 'objects'
        ? 2
        : 3;

  return (
    <ScrollView
      key={stage}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* BACK AND SOUND CONTROLS */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← {stage === 'easy' || stage === 'complete'
              ? 'Back'
              : 'Previous Level'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            soundOn ? 'Turn sound off' : 'Turn sound on'
          }
          onPress={toggleSound}
          style={[
            styles.soundButton,
            !soundOn && styles.soundButtonMuted,
          ]}
        >
          <Text style={styles.soundButtonText}>
            {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
          </Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🔺 ⭐
            </Text>

            <Text style={styles.completeTitle}>
              Shapes Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You found shapes, recognized them
              in everyday objects, and completed
              the Odd One Out challenge!
            </Text>

            <Text style={styles.stars}>
              ⭐ ⭐ ⭐
            </Text>

            <Text style={styles.completeMessage}>
              Fantastic work!
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
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              {stage === 'easy'
                ? '🔴 🟦 🔺'
                : stage === 'objects'
                  ? '🕒 🪟 🍕'
                  : '🧩 ⭐ 🔺'}
            </Text>

            <Text style={styles.levelLabel}>
              LEVEL {level} OF 3
            </Text>

            <Text style={styles.headerTitle}>
              {stage === 'easy'
                ? 'Shape Detective!'
                : stage === 'objects'
                  ? 'Shapes Around Us!'
                  : 'Odd One Out!'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {stage === 'easy'
                ? 'Listen and tap the correct shape!'
                : stage === 'objects'
                  ? 'Look for shapes in everyday things!'
                  : 'Find the shape that is different!'}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {stage === 'odd'
                ? `Correct Answers: ${oddCorrect} / ${ODD_GOAL}`
                : `Question ${round + 1} of 3`}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(progress / total) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* INSTRUCTION APPEARS WITH NARRATION */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionEmoji}>
              {stage === 'easy'
                ? '👀'
                : stage === 'objects'
                  ? '🏠'
                  : '🔍'}
            </Text>

            <Text style={styles.instructionText}>
              {questionVisible
                ? questionText
                : 'Get ready...'}
            </Text>

            <Text style={styles.readyText}>
              {locked
                ? 'Next question coming up...'
                : ready
                  ? 'Your turn!'
                  : 'Listen carefully!'}
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={!soundOn || !questionVisible}
              onPress={() => void speak(questionText)}
              style={[
                styles.listenButton,
                (!soundOn || !questionVisible) &&
                  styles.disabledListenButton,
              ]}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          {stage === 'easy' && (
            <>
              <Text style={styles.sectionTitle}>
                Tap the correct shape! 👇
              </Text>

              <View style={styles.choiceGrid}>
                {SHAPES.map((shape, index) => (
                  <ShapeChoice
                    key={shape}
                    shape={shape}
                    selected={selected === index}
                    correct={correctSelection}
                    disabled={!ready || locked}
                    onPress={() =>
                      handleShapeAnswer(shape, index)
                    }
                    scale={popAnimation}
                  />
                ))}
              </View>
            </>
          )}

          {stage === 'objects' && (
            <>
              <Text style={styles.sectionTitle}>
                Which object has this shape? 👇
              </Text>

              <View style={styles.choiceGrid}>
                {OBJECTS.map((object, index) => (
                  <Animated.View
                    key={object.shape}
                    style={[
                      styles.choiceWrapper,
                      selected === index && {
                        transform: [
                          { scale: popAnimation },
                        ],
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        `Choose ${object.name}`
                      }
                      disabled={!ready || locked}
                      onPress={() =>
                        handleShapeAnswer(
                          object.shape,
                          index
                        )
                      }
                      style={[
                        styles.choiceCard,
                        {
                          backgroundColor:
                            object.background,
                        },
                        selected === index &&
                          (correctSelection
                            ? styles.correctBorder
                            : styles.wrongBorder),
                      ]}
                    >
                      <Text style={styles.objectEmoji}>
                        {object.emoji}
                      </Text>

                      <Text style={styles.choiceLabel}>
                        {object.name}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </>
          )}

          {stage === 'odd' && (
            <>
              <Text style={styles.sectionTitle}>
                Three match. One is different! 🧩
              </Text>

              <View style={styles.oddGrid}>
                {oddQuestion.choices.map(
                  (shape, index) => (
                    <ShapeChoice
                      key={`${oddQuestionNumber}-${index}`}
                      shape={shape}
                      selected={selected === index}
                      correct={correctSelection}
                      disabled={!ready || locked}
                      onPress={() =>
                        handleOddAnswer(index)
                      }
                      scale={popAnimation}
                      compact
                      showLabel={false}
                    />
                  )
                )}
              </View>
            </>
          )}

          {feedback !== '' && (
            <View
              style={[
                styles.feedbackCard,
                {
                  backgroundColor:
                    feedbackCorrect
                      ? '#DDF7E5'
                      : '#FFE0E6',
                },
              ]}
            >
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function ShapeChoice({
  shape,
  selected,
  correct,
  disabled,
  onPress,
  scale,
  compact = false,
  showLabel = true,
}: {
  shape: ShapeName;
  selected: boolean;
  correct: boolean;
  disabled: boolean;
  onPress: () => void;
  scale: Animated.Value;
  compact?: boolean;
  showLabel?: boolean;
}) {
  return (
    <Animated.View
      style={[
        styles.choiceWrapper,
        selected && {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${shape}`}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.choiceCard,
          compact && styles.compactCard,
          selected &&
            (correct
              ? styles.correctBorder
              : styles.wrongBorder),
        ]}
      >
        <ShapePicture
          name={shape}
          size={compact ? 74 : 85}
        />

        {showLabel && (
          <Text style={styles.choiceLabel}>
            {shape.charAt(0).toUpperCase() +
              shape.slice(1)}
          </Text>
        )}
      </Pressable>
    </Animated.View>
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

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
    justifyContent: 'center',
  },

  backText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  soundButton: {
    backgroundColor: '#DDF7E5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
    borderRadius: 18,
    justifyContent: 'center',
  },

  soundButtonMuted: {
    backgroundColor: '#F0EAF5',
  },

  soundButtonText: {
    color: C.text,
    fontWeight: '800',
    fontSize: 14,
  },

  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  headerEmoji: {
    fontSize: 38,
    marginBottom: 10,
  },

  levelLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 26,
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
    padding: 17,
    borderRadius: 20,
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
    borderRadius: 8,
    backgroundColor: C.white,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#43A866',
    borderRadius: 8,
  },

  instructionCard: {
    backgroundColor: '#FFE3ED',
    padding: 22,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 20,
  },

  instructionEmoji: {
    fontSize: 37,
    marginBottom: 9,
  },

  instructionText: {
    color: C.text,
    fontWeight: '800',
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 12,
  },

  readyText: {
    color: C.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },

  listenButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 18,
  },

  disabledListenButton: {
    opacity: 0.45,
  },

  listenText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    color: C.text,
    marginBottom: 18,
  },

  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  choiceWrapper: {
    width: '48%',
    marginBottom: 14,
  },

  choiceCard: {
    backgroundColor: '#F4EFFF',
    minHeight: 175,
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  choiceLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginTop: 14,
  },

  objectEmoji: {
    fontSize: 75,
  },

  oddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  compactCard: {
    minHeight: 160,
  },

  correctBorder: {
    borderColor: '#2FA85A',
  },

  wrongBorder: {
    borderColor: '#ED6574',
  },

  feedbackCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    alignItems: 'center',
  },

  feedbackText: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
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
    padding: 30,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 24,
  },

  completeEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },

  completeTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 15,
  },

  completeDescription: {
    fontSize: 17,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  stars: {
    fontSize: 35,
    marginTop: 22,
  },

  completeMessage: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginTop: 15,
  },
});
