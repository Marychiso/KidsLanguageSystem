import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  AppState,
  Animated,
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
import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
} from 'react-native-svg';

import { LearningColors as C } from '@/constants/learning-theme';

const pages = [
  {
    title: 'Bienvenue au parc',
    text: 'Luna visite un petit parc animalier. Le soleil brille. Tout est calme. Elle voit un chien, un chat, une vache et un oiseau. Ses nouveaux amis sont prêts à lui dire bonjour !',
  },
  {
    title: 'On joue ensemble !',
    text: 'Les animaux commencent à jouer. Le chien court joyeusement. Le chat saute et l’oiseau vole dans le ciel. La vache se promène près de Luna. Luna rit en regardant ses amis.',
  },
  {
    title: 'Au revoir, les amis !',
    text: 'Il est bientôt temps de rentrer à la maison. Luna fait un signe de la main et dit : « Au revoir, mes amis ! » Les animaux se rassemblent près d’elle, comme pour lui dire au revoir.',
  },
];

type AnimalKind = 'dog' | 'cat' | 'cow' | 'bird';

const animalNames: Record<AnimalKind, string> = {
  dog: 'Le chien',
  cat: 'Le chat',
  cow: 'La vache',
  bird: 'L’oiseau',
};

const animalPhrases: Record<AnimalKind, string> = {
  dog: 'Voici un chien.',
  cat: 'Voici un chat.',
  cow: 'Voici une vache.',
  bird: 'Voici un oiseau.',
};

// Original vector illustrations: no image downloads required.
function AnimalDrawing({ kind }: { kind: AnimalKind }) {
  if (kind === 'bird') {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Path
          d="M28 62 L9 48 L15 75 Z"
          fill="#2478AE"
        />
        <Ellipse
          cx="49"
          cy="57"
          rx="29"
          ry="25"
          fill="#4BB9E8"
        />
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
      {/* Feet and body */}
      <Rect x="28" y="92" width="15" height="28" rx="7" fill={fur} />
      <Rect x="77" y="92" width="15" height="28" rx="7" fill={fur} />
      <Ellipse cx="60" cy="88" rx="35" ry="28" fill={fur} />

      {kind === 'cow' && (
        <>
          <Ellipse
            cx="43"
            cy="88"
            rx="13"
            ry="17"
            fill="#546174"
          />
          <Path d="M32 25 L26 8 L44 22" fill="#E8CB8B" />
          <Path d="M78 22 L95 8 L88 29" fill="#E8CB8B" />
        </>
      )}

      {/* Ears */}
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

      {/* Eyes */}
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
        <Path
          d="M54 54 Q60 50 66 54 L60 61 Z"
          fill="#644A45"
        />
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
      <Path
        d="M32 83 L68 83 L80 137 L20 137 Z"
        fill="#8C6CD1"
      />
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
          isInteraction: false,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: page === 1 ? 1300 : 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
          isInteraction: false,
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
          ? 'Luna rencontre un chien, un chat, une vache et un oiseau dans un parc ensoleillé.'
          : page === 1
            ? 'Le chien court, le chat saute et l’oiseau vole.'
            : 'Luna fait un signe de la main à ses amis les animaux.'
      }
    >
      {/* Scenery */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 340"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
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

        <Rect x="28" y="122" width="19" height="113" rx="8" fill="#AE7A52" />
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

      {/* Luna */}
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
        style={[
          styles.cow,
          { transform: [{ rotate: sway }] },
        ]}
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

// Mount the audio-owning component only on the device/browser.
// This prevents "Audio is not defined" during web server rendering.
export default function FrenchAnimalStory() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <SafeAreaView style={styles.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.message}>Le parc se prépare…</Text>
      </SafeAreaView>
    );
  }

  return <FrenchAnimalStoryContent />;
}

function FrenchAnimalStoryContent() {
  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const [reducedMotion, setReducedMotion] = useState(true);
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(true);

  const narrationEnabled = useRef(false);
  const requestId = useRef(0);
  const focusRef = useRef(false);
  const foregroundRef = useRef(true);
  const frenchVoice = useRef<string | undefined>(undefined);

  const dogPlayer = useAudioPlayer(require('../../../../../assets/sounds/dog.mp3'));
  const catPlayer = useAudioPlayer(require('../../../../../assets/sounds/cat.mp3'));
  const cowPlayer = useAudioPlayer(require('../../../../../assets/sounds/cow.mp3'));
  const birdPlayer = useAudioPlayer(require('../../../../../assets/sounds/bird.mp3'));

  const players = useMemo(() => ({
    dog: dogPlayer, cat: catPlayer, cow: cowPlayer, bird: birdPlayer,
  }), [dogPlayer, catPlayer, cowPlayer, birdPlayer]);

  const cancelAudio = useCallback(() => {
    requestId.current += 1;
    void Speech.stop().catch(() => {});
    Object.values(players).forEach((player) => {
      try { player.pause(); } catch { /* Already released. */ }
    });
  }, [players]);

  // Match Mary's French voice selection and narration speed.
  useEffect(() => {
    let active = true;
    void Speech.getAvailableVoicesAsync().then((voices) => {
      const frFR = voices.filter((voice) =>
        voice.language.toLowerCase().replace('_', '-').startsWith('fr-fr')
      );
      const french = voices.filter((voice) =>
        voice.language.toLowerCase().startsWith('fr')
      );
      const selected = frFR.find((voice) =>
        voice.quality === Speech.VoiceQuality.Enhanced
      ) ?? frFR[0] ?? french[0];
      if (active) frenchVoice.current = selected?.identifier;
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged', setReducedMotion
    );
    return () => { active = false; subscription.remove(); };
  }, []);

  useFocusEffect(useCallback(() => {
    focusRef.current = true;
    setFocused(true);
    setSpeaking(false);
    return () => {
      focusRef.current = false;
      narrationEnabled.current = false;
      setFocused(false);
      cancelAudio();
    };
  }, [cancelAudio]));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const active = state === 'active';
      foregroundRef.current = active;
      setForeground(active);
      if (!active && focusRef.current) {
        narrationEnabled.current = false;
        cancelAudio();
        setSpeaking(false);
      }
    });
    return () => subscription.remove();
  }, [cancelAudio]);

  const currentPage = pages[page];

  async function readText(text: string, sound?: AnimalKind) {
    cancelAudio();
    if (!focusRef.current || !foregroundRef.current) return;
    const request = requestId.current;
    const isCurrent = () => request === requestId.current &&
      focusRef.current && foregroundRef.current;

    setMessage('');
    setSpeaking(true);

    try {
      await Speech.stop();
      if (!isCurrent()) return;

      Speech.speak(text, {
        language: 'fr-FR',
        ...(frenchVoice.current ? { voice: frenchVoice.current } : {}),
        rate: 0.83,
        pitch: 1,
        volume: 1,
        onDone: () => {
          if (!isCurrent()) return;
          setSpeaking(false);
          if (sound) {
            void (async () => {
              try {
                await players[sound].seekTo(0);
                if (isCurrent()) players[sound].play();
              } catch {
                if (isCurrent()) setMessage('Le son est indisponible. Réessaie.');
              }
            })();
          }
        },
        onStopped: () => { if (isCurrent()) setSpeaking(false); },
        onError: () => {
          if (isCurrent()) {
            setSpeaking(false);
            setMessage('La voix est indisponible. Appuie sur Écouter pour réessayer.');
          }
        },
      });
    } catch {
      if (isCurrent()) {
        setSpeaking(false);
        setMessage('La voix est indisponible. Appuie sur Écouter pour réessayer.');
      }
    }
  }

  function playAnimalSound(kind: AnimalKind) {
    narrationEnabled.current = false;
    void readText(animalPhrases[kind], kind);
  }

  function stopVoice() {
    narrationEnabled.current = false;
    cancelAudio();
    setSpeaking(false);
  }

  function readCurrentPage() {
    narrationEnabled.current = true;
    void readText(currentPage.text);
  }

  function changePage(nextPage: number) {
    if (nextPage < 0 || nextPage >= pages.length) return;
    const continueNarration = narrationEnabled.current;
    cancelAudio();
    setSpeaking(false);
    setPage(nextPage);
    setMessage('');
    if (continueNarration) void readText(pages[nextPage].text);
  }

  function replayStory() {
    setPage(0);
    narrationEnabled.current = true;
    void readText(pages[0].text);
  }

  function leaveStory() {
    stopVoice();
    if (router.canGoBack()) router.back();
    else router.replace({
      pathname: '/mary/categories',
      params: { language: 'french', activity: 'stories' },
    });
  }

  function finishStory() {
    stopVoice();
    // Backend progress saving is not connected yet.
    router.replace({
      pathname: '/mary/categories',
      params: { language: 'french', activity: 'stories' },
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
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
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>

            <Text style={styles.pageCount}>
              {page + 1} / {pages.length}
            </Text>
          </View>

          <Text style={styles.title}>
            Luna au parc animalier
          </Text>

          <ParkScene
            page={page}
            reducedMotion={reducedMotion || !focused || !foreground}
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

            <Text style={styles.storyText}>{currentPage.text}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                'Écouter cette page en français'
              }
              onPress={readCurrentPage}
              style={({ pressed }) => [
                styles.voiceButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.voiceText}>
                {speaking ? '↻ Réécouter' : '▶ Écouter'}
              </Text>
            </Pressable>

            {!!message && (
              <Text
                style={styles.message}
                accessibilityLiveRegion="polite"
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
                styles.secondaryButton,
                page === 0 && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>← Précédent</Text>
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
                {page === pages.length - 1 ? 'Terminer ✓' : 'Suivant →'}
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
              <Text style={styles.backText}>↻ Recommencer</Text>
            </Pressable>
          )}

          <Text style={styles.wordHeading}>Rencontre les animaux</Text>

          <View style={styles.wordRow}>
            {(Object.keys(animalNames) as AnimalKind[]).map((kind) => (
              <Pressable
                key={kind}
                accessibilityRole="button"
                accessibilityLabel={`Écouter : ${animalNames[kind]}, puis son cri`}
                onPress={() => void playAnimalSound(kind)}
                style={({ pressed }) => [
                  styles.wordButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.miniAnimal}>
                  <AnimalDrawing kind={kind} />
                </View>
                <Text style={styles.wordText}>{animalNames[kind]}</Text>
              </Pressable>
            ))}
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
    marginTop: 22,
  },
  voiceText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  message: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 21,
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
  wordHeading: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 12,
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordButton: {
    flexGrow: 1,
    flexBasis: 65,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
  },
  miniAnimal: {
    width: 50,
    height: 56,
    marginBottom: 6,
  },
  wordText: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});