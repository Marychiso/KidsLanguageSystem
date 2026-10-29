
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Props = {
  onExit: () => void;
};

type Stage =
  | 'detective'
  | 'objects'
  | 'sorting'
  | 'complete';

type ColorName =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'brown'
  | 'green'
  | 'white'
  | 'pink';

type ColorItem = {
  name: ColorName;
  hex: string;
  emoji: string;
  objectName: string;
  image?: ImageSourcePropType;
  background: string;
};

const COLORS: ColorItem[] = [
  {
    name: 'red',
    hex: '#E74C3C',
    emoji: '🍉',
    objectName: 'watermelon',
    image: require('../../../assets/colors/watermelon.jpg'),
    background: '#FFE0E5',
  },
  {
    name: 'blue',
    hex: '#3498DB',
    emoji: '🔵',
    objectName: 'blue ball',
    image: require('../../../assets/colors/blueball.jpg'),
    background: '#DDEEFF',
  },
  {
    name: 'yellow',
    hex: '#F4C542',
    emoji: '🍌',
    objectName: 'banana',
    image: require('../../../assets/colors/yellowbanana.jpg'),
    background: '#FFF0BD',
  },
  {
    name: 'brown',
    hex: '#9B6744',
    emoji: '🧸',
    objectName: 'teddy bear',
    background: '#F5E1D2',
  },
  {
    name: 'green',
    hex: '#43A65E',
    emoji: '🌿',
    objectName: 'green object',
    image: require('../../../assets/colors/green.jpg'),
    background: '#DEF4E5',
  },
  {
    name: 'white',
    hex: '#FFFFFF',
    emoji: '🐰',
    objectName: 'white bunny',
    image: require('../../../assets/colors/whitebunny.jpg'),
    background: '#E8E8F6',
  },
  {
    name: 'pink',
    hex: '#F39AC4',
    emoji: '🌸',
    objectName: 'pink flower',
    background: '#FFE1F0',
  },
];

const ROUNDS_PER_LEVEL = 5;
const QUESTION_DELAY_MS = 1800;
const ANSWER_DELAY_MS = 1600;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function makeQuestions(): ColorName[] {
  return shuffle(
    COLORS.map((item) => item.name)
  ).slice(0, ROUNDS_PER_LEVEL);
}

function getColor(name: ColorName): ColorItem {
  return COLORS.find((item) => item.name === name)!;
}

function makeBaskets(
  correct: ColorName
): ColorName[] {
  const otherColors = shuffle(
    COLORS.map((item) => item.name).filter(
      (name) => name !== correct
    )
  ).slice(0, 3);

  return shuffle([correct, ...otherColors]);
}

function ObjectPicture({
  item,
  large = false,
}: {
  item: ColorItem;
  large?: boolean;
}) {
  if (item.image) {
    return (
      <Image
        source={item.image}
        resizeMode="contain"
        style={
          large
            ? styles.largeObjectImage
            : styles.objectImage
        }
        accessibilityLabel={item.objectName}
      />
    );
  }

  return (
    <View
      style={[
        styles.emojiPicture,
        large && styles.largeEmojiPicture,
        { backgroundColor: item.background },
      ]}
    >
      <Text
        style={
          large
            ? styles.largeObjectEmoji
            : styles.objectEmoji
        }
      >
        {item.emoji}
      </Text>
    </View>
  );
}

export default function ColorsQuiz({
  onExit,
}: Props) {
  const [stage, setStage] =
    useState<Stage>('detective');

  const [round, setRound] = useState(0);

  const [questions, setQuestions] =
    useState<ColorName[]>(() => makeQuestions());

  const [basketChoices, setBasketChoices] =
    useState<ColorName[]>([]);

  const [ready, setReady] = useState(false);

  // Hide the question until its narration starts.
  const [questionVisible, setQuestionVisible] =
    useState(false);

  const [locked, setLocked] = useState(false);

  const [selected, setSelected] =
    useState<ColorName | null>(null);

  const [feedback, setFeedback] = useState('');

  const [correctSelection, setCorrectSelection] =
    useState(false);

  // Sound setting remains active between levels.
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);

  const voiceRef =
    useRef<string | undefined>(undefined);

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

  // Respect the Sound On/Off setting.
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
      console.warn(
        'Colors Quiz speech error:',
        error
      );
    }
  }, []);

  // Select a British English voice if available.
  useEffect(() => {
    let active = true;

    async function loadVoice() {
      try {
        const voices =
          await Speech.getAvailableVoicesAsync();

        const british = voices.filter(
          (voice) =>
            voice.language
              .toLowerCase()
              .startsWith('en-gb')
        );

        const english = voices.filter(
          (voice) =>
            voice.language
              .toLowerCase()
              .startsWith('en')
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
          'Colors Quiz voice selection:',
          error
        );
      }
    }

    void loadVoice();

    return () => {
      active = false;
    };
  }, []);

  // Clean up narration and pending transitions.
  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      stopVoice();
    };
  }, [clearAdvanceTimer, stopVoice]);

  const currentName =
    questions[Math.min(round, ROUNDS_PER_LEVEL - 1)];

  const currentColor = getColor(currentName);

  const questionText =
    stage === 'detective'
      ? `Find the color ${currentName}`
      : stage === 'objects'
        ? `Find something ${currentName}`
        : `Put the ${currentColor.objectName} in the ${currentName} basket`;

  // Start the narration and display the instruction
  // together after the opening pause.
  useEffect(() => {
    if (stage === 'complete') {
      setReady(false);
      setQuestionVisible(false);
      return;
    }

    const text =
      stage === 'detective'
        ? `Find the color ${currentName}`
        : stage === 'objects'
          ? `Find something ${currentName}`
          : `Put the ${currentColor.objectName} in the ${currentName} basket`;

    setReady(false);
    setQuestionVisible(false);

    stopVoice();

    const timer = setTimeout(() => {
      setQuestionVisible(true);
      setReady(true);
      void speak(text);
    }, QUESTION_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopVoice();
    };
  }, [
    stage,
    round,
    currentName,
    currentColor.objectName,
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
        'Amazing! You are a Color Superstar!'
      );
    }, 650);

    return () => clearTimeout(timer);
  }, [stage, speak]);

  // Toggle narration without resetting the question.
  function toggleSound() {
    const next = !soundOnRef.current;

    soundOnRef.current = next;
    setSoundOn(next);

    if (!next) {
      stopVoice();
    } else if (stage === 'complete') {
      void speak(
        'Amazing! You are a Color Superstar!'
      );
    } else if (questionVisible && !locked) {
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
  }

  function beginStage(next: Stage) {
    clearAdvanceTimer();
    stopVoice();
    resetAnswer();

    const nextQuestions = makeQuestions();

    setQuestions(nextQuestions);
    setRound(0);

    if (next === 'sorting') {
      setBasketChoices(
        makeBaskets(nextQuestions[0])
      );
    }

    setStage(next);
  }

  function advanceQuestion() {
    if (round < ROUNDS_PER_LEVEL - 1) {
      const nextRound = round + 1;

      if (stage === 'sorting') {
        setBasketChoices(
          makeBaskets(questions[nextRound])
        );
      }

      resetAnswer();
      setRound(nextRound);
      return;
    }

    if (stage === 'detective') {
      beginStage('objects');
    } else if (stage === 'objects') {
      beginStage('sorting');
    } else if (stage === 'sorting') {
      resetAnswer();
      setStage('complete');
    }
  }

  function handleAnswer(name: ColorName) {
    if (
      !ready ||
      locked ||
      stage === 'complete'
    ) {
      return;
    }

    setSelected(name);
    bounce();

    if (name !== currentName) {
      setCorrectSelection(false);
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    setLocked(true);
    setReady(false);
    setCorrectSelection(true);
    setFeedback('🌟 Excellent! You got it!');

    void speak('Excellent! You got it!');

    clearAdvanceTimer();

    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      advanceQuestion();
    }, ANSWER_DELAY_MS);
  }

  function handleBack() {
    clearAdvanceTimer();
    stopVoice();

    if (stage === 'sorting') {
      beginStage('objects');
    } else if (stage === 'objects') {
      beginStage('detective');
    } else {
      onExit();
    }
  }

  function replayQuiz() {
    beginStage('detective');
  }

  function finishQuiz() {
    clearAdvanceTimer();
    stopVoice();
    onExit();
  }

  const progressWidth =
    `${(round / ROUNDS_PER_LEVEL) * 100}%` as const;

  const levelNumber =
    stage === 'detective'
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
      {/* BACK AND SOUND BUTTONS */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ←{' '}
            {stage === 'detective' ||
            stage === 'complete'
              ? 'Back'
              : 'Previous Level'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            soundOn
              ? 'Turn sound off'
              : 'Turn sound on'
          }
          onPress={toggleSound}
          style={[
            styles.soundButton,
            !soundOn && styles.soundButtonMuted,
          ]}
        >
          <Text style={styles.soundButtonText}>
            {soundOn
              ? '🔊 Sound On'
              : '🔇 Sound Off'}
          </Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          {/* COMPLETION */}
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🎨 🌈
            </Text>

            <Text style={styles.completeTitle}>
              Color Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You identified colors, matched
              colorful objects, and sorted
              everything into the correct baskets!
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
          {/* LEVEL HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              {stage === 'detective'
                ? '🔍 🎨 🌈'
                : stage === 'objects'
                  ? '🍉 🍌 🐰'
                  : '🧺 🌈 ⭐'}
            </Text>

            <Text style={styles.levelLabel}>
              LEVEL {levelNumber} OF 3
            </Text>

            <Text style={styles.headerTitle}>
              {stage === 'detective'
                ? 'Color Detective!'
                : stage === 'objects'
                  ? 'Match the Object!'
                  : 'Color Sorting!'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {stage === 'detective'
                ? 'Look closely at the paint colors!'
                : stage === 'objects'
                  ? 'Find the matching object!'
                  : 'Put each object into the correct basket!'}
            </Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Question {round + 1} of {ROUNDS_PER_LEVEL}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />
            </View>
          </View>

          {/* QUESTION AND NARRATION */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionEmoji}>
              {stage === 'detective'
                ? '👀'
                : stage === 'objects'
                  ? '🔍'
                  : '🧺'}
            </Text>

            <Text style={styles.instructionText}>
              {questionVisible
                ? stage === 'detective'
                  ? `Find ${currentName.toUpperCase()}!`
                  : stage === 'objects'
                    ? `Find something ${currentName.toUpperCase()}!`
                    : `Where does the ${currentColor.objectName} go?`
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

          {/* LEVEL 1: COLOR DETECTIVE */}
          {stage === 'detective' && (
            <>
              <Text style={styles.sectionTitle}>
                Tap the correct paint color! 🎨
              </Text>

              <View style={styles.paintGrid}>
                {COLORS.map((color) => {
                  const isSelected =
                    selected === color.name;

                  return (
                    <Animated.View
                      key={color.name}
                      style={[
                        styles.paintWrapper,
                        isSelected && {
                          transform: [
                            { scale: popAnimation },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          `Choose ${color.name}`
                        }
                        disabled={!ready || locked}
                        onPress={() =>
                          handleAnswer(color.name)
                        }
                        style={[
                          styles.paintCard,
                          isSelected &&
                            (correctSelection
                              ? styles.correctBorder
                              : styles.wrongBorder),
                        ]}
                      >
                        <View
                          style={[
                            styles.paintCircle,
                            {
                              backgroundColor:
                                color.hex,
                            },
                          ]}
                        />
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}

          {/* LEVEL 2: MATCH THE OBJECT */}
          {stage === 'objects' && (
            <>
              <Text style={styles.sectionTitle}>
                Which object matches? 👇
              </Text>

              <View style={styles.objectGrid}>
                {COLORS.map((color) => {
                  const isSelected =
                    selected === color.name;

                  return (
                    <Animated.View
                      key={color.name}
                      style={[
                        styles.objectWrapper,
                        isSelected && {
                          transform: [
                            { scale: popAnimation },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          `Choose ${color.objectName}`
                        }
                        disabled={!ready || locked}
                        onPress={() =>
                          handleAnswer(color.name)
                        }
                        style={[
                          styles.objectCard,
                          {
                            backgroundColor:
                              color.background,
                          },
                          isSelected &&
                            (correctSelection
                              ? styles.correctBorder
                              : styles.wrongBorder),
                        ]}
                      >
                        <ObjectPicture item={color} />

                        <Text style={styles.objectName}>
                          {capitalize(color.objectName)}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}

          {/* LEVEL 3: COLOR SORTING */}
          {stage === 'sorting' && (
            <>
              <Text style={styles.sectionTitle}>
                Sort the object! 🧺
              </Text>

              <View style={styles.sortingObjectCard}>
                <ObjectPicture
                  item={currentColor}
                  large
                />

                <Text style={styles.sortingObjectName}>
                  {capitalize(currentColor.objectName)}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Choose the matching basket! 👇
              </Text>

              <View style={styles.basketGrid}>
                {basketChoices.map((name) => {
                  const color = getColor(name);
                  const isSelected =
                    selected === name;

                  return (
                    <Animated.View
                      key={name}
                      style={[
                        styles.basketWrapper,
                        isSelected && {
                          transform: [
                            { scale: popAnimation },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          `${name} basket`
                        }
                        disabled={!ready || locked}
                        onPress={() =>
                          handleAnswer(name)
                        }
                        style={[
                          styles.basketCard,
                          isSelected &&
                            (correctSelection
                              ? styles.correctBorder
                              : styles.wrongBorder),
                        ]}
                      >
                        <View
                          style={[
                            styles.basketCircle,
                            {
                              backgroundColor:
                                color.hex,
                            },
                          ]}
                        >
                          <Text style={styles.basketEmoji}>
                            🧺
                          </Text>
                        </View>

                        <Text style={styles.basketName}>
                          {capitalize(name)}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}

          {/* ANSWER FEEDBACK */}
          {feedback !== '' && (
            <View
              style={[
                styles.feedbackCard,
                {
                  backgroundColor: correctSelection
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
    fontSize: 14,
    fontWeight: '800',
  },

  header: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  headerEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },

  levelLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 7,
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
    padding: 18,
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
    backgroundColor: C.white,
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#43AA68',
    borderRadius: 8,
  },

  instructionCard: {
    backgroundColor: '#FFE3ED',
    padding: 22,
    borderRadius: 27,
    marginBottom: 22,
    alignItems: 'center',
  },

  instructionEmoji: {
    fontSize: 37,
    marginBottom: 9,
  },

  instructionText: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
  },

  readyText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },

  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 13,
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
    color: C.text,
    textAlign: 'center',
    marginBottom: 18,
  },

  paintGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },

  paintWrapper: {
    width: '31%',
    padding: 5,
  },

  paintCard: {
    backgroundColor: C.white,
    borderRadius: 23,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E8E7F2',
  },

  paintCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: '#D2D2D2',
  },

  objectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  objectWrapper: {
    width: '48%',
    marginBottom: 14,
  },

  objectCard: {
    minHeight: 165,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  objectImage: {
    width: '100%',
    height: 110,
  },

  objectName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginTop: 8,
  },

  emojiPicture: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  objectEmoji: {
    fontSize: 55,
  },

  largeObjectImage: {
    width: '100%',
    height: 170,
  },

  largeEmojiPicture: {
    height: 170,
  },

  largeObjectEmoji: {
    fontSize: 85,
  },

  sortingObjectCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },

  sortingObjectName: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginTop: 12,
  },

  basketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  basketWrapper: {
    width: '48%',
    marginBottom: 13,
  },

  basketCard: {
    backgroundColor: C.white,
    minHeight: 145,
    padding: 12,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E8E7F2',
  },

  basketCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D2D2D2',
  },

  basketEmoji: {
    fontSize: 42,
  },

  basketName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    marginTop: 10,
  },

  correctBorder: {
    borderColor: '#2FA85A',
  },

  wrongBorder: {
    borderColor: '#ED6574',
  },

  feedbackCard: {
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
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

  completeMessage: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginTop: 16,
  },
});
