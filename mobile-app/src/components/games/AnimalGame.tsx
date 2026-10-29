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
  Image,
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

import { LearningColors as C } from '@/constants/learning-theme';

type AnimalId = 'dog' | 'cat' | 'cow' | 'bird';
type Phase = 'ready' | 'playing' | 'paused' | 'found' | 'won';

const ANIMALS = {
  dog: {
    name: 'dog',
    emoji: '🐶',
    sound: 'Woof!',
    image: require('../../../assets/animals/dog.jpg'),
  },
  cat: {
    name: 'cat',
    emoji: '🐱',
    sound: 'Meow!',
    image: require('../../../assets/animals/cat.jpg'),
  },
  cow: {
    name: 'cow',
    emoji: '🐮',
    sound: 'Moo!',
    image: require('../../../assets/animals/cow.jpg'),
  },
  bird: {
    name: 'bird',
    emoji: '🐦',
    sound: 'Tweet!',
    image: require('../../../assets/animals/bird.jpg'),
  },
};

const IDS: AnimalId[] = ['dog', 'cat', 'cow', 'bird'];
const TOTAL_ROUNDS = 6;
const NATIVE_DRIVER = Platform.OS !== 'web';

function shuffled<T,>(values: readonly T[]): T[] {
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

function makeTargets(): AnimalId[] {
  // Every game includes all four animals.
  return [...shuffled(IDS), ...shuffled(IDS).slice(0, 2)];
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
          secondary && styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function HidingSpot({
  animalId,
  index,
  active,
  revealed,
  reducedMotion,
  onPress,
}: {
  animalId: AnimalId;
  index: number;
  active: boolean;
  revealed: boolean;
  reducedMotion: boolean;
  onPress: () => void;
}) {
  const peek = useRef(new Animated.Value(0)).current;
  const animal = ANIMALS[animalId];

  useEffect(() => {
    peek.stopAnimation();

    if (revealed) {
      if (reducedMotion) {
        peek.setValue(1);
        return;
      }

      const animation = Animated.spring(peek, {
        toValue: 1,
        friction: 5,
        tension: 65,
        useNativeDriver: NATIVE_DRIVER,
      });

      animation.start();

      return () => animation.stop();
    }

    if (!active || reducedMotion) {
      peek.setValue(0.55);
      return;
    }

    peek.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(250 + index * 240),
        Animated.timing(peek, {
          toValue: 0.8,
          duration: 650,
          useNativeDriver: NATIVE_DRIVER,
          isInteraction: false,
        }),
        Animated.delay(900),
        Animated.timing(peek, {
          toValue: 0,
          duration: 650,
          useNativeDriver: NATIVE_DRIVER,
          isInteraction: false,
        }),
        Animated.delay(350),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [active, index, peek, reducedMotion, revealed]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${animal.name} hiding behind a bush`}
      accessibilityState={{ disabled: !active }}
      disabled={!active}
      onPress={onPress}
      style={({ pressed }) => [
        styles.hidingSpot,
        revealed && styles.foundSpot,
        pressed && active && styles.pressed,
      ]}
    >
      <View pointerEvents="none" style={styles.spotScene}>
        <Text style={styles.flower}>
          {index % 2 === 0 ? '🌼' : '🌷'}
        </Text>

        <Animated.View
          style={[
            styles.animal,
            {
              transform: [
                {
                  translateY: peek.interpolate({
                    inputRange: [0, 1],
                    outputRange: [38, -4],
                  }),
                },
                {
                  rotate: peek.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      index % 2 === 0 ? '-7deg' : '7deg',
                      '0deg',
                    ],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={animal.image}
            style={styles.animalImage}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.bush}>
          <View style={[styles.leaf, styles.leafLeft]} />
          <View style={[styles.leaf, styles.leafMiddle]} />
          <View style={[styles.leaf, styles.leafRight]} />

          <View style={styles.bushBase}>
            <Text style={styles.bushDecoration}>
              {revealed ? '⭐' : '✿'}
            </Text>
          </View>
        </View>

        {revealed && (
          <View style={styles.nameBadge}>
            <Text style={styles.nameText}>{animal.name}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function AnimalGame() {
  const dogPlayer = useAudioPlayer(
    require('../../../assets/sounds/dog.mp3'),
  );

  const catPlayer = useAudioPlayer(
    require('../../../assets/sounds/cat.mp3'),
  );

  const cowPlayer = useAudioPlayer(
    require('../../../assets/sounds/cow.mp3'),
  );

  const birdPlayer = useAudioPlayer(
    require('../../../assets/sounds/bird.mp3'),
  );

  const players = useMemo(
    () => ({
      dog: dogPlayer,
      cat: catPlayer,
      cow: cowPlayer,
      bird: birdPlayer,
    }),
    [dogPlayer, catPlayer, cowPlayer, birdPlayer],
  );

  const [phase, setPhase] = useState<Phase>('ready');
  const [targets, setTargets] = useState<AnimalId[]>(IDS);
  const [positions, setPositions] = useState<AnimalId[]>(IDS);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [audioMessage, setAudioMessage] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const focused = useRef(false);
  const mounted = useRef(true);
  const soundRef = useRef(true);
  const audioRequest = useRef(0);
  const voiceId = useRef<string | undefined>(undefined);

  const target = targets[round] ?? 'dog';
  const targetAnimal = ANIMALS[target];

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const stopAudio = useCallback(() => {
    audioRequest.current += 1;

    void Speech.stop().catch(() => {});

    Object.values(players).forEach((player) => {
      try {
        player.pause();
      } catch {
        // The player may already have been released during navigation.
      }
    });
  }, [players]);

  const speak = useCallback(
    (text: string, after?: () => void) => {
      stopAudio();

      if (!focused.current || !soundRef.current) {
        return;
      }

      const request = audioRequest.current;

      const isCurrent = () =>
        mounted.current &&
        focused.current &&
        soundRef.current &&
        request === audioRequest.current;

      // Speak directly from the button interaction.
      // This also helps browsers recognise user-initiated audio.
      try {
        Speech.speak(text, {
          language: 'en-GB',
          ...(voiceId.current ? { voice: voiceId.current } : {}),
          rate: 0.88,

          onDone: () => {
            if (isCurrent()) {
              after?.();
            }
          },

          onError: () => {
            if (isCurrent()) {
              setAudioMessage(
                'Narration is unavailable. Follow the picture clue.',
              );

              after?.();
            }
          },
        });
      } catch {
        if (isCurrent()) {
          setAudioMessage(
            'Narration is unavailable. Follow the picture clue.',
          );

          after?.();
        }
      }
    },
    [stopAudio],
  );

  const playAnimalSound = useCallback(
    async (animal: AnimalId) => {
      if (!focused.current || !soundRef.current) {
        return;
      }

      const request = audioRequest.current;

      try {
        await players[animal].seekTo(0);

        if (
          mounted.current &&
          focused.current &&
          soundRef.current &&
          request === audioRequest.current
        ) {
          players[animal].play();
        }
      } catch {
        if (
          mounted.current &&
          focused.current &&
          request === audioRequest.current
        ) {
          setAudioMessage(
            'The animal sound could not play. Try “Hear sound”.',
          );
        }
      }
    },
    [players],
  );

  useEffect(() => {
    mounted.current = true;

    void Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const preferred =
          voices.find((voice) =>
            voice.name
              .toLowerCase()
              .includes('google uk english female'),
          ) ??
          voices.find(
            (voice) =>
              voice.language.toLowerCase().replace('_', '-') ===
              'en-gb',
          );

        if (mounted.current) {
          voiceId.current = preferred?.identifier;
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
        stopAudio();

        if (phaseRef.current === 'playing') {
          changePhase('paused');
        }
      };
    }, [changePhase, stopAudio]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state !== 'active' && focused.current) {
          stopAudio();

          if (phaseRef.current === 'playing') {
            changePhase('paused');
          }
        }
      },
    );

    return () => subscription.remove();
  }, [changePhase, stopAudio]);

  function startGame() {
    const nextTargets = makeTargets();

    setTargets(nextTargets);
    setPositions(shuffled(IDS));
    setRound(0);
    setStars(0);
    setFeedback('Watch the bushes. Who can you spot?');
    setAudioMessage('');

    changePhase('playing');
    speak(`Find the ${nextTargets[0]}!`);
  }

  function chooseAnimal(animal: AnimalId) {
    // Lock immediately so repeated taps cannot award extra stars.
    if (phaseRef.current !== 'playing') {
      return;
    }

    if (animal !== target) {
      setFeedback(
        `That’s the ${animal}. Keep looking for the ${target}!`,
      );

      speak(`That is a ${animal}. Find the ${target}.`);
      return;
    }

    changePhase('found');
    setStars((previous) => previous + 1);
    setFeedback(`You found the ${target}! ${targetAnimal.sound}`);

    speak(`You found the ${target}!`, () => {
      void playAnimalSound(target);
    });
  }

  function nextRound() {
    stopAudio();

    if (round + 1 >= TOTAL_ROUNDS) {
      changePhase('won');
      speak('Wonderful! You found all six animals!');
      return;
    }

    const next = round + 1;

    setRound(next);
    setPositions(shuffled(IDS));
    setFeedback('They have new hiding places!');
    setAudioMessage('');

    changePhase('playing');
    speak(`Find the ${targets[next]}!`);
  }

  function pauseGame() {
    stopAudio();

    if (phaseRef.current === 'playing') {
      changePhase('paused');
    }
  }

  function resumeGame() {
    changePhase('playing');
    speak(`Find the ${target}!`);
  }

  function toggleSound() {
    const next = !soundRef.current;

    soundRef.current = next;
    setSoundEnabled(next);
    setAudioMessage('');
    stopAudio();

    if (next && phaseRef.current === 'playing') {
      speak(`Find the ${target}!`);
    }
  }

  function hearSound() {
    if (!soundRef.current) {
      soundRef.current = true;
      setSoundEnabled(true);
    }

    setAudioMessage('');
    stopAudio();
    void playAnimalSound(target);
  }

  function goBack() {
    stopAudio();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: {
          language: 'english',
          activity: 'games',
        },
      });
    }
  }

  const showGarden = phase === 'playing' || phase === 'found';

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
              title="← Back"
              onPress={goBack}
              secondary
            />

            <Text style={styles.score}>⭐ {stars}</Text>

            <GameButton
              title={soundEnabled ? 'Sound on' : 'Sound off'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>Animal Hide-and-Seek</Text>

          {showGarden && (
            <>
              <View style={styles.clueCard}>
                <Text style={styles.clueEmoji}>
                  {targetAnimal.emoji}
                </Text>

                <View style={styles.clueWords}>
                  <Text style={styles.clueTitle}>
                    {phase === 'found'
                      ? `Found the ${target}!`
                      : `Find the ${target}!`}
                  </Text>

                  <Text style={styles.smallText}>
                    Round {round + 1} of {TOTAL_ROUNDS}
                  </Text>
                </View>

                {phase === 'playing' && (
                  <GameButton
                    title="Hear clue"
                    secondary
                    onPress={() => speak(`Find the ${target}!`)}
                  />
                )}
              </View>

              <View style={styles.progressRow}>
                {Array.from(
                  { length: TOTAL_ROUNDS },
                  (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        index < stars && styles.completedDot,
                      ]}
                    />
                  ),
                )}
              </View>

              <View style={styles.garden}>
                <View
                  pointerEvents="none"
                  style={styles.gardenHeader}
                >
                  <Text style={styles.cloud}>☁️</Text>
                  <Text style={styles.sun}>☀️</Text>
                  <Text style={styles.cloud}>☁️</Text>
                </View>

                <View style={styles.spots}>
                  {positions.map((animal, index) => (
                    <HidingSpot
                      key={`${round}-${animal}`}
                      animalId={animal}
                      index={index}
                      active={phase === 'playing'}
                      revealed={
                        phase === 'found' && animal === target
                      }
                      reducedMotion={reducedMotion}
                      onPress={() => chooseAnimal(animal)}
                    />
                  ))}
                </View>

                <Text
                  pointerEvents="none"
                  style={styles.gardenFooter}
                >
                  🌿 🌼 🌿 🌷 🌿
                </Text>
              </View>

              <Text
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                {feedback}
              </Text>

              {phase === 'playing' ? (
                <GameButton
                  title="Pause"
                  onPress={pauseGame}
                  secondary
                />
              ) : (
                <View style={styles.actionRow}>
                  <GameButton
                    title="Hear sound ♪"
                    onPress={hearSound}
                    secondary
                  />

                  <GameButton
                    title={
                      round + 1 === TOTAL_ROUNDS
                        ? 'See my stars →'
                        : 'Next hiding place →'
                    }
                    onPress={nextRound}
                  />
                </View>
              )}
            </>
          )}

          {phase === 'ready' && (
            <View style={styles.menuCard}>
              <Text style={styles.heroEmoji}>🌳 🐶 🌳</Text>

              <Text style={styles.menuTitle}>
                Who’s hiding?
              </Text>

              <Text style={styles.menuDescription}>
                Listen to the clue. Watch the bushes.
                Tap the animal when you spot it!
              </Text>

              <View style={styles.animalLine}>
                {IDS.map((animal) => (
                  <Text key={animal} style={styles.smallAnimal}>
                    {ANIMALS[animal].emoji}
                  </Text>
                ))}
              </View>

              <Text style={styles.smallText}>
                Six rounds · No timer · Keep trying
              </Text>

              <GameButton
                title="Let’s find them! →"
                onPress={startGame}
              />
            </View>
          )}

          {phase === 'paused' && (
            <View style={styles.menuCard}>
              <Text style={styles.heroEmoji}>🌤️</Text>

              <Text style={styles.menuTitle}>
                Taking a little break
              </Text>

              <Text style={styles.menuDescription}>
                Your animal friends will wait.
              </Text>

              <GameButton
                title="Keep playing →"
                onPress={resumeGame}
              />

              <GameButton
                title="Start again"
                onPress={startGame}
                secondary
              />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.menuCard}>
              <Text style={styles.heroEmoji}>🏆</Text>

              <Text style={styles.menuTitle}>
                Amazing animal explorer!
              </Text>

              <Text style={styles.menuDescription}>
                You found all {TOTAL_ROUNDS} animals.
              </Text>

              <Text style={styles.winningStars}>
                {'⭐'.repeat(stars)}
              </Text>

              <GameButton
                title="Play again ↻"
                onPress={startGame}
              />

              <GameButton
                title="Back to games"
                onPress={goBack}
                secondary
              />
            </View>
          )}

          {!!audioMessage && (
            <Text
              accessibilityLiveRegion="polite"
              style={styles.audioMessage}
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
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },

  panel: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  score: {
    color: C.primary,
    fontSize: 21,
    fontWeight: '800',
  },

  title: {
    color: C.text,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 20,
  },

  button: {
    minHeight: 48,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
  },

  secondaryButton: {
    backgroundColor: C.blue,
  },

  secondaryButtonText: {
    color: C.primary,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  clueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 22,
  },

  clueEmoji: {
    fontSize: 34,
  },

  clueWords: {
    flex: 1,
    minWidth: 110,
  },

  clueTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },

  smallText: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  progressRow: {
    flexDirection: 'row',
    gap: 7,
    marginVertical: 14,
  },

  progressDot: {
    flex: 1,
    height: 8,
    backgroundColor: C.lavender,
    borderRadius: 8,
  },

  completedDot: {
    backgroundColor: C.primary,
  },

  garden: {
    backgroundColor: '#DCF3FF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#C2E4ED',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },

  gardenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
  },

  cloud: {
    fontSize: 33,
  },

  sun: {
    fontSize: 41,
  },

  spots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  hidingSpot: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    backgroundColor: '#D0EBC6',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  foundSpot: {
    borderColor: '#E8BB45',
    backgroundColor: '#FFF0BC',
  },

  spotScene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  flower: {
    position: 'absolute',
    top: 9,
    left: 8,
    fontSize: 21,
  },

  animal: {
    position: 'absolute',
    top: 18,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.white,
    padding: 4,
  },

  animalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },

  bush: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 77,
  },

  leaf: {
    position: 'absolute',
    width: '48%',
    height: 57,
    borderRadius: 40,
    backgroundColor: '#72B588',
  },

  leafLeft: {
    left: '-4%',
    top: 10,
  },

  leafMiddle: {
    left: '27%',
    top: 0,
    backgroundColor: '#87C398',
  },

  leafRight: {
    right: '-5%',
    top: 12,
  },

  bushBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 45,
    backgroundColor: '#72B588',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bushDecoration: {
    fontSize: 25,
    color: '#FFEEA5',
  },

  nameBadge: {
    position: 'absolute',
    bottom: 7,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: C.white,
    borderRadius: 14,
  },

  nameText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  gardenFooter: {
    fontSize: 23,
    textAlign: 'center',
    paddingVertical: 10,
    letterSpacing: 5,
  },

  feedback: {
    minHeight: 46,
    color: C.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  menuCard: {
    backgroundColor: C.white,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: C.blue,
    padding: 24,
    gap: 18,
  },

  heroEmoji: {
    fontSize: 50,
    textAlign: 'center',
    marginTop: 10,
  },

  menuTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.primary,
    textAlign: 'center',
  },

  menuDescription: {
    fontSize: 16,
    lineHeight: 25,
    color: C.textSecondary,
    textAlign: 'center',
  },

  animalLine: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: C.green,
    borderRadius: 22,
    padding: 14,
  },

  smallAnimal: {
    fontSize: 34,
  },

  winningStars: {
    fontSize: 29,
    textAlign: 'center',
  },

  audioMessage: {
    marginTop: 15,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: C.textSecondary,
  },
});