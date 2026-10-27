
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type AnimalsQuizProps = {
  onExit: () => void;
};

type Stage = 'sounds' | 'logic' | 'parade' | 'complete';

type AnimalName =
  | 'dog'
  | 'cat'
  | 'cow'
  | 'lion'
  | 'elephant'
  | 'bird'
  | 'fish';

type Animal = {
  name: AnimalName;
  image: number;
  background: string;
};

const animals: Animal[] = [
  {
    name: 'dog',
    image: require('../../../assets/animals/dog.jpg'),
    background: '#FFE5CB',
  },
  {
    name: 'cat',
    image: require('../../../assets/animals/cat.jpg'),
    background: '#FFE0EB',
  },
  {
    name: 'cow',
    image: require('../../../assets/animals/cow.jpg'),
    background: '#E2F5E5',
  },
  {
    name: 'lion',
    image: require('../../../assets/animals/lion.jpg'),
    background: '#FFF0BA',
  },
  {
    name: 'elephant',
    image: require('../../../assets/animals/elephant.jpg'),
    background: '#E2E5FF',
  },
  {
    name: 'bird',
    image: require('../../../assets/animals/bird.jpg'),
    background: '#DDF2FF',
  },
  {
    name: 'fish',
    image: require('../../../assets/animals/fish.jpg'),
    background: '#D9F5F3',
  },
];

const soundQuestions = [
  { sound: 'Moo', answer: 'cow' },
  { sound: 'Woof', answer: 'dog' },
  { sound: 'Meow', answer: 'cat' },
] as const;

const logicQuestions = [
  { question: 'Who can fly?', answer: 'bird' },
  { question: 'Who is big?', answer: 'elephant' },
  { question: 'Who roars?', answer: 'lion' },
] as const;

const SOUND_CHOICES = animals.filter((animal) =>
  ['dog', 'cat', 'cow'].includes(animal.name)
);

const LOGIC_CHOICES = animals.filter((animal) =>
  ['lion', 'elephant', 'bird'].includes(animal.name)
);

const REQUIRED_PARADE_ROUNDS = 3;

// Give children time to see each new screen.
const OPENING_DELAY_MS = 1800;

// Pause between correct answers.
const NEXT_QUESTION_DELAY_MS = 1600;

// Time between animals appearing in the parade.
const PARADE_SPEED_MS = 1100;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shuffleAnimals(items: Animal[]): Animal[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export default function AnimalsQuiz({
  onExit,
}: AnimalsQuizProps) {
  const [stage, setStage] = useState<Stage>('sounds');

  const [soundIndex, setSoundIndex] = useState(0);
  const [logicIndex, setLogicIndex] = useState(0);
  const [paradeCorrect, setParadeCorrect] = useState(0);

  const [paradeOrder, setParadeOrder] = useState<Animal[]>(
    () => shuffleAnimals(animals)
  );

  const [visibleCount, setVisibleCount] = useState(0);

  const [paradePhase, setParadePhase] =
    useState<'watch' | 'answer'>('watch');

  const [questionReady, setQuestionReady] = useState(false);

  const [feedback, setFeedback] = useState('');

  const [answerLocked, setAnswerLocked] = useState(false);

  const [selectedName, setSelectedName] =
    useState<AnimalName | null>(null);

  const selectedVoice = useRef<string | undefined>(
    undefined
  );

  const speechGeneration = useRef(0);

  const roundTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const soundQuestion = soundQuestions[soundIndex];
  const logicQuestion = logicQuestions[logicIndex];

  const clearRoundTimer = useCallback(() => {
    if (roundTimer.current !== null) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }
  }, []);

  const stopNarration = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  // Choose a better-quality voice when available.
  useEffect(() => {
    let active = true;

    async function loadVoices() {
      try {
        const voices =
          await Speech.getAvailableVoicesAsync();

        const britishVoices = voices.filter(
          (voice) =>
            voice.language.toLowerCase().startsWith('en-gb')
        );

        const englishVoices = voices.filter(
          (voice) =>
            voice.language.toLowerCase().startsWith('en')
        );

        const bestVoice =
          britishVoices.find(
            (voice) =>
              voice.quality === Speech.VoiceQuality.Enhanced
          ) ??
          britishVoices[0] ??
          englishVoices.find(
            (voice) =>
              voice.quality === Speech.VoiceQuality.Enhanced
          ) ??
          englishVoices[0];

        if (active) {
          selectedVoice.current =
            bestVoice?.identifier;
        }
      } catch (error) {
        console.warn(
          'Animals Quiz voice selection:',
          error
        );
      }
    }

    void loadVoices();

    return () => {
      active = false;
    };
  }, []);

  // Brighter, clearer speech, matching Alphabet Quiz.
  const speak = useCallback(async (text: string) => {
    const generation = ++speechGeneration.current;

    try {
      await Speech.stop();

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
        'Animals Quiz narration error:',
        error
      );
    }
  }, []);

  // Stop speech and timers when leaving the quiz.
  useEffect(() => {
    return () => {
      clearRoundTimer();
      stopNarration();
    };
  }, [clearRoundTimer, stopNarration]);

  // Sounds and Logic:
  // Wait before reading each new question.
  useEffect(() => {
    if (stage !== 'sounds' && stage !== 'logic') {
      return;
    }

    const instruction =
      stage === 'sounds'
        ? `You hear ${soundQuestion.sound}. Who is it?`
        : logicQuestion.question;

    setQuestionReady(false);
    stopNarration();

    const timer = setTimeout(() => {
      setQuestionReady(true);
      void speak(instruction);
    }, OPENING_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [
    stage,
    soundIndex,
    logicIndex,
    soundQuestion.sound,
    logicQuestion.question,
    speak,
    stopNarration,
  ]);

  // Animal Parade:
  // Wait before showing the first animal.
  useEffect(() => {
    if (
      stage !== 'parade' ||
      paradePhase !== 'watch'
    ) {
      return;
    }

    setQuestionReady(false);

    if (visibleCount === 0) {
      void speak('Watch the animal parade');
    }

    const timer = setTimeout(() => {
      if (visibleCount < paradeOrder.length) {
        setVisibleCount((previous) => previous + 1);
      } else {
        setParadePhase('answer');
      }
    }, visibleCount === 0
      ? OPENING_DELAY_MS
      : PARADE_SPEED_MS
    );

    return () => clearTimeout(timer);
  }, [
    stage,
    paradePhase,
    visibleCount,
    paradeOrder,
    speak,
  ]);

  // Wait before asking which animal came first.
  useEffect(() => {
    if (
      stage !== 'parade' ||
      paradePhase !== 'answer'
    ) {
      return;
    }

    setQuestionReady(false);
    stopNarration();

    const timer = setTimeout(() => {
      setQuestionReady(true);
      void speak('Which animal came first?');
    }, OPENING_DELAY_MS);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [
    stage,
    paradePhase,
    paradeOrder,
    speak,
    stopNarration,
  ]);

  function resetFeedback() {
    setFeedback('');
    setSelectedName(null);
  }

  function startLogic() {
    clearRoundTimer();
    stopNarration();

    setLogicIndex(0);
    resetFeedback();
    setQuestionReady(false);
    setAnswerLocked(false);
    setStage('logic');
  }

  function startParade() {
    clearRoundTimer();
    stopNarration();

    setParadeOrder(shuffleAnimals(animals));
    setVisibleCount(0);
    setParadePhase('watch');
    setQuestionReady(false);
    setAnswerLocked(false);
    resetFeedback();
    setStage('parade');
  }

  function nextParade() {
    clearRoundTimer();
    stopNarration();

    setParadeOrder(shuffleAnimals(animals));
    setVisibleCount(0);
    setParadePhase('watch');
    setQuestionReady(false);
    setAnswerLocked(false);
    resetFeedback();
  }

  function handleSoundAnswer(animal: Animal) {
    if (
      stage !== 'sounds' ||
      answerLocked ||
      !questionReady
    ) {
      return;
    }

    setSelectedName(animal.name);

    if (animal.name !== soundQuestion.answer) {
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    setAnswerLocked(true);
    setFeedback('🌟 Yay! Good job!');
    void speak('Yay!');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      if (soundIndex < soundQuestions.length - 1) {
        setSoundIndex((previous) => previous + 1);
        resetFeedback();
        setAnswerLocked(false);
      } else {
        startLogic();
      }
    }, NEXT_QUESTION_DELAY_MS);
  }

  function handleLogicAnswer(animal: Animal) {
    if (
      stage !== 'logic' ||
      answerLocked ||
      !questionReady
    ) {
      return;
    }

    setSelectedName(animal.name);

    if (animal.name !== logicQuestion.answer) {
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    setAnswerLocked(true);
    setFeedback('🌟 Good job!');
    void speak('Good job');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      if (logicIndex < logicQuestions.length - 1) {
        setLogicIndex((previous) => previous + 1);
        resetFeedback();
        setAnswerLocked(false);
      } else {
        startParade();
      }
    }, NEXT_QUESTION_DELAY_MS);
  }

  function handleParadeAnswer(animal: Animal) {
    if (
      stage !== 'parade' ||
      paradePhase !== 'answer' ||
      answerLocked ||
      !questionReady
    ) {
      return;
    }

    setSelectedName(animal.name);

    if (animal.name !== paradeOrder[0].name) {
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    const newCount = paradeCorrect + 1;

    setAnswerLocked(true);
    setParadeCorrect(newCount);
    setFeedback('🎉 Correct!');

    void speak('Correct!');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      if (newCount >= REQUIRED_PARADE_ROUNDS) {
        setQuestionReady(false);
        resetFeedback();
        setStage('complete');

        void speak(
          'Amazing job! Animal Quiz complete!'
        );
      } else {
        nextParade();
      }
    }, NEXT_QUESTION_DELAY_MS);
  }

  function backToSounds() {
    clearRoundTimer();
    stopNarration();

    resetFeedback();
    setQuestionReady(false);
    setAnswerLocked(false);
    setStage('sounds');
  }

  function backToLogic() {
    clearRoundTimer();
    stopNarration();

    resetFeedback();
    setQuestionReady(false);
    setAnswerLocked(false);
    setStage('logic');
  }

  function replayQuiz() {
    clearRoundTimer();
    stopNarration();

    setSoundIndex(0);
    setLogicIndex(0);
    setParadeCorrect(0);
    setParadeOrder(shuffleAnimals(animals));
    setVisibleCount(0);
    setParadePhase('watch');

    setQuestionReady(false);
    setAnswerLocked(false);
    resetFeedback();
    setStage('sounds');
  }

  function finishQuiz() {
    clearRoundTimer();
    stopNarration();
    onExit();
  }

  const currentInstruction =
    stage === 'sounds'
      ? `You hear ${soundQuestion.sound}. Who is it?`
      : stage === 'logic'
        ? logicQuestion.question
        : 'Which animal came first?';

  const choices =
    stage === 'sounds'
      ? SOUND_CHOICES
      : stage === 'logic'
        ? LOGIC_CHOICES
        : animals;

  const correctName: AnimalName =
    stage === 'sounds'
      ? soundQuestion.answer
      : stage === 'logic'
        ? logicQuestion.answer
        : paradeOrder[0].name;

  const currentProgress =
    stage === 'sounds'
      ? soundIndex
      : stage === 'logic'
        ? logicIndex
        : paradeCorrect;

  const currentTotal =
    stage === 'parade'
      ? REQUIRED_PARADE_ROUNDS
      : 3;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        accessibilityRole="button"
        onPress={
          stage === 'sounds' || stage === 'complete'
            ? finishQuiz
            : stage === 'logic'
              ? backToSounds
              : backToLogic
        }
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          ← {stage === 'sounds' || stage === 'complete'
            ? 'Back to Quizzes'
            : stage === 'logic'
              ? 'Back to Sounds'
              : 'Back to Logic'}
        </Text>
      </Pressable>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🎉 🐾
            </Text>

            <Text style={styles.completeTitle}>
              Animal Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You completed the animal sounds,
              animal logic, and three animal
              parade challenges!
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
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              {stage === 'sounds'
                ? '🐮 🐶 🐱'
                : stage === 'logic'
                  ? '🦁 🐘 🐦'
                  : '🐾 🎪 ⭐'}
            </Text>

            <Text style={styles.headerTitle}>
              {stage === 'sounds'
                ? 'Animal Sounds!'
                : stage === 'logic'
                  ? 'Animal Logic!'
                  : 'Animal Parade!'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {stage === 'sounds'
                ? 'Listen and choose the correct animal!'
                : stage === 'logic'
                  ? 'Think carefully and find the animal!'
                  : 'Watch carefully and remember which animal came first!'}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {stage === 'sounds'
                ? `Sound ${soundIndex + 1} of 3`
                : stage === 'logic'
                  ? `Question ${logicIndex + 1} of 3`
                  : `Parade ${Math.min(
                      paradeCorrect + 1,
                      REQUIRED_PARADE_ROUNDS
                    )} of 3`}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (currentProgress / currentTotal) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {stage === 'parade' &&
            paradePhase === 'watch' && (
              <View style={styles.paradeCard}>
                <Text style={styles.instructionText}>
                  Watch carefully! 👀
                </Text>

                <Text style={styles.paradeHint}>
                  Remember the first animal.
                </Text>

                <View style={styles.paradeGrid}>
                  {paradeOrder
                    .slice(0, visibleCount)
                    .map((animal, index) => (
                      <View
                        key={`${animal.name}-${index}`}
                        style={styles.paradeAnimal}
                      >
                        <Image
                          source={animal.image}
                          style={styles.paradeImage}
                          resizeMode="contain"
                        />
                      </View>
                    ))}
                </View>

                <Text style={styles.paradeHint}>
                  {visibleCount === 0
                    ? 'Get ready for the parade...'
                    : visibleCount < animals.length
                      ? `${visibleCount} of 7 animals`
                      : 'Get ready for your question!'}
                </Text>
              </View>
            )}

          {(stage !== 'parade' ||
            paradePhase === 'answer') && (
            <>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionEmoji}>
                  {stage === 'sounds'
                    ? '👂'
                    : stage === 'logic'
                      ? '🧠'
                      : '👀'}
                </Text>

                <Text style={styles.instructionText}>
                  {currentInstruction}
                </Text>

                <Text style={styles.readyText}>
                  {questionReady
                    ? 'Your turn! Choose an animal.'
                    : 'Get ready...'}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    void speak(currentInstruction)
                  }
                  style={styles.listenButton}
                >
                  <Text style={styles.listenText}>
                    🔊 Hear Again
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.sectionTitle}>
                Tap the correct animal! 👇
              </Text>

              <View style={styles.animalGrid}>
                {choices.map((animal) => {
                  const selected =
                    selectedName === animal.name;

                  return (
                    <Pressable
                      key={animal.name}
                      accessibilityRole="button"
                      accessibilityLabel={
                        `Choose ${animal.name}`
                      }
                      disabled={
                        answerLocked || !questionReady
                      }
                      onPress={() => {
                        if (stage === 'sounds') {
                          handleSoundAnswer(animal);
                        } else if (stage === 'logic') {
                          handleLogicAnswer(animal);
                        } else {
                          handleParadeAnswer(animal);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.animalCard,
                        {
                          backgroundColor:
                            animal.background,
                        },
                        selected &&
                          (animal.name === correctName
                            ? styles.correctCard
                            : styles.wrongCard),
                        pressed && styles.pressed,
                      ]}
                    >
                      <Image
                        source={animal.image}
                        style={styles.animalImage}
                        resizeMode="contain"
                      />

                      <Text style={styles.animalName}>
                        {capitalize(animal.name)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {feedback !== '' && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}

          {stage === 'sounds' && (
            <Pressable
              accessibilityRole="button"
              onPress={startLogic}
              style={styles.mainButton}
            >
              <Text style={styles.mainButtonText}>
                Next Stage →
              </Text>
            </Pressable>
          )}

          {stage === 'logic' && (
            <Pressable
              accessibilityRole="button"
              onPress={startParade}
              style={styles.mainButton}
            >
              <Text style={styles.mainButtonText}>
                Start Animal Parade →
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

  headerEmoji: {
    fontSize: 39,
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
    marginTop: 12,
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
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 10,
  },

  readyText: {
    fontSize: 14,
    color: C.textSecondary,
    marginBottom: 17,
    textAlign: 'center',
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

  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  animalCard: {
    width: '48%',
    minHeight: 155,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  animalImage: {
    width: '100%',
    height: 108,
  },

  animalName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    marginTop: 8,
  },

  correctCard: {
    borderColor: '#2FA85A',
  },

  wrongCard: {
    borderColor: '#EA6676',
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
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 17,
  },

  mainButtonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  paradeCard: {
    backgroundColor: '#E9E1FF',
    padding: 20,
    borderRadius: 26,
    marginBottom: 22,
    alignItems: 'center',
  },

  paradeHint: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },

  paradeGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 12,
    minHeight: 150,
  },

  paradeAnimal: {
    width: '29%',
    height: 88,
    margin: '2%',
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 5,
  },

  paradeImage: {
    width: '100%',
    height: '100%',
  },

  completeCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginTop: 28,
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

  finishButton: {
    backgroundColor: C.blue,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  finishButtonText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
