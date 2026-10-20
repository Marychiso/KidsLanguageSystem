
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';
import WavingKids from '@/components/waving-kids';

// Learning activities shown on the Dashboard
const activities = [
  {
    title: 'Lessons',
    emoji: '📚',
    description: 'Discover new words!',
    color: C.blue,
  },
  {
    title: 'Quizzes',
    emoji: '🧠',
    description: 'Show what you know!',
    color: C.pink,
  },
  {
    title: 'Games',
    emoji: '🎮',
    description: 'Play and learn!',
    color: C.yellow,
  },
  {
    title: 'Stories',
    emoji: '📖',
    description: 'Explore fun stories!',
    color: C.green,
  },
  {
    title: 'Badges',
    emoji: '🏅',
    description: 'Collect your rewards!',
    color: '#E8DFFF',
  },
];

export default function Dashboard() {
  // Return to Login or Welcome
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/cindy/welcome');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backButtonText}>
            ← Go Back
          </Text>
        </Pressable>

        {/* Welcome section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey, Little Superstar! 🌟
          </Text>

          <Text style={styles.subtitle}>
            Ready for another fun learning adventure?
          </Text>

          <View style={styles.illustration}>
            <WavingKids />
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.languageCard}>
          <Text style={styles.languageEmoji}>🌍</Text>

          <Text style={styles.languageTitle}>
            Let's Explore Languages!
          </Text>

          <Text style={styles.languageDescription}>
            English, French, Turkish, Spanish and more!
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose your language"
            style={({ pressed }) => [
              styles.languageButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push('/mary/language-selection')
            }
          >
            <Text style={styles.languageButtonText}>
              Choose Your Language →
            </Text>
          </Pressable>
        </View>

        {/* Continue Learning */}
        <View style={styles.continueCard}>
          <Text style={styles.continueEyebrow}>
            YOUR NEXT ADVENTURE
          </Text>

          <Text style={styles.continueTitle}>
            Keep Learning! 🚀
          </Text>

          <Text style={styles.continueDescription}>
            Choose a language to begin your learning journey.
          </Text>

          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>
              Your lessons will appear here
            </Text>
          </View>
        </View>

        {/* Learning Activities */}
        <Text style={styles.sectionTitle}>
          Let's Learn & Play! 🎉
        </Text>

        <View style={styles.grid}>
          {activities.map((activity) => (
            <View
              key={activity.title}
              style={[
                styles.activityCard,
                { backgroundColor: activity.color },
              ]}
            >
              <Text style={styles.activityEmoji}>
                {activity.emoji}
              </Text>

              <Text style={styles.activityTitle}>
                {activity.title}
              </Text>

              <Text style={styles.activityDescription}>
                {activity.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Learning Progress */}
        <Text style={styles.sectionTitle}>
          My Learning Journey ⭐
        </Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressEmoji}>🏆</Text>

          <Text style={styles.progressTitle}>
            Every Superstar Starts Somewhere!
          </Text>

          <Text style={styles.progressDescription}>
            Complete lessons, earn stars, and unlock badges
            as you learn.
          </Text>

          <View style={styles.progressPlaceholder}>
            <Text style={styles.progressPlaceholderText}>
              Your progress will appear here soon!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main screen
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 48,
  },

  // Back button
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 18,
    minHeight: 44,
    justifyContent: 'center',
  },

  backButtonText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  // Welcome header
  header: {
    marginBottom: 22,
  },

  greeting: {
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    lineHeight: 35,
  },

  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 8,
    marginBottom: 18,
  },

  illustration: {
    backgroundColor: C.blue,
    borderRadius: 28,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Language Selection
  languageCard: {
    backgroundColor: C.green,
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },

  languageEmoji: {
    fontSize: 48,
    marginBottom: 8,
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
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },

  languageButton: {
    backgroundColor: C.primary,
    borderRadius: 20,
    minHeight: 54,
    paddingHorizontal: 22,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  languageButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },

  // Continue Learning
  continueCard: {
    backgroundColor: C.pink,
    borderRadius: 26,
    padding: 22,
    marginBottom: 26,
  },

  continueEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  continueTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
  },

  continueDescription: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 15,
  },

  comingSoon: {
    backgroundColor: C.white,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  comingSoonText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Section headings
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 14,
  },

  // Learning Activities
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  activityCard: {
    width: '48%',
    minHeight: 145,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  activityDescription: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },

  // Learning Progress
  progressCard: {
    backgroundColor: C.yellow,
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
  },

  progressEmoji: {
    fontSize: 45,
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  progressDescription: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 16,
  },

  progressPlaceholder: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
  },

  progressPlaceholderText: {
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Button press effect
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
