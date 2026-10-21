
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

// Fun animated space adventure
function SpaceAdventure() {
  const rocketMotion = useRef(new Animated.Value(0)).current;
  const starMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rocketAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketMotion, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(rocketMotion, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    const starsAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(starMotion, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(starMotion, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    rocketAnimation.start();
    starsAnimation.start();

    return () => {
      rocketAnimation.stop();
      starsAnimation.stop();
    };
  }, [rocketMotion, starMotion]);

  const rocketFloat = rocketMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -16],
  });

  const rocketRotate = rocketMotion.interpolate({
    inputRange: [0, 1],
    outputRange: ['-9deg', '9deg'],
  });

  const starOpacity = starMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  const starScale = starMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <View style={styles.spaceCard}>
      <Animated.Text
        style={[
          styles.starOne,
          {
            opacity: starOpacity,
            transform: [{ scale: starScale }],
          },
        ]}
      >
        ⭐
      </Animated.Text>

      <Animated.Text
        style={[
          styles.starTwo,
          { opacity: starOpacity },
        ]}
      >
        ✨
      </Animated.Text>

      <Animated.Text
        style={[
          styles.starThree,
          {
            opacity: starOpacity,
            transform: [{ scale: starScale }],
          },
        ]}
      >
        🌟
      </Animated.Text>

      <Text style={styles.planet}>🪐</Text>

      <Animated.Text
        style={[
          styles.rocket,
          {
            transform: [
              { translateY: rocketFloat },
              { rotate: rocketRotate },
            ],
          },
        ]}
      >
        🚀
      </Animated.Text>

      <Text style={styles.spaceTitle}>
        Blast Off Into Learning!
      </Text>

      <Text style={styles.spaceSubtitle}>
        A whole world of words is waiting for you!
      </Text>
    </View>
  );
}

const learningSteps = [
  {
    number: '1',
    emoji: '🌍',
    title: 'Pick a Language',
    description: 'Choose a language you want to explore.',
    color: C.blue,
  },
  {
    number: '2',
    emoji: '🎯',
    title: 'Start Your Adventure',
    description: 'Enjoy lessons, stories, quizzes and games.',
    color: C.pink,
  },
  {
    number: '3',
    emoji: '🏆',
    title: 'Become a Superstar',
    description: 'Learn new things and collect rewards!',
    color: C.yellow,
  },
];

export default function Dashboard() {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cindy/welcome');
    }
  }

  function openLanguageSelection() {
    router.push('/mary/language-selection');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back Navigation */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </Pressable>

        {/* Welcome */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey, Little Superstar! 🌟
          </Text>

          <Text style={styles.subtitle}>
            Ready to discover something amazing today?
          </Text>
        </View>

        {/* New Animated Adventure */}
        <SpaceAdventure />

        {/* Language Selection */}
        <View style={styles.languageCard}>
          <Text style={styles.languageEmoji}>🌍</Text>

          <Text style={styles.languageTitle}>
            Where Shall We Explore?
          </Text>

          <Text style={styles.languageDescription}>
            Every language is a new adventure.
            Choose one and let's begin!
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose your language"
            onPress={openLanguageSelection}
            style={({ pressed }) => [
              styles.languageButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.languageButtonText}>
              Choose Your Language →
            </Text>
          </Pressable>
        </View>

        {/* Getting Started Section */}
        <Text style={styles.sectionTitle}>
          How to Start Your Adventure 🗺️
        </Text>

        <View style={styles.stepsContainer}>
          {learningSteps.map((step) => (
            <View
              key={step.number}
              style={[
                styles.stepCard,
                { backgroundColor: step.color },
              ]}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>
                  {step.number}
                </Text>
              </View>

              <Text style={styles.stepEmoji}>
                {step.emoji}
              </Text>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  {step.title}
                </Text>

                <Text style={styles.stepDescription}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Rewards */}
        <Text style={styles.sectionTitle}>
          My Superstar Rewards ⭐
        </Text>

        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsEmoji}>
            🏅 ⭐ 🏆
          </Text>

          <Text style={styles.rewardsTitle}>
            Amazing Rewards Await!
          </Text>

          <Text style={styles.rewardsDescription}>
            Every new word brings you closer to
            becoming a language superstar!
          </Text>

          <View style={styles.rewardsNotice}>
            <Text style={styles.rewardsNoticeText}>
              Your stars and badges will appear here
              as you learn.
            </Text>
          </View>
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>
            🌈✨
          </Text>

          <Text style={styles.motivationTitle}>
            Little Steps, Big Adventures!
          </Text>

          <Text style={styles.motivationDescription}>
            Learning something new every day
            makes you a superstar!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },

  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  header: {
    marginBottom: 16,
  },

  greeting: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    lineHeight: 36,
  },

  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 7,
    lineHeight: 22,
  },

  // Animated Space Section
  spaceCard: {
    backgroundColor: '#DCD6FF',
    borderRadius: 30,
    height: 255,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 22,
    marginBottom: 20,
    overflow: 'hidden',
  },

  rocket: {
    fontSize: 76,
    position: 'absolute',
    top: 35,
    alignSelf: 'center',
    zIndex: 2,
  },

  starOne: {
    position: 'absolute',
    left: 25,
    top: 32,
    fontSize: 31,
  },

  starTwo: {
    position: 'absolute',
    right: 38,
    top: 32,
    fontSize: 35,
  },

  starThree: {
    position: 'absolute',
    right: 46,
    top: 125,
    fontSize: 27,
  },

  planet: {
    position: 'absolute',
    left: 35,
    top: 119,
    fontSize: 40,
  },

  spaceTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 6,
  },

  spaceSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Language Selection
  languageCard: {
    backgroundColor: C.green,
    borderRadius: 28,
    padding: 23,
    alignItems: 'center',
    marginBottom: 27,
  },

  languageEmoji: {
    fontSize: 48,
    marginBottom: 9,
  },

  languageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  languageDescription: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 18,
  },

  languageButton: {
    backgroundColor: C.primary,
    borderRadius: 20,
    width: '100%',
    minHeight: 55,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  languageButtonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 15,
  },

  // Learning Steps
  stepsContainer: {
    marginBottom: 20,
  },

  stepCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  stepNumberText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  stepEmoji: {
    fontSize: 31,
    marginRight: 12,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },

  stepDescription: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
  },

  // Rewards Section
  rewardsCard: {
    backgroundColor: C.yellow,
    borderRadius: 27,
    padding: 23,
    alignItems: 'center',
    marginBottom: 20,
  },

  rewardsEmoji: {
    fontSize: 38,
    marginBottom: 12,
  },

  rewardsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  rewardsDescription: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 17,
  },

  rewardsNotice: {
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },

  rewardsNoticeText: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },

  // Motivation Section
  motivationCard: {
    backgroundColor: C.pink,
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
  },

  motivationEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },

  motivationTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  motivationDescription: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
});
