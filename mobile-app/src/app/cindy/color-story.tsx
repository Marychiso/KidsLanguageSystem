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
    title: 'A red balloon',
    text:
      'Benny the bunny found a bright red balloon in the garden.',
  },
  {
    title: 'Up into the sky',
    text:
      'He held it tight and hopped around, but suddenly the wind ' +
      'carried it high into the sky! Benny hopped faster and faster, ' +
      'trying to catch it.',
  },
  {
    title: 'A helpful friend',
    text:
      'Just then, a friendly bluebird swooped down and helped ' +
      'Benny grab the string.',
  },
  {
    title: 'Rainbow friends',
    text:
      'Together, they watched the balloon float gently across ' +
      'a rainbow, giggling all the way.',
  },
];

const colours = [
  { name: 'Red', hex: '#E84B56' },
  { name: 'Orange', hex: '#F49B45' },
  { name: 'Yellow', hex: '#F3CD53' },
  { name: 'Green', hex: '#64B681' },
  { name: 'Blue', hex: '#519DDD' },
  { name: 'Purple', hex: '#9471CF' },
  { name: 'White', hex: '#FFFFFF' },
];

function Bunny() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 150">
      <Ellipse
        cx="50"
        cy="141"
        rx="36"
        ry="6"
        fill="#3D7652"
        opacity="0.15"
      />

      <Ellipse cx="33" cy="33" rx="12" ry="30" fill="#FFFDFC" />
      <Ellipse cx="66" cy="33" rx="12" ry="30" fill="#FFFDFC" />
      <Ellipse cx="33" cy="32" rx="5" ry="21" fill="#F3BFCB" />
      <Ellipse cx="66" cy="32" rx="5" ry="21" fill="#F3BFCB" />

      <Circle cx="84" cy="115" r="12" fill="#FFFDFC" />
      <Ellipse cx="50" cy="110" rx="30" ry="30" fill="#FFFDFC" />
      <Ellipse cx="50" cy="113" rx="18" ry="20" fill="#F5E9E8" />

      <Ellipse cx="29" cy="136" rx="18" ry="9" fill="#FFFDFC" />
      <Ellipse cx="70" cy="136" rx="18" ry="9" fill="#FFFDFC" />
      <Ellipse cx="50" cy="73" rx="35" ry="31" fill="#FFFDFC" />

      <Circle cx="37" cy="70" r="4" fill="#3E3549" />
      <Circle cx="63" cy="70" r="4" fill="#3E3549" />
      <Circle cx="38" cy="69" r="1.3" fill="white" />
      <Circle cx="64" cy="69" r="1.3" fill="white" />

      <Ellipse cx="25" cy="82" rx="6" ry="4" fill="#F2C1CC" />
      <Ellipse cx="75" cy="82" rx="6" ry="4" fill="#F2C1CC" />
      <Path d="M45 80 Q50 76 55 80 L50 86 Z" fill="#CA829B" />
      <Path
        d="M40 88 Q50 97 60 88"
        fill="none"
        stroke="#806270"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <Path
        d="M28 102 L17 112 M72 102 L84 90"
        stroke="#FFFDFC"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Bird() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 95">
      <Path d="M29 60 L8 45 L14 73 Z" fill="#367EBC" />
      <Ellipse cx="49" cy="58" rx="29" ry="23" fill="#67BDEA" />
      <Path
        d="M38 57 Q13 19 30 16 Q49 24 57 55"
        fill="#A0DDF7"
      />
      <Circle cx="70" cy="39" r="20" fill="#67BDEA" />
      <Path d="M88 40 L99 46 L88 51 Z" fill="#F5BA50" />
      <Circle cx="76" cy="35" r="3.5" fill="#263C58" />
      <Circle cx="77" cy="34" r="1" fill="white" />
      <Path
        d="M49 79 L46 87 M60 78 L63 86"
        stroke="#D6963B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Balloon() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 90 160">
      <Path
        d="M45 76 Q61 105 43 124 Q33 140 48 157"
        fill="none"
        stroke="#88737A"
        strokeWidth="2"
      />
      <Ellipse cx="45" cy="39" rx="32" ry="37" fill="#ED5A66" />
      <Ellipse
        cx="33"
        cy="25"
        rx="8"
        ry="13"
        fill="#FFFFFF"
        opacity="0.45"
        transform="rotate(23 33 25)"
      />
      <Path d="M45 74 L39 84 L51 84 Z" fill="#D94455" />
    </Svg>
  );
}

function StoryScene({
  page,
  height,
  paused,
}: {
  page: number;
  height: number;
  paused: boolean;
}) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.setValue(0);
    if (paused) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: page === 1 ? 850 : 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: page === 1 ? 850 : 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [motion, page, paused]);

  const bunnyY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, page === 1 ? -22 : -5],
  });

  const balloonY = motion.interpolate({
    inputRange: [0, 1],
    outputRange:
      page === 1
        ? [-38, -70]
        : page === 3
          ? [-32, -47]
          : [0, -10],
  });

  const balloonRotation = motion.interpolate({
    inputRange: [0, 1],
    outputRange: ['-7deg', '7deg'],
  });

  const birdX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: page === 2 ? [26, -20] : [10, -10],
  });

  const birdY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: page === 2 ? [-16, 10] : [0, -12],
  });

  const cloudX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  const characterScale = height / 270;

  return (
    <View
      style={[styles.scene, { height }]}
      accessible
      accessibilityLabel={[
        'Benny finds a red balloon in a sunny garden.',
        'The balloon rises as Benny hops after it.',
        'A bluebird flies towards the balloon string to help Benny.',
        'Benny and the bluebird watch the balloon beside a rainbow.',
      ][page]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 270"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Rect width="400" height="270" fill="#D7F0FF" />
        <Circle cx="340" cy="45" r="24" fill="#FFE08A" />

        {page === 3 && (
          <>
            {[
              '#ED737A',
              '#F6AC62',
              '#F2D36C',
              '#87C694',
              '#83BCE4',
              '#AE93D7',
            ].map((colour, index) => {
              const radius = 140 - index * 12;
              return (
                <Path
                  key={colour}
                  d={`M${230 - radius} 190 A${radius} ${radius} 0 0 1 ${230 + radius} 190`}
                  stroke={colour}
                  strokeWidth="12"
                  fill="none"
                  opacity="0.85"
                />
              );
            })}
          </>
        )}

        <Ellipse cx="90" cy="280" rx="235" ry="95" fill="#B6DFA9" />
        <Ellipse cx="360" cy="286" rx="240" ry="95" fill="#9FD29F" />
        <Path
          d="M173 270 Q190 225 276 207 L299 211 Q230 235 230 270"
          fill="#F3DDB9"
        />

        {[45, 90, 325, 365].map((x, index) => (
          <React.Fragment key={x}>
            <Path
              d={`M${x} 237 L${x} 251`}
              stroke="#55916C"
              strokeWidth="3"
            />
            <Circle
              cx={x}
              cy="234"
              r="7"
              fill={index % 2 === 0 ? '#FFF5B0' : '#D9C5F3'}
            />
            <Circle cx={x} cy="234" r="2.5" fill="#E8B754" />
          </React.Fragment>
        ))}
      </Svg>

      <Animated.View
        style={[
          styles.cloud,
          { transform: [{ translateX: cloudX }] },
        ]}
      >
        <Svg width="100" height="48" viewBox="0 0 100 48">
          <Circle cx="27" cy="28" r="17" fill="white" />
          <Circle cx="49" cy="21" r="21" fill="white" />
          <Circle cx="72" cy="29" r="16" fill="white" />
          <Rect x="26" y="27" width="48" height="18" rx="9" fill="white" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.bunny,
          {
            width: 88 * characterScale,
            height: 132 * characterScale,
            transform: [{ translateY: bunnyY }],
          },
        ]}
      >
        <Bunny />
      </Animated.View>

      <Animated.View
        style={[
          styles.balloon,
          {
            width: 72 * characterScale,
            height: 128 * characterScale,
            transform: [
              { translateY: balloonY },
              { rotate: balloonRotation },
            ],
          },
        ]}
      >
        <Balloon />
      </Animated.View>

      {page >= 2 && (
        <Animated.View
          style={[
            styles.bird,
            {
              width: 65 * characterScale,
              height: 62 * characterScale,
              transform: [
                { translateX: birdX },
                { translateY: birdY },
              ],
            },
          ]}
        >
          <Bird />
        </Animated.View>
      )}
    </View>
  );
}

export default function ColorStoryScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 420;

  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [voiceNotice, setVoiceNotice] = useState('');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [focused, setFocused] = useState(false);
  const [appActive, setAppActive] = useState(true);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);

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
      voices.find((voice) =>
        /^en[-_]GB$/i.test(voice.language)
      ) ??
      voices.find((voice) =>
        /^en(?:[-_]|$)/i.test(voice.language)
      );

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
      active.current = true;
      setFocused(true);
      setAppActive(AppState.currentState === 'active');
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

      // Try again when tapped if the preferred voice was not ready earlier.
      let voice = voiceRef.current;

      if (!exactVoiceFound.current) {
        try {
          voice = await loadVoice();
        } catch {
          // Let the device use its available English voice.
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
    setSelectedColour(null);

    if (readFollowingPages.current) {
      void readText(pages[nextPage].text);
    } else {
      stopReading();
    }
  }

  function hearColour(name: string) {
    readFollowingPages.current = false;
    setSelectedColour(name);
    void readText(`This is ${name.toLowerCase()}.`);
  }

  function replayStory() {
    setPage(0);
    setSelectedColour(null);
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
    // Progress saving will be connected after account integration.
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
            Benny and the Rainbow Balloon
          </Text>

          <StoryScene
            page={page}
            height={compact ? 225 : 270}
            paused={reducedMotion || !focused || !appActive}
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
            <Text style={styles.pageTitle}>
              {currentPage.title}
            </Text>

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

          <Text style={styles.sectionTitle}>Meet the colours</Text>
          <Text style={styles.hint}>Tap a colour to hear its name.</Text>

          <View style={styles.colourGrid}>
            {colours.map((colour) => (
              <Pressable
                key={colour.name}
                accessibilityRole="button"
                accessibilityLabel={`Hear ${colour.name}`}
                onPress={() => hearColour(colour.name)}
                style={({ pressed }) => [
                  styles.colourCard,
                  selectedColour === colour.name && styles.selectedCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: colour.hex },
                  ]}
                />
                <Text style={styles.colourName}>{colour.name}</Text>
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
  cloud: {
    position: 'absolute',
    left: '10%',
    top: 12,
  },
  bunny: {
    position: 'absolute',
    left: '20%',
    bottom: 17,
  },
  balloon: {
    position: 'absolute',
    left: '46%',
    bottom: 51,
  },
  bird: {
    position: 'absolute',
    right: '16%',
    top: '38%',
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
  colourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  colourCard: {
    width: '22%',
    flexGrow: 1,
    minHeight: 91,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.white,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    borderColor: C.primary,
    backgroundColor: C.lavender,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7DCE3',
    marginBottom: 8,
  },
  colourName: {
    color: C.text,
    fontSize: 12,
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