import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';

// Turkish has 29 letters. Q, W and X are not in the Turkish alphabet.
const LETTERS = [
  { letter: 'A', word: 'Arı', english: 'Bee', emoji: '🐝' },
  { letter: 'B', word: 'Balık', english: 'Fish', emoji: '🐟' },
  { letter: 'C', word: 'Ceviz', english: 'Walnut', emoji: '🌰' },
  { letter: 'Ç', word: 'Çiçek', english: 'Flower', emoji: '🌸' },
  { letter: 'D', word: 'Deniz', english: 'Sea', emoji: '🌊' },
  { letter: 'E', word: 'Elma', english: 'Apple', emoji: '🍎' },
  { letter: 'F', word: 'Fil', english: 'Elephant', emoji: '🐘' },
  { letter: 'G', word: 'Göz', english: 'Eye', emoji: '👁️' },
  { letter: 'Ğ', word: 'Dağ', english: 'Mountain', emoji: '🏔️' },
  { letter: 'H', word: 'Havuç', english: 'Carrot', emoji: '🥕' },
  { letter: 'I', word: 'Işık', english: 'Light', emoji: '💡' },
  { letter: 'İ', word: 'İnek', english: 'Cow', emoji: '🐄' },
  { letter: 'J', word: 'Jilet', english: 'Razor', emoji: '🔤' },
  { letter: 'K', word: 'Kedi', english: 'Cat', emoji: '🐱' },
  { letter: 'L', word: 'Limon', english: 'Lemon', emoji: '🍋' },
  { letter: 'M', word: 'Muz', english: 'Banana', emoji: '🍌' },
  { letter: 'N', word: 'Nar', english: 'Pomegranate', emoji: '❤️' },
  { letter: 'O', word: 'Okul', english: 'School', emoji: '🏫' },
  { letter: 'Ö', word: 'Ördek', english: 'Duck', emoji: '🦆' },
  { letter: 'P', word: 'Panda', english: 'Panda', emoji: '🐼' },
  { letter: 'R', word: 'Renk', english: 'Color', emoji: '🎨' },
  { letter: 'S', word: 'Su', english: 'Water', emoji: '💧' },
  { letter: 'Ş', word: 'Şemsiye', english: 'Umbrella', emoji: '☂️' },
  { letter: 'T', word: 'Top', english: 'Ball', emoji: '⚽' },
  { letter: 'U', word: 'Uçak', english: 'Airplane', emoji: '✈️' },
  { letter: 'Ü', word: 'Üzüm', english: 'Grapes', emoji: '🍇' },
  { letter: 'V', word: 'Vazo', english: 'Vase', emoji: '🏺' },
  { letter: 'Y', word: 'Yıldız', english: 'Star', emoji: '⭐' },
  { letter: 'Z', word: 'Zebra', english: 'Zebra', emoji: '🦓' },
] as const;

const PURPLE = '#6842AD';
const DARK = '#302849';
const BACKGROUND = '#F6F2FF';

export default function TurkishAlphabetLesson() {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [finished, setFinished] = useState(false);
  const current = LETTERS[index];

  const spokenText = current.letter === 'Ğ'
    ? 'Yumuşak ge. Dağ.'
    : `${current.letter}. ${current.word}.`;

  // Speak automatically on the first card, whenever the child changes
  // letters, and when sound is turned back on. Clear the timer and stop
  // the previous narration before starting another card.
  useEffect(() => {
    if (finished || !soundOn) {
      void Speech.stop();
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      await Speech.stop();
      if (!cancelled) {
        Speech.speak(spokenText, { language: 'tr-TR', rate: 0.78, pitch: 1 });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      void Speech.stop();
    };
  }, [index, soundOn, finished, spokenText]);

  const speakCurrent = () => {
    if (!soundOn || finished) return;
    void Speech.stop().then(() => {
      Speech.speak(spokenText, { language: 'tr-TR', rate: 0.78, pitch: 1 });
    });
  };

  useEffect(() => {
    if (!finished || !soundOn) return;
    const timer = setTimeout(() => {
      Speech.speak('Harika! Türk alfabesini tamamladın!', {
        language: 'tr-TR',
        rate: 0.8,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [finished, soundOn]);

  const goBack = () => {
    Speech.stop();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'turkish', activity: 'lessons' },
      });
    }
  };

  const next = () => {
    Speech.stop();
    if (index === LETTERS.length - 1) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const previous = () => {
    Speech.stop();
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const replay = () => {
    Speech.stop();
    setIndex(0);
    setFinished(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity accessibilityRole="button" onPress={goBack} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              Speech.stop();
              setSoundOn((value) => !value);
            }}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>TÜRKÇE • TURKISH</Text>
        <Text style={styles.heading}>Türk Alfabesi 🇹🇷</Text>
        <Text style={styles.subtitle}>Learn the 29 letters of the Turkish alphabet!</Text>

        {finished ? (
          <View style={styles.card}>
            <Text style={styles.celebration}>🏆🎉🌟</Text>
            <Text style={styles.word}>Harika!</Text>
            <Text style={styles.english}>Amazing! You learned all 29 Turkish letters.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={replay}>
              <Text style={styles.primaryText}>🔁 Learn Again</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={goBack}>
              <Text style={styles.secondaryText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Letter {index + 1} of {LETTERS.length}</Text>
              <Text style={styles.progressText}>{Math.round(((index + 1) / LETTERS.length) * 100)}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((index + 1) / LETTERS.length) * 100}%` }]} />
            </View>

            <View style={styles.card}>
              <View style={styles.letterCircle}>
                <Text style={styles.bigLetter}>{current.letter}</Text>
              </View>
              <Text style={styles.emoji}>{current.emoji}</Text>
              <Text style={styles.word}>{current.word}</Text>
              <Text style={styles.english}>{current.english}</Text>
              {current.letter === 'Ğ' && (
                <Text style={styles.note}>Ğ is called “yumuşak ge” (soft g). Hear it in “dağ.”</Text>
              )}
              {current.letter === 'I' && (
                <Text style={styles.note}>I (dotless) and İ (dotted) are different Turkish letters.</Text>
              )}
              <TouchableOpacity accessibilityRole="button" onPress={speakCurrent} style={styles.listenButton}>
                <Text style={styles.listenText}>🔊 Hear Turkish</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navigation}>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={index === 0}
                style={[styles.secondaryButton, styles.navButton, index === 0 && styles.disabled]}
                onPress={previous}
              >
                <Text style={styles.secondaryText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={[styles.primaryButton, styles.navButton]} onPress={next}>
                <Text style={styles.primaryText}>{index === LETTERS.length - 1 ? 'Finish 🎉' : 'Next →'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  smallButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18 },
  smallButtonText: { color: PURPLE, fontSize: 14, fontWeight: '700' },
  eyebrow: { color: PURPLE, fontWeight: '800', letterSpacing: 2, textAlign: 'center', fontSize: 12 },
  heading: { color: DARK, fontWeight: '900', textAlign: 'center', fontSize: 29, marginTop: 8 },
  subtitle: { color: '#766E8D', textAlign: 'center', fontSize: 15, marginTop: 8, marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  progressText: { color: '#6C6282', fontWeight: '700' },
  track: { backgroundColor: '#E1D8F7', height: 11, borderRadius: 12, overflow: 'hidden', marginBottom: 22 },
  fill: { backgroundColor: '#8C71D9', height: '100%', borderRadius: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 22,
    paddingVertical: 28, alignItems: 'center', shadowColor: '#9276CA',
    shadowOpacity: 0.11, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  letterCircle: {
    height: 126, width: 126, borderRadius: 63, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E9DDFF',
  },
  bigLetter: { fontSize: 82, fontWeight: '900', color: PURPLE, lineHeight: 106 },
  emoji: { fontSize: 74, marginTop: 18, marginBottom: 4 },
  celebration: { fontSize: 65, marginVertical: 30 },
  word: { fontSize: 32, color: DARK, fontWeight: '900', textAlign: 'center' },
  english: { fontSize: 18, color: '#7C728E', textAlign: 'center', marginTop: 6 },
  note: { textAlign: 'center', color: '#655B76', fontSize: 14, marginTop: 12, lineHeight: 21 },
  listenButton: {
    backgroundColor: '#E8F4FF', paddingHorizontal: 25, paddingVertical: 15,
    borderRadius: 20, marginTop: 24,
  },
  listenText: { color: '#3064B0', fontWeight: '800', fontSize: 17 },
  navigation: { flexDirection: 'row', gap: 12, marginTop: 24 },
  navButton: { flex: 1 },
  primaryButton: { backgroundColor: PURPLE, paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#E9DFFB', paddingVertical: 17, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  secondaryText: { color: PURPLE, fontWeight: '800', fontSize: 16 },
  disabled: { opacity: 0.4 },
});
