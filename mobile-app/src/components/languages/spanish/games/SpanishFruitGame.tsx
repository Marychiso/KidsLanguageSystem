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
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Rect,
} from 'react-native-svg';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type Kind = 0 | 1 | 2 | 3;
type Phase = 'ready' | 'playing' | 'paused' | 'round' | 'won';

type Drop = {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  speed: number;
  rejected: boolean;
  vx: number;
  vy: number;
  position: Animated.ValueXY;
};

const FRUITS = [
  {
    name: 'manzana',
    plural: 'manzanas',
    article: 'las',
    indefinite: 'una',
  },
  {
    name: 'plátano',
    plural: 'plátanos',
    article: 'los',
    indefinite: 'un',
  },
  {
    name: 'fresa',
    plural: 'fresas',
    article: 'las',
    indefinite: 'una',
  },
  {
    name: 'sandía',
    plural: 'sandías',
    article: 'las',
    indefinite: 'una',
  },
];

const SIZE = 44;
const BASKET = 92;
const GOAL = 5;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

function clueFor(kind: Kind) {
  const fruit = FRUITS[kind];
  return `¡Atrapa ${fruit.article} ${fruit.plural}!`;
}

function Fruit({
  kind,
  size = SIZE,
}: {
  kind: Kind;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {kind === 0 && (
        <>
          <Path
            d="M32 19 C9 5 3 32 14 49 Q22 61 32 53 Q44 61 53 45 C64 21 47 9 32 19"
            fill="#E75A70"
            stroke="#AE354C"
            strokeWidth="2"
          />
          <Path
            d="M32 20 Q29 10 35 4"
            stroke="#79513C"
            strokeWidth="4"
            fill="none"
          />
          <Path
            d="M35 13 Q42 0 52 8 Q47 20 35 13"
            fill="#58A66C"
          />
          <Path
            d="M17 24 Q12 31 16 38"
            fill="none"
            stroke="#FFC6CE"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}

      {kind === 1 && (
        <>
          <Path
            d="M16 8 Q9 43 48 40 L55 34 Q50 60 28 55 Q2 49 9 18 Z"
            fill="#FFDA60"
            stroke="#BE902D"
            strokeWidth="2"
          />
          <Path
            d="M15 20 Q12 48 43 48"
            fill="none"
            stroke="#EDB83C"
            strokeWidth="3"
          />
          <Path
            d="M11 15 L15 7 M49 40 L56 34"
            stroke="#79513C"
            strokeWidth="5"
          />
        </>
      )}

      {kind === 2 && (
        <>
          <Path
            d="M9 25 Q12 10 31 17 Q50 10 55 25 Q51 47 32 59 Q13 47 9 25"
            fill="#EE6684"
            stroke="#B83856"
            strokeWidth="2"
          />
          <Path
            d="M32 20 L12 11 L25 10 L30 2 L36 12 L51 10 L42 21 Z"
            fill="#5FAD76"
          />
          {[
            [20, 28],
            [34, 28],
            [46, 29],
            [25, 39],
            [39, 40],
            [32, 49],
          ].map(([x, y]) => (
            <Ellipse
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              rx="1.7"
              ry="2.5"
              fill="#FFE9A0"
            />
          ))}
        </>
      )}

      {kind === 3 && (
        <>
          <Path
            d="M4 17 L60 17 A28 39 0 0 1 4 17"
            fill="#5CA76B"
            stroke="#36784A"
            strokeWidth="2"
          />
          <Path
            d="M9 18 L55 18 A23 31 0 0 1 9 18"
            fill="#D7EFAA"
          />
          <Path
            d="M13 18 L51 18 A19 26 0 0 1 13 18"
            fill="#EF7282"
          />
          {[
            [22, 25],
            [32, 32],
            [42, 25],
          ].map(([x, y]) => (
            <Ellipse
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              rx="1.7"
              ry="3"
              fill="#62414A"
            />
          ))}
        </>
      )}
    </Svg>
  );
}

function Basket() {
  return (
    <Svg width={BASKET} height="68" viewBox="0 0 100 74">
      <Path
        d="M24 25 Q24 -3 50 0 Q76 -3 76 25"
        fill="none"
        stroke="#98663C"
        strokeWidth="6"
      />
      <Path
        d="M6 25 L94 25 L82 69 L18 69 Z"
        fill="#D79C5D"
        stroke="#98663C"
        strokeWidth="3"
      />

      {[28, 43, 58, 73].map((x) => (
        <Line
          key={x}
          x1={x}
          y1="28"
          x2={x}
          y2="66"
          stroke="#AF7844"
          strokeWidth="2"
        />
      ))}

      {[40, 52, 62].map((y) => (
        <Line
          key={y}
          x1="16"
          y1={y}
          x2="84"
          y2={y}
          stroke="#AF7844"
          strokeWidth="2"
        />
      ))}

      <Rect
        x="3"
        y="22"
        width="94"
        height="9"
        rx="4"
        fill="#F2BC7D"
        stroke="#98663C"
        strokeWidth="2"
      />
      <Circle cx="43" cy="44" r="3" fill="#563D32" />
      <Circle cx="60" cy="44" r="3" fill="#563D32" />
      <Path
        d="M43 53 Q51 61 60 53"
        fill="none"
        stroke="#563D32"
        strokeWidth="2.5"
      />
    </Svg>
  );
}

function Garden() {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 600 460"
        preserveAspectRatio="none"
      >
        <Rect width="600" height="460" fill="#DCF2FC" />
        <Circle cx="500" cy="65" r="32" fill="#FFE49A" />
        <Ellipse cx="150" cy="70" rx="65" ry="20" fill="white" />
        <Ellipse cx="118" cy="63" rx="25" ry="20" fill="white" />
        <Ellipse
          cx="400"
          cy="440"
          rx="360"
          ry="100"
          fill="#C8E7B9"
        />
        <Ellipse
          cx="70"
          cy="457"
          rx="270"
          ry="85"
          fill="#B0D8A4"
        />
        <Path
          d="M45 360 L50 130 M555 360 L548 130"
          stroke="#A57F5F"
          strokeWidth="22"
        />
        <Circle cx="35" cy="120" r="72" fill="#79B991" />
        <Circle cx="570" cy="110" r="78" fill="#79B991" />
        <Circle cx="80" cy="92" r="48" fill="#8DC69E" />
        <Circle cx="520" cy="80" r="48" fill="#8DC69E" />
      </Svg>
    </View>
  );
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
        secondary && styles.secondary,
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

function Celebration({ animate }: { animate: boolean }) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fall.setValue(0);
    if (!animate) return;

    const animation = Animated.loop(
      Animated.timing(fall, {
        toValue: 1,
        duration: 2300,
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [animate, fall]);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {Array.from({ length: 14 }, (_, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: `${5 + index * 6.7}%`,
            top: 0,
            width: 8,
            height: 14,
            borderRadius: 3,
            backgroundColor: [
              '#A68AE4',
              '#F8CE65',
              '#7DC6DE',
              '#EC91A4',
            ][index % 4],
            transform: [
              {
                translateY: animate
                  ? fall.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40 - index * 9, 360],
                    })
                  : (index % 3) * 20,
              },
              {
                rotate: fall.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    '0deg',
                    `${180 + index * 30}deg`,
                  ],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

export default function SpanishFruitGame() {
  const { height: windowHeight } = useWindowDimensions();
  const fieldHeight = clamp(windowHeight - 300, 240, 460);

  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState<Kind>(0);
  const [caught, setCaught] = useState(0);
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [sound, setSound] = useState(true);
  const [gentle, setGentle] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [measured, setMeasured] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const [feedback, setFeedback] = useState(
    'Mueve la cesta para atrapar las frutas.'
  );
  const [audioError, setAudioError] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const roundRef = useRef<Kind>(0);
  const focus = useRef(false);
  const foreground = useRef(true);
  const alive = useRef(true);
  const soundRef = useRef(true);
  const voice = useRef<Speech.Voice | undefined>(undefined);
  const speechRequest = useRef(0);
  const speechTime = useRef(0);

  const bounds = useRef({
    width: 300,
    height: fieldHeight,
  });
  const basketX = useRef(104);
  const basketAnimation = useRef(new Animated.Value(104)).current;
  const dragStart = useRef(0);
  const items = useRef<Drop[]>([]);
  const nextId = useRef(0);
  const spawnElapsed = useRef(0);
  const totalSpawned = useRef(0);
  const countRef = useRef(0);

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    if (alive.current) setPhase(next);
  }, []);

  const stopSpeech = useCallback(() => {
    speechRequest.current += 1;
    return Speech.stop().catch(() => {});
  }, []);

  const loadVoice = useCallback(async () => {
    const voices = await Speech.getAvailableVoicesAsync();

    const spanish = voices.filter((item) =>
      /^es(?:[-_]|$)/i.test(item.language)
    );
    const spain = spanish.filter((item) =>
      /^es[-_]ES$/i.test(item.language)
    );

    const chosen =
      spain.find(
        (item) => item.quality === Speech.VoiceQuality.Enhanced
      ) ??
      spain[0] ??
      spanish[0];

    if (alive.current) {
      voice.current = chosen;
    }

    return chosen;
  }, []);

  const say = useCallback(async (text: string) => {
    if (
      !alive.current ||
      !soundRef.current ||
      !focus.current ||
      !foreground.current
    ) {
      return;
    }

    const request = ++speechRequest.current;
    setAudioError('');

    function stillActive() {
      return (
        request === speechRequest.current &&
        alive.current &&
        focus.current &&
        foreground.current &&
        soundRef.current
      );
    }

    function reportError() {
      if (stillActive()) {
        setAudioError(
          'La voz no está disponible. Mira la fruta que debes atrapar.'
        );
      }
    }

    try {
      await Speech.stop();
      if (!stillActive()) return;

      let chosen = voice.current;

      if (!chosen) {
        chosen = await loadVoice();
      }

      if (!stillActive()) return;

      if (!chosen) {
        setAudioError(
          'No hay una voz en español disponible en este dispositivo. ' +
          'Puedes seguir jugando con las imágenes.'
        );
        return;
      }

      Speech.speak(text, {
        language: chosen.language,
        voice: chosen.identifier,
        rate: 0.83,
        pitch: 1,
        volume: 1,
        onError: reportError,
      });
    } catch {
      reportError();
    }
  }, [loadVoice]);

  useEffect(() => {
    alive.current = true;

    void loadVoice().catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (alive.current) setReduced(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (alive.current) setReduced(enabled);
      }
    );

    return () => {
      alive.current = false;
      subscription.remove();
      void stopSpeech();
    };
  }, [loadVoice, stopSpeech]);

  const pause = useCallback(() => {
    if (phaseRef.current === 'playing') {
      changePhase('paused');
    }

    void stopSpeech();
  }, [changePhase, stopSpeech]);

  useFocusEffect(
    useCallback(() => {
      focus.current = true;
      foreground.current = isForeground();
      setScreenActive(foreground.current);

      if (!foreground.current) pause();

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          foreground.current = state === 'active';

          if (alive.current) {
            setScreenActive(foreground.current);
          }

          if (!foreground.current) pause();
        }
      );

      return () => {
        focus.current = false;
        subscription.remove();
        pause();

        if (alive.current) {
          setScreenActive(false);
        }
      };
    }, [pause])
  );

  const moveBasket = useCallback((x: number) => {
    const next = clamp(
      x,
      4,
      Math.max(4, bounds.current.width - BASKET - 4)
    );

    basketX.current = next;
    basketAnimation.setValue(next);
  }, [basketAnimation]);

  const pan = React.useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () =>
        phaseRef.current === 'playing',
      onMoveShouldSetPanResponder: () =>
        phaseRef.current === 'playing',
      onPanResponderGrant: () => {
        dragStart.current = basketX.current;
      },
      onPanResponderMove: (_, gesture) => {
        if (phaseRef.current === 'playing') {
          moveBasket(dragStart.current + gesture.dx);
        }
      },
      onPanResponderTerminationRequest: () => true,
    }),
    [moveBasket]
  );

  function begin(next: Kind, reset = false) {
    if (!focus.current || !foreground.current) return;

    items.current = [];
    setDrops([]);
    spawnElapsed.current = 0;
    totalSpawned.current = 0;
    speechTime.current = 0;
    roundRef.current = next;
    countRef.current = 0;

    setRound(next);
    setCaught(0);
    if (reset) setScore(0);

    moveBasket((bounds.current.width - BASKET) / 2);
    setFeedback(
      'Desliza el dedo por el jardín para mover la cesta.'
    );
    setAudioError('');
    changePhase('playing');
    void say(`¡Atrapa cinco ${FRUITS[next].plural}!`);
  }

  function openGames() {
    pause();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'spanish',
        activity: 'games',
      },
    });
  }

  function goBack() {
    pause();

    if (router.canGoBack()) {
      router.back();
    } else {
      openGames();
    }
  }

  function toggleSound() {
    const next = !soundRef.current;
    soundRef.current = next;
    setSound(next);
    setAudioError('');

    if (next) {
      void say(clueFor(roundRef.current));
    } else {
      void stopSpeech();
    }
  }

  useEffect(() => {
    if (phase !== 'playing') return;

    let frame = 0;
    let last = 0;
    let cancelled = false;

    function step(now: number) {
      if (
        cancelled ||
        !alive.current ||
        phaseRef.current !== 'playing' ||
        !focus.current ||
        !foreground.current
      ) {
        return;
      }

      const dt = last
        ? Math.min((now - last) / 1000, 0.04)
        : 0;
      last = now;

      const { width, height } = bounds.current;
      const target = roundRef.current;
      const interval = gentle ? 1.65 : 1.1;

      spawnElapsed.current += dt;
      let changed = false;

      if (
        spawnElapsed.current >= interval &&
        items.current.length < 7
      ) {
        spawnElapsed.current = 0;

        const kind: Kind =
          totalSpawned.current++ % 2 === 0
            ? target
            : (
                (target + 1 + Math.floor(Math.random() * 3)) % 4
              ) as Kind;

        const x =
          10 + Math.random() * Math.max(1, width - SIZE - 20);

        items.current.push({
          id: ++nextId.current,
          kind,
          x,
          y: -SIZE,
          speed:
            (height / (gentle ? 5.8 : 4.3)) *
            (1 + target * 0.08),
          rejected: false,
          vx: 0,
          vy: 0,
          position: new Animated.ValueXY({ x, y: -SIZE }),
        });

        changed = true;
      }

      const kept: Drop[] = [];
      const catchLine = height - 66;

      for (const item of items.current) {
        const oldBottom = item.y + SIZE;

        if (item.rejected) {
          item.vy += 520 * dt;
          item.y += item.vy * dt;
          item.x += item.vx * dt;
        } else {
          item.y += item.speed * dt;
        }

        const centre = item.x + SIZE / 2;
        const hitsBasket =
          !item.rejected &&
          oldBottom < catchLine &&
          item.y + SIZE >= catchLine &&
          centre >= basketX.current + 3 &&
          centre <= basketX.current + BASKET - 3;

        if (hitsBasket) {
          if (item.kind === target) {
            changed = true;
            countRef.current += 1;
            setCaught(countRef.current);
            setScore((value) => value + 10);

            const fruit = FRUITS[target];
            const label =
              fruit.name[0].toUpperCase() + fruit.name.slice(1);

            setFeedback(`✨ ¡${label}! +10`);

            if (countRef.current >= GOAL) {
              items.current = [];
              setDrops([]);

              const finished = target === 3;
              changePhase(finished ? 'won' : 'round');

              void say(
                finished
                  ? '¡Muy bien! ¡Has llenado las cuatro cestas!'
                  : `¡Muy bien! ¡Has atrapado cinco ${fruit.plural}!`
              );

              return;
            }

            if (now - speechTime.current > 900) {
              speechTime.current = now;
              void say(fruit.name);
            }

            continue;
          }

          item.rejected = true;
          item.vy = -175;
          item.vx = centre < width / 2 ? -95 : 95;

          const other = FRUITS[item.kind];
          const wanted = FRUITS[target];

          setFeedback(
            `Es ${other.indefinite} ${other.name}. ` +
            `¡Busca ${wanted.article} ${wanted.plural}!`
          );
        }

        if (
          item.y > height + SIZE ||
          item.x < -SIZE * 2 ||
          item.x > width + SIZE
        ) {
          changed = true;
          continue;
        }

        item.position.setValue({
          x: item.x,
          y: item.y,
        });
        kept.push(item);
      }

      items.current = kept;
      if (changed) setDrops([...kept]);

      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [phase, gentle, changePhase, say]);

  const fruit = FRUITS[round];

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled={phase !== 'playing'}
      >
        <View style={styles.panel}>
          <View style={styles.row}>
            <GameButton
              title="← Volver"
              onPress={goBack}
              secondary
            />

            <Text style={styles.score}>★ {score}</Text>

            <GameButton
              title={sound ? 'Voz activada' : 'Voz desactivada'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>
            La cesta de frutas
          </Text>

          <View style={styles.target}>
            <Fruit kind={round} size={38} />

            <View style={{ flex: 1 }}>
              <Text style={styles.targetText}>
                {clueFor(round)}
              </Text>
              <Text style={styles.small}>
                Cesta {round + 1} de 4 · {caught} / {GOAL}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escuchar qué fruta hay que atrapar"
              onPress={() => {
                void say(`¡Atrapa cinco ${fruit.plural}!`);
              }}
              style={styles.hear}
            >
              <Text style={styles.targetText}>♪</Text>
            </Pressable>

            {phase === 'playing' && (
              <GameButton
                title="Pausa"
                onPress={pause}
                secondary
              />
            )}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(caught / GOAL) * 100}%` },
              ]}
            />
          </View>

          <View
            style={[styles.field, { height: fieldHeight }]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              const old = bounds.current;
              const resized =
                Math.abs(width - old.width) > 2 ||
                Math.abs(height - old.height) > 2;

              if (resized && phaseRef.current === 'playing') {
                pause();
              }

              bounds.current = { width, height };
              moveBasket((width - BASKET) / 2);
              setMeasured(true);
            }}
          >
            <Garden />

            <View
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            >
              {drops.map((item) => (
                <Animated.View
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: item.position.getTranslateTransform(),
                  }}
                >
                  <Fruit kind={item.kind} />
                </Animated.View>
              ))}

              <Animated.View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  transform: [
                    { translateX: basketAnimation },
                  ],
                }}
              >
                <Basket />
              </Animated.View>
            </View>

            {phase === 'playing' && (
              <View
                {...pan.panHandlers}
                style={StyleSheet.absoluteFill}
                accessibilityLabel="Desliza a la izquierda o a la derecha para mover la cesta"
              />
            )}

            {phase !== 'playing' && (
              <View style={styles.overlay}>
                {(phase === 'round' || phase === 'won') && (
                  <Celebration
                    animate={!reduced && screenActive}
                  />
                )}

                <ScrollView
                  contentContainerStyle={styles.modalScroll}
                >
                  <View style={styles.modal}>
                    <Text style={styles.modalIcon}>
                      {{
                        ready: '🧺',
                        paused: '☕',
                        round: '🌟',
                        won: '🏆',
                      }[phase]}
                    </Text>

                    {phase === 'ready' && (
                      <>
                        <Text style={styles.modalTitle}>
                          ¿Llenamos la cesta?
                        </Text>

                        <Text style={styles.modalText}>
                          Mueve la cesta para atrapar la fruta
                          indicada arriba. ¡Las otras frutas rebotan!
                        </Text>

                        <View style={styles.row}>
                          <GameButton
                            title={gentle ? '✓ Despacio' : 'Despacio'}
                            onPress={() => setGentle(true)}
                            secondary
                          />
                          <GameButton
                            title={!gentle ? '✓ Rápido' : 'Rápido'}
                            onPress={() => setGentle(false)}
                            secondary
                          />
                        </View>

                        <Text style={styles.small}>
                          Sin cronómetro. Sin perder vidas.
                        </Text>

                        {measured && (
                          <GameButton
                            title="Jugar →"
                            onPress={() => begin(0, true)}
                          />
                        )}
                      </>
                    )}

                    {phase === 'paused' && (
                      <>
                        <Text style={styles.modalTitle}>
                          Una pequeña pausa
                        </Text>

                        <Text style={styles.modalText}>
                          Tus frutas te esperan aquí.
                        </Text>

                        <GameButton
                          title="Continuar →"
                          onPress={() => {
                            if (
                              !focus.current ||
                              !foreground.current
                            ) {
                              return;
                            }

                            changePhase('playing');
                            void say(clueFor(roundRef.current));
                          }}
                        />

                        <GameButton
                          title="Empezar de nuevo"
                          onPress={() => begin(0, true)}
                          secondary
                        />
                      </>
                    )}

                    {phase === 'round' && (
                      <>
                        <Text style={styles.modalTitle}>
                          ¡Tu cesta está llena!
                        </Text>

                        <Text style={styles.modalText}>
                          Has atrapado cinco {fruit.plural}.
                        </Text>

                        <GameButton
                          title="Siguiente cesta →"
                          onPress={() => {
                            if (phaseRef.current !== 'round') return;
                            begin((round + 1) as Kind);
                          }}
                        />
                      </>
                    )}

                    {phase === 'won' && (
                      <>
                        <Text style={styles.modalTitle}>
                          ¡Muy bien, lo has conseguido!
                        </Text>

                        <Text style={styles.modalText}>
                          {FRUITS.length * GOAL} frutas atrapadas
                          {' · '}
                          {score} puntos
                        </Text>

                        <GameButton
                          title="Jugar de nuevo ↻"
                          onPress={() => begin(0, true)}
                        />

                        <GameButton
                          title="Volver a los juegos"
                          onPress={openGames}
                          secondary
                        />
                      </>
                    )}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          <Text
            accessibilityLiveRegion="polite"
            style={styles.feedback}
          >
            {feedback}
          </Text>

          {phase === 'playing' && (
            <View style={styles.controls}>
              <GameButton
                title="← Izquierda"
                onPress={() => {
                  if (phaseRef.current === 'playing') {
                    moveBasket(basketX.current - 45);
                  }
                }}
                secondary
              />

              <GameButton
                title="Derecha →"
                onPress={() => {
                  if (phaseRef.current === 'playing') {
                    moveBasket(basketX.current + 45);
                  }
                }}
                secondary
              />
            </View>
          )}

          {!!audioError && (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.small}
            >
              {audioError}
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
    padding: 14,
    paddingBottom: 28,
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginVertical: 14,
  },
  score: {
    fontSize: 19,
    fontWeight: '800',
    color: C.primary,
  },
  button: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: C.lavender,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },
  secondaryText: {
    color: C.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  target: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 10,
    borderRadius: 18,
  },
  targetText: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },
  small: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  hear: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.blue,
    borderRadius: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: C.lavender,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
  },
  field: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: C.blue,
    borderWidth: 2,
    borderColor: '#C3DDE5',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239,247,252,0.92)',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    gap: 12,
    alignItems: 'stretch',
  },
  modalIcon: {
    fontSize: 38,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 23,
    color: C.text,
    textAlign: 'center',
  },
  feedback: {
    fontSize: 14,
    lineHeight: 21,
    color: C.text,
    textAlign: 'center',
    marginVertical: 9,
    minHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});