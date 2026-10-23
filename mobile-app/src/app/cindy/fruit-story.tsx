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
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';

import { LearningColors as C } from '@/constants/learning-theme';

const pages = [
  {
    title: 'A colourful garden',
    text:
      'Lily walks into a bright garden full of fruit trees. ' +
      'The sun is shining, and everything feels fresh and colorful.',
  },
  {
    title: 'Fruits everywhere',
    text:
      'The fruits start falling one by one. The garden slowly ' +
      'fills with apples, bananas, and berries.',
  },
  {
    title: 'A fruit picnic',
    text:
      'Lily laughs. "Let’s have a fruit picnic!" ' +
      'It is a happy and peaceful day in the garden.',
  },
];

type FruitKind = 'apple' | 'banana' | 'strawberry' | 'watermelon';

const fruits: {
  kind: FruitKind;
  name: string;
  sentence: string;
  colour: string;
}[] = [
  {
    kind: 'apple',
    name: 'Apple',
    sentence: 'This is an apple.',
    colour: C.pink,
  },
  {
    kind: 'banana',
    name: 'Banana',
    sentence: 'This is a banana.',
    colour: C.yellow,
  },
  {
    kind: 'strawberry',
    name: 'Strawberry',
    sentence: 'This is a strawberry.',
    colour: C.lavender,
  },
  {
    kind: 'watermelon',
    name: 'Watermelon',
    sentence: 'This is a watermelon.',
    colour: C.green,
  },
];

function FruitDrawing({ kind }: { kind: FruitKind }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      {kind === 'apple' && (
        <>
          <Path
            d="M51 24 Q47 10 55 5"
            stroke="#80553D"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M54 18 Q67 1 80 12 Q70 29 54 18" fill="#62AC6C" />
          <Path
            d="M50 29 C18 7 3 43 19 75 Q31 96 50 85
               Q70 96 82 75 C99 43 81 7 50 29"
            fill="#ED6269"
          />
          <Path
            d="M28 34 Q17 42 23 56"
            stroke="#FFD4D2"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {kind === 'banana' && (
        <>
          <Path
            d="M20 15 Q7 72 61 87 Q83 91 94 71
               Q43 79 31 17 Z"
            fill="#F6D65B"
            stroke="#DCB441"
            strokeWidth="2"
          />
          <Path
            d="M25 28 Q23 68 78 78"
            stroke="#FFEFA1"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <Path d="M19 15 L20 7 L30 9 L31 18" fill="#947344" />
          <Path d="M87 73 L95 68 L97 74 L91 79" fill="#947344" />
        </>
      )}

      {kind === 'strawberry' && (
        <>
          <Path
            d="M50 24 C9 8 8 49 27 74 Q50 105 73 74
               C94 47 90 8 50 24"
            fill="#ED667B"
          />
          <Path
            d="M49 28 L23 14 L40 15 L48 3 L58 15 L78 12
               L63 29 L76 34 L54 35 L37 34 L23 37 Z"
            fill="#64AC73"
          />
          {[35, 50, 65].map((x) => (
            <React.Fragment key={x}>
              <Ellipse cx={x} cy="46" rx="2" ry="3" fill="#FFE6A8" />
              <Ellipse cx={x} cy="62" rx="2" ry="3" fill="#FFE6A8" />
            </React.Fragment>
          ))}
          <Ellipse cx="43" cy="77" rx="2" ry="3" fill="#FFE6A8" />
          <Ellipse cx="57" cy="77" rx="2" ry="3" fill="#FFE6A8" />
        </>
      )}

      {kind === 'watermelon' && (
        <>
          <Path
            d="M6 24 L94 24 A44 60 0 0 1 6 24"
            fill="#60AC79"
          />
          <Path
            d="M13 24 L87 24 A37 51 0 0 1 13 24"
            fill="#E1F0B9"
          />
          <Path
            d="M19 24 L81 24 A31 43 0 0 1 19 24"
            fill="#EF7580"
          />
          <Ellipse cx="34" cy="39" rx="2" ry="4" fill="#664B54" />
          <Ellipse cx="50" cy="49" rx="2" ry="4" fill="#664B54" />
          <Ellipse cx="66" cy="39" rx="2" ry="4" fill="#664B54" />
        </>
      )}
    </Svg>
  );
}

function LilyDrawing() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 160">
      <Path
        d="M36 124 L32 148 M63 124 L68 148"
        stroke="#B67B56"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <Path
        d="M24 151 L36 151 M65 151 L78 151"
        stroke="#6951A2"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <Path d="M32 78 L68 78 L78 129 L22 129 Z" fill="#67B7DA" />
      <Path
        d="M29 86 L16 108 M71 86 L84 72"
        stroke="#B67B56"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <Circle cx="21" cy="35" r="14" fill="#443337" />
      <Circle cx="79" cy="35" r="14" fill="#443337" />
      <Ellipse cx="50" cy="43" rx="31" ry="34" fill="#443337" />
      <Ellipse cx="50" cy="49" rx="26" ry="28" fill="#C08A65" />
      <Path
        d="M24 34 Q32 8 54 15 Q74 14 77 36
           Q55 35 46 23 Q37 35 24 34"
        fill="#443337"
      />
      <Circle cx="40" cy="47" r="3" fill="#342A31" />
      <Circle cx="61" cy="47" r="3" fill="#342A31" />
      <Path
        d="M40 61 Q50 71 61 61"
        stroke="#7C4244"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="31" cy="57" r="4" fill="#DAA18D" />
      <Circle cx="70" cy="57" r="4" fill="#DAA18D" />
      <Circle cx="21" cy="25" r="5" fill="#F6D474" />
      <Circle cx="79" cy="25" r="5" fill="#F6D474" />
    </Svg>
  );
}

function AnimatedFruit({
  kind,
  index,
  page,
  paused,
  sceneHeight,
  onPress,
}: {
  kind: FruitKind;
  index: number;
  page: number;
  paused: boolean;
  sceneHeight: number;
  onPress: () => void;
}) {
  const movement = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    movement.stopAnimation();
    movement.setValue(page === 1 && paused ? 1 : 0);

    if (paused) return;

    const animation =
      page === 1
        ? Animated.sequence([
            Animated.delay(index * 450),
            Animated.timing(movement, {
              toValue: 1,
              duration: 1050,
              easing: Easing.out(Easing.bounce),
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        : Animated.loop(
            Animated.sequence([
              Animated.timing(movement, {
                toValue: 1,
                duration: 1200 + index * 120,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: Platform.OS !== 'web',
              }),
              Animated.timing(movement, {
                toValue: 0,
                duration: 1200 + index * 120,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: Platform.OS !== 'web',
              }),
            ])
          );

    animation.start();
    return () => animation.stop();
  }, [movement, page, paused, index]);

  const size = sceneHeight < 250 ? 44 : 54;

  const translateY = movement.interpolate({
    inputRange: [0, 1],
    outputRange:
      page === 1
        ? [0, sceneHeight - size - 69]
        : [0, -5],
  });

  const rotation = movement.interpolate({
    inputRange: [0, 1],
    outputRange: page === 1 ? ['-12deg', '10deg'] : ['-4deg', '4deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${37 + index * 14}%`,
        top: page === 2 ? sceneHeight - size - 30 : 38,
        width: size,
        height: size,
        transform: [{ translateY }, { rotate: rotation }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hear about the ${kind}`}
        onPress={onPress}
        style={styles.fill}
        hitSlop={4}
      >
        <View pointerEvents="none" style={styles.fill}>
          <FruitDrawing kind={kind} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function GardenScene({
  page,
  height,
  paused,
  onFruitPress,
}: {
  page: number;
  height: number;
  paused: boolean;
  onFruitPress: (index: number) => void;
}) {
  return (
    <View style={[styles.scene, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 270"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Rect width="400" height="270" fill="#D9F1FF" />
        <Circle cx="54" cy="45" r="25" fill="#FFE18A" />

        <Circle cx="123" cy="35" r="14" fill="white" />
        <Circle cx="143" cy="28" r="20" fill="white" />
        <Circle cx="165" cy="36" r="14" fill="white" />
        <Rect x="122" y="34" width="44" height="16" rx="8" fill="white" />

        <Rect x="255" y="84" width="20" height="139" rx="8" fill="#AD7A52" />
        <Circle cx="265" cy="77" r="53" fill="#7DBB87" />
        <Circle cx="222" cy="105" r="38" fill="#90CA91" />
        <Circle cx="307" cy="106" r="39" fill="#90CA91" />

        <Ellipse cx="65" cy="275" rx="250" ry="85" fill="#B7DFA6" />
        <Ellipse cx="365" cy="286" rx="240" ry="93" fill="#A2D299" />

        <Path
          d="M18 226 Q38 177 70 213 Q97 179 119 227"
          fill="#7CB681"
        />

        {page === 2 && (
          <>
            <Path
              d="M135 211 L346 211 L376 260 L111 260 Z"
              fill="#FFE6C8"
            />
            <Path
              d="M155 211 L140 260 M197 211 L188 260
                 M239 211 L237 260 M281 211 L286 260
                 M323 211 L335 260 M125 236 L362 236"
              stroke="#EDB8AD"
              strokeWidth="6"
              opacity="0.65"
            />
          </>
        )}

        <Path
          d="M24 246 L24 259 M382 233 L382 248"
          stroke="#5C966C"
          strokeWidth="3"
        />
        <Circle cx="24" cy="244" r="6" fill="#F3C4D9" />
        <Circle cx="382" cy="231" r="6" fill="#FFF1B0" />
      </Svg>

      <View
        style={[
          styles.lily,
          {
            width: height < 250 ? 72 : 86,
            height: height < 250 ? 115 : 138,
          },
        ]}
        accessible
        accessibilityLabel="Lily smiles in the fruit garden"
      >
        <LilyDrawing />
      </View>

      {fruits.map((fruit, index) => (
        <AnimatedFruit
          key={fruit.kind}
          kind={fruit.kind}
          index={index}
          page={page}
          paused={paused}
          sceneHeight={height}
          onPress={() => onFruitPress(index)}
        />
      ))}
    </View>
  );
}

export default function FruitStoryScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 420;

  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [voiceNotice, setVoiceNotice] = useState('');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [focused, setFocused] = useState(false);
  const [appActive, setAppActive] = useState(true);
  const [selectedFruit, setSelectedFruit] = useState<FruitKind | null>(null);

  const requestId = useRef(0);
  const active = useRef(false);
  const readFollowingPages = useRef(false);
  const voiceRef = useRef<Speech.Voice | undefined>(undefined);
  const exactVoiceFound = useRef(false);

  const currentPage = pages[page];

  const loadVoice = useCallback(async () => {
    const voices = await Speech.getAvailableVoicesAsync();

    const exact = voices.find(
      (voice) =>
        voice.name.trim().toLowerCase() ===
        'google uk english female'
    );

    exactVoiceFound.current = Boolean(exact);

    voiceRef.current =
      exact ??
      voices.find((voice) => /^en[-_]GB$/i.test(voice.language)) ??
      voices.find((voice) => /^en(?:[-_]|$)/i.test(voice.language));

    return voiceRef.current;
  }, []);

  const cancelSpeech = useCallback(() => {
    requestId.current += 1;
    return Speech.stop().catch(() => {});
  }, []);

  const stopReading = useCallback(() => {
    readFollowingPages.current = false;
    void cancelSpeech();
    setSpeaking(false);
  }, [cancelSpeech]);

  useEffect(() => {
    let mounted = true;

    void loadVoice().catch(() => {});

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReducedMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [loadVoice]);

  useFocusEffect(
    useCallback(() => {
      active.current = AppState.currentState === 'active';
      setAppActive(active.current);
      setFocused(true);
      setSpeaking(false);

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          active.current = state === 'active';
          setAppActive(active.current);

          if (!active.current) stopReading();
        }
      );

      return () => {
        active.current = false;
        setFocused(false);
        readFollowingPages.current = false;
        subscription.remove();
        void cancelSpeech();
      };
    }, [cancelSpeech, stopReading])
  );

  function isCurrent(request: number) {
    return active.current && request === requestId.current;
  }

  async function readText(text: string) {
    const stopping = cancelSpeech();
    const request = requestId.current;

    setSpeaking(true);
    setMessage('');

    try {
      await stopping;
      if (!isCurrent(request)) return;

      let voice = voiceRef.current;

      if (!exactVoiceFound.current) {
        try {
          voice = await loadVoice();
        } catch {
          // Use an available voice if discovery fails.
        }
      }

      if (!isCurrent(request)) return;

      setVoiceNotice(
        exactVoiceFound.current
          ? ''
          : 'Using an available English voice on this device.'
      );

      Speech.speak(text, {
        voice: voice?.identifier,
        language: voice?.language ?? 'en-GB',
        rate: 0.85,
        pitch: 1,

        onDone: () => {
          if (isCurrent(request)) setSpeaking(false);
        },

        onStopped: () => {
          if (isCurrent(request)) setSpeaking(false);
        },

        onError: () => {
          if (isCurrent(request)) {
            readFollowingPages.current = false;
            setSpeaking(false);
            setMessage('Could not start the voice. Please try again.');
          }
        },
      });
    } catch {
      if (isCurrent(request)) {
        readFollowingPages.current = false;
        setSpeaking(false);
        setMessage('Could not start the voice. Please try again.');
      }
    }
  }

  function toggleReading() {
    if (speaking) {
      stopReading();
      return;
    }

    readFollowingPages.current = true;
    void readText(currentPage.text);
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    setPage(nextPage);
    setMessage('');
    setSelectedFruit(null);

    if (readFollowingPages.current) {
      void readText(pages[nextPage].text);
    } else {
      stopReading();
    }
  }

  function hearFruit(index: number) {
    const fruit = fruits[index];
    readFollowingPages.current = false;
    setSelectedFruit(fruit.kind);
    void readText(fruit.sentence);
  }

  function replayStory() {
    setPage(0);
    setSelectedFruit(null);
    readFollowingPages.current = true;
    void readText(pages[0].text);
  }

  function openCategories() {
    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'english',
        activity: 'stories',
      },
    });
  }

  function goBack() {
    stopReading();

    if (router.canGoBack()) {
      router.back();
    } else {
      openCategories();
    }
  }

  function finishStory() {
    stopReading();
    // Backend progress saving will be connected later.
    openCategories();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.counter}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              compact && styles.compactTitle,
            ]}
          >
            The Happy Fruit Garden
          </Text>

          <GardenScene
            page={page}
            height={compact ? 225 : 270}
            paused={reducedMotion || !focused || !appActive}
            onFruitPress={hearFruit}
          />

          <View style={styles.progressRow}>
            {pages.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.progressSegment,
                  index <= page && styles.progressActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.readingCard}>
            <Text style={styles.pageTitle}>{currentPage.title}</Text>

            <Text
              style={[
                styles.storyText,
                compact && styles.compactText,
              ]}
            >
              {currentPage.text}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={toggleReading}
              style={({ pressed }) => [
                styles.readButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backText}>
                {speaking ? '■ Stop reading' : '▶ Read to me'}
              </Text>
            </Pressable>

            {!!message && (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.notice}
              >
                {message}
              </Text>
            )}
          </View>

          <View style={styles.navigation}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: page === 0 }}
              disabled={page === 0}
              onPress={() => changePage(page - 1)}
              style={({ pressed }) => [
                styles.previousButton,
                page === 0 && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backText}>← Previous</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={
                page === pages.length - 1
                  ? finishStory
                  : () => changePage(page + 1)
              }
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

          {page === pages.length - 1 && (
            <Pressable
              accessibilityRole="button"
              onPress={replayStory}
              style={styles.replayButton}
            >
              <Text style={styles.backText}>↻ Read again</Text>
            </Pressable>
          )}

          <Text style={styles.sectionTitle}>Meet the fruits</Text>
          <Text style={styles.hint}>Tap a fruit to hear its name.</Text>

          <View style={styles.fruitGrid}>
            {fruits.map((fruit, index) => (
              <Pressable
                key={fruit.kind}
                accessibilityRole="button"
                accessibilityLabel={fruit.sentence}
                onPress={() => hearFruit(index)}
                style={({ pressed }) => [
                  styles.fruitCard,
                  { backgroundColor: fruit.colour },
                  selectedFruit === fruit.kind && styles.selectedCard,
                  pressed && styles.pressed,
                ]}
              >
                <View pointerEvents="none" style={styles.fruitPicture}>
                  <FruitDrawing kind={fruit.kind} />
                </View>
                <Text style={styles.fruitName}>{fruit.name}</Text>
              </Pressable>
            ))}
          </View>

          {!!voiceNotice && (
            <Text style={styles.notice}>{voiceNotice}</Text>
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },
  panel: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  fill: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: C.blue,
    justifyContent: 'center',
  },
  backText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  counter: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: C.text,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 22,
    lineHeight: 29,
  },
  scene: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: C.blue,
  },
  lily: {
    position: 'absolute',
    left: '9%',
    bottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 7,
    marginVertical: 13,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: C.blue,
  },
  progressActive: {
    backgroundColor: C.primary,
  },
  readingCard: {
    backgroundColor: C.white,
    padding: 18,
    borderRadius: 23,
  },
  pageTitle: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 9,
  },
  storyText: {
    color: C.text,
    fontSize: 19,
    lineHeight: 30,
  },
  compactText: {
    fontSize: 17,
    lineHeight: 27,
  },
  readButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: C.blue,
    borderRadius: 15,
    marginTop: 16,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  previousButton: {
    flex: 1,
    minHeight: 50,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    minHeight: 50,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  replayButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 24,
  },
  hint: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 12,
  },
  fruitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fruitCard: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: 115,
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    borderColor: C.primary,
  },
  fruitPicture: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  fruitName: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  notice: {
    color: C.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});