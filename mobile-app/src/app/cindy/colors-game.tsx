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

type Phase = 'ready' | 'playing' | 'paused' | 'round' | 'won';

const COLORS = [
  { name: 'red', fill: '#EF6677' },
  { name: 'orange', fill: '#F5A450' },
  { name: 'yellow', fill: '#F3CF57' },
  { name: 'green', fill: '#72BD8B' },
  { name: 'blue', fill: '#71AFE9' },
  { name: 'purple', fill: '#AE8BDF' },
];

const GOAL = 3;
const FIELD_HEIGHT = 380;

function shuffle(values: number[]) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));

    [result[index], result[other]] = [
      result[other],
      result[index],
    ];
  }

  return result;
}

function GameButton({
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
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Balloon({
  colorIndex,
  slot,
  gentle,
  reducedMotion,
  onHit,
}: {
  colorIndex: number;
  slot: number;
  gentle: boolean;
  reducedMotion: boolean;
  onHit: (colorIndex: number) => boolean;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);
  const alive = useRef(true);
  const popAnimation = useRef<Animated.CompositeAnimation | null>(
    null,
  );

  const [cycle, setCycle] = useState(0);
  const [popping, setPopping] = useState(false);

  const color = COLORS[colorIndex];

  useEffect(() => {
    alive.current = true;

    return () => {
      alive.current = false;
      popAnimation.current?.stop();
    };
  }, []);

  useEffect(() => {
    float.stopAnimation();

    if (reducedMotion) {
      float.setValue(slot < 3 ? 0.72 : 0.33);
      return;
    }

    // Begin with balloons spread across the sky.
    float.setValue(slot < 3 ? 0.66 : 0.25);

    const duration = gentle ? 10500 : 7200;

    const animation = Animated.sequence([
      Animated.timing(float, {
        toValue: 1,
        duration: duration * (slot < 3 ? 0.34 : 0.75),
        useNativeDriver: true,
        isInteraction: false,
      }),

      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
            isInteraction: false,
          }),

          Animated.timing(float, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            isInteraction: false,
          }),
        ]),
      ),
    ]);

    animation.start();

    return () => animation.stop();
  }, [cycle, float, gentle, reducedMotion, slot]);

  function hit() {
    if (busy.current) {
      return;
    }

    busy.current = true;

    const correct = onHit(colorIndex);

    if (correct) {
      setPopping(true);

      const animation = Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: reducedMotion ? 0 : 90,
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 0,
          duration: reducedMotion ? 0 : 160,
          useNativeDriver: true,
        }),

        Animated.delay(180),
      ]);

      popAnimation.current = animation;

      animation.start(({ finished }) => {
        if (!finished || !alive.current) {
          return;
        }

        scale.setValue(1);
        busy.current = false;
        setPopping(false);
        setCycle((value) => value + 1);
      });
    } else {
      const animation = Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.88,
          duration: reducedMotion ? 0 : 100,
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 1,
          duration: reducedMotion ? 0 : 140,
          useNativeDriver: true,
        }),
      ]);

      popAnimation.current = animation;

      animation.start(() => {
        busy.current = false;
      });
    }
  }

  return (
    <Animated.View
      style={[
        styles.balloonPosition,
        {
          left: `${(slot % 3) * 33.333}%`,
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [FIELD_HEIGHT + 10, -140],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{ scale }],
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${color.name} balloon`}
          onPress={hit}
          style={styles.balloonTouchArea}
        >
          {popping ? (
            <Text style={styles.popStar}>✨</Text>
          ) : (
            <View
              style={[
                styles.balloonBody,
                { backgroundColor: color.fill },
              ]}
            >
              <View style={styles.shine} />

              <View style={styles.face}>
                <Text style={styles.faceText}>• ◡ •</Text>
              </View>

              <View
                style={[
                  styles.knot,
                  { backgroundColor: color.fill },
                ]}
              />
            </View>
          )}

          {!popping && <View style={styles.string} />}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function ColorsGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [pops, setPops] = useState(0);
  const [score, setScore] = useState(0);
  const [gentle, setGentle] = useState(true);
  const [sound, setSound] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5]);
  const [message, setMessage] = useState('');
  const [audioMessage, setAudioMessage] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const popsRef = useRef(0);
  const focused = useRef(false);
  const mounted = useRef(true);
  const soundRef = useRef(true);
  const voice = useRef<string | undefined>(undefined);
  const speechVersion = useRef(0);

  const target = COLORS[round];

  const stopSpeech = useCallback(() => {
    speechVersion.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const say = useCallback(
    (text: string) => {
      stopSpeech();

      if (!focused.current || !soundRef.current) {
        return;
      }

      const version = speechVersion.current;

      function reportError() {
        if (
          mounted.current &&
          focused.current &&
          version === speechVersion.current
        ) {
          setAudioMessage(
            'Voice unavailable. Follow the colour shown above.',
          );
        }
      }

      try {
        Speech.speak(text, {
          language: 'en-GB',
          rate: 0.88,
          ...(voice.current ? { voice: voice.current } : {}),
          onError: reportError,
        });
      } catch {
        reportError();
      }
    },
    [stopSpeech],
  );

  function changePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    mounted.current = true;

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

        if (mounted.current) {
          voice.current = preferred?.identifier;
        }
      })
      .catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted.current) {
          setReducedMotion(enabled);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );

    return () => {
      mounted.current = false;
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
          }
        }
      },
    );

    return () => subscription.remove();
  }, [stopSpeech]);

  function begin(nextRound: number, resetScore = false) {
    popsRef.current = 0;

    setRound(nextRound);
    setPops(0);
    setOrder(shuffle([0, 1, 2, 3, 4, 5]));
    setMessage('Tap the matching balloons!');
    setAudioMessage('');

    if (resetScore) {
      setScore(0);
    }

    changePhase('playing');
    say(`Pop three ${COLORS[nextRound].name} balloons!`);
  }

  function hitBalloon(colorIndex: number) {
    if (phaseRef.current !== 'playing') {
      return false;
    }

    if (colorIndex !== round) {
      setMessage(
        `That is ${COLORS[colorIndex].name}. Look for ${target.name}!`,
      );

      say(`Find the ${target.name} balloons.`);
      return false;
    }

    const next = popsRef.current + 1;

    popsRef.current = next;
    setPops(next);
    setScore((value) => value + 10);

    if (next === GOAL) {
      const finalRound = round === COLORS.length - 1;

      changePhase(finalRound ? 'won' : 'round');
      setMessage('');

      say(
        finalRound
          ? 'Wonderful! Your rainbow is complete!'
          : `Well done! You collected ${target.name}!`,
      );
    } else {
      setMessage(`Pop! ${next} of ${GOAL}`);
      say(target.name);
    }

    return true;
  }

  function toggleSound() {
    const next = !soundRef.current;

    soundRef.current = next;
    setSound(next);
    setAudioMessage('');
    stopSpeech();

    if (next && phaseRef.current === 'playing') {
      say(`Pop the ${target.name} balloons!`);
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

  const collected =
    round + (phase === 'round' || phase === 'won' ? 1 : 0);

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topBar}>
            <GameButton title="← Back" onPress={goBack} secondary />

            <Text style={styles.score}>⭐ {score}</Text>

            <GameButton
              title={sound ? 'Voice on' : 'Voice off'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>Rainbow Balloon Pop</Text>

          <View style={styles.rainbowRow}>
            {COLORS.map((color, index) => (
              <View
                key={color.name}
                accessibilityLabel={
                  index < collected
                    ? `${color.name} collected`
                    : `${color.name} not collected`
                }
                style={[
                  styles.rainbowPiece,
                  {
                    backgroundColor:
                      index < collected ? color.fill : '#E4E8EE',
                  },
                ]}
              >
                <Text style={styles.check}>
                  {index < collected ? '✓' : ''}
                </Text>
              </View>
            ))}
          </View>

          {phase === 'ready' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🎈 🌈 🎈</Text>
              <Text style={styles.heading}>Let’s fill the rainbow!</Text>

              <Text style={styles.description}>
                Listen to the colour. Pop three matching balloons.
              </Text>

              <View style={styles.speedRow}>
                <GameButton
                  title={gentle ? '✓ Gentle' : 'Gentle'}
                  onPress={() => setGentle(true)}
                  secondary
                />

                <GameButton
                  title={!gentle ? '✓ Lively' : 'Lively'}
                  onPress={() => setGentle(false)}
                  secondary
                />
              </View>

              <GameButton
                title="Let’s play →"
                onPress={() => begin(0, true)}
              />
            </View>
          )}

          {phase === 'playing' && (
            <>
              <View style={styles.clue}>
                <View
                  style={[
                    styles.colorSample,
                    { backgroundColor: target.fill },
                  ]}
                />

                <View style={styles.clueWords}>
                  <Text style={styles.clueTitle}>
                    Pop {target.name}!
                  </Text>

                  <Text style={styles.smallText}>
                    {pops} / {GOAL} balloons
                  </Text>
                </View>

                <GameButton
                  title="Hear clue"
                  onPress={() =>
                    say(`Pop three ${target.name} balloons!`)
                  }
                  secondary
                />
              </View>

              <View style={styles.sky}>
                <View
                  pointerEvents="none"
                  style={styles.skyDecorations}
                >
                  <Text style={styles.cloud}>☁️</Text>
                  <Text style={styles.sun}>☀️</Text>
                  <Text style={styles.cloud}>☁️</Text>
                </View>

                <View pointerEvents="none" style={styles.hill} />

                {order.map((colorIndex, slot) => (
                  <Balloon
                    key={`${round}-${colorIndex}`}
                    colorIndex={colorIndex}
                    slot={slot}
                    gentle={gentle}
                    reducedMotion={reducedMotion}
                    onHit={hitBalloon}
                  />
                ))}
              </View>

              <Text
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                {message}
              </Text>

              <GameButton
                title="Pause"
                secondary
                onPress={() => {
                  stopSpeech();
                  changePhase('paused');
                }}
              />
            </>
          )}

          {phase === 'paused' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🌤️</Text>
              <Text style={styles.heading}>Take a little break</Text>

              <Text style={styles.description}>
                Your collected colours are safe.
              </Text>

              <GameButton
                title="Keep popping →"
                onPress={() => {
                  changePhase('playing');
                  say(`Pop the ${target.name} balloons!`);
                }}
              />

              <GameButton
                title="Start again"
                onPress={() => begin(0, true)}
                secondary
              />
            </View>
          )}

          {phase === 'round' && (
            <View style={styles.card}>
              <View
                style={[
                  styles.rewardCircle,
                  { backgroundColor: target.fill },
                ]}
              >
                <Text style={styles.rewardStar}>⭐</Text>
              </View>

              <Text style={styles.heading}>
                You collected {target.name}!
              </Text>

              <GameButton
                title="Next colour →"
                onPress={() => begin(round + 1)}
              />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🌈 🏆</Text>
              <Text style={styles.heading}>Rainbow complete!</Text>

              <Text style={styles.description}>
                18 balloons popped · {score} points
              </Text>

              <GameButton
                title="Play again ↻"
                onPress={() => begin(0, true)}
              />

              <GameButton
                title="Back to games"
                onPress={goBack}
                secondary
              />
            </View>
          )}

          {!!audioMessage && (
            <Text style={styles.feedback}>{audioMessage}</Text>
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
    maxWidth: 480,
    alignSelf: 'center',
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
    fontSize: 27,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginVertical: 22,
  },
  button: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    color: C.white,
  },
  secondaryButton: {
    backgroundColor: C.blue,
  },
  secondaryText: {
    color: C.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  rainbowRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
  },
  rainbowPiece: {
    flex: 1,
    height: 31,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    color: '#263247',
    fontSize: 19,
    fontWeight: '800',
  },
  card: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: C.white,
    gap: 20,
  },
  hero: {
    fontSize: 46,
    textAlign: 'center',
    marginVertical: 12,
  },
  heading: {
    fontSize: 25,
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
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  clue: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 22,
    marginBottom: 14,
  },
  colorSample: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clueWords: {
    flex: 1,
    minWidth: 100,
  },
  clueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  smallText: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
  },
  sky: {
    height: FIELD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#DDF2FF',
  },
  skyDecorations: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cloud: {
    fontSize: 41,
  },
  sun: {
    fontSize: 48,
  },
  hill: {
    position: 'absolute',
    bottom: -70,
    left: -30,
    right: -30,
    height: 130,
    backgroundColor: '#C5E4B8',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
  },
  balloonPosition: {
    position: 'absolute',
    top: 0,
    width: '33.333%',
    alignItems: 'center',
  },
  balloonTouchArea: {
    width: 82,
    height: 126,
    alignItems: 'center',
  },
  balloonBody: {
    width: 72,
    height: 85,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(50,60,80,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    top: 13,
    left: 12,
    width: 11,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '20deg' }],
  },
  face: {
    marginTop: 15,
  },
  faceText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#354052',
  },
  knot: {
    position: 'absolute',
    bottom: -5,
    width: 11,
    height: 11,
    transform: [{ rotate: '45deg' }],
  },
  string: {
    height: 35,
    width: 2,
    marginTop: 5,
    backgroundColor: '#8DA1AF',
  },
  popStar: {
    fontSize: 58,
  },
  feedback: {
    fontSize: 15,
    lineHeight: 23,
    color: C.text,
    textAlign: 'center',
    marginVertical: 14,
  },
  rewardCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardStar: {
    fontSize: 47,
  },
});