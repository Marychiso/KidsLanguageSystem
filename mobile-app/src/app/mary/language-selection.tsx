
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningColors as C } from '@/constants/learning-theme';

// Available languages and their flag images
const languages: {
  id: string;
  name: string;
  greeting: string;
  flag: ImageSourcePropType;
  color: string;
}[] = [
  {
    id: 'english',
    name: 'English',
    greeting: 'Hello!',
    flag: require('../../../assets/flags/english.png'),
    color: C.blue,
  },
  {
    id: 'french',
    name: 'French',
    greeting: 'Bonjour!',
    flag: require('../../../assets/flags/french.png'),
    color: C.pink,
  },
  {
    id: 'turkish',
    name: 'Turkish',
    greeting: 'Merhaba!',
    flag: require('../../../assets/flags/turkish.png'),
    color: '#FFE5D0',
  },
  {
    id: 'spanish',
    name: 'Spanish',
    greeting: '¡Hola!',
    flag: require('../../../assets/flags/spanish.png'),
    color: C.yellow,
  },
  {
    id: 'chinese',
    name: 'Chinese',
    greeting: '你好!',
    flag: require('../../../assets/flags/chinese.png'),
    color: '#E8DFFF',
  },
  {
    id: 'swahili',
    name: 'Swahili',
    greeting: 'Jambo!',
    flag: require('../../../assets/flags/swahili.png'),
    color: C.green,
  },
];

export default function LanguageSelection() {
  // Return to the Dashboard
  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/mary/dashboard');
    }
  }

  // Open the Learning page for selected language
  function selectLanguage(language: string) {
    router.push({
      pathname: '/mary/learning',
      params: { language },
    });
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
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>
            ← Go Back
          </Text>
        </Pressable>

        {/* Welcome header */}
        <View style={styles.header}>
          <Text style={styles.globe}>🌍</Text>

          <Text style={styles.heading}>
            Choose Your Language!
          </Text>

          <Text style={styles.subtitle}>
            Hello, Little Explorer! 🌟
          </Text>

          <Text style={styles.description}>
            Every language is a new adventure.
            Which one will you explore today?
          </Text>
        </View>

        {/* Language cards */}
        <Text style={styles.sectionTitle}>
          Pick Your Adventure! 🚀
        </Text>

        <View style={styles.grid}>
          {languages.map((language) => (
            <Pressable
              key={language.id}
              accessibilityRole="button"
              accessibilityLabel={`Learn ${language.name}`}
              onPress={() => selectLanguage(language.id)}
              style={({ pressed }) => [
                styles.languageCard,
                { backgroundColor: language.color },
                pressed && styles.pressed,
              ]}
            >
              {/* Actual flag image */}
              <View style={styles.flagCircle}>
                <Image
                  source={language.flag}
                  style={styles.flagImage}
                  resizeMode="contain"
                  accessibilityLabel={`${language.name} flag`}
                />
              </View>

              <Text style={styles.languageName}>
                {language.name}
              </Text>

              <Text style={styles.greeting}>
                {language.greeting}
              </Text>

              <View style={styles.exploreButton}>
                <Text style={styles.exploreText}>
                  Explore →
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Encouragement section */}
        <View style={styles.footerCard}>
          <Text style={styles.footerEmoji}>
            ✨🎉✨
          </Text>

          <Text style={styles.footerTitle}>
            You're a Language Superstar!
          </Text>

          <Text style={styles.footerDescription}>
            Learn new words, make discoveries,
            and have fun along the way!
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
    paddingBottom: 45,
  },

  // Back navigation
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
    fontWeight: '700',
  },

  // Welcome header
  header: {
    backgroundColor: C.green,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    marginBottom: 26,
  },

  globe: {
    fontSize: 70,
    marginBottom: 12,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.primary,
    marginTop: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },

  // Language cards
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  languageCard: {
    width: '48%',
    borderRadius: 25,
    padding: 15,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 210,
    justifyContent: 'center',
  },

  // Flag image container
  flagCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  flagImage: {
    width: 58,
    height: 42,
  },

  languageName: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  exploreButton: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 10,
    marginTop: 14,
  },

  exploreText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
  },

  // Encouragement section
  footerCard: {
    backgroundColor: C.yellow,
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
    marginTop: 10,
  },

  footerEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },

  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },

  footerDescription: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
