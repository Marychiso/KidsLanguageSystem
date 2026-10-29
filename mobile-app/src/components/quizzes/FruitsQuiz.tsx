
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

type Stage = 'detective' | 'sizes' | 'memory' | 'complete';
type MemoryPhase = 'ready' | 'show' | 'answer';

type FruitId =
  | 'apple'
  | 'banana'
  | 'grapes'
  | 'orange'
  | 'pear'
  | 'blueberry'
  | 'watermelon';

type Fruit = {
  id: FruitId;
  name: string;
  emoji: string;
  background: string;
  image?: ImageSourcePropType;
};

const FRUITS: Fruit[] = [
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    background: '#FFE0E5',
    image: require('../../../assets/fruits/redapple.jpg'),
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    background: '#FFF0BD',
    image: require('../../../assets/fruits/banana.jpg'),
  },
  {
    id: 'grapes',
    name: 'Grapes',
    emoji: '🍇',
    background: '#ECE0FF',
    image: require('../../../assets/fruits/grape.jpg'),
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    background: '#FFE6CC',
    image: require('../../../assets/fruits/orange.jpg'),
  },
  {
    id: 'pear',
    name: 'Pear',
    emoji: '🍐',
    background: '#E5F6D7',
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    emoji: '🫐',
    background: '#DEE7FF',
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    emoji: '🍉',
    background: '#DDF6DF',
    image: require('../../../assets/fruits/watermelon.jpg'),
  },
];

const DETECTIVE_QUESTIONS: {
  text: string;
  answer: FruitId;
}[] = [
  { text: 'Find the yellow banana!', answer: 'banana' },
  { text: 'Find the red apple!', answer: 'apple' },
  { text: 'Find the green pear!', answer: 'pear' },
  { text: 'Find the orange fruit!', answer: 'orange' },
  { text: 'Find the purple grapes!', answer: 'grapes' },
  {
    text: 'Find the little blue blueberry!',
    answer: 'blueberry',
  },
];

const SIZE_QUESTIONS: {
  text: string;
  answer: FruitId;
}[] = [
  {
    text: 'Which fruit is the biggest?',
    answer: 'watermelon',
  },
  {
    text: 'Which fruit is big?',
    answer: 'banana',
  },
  {
    text: 'Which fruit is small?',
    answer: 'grapes',
  },
  {
    text: 'Which fruit is the smallest?',
    answer: 'blueberry',
  },
];

const SIZE_OPTIONS: {
  id: FruitId;
  emoji: string;
  fontSize: number;
}[] = [
  { id: 'watermelon', emoji: '🍉', fontSize: 108 },
  { id: 'banana', emoji: '🍌', fontSize: 76 },
  { id: 'grapes', emoji: '🍇', fontSize: 49 },
  { id: 'blueberry', emoji: '🫐', fontSize: 30 },
];

const MEMORY_GOAL = 5;
const QUESTION_DELAY_MS = 1800;
const ANSWER_DELAY_MS = 1600;
const MEMORY_PREPARE_MS = 2000;
const MEMORY_FRUIT_MS = 2200;
const MEMORY_QUESTION_MS = 1000;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getFruit(id: FruitId): Fruit {
  return FRUITS.find((fruit) => fruit.id === id)!;
}

type MemoryRound = {
  sequence: FruitId[];
  options: FruitId[];
};

function createMemoryRound(): MemoryRound {
  const sequence = shuffle(
    FRUITS.map((fruit) => fruit.id)
  ).slice(0, 3);

  const correct =
    sequence[Math.floor(Math.random() * sequence.length)];

  const wrongChoices = shuffle(
    FRUITS.map((fruit) => fruit.id).filter(
      (id) => !sequence.includes(id)
    )
  ).slice(0, 2);

  return {
    sequence,
    options: shuffle([correct, ...wrongChoices]),
  };
}

export default function FruitsQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('detective');
  const [round, setRound] = useState(0);

  const [memoryCorrect, setMemoryCorrect] = useState(0);
  const [memoryRound, setMemoryRound] =
    useState<MemoryRound>(() => createMemoryRound());

  const [memoryPhase, setMemoryPhase] =
    useState<MemoryPhase>('ready');

  const [memoryIndex, setMemoryIndex] = useState(0);
  const [memoryRoundNumber, setMemoryRoundNumber] =
    useState(0);

  const [ready, setReady] = useState(false);
  const [questionVisible, setQuestionVisible] =
    useState(false);
  const [locked, setLocked] = useState(false);

  const [selected, setSelected] =
    useState<FruitId | null>(null);
  const [feedback, setFeedback] = useState('');
  const [correctSelection, setCorrectSelection] =
    useState(false);

  // Sound setting applies to all three levels.
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);

  const voiceRef = useRef<string | undefined>(undefined);
  const speechGeneration = useRef(0);

  const advanceTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const pop = useRef(new Animated.Value(1)).current;

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

  const speak = useCallback(async (text: string) => {
    if (!soundOnRef.current) return;

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
      console.warn('Fruits Quiz speech:', error);
    }
  }, []);

  // Find a British English voice.
  useEffect(() => {
    let active = true;

    async function selectVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();

        const british = voices.filter((v) =>
          v.language.toLowerCase().startsWith('en-gb')
        );

        const english = voices.filter((v) =>
          v.language.toLowerCase().startsWith('en')
        );

        const best =
          british.find(
            (v) => v.quality === Speech.VoiceQuality.Enhanced
          ) ??
          british[0] ??
          english.find(
            (v) => v.quality === Speech.VoiceQuality.Enhanced
          ) ??
          english[0];

        if (active) {
          voiceRef.current = best?.identifier;
        }
      } catch (error) {
        console.warn('Fruit voice selection:', error);
      }
    }

    void selectVoice();

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

  const questionText =
    stage === 'detective'
      ? DETECTIVE_QUESTIONS[
          Math.min(round, DETECTIVE_QUESTIONS.length - 1)
        ].text
      : stage === 'sizes'
        ? SIZE_QUESTIONS[
            Math.min(round, SIZE_QUESTIONS.length - 1)
          ].text
        : 'Which fruit did you see?';

  // Hide the question during the opening pause.
  // Reveal it at the same time narration is requested.
  useEffect(() => {
    if (stage !== 'detective' && stage !== 'sizes') {
      return;
    }

    setReady(false);
    setQuestionVisible(false);
    stopVoice();

    const timer = setTimeout(() => {
      setQuestionVisible(true);
      setReady(true);
      void speak(questionText);
    }, QUESTION_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopVoice();
    };
  }, [stage, round, questionText, speak, stopVoice]);

  // Memory presentation: ready, then three fruits.
  useEffect(() => {
    if (stage !== 'memory') return;

    if (memoryPhase === 'ready') {
      setReady(false);
      setQuestionVisible(false);

      void speak('Watch the three fruits carefully!');

      const timer = setTimeout(() => {
        setMemoryIndex(0);
        setMemoryPhase('show');
      }, MEMORY_PREPARE_MS);

      return () => clearTimeout(timer);
    }

    if (memoryPhase === 'show') {
      setReady(false);

      const timer = setTimeout(() => {
        if (memoryIndex < 2) {
          setMemoryIndex((previous) => previous + 1);
        } else {
          setMemoryPhase('answer');
        }
      }, MEMORY_FRUIT_MS);

      return () => clearTimeout(timer);
    }
  }, [
    stage,
    memoryPhase,
    memoryIndex,
    memoryRoundNumber,
    speak,
  ]);

  // Reveal the memory question when its narration begins.
  useEffect(() => {
    if (stage !== 'memory' || memoryPhase !== 'answer') {
      return;
    }

    setReady(false);
    setQuestionVisible(false);
    stopVoice();

    const timer = setTimeout(() => {
      setQuestionVisible(true);
      setReady(true);
      void speak('Which fruit did you see?');
    }, MEMORY_QUESTION_MS);

    return () => {
      clearTimeout(timer);
      stopVoice();
    };
  }, [
    stage,
    memoryPhase,
    memoryRoundNumber,
    speak,
    stopVoice,
  ]);

  useEffect(() => {
    if (stage !== 'complete') return;

    const timer = setTimeout(() => {
      void speak('Amazing! You are a Fruit Superstar!');
    }, 700);

    return () => clearTimeout(timer);
  }, [stage, speak]);

  function toggleSound() {
    const next = !soundOnRef.current;

    soundOnRef.current = next;
    setSoundOn(next);

    if (!next) {
      stopVoice();
    } else if (stage === 'complete') {
      void speak('Amazing! You are a Fruit Superstar!');
    } else if (stage === 'memory' && memoryPhase === 'ready') {
      void speak('Watch the three fruits carefully!');
    } else if (questionVisible && !locked) {
      void speak(questionText);
    }
  }

  function animateAnswer() {
    pop.setValue(0.85);

    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }

  function resetAnswer() {
    setFeedback('');
    setSelected(null);
    setCorrectSelection(false);
    setReady(false);
    setQuestionVisible(false);
    setLocked(false);
  }

  function beginStage(next: Stage) {
    clearAdvanceTimer();
    stopVoice();
    resetAnswer();

    setRound(0);

    if (next === 'memory') {
      setMemoryCorrect(0);
      setMemoryRound(createMemoryRound());
      setMemoryPhase('ready');
      setMemoryIndex(0);
      setMemoryRoundNumber((previous) => previous + 1);
    }

    setStage(next);
  }

  function nextQuestion() {
    if (stage === 'detective') {
      if (round < DETECTIVE_QUESTIONS.length - 1) {
        resetAnswer();
        setRound((previous) => previous + 1);
      } else {
        beginStage('sizes');
      }
    } else if (stage === 'sizes') {
      if (round < SIZE_QUESTIONS.length - 1) {
        resetAnswer();
        setRound((previous) => previous + 1);
      } else {
        beginStage('memory');
      }
    }
  }

  function handleAnswer(id: FruitId) {
    if (!ready || locked) return;

    const correct =
      stage === 'detective'
        ? id === DETECTIVE_QUESTIONS[round].answer
        : stage === 'sizes'
          ? id === SIZE_QUESTIONS[round].answer
          : false;

    setSelected(id);
    animateAnswer();

    if (!correct) {
      setCorrectSelection(false);
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    setLocked(true);
    setReady(false);
    setCorrectSelection(true);
    setFeedback('🌟 Excellent!');

    void speak('Excellent!');

    clearAdvanceTimer();

    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      nextQuestion();
    }, ANSWER_DELAY_MS);
  }

  function nextMemoryRound() {
    clearAdvanceTimer();
    stopVoice();
    resetAnswer();

    setMemoryRound(createMemoryRound());
    setMemoryIndex(0);
    setMemoryPhase('ready');
    setMemoryRoundNumber((previous) => previous + 1);
  }

  function handleMemoryAnswer(id: FruitId) {
    if (
      stage !== 'memory' ||
      memoryPhase !== 'answer' ||
      !ready ||
      locked
    ) {
      return;
    }

    const correct = memoryRound.sequence.includes(id);

    setSelected(id);
    setLocked(true);
    setReady(false);
    setCorrectSelection(correct);
    animateAnswer();

    if (correct) {
      setFeedback('🌟 Great memory!');
      setMemoryCorrect((previous) => previous + 1);
      void speak('Great memory!');
    } else {
      setFeedback('❌ Try again! Watch carefully.');
      void speak('Try again');
    }

    clearAdvanceTimer();

    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;

      if (correct && memoryCorrect + 1 >= MEMORY_GOAL) {
        resetAnswer();
        setStage('complete');
      } else {
        nextMemoryRound();
      }
    }, ANSWER_DELAY_MS);
  }

  function handleBack() {
    clearAdvanceTimer();
    stopVoice();

    if (stage === 'memory') {
      beginStage('sizes');
    } else if (stage === 'sizes') {
      beginStage('detective');
    } else {
      onExit();
    }
  }

  function replayQuiz() {
    setMemoryCorrect(0);
    beginStage('detective');
  }

  function finishQuiz() {
    clearAdvanceTimer();
    stopVoice();
    onExit();
  }

  const progress = stage === 'memory' ? memoryCorrect : round;

  const total =
    stage === 'detective'
      ? DETECTIVE_QUESTIONS.length
      : stage === 'sizes'
        ? SIZE_QUESTIONS.length
        : MEMORY_GOAL;

  const level =
    stage === 'detective' ? 1 : stage === 'sizes' ? 2 : 3;

  return (
    <ScrollView
      key={`${stage}-${memoryRoundNumber}`}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* BACK + SOUND CONTROLS */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← {stage === 'detective' || stage === 'complete'
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
              🏆 🍓 🎉
            </Text>

            <Text style={styles.completeTitle}>
              Fruit Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You identified fruits, compared their sizes,
              and completed five memory challenges!
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
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              {stage === 'detective'
                ? '🍎 🍌 🍇'
                : stage === 'sizes'
                  ? '🍉 📏 🫐'
                  : '🧠 🍓 ✨'}
            </Text>

            <Text style={styles.levelLabel}>
              LEVEL {level} OF 3
            </Text>

            <Text style={styles.headerTitle}>
              {stage === 'detective'
                ? 'Fruit Detective!'
                : stage === 'sizes'
                  ? 'Big or Small?'
                  : 'Fruit Memory!'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {stage === 'detective'
                ? 'Listen and find the fruit!'
                : stage === 'sizes'
                  ? 'Look at the different sizes!'
                  : 'Watch the fruits and remember them!'}
            </Text>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {stage === 'memory'
                ? `${memoryCorrect} of ${MEMORY_GOAL} memory rounds`
                : `Question ${round + 1} of ${total}`}
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

          {/* LEVEL 1 AND LEVEL 2 QUESTIONS */}
          {(stage === 'detective' || stage === 'sizes') && (
            <>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionEmoji}>
                  {stage === 'detective' ? '🔍' : '📏'}
                </Text>

                <Text style={styles.instructionText}>
                  {questionVisible
                    ? questionText
                    : 'Get ready...'}
                </Text>

                <Text style={styles.readyText}>
                  {locked
                    ? 'Next question...'
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

              <Text style={styles.sectionTitle}>
                {stage === 'detective'
                  ? 'Choose the fruit! 👇'
                  : 'Look at their sizes! 👀'}
              </Text>
            </>
          )}

          {/* LEVEL 1: FRUIT DETECTIVE */}
          {stage === 'detective' && (
            <View style={styles.fruitGrid}>
              {FRUITS.map((fruit) => (
                <FruitChoice
                  key={fruit.id}
                  fruit={fruit}
                  selected={selected === fruit.id}
                  correct={correctSelection}
                  disabled={!ready || locked}
                  onPress={() => handleAnswer(fruit.id)}
                  scale={pop}
                />
              ))}
            </View>
          )}

          {/* LEVEL 2: FRUIT SIZES */}
          {stage === 'sizes' && (
            <View style={styles.sizeGrid}>
              {SIZE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${getFruit(option.id).name}`}
                  disabled={!ready || locked}
                  onPress={() => handleAnswer(option.id)}
                  style={[
                    styles.sizeCard,
                    selected === option.id &&
                      (correctSelection
                        ? styles.correctBorder
                        : styles.wrongBorder),
                  ]}
                >
                  <View style={styles.sizePictureArea}>
                    <Text
                      style={{
                        fontSize: option.fontSize,
                        textAlign: 'center',
                      }}
                    >
                      {option.emoji}
                    </Text>
                  </View>

                  <Text style={styles.fruitLabel}>
                    {getFruit(option.id).name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* LEVEL 3: FRUIT MEMORY */}
          {stage === 'memory' && (
            <>
              {memoryPhase === 'ready' && (
                <View style={styles.memoryCard}>
                  <Text style={styles.memoryTitle}>
                    Get Ready! 👀
                  </Text>

                  <Text style={styles.memoryHint}>
                    Three fruits are about to appear.
                  </Text>

                  <View style={styles.memoryPicture}>
                    <Text style={styles.waitingEmoji}>
                      ⭐ 🧠 ⭐
                    </Text>
                  </View>

                  <Text style={styles.memoryHint}>
                    Watch this space carefully!
                  </Text>
                </View>
              )}

              {memoryPhase === 'show' && (
                <View style={styles.memoryCard}>
                  <Text style={styles.memoryTitle}>
                    Look Carefully! 👀
                  </Text>

                  <Text style={styles.memoryHint}>
                    Fruit {memoryIndex + 1} of 3
                  </Text>

                  <View style={styles.memoryPicture}>
                    <Text style={styles.memoryFruitEmoji}>
                      {getFruit(
                        memoryRound.sequence[memoryIndex]
                      ).emoji}
                    </Text>

                    <Text style={styles.memoryFruitName}>
                      {getFruit(
                        memoryRound.sequence[memoryIndex]
                      ).name}
                    </Text>
                  </View>

                  <Text style={styles.memoryHint}>
                    Remember this fruit!
                  </Text>
                </View>
              )}

              {memoryPhase === 'answer' && (
                <>
                  <View style={styles.instructionCard}>
                    <Text style={styles.instructionEmoji}>
                      🧠
                    </Text>

                    <Text style={styles.instructionText}>
                      {questionVisible
                        ? 'Which fruit did you see?'
                        : 'Get ready...'}
                    </Text>

                    <Text style={styles.readyText}>
                      {locked
                        ? 'Next memory round...'
                        : ready
                          ? 'Choose one you remember!'
                          : 'Think carefully...'}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      disabled={!soundOn || !questionVisible}
                      onPress={() =>
                        void speak('Which fruit did you see?')
                      }
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

                  <View style={styles.fruitGrid}>
                    {memoryRound.options.map((id) => (
                      <FruitChoice
                        key={id}
                        fruit={getFruit(id)}
                        selected={selected === id}
                        correct={correctSelection}
                        disabled={!ready || locked}
                        onPress={() => handleMemoryAnswer(id)}
                        scale={pop}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          {feedback !== '' && (
            <View style={styles.feedbackCard}>
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

function FruitArtwork({ fruit }: { fruit: Fruit }) {
  if (fruit.image) {
    return (
      <Image
        source={fruit.image}
        resizeMode="contain"
        style={styles.fruitImage}
        accessibilityLabel={fruit.name}
      />
    );
  }

  return (
    <View style={styles.emojiArtwork}>
      <Text style={styles.fruitEmoji}>
        {fruit.emoji}
      </Text>
    </View>
  );
}

function FruitChoice({
  fruit,
  selected,
  correct,
  disabled,
  onPress,
  scale,
}: {
  fruit: Fruit;
  selected: boolean;
  correct: boolean;
  disabled: boolean;
  onPress: () => void;
  scale: Animated.Value;
}) {
  return (
    <Animated.View
      style={[
        styles.fruitWrapper,
        selected && {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${fruit.name}`}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.fruitCard,
          { backgroundColor: fruit.background },
          selected &&
            (correct
              ? styles.correctBorder
              : styles.wrongBorder),
        ]}
      >
        <FruitArtwork fruit={fruit} />

        <Text style={styles.fruitLabel}>
          {fruit.name}
        </Text>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
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
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },

  headerEmoji: {
    fontSize: 39,
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
    fontSize: 38,
    marginBottom: 9,
  },

  instructionText: {
    color: C.text,
    fontSize: 25,
    fontWeight: '800',
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
    color: C.text,
    textAlign: 'center',
    marginBottom: 18,
  },

  fruitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  fruitWrapper: {
    width: '48%',
    marginBottom: 14,
  },

  fruitCard: {
    backgroundColor: C.white,
    minHeight: 165,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  fruitImage: {
    width: '100%',
    height: 110,
  },

  emojiArtwork: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fruitEmoji: {
    fontSize: 70,
  },

  fruitLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginTop: 10,
  },

  correctBorder: {
    borderColor: '#2FA85A',
  },

  wrongBorder: {
    borderColor: '#ED6574',
  },

  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  sizeCard: {
    width: '48%',
    height: 220,
    borderRadius: 24,
    backgroundColor: '#F4EFFF',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  sizePictureArea: {
    height: 160,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoryCard: {
    backgroundColor: '#E9E1FF',
    padding: 22,
    borderRadius: 27,
    alignItems: 'center',
    marginBottom: 20,
  },

  memoryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
  },

  memoryHint: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },

  memoryPicture: {
    width: '100%',
    minHeight: 250,
    borderRadius: 22,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    padding: 10,
  },

  waitingEmoji: {
    fontSize: 58,
    textAlign: 'center',
  },

  memoryFruitEmoji: {
    fontSize: 115,
    textAlign: 'center',
  },

  memoryFruitName: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    marginTop: 12,
  },

  feedbackCard: {
    backgroundColor: '#FFF0C7',
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
    borderRadius: 28,
    padding: 30,
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
});
