
import React, { useEffect, useRef, useState } from 'react';

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

type ColorsLessonProps = {
  onExit: () => void;
};

type ColorItem = {
  name: string;
  image: ImageSourcePropType;
  color: string;
};

type LessonStage = 'learn' | 'animation';

// Give children time to hear and recognize each color.
const COLOR_DURATION = 5500;

// Same colors and images as the original website.
const colors: ColorItem[] = [
  {
    name: 'Red',
    image: require('../../../assets/colors/watermelon.jpg'),
    color: '#E74C3C',
  },
  {
    name: 'Blue',
    image: require('../../../assets/colors/blueball.jpg'),
    color: '#3498DB',
  },
  {
    name: 'Yellow',
    image: require('../../../assets/colors/yellowbanana.jpg'),
    color: '#F4C542',
  },
  {
    name: 'Orange',
    image: require('../../../assets/colors/orange.jpg'),
    color: '#F28C28',
  },
  {
    name: 'Purple',
    image: require('../../../assets/colors/grape.jpg'),
    color: '#9956D6',
  },
  {
    name: 'White',
    image: require('../../../assets/colors/whitebunny.jpg'),
    color: '#FFFFFF',
  },
  {
    name: 'Green',
    image: require('../../../assets/colors/green.jpg'),
    color: '#43A65E',
  },
];

// Pronounce using British English where available.
async function speakColor(name: string) {
  try {
    await Speech.stop();

    Speech.speak(`This is ${name.toLowerCase()}`, {
      language: 'en-GB',
      rate: 0.75,
      pitch: 1,
    });
  } catch (error) {
    console.warn('Colors lesson speech error:', error);
  }
}

export default function ColorsLesson({
  onExit,
}: ColorsLessonProps) {
  const [stage, setStage] =
    useState<LessonStage>('learn');

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [activeColorIndex, setActiveColorIndex] =
    useState(0);

  const popAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const pulseAnimation = useRef(
    new Animated.Value(1)
  ).current;

  const currentColor = colors[currentIndex];
  const activeColor = colors[activeColorIndex];

  // Stop speech when the lesson closes.
  useEffect(() => {
    return () => {
      void Speech.stop().catch(() => {});
    };
  }, []);

  // STAGE 1:
  // Speak automatically when the lesson opens
  // and whenever the child moves to another color.
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

    void speakColor(colors[currentIndex].name);
  }, [currentIndex, stage, popAnimation]);

  // STAGE 2:
  // Change the highlighted color every 5.5 seconds.
  useEffect(() => {
    if (stage !== 'animation') {
      return;
    }

    const timer = setInterval(() => {
      setActiveColorIndex((previous) => {
        return (previous + 1) % colors.length;
      });
    }, COLOR_DURATION);

    return () => {
      clearInterval(timer);
    };
  }, [stage]);

  // STAGE 2:
  // Announce every highlighted color automatically.
  useEffect(() => {
    if (stage !== 'animation') {
      return;
    }

    pulseAnimation.setValue(0.85);

    Animated.spring(pulseAnimation, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();

    void speakColor(colors[activeColorIndex].name);
  }, [activeColorIndex, stage, pulseAnimation]);

  // Go to the next color in Stage 1.
  function nextColor() {
    if (currentIndex < colors.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      startColorAnimation();
    }
  }

  // Start the color animation.
  function startColorAnimation() {
    void Speech.stop().catch(() => {});

    setActiveColorIndex(0);
    setStage('animation');
  }

  // Return from Stage 2 to Stage 1.
  function backToColors() {
    void Speech.stop().catch(() => {});
    setStage('learn');
  }

  // Restart the entire lesson.
  function replayLesson() {
    void Speech.stop().catch(() => {});

    setCurrentIndex(0);
    setActiveColorIndex(0);
    setStage('learn');
  }

  // Finish and return to Categories.
  function finishLesson() {
    void Speech.stop().catch(() => {});
    onExit();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {stage === 'learn' ? (
        <>
          {/* BACK BUTTON */}
          <Pressable
            accessibilityRole="button"
            onPress={finishLesson}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Go Back
            </Text>
          </Pressable>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>
              🌈 🎨 ✨
            </Text>

            <Text style={styles.headerTitle}>
              Color Adventure!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's discover seven beautiful colors!
            </Text>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Color {currentIndex + 1} of {colors.length}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentIndex + 1) / colors.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* COLOR CARD */}
          <View style={styles.colorCard}>
            <Text style={styles.sectionTitle}>
              Meet the Color! 🌟
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
                source={currentColor.image}
                style={styles.colorImage}
                resizeMode="contain"
                accessibilityLabel={
                  `${currentColor.name} example`
                }
              />
            </Animated.View>

            <View style={styles.colorNameRow}>
              <View
                style={[
                  styles.colorDot,
                  {
                    backgroundColor:
                      currentColor.color,
                  },
                ]}
              />

              <Text style={styles.colorName}>
                {currentColor.name}
              </Text>
            </View>

            <Text style={styles.colorSentence}>
              This is {currentColor.name.toLowerCase()}!
            </Text>

            <Text style={styles.audioHint}>
              🔊 Listen to the color!
            </Text>

            {/* REPEAT PRONUNCIATION */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                `Hear ${currentColor.name} again`
              }
              onPress={() =>
                void speakColor(currentColor.name)
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

          {/* NEXT COLOR */}
          <Pressable
            accessibilityRole="button"
            onPress={nextColor}
            style={({ pressed }) => [
              styles.mainButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.mainButtonText}>
              {currentIndex === colors.length - 1
                ? 'Start Color Animation →'
                : 'Next Color →'}
            </Text>
          </Pressable>

          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              ⭐ Every color makes the world brighter!
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* BACK BUTTON */}
          <Pressable
            accessibilityRole="button"
            onPress={backToColors}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ← Back to Colors
            </Text>
          </Pressable>

          {/* ANIMATION HEADER */}
          <View style={styles.animationHeader}>
            <Text style={styles.headerEmoji}>
              🌈 ✨ 🎉
            </Text>

            <Text style={styles.headerTitle}>
              Rainbow Color Show!
            </Text>

            <Text style={styles.headerSubtitle}>
              Watch and listen as the colors
              light up one by one!
            </Text>
          </View>

          {/* ACTIVE COLOR */}
          <View style={styles.activeColorCard}>
            <Text style={styles.activeColorHeading}>
              Look! It's...
            </Text>

            <Animated.View
              style={[
                styles.activeColorCircle,
                {
                  backgroundColor: activeColor.color,
                  transform: [
                    { scale: pulseAnimation },
                  ],
                },
              ]}
            />

            <Text style={styles.activeColorName}>
              {activeColor.name}
            </Text>

            <Text style={styles.audioHint}>
              🔊 Listen and learn!
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                `Hear ${activeColor.name} again`
              }
              onPress={() =>
                void speakColor(activeColor.name)
              }
              style={styles.listenButton}
            >
              <Text style={styles.listenText}>
                🔊 Hear Again
              </Text>
            </Pressable>
          </View>

          {/* ALL SEVEN COLORS */}
          <Text style={styles.sectionTitle}>
            Our Rainbow Colors! 🎨
          </Text>

          <View style={styles.colorGrid}>
            {colors.map((color, index) => {
              const isActive =
                activeColorIndex === index;

              return (
                <View
                  key={color.name}
                  style={[
                    styles.colorGridCard,
                    isActive && styles.activeGridCard,
                  ]}
                >
                  <View
                    style={[
                      styles.gridColorCircle,
                      {
                        backgroundColor: color.color,
                      },
                    ]}
                  />

                  <Text style={styles.gridColorName}>
                    {color.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* COMPLETION MESSAGE */}
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>
              🏆 🌟 🎉
            </Text>

            <Text style={styles.completeTitle}>
              You're a Color Superstar!
            </Text>

            <Text style={styles.completeDescription}>
              You've explored all seven colors.
              Amazing work!
            </Text>
          </View>

          {/* REPLAY */}
          <Pressable
            accessibilityRole="button"
            onPress={replayLesson}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>
              🔄 Learn Again
            </Text>
          </Pressable>

          {/* FINISH */}
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

  animationHeader: {
    backgroundColor: '#E9E1FF',
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

  colorCard: {
    backgroundColor: '#FFE6EF',
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
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    overflow: 'hidden',
  },

  colorImage: {
    width: '92%',
    height: '92%',
  },

  colorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#C9C9C9',
  },

  colorName: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
  },

  colorSentence: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
  },

  audioHint: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 14,
    textAlign: 'center',
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

  activeColorCard: {
    backgroundColor: '#DDF3E6',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 26,
  },

  activeColorHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 15,
  },

  activeColorCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#D3D3D3',
    marginBottom: 15,
  },

  activeColorName: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    marginBottom: 12,
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  colorGridCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  activeGridCard: {
    borderColor: '#42A66B',
    backgroundColor: '#E8FAEE',
  },

  gridColorCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    marginBottom: 9,
  },

  gridColorName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  completeCard: {
    backgroundColor: '#FFF0C7',
    borderRadius: 26,
    padding: 21,
    alignItems: 'center',
    marginBottom: 18,
  },

  completeEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },

  completeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  completeDescription: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
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
