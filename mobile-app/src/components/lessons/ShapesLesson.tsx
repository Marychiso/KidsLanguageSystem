
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

import Svg, {
  Circle,
  Ellipse,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

import * as Speech from 'expo-speech';

import {
  LearningColors as C,
} from '@/constants/learning-theme';

type ShapesLessonProps = {
  onExit: () => void;
};

type Stage =
  | 'learn'
  | 'practice'
  | 'match'
  | 'complete';

type ShapeName =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'oval'
  | 'star'
  | 'heart';

type ShapeItem = {
  name: ShapeName;
  color: string;
  background: string;
};

const shapes: ShapeItem[] = [
  {
    name: 'circle',
    color: '#FF6B8A',
    background: '#FFE3EC',
  },
  {
    name: 'square',
    color: '#4DABF7',
    background: '#DDEFFF',
  },
  {
    name: 'triangle',
    color: '#FFD43B',
    background: '#FFF4C7',
  },
  {
    name: 'rectangle',
    color: '#51CF66',
    background: '#E0F8E5',
  },
  {
    name: 'oval',
    color: '#B197FC',
    background: '#EDE5FF',
  },
  {
    name: 'star',
    color: '#FF922B',
    background: '#FFE8CF',
  },
  {
    name: 'heart',
    color: '#F06595',
    background: '#FFE0EC',
  },
];

const REQUIRED_ANSWERS = 5;

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Draw each shape directly using SVG.
// No external shape pictures are required.
function ShapePicture({
  name,
  color,
  size = 100,
  outline = false,
}: {
  name: ShapeName;
  color: string;
  size?: number;
  outline?: boolean;
}) {
  const fill = outline ? 'transparent' : color;
  const stroke = outline ? color : 'none';
  const strokeWidth = outline ? 5 : 0;

  const common = {
    fill,
    stroke,
    strokeWidth,
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
    >
      {name === 'circle' && (
        <Circle
          cx="60"
          cy="60"
          r="43"
          {...common}
        />
      )}

      {name === 'square' && (
        <Rect
          x="18"
          y="18"
          width="84"
          height="84"
          {...common}
        />
      )}

      {name === 'triangle' && (
        <Polygon
          points="60,12 110,105 10,105"
          strokeLinejoin="round"
          {...common}
        />
      )}

      {name === 'rectangle' && (
        <Rect
          x="8"
          y="32"
          width="104"
          height="56"
          {...common}
        />
      )}

      {name === 'oval' && (
        <Ellipse
          cx="60"
          cy="60"
          rx="51"
          ry="33"
          {...common}
        />
      )}

      {name === 'star' && (
        <Polygon
          points="60,8 73,44 111,44 81,67 93,106 60,83 27,106 39,67 9,44 47,44"
          strokeLinejoin="round"
          {...common}
        />
      )}

      {name === 'heart' && (
        <Path
          d="M60 106 C42 89 10 69 10 40 C10 13 44 8 60 32 C76 8 110 13 110 40 C110 69 78 89 60 106 Z"
          strokeLinejoin="round"
          {...common}
        />
      )}
    </Svg>
  );
}

// British English pronunciation where available.
async function speak(text: string) {
  try {
    await Speech.stop();

    Speech.speak(text, {
      language: 'en-GB',
      rate: 0.8,
      pitch: 1,
    });
  } catch (error) {
    console.warn('Shapes lesson speech error:', error);
  }
}

// Pick a random shape that is different
// from the previous one where possible.
function randomShape(previous?: ShapeName): ShapeItem {
  const choices = shapes.filter(
    (shape) => shape.name !== previous
  );

  const index = Math.floor(
    Math.random() * choices.length
  );

  return choices[index];
}

export default function ShapesLesson({
  onExit,
}: ShapesLessonProps) {
  const [stage, setStage] =
    useState<Stage>('learn');

  const [introIndex, setIntroIndex] =
    useState(0);

  const [targetShape, setTargetShape] =
    useState<ShapeItem>(shapes[0]);

  const [correctAnswers, setCorrectAnswers] =
    useState(0);

  const [feedback, setFeedback] =
    useState('');

  const [answerLocked, setAnswerLocked] =
    useState(false);

  const [matchedNames, setMatchedNames] =
    useState<ShapeName[]>([]);

  const [matchIndex, setMatchIndex] =
    useState(0);

  const popAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const roundTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const currentIntroShape = shapes[introIndex];
  const currentMatchShape = shapes[matchIndex];

  const clearRoundTimer = useCallback(() => {
    if (roundTimer.current !== null) {
      clearTimeout(roundTimer.current);
      roundTimer.current = null;
    }
  }, []);

  // Stop audio and pending activities on exit.
  useEffect(() => {
    return () => {
      clearRoundTimer();
      void Speech.stop().catch(() => {});
    };
  }, [clearRoundTimer]);

  // STAGE 1: Automatically introduce each shape.
  useEffect(() => {
    if (stage !== 'learn') {
      return;
    }

    popAnimation.setValue(0.8);

    Animated.spring(popAnimation, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    void speak(
      `This is a ${currentIntroShape.name}`
    );
  }, [introIndex, stage, popAnimation]);

  // STAGE 2: Announce the shape to find.
  useEffect(() => {
    if (stage !== 'practice' || answerLocked) {
      return;
    }

    void speak(
      `Find the ${targetShape.name}`
    );
  }, [stage, targetShape, answerLocked]);

  // STAGE 3: Announce the outline to match.
  useEffect(() => {
    if (stage !== 'match') {
      return;
    }

    void speak(
      `Match the ${currentMatchShape.name}`
    );
  }, [stage, matchIndex]);

  // Introduce the next shape.
  function nextIntro() {
    if (introIndex < shapes.length - 1) {
      setIntroIndex((previous) => previous + 1);
    } else {
      startPractice();
    }
  }

  // Begin the Find the Shape activity.
  function startPractice() {
    clearRoundTimer();

    setTargetShape(randomShape());
    setCorrectAnswers(0);
    setFeedback('');
    setAnswerLocked(false);
    setStage('practice');
  }

  // Check a practice answer.
  function chooseShape(selected: ShapeItem) {
    if (stage !== 'practice' || answerLocked) {
      return;
    }

    if (selected.name !== targetShape.name) {
      setFeedback('❌ Try again!');
      void speak('Oops! Try again');
      return;
    }

    const nextCount = correctAnswers + 1;

    setAnswerLocked(true);
    setCorrectAnswers(nextCount);
    setFeedback('🌟 Correct!');

    void speak('Yay! Correct!');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;

      setFeedback('');

      if (nextCount >= REQUIRED_ANSWERS) {
        startMatching();
      } else {
        setTargetShape(
          randomShape(targetShape.name)
        );
        setAnswerLocked(false);
      }
    }, 1700);
  }

  // Begin matching the shape outlines.
  function startMatching() {
    clearRoundTimer();

    setMatchedNames([]);
    setMatchIndex(0);
    setFeedback('');
    setAnswerLocked(false);
    setStage('match');
  }

  // Tap a shape to match it with the outline.
  function chooseMatch(selected: ShapeItem) {
    if (stage !== 'match' || answerLocked) {
      return;
    }

    if (
      selected.name !== currentMatchShape.name
    ) {
      setFeedback('❌ Not quite! Try again.');
      void speak('Try again');
      return;
    }

    const updatedMatches = [
      ...matchedNames,
      selected.name,
    ];

    setMatchedNames(updatedMatches);
    setFeedback('🎉 Great match!');
    setAnswerLocked(true);

    void speak('Good job!');

    clearRoundTimer();

    roundTimer.current = setTimeout(() => {
      roundTimer.current = null;
      setFeedback('');

      if (updatedMatches.length === shapes.length) {
        setStage('complete');
        void speak(
          'Amazing work! Shapes lesson complete!'
        );
      } else {
        setMatchIndex((previous) => previous + 1);
        setAnswerLocked(false);
      }
    }, 1600);
  }

  // Return to the earlier learning stage.
  function backToLearning() {
    clearRoundTimer();
    void Speech.stop().catch(() => {});

    setFeedback('');
    setAnswerLocked(false);
    setStage('learn');
  }

  // Return from matching to practice.
  function backToPractice() {
    clearRoundTimer();
    void Speech.stop().catch(() => {});

    setFeedback('');
    setAnswerLocked(false);
    setTargetShape(randomShape());
    setStage('practice');
  }

  // Restart everything from the beginning.
  function restartLesson() {
    clearRoundTimer();
    void Speech.stop().catch(() => {});

    setIntroIndex(0);
    setCorrectAnswers(0);
    setMatchedNames([]);
    setMatchIndex(0);
    setFeedback('');
    setAnswerLocked(false);
    setStage('learn');
  }

  // Return to the English lesson categories.
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
      {/* STAGE 1: LEARN SHAPES */}
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
              🔺 🟦 ⭐
            </Text>

            <Text style={styles.headerTitle}>
              Shape Adventure!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's discover seven amazing shapes!
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Shape {introIndex + 1} of {shapes.length}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((introIndex + 1) /
                        shapes.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={[
              styles.learningCard,
              {
                backgroundColor:
                  currentIntroShape.background,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>
              Meet the Shape! ✨
            </Text>

            <Animated.View
              style={[
                styles.largeShapeArea,
                {
                  transform: [
                    { scale: popAnimation },
                  ],
                },
              ]}
            >
              <ShapePicture
                name={currentIntroShape.name}
                color={currentIntroShape.color}
                size={190}
              />
            </Animated.View>

            <Text style={styles.shapeTitle}>
              {capitalize(currentIntroShape.name)}
            </Text>

            <Text style={styles.shapeSentence}>
              This is a {currentIntroShape.name}!
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void speak(
                  `This is a ${currentIntroShape.name}`
                )
              }
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Listen Again
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={nextIntro}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              {introIndex === shapes.length - 1
                ? 'Start Shape Practice →'
                : 'Next Shape →'}
            </Text>
          </Pressable>

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              ⭐ Every shape is special!
            </Text>
          </View>
        </>
      )}

      {/* STAGE 2: FIND THE SHAPE */}
      {stage === 'practice' && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={backToLearning}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Shapes
            </Text>
          </Pressable>

          <View style={styles.practiceHeader}>
            <Text style={styles.headerEmoji}>
              🎯 🔍 ⭐
            </Text>

            <Text style={styles.headerTitle}>
              Find the Shape!
            </Text>

            <Text style={styles.headerSubtitle}>
              Listen carefully and tap the right shape!
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Correct: {correctAnswers} / {REQUIRED_ANSWERS}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (correctAnswers /
                        REQUIRED_ANSWERS) * 100
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
              Find the {targetShape.name}!
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void speak(
                  `Find the ${targetShape.name}`
                )
              }
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          <View style={styles.shapeGrid}>
            {shapes.map((shape) => (
              <Pressable
                key={shape.name}
                accessibilityRole="button"
                accessibilityLabel={
                  `Choose ${shape.name}`
                }
                disabled={answerLocked}
                onPress={() => chooseShape(shape)}
                style={({ pressed }) => [
                  styles.choiceCard,
                  {
                    backgroundColor:
                      shape.background,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <ShapePicture
                  name={shape.name}
                  color={shape.color}
                  size={85}
                />

                <Text style={styles.choiceName}>
                  {capitalize(shape.name)}
                </Text>
              </Pressable>
            ))}
          </View>

          {feedback !== '' && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}
        </>
      )}

      {/* STAGE 3: MATCH SHAPES */}
      {stage === 'match' && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={backToPractice}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Practice
            </Text>
          </Pressable>

          <View style={styles.matchHeader}>
            <Text style={styles.headerEmoji}>
              🧩 🌈 ⭐
            </Text>

            <Text style={styles.headerTitle}>
              Shape Matching!
            </Text>

            <Text style={styles.headerSubtitle}>
              Find the shape that fits the outline!
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Matched: {matchedNames.length} / {shapes.length}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (matchedNames.length /
                        shapes.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.matchTargetCard}>
            <Text style={styles.sectionTitle}>
              Match this shape! 👇
            </Text>

            <View style={styles.outlineArea}>
              <ShapePicture
                name={currentMatchShape.name}
                color={currentMatchShape.color}
                size={145}
                outline
              />
            </View>

            <Text style={styles.matchInstruction}>
              Find the {currentMatchShape.name}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void speak(
                  `Match the ${currentMatchShape.name}`
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
            Tap the matching shape!
          </Text>

          <View style={styles.shapeGrid}>
            {shapes
              .filter(
                (shape) =>
                  !matchedNames.includes(shape.name)
              )
              .map((shape) => (
                <Pressable
                  key={shape.name}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `Match ${shape.name}`
                  }
                  disabled={answerLocked}
                  onPress={() => chooseMatch(shape)}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    {
                      backgroundColor:
                        shape.background,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <ShapePicture
                    name={shape.name}
                    color={shape.color}
                    size={85}
                  />

                  <Text style={styles.choiceName}>
                    {capitalize(shape.name)}
                  </Text>
                </Pressable>
              ))}
          </View>

          {feedback !== '' && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
            </View>
          )}
        </>
      )}

      {/* STAGE 4: LESSON COMPLETE */}
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
              Shape Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You learned all seven shapes,
              found five correct shapes,
              and matched them all!
            </Text>

            <Text style={styles.stars}>
              ⭐ ⭐ ⭐
            </Text>

            <Text style={styles.wellDone}>
              Fantastic work!
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
    backgroundColor: '#DDEBFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  practiceHeader: {
    backgroundColor: '#E8DFFF',
    padding: 22,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  matchHeader: {
    backgroundColor: '#DDF6E5',
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

  learningCard: {
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

  largeShapeArea: {
    width: '100%',
    height: 230,
    backgroundColor: C.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  shapeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },

  shapeSentence: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
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

  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  choiceCard: {
    width: '48%',
    minHeight: 150,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: C.white,
  },

  choiceName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    marginTop: 8,
    textAlign: 'center',
  },

  feedbackCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  feedbackText: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  matchTargetCard: {
    backgroundColor: '#E6F1FF',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
  },

  outlineArea: {
    width: '100%',
    height: 180,
    backgroundColor: C.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  matchInstruction: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 15,
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
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
