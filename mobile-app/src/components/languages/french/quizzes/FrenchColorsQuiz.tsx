import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Props = { onExit: () => void };
type Stage = 'detective' | 'objects' | 'sorting' | 'complete';
type ColorId = 'rouge' | 'bleu' | 'jaune' | 'vert' | 'orange' | 'rose' | 'violet' | 'noir' | 'blanc' | 'marron';
type ColorInfo = { id: ColorId; french: string; english: string; hex: string; emoji: string; example: string };
type Question = { prompt: string; answer: ColorId; choices: ColorId[]; emoji?: string };

const COLORS: Record<ColorId, ColorInfo> = {
  rouge: { id: 'rouge', french: 'Rouge', english: 'Red', hex: '#EF4B57', emoji: '🍎', example: 'Une pomme' },
  bleu: { id: 'bleu', french: 'Bleu', english: 'Blue', hex: '#418DEB', emoji: '🦋', example: 'Un papillon' },
  jaune: { id: 'jaune', french: 'Jaune', english: 'Yellow', hex: '#FFD445', emoji: '🍋', example: 'Un citron' },
  vert: { id: 'vert', french: 'Vert', english: 'Green', hex: '#4DBC71', emoji: '🐸', example: 'Une grenouille' },
  orange: { id: 'orange', french: 'Orange', english: 'Orange', hex: '#FF9B42', emoji: '🥕', example: 'Une carotte' },
  rose: { id: 'rose', french: 'Rose', english: 'Pink', hex: '#FC86B7', emoji: '🌸', example: 'Une fleur' },
  violet: { id: 'violet', french: 'Violet', english: 'Purple', hex: '#9F77E6', emoji: '🍇', example: 'Du raisin' },
  noir: { id: 'noir', french: 'Noir', english: 'Black', hex: '#30353E', emoji: '🐈‍⬛', example: 'Un chat' },
  blanc: { id: 'blanc', french: 'Blanc', english: 'White', hex: '#FFFFFF', emoji: '☁️', example: 'Un nuage' },
  marron: { id: 'marron', french: 'Marron', english: 'Brown', hex: '#96613E', emoji: '🐻', example: 'Un ours' },
};

// Level 1: hear a color name, then find its colored circle.
const DETECTIVE: Question[] = [
  { prompt: 'Trouve la couleur rouge !', answer: 'rouge', choices: ['bleu', 'jaune', 'rouge', 'vert'] },
  { prompt: 'Trouve la couleur bleue !', answer: 'bleu', choices: ['rose', 'bleu', 'orange', 'violet'] },
  { prompt: 'Trouve la couleur jaune !', answer: 'jaune', choices: ['vert', 'jaune', 'marron', 'rouge'] },
  { prompt: 'Trouve la couleur verte !', answer: 'vert', choices: ['vert', 'orange', 'rose', 'bleu'] },
  { prompt: 'Trouve la couleur violette !', answer: 'violet', choices: ['jaune', 'marron', 'violet', 'rose'] },
];

// Level 2: match a spoken French color with a familiar pictured object.
const OBJECTS: Question[] = [
  { prompt: 'Quel objet est rouge ?', answer: 'rouge', choices: ['jaune', 'vert', 'rouge', 'orange'] },
  { prompt: 'Quel objet est jaune ?', answer: 'jaune', choices: ['bleu', 'jaune', 'rose', 'marron'] },
  { prompt: 'Quel objet est vert ?', answer: 'vert', choices: ['rouge', 'orange', 'vert', 'violet'] },
  { prompt: 'Quel objet est orange ?', answer: 'orange', choices: ['orange', 'rose', 'bleu', 'blanc'] },
  { prompt: 'Quel objet est marron ?', answer: 'marron', choices: ['jaune', 'marron', 'vert', 'rouge'] },
];

// Level 3: sort the object into its matching color basket.
const SORTING: Question[] = [
  { prompt: 'Dans quel panier va la pomme ?', answer: 'rouge', choices: ['rouge', 'vert', 'bleu', 'jaune'], emoji: '🍎' },
  { prompt: 'Dans quel panier va le citron ?', answer: 'jaune', choices: ['orange', 'jaune', 'rose', 'violet'], emoji: '🍋' },
  { prompt: 'Dans quel panier va la grenouille ?', answer: 'vert', choices: ['bleu', 'rouge', 'vert', 'marron'], emoji: '🐸' },
  { prompt: 'Dans quel panier va la carotte ?', answer: 'orange', choices: ['jaune', 'vert', 'orange', 'rose'], emoji: '🥕' },
  { prompt: 'Dans quel panier va le raisin ?', answer: 'violet', choices: ['marron', 'violet', 'bleu', 'rouge'], emoji: '🍇' },
];

const OPENING_DELAY = 1700;
const NEXT_DELAY = 1500;
const AFTER_SPEECH_PAUSE = 650;
const SPEECH_FALLBACK_DELAY = 6500;
const TITLES: Record<Exclude<Stage, 'complete'>, string> = {
  detective: 'Détective des couleurs',
  objects: 'Trouve le bon objet',
  sorting: 'Trie les couleurs',
};

export default function FrenchColorsQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('detective');
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<ColorId | null>(null);
  const [feedback, setFeedback] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  const voiceRef = useRef<string | undefined>(undefined);
  const speechGeneration = useRef(0);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSpeech = useCallback(() => {
    speechGeneration.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const clearAdvance = useCallback(() => {
    if (advanceRef.current !== null) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
  }, []);

  const speak = useCallback(async (words: string, onDone?: () => void) => {
    if (!soundRef.current) return;
    const generation = ++speechGeneration.current;
    try {
      await Speech.stop();
      if (generation !== speechGeneration.current || !soundRef.current) return;
      Speech.speak(words, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.84,
        pitch: 1,
        volume: 1,
        onDone: () => {
          if (generation === speechGeneration.current && soundRef.current) {
            onDone?.();
          }
        },
      });
    } catch (error) {
      console.warn('French Colors Quiz speech:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Speech.getAvailableVoicesAsync().then((voices) => {
      const preferred = voices.filter((voice) => voice.language.toLowerCase().startsWith('fr-fr'));
      const alternatives = voices.filter((voice) => voice.language.toLowerCase().startsWith('fr'));
      const best = preferred.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced)
        ?? preferred[0]
        ?? alternatives.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced)
        ?? alternatives[0];
      if (active) voiceRef.current = best?.identifier;
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const questions = stage === 'detective' ? DETECTIVE : stage === 'objects' ? OBJECTS : SORTING;
  const question = stage === 'complete' ? null : questions[index];
  const prompt = question?.prompt ?? '';

  useEffect(() => {
    if (stage === 'complete') return;
    setReady(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setReady(true);
      void speak(prompt);
    }, OPENING_DELAY);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [stage, index, prompt, speak, stopSpeech]);

  useEffect(() => {
    if (stage === 'complete') {
      void speak('Félicitations ! Tu as terminé le quiz des couleurs !');
    }
  }, [stage, speak]);

  useEffect(() => () => {
    clearAdvance();
    stopSpeech();
  }, [clearAdvance, stopSpeech]);

  function toggleSound() {
    const next = !soundRef.current;
    soundRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeech();
    else if (ready && stage !== 'complete') void speak(prompt);
  }

  function resetAnswer() {
    setSelected(null);
    setFeedback('');
    setLocked(false);
    setReady(false);
  }

  function choose(color: ColorId) {
    if (!question || !ready || locked) return;
    setSelected(color);
    if (color !== question.answer) {
      setFeedback('❌ Essaie encore !');
      void speak('Essaie encore !');
      return;
    }
    setLocked(true);
    setFeedback('🌟 Bravo ! Bonne réponse !');
    clearAdvance();

    // Keep the question on-screen while the praise is being spoken.
    // Only advance after the narrator finishes, with a short extra pause.
    const advanceQuestion = () => {
      clearAdvance();
      resetAnswer();
      if (index < questions.length - 1) {
        setIndex((current) => current + 1);
      } else if (stage === 'detective') {
        setStage('objects');
        setIndex(0);
      } else if (stage === 'objects') {
        setStage('sorting');
        setIndex(0);
      } else {
        setStage('complete');
      }
    };

    if (!soundRef.current) {
      // Muted: no speech to wait for.
      advanceRef.current = setTimeout(advanceQuestion, NEXT_DELAY);
    } else {
      const finishPraise = () => {
        clearAdvance();
        advanceRef.current = setTimeout(advanceQuestion, AFTER_SPEECH_PAUSE);
      };
      // Fallback avoids trapping the child if the device never fires onDone.
      advanceRef.current = setTimeout(advanceQuestion, SPEECH_FALLBACK_DELAY);
      void speak('Bravo ! Bonne réponse !', finishPraise);
    }
  }

  function replay() {
    clearAdvance();
    stopSpeech();
    resetAnswer();
    setIndex(0);
    setStage('detective');
  }

  function exit() {
    clearAdvance();
    stopSpeech();
    onExit();
  }

  function previous() {
    clearAdvance();
    stopSpeech();
    resetAnswer();
    if (stage === 'objects') { setStage('detective'); setIndex(0); }
    else if (stage === 'sorting') { setStage('objects'); setIndex(0); }
    else exit();
  }

  const progress = stage === 'complete' ? 15 : (stage === 'detective' ? 0 : stage === 'objects' ? 5 : 10) + index;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" style={styles.backButton} onPress={stage === 'complete' || stage === 'detective' ? exit : previous}>
          <Text style={styles.backText}>← {stage === 'complete' || stage === 'detective' ? 'Quiz' : 'Retour'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={[styles.soundButton, !soundOn && styles.muted]} onPress={toggleSound}>
          <Text style={styles.soundText}>{soundOn ? '🔊 Son activé' : '🔇 Son coupé'}</Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>🏆 🎨 🇫🇷</Text>
            <Text style={styles.completeTitle}>Champion des couleurs !</Text>
            <Text style={styles.completeMessage}>Bravo ! Tu as terminé les trois niveaux du quiz des couleurs !</Text>
            <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={replay}>
            <Text style={styles.primaryText}>🔄 Rejouer</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.finishButton} onPress={exit}>
            <Text style={styles.finishText}>Terminer ✓</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🇫🇷 🎨 🌈</Text>
            <Text style={styles.headerTitle}>Quiz des Couleurs</Text>
            <Text style={styles.headerSubtitle}>{TITLES[stage]}</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>Niveau {stage === 'detective' ? 1 : stage === 'objects' ? 2 : 3} sur 3 · Question {index + 1} sur 5</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${(progress / 15) * 100}%` }]} /></View>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionEmoji}>{stage === 'detective' ? '🔎' : stage === 'objects' ? '🧩' : '🧺'}</Text>
            <Text style={styles.questionText}>{ready ? prompt : 'Prépare-toi...'}</Text>
            {stage === 'sorting' && ready && <Text style={styles.sortingObject}>{question?.emoji}</Text>}
            <Text style={styles.readyText}>{ready ? 'À toi de jouer !' : 'Écoute bien la question.'}</Text>
            <Pressable accessibilityRole="button" disabled={!ready || !soundOn} style={[styles.listenButton, (!ready || !soundOn) && styles.disabled]} onPress={() => void speak(prompt)}>
              <Text style={styles.listenText}>🔊 Réécouter</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>{stage === 'objects' ? 'Choisis la bonne image 👇' : stage === 'sorting' ? 'Choisis le bon panier 👇' : 'Choisis la bonne couleur 👇'}</Text>
          <View style={styles.grid}>
            {question?.choices.map((id) => {
              const color = COLORS[id];
              const chosen = selected === id;
              return (
                <Pressable
                  key={`${stage}-${index}-${id}`}
                  accessibilityRole="button"
                  accessibilityLabel={stage === 'objects' ? color.example : color.french}
                  disabled={!ready || locked}
                  onPress={() => choose(id)}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    chosen && (id === question.answer ? styles.correct : styles.incorrect),
                    pressed && styles.pressed,
                    (!ready || locked) && styles.disabledChoice,
                  ]}
                >
                  {stage === 'objects' ? (
                    <>
                      <Text style={styles.objectEmoji}>{color.emoji}</Text>
                      <Text style={styles.choiceLabel}>{color.example}</Text>
                    </>
                  ) : (
                    <>
                      {stage === 'sorting' && <Text style={styles.basket}>🧺</Text>}
                      <View style={[styles.swatch, { backgroundColor: color.hex, borderColor: id === 'blanc' ? '#C3CAD5' : color.hex }]} />
                      {stage === 'sorting' && <Text style={styles.choiceLabel}>{color.french}</Text>}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
          {!!feedback && <View style={styles.feedbackCard}><Text style={styles.feedbackText}>{feedback}</Text></View>}
          <View style={styles.tipCard}><Text style={styles.tipText}>🌟 Écoute la question en français, puis choisis ta réponse !</Text></View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 48 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 8 },
  backButton: { backgroundColor: C.blue, borderRadius: 17, paddingHorizontal: 18, paddingVertical: 13, justifyContent: 'center' },
  backText: { color: C.primary, fontWeight: '800', fontSize: 15 },
  soundButton: { backgroundColor: '#DDF7E5', borderRadius: 17, paddingHorizontal: 13, paddingVertical: 13, justifyContent: 'center' },
  muted: { backgroundColor: '#F0EAF5' },
  soundText: { fontSize: 13, fontWeight: '800', color: C.text },
  header: { backgroundColor: '#DDEBFF', borderRadius: 27, padding: 21, alignItems: 'center', marginBottom: 18 },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 25, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: C.textSecondary, marginTop: 8, textAlign: 'center' },
  progressCard: { backgroundColor: '#FFF0C7', padding: 18, borderRadius: 20, marginBottom: 18 },
  progressText: { textAlign: 'center', color: C.text, fontSize: 14, fontWeight: '800' },
  track: { height: 12, borderRadius: 8, backgroundColor: C.white, overflow: 'hidden', marginTop: 11 },
  fill: { height: '100%', backgroundColor: '#43A866', borderRadius: 8 },
  questionCard: { backgroundColor: '#FFE5EF', borderRadius: 26, padding: 22, alignItems: 'center', marginBottom: 22 },
  questionEmoji: { fontSize: 38, marginBottom: 10 },
  questionText: { fontSize: 24, fontWeight: '800', color: C.text, textAlign: 'center', minHeight: 62 },
  readyText: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 14 },
  sortingObject: { fontSize: 72, marginVertical: 10 },
  listenButton: { backgroundColor: C.primary, borderRadius: 17, paddingHorizontal: 20, paddingVertical: 13 },
  listenText: { fontSize: 15, fontWeight: '800', color: C.white },
  disabled: { opacity: 0.45 },
  sectionTitle: { fontSize: 19, color: C.text, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 },
  choiceCard: { width: '48%', minHeight: 142, borderRadius: 23, backgroundColor: C.white, borderWidth: 3, borderColor: 'transparent', padding: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  swatch: { width: 78, height: 78, borderRadius: 39, borderWidth: 2 },
  basket: { fontSize: 28, marginBottom: 5 },
  objectEmoji: { fontSize: 66, marginBottom: 7 },
  choiceLabel: { color: C.text, fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  correct: { borderColor: '#2FA85A', backgroundColor: '#E6F9EA' },
  incorrect: { borderColor: '#EA6676', backgroundColor: '#FFF0F1' },
  pressed: { opacity: 0.8 },
  disabledChoice: { opacity: 0.78 },
  feedbackCard: { backgroundColor: '#FFF0C7', borderRadius: 19, padding: 17, alignItems: 'center', marginBottom: 16 },
  feedbackText: { color: C.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  tipCard: { backgroundColor: '#E9E1FF', borderRadius: 19, padding: 16 },
  tipText: { color: C.text, textAlign: 'center', lineHeight: 22, fontSize: 14 },
  completeCard: { backgroundColor: '#FFF0C7', borderRadius: 28, padding: 28, alignItems: 'center', marginTop: 25, marginBottom: 22 },
  completeEmoji: { fontSize: 52, marginBottom: 16 },
  completeTitle: { fontSize: 26, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 15 },
  completeMessage: { fontSize: 17, color: C.textSecondary, textAlign: 'center', lineHeight: 25 },
  stars: { fontSize: 35, marginTop: 20 },
  primaryButton: { backgroundColor: C.primary, borderRadius: 18, padding: 17, alignItems: 'center', marginBottom: 15 },
  primaryText: { color: C.white, fontWeight: '800', fontSize: 16 },
  finishButton: { backgroundColor: C.blue, borderRadius: 18, padding: 17, alignItems: 'center' },
  finishText: { color: C.primary, fontWeight: '800', fontSize: 16 },
});
