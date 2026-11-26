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
  { name: 'kırmızı', label: 'Kırmızı', fill: '#EF6677' },
  { name: 'turuncu', label: 'Turuncu', fill: '#F5A450' },
  { name: 'sarı', label: 'Sarı', fill: '#F3CF57' },
  { name: 'yeşil', label: 'Yeşil', fill: '#72BD8B' },
  { name: 'mavi', label: 'Mavi', fill: '#71AFE9' },
  { name: 'mor', label: 'Mor', fill: '#AE8BDF' },
];

const GOAL = 3;
const FIELD_HEIGHT = 380;

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

function shuffledOrder() {
  const order = COLORS.map((_, index) => index);

  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }

  return order;
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
  const popAnimation =
    useRef<Animated.CompositeAnimation | null>(null);

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
    if (busy.current) return;
    busy.current = true;

    const correct = onHit(colorIndex);

    if (correct) {
      setPopping(true);

      const animation = Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: reducedMotion ? 0 : 90,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: reducedMotion ? 0 : 160,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.delay(180),
      ]);

      popAnimation.current = animation;

      animation.start(({ finished }) => {
        if (!finished || !alive.current) return;

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
          isInteraction: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: reducedMotion ? 0 : 140,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]);

      popAnimation.current = animation;

      animation.start(() => {
        if (alive.current) {
          busy.current = false;
        }
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
          accessibilityLabel={`${color.label} balon`}
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

export default function TurkishColorsGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(0);
  const [pops, setPops] = useState(0);
  const [score, setScore] = useState(0);
  const [gentle, setGentle] = useState(true);
  const [sound, setSound] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5]);
  const [message, setMessage] = useState('');
  const [audioMessage, setAudioMessage] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const popsRef = useRef(0);
  const focused = useRef(false);
  const foreground = useRef(isForeground());
  const mounted = useRef(true);
  const soundRef = useRef(true);
  const voice = useRef<Speech.Voice | undefined>(undefined);
  const speechVersion = useRef(0);

  const target = COLORS[round];

  const collected =
    round + (phase === 'round' || phase === 'won' ? 1 : 0);

  const stopSpeech = useCallback(() => {
    speechVersion.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  const loadVoice = useCallback(async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();

      const turkish = voices.filter((item) =>
        /^tr(?:[-_]|$)/i.test(item.language),
      );

      const turkey = turkish.filter((item) =>
        /^tr[-_]TR$/i.test(item.language),
      );

      const selected =
        turkey.find((item) => /google/i.test(item.name)) ??
        turkey[0] ??
        turkish[0];

      if (mounted.current) {
        voice.current = selected;
      }

      return selected;
    } catch {
      return undefined;
    }
  }, []);

  const say = useCallback(
    async (text: string) => {
      const version = ++speechVersion.current;

      function canSpeak() {
        return (
          mounted.current &&
          focused.current &&
          foreground.current &&
          soundRef.current &&
          speechVersion.current === version
        );
      }

      function reportError() {
        if (canSpeak()) {
          setAudioMessage(
            'Ses başlatılamadı. Gösterilen renge bak.',
          );
        }
      }

      try {
        await Speech.stop();
        if (!canSpeak()) return;

        const selected = voice.current ?? (await loadVoice());
        if (!canSpeak()) return;

        if (!selected) {
          setAudioMessage(
            'Bu cihazda Türkçe ses bulunamadı. ' +
              'Gösterilen rengi takip ederek oynamaya devam edebilirsin.',
          );
          return;
        }

        setAudioMessage('');

        Speech.speak(text, {
          language: selected.language,
          voice: selected.identifier,
          rate: 0.83,
          pitch: 1,
          volume: 1,
          onError: reportError,
        });
      } catch {
        reportError();
      }
    },
    [loadVoice],
  );

  function changePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    mounted.current = true;
    void loadVoice();

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
  }, [loadVoice]);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      foreground.current = isForeground();

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
        foreground.current = state === 'active';

        if (!foreground.current && focused.current) {
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
    if (nextRound < 0 || nextRound >= COLORS.length) return;

    popsRef.current = 0;
    setRound(nextRound);
    setPops(0);
    setOrder(shuffledOrder());
    setMessage('Doğru renkteki balonlara dokun!');
    setAudioMessage('');

    if (resetScore) {
      setScore(0);
    }

    changePhase('playing');

    void say(
      `Üç ${COLORS[nextRound].name} balon patlat!`,
    );
  }

  function hitBalloon(colorIndex: number) {
    if (phaseRef.current !== 'playing') return false;

    if (colorIndex !== round) {
      setMessage(
        `Bu balon ${COLORS[colorIndex].name}. ` +
          `${target.label} balonları bul!`,
      );

      void say(`${target.label} balonları bul.`);
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

      void say(
        finalRound
          ? 'Aferin! Gökkuşağını tamamladın!'
          : `Aferin! Üç ${target.name} balon patlattın!`,
      );
    } else {
      setMessage(`Pat! ${next} / ${GOAL}`);
      void say(target.name);
    }

    return true;
  }

  function toggleSound() {
    const next = !soundRef.current;

    soundRef.current = next;
    setSound(next);
    setAudioMessage('');

    if (next && phaseRef.current === 'playing') {
      void say(`${target.label} balonları patlat!`);
    } else {
      stopSpeech();
    }
  }

  function pauseGame() {
    stopSpeech();

    if (phaseRef.current === 'playing') {
      changePhase('paused');
    }
  }

  function openGames() {
    pauseGame();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'turkish',
        activity: 'games',
      },
    });
  }

  function goBack() {
    pauseGame();

    if (router.canGoBack()) {
      router.back();
    } else {
      openGames();
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topBar}>
            <GameButton
              title="← Geri"
              onPress={goBack}
              secondary
            />

            <Text style={styles.score}>⭐ {score}</Text>

            <GameButton
              title={sound ? 'Ses açık' : 'Ses kapalı'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>
            Gökkuşağı Balonları
          </Text>

          <View style={styles.rainbowRow}>
            {COLORS.map((color, index) => (
              <View
                key={color.name}
                accessible
                accessibilityLabel={
                  index < collected
                    ? `${color.label} tamamlandı`
                    : `${color.label} henüz tamamlanmadı`
                }
                style={[
                  styles.rainbowPiece,
                  {
                    backgroundColor:
                      index < collected
                        ? color.fill
                        : '#E4E8EE',
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

              <Text style={styles.heading}>
                Gökkuşağını renklendirelim!
              </Text>

              <Text style={styles.description}>
                Rengin adını dinle. O renkteki üç balonu patlat.
              </Text>

              <View style={styles.speedRow}>
                <GameButton
                  title={gentle ? '✓ Yavaş' : 'Yavaş'}
                  onPress={() => setGentle(true)}
                  secondary
                />

                <GameButton
                  title={!gentle ? '✓ Hızlı' : 'Hızlı'}
                  onPress={() => setGentle(false)}
                  secondary
                />
              </View>

              <GameButton
                title="Oyna →"
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
                    {target.label} balonlar!
                  </Text>

                  <Text style={styles.smallText}>
                    {pops} / {GOAL} balon
                  </Text>
                </View>

                <GameButton
                  title="Dinle"
                  onPress={() => {
                    void say(
                      `Üç ${target.name} balon patlat!`,
                    );
                  }}
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

                <View
                  pointerEvents="none"
                  style={styles.hill}
                />

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
                title="Duraklat"
                onPress={pauseGame}
                secondary
              />
            </>
          )}

          {phase === 'paused' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🌤️</Text>

              <Text style={styles.heading}>
                Küçük bir mola
              </Text>

              <Text style={styles.description}>
                Bulduğun renkler ve kazandığın puanlar duruyor.
              </Text>

              <GameButton
                title="Devam et →"
                onPress={() => {
                  changePhase('playing');
                  void say(
                    `${target.label} balonları patlat!`,
                  );
                }}
              />

              <GameButton
                title="Yeniden başla"
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
                Üç {target.name} balon patlattın!
              </Text>

              <GameButton
                title="Sonraki renk →"
                onPress={() => begin(round + 1)}
              />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🌈 🏆</Text>

              <Text style={styles.heading}>
                Gökkuşağını tamamladın!
              </Text>

              <Text style={styles.description}>
                {COLORS.length * GOAL} balon patlattın
                {' · '}
                {score} puan
              </Text>

              <GameButton
                title="Tekrar oyna ↻"
                onPress={() => begin(0, true)}
              />

              <GameButton
                title="Oyunlara dön"
                onPress={openGames}
                secondary
              />
            </View>
          )}

          {!!audioMessage && (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.feedback}
            >
              {audioMessage}
            </Text>
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