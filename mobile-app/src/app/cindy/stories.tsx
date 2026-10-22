import React, {
  useCallback,
  useEffect,
  useMemo,
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
import { useAudioPlayer } from 'expo-audio';
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
    title: 'Welcome to the park',
    text:
      'Luna visits a small animal park. The sun is shining and ' +
      'everything feels calm and she sees friendly animals ' +
      'waiting to say hello.',
  },
  {
    title: 'Time to play',
    text:
      'The animals begin to move and play together. The dog runs ' +
      'happily, the cat jumps around, and the bird flies in the ' +
      'sky. Luna laughs as she watches them.',
  },
  {
    title: 'Goodbye, friends',
    text:
      'Soon it is time to go home. Luna waves and says, ' +
      '“Goodbye, my animal friends!” The animals gather close ' +
      'as if waving back.',
  },
];

type AnimalKind = 'dog' | 'cat' | 'cow' | 'bird';

type VoiceOption = {
  identifier: string;
  name: string;
  language: string;
};

const animalKinds: AnimalKind[] = ['dog', 'cat', 'cow', 'bird'];

const animalNames: Record<AnimalKind, string> = {
  dog: 'Dog',
  cat: 'Cat',
  cow: 'Cow',
  bird: 'Bird',
};

const soundNames: Record<AnimalKind, string> = {
  dog: 'Woof!',
  cat: 'Meow!',
  cow: 'Moo!',
  bird: 'Chirp!',
};

// Original vector illustrations.
function AnimalDrawing({ kind }: { kind: AnimalKind }) {
  if (kind === 'bird') {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Path d="M28 62 L9 48 L15 75 Z" fill="#2478AE" />
        <Ellipse cx="49" cy="57" rx="29" ry="25" fill="#4BB9E8" />
        <Path
          d="M37 54 Q14 19 26 17 Q49 23 57 54"
          fill="#98DEFA"
        />
        <Circle cx="68" cy="39" r="21" fill="#4BB9E8" />
        <Path d="M86 39 L99 45 L86 51 Z" fill="#F7AF38" />
        <Circle cx="74" cy="35" r="3.5" fill="#26344A" />
        <Circle cx="75" cy="34" r="1" fill="white" />
        <Path
          d="M47 80 L44 88 M60 79 L63 87"
          stroke="#D58D2B"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  const fur =
    kind === 'dog'
      ? '#DCA46E'
      : kind === 'cat'
        ? '#F5B95F'
        : '#FFFCF5';

  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 130">
      <Rect x="28" y="92" width="15" height="28" rx="7" fill={fur} />
      <Rect x="77" y="92" width="15" height="28" rx="7" fill={fur} />
      <Ellipse cx="60" cy="88" rx="35" ry="28" fill={fur} />

      {kind === 'cow' && (
        <>
          <Ellipse cx="43" cy="88" rx="13" ry="17" fill="#546174" />
          <Path d="M32 25 L26 8 L44 22" fill="#E8CB8B" />
          <Path d="M78 22 L95 8 L88 29" fill="#E8CB8B" />
        </>
      )}

      {kind === 'cat' ? (
        <>
          <Path d="M25 42 L23 8 L52 28" fill={fur} />
          <Path d="M68 28 L97 8 L95 44" fill={fur} />
          <Path d="M30 29 L29 18 L41 28" fill="#E99089" />
          <Path d="M79 28 L91 18 L90 30" fill="#E99089" />
        </>
      ) : (
        <>
          <Ellipse
            cx="22"
            cy="43"
            rx="14"
            ry={kind === 'dog' ? 29 : 13}
            fill={kind === 'dog' ? '#98633F' : '#546174'}
            transform="rotate(18 22 43)"
          />
          <Ellipse
            cx="98"
            cy="43"
            rx="14"
            ry={kind === 'dog' ? 29 : 13}
            fill={kind === 'dog' ? '#98633F' : '#546174'}
            transform="rotate(-18 98 43)"
          />
        </>
      )}

      <Ellipse cx="60" cy="48" rx="39" ry="34" fill={fur} />

      {kind === 'cow' && (
        <Ellipse cx="80" cy="40" rx="15" ry="20" fill="#546174" />
      )}

      <Circle cx="46" cy="43" r="5" fill="#283247" />
      <Circle cx="75" cy="43" r="5" fill="#283247" />
      <Circle cx="47" cy="41" r="1.5" fill="white" />
      <Circle cx="76" cy="41" r="1.5" fill="white" />

      <Ellipse
        cx="60"
        cy="63"
        rx={kind === 'cow' ? 26 : 20}
        ry="14"
        fill={kind === 'cow' ? '#F5BCC1' : '#FFE6C1'}
      />

      {kind === 'cow' ? (
        <>
          <Circle cx="50" cy="61" r="3" fill="#A86779" />
          <Circle cx="70" cy="61" r="3" fill="#A86779" />
        </>
      ) : (
        <Path d="M54 54 Q60 50 66 54 L60 61 Z" fill="#644A45" />
      )}

      <Path
        d="M52 68 Q60 75 68 68"
        fill="none"
        stroke="#644A45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {kind === 'cat' && (
        <Path
          d="M35 57 L12 52 M35 64 L12 67 M85 57 L108 52 M85 64 L108 67"
          stroke="#A57348"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

function LunaDrawing() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 170">
      <Path
        d="M34 132 L31 156 M65 132 L69 156"
        stroke="#A96D4C"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <Path
        d="M22 159 L36 159 M65 159 L79 159"
        stroke="#6145A5"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <Path d="M32 83 L68 83 L80 137 L20 137 Z" fill="#8C6CD1" />
      <Path
        d="M28 91 L16 119"
        stroke="#B87D59"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <Circle cx="20" cy="44" r="17" fill="#41302F" />
      <Circle cx="80" cy="44" r="17" fill="#41302F" />
      <Ellipse cx="50" cy="48" rx="32" ry="36" fill="#41302F" />
      <Ellipse cx="50" cy="53" rx="27" ry="29" fill="#BE8561" />
      <Path
        d="M24 40 Q26 13 53 18 Q74 18 78 40 Q57 39 47 25 Q39 39 24 40"
        fill="#41302F"
      />
      <Circle cx="40" cy="51" r="3" fill="#30272B" />
      <Circle cx="61" cy="51" r="3" fill="#30272B" />
      <Path
        d="M40 65 Q50 75 61 65"
        fill="none"
        stroke="#793F3B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Circle cx="31" cy="61" r="4" fill="#D99581" />
      <Circle cx="70" cy="61" r="4" fill="#D99581" />
      <Circle cx="20" cy="33" r="6" fill="#F8C95F" />
      <Circle cx="80" cy="33" r="6" fill="#F8C95F" />
    </Svg>
  );
}

function ParkScene({
  page,
  reducedMotion,
}: {
  page: number;
  reducedMotion: boolean;
}) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.setValue(0);
    if (reducedMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: page === 1 ? 1300 : 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: page === 1 ? 1300 : 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [motion, page, reducedMotion]);

  const playing = page === 1;
  const goodbye = page === 2;

  const dogX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: playing ? [-16, 24] : [0, 0],
  });

  const catY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, playing ? -35 : -3],
  });

  const birdX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: playing ? [-45, 20] : [-5, 5],
  });

  const birdY = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, playing ? -25 : -8],
  });

  const sway = motion.interpolate({
    inputRange: [0, 1],
    outputRange: goodbye ? ['-9deg', '9deg'] : ['-2deg', '2deg'],
  });

  const armRotation = motion.interpolate({
    inputRange: [0, 1],
    outputRange: goodbye ? ['-25deg', '22deg'] : ['-8deg', '3deg'],
  });

  const cloudX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  return (
    <View
      style={styles.scene}
      accessible
      accessibilityLabel={
        page === 0
          ? 'Luna meets a dog, cat, cow and bird in a sunny park.'
          : page === 1
            ? 'The dog runs, the cat jumps and the bird flies.'
            : 'Luna waves goodbye to her animal friends.'
      }
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 340"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFillObject}
      >
        <Rect width="400" height="340" fill="#CDEEFF" />
        <Circle cx="330" cy="55" r="29" fill="#FFDA70" />
        <Circle cx="322" cy="52" r="2.5" fill="#9D733A" />
        <Circle cx="338" cy="52" r="2.5" fill="#9D733A" />
        <Path
          d="M322 63 Q330 70 338 63"
          fill="none"
          stroke="#9D733A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Ellipse cx="90" cy="290" rx="230" ry="103" fill="#B7DFA5" />
        <Ellipse cx="360" cy="300" rx="240" ry="100" fill="#A0D399" />
        <Path
          d="M165 340 Q200 270 280 238 L309 244 Q243 280 235 340"
          fill="#F1D7AB"
        />
        <Rect
          x="28"
          y="122"
          width="19"
          height="113"
          rx="8"
          fill="#AE7A52"
        />
        <Circle cx="36" cy="115" r="45" fill="#6EBB8B" />
        <Circle cx="14" cy="145" r="32" fill="#79C795" />
        <Circle cx="62" cy="143" r="34" fill="#79C795" />
        <Path
          d="M329 266 L329 278 M352 299 L352 311 M31 302 L31 315"
          stroke="#5E9B64"
          strokeWidth="3"
        />
        <Circle cx="329" cy="264" r="6" fill="#FFF3A7" />
        <Circle cx="352" cy="297" r="6" fill="#F5BCD4" />
        <Circle cx="31" cy="300" r="6" fill="#FFF3A7" />
      </Svg>

      <Animated.View
        style={[styles.cloud, { transform: [{ translateX: cloudX }] }]}
      >
        <Svg width="115" height="55" viewBox="0 0 115 55">
          <Circle cx="32" cy="31" r="19" fill="white" />
          <Circle cx="56" cy="23" r="23" fill="white" />
          <Circle cx="81" cy="33" r="18" fill="white" />
          <Rect x="30" y="30" width="54" height="20" rx="10" fill="white" />
        </Svg>
      </Animated.View>

      <View style={styles.luna}>
        <LunaDrawing />
        <Animated.View
          style={[
            styles.lunaArm,
            {
              transform: [
                { translateY: 20 },
                { rotate: armRotation },
                { translateY: -20 },
              ],
            },
          ]}
        >
          <Svg width="32" height="62" viewBox="0 0 32 62">
            <Path
              d="M10 54 L21 17"
              stroke="#BE8561"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <Circle cx="22" cy="12" r="8" fill="#BE8561" />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.cow, { transform: [{ rotate: sway }] }]}
      >
        <AnimalDrawing kind="cow" />
      </Animated.View>

      <Animated.View
        style={[
          styles.dog,
          { transform: [{ translateX: dogX }, { rotate: sway }] },
        ]}
      >
        <AnimalDrawing kind="dog" />
      </Animated.View>

      <Animated.View
        style={[
          styles.cat,
          { transform: [{ translateY: catY }, { rotate: sway }] },
        ]}
      >
        <AnimalDrawing kind="cat" />
      </Animated.View>

      <Animated.View
        style={[
          styles.bird,
          {
            transform: [
              { translateX: birdX },
              { translateY: birdY },
              { rotate: sway },
            ],
          },
        ]}
      >
        <AnimalDrawing kind="bird" />
      </Animated.View>
    </View>
  );
}

export default function AnimalStoryScreen() {
  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [focused, setFocused] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active'
  );

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voiceId, setVoiceId] = useState('');
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [rate, setRate] = useState(0.85);
  const [selectedAnimal, setSelectedAnimal] =
    useState<AnimalKind | null>(null);

  const narrationEnabled = useRef(false);
  const requestId = useRef(0);
  const voiceRequestId = useRef(0);
  const mounted = useRef(true);
  const screenActive = useRef(false);

  const dogPlayer = useAudioPlayer(
    require('../../../assets/sounds/dog.mp3')
  );
  const catPlayer = useAudioPlayer(
    require('../../../assets/sounds/cat.mp3')
  );
  const cowPlayer = useAudioPlayer(
    require('../../../assets/sounds/cow.mp3')
  );
  const birdPlayer = useAudioPlayer(
    require('../../../assets/sounds/bird.mp3')
  );

  const players = useMemo(
    () => ({
      dog: dogPlayer,
      cat: catPlayer,
      cow: cowPlayer,
      bird: birdPlayer,
    }),
    [dogPlayer, catPlayer, cowPlayer, birdPlayer]
  );

  const currentPage = pages[page];
  const selectedVoice = voices.find(
    (voice) => voice.identifier === voiceId
  );

  // Invalidate pending playback before stopping existing audio.
  const silenceAudio = useCallback(() => {
    requestId.current += 1;

    Object.values(players).forEach((player) => {
      try {
        player.pause();
      } catch {
        // The player may already have been released on unmount.
      }
    });

    return Speech.stop().catch(() => {});
  }, [players]);

  const stopAll = useCallback(() => {
    narrationEnabled.current = false;
    void silenceAudio();

    if (mounted.current) {
      setSpeaking(false);
      setSelectedAnimal(null);
    }
  }, [silenceAudio]);

  const loadVoices = useCallback(async () => {
    const request = ++voiceRequestId.current;

    setLoadingVoices(true);
    setVoiceMessage('');

    try {
      const available = await Speech.getAvailableVoicesAsync();

      if (
        !mounted.current ||
        request !== voiceRequestId.current
      ) {
        return;
      }

      // This story is English: only show English narrator voices.
      const englishVoices = available.filter((voice) =>
        /^en(?:[-_]|$)/i.test(voice.language)
      );

      const uniqueVoices = Array.from(
        new Map(
          englishVoices.map((voice) => [voice.identifier, voice])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      setVoices(uniqueVoices);

      if (uniqueVoices.length === 0) {
        setVoiceMessage(
          'No English voice choices are listed yet. Try Refresh voices, ' +
          'or use the device default.'
        );
      }
    } catch {
      if (mounted.current && request === voiceRequestId.current) {
        setVoiceMessage(
          'Voice choices could not load. You can still try the device default.'
        );
      }
    } finally {
      if (mounted.current && request === voiceRequestId.current) {
        setLoadingVoices(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadVoices();

    return () => {
      mounted.current = false;
      voiceRequestId.current += 1;
      requestId.current += 1;
    };
  }, [loadVoices]);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReducedMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      screenActive.current = true;
      setFocused(true);
      setSpeaking(false);

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          const active = state === 'active';
          setAppActive(active);

          if (!active) stopAll();
        }
      );

      return () => {
        screenActive.current = false;
        setFocused(false);
        narrationEnabled.current = false;
        subscription.remove();
        void silenceAudio();
      };
    }, [silenceAudio, stopAll])
  );

  function requestIsCurrent(request: number) {
    return (
      mounted.current &&
      screenActive.current &&
      request === requestId.current
    );
  }

  async function speakText(
    text: string,
    voiceOverride?: string
  ) {
    const stopping = silenceAudio();
    const request = requestId.current;

    setMessage('');
    setSelectedAnimal(null);
    setSpeaking(true);

    await stopping;

    if (!requestIsCurrent(request)) return;

    const chosenVoiceId = voiceOverride ?? voiceId;
    const chosenVoice = voices.find(
      (voice) => voice.identifier === chosenVoiceId
    );

    try {
      Speech.speak(text, {
        language: chosenVoice?.language ?? 'en-US',
        voice: chosenVoice?.identifier,
        rate,
        pitch: 1,
        onDone: () => {
          if (requestIsCurrent(request)) setSpeaking(false);
        },
        onStopped: () => {
          if (requestIsCurrent(request)) setSpeaking(false);
        },
        onError: () => {
          if (requestIsCurrent(request)) {
            narrationEnabled.current = false;
            setSpeaking(false);
            setMessage(
              'The voice could not start. Try another voice or the device default.'
            );
          }
        },
      });
    } catch {
      if (requestIsCurrent(request)) {
        narrationEnabled.current = false;
        setSpeaking(false);
        setMessage('The voice could not start. Please try again.');
      }
    }
  }

  async function playAnimal(kind: AnimalKind) {
    narrationEnabled.current = false;

    const stopping = silenceAudio();
    const request = requestId.current;

    setSpeaking(false);
    setSelectedAnimal(null);
    setMessage('');

    await stopping;

    if (!requestIsCurrent(request)) return;

    const player = players[kind];

    try {
      if (!player.isLoaded) {
        setMessage(
          'This sound is not ready yet. Wait a moment and tap again.'
        );
        return;
      }

      // Audio players remain at the end after playback.
      // Rewind so repeated taps replay the sound.
      await player.seekTo(0);

      if (!requestIsCurrent(request)) return;

      player.play();
      setSelectedAnimal(kind);
    } catch {
      if (requestIsCurrent(request)) {
        setMessage(
          `Could not play ${animalNames[kind].toLowerCase()}. ` +
          `Check that ${kind}.mp3 is a playable audio file.`
        );
      }
    }
  }

  function sayAnimalName(kind: AnimalKind) {
    narrationEnabled.current = false;
    void speakText(animalNames[kind]);
  }

  function toggleNarration() {
    if (speaking) {
      stopAll();
      return;
    }

    narrationEnabled.current = true;
    void speakText(currentPage.text);
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;

    const continueNarration = narrationEnabled.current;

    setPage(nextPage);
    setMessage('');

    if (continueNarration) {
      void speakText(pages[nextPage].text);
    } else {
      stopAll();
    }
  }

  function replayStory() {
    setPage(0);
    narrationEnabled.current = true;
    void speakText(pages[0].text);
  }

  function leaveStory() {
    stopAll();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/cindy/stories',
        params: {
          language: 'english',
          category: 'animals',
        },
      });
    }
  }

  function finishStory() {
    stopAll();

    // Backend progress saving will be connected after account integration.
    router.replace({
      pathname: '/cindy/stories',
      params: {
        language: 'english',
        category: 'animals',
      },
    });
  }

  function selectVoice(identifier: string) {
    stopAll();
    setVoiceId(identifier);
    setMessage('');
  }

  function previewVoice() {
    narrationEnabled.current = false;
    void speakText(
      'Hello! My name is Luna. Let’s meet my animal friends.'
    );
  }

  function changeSpeed(value: number) {
    stopAll();
    setRate(value);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              onPress={leaveStory}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.pageCount}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text style={styles.title}>
            Luna’s Animal Park Adventure
          </Text>

          <ParkScene
            page={page}
            reducedMotion={
              reducedMotion || !focused || !appActive
            }
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

            <Text style={styles.storyText}>
              {currentPage.text}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                speaking ? 'Stop reading' : 'Read this page aloud'
              }
              onPress={toggleNarration}
              style={({ pressed }) => [
                styles.voiceButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.voiceText}>
                {speaking ? '■ Stop reading' : '▶ Read to me'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.navigation}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: page === 0 }}
              disabled={page === 0}
              onPress={() => changePage(page - 1)}
              style={({ pressed }) => [
                styles.secondaryButton,
                page === 0 && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>
                ← Previous
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={
                page === pages.length - 1
                  ? finishStory
                  : () => changePage(page + 1)
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryText}>
                {page === pages.length - 1 ? 'Finish ✓' : 'Next →'}
              </Text>
            </Pressable>
          </View>

          {page === pages.length - 1 && (
            <Pressable
              accessibilityRole="button"
              onPress={replayStory}
              style={({ pressed }) => [
                styles.replayButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backText}>↻ Read again</Text>
            </Pressable>
          )}

          {/* Animal sounds and spoken names */}
          <Text style={styles.sectionHeading}>
            Meet the animals
          </Text>

          <Text style={styles.hint}>
            Tap an animal for its sound. Tap its name to hear the word.
          </Text>

          <View style={styles.wordRow}>
            {animalKinds.map((kind) => {
              const selected = selectedAnimal === kind;

              return (
                <View
                  key={kind}
                  style={[
                    styles.animalCard,
                    selected && styles.selectedAnimal,
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Play ${animalNames[kind].toLowerCase()} sound`}
                    onPress={() => void playAnimal(kind)}
                    style={({ pressed }) => [
                      styles.animalSoundButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.miniAnimal}>
                      <AnimalDrawing kind={kind} />
                    </View>

                    <Text style={styles.soundText}>
                      {soundNames[kind]}
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Say ${animalNames[kind]}`}
                    onPress={() => sayAnimalName(kind)}
                    style={({ pressed }) => [
                      styles.animalNameButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.wordText}>
                      {animalNames[kind]} ♪
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={stopAll}
            style={({ pressed }) => [
              styles.stopButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backText}>■ Stop sound</Text>
          </Pressable>

          {!!message && (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.message}
            >
              {message}
            </Text>
          )}

          {/* Voice settings */}
          <View style={styles.settingsCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: voicePanelOpen }}
              onPress={() => {
                const opening = !voicePanelOpen;
                setVoicePanelOpen(opening);

                if (opening) void loadVoices();
              }}
              style={styles.settingsHeader}
            >
              <View style={styles.settingsHeaderText}>
                <Text style={styles.settingsTitle}>
                  Narrator voice
                </Text>
                <Text style={styles.hint}>
                  {selectedVoice?.name ?? 'Device default'}
                </Text>
              </View>

              <Text style={styles.backText}>
                {voicePanelOpen ? 'Close ↑' : 'Change ↓'}
              </Text>
            </Pressable>

            {voicePanelOpen && (
              <View style={styles.settingsBody}>
                <Text style={styles.hint}>
                  Choose a voice, then tap Preview voice.
                </Text>

                <ScrollView
                  style={styles.voiceList}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: voiceId === '' }}
                    onPress={() => selectVoice('')}
                    style={[
                      styles.voiceOption,
                      voiceId === '' && styles.selectedVoice,
                    ]}
                  >
                    <Text style={styles.voiceOptionName}>
                      {voiceId === '' ? '✓ ' : ''}
                      Device default
                    </Text>
                    <Text style={styles.voiceLanguage}>English</Text>
                  </Pressable>

                  {voices.map((voice) => (
                    <Pressable
                      key={voice.identifier}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: voiceId === voice.identifier,
                      }}
                      onPress={() => selectVoice(voice.identifier)}
                      style={[
                        styles.voiceOption,
                        voiceId === voice.identifier &&
                          styles.selectedVoice,
                      ]}
                    >
                      <Text style={styles.voiceOptionName}>
                        {voiceId === voice.identifier ? '✓ ' : ''}
                        {voice.name}
                      </Text>
                      <Text style={styles.voiceLanguage}>
                        {voice.language}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {loadingVoices && (
                  <Text style={styles.hint}>Loading voices…</Text>
                )}

                {!!voiceMessage && (
                  <Text style={styles.hint}>{voiceMessage}</Text>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loadingVoices }}
                  disabled={loadingVoices}
                  onPress={() => void loadVoices()}
                  style={styles.refreshButton}
                >
                  <Text style={styles.backText}>↻ Refresh voices</Text>
                </Pressable>

                <Text style={styles.speedHeading}>Reading speed</Text>

                <View style={styles.speedRow}>
                  {[
                    { label: 'Slow', value: 0.85 },
                    { label: 'Normal', value: 1 },
                  ].map((speed) => (
                    <Pressable
                      key={speed.label}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: rate === speed.value,
                      }}
                      onPress={() => changeSpeed(speed.value)}
                      style={[
                        styles.speedButton,
                        rate === speed.value && styles.selectedVoice,
                      ]}
                    >
                      <Text style={styles.backText}>
                        {speed.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={previewVoice}
                  style={({ pressed }) => [
                    styles.voiceButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.voiceText}>
                    ▶ Preview voice
                  </Text>
                </Pressable>
              </View>
            )}
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 40,
  },
  panel: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: C.blue,
    borderRadius: 16,
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  backText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  pageCount: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    color: C.text,
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  scene: {
    height: 340,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#CDEEFF',
  },
  cloud: {
    position: 'absolute',
    left: '20%',
    top: 19,
  },
  luna: {
    position: 'absolute',
    left: '38%',
    bottom: 70,
    width: 94,
    height: 160,
  },
  lunaArm: {
    position: 'absolute',
    right: 0,
    top: 37,
    width: 32,
    height: 62,
  },
  dog: {
    position: 'absolute',
    left: '8%',
    bottom: 19,
    width: 88,
    height: 100,
  },
  cat: {
    position: 'absolute',
    right: '8%',
    bottom: 15,
    width: 83,
    height: 95,
  },
  cow: {
    position: 'absolute',
    right: '5%',
    bottom: 96,
    width: 90,
    height: 104,
  },
  bird: {
    position: 'absolute',
    left: '22%',
    top: 88,
    width: 65,
    height: 65,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 17,
  },
  progressSegment: {
    flex: 1,
    height: 7,
    borderRadius: 5,
    backgroundColor: C.blue,
  },
  progressActive: {
    backgroundColor: C.primary,
  },
  readingCard: {
    padding: 22,
    backgroundColor: C.white,
    borderRadius: 26,
  },
  pageTitle: {
    color: C.primary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  storyText: {
    color: C.text,
    fontSize: 20,
    lineHeight: 33,
  },
  voiceButton: {
    minHeight: 52,
    backgroundColor: C.blue,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    marginTop: 20,
  },
  voiceText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: C.text,
    backgroundColor: C.yellow,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: C.blue,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: C.primary,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  replayButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  sectionHeading: {
    color: C.text,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 6,
  },
  hint: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  animalCard: {
    flexGrow: 1,
    flexBasis: 110,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.white,
    overflow: 'hidden',
  },
  selectedAnimal: {
    borderColor: C.primary,
    backgroundColor: C.yellow,
  },
  animalSoundButton: {
    padding: 12,
    alignItems: 'center',
    minHeight: 115,
    justifyContent: 'center',
  },
  miniAnimal: {
    width: 66,
    height: 72,
    marginBottom: 6,
  },
  soundText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  animalNameButton: {
    minHeight: 48,
    backgroundColor: C.blue,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    color: C.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  stopButton: {
    alignSelf: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginTop: 10,
  },
  settingsCard: {
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  settingsHeader: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 76,
  },
  settingsHeaderText: {
    flex: 1,
  },
  settingsTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
  },
  settingsBody: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  voiceList: {
    maxHeight: 240,
    marginTop: 12,
  },
  voiceOption: {
    borderWidth: 2,
    borderColor: C.blue,
    borderRadius: 15,
    padding: 14,
    marginBottom: 8,
    minHeight: 60,
  },
  selectedVoice: {
    borderColor: C.primary,
    backgroundColor: C.lavender,
  },
  voiceOptionName: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  voiceLanguage: {
    color: C.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  refreshButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  speedHeading: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  speedButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: C.blue,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});