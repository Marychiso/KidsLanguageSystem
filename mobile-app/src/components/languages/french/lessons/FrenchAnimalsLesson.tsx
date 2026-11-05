import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Animal = {
  french: string;
  english: string;
  description: string;
  image: number;
  background: string;
};

// Reuse the animal pictures already in the English lessons and quizzes.
const ANIMALS: Animal[] = [
  {
    french: 'Le chien',
    english: 'Dog',
    description: 'Voici un chien. Le chien fait ouaf, ouaf !',
    image: require('../../../../../assets/animals/dog.jpg'),
    background: '#FFE8D1',
  },
  {
    french: 'Le chat',
    english: 'Cat',
    description: 'Voici un chat. Le chat fait miaou !',
    image: require('../../../../../assets/animals/cat.jpg'),
    background: '#FFE1EC',
  },
  {
    french: 'La vache',
    english: 'Cow',
    description: 'Voici une vache. La vache fait meuh !',
    image: require('../../../../../assets/animals/cow.jpg'),
    background: '#E1F6E8',
  },
  {
    french: 'Le lion',
    english: 'Lion',
    description: 'Voici un lion. Le lion rugit !',
    image: require('../../../../../assets/animals/lion.jpg'),
    background: '#FFF0BE',
  },
  {
    french: "L'éléphant",
    english: 'Elephant',
    description: "Voici un éléphant. L'éléphant est très grand !",
    image: require('../../../../../assets/animals/elephant.jpg'),
    background: '#E5E5FF',
  },
  {
    french: "L'oiseau",
    english: 'Bird',
    description: "Voici un oiseau. L'oiseau peut voler !",
    image: require('../../../../../assets/animals/bird.jpg'),
    background: '#DDF2FF',
  },
  {
    french: 'Le poisson',
    english: 'Fish',
    description: 'Voici un poisson. Le poisson nage dans l’eau !',
    image: require('../../../../../assets/animals/fish.jpg'),
    background: '#D9F5F3',
  },
];

const OPENING_DELAY_MS = 1400;

export default function FrenchAnimalsLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const voiceRef = useRef<string | undefined>(undefined);
  const soundOnRef = useRef(true);
  const speechGeneration = useRef(0);

  const animal = ANIMALS[index];

  const stopSpeech = useCallback(() => {
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
      ) return;

      Speech.speak(text, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.83,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French Animals narration:', error);
    }
  }, []);

  // Choose the best French (France) voice offered by this device.
  useEffect(() => {
    let active = true;
    async function selectVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const frFR = voices.filter((voice) =>
          voice.language.toLowerCase().startsWith('fr-fr')
        );
        const french = voices.filter((voice) =>
          voice.language.toLowerCase().startsWith('fr')
        );
        const selected =
          frFR.find((voice) =>
            voice.quality === Speech.VoiceQuality.Enhanced
          ) ?? frFR[0] ?? french[0];
        if (active) voiceRef.current = selected?.identifier;
      } catch (error) {
        console.warn('French Animals voice selection:', error);
      }
    }
    void selectVoice();
    return () => { active = false; };
  }, []);

  // Wait briefly before displaying and narrating each new animal.
  useEffect(() => {
    if (completed) return;
    setReady(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setReady(true);
      void speak(animal.description);
    }, OPENING_DELAY_MS);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [index, completed, animal.description, speak, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) {
      stopSpeech();
    } else if (completed) {
      void speak('Bravo ! Tu connais les animaux en français !');
    } else if (ready) {
      void speak(animal.description);
    }
  }

  function backToCategories() {
    stopSpeech();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'french', activity: 'lessons' },
      });
    }
  }

  function nextAnimal() {
    if (!ready) return;
    stopSpeech();
    if (index < ANIMALS.length - 1) {
      setIndex((previous) => previous + 1);
    } else {
      setCompleted(true);
      void speak('Bravo ! Tu connais les animaux en français !');
    }
  }

  function previousAnimal() {
    stopSpeech();
    if (completed) {
      setCompleted(false);
    } else if (index > 0) {
      setIndex((previous) => previous - 1);
    } else {
      backToCategories();
    }
  }

  function replayLesson() {
    stopSpeech();
    setIndex(0);
    setReady(false);
    setCompleted(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={backToCategories}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={toggleSound}
            style={styles.soundButton}
            accessibilityLabel={soundOn ? 'Turn sound off' : 'Turn sound on'}
          >
            <Text style={styles.soundText}>
              {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
            </Text>
          </Pressable>
        </View>

        {completed ? (
          <>
            <View style={styles.completeCard}>
              <Text style={styles.completeEmoji}>🏆 🇫🇷 🐾</Text>
              <Text style={styles.completeTitle}>Bravo !</Text>
              <Text style={styles.completeSubtitle}>
                Tu connais les animaux en français !
              </Text>
              <Text style={styles.englishTranslation}>
                Great job! You learned seven animal names in French.
              </Text>
              <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
            </View>
            <Pressable onPress={replayLesson} style={styles.primaryButton}>
              <Text style={styles.primaryText}>🔄 Recommencer</Text>
            </Pressable>
            <Pressable onPress={backToCategories} style={styles.finishButton}>
              <Text style={styles.finishText}>Terminer ✓</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🇫🇷 🐶 🐱</Text>
              <Text style={styles.headerTitle}>Les Animaux</Text>
              <Text style={styles.headerSubtitle}>
                Meet our animal friends in French!
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressText}>
                Animal {index + 1} of {ANIMALS.length}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((index + 1) / ANIMALS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.animalCard, { backgroundColor: animal.background }]}>
              <Text style={styles.prompt}>
                {ready ? 'Écoute et répète !' : 'Prépare-toi...'}
              </Text>
              <View style={styles.imageFrame}>
                <Image
                  source={animal.image}
                  style={styles.animalImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.frenchWord}>
                {ready ? animal.french : '•••'}
              </Text>
              <Text style={styles.englishTranslation}>
                {ready ? animal.english : 'Get ready to listen!'}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={!ready || !soundOn}
                onPress={() => void speak(animal.description)}
                style={[
                  styles.listenButton,
                  (!ready || !soundOn) && styles.disabled,
                ]}
              >
                <Text style={styles.listenText}>🔊 Écouter encore</Text>
              </Pressable>
            </View>

            <View style={styles.navigationRow}>
              <Pressable
                accessibilityRole="button"
                onPress={previousAnimal}
                style={styles.previousButton}
              >
                <Text style={styles.previousText}>← Précédent</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!ready}
                onPress={nextAnimal}
                style={[styles.nextButton, !ready && styles.disabled]}
              >
                <Text style={styles.nextText}>
                  {index === ANIMALS.length - 1 ? 'Terminer ✓' : 'Suivant →'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                🌟 Tip: Look at the animal, listen to the French name,
                and say it out loud!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 48 },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 18, gap: 8,
  },
  backButton: {
    backgroundColor: C.blue, borderRadius: 17,
    paddingVertical: 13, paddingHorizontal: 17,
  },
  backText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  soundButton: {
    backgroundColor: '#DDF7E5', borderRadius: 17,
    paddingVertical: 13, paddingHorizontal: 15,
  },
  soundText: { color: C.text, fontSize: 14, fontWeight: '800' },
  header: {
    backgroundColor: '#DDEBFF', borderRadius: 28, padding: 22,
    alignItems: 'center', marginBottom: 17,
  },
  headerEmoji: { fontSize: 37, marginBottom: 9 },
  headerTitle: { color: C.text, fontSize: 26, fontWeight: '800' },
  headerSubtitle: {
    color: C.textSecondary, fontSize: 15,
    textAlign: 'center', marginTop: 9,
  },
  progressCard: {
    backgroundColor: '#FFF0C7', borderRadius: 19,
    padding: 17, marginBottom: 18,
  },
  progressText: {
    color: C.text, fontSize: 15, fontWeight: '800',
    textAlign: 'center', marginBottom: 11,
  },
  progressTrack: {
    backgroundColor: C.white, height: 12,
    borderRadius: 8, overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#43A866', height: '100%', borderRadius: 8,
  },
  animalCard: {
    borderRadius: 28, padding: 24,
    alignItems: 'center', marginBottom: 19,
  },
  prompt: {
    fontSize: 20, fontWeight: '800', color: C.text,
    textAlign: 'center', marginBottom: 18,
  },
  imageFrame: {
    width: '100%', height: 215, backgroundColor: C.white,
    borderRadius: 25, padding: 13, marginBottom: 16,
  },
  animalImage: { width: '100%', height: '100%' },
  frenchWord: {
    color: C.text, fontSize: 30, fontWeight: '800',
    textAlign: 'center', marginBottom: 6,
  },
  englishTranslation: {
    color: C.textSecondary, fontSize: 16,
    textAlign: 'center', lineHeight: 24,
  },
  listenButton: {
    backgroundColor: C.primary, borderRadius: 17,
    marginTop: 20, paddingHorizontal: 23, paddingVertical: 14,
  },
  listenText: { color: C.white, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  navigationRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    gap: 12, marginBottom: 20,
  },
  previousButton: {
    flex: 1, backgroundColor: C.blue, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center',
  },
  previousText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  nextButton: {
    flex: 1, backgroundColor: C.primary, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center',
  },
  nextText: { color: C.white, fontSize: 15, fontWeight: '800' },
  tipCard: { backgroundColor: '#E9E1FF', borderRadius: 19, padding: 17 },
  tipText: { color: C.text, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  completeCard: {
    backgroundColor: '#FFF0C7', borderRadius: 28, padding: 30,
    alignItems: 'center', marginTop: 35, marginBottom: 20,
  },
  completeEmoji: { fontSize: 50, marginBottom: 16 },
  completeTitle: {
    fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 13,
  },
  completeSubtitle: {
    fontSize: 20, fontWeight: '800', color: C.text,
    textAlign: 'center', marginBottom: 13,
  },
  stars: { fontSize: 35, marginTop: 22 },
  primaryButton: {
    backgroundColor: C.primary, borderRadius: 18,
    padding: 17, alignItems: 'center', marginBottom: 15,
  },
  primaryText: { color: C.white, fontSize: 16, fontWeight: '800' },
  finishButton: {
    backgroundColor: C.blue, borderRadius: 18,
    padding: 16, alignItems: 'center',
  },
  finishText: { color: C.primary, fontSize: 16, fontWeight: '800' },
});
