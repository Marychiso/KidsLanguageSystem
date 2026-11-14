import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LearningColors as C } from '@/constants/learning-theme';

type Props = { onExit: () => void };
type Stage = 'easy' | 'medium' | 'complete';

const EASY_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MEDIUM_LETTERS = ['D', 'F', 'B', 'A', 'C', 'E', 'T', 'R', 'H', 'Y'];
const MEDIUM_TARGET = 5;
const OPENING_DELAY = 1600;
const SUCCESS_DELAY = 1500;

function shuffle(values: string[]) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chooseTarget(values: string[], previous?: string) {
  const candidates = values.filter((letter) => letter !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function FrenchAlphabetQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('easy');
  const [easyIndex, setEasyIndex] = useState(0);
  const [easyComplete, setEasyComplete] = useState(false);
  const [mediumCorrect, setMediumCorrect] = useState(0);
  const [mediumTarget, setMediumTarget] = useState(() => chooseTarget(MEDIUM_LETTERS));
  const [mediumChoices, setMediumChoices] = useState(() => shuffle(MEDIUM_LETTERS));
  const [questionReady, setQuestionReady] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const soundOnRef = useRef(true);
  const voiceRef = useRef<string | undefined>(undefined);
  const generation = useRef(0);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSpeech = useCallback(() => {
    generation.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const clearAnswerTimer = useCallback(() => {
    if (answerTimer.current) {
      clearTimeout(answerTimer.current);
      answerTimer.current = null;
    }
  }, []);

  const say = useCallback(async (words: string) => {
    if (!soundOnRef.current) return;
    const currentGeneration = ++generation.current;
    try {
      await Speech.stop();
      if (currentGeneration !== generation.current || !soundOnRef.current) return;
      Speech.speak(words, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.82,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.warn('French Alphabet Quiz audio:', error);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadVoice() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const french = voices.filter((voice) => voice.language.toLowerCase().startsWith('fr-fr'));
        const otherFrench = voices.filter((voice) => voice.language.toLowerCase().startsWith('fr'));
        const chosen =
          french.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
          french[0] ??
          otherFrench.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
          otherFrench[0];
        if (alive) voiceRef.current = chosen?.identifier;
      } catch (error) {
        console.warn('French voice selection:', error);
      }
    }
    void loadVoice();
    return () => { alive = false; };
  }, []);

  const target = stage === 'easy' ? EASY_LETTERS[easyIndex] : mediumTarget;
  const prompt = stage === 'easy'
    ? `Trouve la lettre ${target}.`
    : `Où est la lettre ${target} ?`;

  useEffect(() => {
    if (stage === 'complete' || easyComplete && stage === 'easy') {
      setQuestionReady(false);
      return;
    }
    setQuestionReady(false);
    setFeedback('');
    setSelected(null);
    setLocked(false);
    stopSpeech();
    const timer = setTimeout(() => {
      setQuestionReady(true);
      void say(prompt);
    }, OPENING_DELAY);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [stage, easyIndex, easyComplete, mediumTarget, prompt, say, stopSpeech]);

  useEffect(() => {
    return () => {
      clearAnswerTimer();
      stopSpeech();
    };
  }, [clearAnswerTimer, stopSpeech]);

  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) stopSpeech();
    else if (stage === 'complete') void say('Bravo ! Tu as terminé le quiz de l’alphabet !');
    else if (easyComplete && stage === 'easy') void say('Bravo ! Passe au niveau moyen.');
    else if (questionReady) void say(prompt);
  }

  function nextMediumQuestion(previous: string) {
    setMediumTarget(chooseTarget(MEDIUM_LETTERS, previous));
    setMediumChoices(shuffle(MEDIUM_LETTERS));
    setQuestionReady(false);
    setFeedback('');
    setSelected(null);
    setLocked(false);
  }

  function answer(letter: string) {
    if (!questionReady || locked || stage === 'complete' || easyComplete && stage === 'easy') return;
    setSelected(letter);
    if (letter !== target) {
      setFeedback('❌ Essaie encore !');
      void say('Essaie encore !');
      return;
    }
    setLocked(true);
    setFeedback('🌟 Bravo !');
    void say('Bravo !');
    clearAnswerTimer();
    answerTimer.current = setTimeout(() => {
      answerTimer.current = null;
      if (stage === 'easy') {
        if (easyIndex === EASY_LETTERS.length - 1) {
          setEasyComplete(true);
          setQuestionReady(false);
          setFeedback('🎉 Niveau facile terminé !');
          void say('Bravo ! Niveau facile terminé !');
        } else {
          setEasyIndex((value) => value + 1);
        }
      } else {
        const next = mediumCorrect + 1;
        setMediumCorrect(next);
        if (next >= MEDIUM_TARGET) {
          setStage('complete');
          void say('Magnifique ! Tu as terminé le quiz de l’alphabet !');
        } else {
          nextMediumQuestion(target);
        }
      }
    }, SUCCESS_DELAY);
  }

  function beginMedium() {
    if (!easyComplete) return;
    clearAnswerTimer();
    stopSpeech();
    setMediumCorrect(0);
    nextMediumQuestion(mediumTarget);
    setStage('medium');
  }

  function backToEasy() {
    clearAnswerTimer();
    stopSpeech();
    setEasyComplete(false);
    setEasyIndex(0);
    setFeedback('');
    setSelected(null);
    setLocked(false);
    setStage('easy');
  }

  function replay() {
    clearAnswerTimer();
    stopSpeech();
    setEasyIndex(0);
    setEasyComplete(false);
    setMediumCorrect(0);
    nextMediumQuestion(mediumTarget);
    setStage('easy');
  }

  function exit() {
    clearAnswerTimer();
    stopSpeech();
    onExit();
  }

  const choices = stage === 'easy' ? EASY_LETTERS : mediumChoices;
  const progress = stage === 'easy'
    ? (easyComplete ? EASY_LETTERS.length : easyIndex)
    : mediumCorrect;
  const total = stage === 'easy' ? EASY_LETTERS.length : MEDIUM_TARGET;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={stage === 'medium' ? backToEasy : exit} style={styles.backButton}>
          <Text style={styles.backText}>{stage === 'medium' ? '← Facile' : '← Retour'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={toggleSound} style={styles.soundButton}>
          <Text style={styles.soundText}>{soundOn ? '🔊 Sound On' : '🔇 Sound Off'}</Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.bigEmoji}>🏆 🇫🇷 🎉</Text>
            <Text style={styles.title}>Superstar de l'alphabet !</Text>
            <Text style={styles.description}>Bravo ! You completed both French Alphabet Quiz levels!</Text>
            <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.mainButton} onPress={replay}>
            <Text style={styles.mainButtonText}>🔄 Rejouer</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={exit}>
            <Text style={styles.secondaryText}>Terminer ✓</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.bigEmoji}>🇫🇷 🔤 ✨</Text>
            <Text style={styles.title}>Quiz de l'alphabet</Text>
            <Text style={styles.description}>{stage === 'easy' ? 'Niveau facile • Easy Level' : 'Niveau moyen • Medium Level'}</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>{stage === 'easy' ? 'Lettres' : 'Bonnes réponses'} : {progress} / {total}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(progress / total) * 100}%` }]} />
            </View>
          </View>

          {easyComplete && stage === 'easy' ? (
            <View style={styles.questionCard}>
              <Text style={styles.questionEmoji}>🌟 🎊 🌟</Text>
              <Text style={styles.question}>Bravo !</Text>
              <Text style={styles.helper}>You've finished the easy level. Ready for a challenge?</Text>
              <Pressable accessibilityRole="button" onPress={beginMedium} style={styles.listenButton}>
                <Text style={styles.listenText}>Niveau moyen →</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.questionCard}>
                <Text style={styles.questionEmoji}>{questionReady ? '👂' : '⏳'}</Text>
                <Text style={styles.question}>{questionReady ? prompt : 'Prépare-toi...'}</Text>
                <Text style={styles.helper}>{questionReady ? 'Écoute et touche la bonne lettre !' : 'Get ready for your question...'}</Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={!soundOn || !questionReady}
                  onPress={() => void say(prompt)}
                  style={[styles.listenButton, (!soundOn || !questionReady) && styles.disabled]}
                >
                  <Text style={styles.listenText}>🔊 Écouter encore</Text>
                </Pressable>
              </View>

              <View style={styles.letterGrid}>
                {choices.map((letter, index) => {
                  const background = ['#FFE0EB', '#DDEBFF', '#E2F5E5', '#FFF0C7', '#E9E1FF'][index % 5];
                  return (
                    <Pressable
                      key={letter}
                      accessibilityRole="button"
                      accessibilityLabel={`Letter ${letter}`}
                      disabled={!questionReady || locked}
                      onPress={() => answer(letter)}
                      style={({ pressed }) => [
                        styles.letterCard,
                        { backgroundColor: background },
                        selected === letter && (letter === target ? styles.correctBorder : styles.wrongBorder),
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.letter}>{letter}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          {!!feedback && <View style={styles.feedbackCard}><Text style={styles.feedback}>{feedback}</Text></View>}
          <View style={styles.tipCard}>
            <Text style={styles.tip}>🌈 Listen closely! French letters can sound different from English letters.</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  backButton: { backgroundColor: C.blue, paddingHorizontal: 17, paddingVertical: 13, borderRadius: 18 },
  backText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  soundButton: { backgroundColor: '#DDF7E5', paddingHorizontal: 16, paddingVertical: 13, borderRadius: 18 },
  soundText: { color: C.text, fontSize: 14, fontWeight: '800' },
  header: { backgroundColor: '#DDEBFF', borderRadius: 27, padding: 22, alignItems: 'center', marginBottom: 20 },
  bigEmoji: { fontSize: 44, textAlign: 'center', marginBottom: 12 },
  title: { color: C.text, fontSize: 25, textAlign: 'center', fontWeight: '800' },
  description: { color: C.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 23, marginTop: 10 },
  progressCard: { backgroundColor: '#FFF0C7', borderRadius: 20, padding: 18, marginBottom: 20 },
  progressText: { color: C.text, textAlign: 'center', fontSize: 16, fontWeight: '800' },
  progressTrack: { height: 12, backgroundColor: C.white, borderRadius: 9, marginTop: 13, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#43A866', borderRadius: 9 },
  questionCard: { backgroundColor: '#FFE5EF', borderRadius: 26, padding: 24, alignItems: 'center', marginBottom: 20 },
  questionEmoji: { fontSize: 39, marginBottom: 10 },
  question: { color: C.text, fontSize: 24, textAlign: 'center', fontWeight: '800', marginBottom: 8 },
  helper: { color: C.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 18, lineHeight: 21 },
  listenButton: { backgroundColor: C.primary, paddingHorizontal: 23, paddingVertical: 14, borderRadius: 17 },
  listenText: { color: C.white, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  letterGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  letterCard: { width: '30%', minHeight: 94, borderWidth: 3, borderColor: 'transparent', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  letter: { fontSize: 43, fontWeight: '800', color: C.primary },
  correctBorder: { borderColor: '#2FA85A' },
  wrongBorder: { borderColor: '#EA6676' },
  pressed: { opacity: 0.8 },
  feedbackCard: { backgroundColor: '#FFF0C7', padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  feedback: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center' },
  tipCard: { padding: 18, borderRadius: 20, backgroundColor: '#E9E1FF' },
  tip: { color: C.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  completeCard: { backgroundColor: '#FFF0C7', padding: 30, borderRadius: 28, alignItems: 'center', marginTop: 32, marginBottom: 20 },
  stars: { fontSize: 35, marginTop: 23 },
  mainButton: { backgroundColor: C.primary, padding: 17, borderRadius: 18, alignItems: 'center', marginBottom: 15 },
  mainButtonText: { color: C.white, fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: C.blue, padding: 17, borderRadius: 18, alignItems: 'center' },
  secondaryText: { color: C.primary, fontWeight: '800', fontSize: 16 },
});
