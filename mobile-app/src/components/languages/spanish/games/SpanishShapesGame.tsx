import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  AppState,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
import * as Speech from 'expo-speech';

import { LearningColors as C } from '@/constants/learning-theme';

type ShapeName = 'circle' | 'square' | 'triangle';
type Phase = 'ready' | 'playing' | 'paused' | 'complete';

type Piece = {
  id: string;
  shape: ShapeName;
  color: string;
  x: number;
  y: number;
  size: number;
};

type Puzzle = {
  id: 'house' | 'train' | 'rocket';
  title: string;
  spokenName: string;
  emoji: string;
  pieces: Piece[];
};

const SHAPE_NAMES: Record<ShapeName, string> = {
  circle: 'círculo',
  square: 'cuadrado',
  triangle: 'triángulo',
};

const PUZZLES: Puzzle[] = [
  {
    id: 'house',
    title: 'Casa',
    spokenName: 'una casa',
    emoji: '🏡',
    pieces: [
      {
        id: 'house-wall',
        shape: 'square',
        color: '#8CBFEC',
        x: 0.5,
        y: 135,
        size: 96,
      },
      {
        id: 'house-roof',
        shape: 'triangle',
        color: '#EC8B91',
        x: 0.5,
        y: 50,
        size: 114,
      },
      {
        id: 'house-sun',
        shape: 'circle',
        color: '#F5CC63',
        x: 0.84,
        y: 46,
        size: 48,
      },
    ],
  },
  {
    id: 'train',
    title: 'Tren',
    spokenName: 'un tren',
    emoji: '🚂',
    pieces: [
      {
        id: 'train-body',
        shape: 'square',
        color: '#AA91DF',
        x: 0.5,
        y: 106,
        size: 106,
      },
      {
        id: 'train-wheel-left',
        shape: 'circle',
        color: '#ECA45F',
        x: 0.36,
        y: 171,
        size: 49,
      },
      {
        id: 'train-wheel-right',
        shape: 'circle',
        color: '#ECA45F',
        x: 0.64,
        y: 171,
        size: 49,
      },
    ],
  },
  {
    id: 'rocket',
    title: 'Cohete',
    spokenName: 'un cohete',
    emoji: '🚀',
    pieces: [
      {
        id: 'rocket-body',
        shape: 'square',
        color: '#8CBFEC',
        x: 0.5,
        y: 128,
        size: 85,
      },
      {
        id: 'rocket-top',
        shape: 'triangle',
        color: '#EC8B91',
        x: 0.5,
        y: 56,
        size: 85,
      },
      {
        id: 'rocket-window',
        shape: 'circle',
        color: '#F5CC63',
        x: 0.5,
        y: 128,
        size: 35,
      },
    ],
  },
];

function isForeground() {
  return (
    AppState.currentState == null ||
    AppState.currentState === 'active'
  );
}

function Shape({
  shape,
  color,
  size,
  outline = false,
}: {
  shape: ShapeName;
  color: string;
  size: number;
  outline?: boolean;
}) {
  const paint = {
    fill: outline ? '#FFFFFF' : color,
    stroke: outline ? '#8395AF' : '#42516B',
    strokeWidth: 3,
    strokeDasharray: outline ? '6 5' : undefined,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'circle' && (
        <Circle cx="50" cy="50" r="45" {...paint} />
      )}

      {shape === 'square' && (
        <Rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="8"
          {...paint}
        />
      )}

      {shape === 'triangle' && (
        <Polygon
          points="50,5 96,94 4,94"
          strokeLinejoin="round"
          {...paint}
        />
      )}
    </Svg>
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

type DraggablePieceProps = {
  piece: Piece;
  startX: number;
  startY: number;
  selected: boolean;
  enabled: boolean;
  onSelect: () => void;
  onDrop: (x: number, y: number) => void;
  onDragging: (dragging: boolean) => void;
};

function DraggablePiece(props: DraggablePieceProps) {
  const {
    piece,
    startX,
    startY,
    selected,
    enabled,
    onSelect,
  } = props;

  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const latest = useRef(props);
  latest.current = props;

  const responder = React.useMemo(() => {
    function finishDrag() {
      setDragging(false);
      latest.current.onDragging(false);
      position.setValue({ x: 0, y: 0 });
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) =>
        latest.current.enabled &&
        (Math.abs(gesture.dx) > 5 ||
          Math.abs(gesture.dy) > 5),

      onPanResponderGrant: () => {
        position.stopAnimation();
        setDragging(true);
        latest.current.onDragging(true);
      },

      onPanResponderMove: (_, gesture) => {
        if (latest.current.enabled) {
          position.setValue({
            x: gesture.dx,
            y: gesture.dy,
          });
        }
      },

      onPanResponderRelease: (_, gesture) => {
        const current = latest.current;

        if (current.enabled) {
          current.onDrop(
            current.startX + gesture.dx,
            current.startY + gesture.dy
          );
        }

        finishDrag();
      },

      onPanResponderTerminate: finishDrag,
      onPanResponderTerminationRequest: () => false,
    });
  }, [position]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.draggable,
        {
          left: startX - 35,
          top: startY - 35,
          zIndex: dragging ? 30 : 10,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          `Elige el ${SHAPE_NAMES[piece.shape]} ` +
          'y luego toca su contorno'
        }
        accessibilityState={{
          selected,
          disabled: !enabled,
        }}
        disabled={!enabled}
        onPress={onSelect}
        style={[
          styles.pieceButton,
          selected && styles.selectedPiece,
        ]}
      >
        <Shape
          shape={piece.shape}
          color={piece.color}
          size={60}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function SpanishShapesGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [level, setLevel] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [usedPieces, setUsedPieces] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [boardWidth, setBoardWidth] = useState(300);
  const [dragging, setDragging] = useState(false);
  const [sound, setSound] = useState(true);
  const [message, setMessage] = useState('');
  const [audioMessage, setAudioMessage] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const placements = useRef({
    slots: [] as string[],
    pieces: [] as string[],
  });

  const mounted = useRef(true);
  const focused = useRef(false);
  const foreground = useRef(true);
  const soundRef = useRef(true);
  const voice = useRef<Speech.Voice | undefined>(undefined);
  const speechRequest = useRef(0);

  const puzzle = PUZZLES[level];
  const finished = placed.length === puzzle.pieces.length;
  const stars = level + (finished ? 1 : 0);

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

    const selectedVoice =
      spain.find(
        (item) => item.quality === Speech.VoiceQuality.Enhanced
      ) ??
      spain[0] ??
      spanish[0];

    if (mounted.current) {
      voice.current = selectedVoice;
    }

    return selectedVoice;
  }, []);

  const say = useCallback(async (text: string) => {
    if (
      !mounted.current ||
      !focused.current ||
      !foreground.current ||
      !soundRef.current
    ) {
      return;
    }

    const request = ++speechRequest.current;
    setAudioMessage('');

    function canSpeak() {
      return (
        mounted.current &&
        focused.current &&
        foreground.current &&
        soundRef.current &&
        request === speechRequest.current
      );
    }

    function reportError() {
      if (canSpeak()) {
        setAudioMessage(
          'La voz no está disponible. Puedes seguir jugando con las formas.'
        );
      }
    }

    try {
      await Speech.stop();
      if (!canSpeak()) return;

      let selectedVoice = voice.current;

      if (!selectedVoice) {
        selectedVoice = await loadVoice();
      }

      if (!canSpeak()) return;

      if (!selectedVoice) {
        setAudioMessage(
          'No hay una voz en español disponible en este dispositivo. ' +
          'Puedes seguir jugando con las formas.'
        );
        return;
      }

      Speech.speak(text, {
        language: selectedVoice.language,
        voice: selectedVoice.identifier,
        rate: 0.83,
        pitch: 1,
        volume: 1,
        onError: reportError,
      });
    } catch {
      reportError();
    }
  }, [loadVoice]);

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    if (mounted.current) setPhase(next);
  }, []);

  const pause = useCallback(() => {
    void stopSpeech();

    if (phaseRef.current === 'playing') {
      changePhase('paused');

      if (mounted.current) {
        setDragging(false);
      }
    }
  }, [changePhase, stopSpeech]);

  useEffect(() => {
    mounted.current = true;
    void loadVoice().catch(() => {});

    return () => {
      mounted.current = false;
      void stopSpeech();
    };
  }, [loadVoice, stopSpeech]);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      foreground.current = isForeground();

      if (!foreground.current) pause();

      const subscription = AppState.addEventListener(
        'change',
        (state) => {
          foreground.current = state === 'active';

          if (!foreground.current) {
            pause();
          }
        }
      );

      return () => {
        focused.current = false;
        subscription.remove();
        pause();
      };
    }, [pause])
  );

  function begin(nextLevel: number) {
    if (
      !focused.current ||
      !foreground.current ||
      nextLevel < 0 ||
      nextLevel >= PUZZLES.length
    ) {
      return;
    }

    placements.current = { slots: [], pieces: [] };

    setLevel(nextLevel);
    setPlaced([]);
    setUsedPieces([]);
    setSelected(null);
    setDragging(false);
    setMessage('Arrastra una forma hasta su contorno.');
    setAudioMessage('');

    changePhase('playing');
    void say(`¡Construyamos ${PUZZLES[nextLevel].spokenName}!`);
  }

  function placePiece(source: Piece, destination: Piece) {
    const current = placements.current;

    if (
      phaseRef.current !== 'playing' ||
      !focused.current ||
      !foreground.current ||
      current.slots.includes(destination.id) ||
      current.pieces.includes(source.id)
    ) {
      return;
    }

    const shapeName = SHAPE_NAMES[source.shape];

    if (source.shape !== destination.shape) {
      setMessage('Busca un contorno con la misma forma.');
      void say(`Busca el contorno del ${shapeName}.`);
      return;
    }

    // Either train wheel can fit either circular wheel slot.
    const next = {
      slots: [...current.slots, destination.id],
      pieces: [...current.pieces, source.id],
    };

    placements.current = next;
    setPlaced(next.slots);
    setUsedPieces(next.pieces);
    setSelected(null);
    setDragging(false);

    if (next.slots.length === puzzle.pieces.length) {
      changePhase('complete');
      setMessage(`¡Has construido ${puzzle.spokenName}!`);
      void say(
        `¡Muy bien! ¡Has construido ${puzzle.spokenName}!`
      );
    } else {
      setMessage(`¡Sí! Es un ${shapeName}.`);
      void say(shapeName);
    }
  }

  function dropPiece(source: Piece, x: number, y: number) {
    if (
      phaseRef.current !== 'playing' ||
      !focused.current ||
      !foreground.current
    ) {
      return;
    }

    const candidates = puzzle.pieces
      .filter(
        (piece) =>
          piece.shape === source.shape &&
          !placements.current.slots.includes(piece.id)
      )
      .map((piece) => ({
        piece,
        distance: Math.hypot(
          x - piece.x * boardWidth,
          y - piece.y
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearest = candidates[0];

    if (
      nearest &&
      nearest.distance <= Math.max(32, nearest.piece.size * 0.5)
    ) {
      placePiece(source, nearest.piece);
    } else {
      setMessage('¡Un poco más cerca del contorno correcto!');
    }
  }

  function tapOutline(destination: Piece) {
    if (phaseRef.current !== 'playing') return;

    const source = puzzle.pieces.find(
      (piece) => piece.id === selected
    );

    if (!source) {
      setMessage(
        'Elige una forma de abajo y luego toca su contorno.'
      );
      return;
    }

    placePiece(source, destination);
  }

  function toggleSound() {
    const next = !soundRef.current;
    soundRef.current = next;

    setSound(next);
    setAudioMessage('');

    if (next && phaseRef.current === 'playing') {
      void say(`Construye ${puzzle.spokenName}.`);
    } else {
      void stopSpeech();
    }
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

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        scrollEnabled={!dragging}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <View style={styles.row}>
            <GameButton
              title="← Volver"
              onPress={goBack}
              secondary
            />

            <Text style={styles.score}>⭐ {stars}</Text>

            <GameButton
              title={sound ? 'Voz activada' : 'Voz desactivada'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>
            El taller de las formas
          </Text>

          {phase === 'ready' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🏡 🚂 🚀</Text>

              <Text style={styles.heading}>
                ¡Te toca construir!
              </Text>

              <Text style={styles.description}>
                Arrastra cada forma hasta su contorno.
                Completa las tres imágenes para ganar tres estrellas.
              </Text>

              <GameButton
                title="Empezar →"
                onPress={() => begin(0)}
              />
            </View>
          )}

          {phase === 'paused' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🧩</Text>

              <Text style={styles.heading}>
                Tu construcción te espera
              </Text>

              <GameButton
                title="Continuar →"
                onPress={() => {
                  if (
                    phaseRef.current !== 'paused' ||
                    !focused.current ||
                    !foreground.current
                  ) {
                    return;
                  }

                  changePhase('playing');
                  void say(`Construye ${puzzle.spokenName}.`);
                }}
              />

              <GameButton
                title="Empezar de nuevo"
                onPress={() => begin(0)}
                secondary
              />
            </View>
          )}

          {(phase === 'playing' || phase === 'complete') && (
            <>
              <View style={styles.clue}>
                <Text style={styles.heading}>
                  {puzzle.emoji} {puzzle.title}
                </Text>

                <Text style={styles.description}>
                  Imagen {level + 1} de {PUZZLES.length}
                  {' · '}
                  {placed.length} / {puzzle.pieces.length} formas
                </Text>
              </View>

              <View
                style={styles.board}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;

                  if (Math.abs(width - boardWidth) > 1) {
                    setDragging(false);
                    setBoardWidth(width);
                  }
                }}
              >
                <View
                  pointerEvents="none"
                  style={styles.ground}
                />

                {puzzle.id === 'train' && (
                  <View
                    pointerEvents="none"
                    style={styles.track}
                  />
                )}

                {puzzle.id === 'rocket' && (
                  <View
                    pointerEvents="none"
                    style={styles.flame}
                  >
                    <Text style={styles.flameText}>🔥</Text>
                  </View>
                )}

                {puzzle.pieces.map((piece) => {
                  const isPlaced = placed.includes(piece.id);
                  const disabled =
                    isPlaced || phase !== 'playing';

                  return (
                    <Pressable
                      key={piece.id}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityLabel={
                        `Contorno del ${SHAPE_NAMES[piece.shape]}` +
                        (isPlaced ? ', completado' : '')
                      }
                      accessibilityState={{ disabled }}
                      onPress={() => tapOutline(piece)}
                      style={[
                        styles.slot,
                        {
                          left:
                            piece.x * boardWidth - piece.size / 2,
                          top: piece.y - piece.size / 2,
                          width: piece.size,
                          height: piece.size,
                        },
                      ]}
                    >
                      <Shape
                        shape={piece.shape}
                        color={piece.color}
                        size={piece.size}
                        outline={!isPlaced}
                      />
                    </Pressable>
                  );
                })}

                <View
                  pointerEvents="none"
                  style={styles.tray}
                />

                {puzzle.pieces.map((piece, index) => {
                  if (usedPieces.includes(piece.id)) return null;

                  return (
                    <DraggablePiece
                      key={`${level}-${piece.id}-${boardWidth}`}
                      piece={piece}
                      startX={(boardWidth * (index + 0.5)) / 3}
                      startY={300}
                      selected={selected === piece.id}
                      enabled={phase === 'playing'}
                      onDragging={setDragging}
                      onSelect={() => {
                        if (phaseRef.current !== 'playing') return;

                        setSelected(piece.id);
                        setMessage(
                          `Ahora toca el contorno del ${
                            SHAPE_NAMES[piece.shape]
                          }.`
                        );

                        void say(SHAPE_NAMES[piece.shape]);
                      }}
                      onDrop={(x, y) => dropPiece(piece, x, y)}
                    />
                  );
                })}

                {finished && (
                  <View
                    pointerEvents="none"
                    style={styles.completedStars}
                  >
                    <Text style={styles.completedStarsText}>
                      ✨ ⭐ ✨
                    </Text>
                  </View>
                )}
              </View>

              <Text
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                {message}
              </Text>

              {phase === 'playing' ? (
                <>
                  <Text style={styles.hint}>
                    También puedes tocar una forma y luego su contorno.
                  </Text>

                  <GameButton
                    title="Pausa"
                    onPress={pause}
                    secondary
                  />
                </>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.heading}>
                    {level === PUZZLES.length - 1
                      ? '🏆 ¡Todas las construcciones están terminadas!'
                      : '⭐ ¡Imagen completada!'}
                  </Text>

                  {level < PUZZLES.length - 1 ? (
                    <GameButton
                      title="Siguiente imagen →"
                      onPress={() => {
                        if (phaseRef.current === 'complete') {
                          begin(level + 1);
                        }
                      }}
                    />
                  ) : (
                    <>
                      <Text style={styles.description}>
                        ¡Tres imágenes, tres estrellas!
                      </Text>

                      <GameButton
                        title="Jugar de nuevo ↻"
                        onPress={() => begin(0)}
                      />

                      <GameButton
                        title="Volver a los juegos"
                        onPress={openGames}
                        secondary
                      />
                    </>
                  )}
                </View>
              )}
            </>
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
    padding: 16,
    paddingBottom: 32,
  },
  panel: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  score: {
    fontSize: 21,
    fontWeight: '800',
    color: C.primary,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    color: C.text,
    marginVertical: 22,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
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
  card: {
    backgroundColor: C.white,
    padding: 22,
    borderRadius: 26,
    gap: 18,
  },
  hero: {
    fontSize: 45,
    textAlign: 'center',
    marginVertical: 12,
  },
  heading: {
    color: C.primary,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: C.textSecondary,
    textAlign: 'center',
  },
  clue: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: C.white,
    gap: 6,
    marginBottom: 14,
  },
  board: {
    height: 350,
    borderRadius: 26,
    backgroundColor: '#E2F3FF',
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    top: 182,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: '#D1E9C6',
  },
  track: {
    position: 'absolute',
    top: 194,
    left: 20,
    right: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8593A7',
  },
  flame: {
    position: 'absolute',
    top: 165,
    left: '50%',
    marginLeft: -15,
  },
  flameText: {
    fontSize: 30,
  },
  slot: {
    position: 'absolute',
  },
  tray: {
    position: 'absolute',
    top: 245,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  draggable: {
    position: 'absolute',
    width: 70,
    height: 70,
  },
  pieceButton: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPiece: {
    borderColor: C.primary,
    backgroundColor: C.lavender,
  },
  completedStars: {
    position: 'absolute',
    top: 279,
    left: 0,
    right: 0,
  },
  completedStarsText: {
    fontSize: 35,
    textAlign: 'center',
  },
  feedback: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: C.text,
    marginTop: 15,
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    lineHeight: 19,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  audioMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 14,
  },
});