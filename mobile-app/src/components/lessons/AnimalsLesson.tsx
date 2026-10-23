
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type AnimalsLessonProps = {
  onExit: () => void;
};

type Animal = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

type LessonStage = 'learn' | 'practice' | 'complete';

// The same seven animals from the original website
const animals: Animal[] = [
  {
    id: 'dog',
    name: 'Dog',
    image: require('../../../assets/animals/dog.jpg'),
  },
  {
    id: 'cat',
    name: 'Cat',
    image: require('../../../assets/animals/cat.jpg'),
  },
  {
    id: 'cow',
    name: 'Cow',
    image: require('../../../assets/animals/cow.jpg'),
  },
  {
    id: 'lion',
    name: 'Lion',
    image: require('../../../assets/animals/lion.jpg'),
  },
  {
    id: 'elephant',
    name: 'Elephant',
    image: require('../../../assets/animals/elephant.jpg'),
  },
  {
    id: 'bird',
    name: 'Bird',
    image: require('../../../assets/animals/bird.jpg'),
  },
  {
    id: 'fish',
    name: 'Fish',
    image: require('../../../assets/animals/fish.jpg'),
  },
];

const cardColors = [
  '#FFE3EC',
  '#DDF3E6',
  '#DDEBFF',
  '#FFF0C7',
  '#E9E1FF',
];

const TOTAL_ROUNDS = 5;

// Shuffle without changing the original animal array
function shuffleAnimals(): Animal[] {
  const result = [...animals];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

export default function AnimalsLesson({
  onExit,
}: AnimalsLessonProps) {
  const [stage, setStage] =
    useState<LessonStage>('learn');

  const [selectedAnimal, setSelectedAnimal] =
    useState<Animal | null>(null);

  const [correctRounds, setCorrectRounds] =
    useState(0);

  const [roundAnimals, setRoundAnimals] =
    useState<Animal[]>([]);

  const [targetAnimal, setTargetAnimal] =
    useState<Animal | null>(null);

  const [feedback, setFeedback] =
    useState('');

  const [feedbackCorrect, setFeedbackCorrect] =
    useState<boolean | null>(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const answerLocked = useRef(false);

  const roundTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const animationValue = useRef(
    new Animated.Value(1)
  ).current;

  // Clean up when leaving the screen
  useEffect(() => {
    return () => {
      if (roundTimer.current) {
        clearTimeout(roundTimer.current);
      }

      void Speech.stop().catch(() => {});
    };
  }, []);

  // Speak using the device's British English voice
  async function speak(text: string) {
    try {
      await Speech.stop();

      Speech.speak(text, {
        language: 'en-GB',
        rate: 0.8,
        pitch: 1,
      });
    } catch (error) {
      console.warn(
        'Animal lesson speech error:',
        error
      );
    }
  }

  // Animate the tapped animal
  function animateAnimal() {
    animationValue.setValue(0.9);

    Animated.spring(animationValue, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }

  // Stage 1: Learn an animal
  function handleLearnAnimal(animal: Animal) {
    setSelectedAnimal(animal);

    animateAnimal();

    void speak(`This is a ${animal.name}`);
  }

  // Generate a new practice round
  function loadRound() {
    if (roundTimer.current) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }

    const shuffled = shuffleAnimals();

    const target =
      shuffled[
        Math.floor(Math.random() * shuffled.length)
      ];

    answerLocked.current = false;

    setRoundAnimals(shuffled);
    setTargetAnimal(target);
    setFeedback('');
    setFeedbackCorrect(null);
    setSelectedAnswer(null);

    void speak(`Find the ${target.name}`);
  }

  // Move to Stage 2
  function startPractice() {
    setCorrectRounds(0);
    setStage('practice');

    loadRound();
  }

  // Stage 2: Check the chosen animal
  function handleAnswer(animal: Animal) {
    if (!targetAnimal || answerLocked.current) {
      return;
    }

    setSelectedAnswer(animal.id);

    if (animal.id === targetAnimal.id) {
      answerLocked.current = true;

      const nextRound = correctRounds + 1;

      setCorrectRounds(nextRound);
      setFeedback('⭐ Good job!');
      setFeedbackCorrect(true);

      animateAnimal();

      void speak('Good job!');

      if (nextRound >= TOTAL_ROUNDS) {
        roundTimer.current = setTimeout(() => {
          setStage('complete');
          setFeedback('');
          roundTimer.current = null;

          void speak(
            'Congratulations! Lesson complete!'
          );
        }, 1200);
      } else {
        roundTimer.current = setTimeout(() => {
          roundTimer.current = null;
          loadRound();
        }, 1200);
      }
    } else {
      setFeedback('❌ Try again!');
      setFeedbackCorrect(false);

      void speak('Try again');
    }
  }

  // Back from practice to learning
  function backToLearn() {
    if (roundTimer.current) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }

    answerLocked.current = false;

    void Speech.stop().catch(() => {});

    setStage('learn');
    setFeedback('');
    setSelectedAnswer(null);
  }

  // Exit the lesson
  function finishLesson() {
    if (roundTimer.current) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }

    void Speech.stop().catch(() => {});

    onExit();
  }

  // Restart practice
  function playAgain() {
    setCorrectRounds(0);
    setStage('practice');

    loadRound();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* STAGE 1: LEARN ANIMALS */}
      {stage === 'learn' && (
        <>
          <Pressable
            onPress={finishLesson}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              🐶 🦁 🐘
            </Text>

            <Text style={styles.headerTitle}>
              Animal Adventure!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's meet our animal friends!
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Meet the Animals! 🌟
          </Text>

          <Text style={styles.instructions}>
            Tap an animal picture to hear its name.
          </Text>

          <View style={styles.animalGrid}>
            {animals.map((animal, index) => (
              <Pressable
                key={animal.id}
                accessibilityRole="button"
                accessibilityLabel={
                  `Learn about ${animal.name}`
                }
                onPress={() =>
                  handleLearnAnimal(animal)
                }
                style={({ pressed }) => [
                  styles.animalCard,
                  {
                    backgroundColor:
                      cardColors[
                        index % cardColors.length
                      ],
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={animal.image}
                  style={styles.animalImage}
                  resizeMode="cover"
                />

                <Text style={styles.animalName}>
                  {animal.name}
                </Text>

                <Text style={styles.tapHint}>
                  🔊 Tap to hear
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedAnimal && (
            <Animated.View
              style={[
                styles.selectedCard,
                {
                  transform: [
                    { scale: animationValue },
                  ],
                },
              ]}
            >
              <Text style={styles.selectedTitle}>
                🌟 Wonderful!
              </Text>

              <Text style={styles.selectedSentence}>
                This is a {selectedAnimal.name}!
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void speak(
                    `This is a ${selectedAnimal.name}`
                  )
                }
                style={styles.listenButton}
              >
                <Text style={styles.listenText}>
                  🔊 Listen Again
                </Text>
              </Pressable>
            </Animated.View>
          )}

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementTitle}>
              Ready for a Challenge? 🎯
            </Text>

            <Text style={styles.encouragementText}>
              Let's see how many animals you can find!
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={startPractice}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              Start Animal Practice →
            </Text>
          </Pressable>
        </>
      )}

      {/* STAGE 2: FIND THE ANIMAL */}
      {stage === 'practice' && (
        <>
          <Pressable
            onPress={backToLearn}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Animals
            </Text>
          </Pressable>

          <View style={styles.practiceHeader}>
            <Text style={styles.headerEmoji}>
              🐾 🔎 🐾
            </Text>

            <Text style={styles.headerTitle}>
              Find the Animal!
            </Text>

            <Text style={styles.headerSubtitle}>
              Look carefully and choose the
              correct animal.
            </Text>
          </View>

          <View style={styles.roundCard}>
            <Text style={styles.roundTitle}>
              Round {Math.min(
                correctRounds + 1,
                TOTAL_ROUNDS
              )} of {TOTAL_ROUNDS}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (correctRounds / TOTAL_ROUNDS) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.questionEmoji}>
              🎯
            </Text>

            <Text style={styles.questionText}>
              {targetAnimal
                ? `Find the ${targetAnimal.name}!`
                : 'Get ready!'}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (targetAnimal) {
                  void speak(
                    `Find the ${targetAnimal.name}`
                  );
                }
              }}
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          <View style={styles.animalGrid}>
            {roundAnimals.map((animal, index) => {
              const isSelected =
                selectedAnswer === animal.id;

              return (
                <Pressable
                  key={animal.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `Choose ${animal.name}`
                  }
                  disabled={answerLocked.current}
                  onPress={() =>
                    handleAnswer(animal)
                  }
                  style={({ pressed }) => [
                    styles.animalCard,
                    {
                      backgroundColor:
                        cardColors[
                          index % cardColors.length
                        ],
                    },
                    isSelected &&
                      feedbackCorrect === true &&
                      styles.correctCard,
                    isSelected &&
                      feedbackCorrect === false &&
                      styles.wrongCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={animal.image}
                    style={styles.animalImage}
                    resizeMode="cover"
                  />

                  <Text style={styles.animalName}>
                    {animal.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {feedback !== '' && (
            <View
              style={[
                styles.feedbackCard,
                {
                  backgroundColor:
                    feedbackCorrect
                      ? '#DDF3E6'
                      : '#FFE3EC',
                },
              ]}
            >
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}

          <Text style={styles.practiceHint}>
            🌟 Find five animals correctly to
            finish the lesson!
          </Text>
        </>
      )}

      {/* STAGE 3: COMPLETED */}
      {stage === 'complete' && (
        <>
          <Pressable
            onPress={finishLesson}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆🎉⭐
            </Text>

            <Text style={styles.completeTitle}>
              Lesson Complete!
            </Text>

            <Text style={styles.completeSubtitle}>
              Amazing work, little superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You found five animals correctly!
              You're becoming an animal expert!
            </Text>

            <View style={styles.rewardCircle}>
              <Text style={styles.rewardEmoji}>
                🦁
              </Text>
            </View>

            <Text style={styles.rewardText}>
              Animal Explorer!
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={playAgain}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              🔄 Play Again
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={finishLesson}
            style={styles.finishButton}
          >
            <Text style={styles.finishButtonText}>
              Finish Lesson ✓
            </Text>
          </Pressable>
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
    fontSize: 15,
    fontWeight: '800',
    color: C.primary,
  },

  header: {
    backgroundColor: '#DDF3E6',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 24,
  },

  practiceHeader: {
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  headerEmoji: {
    fontSize: 42,
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

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },

  instructions: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },

  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  animalCard: {
    width: '48%',
    minHeight: 155,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  animalImage: {
    width: '100%',
    height: 106,
    borderRadius: 14,
    backgroundColor: C.white,
  },

  animalName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginTop: 9,
  },

  tapHint: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
    marginTop: 5,
  },

  pressed: {
    opacity: 0.8,
  },

  selectedCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  selectedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 9,
  },

  selectedSentence: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 15,
  },

  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },

  listenText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },

  encouragementCard: {
    backgroundColor: '#E9E1FF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },

  encouragementTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  encouragementText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  mainButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 15,
  },

  mainButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },

  roundCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  roundTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  progressTrack: {
    width: '100%',
    height: 12,
    backgroundColor: C.white,
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#42A66B',
  },

  instructionCard: {
    backgroundColor: '#E9E1FF',
    padding: 22,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },

  questionEmoji: {
    fontSize: 37,
    marginBottom: 8,
  },

  questionText: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 16,
  },

  correctCard: {
    borderColor: '#42A66B',
    borderWidth: 3,
  },

  wrongCard: {
    borderColor: '#E66A6A',
    borderWidth: 3,
  },

  feedbackCard: {
    padding: 17,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  feedbackText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },

  practiceHint: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 5,
  },

  completeCard: {
    backgroundColor: '#DDF3E6',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    marginBottom: 22,
  },

  completeEmoji: {
    fontSize: 53,
    marginBottom: 15,
  },

  completeTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  completeSubtitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
    marginTop: 12,
  },

  completeDescription: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },

  rewardCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 23,
  },

  rewardEmoji: {
    fontSize: 70,
  },

  rewardText: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginTop: 14,
  },

  finishButton: {
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
  },

  finishButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
});
