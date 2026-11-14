import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Props = { onExit: () => void };
type Stage = 'sounds' | 'clues' | 'parade' | 'complete';
type AnimalName = 'dog' | 'cat' | 'cow' | 'lion' | 'elephant' | 'bird' | 'fish';
type Animal = {
  name: AnimalName;
  french: string;
  emoji: string;
  image: number;
  background: string;
};

const ANIMALS: Animal[] = [
  { name: 'dog', french: 'Le chien', emoji: '🐶', image: require('../../../../../assets/animals/dog.jpg'), background: '#FFE5CB' },
  { name: 'cat', french: 'Le chat', emoji: '🐱', image: require('../../../../../assets/animals/cat.jpg'), background: '#FFE0EB' },
  { name: 'cow', french: 'La vache', emoji: '🐮', image: require('../../../../../assets/animals/cow.jpg'), background: '#E2F5E5' },
  { name: 'lion', french: 'Le lion', emoji: '🦁', image: require('../../../../../assets/animals/lion.jpg'), background: '#FFF0BA' },
  { name: 'elephant', french: "L'éléphant", emoji: '🐘', image: require('../../../../../assets/animals/elephant.jpg'), background: '#E2E5FF' },
  { name: 'bird', french: "L'oiseau", emoji: '🐦', image: require('../../../../../assets/animals/bird.jpg'), background: '#DDF2FF' },
  { name: 'fish', french: 'Le poisson', emoji: '🐟', image: require('../../../../../assets/animals/fish.jpg'), background: '#D9F5F3' },
];

const SOUND_QUESTIONS: { sound: string; answer: AnimalName }[] = [
  { sound: 'Meuh !', answer: 'cow' },
  { sound: 'Ouaf, ouaf !', answer: 'dog' },
  { sound: 'Miaou !', answer: 'cat' },
];

const CLUE_QUESTIONS: { prompt: string; answer: AnimalName }[] = [
  { prompt: 'Quel animal peut voler ?', answer: 'bird' },
  { prompt: 'Quel animal est très grand ?', answer: 'elephant' },
  { prompt: 'Quel animal rugit ?', answer: 'lion' },
];

const SOUND_CHOICES = ANIMALS.filter(a => ['cow', 'dog', 'cat'].includes(a.name));
const CLUE_CHOICES = ANIMALS.filter(a => ['bird', 'elephant', 'lion'].includes(a.name));
const PARADE_ROUNDS = 3;
const QUESTION_DELAY = 1500;
const FEEDBACK_DELAY = 1500;
const PARADE_INTERVAL = 950;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FrenchAnimalsQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('sounds');
  const [soundIndex, setSoundIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [paradeCorrect, setParadeCorrect] = useState(0);
  const [paradeOrder, setParadeOrder] = useState<Animal[]>(() => shuffle(ANIMALS));
  const [visibleCount, setVisibleCount] = useState(0);
  const [paradePhase, setParadePhase] = useState<'watch' | 'answer'>('watch');
  const [questionVisible, setQuestionVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [chosen, setChosen] = useState<AnimalName | null>(null);
  const [feedback, setFeedback] = useState('');
  const [soundOn, setSoundOn] = useState(true);

  const soundOnRef = useRef(true);
  const voiceRef = useRef<string | undefined>(undefined);
  const speechToken = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSpeaking = useCallback(() => {
    speechToken.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const speak = useCallback(async (message: string) => {
    if (!soundOnRef.current) return;
    const token = ++speechToken.current;
    try {
      await Speech.stop();
      if (token !== speechToken.current || !soundOnRef.current) return;
      Speech.speak(message, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.84,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French Animals Quiz narration:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync()
      .then(voices => {
        const french = voices.filter(v => v.language.toLowerCase().startsWith('fr-fr'));
        const otherFrench = voices.filter(v => v.language.toLowerCase().startsWith('fr'));
        const best = french.find(v => v.quality === Speech.VoiceQuality.Enhanced)
          ?? french[0] ?? otherFrench[0];
        if (active) voiceRef.current = best?.identifier;
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => () => {
    clearAdvance();
    stopSpeaking();
  }, [clearAdvance, stopSpeaking]);

  const currentQuestion = stage === 'sounds'
    ? `Quel animal fait ${SOUND_QUESTIONS[soundIndex].sound}`
    : stage === 'clues'
      ? CLUE_QUESTIONS[clueIndex].prompt
      : 'Quel animal était le premier ?';

  // Hide new questions until the short opening pause has passed.
  useEffect(() => {
    if (stage !== 'sounds' && stage !== 'clues' && !(stage === 'parade' && paradePhase === 'answer')) return;
    setQuestionVisible(false);
    stopSpeaking();
    const timer = setTimeout(() => {
      setQuestionVisible(true);
      void speak(currentQuestion);
    }, QUESTION_DELAY);
    return () => { clearTimeout(timer); stopSpeaking(); };
  }, [stage, soundIndex, clueIndex, paradePhase, currentQuestion, speak, stopSpeaking]);

  // Display the parade one animal at a time, then ask about the first.
  useEffect(() => {
    if (stage !== 'parade' || paradePhase !== 'watch') return;
    if (visibleCount === 0) void speak('Regarde bien le défilé des animaux !');
    const timer = setTimeout(() => {
      if (visibleCount < paradeOrder.length) setVisibleCount(n => n + 1);
      else setParadePhase('answer');
    }, visibleCount === 0 ? QUESTION_DELAY : PARADE_INTERVAL);
    return () => clearTimeout(timer);
  }, [stage, paradePhase, visibleCount, paradeOrder, speak]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeaking();
    else if (questionVisible && stage !== 'complete') void speak(currentQuestion);
    else if (stage === 'parade' && paradePhase === 'watch') void speak('Regarde bien le défilé des animaux !');
  }

  function resetAnswer() {
    setChosen(null);
    setFeedback('');
    setLocked(false);
    setQuestionVisible(false);
  }

  function startParade() {
    clearAdvance();
    stopSpeaking();
    resetAnswer();
    setParadeCorrect(0);
    setParadeOrder(shuffle(ANIMALS));
    setVisibleCount(0);
    setParadePhase('watch');
    setStage('parade');
  }

  function nextParade() {
    stopSpeaking();
    resetAnswer();
    setParadeOrder(shuffle(ANIMALS));
    setVisibleCount(0);
    setParadePhase('watch');
  }

  function handleAnswer(animal: Animal) {
    if (locked || !questionVisible || stage === 'complete') return;
    const answer = stage === 'sounds' ? SOUND_QUESTIONS[soundIndex].answer
      : stage === 'clues' ? CLUE_QUESTIONS[clueIndex].answer
      : paradeOrder[0].name;
    setChosen(animal.name);
    if (animal.name !== answer) {
      setFeedback('❌ Essaie encore !');
      void speak('Essaie encore !');
      return;
    }

    setLocked(true);
    setFeedback('🌟 Bravo !');
    void speak('Bravo !');
    clearAdvance();
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      if (stage === 'sounds') {
        if (soundIndex + 1 < SOUND_QUESTIONS.length) {
          resetAnswer();
          setSoundIndex(i => i + 1);
        } else {
          resetAnswer();
          setClueIndex(0);
          setStage('clues');
        }
      } else if (stage === 'clues') {
        if (clueIndex + 1 < CLUE_QUESTIONS.length) {
          resetAnswer();
          setClueIndex(i => i + 1);
        } else startParade();
      } else if (stage === 'parade') {
        const next = paradeCorrect + 1;
        setParadeCorrect(next);
        if (next >= PARADE_ROUNDS) {
          stopSpeaking();
          setStage('complete');
          resetAnswer();
          void speak('Félicitations ! Tu as terminé le quiz des animaux !');
        } else nextParade();
      }
    }, FEEDBACK_DELAY);
  }

  function back() {
    clearAdvance();
    stopSpeaking();
    resetAnswer();
    if (stage === 'complete' || stage === 'sounds') {
      onExit();
    } else if (stage === 'clues') {
      setSoundIndex(0);
      setStage('sounds');
    } else {
      setClueIndex(0);
      setStage('clues');
    }
  }

  function replay() {
    clearAdvance();
    stopSpeaking();
    setSoundIndex(0);
    setClueIndex(0);
    setParadeCorrect(0);
    setParadeOrder(shuffle(ANIMALS));
    setVisibleCount(0);
    setParadePhase('watch');
    resetAnswer();
    setStage('sounds');
  }

  const choices = stage === 'sounds' ? SOUND_CHOICES : stage === 'clues' ? CLUE_CHOICES : ANIMALS;
  const correctName = stage === 'sounds' ? SOUND_QUESTIONS[soundIndex].answer
    : stage === 'clues' ? CLUE_QUESTIONS[clueIndex].answer : paradeOrder[0].name;
  const progress = stage === 'sounds' ? soundIndex : stage === 'clues' ? clueIndex : paradeCorrect;
  const title = stage === 'sounds' ? 'Les Sons des Animaux'
    : stage === 'clues' ? 'Devine l’Animal' : 'Le Défilé des Animaux';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={back} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={toggleSound} style={styles.soundButton}>
          <Text style={styles.soundButtonText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>🏆 🇫🇷 🐾</Text>
            <Text style={styles.completeTitle}>Bravo, champion !</Text>
            <Text style={styles.completeDescription}>
              Tu as réussi les sons, les devinettes et les trois défilés !
            </Text>
            <Text style={styles.translation}>You completed all three animal challenges!</Text>
            <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
          </View>
          <Pressable style={styles.mainButton} onPress={replay}>
            <Text style={styles.mainButtonText}>🔄 Rejouer</Text>
          </Pressable>
          <Pressable style={styles.finishButton} onPress={back}>
            <Text style={styles.finishButtonText}>Terminer ✓</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>{stage === 'sounds' ? '🐮 🐶 🐱' : stage === 'clues' ? '🐦 🐘 🦁' : '🐾 🎪 ⭐'}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>
              {stage === 'sounds' ? 'Écoute et trouve le bon animal !'
                : stage === 'clues' ? 'Écoute les indices !' : 'Observe et souviens-toi du premier animal !'}
            </Text>
          </View>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {stage === 'sounds' ? `Son ${soundIndex + 1} sur 3`
                : stage === 'clues' ? `Question ${clueIndex + 1} sur 3`
                  : `Défilé ${paradeCorrect + 1} sur ${PARADE_ROUNDS}`}
            </Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${(progress / 3) * 100}%` }]} /></View>
          </View>

          {stage === 'parade' && paradePhase === 'watch' ? (
            <View style={styles.paradeCard}>
              <Text style={styles.questionText}>Regarde bien ! 👀</Text>
              <Text style={styles.hint}>Remember the first animal.</Text>
              <View style={styles.paradeGrid}>
                {paradeOrder.slice(0, visibleCount).map(animal => (
                  <View key={animal.name} style={styles.paradeAnimal}>
                    <Image source={animal.image} style={styles.paradeImage} resizeMode="contain" />
                  </View>
                ))}
              </View>
              <Text style={styles.hint}>{visibleCount === 0 ? 'Prépare-toi...' : `${visibleCount} / ${ANIMALS.length}`}</Text>
            </View>
          ) : (
            <>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionEmoji}>{stage === 'sounds' ? '👂' : stage === 'clues' ? '🧠' : '👀'}</Text>
                <Text style={styles.questionText}>{questionVisible ? currentQuestion : 'Prépare-toi...'}</Text>
                <Text style={styles.hint}>{questionVisible ? 'À toi de jouer !' : 'Écoute bien...'}</Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={!soundOn || !questionVisible}
                  onPress={() => void speak(currentQuestion)}
                  style={[styles.listenButton, (!soundOn || !questionVisible) && styles.disabled]}
                >
                  <Text style={styles.listenText}>🔊 Réécouter</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionTitle}>Choisis le bon animal ! 👇</Text>
              <View style={styles.animalGrid}>
                {choices.map(animal => (
                  <Pressable
                    key={animal.name}
                    accessibilityRole="button"
                    accessibilityLabel={animal.french}
                    disabled={!questionVisible || locked}
                    onPress={() => handleAnswer(animal)}
                    style={({ pressed }) => [
                      styles.animalCard,
                      { backgroundColor: animal.background },
                      chosen === animal.name && (animal.name === correctName ? styles.correctCard : styles.wrongCard),
                      pressed && styles.pressed,
                      (!questionVisible || locked) && styles.disabled,
                    ]}
                  >
                    <Image source={animal.image} style={styles.animalImage} resizeMode="contain" />
                    <Text style={styles.animalName}>{animal.french}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {feedback !== '' && <View style={styles.feedbackCard}><Text style={styles.feedbackText}>{feedback}</Text></View>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 52 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 10 },
  backButton: { backgroundColor: C.blue, borderRadius: 17, paddingHorizontal: 17, paddingVertical: 12 },
  backText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  soundButton: { backgroundColor: '#DDF7E5', borderRadius: 17, paddingHorizontal: 16, paddingVertical: 12 },
  soundButtonText: { fontSize: 14, fontWeight: '800', color: C.text },
  header: { backgroundColor: '#DDEBFF', padding: 23, borderRadius: 28, alignItems: 'center', marginBottom: 20 },
  headerEmoji: { fontSize: 38, marginBottom: 10 },
  headerTitle: { fontSize: 25, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 9 },
  progressCard: { backgroundColor: '#FFF0C7', borderRadius: 20, padding: 17, marginBottom: 19 },
  progressText: { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' },
  track: { height: 12, backgroundColor: C.white, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#42A66B', borderRadius: 8 },
  instructionCard: { backgroundColor: '#FFE5EF', borderRadius: 26, padding: 21, alignItems: 'center', marginBottom: 22 },
  instructionEmoji: { fontSize: 38, marginBottom: 8 },
  questionText: { fontSize: 24, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 11 },
  hint: { fontSize: 14, color: C.textSecondary, marginBottom: 14, textAlign: 'center' },
  listenButton: { backgroundColor: C.primary, borderRadius: 17, paddingHorizontal: 22, paddingVertical: 13 },
  listenText: { color: C.white, fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 17 },
  animalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  animalCard: { width: '48%', minHeight: 155, borderRadius: 22, padding: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 3, borderColor: 'transparent' },
  animalImage: { width: '100%', height: 106 },
  animalName: { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center', marginTop: 8 },
  correctCard: { borderColor: '#2FA85A' },
  wrongCard: { borderColor: '#EA6676' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.52 },
  feedbackCard: { backgroundColor: '#FFF0C7', padding: 18, borderRadius: 20, marginBottom: 16, alignItems: 'center' },
  feedbackText: { fontSize: 21, fontWeight: '800', color: C.text, textAlign: 'center' },
  paradeCard: { backgroundColor: '#E9E1FF', padding: 20, borderRadius: 26, marginBottom: 20, alignItems: 'center' },
  paradeGrid: { width: '100%', minHeight: 145, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 12 },
  paradeAnimal: { width: '29%', height: 88, margin: '2%', backgroundColor: C.white, borderRadius: 16, padding: 5 },
  paradeImage: { width: '100%', height: '100%' },
  completeCard: { backgroundColor: '#FFF0C7', borderRadius: 28, padding: 28, alignItems: 'center', marginTop: 26, marginBottom: 24 },
  completeEmoji: { fontSize: 50, marginBottom: 14 },
  completeTitle: { fontSize: 27, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 12 },
  completeDescription: { fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center', lineHeight: 25 },
  translation: { fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 10 },
  stars: { fontSize: 34, marginTop: 21 },
  mainButton: { backgroundColor: C.primary, borderRadius: 18, padding: 17, alignItems: 'center', marginBottom: 15 },
  mainButtonText: { color: C.white, fontSize: 16, fontWeight: '800' },
  finishButton: { backgroundColor: C.blue, borderRadius: 18, padding: 16, alignItems: 'center' },
  finishButtonText: { color: C.primary, fontSize: 16, fontWeight: '800' },
});
