import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AccessibilityInfo,
  Animated,
  AppState,
  PanResponder,
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

type Phase =
  | 'ready'
  | 'playing'
  | 'paused'
  | 'departing'
  | 'complete'
  | 'won';

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

function shuffle(letters: string[]) {
  const result = [...letters];

  for (let i = result.length - 1; i > 0; i--) {
    const other = Math.floor(Math.random() * (i + 1));
    [result[i], result[other]] = [result[other], result[i]];
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
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && { color: C.primary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function LetterTile({
  letter,
  x,
  selected,
  enabled,
  onSelect,
  onDrop,
  onDragging,
}: {
  letter: string;
  x: number;
  selected: boolean;
  enabled: boolean;
  onSelect: () => void;
  onDrop: (x: number, y: number) => void;
  onDragging: (value: boolean) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);

  const latest = useRef({
    x,
    enabled,
    onSelect,
    onDrop,
    onDragging,
  });

  latest.current = {
    x,
    enabled,
    onSelect,
    onDrop,
    onDragging,
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) =>
        latest.current.enabled &&
        (Math.abs(gesture.dx) > 5 ||
          Math.abs(gesture.dy) > 5),

      onPanResponderGrant: () => {
        setDragging(true);
        latest.current.onDragging(true);
      },

      onPanResponderMove: (_, gesture) => {
        if (latest.current.enabled) {
          position.setValue({
            x: gesture.dx,
            y: gesture.dy,
          });
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (latest.current.enabled) {
          latest.current.onDrop(
            latest.current.x + gesture.dx,
            300 + gesture.dy,
          );
        }

        position.setValue({ x: 0, y: 0 });
        setDragging(false);
        latest.current.onDragging(false);
      },

      onPanResponderTerminate: () => {
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
      style={[
        styles.tilePosition,
        {
          left: x - 31,
          zIndex: dragging ? 30 : 10,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select letter ${letter}`}
        accessibilityState={{ selected, disabled: !enabled }}
        disabled={!enabled}
        onPress={onSelect}
        style={[
          styles.tile,
          selected && styles.selectedTile,
        ]}
      >
        <Text style={styles.tileLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AlphabetGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [station, setStation] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [width, setWidth] = useState(300);
  const [dragging, setDragging] = useState(false);
  const [sound, setSound] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [message, setMessage] = useState('');

  const trainX = useRef(new Animated.Value(0)).current;
  const phaseRef = useRef<Phase>('ready');
  const placedRef = useRef<string[]>([]);
  const focused = useRef(false);
  const soundRef = useRef(true);
  const voice = useRef<string | undefined>(undefined);

  const letters = STATIONS[station];
  const completedStation =
    phase === 'departing' ||
    phase === 'complete' ||
    phase === 'won';

  const stars = station + (completedStation ? 1 : 0);

  const stopSpeech = useCallback(() => {
    void Speech.stop().catch(() => {});
  }, []);

  const say = useCallback(
    (text: string) => {
      stopSpeech();

      if (!focused.current || !soundRef.current) return;

      try {
        Speech.speak(text, {
          language: 'en-GB',
          rate: 0.85,
          ...(voice.current ? { voice: voice.current } : {}),
        });
      } catch {
        // The game also provides written instructions.
      }
    },
    [stopSpeech],
  );

  function changePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    let active = true;

    void Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const preferred =
          voices.find((item) =>
            item.name
              .toLowerCase()
              .includes('google uk english female'),
          ) ??
          voices.find(
            (item) =>
              item.language.toLowerCase().replace('_', '-') ===
              'en-gb',
          );

        if (active) {
          voice.current = preferred?.identifier;
        }
      })
      .catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReducedMotion(value);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;

      return () => {
        focused.current = false;
        stopSpeech();

        if (phaseRef.current === 'playing') {
          phaseRef.current = 'paused';
          setPhase('paused');
          setDragging(false);
        }
      };
    }, [stopSpeech]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state !== 'active' && focused.current) {
          stopSpeech();

          if (phaseRef.current === 'playing') {
            phaseRef.current = 'paused';
            setPhase('paused');
            setDragging(false);
          }
        }
      },
    );

    return () => subscription.remove();
  }, [stopSpeech]);

  useEffect(() => {
    if (phase !== 'departing') return;

    let active = true;

    const animation = Animated.sequence([
      Animated.delay(reducedMotion ? 0 : 450),
      Animated.timing(trainX, {
        toValue: width + 50,
        duration: reducedMotion ? 0 : 1400,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && active) {
        const next =
          station === STATIONS.length - 1 ? 'won' : 'complete';

        phaseRef.current = next;
        setPhase(next);
      }
    });

    return () => {
      active = false;
      animation.stop();
    };
  }, [phase, reducedMotion, station, trainX, width]);

  function begin(nextStation: number) {
    stopSpeech();
    trainX.stopAnimation();
    trainX.setValue(0);

    placedRef.current = [];

    setStation(nextStation);
    setPlaced([]);
    setSelected(null);
    setDragging(false);
    setChoices(shuffle(STATIONS[nextStation].slice(1)));
    setMessage('Put the missing letters on the train.');

    changePhase('playing');
    say(
      `The train starts with ${STATIONS[nextStation][0]}. Add the missing letters.`,
    );
  }

  function placeLetter(letter: string, slotIndex: number) {
    if (
      phaseRef.current !== 'playing' ||
      slotIndex === 0 ||
      placedRef.current.includes(letters[slotIndex])
    ) {
      return;
    }

    if (letter !== letters[slotIndex]) {
      setMessage('Try another carriage. Follow the alphabet!');
      say('Try another carriage.');
      return;
    }

    const next = [...placedRef.current, letter];

    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    setDragging(false);

    if (next.length === letters.length - 1) {
      setMessage('All aboard! The train is ready.');
      changePhase('departing');
      say(`${letters.join('. ')}. All aboard!`);
    } else {
      setMessage(`Yes! ${letter} is in the right place.`);
      say(letter);
    }
  }

  function dropLetter(letter: string, x: number, y: number) {
    // The carriage centres are at y = 133.
    if (Math.abs(y - 133) > 58) {
      setMessage('Move the letter closer to a carriage.');
      return;
    }

    const slotIndex = Math.floor((x / width) * letters.length);

    if (slotIndex < 0 || slotIndex >= letters.length) {
      setMessage('Drop the letter onto an empty carriage.');
      return;
    }

    if (
      slotIndex === 0 ||
      placedRef.current.includes(letters[slotIndex])
    ) {
      setMessage('That carriage already has its letter.');
      return;
    }

    placeLetter(letter, slotIndex);
  }

  function toggleSound() {
    const next = !soundRef.current;

    soundRef.current = next;
    setSound(next);
    stopSpeech();

    if (next && phaseRef.current === 'playing') {
      say(`The train starts with ${letters[0]}.`);
    }
  }

  function goBack() {
    stopSpeech();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'english', activity: 'games' },
      });
    }
  }

  const showBoard = phase === 'playing' || phase === 'departing';

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
            <Button title="← Back" onPress={goBack} secondary />

            <Text style={styles.score}>⭐ {stars}</Text>

            <Button
              title={sound ? 'Voice on' : 'Voice off'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>Alphabet Train</Text>

          {phase === 'ready' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🚂 🔤</Text>
              <Text style={styles.heading}>All aboard!</Text>

              <Text style={styles.description}>
                Add the missing letters. Finish each train
                and travel from A to Z.
              </Text>

              <Text style={styles.smallText}>
                Nine stations · No timer
              </Text>

              <Button
                title="Start the journey →"
                onPress={() => begin(0)}
              />
            </View>
          )}

          {showBoard && (
            <>
              <View style={styles.clue}>
                <Text style={styles.heading}>
                  Station {station + 1} of {STATIONS.length}
                </Text>

                <Text style={styles.description}>
                  Start with {letters[0]}. What comes next?
                </Text>
              </View>

              <View
                style={styles.board}
                onLayout={(event) =>
                  setWidth(event.nativeEvent.layout.width)
                }
              >
                <View pointerEvents="none" style={styles.scenery}>
                  <Text style={styles.cloud}>☁️</Text>
                  <Text style={styles.stationSign}>🚉</Text>
                  <Text style={styles.cloud}>☁️</Text>
                </View>

                <View pointerEvents="none" style={styles.ground} />
                <View pointerEvents="none" style={styles.rail} />

                <Animated.View
                  style={[
                    styles.train,
                    { transform: [{ translateX: trainX }] },
                  ]}
                >
                  {letters.map((letter, index) => {
                    const filled =
                      index === 0 || placed.includes(letter);

                    return (
                      <View
                        key={letter}
                        style={{
                          width: `${100 / letters.length}%`,
                          alignItems: 'center',
                        }}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            filled
                              ? `Carriage ${index + 1}: ${letter}`
                              : `Empty carriage ${index + 1}`
                          }
                          disabled={
                            filled || phase !== 'playing'
                          }
                          onPress={() => {
                            if (selected) {
                              placeLetter(selected, index);
                            } else {
                              setMessage(
                                'Select a letter below first.',
                              );
                            }
                          }}
                          style={[
                            styles.carriage,
                            {
                              backgroundColor: [
                                '#A5CBEA',
                                '#C2AFE7',
                                '#F2C783',
                              ][index],
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.letterWindow,
                              !filled && styles.emptyWindow,
                            ]}
                          >
                            <Text style={styles.carriageLetter}>
                              {filled ? letter : '?'}
                            </Text>
                          </View>
                        </Pressable>

                        <View
                          pointerEvents="none"
                          style={styles.wheels}
                        >
                          <View style={styles.wheel} />
                          <View style={styles.wheel} />
                        </View>
                      </View>
                    );
                  })}
                </Animated.View>

                <View pointerEvents="none" style={styles.tray}>
                  <Text style={styles.trayLabel}>
                    {phase === 'departing'
                      ? '✨ All aboard! ✨'
                      : 'Your letters'}
                  </Text>
                </View>

                {choices.map((letter, index) => {
                  if (placed.includes(letter)) return null;

                  return (
                    <LetterTile
                      key={`${station}-${letter}-${width}`}
                      letter={letter}
                      x={(width * (index + 1)) / (choices.length + 1)}
                      selected={selected === letter}
                      enabled={phase === 'playing'}
                      onDragging={setDragging}
                      onSelect={() => {
                        setSelected(letter);
                        setMessage(
                          `Now tap the carriage for ${letter}.`,
                        );
                        say(letter);
                      }}
                      onDrop={(x, y) => dropLetter(letter, x, y)}
                    />
                  );
                })}
              </View>

              <Text
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                {message}
              </Text>

              {phase === 'playing' && (
                <>
                  <Text style={styles.smallText}>
                    Drag a letter, or tap it and then tap a carriage.
                  </Text>

                  <Button
                    title="Pause"
                    secondary
                    onPress={() => {
                      stopSpeech();
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
              <Text style={styles.heading}>Rest at the station</Text>

              <Button
                title="Keep playing →"
                onPress={() => changePhase('playing')}
              />

              <Button
                title="Start again"
                onPress={() => begin(0)}
                secondary
              />
            </View>
          )}

          {phase === 'complete' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🚂 ⭐</Text>

              <Text style={styles.heading}>
                Train completed!
              </Text>

              <Text style={styles.completedLetters}>
                {letters.join('   ')}
              </Text>

              <Button
                title="Next station →"
                onPress={() => begin(station + 1)}
              />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🏆 🚂</Text>

              <Text style={styles.heading}>
                Alphabet journey complete!
              </Text>

              <Text style={styles.description}>
                You travelled from A to Z and earned nine stars.
              </Text>

              <Text style={styles.completedLetters}>
                ⭐ ⭐ ⭐
              </Text>

              <Button
                title="Travel again ↻"
                onPress={() => begin(0)}
              />

              <Button
                title="Back to games"
                onPress={goBack}
                secondary
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  panel: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
    color: C.primary,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginVertical: 12,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: C.blue,
  },
  card: {
    backgroundColor: C.white,
    padding: 24,
    borderRadius: 28,
    gap: 20,
  },
  hero: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 10,
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: C.textSecondary,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
    lineHeight: 19,
    color: C.textSecondary,
    textAlign: 'center',
  },
  clue: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: C.white,
    gap: 6,
  },
  board: {
    height: 350,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E0F2FF',
  },
  scenery: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cloud: {
    fontSize: 32,
  },
  stationSign: {
    fontSize: 45,
  },
  ground: {
    position: 'absolute',
    top: 181,
    height: 45,
    left: 0,
    right: 0,
    backgroundColor: '#CBE5BE',
  },
  rail: {
    position: 'absolute',
    top: 192,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#7A8697',
  },
  train: {
    position: 'absolute',
    top: 83,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  carriage: {
    width: '92%',
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6A7890',
  },
  letterWindow: {
    width: '77%',
    height: 66,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWindow: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8D93A8',
    backgroundColor: '#F5F7FC',
  },
  carriageLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: C.primary,
  },
  wheels: {
    width: '78%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  wheel: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#485568',
    borderWidth: 4,
    borderColor: '#7F8CA0',
  },
  tray: {
    position: 'absolute',
    top: 239,
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 22,
    backgroundColor: C.white,
  },
  trayLabel: {
    textAlign: 'center',
    marginTop: 9,
    fontSize: 13,
    color: C.textSecondary,
    fontWeight: '600',
  },
  tilePosition: {
    position: 'absolute',
    top: 269,
    width: 62,
    height: 62,
  },
  tile: {
    width: 62,
    height: 62,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#D1C4EA',
    backgroundColor: C.lavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTile: {
    borderColor: C.primary,
    backgroundColor: C.yellow,
  },
  tileLetter: {
    fontSize: 33,
    fontWeight: '800',
    color: C.primary,
  },
  feedback: {
    fontSize: 15,
    lineHeight: 23,
    color: C.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedLetters: {
    fontSize: 33,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
  },
});