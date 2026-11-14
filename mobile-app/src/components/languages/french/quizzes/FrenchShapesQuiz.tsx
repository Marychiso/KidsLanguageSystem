import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import Svg, { Circle, Rect, Ellipse, Polygon, Path } from 'react-native-svg';
import { LearningColors as C } from '@/constants/learning-theme';

type Props = { onExit: () => void };
type Stage = 'pictures' | 'riddles' | 'words' | 'complete';
type ShapeId = 'cercle' | 'carre' | 'triangle' | 'rectangle' | 'etoile' | 'coeur' | 'ovale' | 'losange' | 'pentagone' | 'hexagone';
type Shape = { french: string; english: string; color: string };
type Question = { prompt: string; answer: ShapeId; choices: ShapeId[] };

const SHAPES: Record<ShapeId, Shape> = {
  cercle: { french: 'Cercle', english: 'Circle', color: '#F45F72' },
  carre: { french: 'Carré', english: 'Square', color: '#4E9DF0' },
  triangle: { french: 'Triangle', english: 'Triangle', color: '#FFAD42' },
  rectangle: { french: 'Rectangle', english: 'Rectangle', color: '#47B887' },
  etoile: { french: 'Étoile', english: 'Star', color: '#FFD24A' },
  coeur: { french: 'Cœur', english: 'Heart', color: '#EF5F92' },
  ovale: { french: 'Ovale', english: 'Oval', color: '#A88DF4' },
  losange: { french: 'Losange', english: 'Diamond', color: '#F58F51' },
  pentagone: { french: 'Pentagone', english: 'Pentagon', color: '#42B9BC' },
  hexagone: { french: 'Hexagone', english: 'Hexagon', color: '#8B80E6' },
};

// All shapes are drawn as vector graphics for consistent display on iPhone and Android.
function ShapePicture({ id, size = 90 }: { id: ShapeId; size?: number }) {
  const color = SHAPES[id].color;
  const props = { fill: color, stroke: '#66548F', strokeWidth: 2.2, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {id === 'cercle' && <Circle cx="50" cy="50" r="36" {...props} />}
      {id === 'carre' && <Rect x="18" y="18" width="64" height="64" rx="2" {...props} />}
      {id === 'triangle' && <Polygon points="50,12 91,85 9,85" {...props} />}
      {id === 'rectangle' && <Rect x="9" y="28" width="82" height="44" rx="2" {...props} />}
      {id === 'etoile' && <Polygon points="50,7 62,36 94,38 69,59 77,91 50,73 23,91 31,59 6,38 38,36" {...props} />}
      {id === 'coeur' && <Path d="M50 88 C39 77 9 60 9 37 C9 12 39 9 50 29 C61 9 91 12 91 37 C91 60 61 77 50 88 Z" {...props} />}
      {id === 'ovale' && <Ellipse cx="50" cy="50" rx="29" ry="42" {...props} />}
      {id === 'losange' && <Polygon points="50,7 87,50 50,93 13,50" {...props} />}
      {id === 'pentagone' && <Polygon points="50,8 91,40 75,89 25,89 9,40" {...props} />}
      {id === 'hexagone' && <Polygon points="27,13 73,13 94,50 73,87 27,87 6,50" {...props} />}
    </Svg>
  );
}

// Level 1: Hear a French name and pick the matching shape drawing.
const PICTURES: Question[] = [
  { prompt: 'Montre-moi le cercle !', answer: 'cercle', choices: ['triangle', 'cercle', 'carre', 'ovale'] },
  { prompt: 'Où est le carré ?', answer: 'carre', choices: ['rectangle', 'losange', 'carre', 'pentagone'] },
  { prompt: 'Trouve le triangle !', answer: 'triangle', choices: ['hexagone', 'triangle', 'etoile', 'coeur'] },
  { prompt: 'Montre-moi l’étoile !', answer: 'etoile', choices: ['coeur', 'etoile', 'losange', 'pentagone'] },
  { prompt: 'Où est le rectangle ?', answer: 'rectangle', choices: ['carre', 'ovale', 'rectangle', 'hexagone'] },
];

// Level 2: Guess a shape from its defining property.
const RIDDLES: Question[] = [
  { prompt: 'Je suis parfaitement rond, comme une roue. Qui suis-je ?', answer: 'cercle', choices: ['ovale', 'cercle', 'triangle', 'pentagone'] },
  { prompt: 'J’ai trois côtés. Qui suis-je ?', answer: 'triangle', choices: ['triangle', 'carre', 'pentagone', 'hexagone'] },
  { prompt: 'J’ai cinq côtés. Qui suis-je ?', answer: 'pentagone', choices: ['hexagone', 'carre', 'pentagone', 'triangle'] },
  { prompt: 'J’ai six côtés. Qui suis-je ?', answer: 'hexagone', choices: ['pentagone', 'rectangle', 'hexagone', 'losange'] },
  { prompt: 'Je ressemble au symbole de l’amour. Qui suis-je ?', answer: 'coeur', choices: ['etoile', 'ovale', 'coeur', 'cercle'] },
];

// Level 3: See a shape and choose its correct French name.
const WORDS: Question[] = [
  { prompt: 'Comment s’appelle cette forme en français ?', answer: 'ovale', choices: ['cercle', 'ovale', 'coeur', 'carre'] },
  { prompt: 'Choisis le bon nom en français !', answer: 'losange', choices: ['rectangle', 'carre', 'losange', 'pentagone'] },
  { prompt: 'Quel est le nom de cette forme ?', answer: 'pentagone', choices: ['hexagone', 'triangle', 'pentagone', 'rectangle'] },
  { prompt: 'Comment s’appelle cette forme ?', answer: 'hexagone', choices: ['pentagone', 'hexagone', 'carre', 'triangle'] },
  { prompt: 'Trouve son nom en français !', answer: 'coeur', choices: ['etoile', 'cercle', 'coeur', 'ovale'] },
];

const TITLES: Record<Exclude<Stage, 'complete'>, string> = {
  pictures: 'Trouve la forme',
  riddles: 'Devine la forme',
  words: 'Le bon nom',
};
const STAGE_ORDER: Exclude<Stage, 'complete'>[] = ['pictures', 'riddles', 'words'];
const OPENING_DELAY = 900;
const MUTED_ADVANCE_DELAY = 1200;
const AFTER_SPEECH_PAUSE = 650;
const SPEECH_FALLBACK = 8500;

export default function FrenchShapesQuiz({ onExit }: Props) {
  const [stage, setStage] = useState<Stage>('pictures');
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  const voiceRef = useRef<string | undefined>(undefined);
  const generationRef = useRef(0);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSpeech = useCallback(() => {
    generationRef.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const clearAdvance = useCallback(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    advanceRef.current = null;
  }, []);

  const speak = useCallback(async (words: string, onDone?: () => void) => {
    if (!soundRef.current) return;
    const myGeneration = ++generationRef.current;
    try {
      await Speech.stop();
      if (myGeneration !== generationRef.current || !soundRef.current) return;
      Speech.speak(words, {
        language: 'fr-FR',
        voice: voiceRef.current,
        rate: 0.83,
        pitch: 1,
        volume: 1,
        onDone: () => {
          if (generationRef.current === myGeneration && soundRef.current) onDone?.();
        },
        onError: () => { /* fallback timer handles devices without speech callbacks */ },
      });
    } catch (error) {
      console.warn('French Shapes Quiz narration:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Speech.getAvailableVoicesAsync().then((voices) => {
      const french = voices.filter((v) => v.language.toLowerCase().startsWith('fr'));
      const preferred = french.filter((v) => v.language.toLowerCase().startsWith('fr-fr'));
      const best = preferred.find((v) => v.quality === Speech.VoiceQuality.Enhanced)
        ?? preferred[0]
        ?? french.find((v) => v.quality === Speech.VoiceQuality.Enhanced)
        ?? french[0];
      if (mounted) voiceRef.current = best?.identifier;
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const questions = stage === 'pictures' ? PICTURES : stage === 'riddles' ? RIDDLES : WORDS;
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
    return () => { clearTimeout(timer); stopSpeech(); };
  }, [stage, index, prompt, speak, stopSpeech]);

  useEffect(() => {
    if (stage === 'complete') void speak('Félicitations ! Tu as terminé le quiz des formes !');
  }, [stage, speak]);

  useEffect(() => () => { clearAdvance(); stopSpeech(); }, [clearAdvance, stopSpeech]);

  const resetQuestion = () => {
    setReady(false);
    setLocked(false);
    setSelected(null);
    setFeedback('');
  };

  const nextQuestion = () => {
    clearAdvance();
    resetQuestion();
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
    } else if (stage !== 'complete') {
      const next = STAGE_ORDER.indexOf(stage) + 1;
      setStage(next < STAGE_ORDER.length ? STAGE_ORDER[next] : 'complete');
      setIndex(0);
    }
  };

  const choose = (id: ShapeId) => {
    if (!question || !ready || locked) return;
    setSelected(id);
    if (id !== question.answer) {
      setFeedback('💛 Essaie encore !');
      void speak('Essaie encore !');
      return;
    }
    setLocked(true);
    setFeedback('🌟 Bravo ! Bonne réponse !');
    clearAdvance();
    if (!soundRef.current) {
      advanceRef.current = setTimeout(nextQuestion, MUTED_ADVANCE_DELAY);
    } else {
      const afterPraise = () => {
        clearAdvance();
        advanceRef.current = setTimeout(nextQuestion, AFTER_SPEECH_PAUSE);
      };
      advanceRef.current = setTimeout(nextQuestion, SPEECH_FALLBACK);
      void speak('Bravo ! Bonne réponse !', afterPraise);
    }
  };

  const toggleSound = () => {
    const enabled = !soundRef.current;
    soundRef.current = enabled;
    setSoundOn(enabled);
    if (!enabled) {
      stopSpeech();
      // If muted mid-praise, do not leave the child waiting for a voice callback.
      if (locked) {
        clearAdvance();
        advanceRef.current = setTimeout(nextQuestion, MUTED_ADVANCE_DELAY);
      }
    } else if (stage !== 'complete' && ready && !locked) {
      void speak(prompt);
    }
  };

  const exit = () => { clearAdvance(); stopSpeech(); onExit(); };
  const replay = () => { clearAdvance(); stopSpeech(); resetQuestion(); setStage('pictures'); setIndex(0); };
  const previous = () => {
    clearAdvance(); stopSpeech(); resetQuestion();
    if (stage === 'riddles') { setStage('pictures'); setIndex(0); }
    else if (stage === 'words') { setStage('riddles'); setIndex(0); }
    else exit();
  };

  const progress = stage === 'complete' ? 15 : (stage === 'pictures' ? 0 : stage === 'riddles' ? 5 : 10) + index;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" style={styles.backButton} onPress={stage === 'complete' || stage === 'pictures' ? exit : previous}>
          <Text style={styles.backText}>← {stage === 'complete' || stage === 'pictures' ? 'Quiz' : 'Retour'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={[styles.soundButton, !soundOn && styles.muted]} onPress={toggleSound}>
          <Text style={styles.soundText}>{soundOn ? '🔊 Son activé' : '🔇 Son coupé'}</Text>
        </Pressable>
      </View>

      {stage === 'complete' ? (
        <>
          <View style={styles.completeCard}>
            <Text style={styles.completeEmoji}>🏆 ⭐ 🇫🇷</Text>
            <Text style={styles.completeTitle}>Champion des formes !</Text>
            <Text style={styles.completeMessage}>Bravo ! Tu as terminé les trois niveaux du quiz des formes !</Text>
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
            <Text style={styles.headerEmoji}>🇫🇷 🔺 ⭐</Text>
            <Text style={styles.headerTitle}>Quiz des Formes</Text>
            <Text style={styles.headerSubtitle}>{TITLES[stage]}</Text>
          </View>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>Niveau {stage === 'pictures' ? 1 : stage === 'riddles' ? 2 : 3} sur 3 · Question {index + 1} sur 5</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${(progress / 15) * 100}%` }]} /></View>
          </View>
          <View style={styles.questionCard}>
            <Text style={styles.questionEmoji}>{stage === 'pictures' ? '🔎' : stage === 'riddles' ? '🧩' : '📖'}</Text>
            <Text style={styles.questionText}>{ready ? prompt : 'Prépare-toi...'}</Text>
            {stage === 'words' && ready && question && <View style={styles.bigShape}><ShapePicture id={question.answer} size={116} /></View>}
            <Text style={styles.readyText}>{ready ? 'À toi de jouer !' : 'Écoute bien la question.'}</Text>
            <Pressable accessibilityRole="button" disabled={!ready || !soundOn || locked} style={[styles.listenButton, (!ready || !soundOn || locked) && styles.disabled]} onPress={() => void speak(prompt)}>
              <Text style={styles.listenText}>🔊 Réécouter</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionTitle}>{stage === 'words' ? 'Choisis le bon mot 👇' : 'Choisis la bonne forme 👇'}</Text>
          <View style={styles.grid}>
            {question?.choices.map((id) => {
              const shape = SHAPES[id];
              const chosen = selected === id;
              return (
                <Pressable
                  key={`${stage}-${index}-${id}`}
                  accessibilityRole="button"
                  accessibilityLabel={stage === 'words' ? shape.french : `${shape.french}, ${shape.english}`}
                  disabled={!ready || locked}
                  onPress={() => choose(id)}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    chosen && (id === question.answer ? styles.correct : styles.incorrect),
                    pressed && styles.pressed,
                    (!ready || locked) && styles.disabledChoice,
                  ]}
                >
                  {stage !== 'words' && <View style={styles.shapeImage}><ShapePicture id={id} size={88} /></View>}
                  {stage === 'words' && <Text style={styles.wordLabel}>{shape.french}</Text>}
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
  header: { backgroundColor: '#FFE5EF', borderRadius: 27, padding: 21, alignItems: 'center', marginBottom: 18 },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 25, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: C.textSecondary, marginTop: 8, textAlign: 'center' },
  progressCard: { backgroundColor: '#FFF0C7', padding: 18, borderRadius: 20, marginBottom: 18 },
  progressText: { textAlign: 'center', color: C.text, fontSize: 14, fontWeight: '800' },
  track: { height: 12, borderRadius: 8, backgroundColor: C.white, overflow: 'hidden', marginTop: 11 },
  fill: { height: '100%', backgroundColor: '#43A866', borderRadius: 8 },
  questionCard: { backgroundColor: '#DDEBFF', borderRadius: 26, padding: 22, alignItems: 'center', marginBottom: 22 },
  questionEmoji: { fontSize: 38, marginBottom: 10 },
  questionText: { fontSize: 23, fontWeight: '800', color: C.text, textAlign: 'center', minHeight: 62 },
  readyText: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 14 },
  bigShape: { alignItems: 'center', marginVertical: 10 },
  listenButton: { backgroundColor: C.primary, borderRadius: 17, paddingHorizontal: 20, paddingVertical: 13 },
  listenText: { fontSize: 15, fontWeight: '800', color: C.white },
  disabled: { opacity: 0.45 },
  sectionTitle: { fontSize: 19, color: C.text, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 },
  choiceCard: { width: '48%', minHeight: 137, borderRadius: 23, backgroundColor: C.white, borderWidth: 3, borderColor: 'transparent', padding: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  shapeImage: { alignItems: 'center', justifyContent: 'center' },
  wordLabel: { color: C.text, fontSize: 21, fontWeight: '800', textAlign: 'center' },
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
