import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LearningColors as C } from '@/constants/learning-theme';

type LetterProps = {
  letter: string;
  color: string;
  index: number;
  moving: boolean;
};

function JumpingLetter({
  letter,
  color,
  index,
  moving,
}: LetterProps) {
  const jump = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(jump);
    jump.value = 0;

    if (moving) {
      jump.value = withDelay(
        index * 350,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 350,
              easing: Easing.out(Easing.quad),
            }),
            withTiming(0, {
              duration: 350,
              easing: Easing.in(Easing.quad),
            }),
            withTiming(0, { duration: 1500 })
          ),
          -1,
          false
        )
      );
    }

    return () => cancelAnimation(jump);
  }, [jump, index, moving]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -24 * jump.value },
      { rotate: `${(index === 1 ? -7 : 7) * jump.value}deg` },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.12 - jump.value * 0.06,
    transform: [{ scaleX: 1 - jump.value * 0.25 }],
  }));

  return (
    <View style={styles.letterSlot}>
      <Animated.View
        style={[
          styles.letterCard,
          { backgroundColor: color },
          characterStyle,
        ]}
      >
        <Text style={styles.letter}>{letter}</Text>

        <View style={styles.eyes}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>

        <View style={styles.smile} />
        <View style={styles.cheekLeft} />
        <View style={styles.cheekRight} />
      </Animated.View>

      <Animated.View style={[styles.shadow, shadowStyle]} />
    </View>
  );
}

export default function AnimatedAlphabet() {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(
    AppState.currentState === 'active'
  );

  const reducedMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
    });

    return () => subscription.remove();
  }, []);

  const moving = focused && active && !reducedMotion;

  return (
    <View
      style={styles.scene}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Three smiling alphabet characters: A, B and C"
    >
      <View style={styles.backdrop} />

      <Text style={styles.starLeft}>✦</Text>
      <Text style={styles.starRight}>✧</Text>
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <View style={styles.letters}>
        <JumpingLetter
          letter="A"
          color={C.yellow}
          index={0}
          moving={moving}
        />
        <JumpingLetter
          letter="B"
          color={C.blue}
          index={1}
          moving={moving}
        />
        <JumpingLetter
          letter="C"
          color={C.green}
          index={2}
          moving={moving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backdrop: {
    position: 'absolute',
    width: '94%',
    height: 140,
    borderRadius: 75,
    backgroundColor: C.lavender,
    opacity: 0.55,
  },
  letters: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  letterSlot: {
    flex: 1,
    maxWidth: 88,
  },
  letterCard: {
    height: 112,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  letter: {
    fontSize: 46,
    lineHeight: 54,
    fontWeight: '900',
    color: C.primary,
  },
  eyes: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 2,
    height: 8,
    alignItems: 'center',
  },
  eye: {
    width: 5,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.text,
  },
  smile: {
    width: 14,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: C.text,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 4,
  },
  cheekLeft: {
    position: 'absolute',
    left: '19%',
    bottom: 23,
    width: 9,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E994A9',
    opacity: 0.65,
  },
  cheekRight: {
    position: 'absolute',
    right: '19%',
    bottom: 23,
    width: 9,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E994A9',
    opacity: 0.65,
  },
  shadow: {
    alignSelf: 'center',
    width: '65%',
    height: 8,
    borderRadius: 20,
    backgroundColor: C.primary,
    marginTop: 10,
  },
  starLeft: {
    position: 'absolute',
    left: '4%',
    top: 6,
    fontSize: 28,
    color: C.primary,
  },
  starRight: {
    position: 'absolute',
    right: '3%',
    bottom: 8,
    fontSize: 30,
    color: '#B17912',
  },
  circleLeft: {
    position: 'absolute',
    left: '3%',
    bottom: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6EAFC5',
  },
  circleRight: {
    position: 'absolute',
    right: '7%',
    top: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E994A9',
  },
});