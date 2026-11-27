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
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type ShapeName = 'circle' | 'square' | 'triangle';

const shapeWords: Record<ShapeName, string> = {
  circle: 'círculo',
  square: 'cuadrado',
  triangle: 'triángulo',
};

const pages = [
  {
    title: 'Descubre las formas',
    text:
      'Sam llega a un parque lleno de colores. ' +
      'Ve un círculo, un cuadrado y un triángulo.',
  },
  {
    title: '¡Nos movemos!',
    text:
      'Las formas se mueven y juegan juntas. ' +
      'El círculo rueda, el cuadrado rebota y el triángulo se inclina.',
  },
  {
    title: 'Una casita de formas',
    text:
      'Sam sonríe. «¡Conozco estas formas!» ' +
      'Un cuadrado y un triángulo forman una casa. ' +
      'El círculo se parece al sol.',
  },
];

const shapes: {
  name: ShapeName;
  label: string;
  color: string;
}[] = [
  { name: 'circle', label: 'El círculo', color: C.yellow },
  { name: 'square', label: 'El cuadrado', color: C.blue },
  { name: 'triangle', label: 'El triángulo', color: C.pink },
];

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

function ShapePicture({
  name,
  size = 66,
}: {
  name: ShapeName;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {name === 'circle' && (
        <Circle
          cx="50"
          cy="50"
          r="43"
          fill="#FFD45C"
          stroke="#B77C16"
          strokeWidth="3"
        />
      )}

      {name === 'square' && (
        <Rect
          x="8"
          y="8"
          width="84"
          height="84"
          fill="#77C7F3"
          stroke="#2875A2"
          strokeWidth="3"
        />
      )}

      {name === 'triangle' && (
        <Polygon
          points="50,6 95,91 5,91"
          fill="#FF9B9F"
          stroke="#B64D69"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}

      <Circle cx="38" cy="53" r="4" fill="#34304A" />
      <Circle cx="62" cy="53" r="4" fill="#34304A" />

      <Path
        d="M39 65 Q50 76 61 65"
        fill="none"
        stroke="#34304A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Sam() {
  return (
    <Svg width="76" height="138" viewBox="0 0 100 180">
      <Path
        d="M37 123 L32 163 M63 123 L69 163"
        stroke="#46548F"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <Path
        d="M32 165 L22 165 M69 165 L79 165"
        stroke="#34304A"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <Path
        d="M29 84 L13 113 M71 84 L87 65"
        stroke="#B87951"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <Rect
        x="26"
        y="75"
        width="48"
        height="55"
        rx="15"
        fill="#8C70D5"
      />

      <Circle cx="50" cy="44" r="29" fill="#B87951" />

      <Path
        d="M21 43 Q13 7 49 9 Q83 8 80 43
           L69 28 Q52 37 34 25 Z"
        fill="#352D32"
      />

      <Circle cx="40" cy="45" r="3" fill="#292532" />
      <Circle cx="61" cy="45" r="3" fill="#292532" />

      <Path
        d="M40 58 Q50 68 62 58"
        stroke="#5F3033"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      <Polygon
        points="50,88 54,98 65,98 56,105 60,116
                50,109 40,116 44,105 35,98 46,98"
        fill="#FFE18B"
      />
    </Svg>
  );
}

function MovingShape({
  name,
  moving,
  onPress,
}: {
  name: ShapeName;
  moving: boolean;
  onPress: () => void;
}) {
  const movement = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    movement.setValue(0);

    if (!moving) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(movement, {
          toValue: 1,
          duration: name === 'circle' ? 1500 : 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
          isInteraction: false,
        }),
        Animated.timing(movement, {
          toValue: 0,
          duration: name === 'circle' ? 1500 : 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
          isInteraction: false,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      movement.setValue(0);
    };
  }, [movement, moving, name]);

  const transform =
    name === 'circle'
      ? [
          {
            translateX: movement.interpolate({
              inputRange: [0, 1],
              outputRange: [-6, 6],
            }),
          },
          {
            rotate: movement.interpolate({
              inputRange: [0, 1],
              outputRange: ['-30deg', '30deg'],
            }),
          },
        ]
      : name === 'square'
        ? [
            {
              translateY: movement.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -26],
              }),
            },
          ]
        : [
            {
              rotate: movement.interpolate({
                inputRange: [0, 1],
                outputRange: ['-18deg', '18deg'],
              }),
            },
          ];

  return (
    <Animated.View style={{ transform }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Escuchar: ${shapeWords[name]}`}
        onPress={onPress}
        style={styles.sceneShape}
      >
        <ShapePicture name={name} size={56} />
      </Pressable>
    </Animated.View>
  );
}

export default function SpanishShapesStory() {
  const [page, setPage] = useState(0);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [message, setMessage] = useState('');

  const mounted = useRef(true);
  const active = useRef(false);
  const requestId = useRef(0);
  const readFollowingPages = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const voiceRef = useRef<Speech.Voice | undefined>(undefined);

  const loadVoice = useCallback(async () => {
    const voices = await Speech.getAvailableVoicesAsync();

    const spanishVoices = voices.filter((voice) =>
      /^es(?:[-_]|$)/i.test(voice.language)
    );

    const spainVoices = spanishVoices.filter((voice) =>
      /^es[-_]ES$/i.test(voice.language)
    );

    const selected =
      spainVoices.find(
        (voice) => voice.quality === Speech.VoiceQuality.Enhanced
      ) ??
      spainVoices[0] ??
      spanishVoices[0];

    voiceRef.current = selected;
    return selected;
  }, []);

  const stopNarration = useCallback(() => {
    requestId.current += 1;
    return Speech.stop().catch(() => {});
  }, []);

  useEffect(() => {
    mounted.current = true;

    void loadVoice().catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted.current) setReduceMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted.current) setReduceMotion(enabled);
      }
    );

    return () => {
      mounted.current = false;
      active.current = false;
      readFollowingPages.current = false;
      subscription.remove();
      void stopNarration();
    };
  }, [loadVoice, stopNarration]);

  useFocusEffect(
    useCallback(() => {
      active.current = isForeground();
      setFocused(true);
      setForeground(active.current);

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          active.current = state === 'active';

          if (mounted.current) {
            setForeground(active.current);
          }

          if (!active.current) {
            readFollowingPages.current = false;
            void stopNarration();
          }
        }
      );

      return () => {
        active.current = false;
        readFollowingPages.current = false;
        subscription.remove();
        void stopNarration();

        if (mounted.current) {
          setFocused(false);
        }
      };
    }, [stopNarration])
  );

  function isCurrent(request: number) {
    return (
      mounted.current &&
      active.current &&
      request === requestId.current
    );
  }

  async function speak(text: string) {
    if (!mounted.current || !active.current) return;

    const stopping = stopNarration();
    const thisRequest = requestId.current;

    setMessage('');

    try {
      await stopping;

      if (!isCurrent(thisRequest)) return;

      let selected = voiceRef.current;

      if (!selected) {
        selected = await loadVoice();
      }

      if (!isCurrent(thisRequest)) return;

      if (!selected) {
        readFollowingPages.current = false;
        setMessage(
          'No hay una voz en español disponible en este dispositivo.'
        );
        return;
      }

      Speech.speak(text, {
        language: selected.language,
        voice: selected.identifier,
        rate: 0.83,
        pitch: 1,
        volume: 1,

        onError: () => {
          if (isCurrent(thisRequest)) {
            readFollowingPages.current = false;
            setMessage(
              'No se pudo iniciar la voz. Toca Escuchar para intentarlo de nuevo.'
            );
          }
        },
      });
    } catch {
      if (isCurrent(thisRequest)) {
        readFollowingPages.current = false;
        setMessage(
          'No se pudo iniciar la voz. Inténtalo de nuevo.'
        );
      }
    }
  }

  function hearShape(name: ShapeName) {
    readFollowingPages.current = false;
    void speak(`Este es un ${shapeWords[name]}.`);
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    setPage(nextPage);
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (readFollowingPages.current) {
      void speak(pages[nextPage].text);
    } else {
      void stopNarration();
    }
  }

  function openStories() {
    readFollowingPages.current = false;
    void stopNarration();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'spanish',
        activity: 'stories',
      },
    });
  }

  function goBack() {
    if (page > 0) {
      changePage(page - 1);
      return;
    }

    readFollowingPages.current = false;
    void stopNarration();

    if (router.canGoBack()) {
      router.back();
    } else {
      openStories();
    }
  }

  function replay() {
    setPage(0);
    readFollowingPages.current = true;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    void speak(pages[0].text);
  }

  const canAnimate =
    focused && foreground && !reduceMotion && page === 1;

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkText}>← Volver</Text>
            </Pressable>

            <Text style={styles.pageNumber}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text style={styles.title}>
            Sam descubre las formas
          </Text>

          <View style={styles.scene}>
            <View style={styles.cloud}>
              <Text style={styles.cloudText}>☁</Text>
            </View>

            <View style={styles.ground} />

            <View
              pointerEvents="none"
              style={styles.playground}
            >
              <Svg width="100" height="110" viewBox="0 0 100 110">
                <Path
                  d="M10 105 L30 20 L70 20 L90 105"
                  stroke="#9C86C9"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />

                <Line
                  x1="42"
                  y1="22"
                  x2="42"
                  y2="75"
                  stroke="#837798"
                  strokeWidth="2"
                />

                <Line
                  x1="58"
                  y1="22"
                  x2="58"
                  y2="75"
                  stroke="#837798"
                  strokeWidth="2"
                />

                <Rect
                  x="36"
                  y="73"
                  width="28"
                  height="7"
                  rx="3"
                  fill="#8C70D5"
                />
              </Svg>
            </View>

            <View style={styles.sam}>
              <Sam />
            </View>

            {page < 2 ? (
              <View style={styles.movingShapes}>
                {shapes.map((shape) => (
                  <MovingShape
                    key={shape.name}
                    name={shape.name}
                    moving={canAnimate}
                    onPress={() => hearShape(shape.name)}
                  />
                ))}
              </View>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Un sol en forma de círculo"
                  onPress={() => hearShape('circle')}
                  style={styles.sun}
                >
                  <ShapePicture name="circle" size={60} />
                </Pressable>

                <View style={styles.house}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Un tejado en forma de triángulo"
                    onPress={() => hearShape('triangle')}
                  >
                    <Svg
                      width="130"
                      height="70"
                      viewBox="0 0 130 70"
                    >
                      <Polygon
                        points="65,3 127,68 3,68"
                        fill="#FF9B9F"
                        stroke="#B64D69"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Una casa en forma de cuadrado"
                    onPress={() => hearShape('square')}
                    style={styles.houseBody}
                  >
                    <View style={styles.window} />
                    <View style={styles.door} />
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <View style={styles.storyCard}>
            <Text style={styles.sceneTitle}>
              {pages[page].title}
            </Text>

            <Text style={styles.storyText}>
              {pages[page].text}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                readFollowingPages.current = true;
                void speak(pages[page].text);
              }}
              style={({ pressed }) => [
                styles.readButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.linkText}>🔊 Escuchar</Text>
            </Pressable>

            {!!message && (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.message}
              >
                {message}
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>
            Toca una forma
          </Text>

          <View style={styles.shapeCards}>
            {shapes.map((shape) => (
              <Pressable
                key={shape.name}
                accessibilityRole="button"
                accessibilityLabel={`Escuchar: ${shapeWords[shape.name]}`}
                onPress={() => hearShape(shape.name)}
                style={({ pressed }) => [
                  styles.shapeCard,
                  { backgroundColor: shape.color },
                  pressed && styles.pressed,
                ]}
              >
                <ShapePicture name={shape.name} size={48} />

                <Text style={styles.shapeLabel}>
                  {shape.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.controls}>
            {page === pages.length - 1 && (
              <Pressable
                accessibilityRole="button"
                onPress={replay}
                style={({ pressed }) => [
                  styles.replayButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.linkText}>
                  ↻ Escuchar de nuevo
                </Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (page === pages.length - 1) {
                  openStories();
                } else {
                  changePage(page + 1);
                }
              }}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.nextText}>
                {page === pages.length - 1
                  ? 'Terminar ✓'
                  : 'Siguiente →'}
              </Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: C.blue,
    borderRadius: 16,
  },
  linkText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  pageNumber: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  scene: {
    height: 230,
    borderRadius: 26,
    backgroundColor: C.blue,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cloud: {
    position: 'absolute',
    top: 0,
    left: '35%',
  },
  cloudText: {
    fontSize: 65,
    color: C.white,
  },
  ground: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -25,
    height: 95,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: '#BFE5B0',
  },
  playground: {
    position: 'absolute',
    left: 6,
    top: 33,
    opacity: 0.6,
  },
  sam: {
    position: 'absolute',
    left: 10,
    bottom: 16,
  },
  movingShapes: {
    position: 'absolute',
    left: 90,
    right: 6,
    bottom: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sceneShape: {
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sun: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  house: {
    position: 'absolute',
    bottom: 24,
    right: 30,
    alignItems: 'center',
  },
  houseBody: {
    width: 98,
    height: 98,
    backgroundColor: '#77C7F3',
    borderWidth: 3,
    borderColor: '#2875A2',
    alignItems: 'center',
  },
  window: {
    position: 'absolute',
    left: 10,
    top: 12,
    width: 24,
    height: 24,
    backgroundColor: '#FFF0C9',
    borderWidth: 3,
    borderColor: C.white,
  },
  door: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 28,
    height: 47,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#8C70D5',
  },
  storyCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 18,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 10,
  },
  storyText: {
    color: C.text,
    fontSize: 17,
    lineHeight: 27,
  },
  readButton: {
    minHeight: 46,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: C.lavender,
    borderRadius: 15,
    marginTop: 16,
  },
  message: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 12,
  },
  shapeCards: {
    flexDirection: 'row',
    gap: 10,
  },
  shapeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  shapeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  replayButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.lavender,
    borderRadius: 18,
    padding: 12,
  },
  nextButton: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 12,
  },
  nextText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});