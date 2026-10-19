import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.helloText}>Hello, Mary’s Learner 👋</Text>
            <Text style={styles.subText}>
              Ready for today’s language adventure?
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>😊</Text>
          </View>
        </View>

        {/* Language Card */}
        <View style={styles.languageCard}>
          <View>
            <Text style={styles.smallLabel}>Current Language</Text>
            <Text style={styles.languageName}>English 🇬🇧</Text>
            <Text style={styles.languageSubtext}>
              Practice words, stories, and games
            </Text>
          </View>

          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Learning */}
        <View style={styles.continueCard}>
          <Text style={styles.continueTitle}>Continue Learning</Text>
          <Text style={styles.continueLesson}>Alphabet Lesson</Text>
          <Text style={styles.continueSubtext}>
            Pick up where you left off and keep learning new words.
          </Text>

          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <Text style={styles.sectionTitle}>My Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressText}>3 of 10 lessons completed</Text>
            <Text style={styles.progressPercent}>30%</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
        </View>

        {/* Learning Features */}
        <Text style={styles.sectionTitle}>Explore Activities</Text>
        <View style={styles.grid}>
          <View style={[styles.featureCard, { backgroundColor: '#FFE3E3' }]}>
            <Text style={styles.featureEmoji}>📚</Text>
            <Text style={styles.featureTitle}>Lessons</Text>
            <Text style={styles.featureText}>Learn new words and topics</Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: '#E3F2FF' }]}>
            <Text style={styles.featureEmoji}>🧠</Text>
            <Text style={styles.featureTitle}>Quizzes</Text>
            <Text style={styles.featureText}>Test what you’ve learned</Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: '#FFF0C9' }]}>
            <Text style={styles.featureEmoji}>🎮</Text>
            <Text style={styles.featureTitle}>Games</Text>
            <Text style={styles.featureText}>Play and learn at the same time</Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: '#E8E1FF' }]}>
            <Text style={styles.featureEmoji}>📖</Text>
            <Text style={styles.featureTitle}>Stories</Text>
            <Text style={styles.featureText}>Read fun learning stories</Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: '#DFF7E2' }]}>
            <Text style={styles.featureEmoji}>🏅</Text>
            <Text style={styles.featureTitle}>Badges</Text>
            <Text style={styles.featureText}>See your rewards and achievements</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  headerCard: {
    backgroundColor: '#FFBFA3',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  helloText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A2E2A',
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: '#5B4A43',
    maxWidth: 220,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF3EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },

  languageCard: {
    backgroundColor: '#D9F1FF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallLabel: {
    fontSize: 12,
    color: '#4B6470',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24333A',
  },
  languageSubtext: {
    fontSize: 13,
    color: '#5A717B',
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  changeButtonText: {
    fontWeight: 'bold',
    color: '#3C5966',
  },

  continueCard: {
    backgroundColor: '#FFE6F1',
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
  },
  continueTitle: {
    fontSize: 14,
    color: '#7A5264',
    marginBottom: 6,
  },
  continueLesson: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#402A34',
    marginBottom: 6,
  },
  continueSubtext: {
    fontSize: 13,
    color: '#6A5560',
    marginBottom: 15,
  },
  startButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF8C94',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F2F2F',
    marginBottom: 12,
  },

  progressCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#5E5742',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5742',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E9DFB2',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#F4B400',
    borderRadius: 10,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#433A1B',
  },
  statLabel: {
    fontSize: 12,
    color: '#6A6245',
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  featureEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2F2F2F',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#5D5D5D',
    lineHeight: 17,
  },
});