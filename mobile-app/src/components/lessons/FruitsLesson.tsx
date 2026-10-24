
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
} from 'react-native';

import * as Speech from 'expo-speech';

import {
  LearningColors as C,
} from '@/constants/learning-theme';

type FruitsLessonProps = {
  onExit: () => void;
};

type LessonStage = 'learn' | 'practice' | 'complete';

type Fruit = {
  name: string;
  image: number;
  color: string;
};

// The six fruits from our original website.
const fruits: Fruit[] = [
  {
    name: 'banana',
    image: require('../../../assets/fruits/banana.jpg'),
    color: '#FFF0B3',
  },
  {
    name: 'apple',
    image: require('../../../assets/fruits/redapple.jpg'),
    color: '#FFD8DC',
  },
  {
    name: 'orange',
    image: require('../../../assets/fruits/orange.jpg'),
    color: '#FFE2C6',
  },
  {
    name: 'grape',
    image: require('../../../assets/fruits/grape.jpg'),
    color: '#E9DEFF',
  },
  {
    name: 'strawberry',
    image: require('../../../assets/fruits/strawberry.jpg'),
    color: '#FFDCE5',
  },
  {
    name: 'watermelon',
    image: require('../../../assets/fruits/watermelon.jpg'),
    color: '#DDF5DF',
  },
];

const REQUIRED_ROUNDS = 5;

// Use correct English articles.
function fruitSentence(name: string): string {
  const article =
    name === 'apple' || name === 'orange'
      ? 'an'
      : 'a';

  return `This is ${article} ${name}`;
}

// Speak using British English where available.
async function speak(text: string) {
  try {
    await Speech.stop();

    Speech.speak(text, {
      language: 'en-GB',
      rate: 0.8,
      pitch: 1,
    });
  } catch (error) {
    console.warn('Fruit speech error:', error);
  }
}

// Select a random fruit.
// Avoid repeating the previous target when possible.
function randomFruit(previousName?: string): Fruit {
  const available = fruits.filter(
    (fruit) => fruit.name !== previousName
  );

  const choices =
    available.length > 0 ? available : fruits;

  const randomIndex = Math.floor(
    Math.random() * choices.length
  );

  return choices[randomIndex];
}

export default function FruitsLesson({
  onExit,
}: FruitsLessonProps) {
  const [stage, setStage] =
    useState<LessonStage>('learn');

  const [fruitIndex, setFruitIndex] =
    useState(0);

  const [targetFruit, setTargetFruit] =
    useState<Fruit>(fruits[0]);

  const [correctRounds, setCorrectRounds] =
    useState(0);

  const [feedback, setFeedback] =
    useState('');

  const [answerLocked, setAnswerLocked] =
    useState(false);

  const popAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const roundTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const currentFruit = fruits[fruitIndex];

  // Clear any pending practice round.
  const clearRoundTimer = useCallback(() => {
    if (roundTimer.current !== null) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }
  }, []);

  // Stop speech and timers when leaving.
  useEffect(() => {
    return () => {
      clearRoundTimer();

      void Speech.stop().catch(() => {});
    };
  }, [clearRoundTimer]);

  // Automatically pronounce every fruit in Stage 1.
  useEffect(() => {
    if (stage !== 'learn') {
      return;
    }

    popAnimation.setValue(0.8);

    Animated.spring(popAnimation, {
      toValue: 1,
      friction: 5,
      tension: 85,
      useNativeDriver: true,
    }).start();

    void speak(
      fruitSentence(fruits[fruitIndex].name)
    );
  }, [fruitIndex, stage, popAnimation]);

  // Automatically announce each practice target.
  useEffect(() => {
    if (stage !== 'practice' || answerLocked) {
      return;
    }

    void speak(
      `Find the ${targetFruit.name}`
    );
  }, [stage, targetFruit, answerLocked]);

  // Move to the next fruit during learning.
  function nextFruit() {
    if (fruitIndex < fruits.length - 1) {
      setFruitIndex((previous) => previous + 1);
    } else {
      startPractice();
    }
  }

  // Start the practice activity.
  function startPractice() {
    clearRoundTimer();

    void Speech.stop().catch(() => {});

    const firstTarget = randomFruit();

    setTargetFruit(firstTarget);
    setCorrectRounds(0);
    setFeedback('');
    setAnswerLocked(false);
    setStage('practice');
  }

  // Check the selected fruit.
  function chooseFruit(selectedFruit: Fruit) {
    if (stage !== 'practice' || answerLocked) {
      return;
    }

    // Incorrect choice.
    if (selectedFruit.name !== targetFruit.name) {
      setFeedback('❌ Try again!');
      void speak('Try again');
      return;
    }

    // Correct choice.
    const newRounds = correctRounds + 1;

    setAnswerLocked(true);
    setCorrectRounds(newRounds);
    setFeedback('🌟 Good job!');

    void speak('Good job');

    clearRoundTimer();

    // Complete after five correct answers.
    if (newRounds >= REQUIRED_ROUNDS) {
      roundTimer.current = setTimeout(() => {
        roundTimer.current = null;

        setStage('complete');
        setFeedback('');

        void speak(
          'Great job! Lesson complete!'
        );
      }, 1300);

      return;
    }

    // Continue to the next random fruit.
    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      setTargetFruit(
        randomFruit(targetFruit.name)
      );

      setFeedback('');
      setAnswerLocked(false);
    }, 1600);
  }

  // Return to the learning stage.
  function backToLearning() {
    clearRoundTimer();

    void Speech.stop().catch(() => {});

    setStage('learn');
    setFeedback('');
    setAnswerLocked(false);
  }

  // Restart from the first fruit.
  function restartLesson() {
    clearRoundTimer();

    void Speech.stop().catch(() => {});

    setFruitIndex(0);
    setCorrectRounds(0);
    setFeedback('');
    setAnswerLocked(false);
    setStage('learn');
  }

  // Exit the lesson.
  function finishLesson() {
    clearRoundTimer();

    void Speech.stop().catch(() => {});

    onExit();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* STAGE 1: LEARN THE FRUITS */}
      {stage === 'learn' && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={finishLesson}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              🍎 🍌 🍇
            </Text>

            <Text style={styles.headerTitle}>
              Fruit Adventure!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's discover six delicious fruits!
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Fruit {fruitIndex + 1} of {fruits.length}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((fruitIndex + 1) /
                        fruits.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={[
              styles.fruitCard,
              {
                backgroundColor:
                  currentFruit.color,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>
              Meet the Fruit! 🌟
            </Text>

            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [
                    { scale: popAnimation },
                  ],
                },
              ]}
            >
              <Image
                source={currentFruit.image}
                style={styles.fruitImage}
                resizeMode="contain"
                accessibilityLabel={
                  currentFruit.name
                }
              />
            </Animated.View>

            <Text style={styles.fruitName}>
              {currentFruit.name
                .charAt(0)
                .toUpperCase() +
                currentFruit.name.slice(1)}
            </Text>

            <Text style={styles.fruitSentence}>
              {fruitSentence(currentFruit.name)}!
            </Text>

            <Text style={styles.audioHint}>
              🔊 Listen to the fruit!
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void speak(
                  fruitSentence(currentFruit.name)
                )
              }
              style={({ pressed }) => [
                styles.listenButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.listenText}>
                🔊 Listen Again
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={nextFruit}
            style={({ pressed }) => [
              styles.mainButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.mainButtonText}>
              {fruitIndex === fruits.length - 1
                ? 'Start Fruit Practice →'
                : 'Next Fruit →'}
            </Text>
          </Pressable>

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              ⭐ You're learning so many fruits!
            </Text>
          </View>
        </>
      )}

      {/* STAGE 2: FRUIT PRACTICE */}
      {stage === 'practice' && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={backToLearning}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Fruits
            </Text>
          </Pressable>

          <View style={styles.practiceHeader}>
            <Text style={styles.headerEmoji}>
              🍓 🎯 🍉
            </Text>

            <Text style={styles.headerTitle}>
              Find the Fruit!
            </Text>

            <Text style={styles.headerSubtitle}>
              Look carefully and choose
              the correct picture!
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Correct Answers: {correctRounds} / {REQUIRED_ROUNDS}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (correctRounds /
                        REQUIRED_ROUNDS) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionEmoji}>
              👀
            </Text>

            <Text style={styles.instructionText}>
              Find the {targetFruit.name}!
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void speak(
                  `Find the ${targetFruit.name}`
                )
              }
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Tap the correct fruit! 👇
          </Text>

          <View style={styles.fruitGrid}>
            {fruits.map((fruit) => (
              <Pressable
                key={fruit.name}
                accessibilityRole="button"
                accessibilityLabel={
                  `Choose ${fruit.name}`
                }
                disabled={answerLocked}
                onPress={() =>
                  chooseFruit(fruit)
                }
                style={({ pressed }) => [
                  styles.choiceCard,
                  {
                    backgroundColor: fruit.color,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={fruit.image}
                  style={styles.choiceImage}
                  resizeMode="contain"
                />

                <Text style={styles.choiceName}>
                  {fruit.name
                    .charAt(0)
                    .toUpperCase() +
                    fruit.name.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {feedback !== '' && (
            <View
              style={[
                styles.feedbackCard,
                {
                  backgroundColor:
                    feedback.includes('Good')
                      ? '#DDF6E3'
                      : '#FFE1E5',
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

      {/* STAGE 3: LESSON COMPLETE */}
      {stage === 'complete' && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={finishLesson}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🎉 🌟
            </Text>

            <Text style={styles.completeTitle}>
              Fruit Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You learned six fruits and
              answered five questions correctly!
            </Text>

            <Text style={styles.stars}>
              ⭐ ⭐ ⭐
            </Text>

            <Text style={styles.wellDone}>
              Amazing work!
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={restartLesson}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              🔄 Learn Again
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
    color: C.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },

  header: {
    backgroundColor: '#FFE4E9',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  practiceHeader: {
    backgroundColor: '#E6DFFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#42A66B',
    borderRadius: 8,
  },

  fruitCard: {
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 17,
  },

  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: C.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },

  fruitImage: {
    width: '92%',
    height: '92%',
  },

  fruitName: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },

  fruitSentence: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
  },

  audioHint: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },

  listenButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 13,
    minHeight: 44,
    justifyContent: 'center',
  },

  listenText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  mainButton: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 17,
  },

  mainButtonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  encouragementCard: {
    backgroundColor: C.green,
    borderRadius: 23,
    padding: 18,
    alignItems: 'center',
  },

  encouragementText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },

  instructionCard: {
    backgroundColor: '#DBEEFF',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },

  instructionEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },

  instructionText: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 18,
  },

  fruitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  choiceCard: {
    width: '48%',
    minHeight: 165,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  choiceImage: {
    width: '100%',
    height: 110,
  },

  choiceName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
    marginTop: 8,
    textAlign: 'center',
  },

  feedbackCard: {
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  feedbackText: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  completeCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },

  completeEmoji: {
    fontSize: 55,
    marginBottom: 15,
  },

  completeTitle: {
    fontSize: 28,
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
    marginTop: 22,
  },

  wellDone: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginTop: 17,
  },

  finishButton: {
    backgroundColor: C.blue,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },

  finishButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
});
