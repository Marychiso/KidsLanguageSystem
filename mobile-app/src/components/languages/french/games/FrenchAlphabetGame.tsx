import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

const STATIONS = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['G', 'H', 'I'],
  ['J', 'K', 'L'],
  ['M', 'N', 'O'],
  ['P', 'Q', 'R'],
  ['S', 'T', 'U'],
  ['V', 'W', 'X'],
  ['Y', 'Z'],
];

const CARRIAGE_COLORS = ['#A5CBEA', '#C2AFE7', '#F2C783'];
const TRAIN_TOP = 82;
const CARRIAGE_HEIGHT = 96;
const TILE_TOP = 262;
const TILE_SIZE = 60;

type Phase = 'ready' | 'playing' | 'paused' | 'departing' | 'complete' | 'won';

function shuffled(letters: string[]) {
  const result = [...letters];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {title}
      </Text>
    </Pressable>
  );
}

type TileProps = {
  letter: string;
  centerX: number;
  selected: boolean;
  onSelect: () => void;
  onDrop: (x: number, y: number) => void;
  onDragging: (dragging: boolean) => void;
};

function LetterTile(props: TileProps) {
  const { letter, centerX, selected } = props;
  const latest = useRef(props);
  latest.current = props;

  const position = useRef(new Animated.ValueXY()).current;
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);

  // One responder handles both gestures. A tap selects the letter.
  // Moving more than five points turns the same gesture into a drag.
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        moved.current = false;
        latest.current.onDragging(true);
      },

      onPanResponderMove: (_, gesture) => {
        if (!moved.current && Math.hypot(gesture.dx, gesture.dy) > 5) {
          moved.current = true;
          setDragging(true);
        }

        if (moved.current) {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },

      onPanResponderRelease: (_, gesture) => {
        position.setValue({ x: 0, y: 0 });
        setDragging(false);
        latest.current.onDragging(false);

        if (moved.current) {
          latest.current.onDrop(
            latest.current.centerX + gesture.dx,
            TILE_TOP + TILE_SIZE / 2 + gesture.dy,
          );
        } else {
          latest.current.onSelect();
        }
      },

      onPanResponderTerminate: () => {
        moved.current = false;
        position.setValue({ x: 0, y: 0 });
        setDragging(false);
        latest.current.onDragging(false);
      },

      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  return (
    <Animated.View
      {...pan.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Choisir la lettre ${letter}`}
      accessibilityState={{ selected }}
      accessibilityActions={[{ name: 'activate', label: 'Choisir' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') props.onSelect();
      }}
      style={[
        styles.tile,
        selected && styles.selectedTile,
        {
          left: centerX - TILE_SIZE / 2,
          zIndex: dragging ? 20 : 5,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <Text style={styles.tileText}>{letter}</Text>
    </Animated.View>
  );
}

export default function FrenchAlphabetGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [station, setStation] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [boardWidth, setBoardWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sound, setSound] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);

  const phaseRef = useRef<Phase>('ready');
  const placedRef = useRef<string[]>([]);
  const soundRef = useRef(true);
  const focused = useRef(false);
  const voice = useRef<Speech.Voice | undefined>(undefined);
  const speechRequest = useRef(0);
  const trainX = useRef(new Animated.Value(0)).current;

  const letters = STATIONS[station];
  const stationFinished =
    phase === 'departing' || phase === 'complete' || phase === 'won';
  const stars = station + (stationFinished ? 1 : 0);
  const showBoard = phase === 'playing' || phase === 'departing';

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const stopSpeech = useCallback(() => {
    speechRequest.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const say = useCallback(async (text: string) => {
    const request = ++speechRequest.current;

    try {
      await Speech.stop();

      if (
        request !== speechRequest.current ||
        !focused.current ||
        !soundRef.current
      ) {
        return;
      }

      Speech.speak(text, {
        language: voice.current?.language ?? 'fr-FR',
        ...(voice.current ? { voice: voice.current.identifier } : {}),
        rate: 0.83,
      });
    } catch {
      // The instructions and feedback are also displayed on screen.
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const french = voices.filter((v) => /^fr(?:[-_]|$)/i.test(v.language));
        const france = french.filter((v) => /^fr[-_]FR$/i.test(v.language));

        if (mounted) {
          voice.current =
            france.find((v) => /google/i.test(v.name)) ??
            france[0] ??
            french[0];
        }
      })
      .catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;

      function pauseIfNeeded() {
        stopSpeech();
        setDragging(false);
        if (phaseRef.current === 'playing') changePhase('paused');
      }

      const subscription = AppState.addEventListener('change', (state) => {
        if (state !== 'active') pauseIfNeeded();
      });

      return () => {
        focused.current = false;
        subscription.remove();
        pauseIfNeeded();
      };
    }, [changePhase, stopSpeech]),
  );

  useEffect(() => {
    if (phase !== 'departing') return;

    const finish = () => {
      changePhase(station === STATIONS.length - 1 ? 'won' : 'complete');
    };

    if (reduceMotion) {
      finish();
      return;
    }

    const animation = Animated.sequence([
      Animated.delay(450),
      Animated.timing(trainX, {
        toValue: boardWidth + 50,
        duration: 1300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && phaseRef.current === 'departing') finish();
    });

    return () => animation.stop();
  }, [phase, station, boardWidth, reduceMotion, trainX, changePhase]);

  function begin(nextStation: number) {
    const nextLetters = STATIONS[nextStation];

    trainX.stopAnimation();
    trainX.setValue(0);
    placedRef.current = [];
    setPlaced([]);
    setSelected(null);
    setDragging(false);
    setStation(nextStation);
    setChoices(shuffled(nextLetters.slice(1)));
    setFeedback('Place chaque lettre dans le bon wagon.');
    changePhase('playing');

    void say(`La première lettre est ${nextLetters[0]}. Quelle lettre vient après ?`);
  }

  function selectLetter(letter: string) {
    if (phaseRef.current !== 'playing') return;
    setSelected(letter);
    setFeedback(`Touche le wagon où va la lettre ${letter}.`);
    void say(`La lettre ${letter}.`);
  }

  function placeLetter(letter: string, index: number) {
    if (phaseRef.current !== 'playing') return;

    if (index === 0 || placedRef.current.includes(letters[index])) {
      setFeedback('Ce wagon a déjà sa lettre. Choisis un wagon vide.');
      return;
    }

    if (letter !== letters[index]) {
      setFeedback('Essaie un autre wagon. Suis l’ordre de l’alphabet !');
      void say('Essaie un autre wagon.');
      return;
    }

    const next = [...placedRef.current, letter];
    placedRef.current = next;
    setPlaced(next);
    setSelected(null);

    if (next.length === letters.length - 1) {
      changePhase('departing');
      setFeedback('Tout le monde à bord !');
      void say(`${letters.join(', ')}. En voiture !`);
    } else {
      setFeedback(`Bravo ! La lettre ${letter} est à sa place.`);
      void say(`Bravo ! La lettre ${letter} est à sa place.`);
    }
  }

  function dropLetter(letter: string, x: number, y: number) {
    if (phaseRef.current !== 'playing' || boardWidth <= 0) return;

    if (
      x < 0 || x >= boardWidth ||
      y < TRAIN_TOP - 10 || y > TRAIN_TOP + CARRIAGE_HEIGHT + 10
    ) {
      setFeedback('Dépose la lettre sur un wagon vide.');
      return;
    }

    const index = Math.floor((x / boardWidth) * letters.length);
    placeLetter(letter, index);
  }

  function toggleSound() {
    soundRef.current = !soundRef.current;
    setSound(soundRef.current);

    if (soundRef.current && phaseRef.current === 'playing') {
      void say(`La première lettre est ${letters[0]}.`);
    } else {
      stopSpeech();
    }
  }

  function openGames() {
    stopSpeech();
    router.replace({
      pathname: '/mary/categories',
      params: { language: 'french', activity: 'games' },
    });
  }

  function goBack() {
    if (router.canGoBack()) {
      stopSpeech();
      router.back();
    } else {
      openGames();
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        scrollEnabled={!dragging}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topBar}>
            <Button title="← Retour" onPress={goBack} secondary />
            <Text style={styles.score}>⭐ {stars}</Text>
            <Button
              title={sound ? 'Son activé' : 'Son coupé'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>Le train de l’alphabet</Text>

          {phase === 'ready' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🚂 🔤</Text>
              <Text style={styles.heading}>En voiture !</Text>
              <Text style={styles.description}>
                Place les lettres manquantes dans les wagons pour voyager de A à Z.
              </Text>
              <Text style={styles.small}>Neuf gares · Sans chronomètre</Text>
              <Button title="Commencer le voyage →" onPress={() => begin(0)} />
            </View>
          )}

          {showBoard && (
            <>
              <View style={styles.clue}>
                <Text style={styles.heading}>
                  Gare {station + 1} sur {STATIONS.length}
                </Text>
                <Text style={styles.description}>
                  Le train commence par {letters[0]}. Quelle est la suite ?
                </Text>
              </View>

              <View
                style={styles.board}
                onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
              >
                <View pointerEvents="none" style={styles.scenery}>
                  <Text style={styles.cloud}>☁️</Text>
                  <Text style={styles.stationSign}>🚉</Text>
                  <Text style={styles.cloud}>☁️</Text>
                </View>

                <View pointerEvents="none" style={styles.ground} />
                <View pointerEvents="none" style={styles.rail} />

                <Animated.View
                  style={[styles.train, { transform: [{ translateX: trainX }] }]}
                >
                  {letters.map((letter, index) => {
                    const filled = index === 0 || placed.includes(letter);

                    return (
                      <View key={letter} style={styles.carriageColumn}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            filled
                              ? `Wagon ${index + 1}, lettre ${letter}`
                              : `Wagon ${index + 1}, vide`
                          }
                          disabled={filled || phase !== 'playing'}
                          onPress={() => {
                            if (selected) {
                              placeLetter(selected, index);
                            } else {
                              setFeedback('Choisis d’abord une lettre en bas.');
                            }
                          }}
                          style={[
                            styles.carriage,
                            { backgroundColor: CARRIAGE_COLORS[index] },
                          ]}
                        >
                          <View style={[styles.window, !filled && styles.emptyWindow]}>
                            <Text style={styles.carriageLetter}>
                              {filled ? letter : '?'}
                            </Text>
                          </View>
                        </Pressable>

                        <View pointerEvents="none" style={styles.wheels}>
                          <View style={styles.wheel} />
                          <View style={styles.wheel} />
                        </View>
                      </View>
                    );
                  })}
                </Animated.View>

                <View pointerEvents="none" style={styles.tray}>
                  <Text style={styles.trayLabel}>
                    {phase === 'departing' ? '✨ En voiture ! ✨' : 'Tes lettres'}
                  </Text>
                </View>

                {phase === 'playing' && boardWidth > 0 &&
                  choices.map((letter, index) => {
                    if (placed.includes(letter)) return null;

                    return (
                      <LetterTile
                        key={`${station}-${letter}`}
                        letter={letter}
                        centerX={(boardWidth * (index + 1)) / (choices.length + 1)}
                        selected={selected === letter}
                        onSelect={() => selectLetter(letter)}
                        onDrop={(x, y) => dropLetter(letter, x, y)}
                        onDragging={setDragging}
                      />
                    );
                  })}
              </View>

              <Text accessibilityLiveRegion="polite" style={styles.feedback}>
                {feedback}
              </Text>

              {phase === 'playing' && (
                <>
                  <Text style={styles.small}>
                    Fais glisser une lettre, ou touche la lettre puis son wagon.
                  </Text>
                  <Button
                    title="Pause"
                    secondary
                    onPress={() => {
                      stopSpeech();
                      setDragging(false);
                      changePhase('paused');
                    }}
                  />
                </>
              )}
            </>
          )}

          {phase === 'paused' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🚉</Text>
              <Text style={styles.heading}>Une pause à la gare</Text>
              <Button title="Continuer →" onPress={() => changePhase('playing')} />
              <Button title="Recommencer" onPress={() => begin(0)} secondary />
            </View>
          )}

          {phase === 'complete' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🚂 ⭐</Text>
              <Text style={styles.heading}>Le train est complet !</Text>
              <Text style={styles.completedLetters}>{letters.join('   ')}</Text>
              <Button title="Gare suivante →" onPress={() => begin(station + 1)} />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🏆 🚂</Text>
              <Text style={styles.heading}>Tu es arrivé à la lettre Z !</Text>
              <Text style={styles.description}>
                Tu as complété les neuf trains et gagné neuf étoiles.
              </Text>
              <Button title="Rejouer ↻" onPress={() => begin(0)} />
              <Button title="Retour aux jeux" onPress={openGames} secondary />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  content: { padding: 16, paddingBottom: 32 },
  panel: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 12 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 8,
  },
  score: { color: C.primary, fontSize: 20, fontWeight: '800' },
  title: {
    color: C.text, fontSize: 27, fontWeight: '800',
    textAlign: 'center', marginVertical: 10,
  },
  button: {
    minHeight: 46, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 17,
    backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '800', color: C.white, textAlign: 'center' },
  secondaryButton: { backgroundColor: C.blue },
  secondaryText: { color: C.primary },
  pressed: { opacity: 0.75 },
  card: { padding: 22, borderRadius: 26, gap: 18, backgroundColor: C.white },
  hero: { fontSize: 46, textAlign: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: C.primary, textAlign: 'center' },
  description: { color: C.textSecondary, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  small: { color: C.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  clue: { padding: 14, gap: 6, borderRadius: 20, backgroundColor: C.white },
  board: {
    height: 340, width: '100%', borderRadius: 24,
    overflow: 'hidden', backgroundColor: '#E0F2FF',
  },
  scenery: {
    position: 'absolute', top: 8, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
  },
  cloud: { fontSize: 30 },
  stationSign: { fontSize: 43 },
  ground: {
    position: 'absolute', top: 181, height: 42, left: 0, right: 0,
    backgroundColor: '#CBE5BE',
  },
  rail: {
    position: 'absolute', top: 190, height: 5, left: 0, right: 0,
    backgroundColor: '#788497',
  },
  train: {
    position: 'absolute', top: TRAIN_TOP, left: 0, right: 0, flexDirection: 'row',
  },
  carriageColumn: { flex: 1, alignItems: 'center' },
  carriage: {
    width: '92%', height: CARRIAGE_HEIGHT, borderRadius: 15, borderWidth: 2,
    borderColor: '#69788E', justifyContent: 'center', alignItems: 'center',
  },
  window: {
    width: '76%', height: 62, borderRadius: 12, backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyWindow: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#8D93A8',
    backgroundColor: '#F5F7FC',
  },
  carriageLetter: { fontSize: 34, fontWeight: '800', color: C.primary },
  wheels: {
    width: '76%', marginTop: -5, flexDirection: 'row', justifyContent: 'space-between',
  },
  wheel: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#485568',
    borderWidth: 4, borderColor: '#7F8CA0',
  },
  tray: {
    position: 'absolute', top: 232, bottom: 8, left: 8, right: 8,
    borderRadius: 18, backgroundColor: C.white,
  },
  trayLabel: {
    marginTop: 7, textAlign: 'center', fontSize: 13,
    color: C.textSecondary, fontWeight: '600',
  },
  tile: {
    position: 'absolute', top: TILE_TOP, width: TILE_SIZE, height: TILE_SIZE,
    borderRadius: 16, borderWidth: 2, borderColor: '#D1C4EA',
    backgroundColor: C.lavender, alignItems: 'center', justifyContent: 'center',
  },
  selectedTile: { borderColor: C.primary, backgroundColor: C.yellow },
  tileText: { color: C.primary, fontSize: 32, fontWeight: '800' },
  feedback: { color: C.text, fontSize: 15, lineHeight: 23, fontWeight: '600', textAlign: 'center' },
  completedLetters: { color: C.primary, fontSize: 32, fontWeight: '800', textAlign: 'center' },
});