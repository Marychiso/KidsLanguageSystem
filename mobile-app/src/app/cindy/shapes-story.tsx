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

const pages = [
  {
    title: 'Meet the shapes',
    text:
      'Sam walks into a colorful playground. He sees a circle, a square, and a triangle.',
  },
  {
    title: 'Let’s move!',
    text:
      'The shapes start to move and play together. The circle rolls, the square bounces, and the triangle tilts.',
  },
  {
    title: 'A little shape house',
    text:
      'Sam smiles. I know these shapes. A square and triangle make a house, and the circle looks like the sun.',
  },
];

const shapes: {
  name: ShapeName;
  label: string;
  color: string;
}[] = [
  { name: 'circle', label: 'Circle', color: C.yellow },
  { name: 'square', label: 'Square', color: C.blue },
  { name: 'triangle', label: 'Triangle', color: C.pink },
];

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
          useNativeDriver: true,
        }),
        Animated.timing(movement, {
          toValue: 0,
          duration: name === 'circle' ? 1500 : 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
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
        accessibilityLabel={`Hear ${name}`}
        onPress={onPress}
        style={styles.sceneShape}
      >
        <ShapePicture name={name} size={56} />
      </Pressable>
    </Animated.View>
  );
}

export default function ShapesStory() {
  const [page, setPage] = useState(0);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const [message, setMessage] = useState('');

  const active = useRef(false);
  const requestId = useRef(0);
  const readFollowingPages = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const stopNarration = useCallback(() => {
    requestId.current += 1;
    void Speech.stop().catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      active.current = AppState.currentState === 'active';
      setFocused(true);

      return () => {
        active.current = false;
        readFollowingPages.current = false;
        setFocused(false);
        stopNarration();
      };
    }, [stopNarration]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        const isActive = state === 'active';

        setForeground(isActive);
        active.current = isActive && focused;

        if (!isActive) {
          readFollowingPages.current = false;
          stopNarration();
        }
      },
    );

    return () => subscription.remove();
  }, [focused, stopNarration]);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (mounted) setReduceMotion(enabled);
      },
    );

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function speak(text: string) {
    const thisRequest = ++requestId.current;
    setMessage('');

    try {
      await Speech.stop();

      if (
        thisRequest !== requestId.current ||
        !active.current
      ) {
        return;
      }

      const voices = await Speech.getAvailableVoicesAsync();

      if (
        thisRequest !== requestId.current ||
        !active.current
      ) {
        return;
      }

      const preferred = voices.find((voice) =>
        voice.name.toLowerCase().includes('google uk english female'),
      );

      const selected =
        preferred ??
        voices.find(
          (voice) =>
            voice.language.toLowerCase().replace('_', '-') ===
            'en-gb',
        ) ??
        voices.find((voice) =>
          voice.language.toLowerCase().startsWith('en'),
        );

      Speech.speak(text, {
        language: selected?.language ?? 'en-GB',
        ...(selected ? { voice: selected.identifier } : {}),
        rate: 0.85,
        pitch: 1,
        onError: () => {
          if (
            thisRequest === requestId.current &&
            active.current
          ) {
            setMessage('Could not play the voice. Tap Read to me again.');
          }
        },
      });
    } catch {
      if (
        thisRequest === requestId.current &&
        active.current
      ) {
        setMessage('Could not play the voice. Please try again.');
      }
    }
  }

  function hearShape(name: ShapeName) {
    readFollowingPages.current = false;
    void speak(`This is a ${name}.`);
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    stopNarration();
    setPage(nextPage);
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (readFollowingPages.current) {
      void speak(pages[nextPage].text);
    }
  }

  function openStories() {
    stopNarration();
    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'english',
        activity: 'stories',
      },
    });
  }

  function goBack() {
    if (page > 0) {
      changePage(page - 1);
      return;
    }

    stopNarration();

    if (router.canGoBack()) {
      router.back();
    } else {
      openStories();
    }
  }

  function replay() {
    stopNarration();
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
              style={styles.backButton}
            >
              <Text style={styles.linkText}>← Back</Text>
            </Pressable>

            <Text style={styles.pageNumber}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text style={styles.title}>Sam’s Shape Adventure</Text>

          <View style={styles.scene}>
            <View style={styles.cloud}>
              <Text style={styles.cloudText}>☁</Text>
            </View>

            <View style={styles.ground} />

            {/* Playground swing in the distance */}
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
                  accessibilityLabel="Circle sun"
                  onPress={() => hearShape('circle')}
                  style={styles.sun}
                >
                  <ShapePicture name="circle" size={60} />
                </Pressable>

                <View style={styles.house}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Triangle roof"
                    onPress={() => hearShape('triangle')}
                  >
                    <Svg width="130" height="70" viewBox="0 0 130 70">
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
                    accessibilityLabel="Square house"
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
              <Text style={styles.linkText}>🔊 Read to me</Text>
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

          <Text style={styles.sectionTitle}>Tap a shape</Text>

          <View style={styles.shapeCards}>
            {shapes.map((shape) => (
              <Pressable
                key={shape.name}
                accessibilityRole="button"
                accessibilityLabel={`Hear: This is a ${shape.name}`}
                onPress={() => hearShape(shape.name)}
                style={({ pressed }) => [
                  styles.shapeCard,
                  { backgroundColor: shape.color },
                  pressed && styles.pressed,
                ]}
              >
                <ShapePicture name={shape.name} size={48} />
                <Text style={styles.shapeLabel}>{shape.label}</Text>
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
                <Text style={styles.linkText}>↻ Replay</Text>
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
                {page === pages.length - 1 ? 'Finish ✓' : 'Next →'}
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
  },
  pressed: {
    opacity: 0.8,
  },
});