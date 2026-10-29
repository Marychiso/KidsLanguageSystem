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
  name: string;
  emoji: string;
  pieces: Piece[];
};

const PUZZLES: Puzzle[] = [
  {
    name: 'House',
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
    name: 'Train',
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
    name: 'Rocket',
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
  const fill = outline ? '#FFFFFF' : color;
  const stroke = outline ? '#8395AF' : '#42516B';
  const dash = outline ? '6 5' : undefined;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'circle' && (
        <Circle
          cx="50"
          cy="50"
          r="45"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={dash}
        />
      )}

      {shape === 'square' && (
        <Rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="8"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={dash}
        />
      )}

      {shape === 'triangle' && (
        <Polygon
          points="50,5 96,94 4,94"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeDasharray={dash}
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

function DraggablePiece({
  piece,
  startX,
  startY,
  selected,
  enabled,
  onSelect,
  onDrop,
  onDragging,
}: {
  piece: Piece;
  startX: number;
  startY: number;
  selected: boolean;
  enabled: boolean;
  onSelect: () => void;
  onDrop: (x: number, y: number) => boolean;
  onDragging: (dragging: boolean) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);

  // Keep responder callbacks connected to the current puzzle.
  const latest = useRef({
    enabled,
    startX,
    startY,
    onSelect,
    onDrop,
    onDragging,
  });

  latest.current = {
    enabled,
    startX,
    startY,
    onSelect,
    onDrop,
    onDragging,
  };

  function finishDrag() {
    setDragging(false);
    latest.current.onDragging(false);
    position.setValue({ x: 0, y: 0 });
  }

  const responder = useRef(
    PanResponder.create({
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
        if (latest.current.enabled) {
          latest.current.onDrop(
            latest.current.startX + gesture.dx,
            latest.current.startY + gesture.dy,
          );
        }

        finishDrag();
      },

      onPanResponderTerminate: finishDrag,

      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

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
        accessibilityLabel={`Select ${piece.shape}, then tap its outline`}
        accessibilityState={{ selected, disabled: !enabled }}
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

export default function ShapesGame() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [level, setLevel] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [boardWidth, setBoardWidth] = useState(300);
  const [dragging, setDragging] = useState(false);
  const [sound, setSound] = useState(true);
  const [message, setMessage] = useState('');

  const phaseRef = useRef<Phase>('ready');
  const placedRef = useRef<string[]>([]);
  const focused = useRef(false);
  const soundRef = useRef(true);
  const voice = useRef<string | undefined>(undefined);

  const puzzle = PUZZLES[level];
  const finished = placed.length === puzzle.pieces.length;
  const stars = level + (finished ? 1 : 0);

  const stopSpeech = useCallback(() => {
    void Speech.stop().catch(() => {});
  }, []);

  const say = useCallback(
    (text: string) => {
      stopSpeech();

      if (!focused.current || !soundRef.current) {
        return;
      }

      try {
        Speech.speak(text, {
          language: 'en-GB',
          rate: 0.88,
          ...(voice.current ? { voice: voice.current } : {}),
        });
      } catch {
        // Visual instructions remain available without narration.
      }
    },
    [stopSpeech],
  );

  function changePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    let active = true;

    void Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const preferred =
          voices.find((item) =>
            item.name
              .toLowerCase()
              .includes('google uk english female'),
          ) ??
          voices.find(
            (item) =>
              item.language.toLowerCase().replace('_', '-') ===
              'en-gb',
          );

        if (active) {
          voice.current = preferred?.identifier;
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;

      return () => {
        focused.current = false;
        stopSpeech();

        if (phaseRef.current === 'playing') {
          phaseRef.current = 'paused';
          setPhase('paused');
          setDragging(false);
        }
      };
    }, [stopSpeech]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state !== 'active' && focused.current) {
          stopSpeech();

          if (phaseRef.current === 'playing') {
            phaseRef.current = 'paused';
            setPhase('paused');
            setDragging(false);
          }
        }
      },
    );

    return () => subscription.remove();
  }, [stopSpeech]);

  function begin(nextLevel: number) {
    stopSpeech();
    placedRef.current = [];

    setLevel(nextLevel);
    setPlaced([]);
    setSelected(null);
    setDragging(false);
    setMessage('Drag a shape into its outline.');

    changePhase('playing');
    say(`Let's build a ${PUZZLES[nextLevel].name.toLowerCase()}!`);
  }

  function placePiece(source: Piece, destination: Piece) {
    if (
      phaseRef.current !== 'playing' ||
      placedRef.current.includes(destination.id)
    ) {
      return false;
    }

    if (source.shape !== destination.shape) {
      setMessage('Try an outline with the same shape.');
      say(`Find the ${source.shape} outline.`);
      return false;
    }

    // Identical pieces, such as train wheels, are interchangeable.
    const next = [...placedRef.current, destination.id];

    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    setDragging(false);

    if (next.length === puzzle.pieces.length) {
      changePhase('complete');
      setMessage(`You built a ${puzzle.name.toLowerCase()}!`);
      say(`Wonderful! You built a ${puzzle.name.toLowerCase()}!`);
    } else {
      setMessage(`Yes! That is a ${source.shape}.`);
      say(source.shape);
    }

    return true;
  }

  function dropPiece(source: Piece, x: number, y: number) {
    const candidates = puzzle.pieces
      .filter(
        (piece) =>
          piece.shape === source.shape &&
          !placedRef.current.includes(piece.id),
      )
      .map((piece) => ({
        piece,
        distance: Math.hypot(
          x - piece.x * boardWidth,
          y - piece.y,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearest = candidates[0];

    if (
      nearest &&
      nearest.distance <= Math.max(32, nearest.piece.size * 0.5)
    ) {
      return placePiece(source, nearest.piece);
    }

    setMessage('A little closer to the matching outline!');
    return false;
  }

  function tapOutline(destination: Piece) {
    const source = puzzle.pieces.find(
      (piece) => piece.id === selected,
    );

    if (!source) {
      setMessage('Choose a shape below, then tap its outline.');
      return;
    }

    placePiece(source, destination);
  }

  function toggleSound() {
    const next = !soundRef.current;

    soundRef.current = next;
    setSound(next);
    stopSpeech();

    if (next && phaseRef.current === 'playing') {
      say(`Build a ${puzzle.name.toLowerCase()}.`);
    }
  }

  function goBack() {
    stopSpeech();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/mary/categories',
        params: { language: 'english', activity: 'games' },
      });
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
            <GameButton title="← Back" onPress={goBack} secondary />

            <Text style={styles.score}>⭐ {stars}</Text>

            <GameButton
              title={sound ? 'Voice on' : 'Voice off'}
              onPress={toggleSound}
              secondary
            />
          </View>

          <Text style={styles.title}>Shape Builders</Text>

          {phase === 'ready' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🏡 🚂 🚀</Text>
              <Text style={styles.heading}>Let’s build!</Text>

              <Text style={styles.description}>
                Drag the shapes into their outlines.
                Build three pictures and collect three stars.
              </Text>

              <GameButton
                title="Start building →"
                onPress={() => begin(0)}
              />
            </View>
          )}

          {phase === 'paused' && (
            <View style={styles.card}>
              <Text style={styles.hero}>🧩</Text>
              <Text style={styles.heading}>Your building is waiting</Text>

              <GameButton
                title="Keep building →"
                onPress={() => changePhase('playing')}
              />

              <GameButton
                title="Start again"
                onPress={() => begin(0)}
                secondary
              />
            </View>
          )}

          {(phase === 'playing' || phase === 'complete') && (
            <>
              <View style={styles.clue}>
                <Text style={styles.heading}>
                  {puzzle.emoji} {puzzle.name}
                </Text>

                <Text style={styles.description}>
                  Picture {level + 1} of {PUZZLES.length}
                  {' · '}
                  {placed.length} / {puzzle.pieces.length} shapes
                </Text>
              </View>

              <View
                style={styles.board}
                onLayout={(event) => {
                  setBoardWidth(event.nativeEvent.layout.width);
                }}
              >
                <View pointerEvents="none" style={styles.ground} />

                {puzzle.name === 'Train' && (
                  <View pointerEvents="none" style={styles.track} />
                )}

                {puzzle.name === 'Rocket' && (
                  <Text pointerEvents="none" style={styles.flame}>
                    🔥
                  </Text>
                )}

                {puzzle.pieces.map((piece) => {
                  const isPlaced = placed.includes(piece.id);

                  return (
                    <Pressable
                      key={piece.id}
                      disabled={isPlaced || phase !== 'playing'}
                      accessibilityRole="button"
                      accessibilityLabel={`${piece.shape} outline`}
                      onPress={() => tapOutline(piece)}
                      style={[
                        styles.slot,
                        {
                          left: piece.x * boardWidth - piece.size / 2,
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

                <View pointerEvents="none" style={styles.tray} />

                {puzzle.pieces.map((piece, index) => {
                  if (placed.includes(piece.id)) {
                    return null;
                  }

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
                        setSelected(piece.id);
                        setMessage(
                          `Now tap a ${piece.shape} outline.`,
                        );
                        say(piece.shape);
                      }}
                      onDrop={(x, y) => dropPiece(piece, x, y)}
                    />
                  );
                })}

                {finished && (
                  <Text
                    pointerEvents="none"
                    style={styles.completedStars}
                  >
                    ✨ ⭐ ✨
                  </Text>
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
                    You can also tap a shape, then tap its outline.
                  </Text>

                  <GameButton
                    title="Pause"
                    secondary
                    onPress={() => {
                      stopSpeech();
                      changePhase('paused');
                    }}
                  />
                </>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.heading}>
                    {level === PUZZLES.length - 1
                      ? '🏆 Master builder!'
                      : '⭐ Picture complete!'}
                  </Text>

                  {level < PUZZLES.length - 1 ? (
                    <GameButton
                      title="Next picture →"
                      onPress={() => begin(level + 1)}
                    />
                  ) : (
                    <>
                      <Text style={styles.description}>
                        Three pictures. Three stars!
                      </Text>

                      <GameButton
                        title="Build again ↻"
                        onPress={() => begin(0)}
                      />

                      <GameButton
                        title="Back to games"
                        onPress={goBack}
                        secondary
                      />
                    </>
                  )}
                </View>
              )}
            </>
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
});