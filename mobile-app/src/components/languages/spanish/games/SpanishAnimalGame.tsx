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
    name: 'el perro',
    emoji: '🐶',
    cry: '¡Guau!',
    image: require('../../../../../assets/animals/dog.jpg'),
  },
  cat: {
    name: 'el gato',
    emoji: '🐱',
    cry: '¡Miau!',
    image: require('../../../../../assets/animals/cat.jpg'),
  },
  cow: {
    name: 'la vaca',
    emoji: '🐮',
    cry: '¡Muuu!',
    image: require('../../../../../assets/animals/cow.jpg'),
  },
  bird: {
    name: 'el pájaro',
    emoji: '🐦',
    cry: '¡Pío, pío!',
    image: require('../../../../../assets/animals/bird.jpg'),
  },
};

const IDS: AnimalId[] = ['dog', 'cat', 'cow', 'bird'];
const TOTAL_ROUNDS = 6;
const NATIVE_DRIVER = Platform.OS !== 'web';

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

function shuffled<T,>(values: readonly T[]): T[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }

  return result;
}

function makeTargets(): AnimalId[] {
  return [...shuffled(IDS), ...shuffled(IDS).slice(0, 2)];
}

function clueFor(animal: AnimalId) {
  return `¡Encuentra ${ANIMALS[animal].name}!`;
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

      const reveal = Animated.spring(peek, {
        toValue: 1,
        friction: 5,
        tension: 65,
        useNativeDriver: NATIVE_DRIVER,
        isInteraction: false,
      });

      reveal.start();
      return () => reveal.stop();
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
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [active, index, peek, reducedMotion, revealed]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Detrás de este arbusto: ${animal.name}`}
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
            style={styles.photo}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.bush}>
          <View style={[styles.leaf, styles.leafLeft]} />
          <View style={[styles.leaf, styles.leafMiddle]} />
          <View style={[styles.leaf, styles.leafRight]} />

          <View style={styles.bushBase}>
            <Text style={styles.decoration}>
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

export default function SpanishAnimalGame() {
  const dog = useAudioPlayer(
    require('../../../../../assets/sounds/dog.mp3')
  );
  const cat = useAudioPlayer(
    require('../../../../../assets/sounds/cat.mp3')
  );
  const cow = useAudioPlayer(
    require('../../../../../assets/sounds/cow.mp3')
  );
  const bird = useAudioPlayer(
    require('../../../../../assets/sounds/bird.mp3')
  );

  const players = useMemo(
    () => ({ dog, cat, cow, bird }),
    [dog, cat, cow, bird]
  );

  const [phase, setPhase] = useState<Phase>('ready');
  const [targets, setTargets] = useState<AnimalId[]>(IDS);
  const [positions, setPositions] = useState<AnimalId[]>(IDS);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [audioMessage, setAudioMessage] = useState('');

  const mounted = useRef(true);
  const phaseRef = useRef<Phase>('ready');
  const focused = useRef(false);
  const foreground = useRef(true);
  const soundRef = useRef(true);
  const audioRequest = useRef(0);
  const voice = useRef<Speech.Voice | undefined>(undefined);

  const target = targets[round] ?? 'dog';
  const targetAnimal = ANIMALS[target];

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;

    if (mounted.current) {
      setPhase(next);
    }
  }, []);

  const stopAudio = useCallback(() => {
    audioRequest.current += 1;
    const stopping = Speech.stop().catch(() => {});

    Object.values(players).forEach((player) => {
      try {
        player.pause();
      } catch {
        // Players may already be released during navigation.
      }
    });

    return stopping;
  }, [players]);

  const loadVoice = useCallback(async () => {
    const voices = await Speech.getAvailableVoicesAsync();

    const spanish = voices.filter((item) =>
      /^es(?:[-_]|$)/i.test(item.language)
    );

    const spain = spanish.filter((item) =>
      /^es[-_]ES$/i.test(item.language)
    );

    const selected =
      spain.find(
        (item) => item.quality === Speech.VoiceQuality.Enhanced
      ) ??
      spain[0] ??
      spanish[0];

    if (mounted.current) {
      voice.current = selected;
    }

    return selected;
  }, []);

  function canPlay(request: number) {
    return (
      mounted.current &&
      focused.current &&
      foreground.current &&
      soundRef.current &&
      request === audioRequest.current
    );
  }

  async function playAnimalSound(
    animal: AnimalId,
    request: number
  ) {
    if (!canPlay(request)) return;

    try {
      await players[animal].seekTo(0);

      if (canPlay(request)) {
        players[animal].play();
      }
    } catch {
      if (canPlay(request)) {
        setAudioMessage(
          'Toca «Escuchar el sonido» para intentarlo de nuevo.'
        );
      }
    }
  }

  async function speak(text: string, animalAfter?: AnimalId) {
    const stopping = stopAudio();
    const request = audioRequest.current;

    if (!canPlay(request)) return;

    setAudioMessage('');

    let cryStarted = false;

    function playCryAfterClue() {
      if (
        !cryStarted &&
        animalAfter &&
        canPlay(request)
      ) {
        cryStarted = true;
        void playAnimalSound(animalAfter, request);
      }
    }

    function handleError() {
      if (!canPlay(request)) return;

      setAudioMessage(
        'La voz no está disponible. Mira la imagen para encontrar el animal.'
      );

      playCryAfterClue();
    }

    try {
      await stopping;
      if (!canPlay(request)) return;

      let selected = voice.current;

      if (!selected) {
        selected = await loadVoice();
      }

      if (!canPlay(request)) return;

      if (!selected) {
        setAudioMessage(
          'No hay una voz en español disponible en este dispositivo. ' +
          'Puedes seguir jugando con las imágenes y los sonidos.'
        );

        playCryAfterClue();
        return;
      }

      Speech.speak(text, {
        language: selected.language,
        voice: selected.identifier,
        rate: 0.83,
        pitch: 1,
        volume: 1,
        onDone: playCryAfterClue,
        onError: handleError,
      });
    } catch {
      handleError();
    }
  }

  useEffect(() => {
    mounted.current = true;

    void loadVoice().catch(() => {});

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted.current) {
          setReducedMotion(enabled);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted.current) {
          setReducedMotion(enabled);
        }
      }
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

      function pauseIfPlaying() {
        void stopAudio();

        if (phaseRef.current === 'playing') {
          changePhase('paused');
        }
      }

      if (!foreground.current) {
        pauseIfPlaying();
      }

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          foreground.current = state === 'active';

          if (!foreground.current) {
            pauseIfPlaying();
          }
        }
      );

      return () => {
        focused.current = false;
        subscription.remove();
        pauseIfPlaying();
      };
    }, [changePhase, stopAudio])
  );

  function startGame() {
    const nextTargets = makeTargets();

    setTargets(nextTargets);
    setPositions(shuffled(IDS));
    setRound(0);
    setStars(0);
    setFeedback('Mira los arbustos. ¿Quién se esconde ahí?');
    setAudioMessage('');
    changePhase('playing');
    void speak(clueFor(nextTargets[0]));
  }

  function chooseAnimal(animal: AnimalId) {
    if (
      phaseRef.current !== 'playing' ||
      !focused.current ||
      !foreground.current
    ) {
      return;
    }

    if (animal !== target) {
      const hint =
        `Has visto ${ANIMALS[animal].name}. ` +
        `¡Sigue buscando ${targetAnimal.name}!`;

      setFeedback(hint);
      void speak(hint);
      return;
    }

    // Lock the round immediately to prevent duplicate stars.
    changePhase('found');
    setStars((previous) => previous + 1);
    setAudioMessage('');

    const success = `¡Has encontrado ${targetAnimal.name}!`;

    setFeedback(`${success} ${targetAnimal.cry}`);
    void speak(success, target);
  }

  function nextRound() {
    if (phaseRef.current !== 'found') return;

    if (round + 1 === TOTAL_ROUNDS) {
      changePhase('won');
      setAudioMessage('');
      void speak('¡Muy bien! ¡Has ganado seis estrellas!');
      return;
    }

    const next = round + 1;

    setRound(next);
    setPositions(shuffled(IDS));
    setFeedback('¡Los animales han cambiado de escondite!');
    setAudioMessage('');
    changePhase('playing');
    void speak(clueFor(targets[next]));
  }

  function pauseGame() {
    if (phaseRef.current !== 'playing') return;

    void stopAudio();
    changePhase('paused');
  }

  function resumeGame() {
    if (
      phaseRef.current !== 'paused' ||
      !focused.current ||
      !foreground.current
    ) {
      return;
    }

    changePhase('playing');
    void speak(clueFor(target));
  }

  function toggleSound() {
    soundRef.current = !soundRef.current;
    setSoundEnabled(soundRef.current);
    setAudioMessage('');

    if (
      soundRef.current &&
      phaseRef.current === 'playing'
    ) {
      void speak(clueFor(target));
    } else {
      void stopAudio();
    }
  }

  async function hearSound() {
    soundRef.current = true;
    setSoundEnabled(true);
    setAudioMessage('');

    const stopping = stopAudio();
    const request = audioRequest.current;

    await stopping;
    await playAnimalSound(target, request);
  }

  function openGames() {
    void stopAudio();

    router.replace({
      pathname: '/mary/categories',
      params: {
        language: 'spanish',
        activity: 'games',
      },
    });
  }

  function goBack() {
    if (router.canGoBack()) {
      void stopAudio();
      router.back();
    } else {
      openGames();
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
              title="← Volver"
              onPress={goBack}
              secondary
            />

            <Text style={styles.score}>⭐ {stars}</Text>

            <GameButton
              title={
                soundEnabled
                  ? 'Sonido activado'
                  : 'Sonido desactivado'
              }
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>
            El escondite de los animales
          </Text>

          {phase === 'ready' && (
            <View style={styles.menuCard}>
              <Text style={styles.hero}>🌳 🐶 🌳</Text>
              <Text style={styles.heading}>
                ¿Quién se esconde?
              </Text>

              <Text style={styles.description}>
                Escucha la pista y mira los arbustos.
                ¡Toca el animal en cuanto lo veas!
              </Text>

              <View style={styles.animalLine}>
                {IDS.map((id) => (
                  <Text key={id} style={styles.smallAnimal}>
                    {ANIMALS[id].emoji}
                  </Text>
                ))}
              </View>

              <Text style={styles.smallText}>
                Seis rondas · Sin cronómetro
              </Text>

              <GameButton
                title="¡A buscar! →"
                onPress={startGame}
              />
            </View>
          )}

          {showGarden && (
            <>
              <View style={styles.clueCard}>
                <Text style={styles.clueEmoji}>
                  {targetAnimal.emoji}
                </Text>

                <View style={styles.clueWords}>
                  <Text style={styles.clueTitle}>
                    {phase === 'found'
                      ? `¡Has encontrado ${targetAnimal.name}!`
                      : clueFor(target)}
                  </Text>

                  <Text style={styles.smallText}>
                    Ronda {round + 1} de {TOTAL_ROUNDS}
                  </Text>
                </View>

                {phase === 'playing' && (
                  <GameButton
                    title="Escuchar la pista"
                    onPress={() => {
                      void speak(clueFor(target));
                    }}
                    secondary
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
                        styles.dot,
                        index < stars && styles.completedDot,
                      ]}
                    />
                  )
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

                <Text style={styles.gardenFooter}>
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
                  title="Pausa"
                  onPress={pauseGame}
                  secondary
                />
              ) : (
                <View style={styles.actionRow}>
                  <GameButton
                    title="Escuchar el sonido ♪"
                    onPress={() => {
                      void hearSound();
                    }}
                    secondary
                  />

                  <GameButton
                    title={
                      round + 1 === TOTAL_ROUNDS
                        ? 'Ver mis estrellas →'
                        : 'Siguiente escondite →'
                    }
                    onPress={nextRound}
                  />
                </View>
              )}
            </>
          )}

          {phase === 'paused' && (
            <View style={styles.menuCard}>
              <Text style={styles.hero}>🌤️</Text>
              <Text style={styles.heading}>
                Una pequeña pausa
              </Text>

              <Text style={styles.description}>
                Los animales te esperan.
              </Text>

              <GameButton
                title="Continuar →"
                onPress={resumeGame}
              />

              <GameButton
                title="Empezar de nuevo"
                onPress={startGame}
                secondary
              />
            </View>
          )}

          {phase === 'won' && (
            <View style={styles.menuCard}>
              <Text style={styles.hero}>🏆</Text>

              <Text style={styles.heading}>
                ¡Muy bien, los has encontrado a todos!
              </Text>

              <Text style={styles.description}>
                Has ganado una estrella en cada una de las{' '}
                {TOTAL_ROUNDS} rondas.
              </Text>

              <Text style={styles.winningStars}>
                {'⭐'.repeat(stars)}
              </Text>

              <GameButton
                title="Jugar de nuevo ↻"
                onPress={startGame}
              />

              <GameButton
                title="Volver a los juegos"
                onPress={openGames}
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
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: C.text,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
  },
  score: {
    color: C.primary,
    fontSize: 19,
    fontWeight: '800',
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: C.blue,
  },
  buttonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryText: {
    color: C.primary,
  },
  pressed: {
    opacity: 0.78,
  },
  menuCard: {
    padding: 22,
    borderRadius: 26,
    gap: 16,
    backgroundColor: C.white,
  },
  hero: {
    fontSize: 46,
    textAlign: 'center',
  },
  heading: {
    fontSize: 23,
    color: C.primary,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: C.text,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
  },
  animalLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  smallAnimal: {
    fontSize: 28,
  },
  clueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: C.white,
  },
  clueEmoji: {
    fontSize: 40,
  },
  clueWords: {
    flexGrow: 1,
    gap: 4,
  },
  clueTitle: {
    color: C.primary,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.blue,
  },
  completedDot: {
    backgroundColor: C.primary,
  },
  garden: {
    borderRadius: 26,
    padding: 12,
    backgroundColor: '#DCF2E3',
  },
  gardenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  cloud: {
    fontSize: 27,
  },
  sun: {
    fontSize: 33,
  },
  spots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  hidingSpot: {
    width: '48.5%',
    borderRadius: 20,
    backgroundColor: '#EFF8E9',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  foundSpot: {
    borderColor: C.primary,
    backgroundColor: '#FFF6D8',
  },
  spotScene: {
    height: 145,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flower: {
    position: 'absolute',
    left: 6,
    bottom: 5,
    fontSize: 21,
  },
  animal: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: C.white,
  },
  bush: {
    width: '92%',
    height: 68,
    marginBottom: 12,
  },
  leaf: {
    position: 'absolute',
    borderRadius: 35,
    backgroundColor: '#73B782',
  },
  leafLeft: {
    width: '46%',
    height: 46,
    left: 0,
    bottom: 2,
  },
  leafMiddle: {
    width: '50%',
    height: 54,
    left: '25%',
    bottom: 9,
  },
  leafRight: {
    width: '46%',
    height: 46,
    right: 0,
    bottom: 2,
  },
  bushBase: {
    position: 'absolute',
    bottom: 0,
    left: '4%',
    right: '4%',
    height: 31,
    borderRadius: 18,
    backgroundColor: '#589B68',
    alignItems: 'center',
  },
  decoration: {
    fontSize: 19,
    color: '#FFF2BB',
  },
  nameBadge: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: C.white,
  },
  nameText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: '800',
  },
  gardenFooter: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  feedback: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  winningStars: {
    fontSize: 28,
    textAlign: 'center',
  },
  audioMessage: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
  },
});