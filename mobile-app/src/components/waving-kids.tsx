import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from 'react-native-svg';

const children = [
  {
    x: 28,
    y: 48,
    skin: '#9B6145',
    hair: '#302321',
    shirt: '#9472D4',
    hairStyle: 'curly',
  },
  {
    x: 133,
    y: 28,
    skin: '#E9AE83',
    hair: '#503126',
    shirt: '#E994A9',
    hairStyle: 'pigtails',
  },
  {
    x: 238,
    y: 48,
    skin: '#C88960',
    hair: '#292832',
    shirt: '#6EAFC5',
    hairStyle: 'short',
  },
];

export default function WavingKids() {
  const motion = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const listener = motion.addListener(({ value }) => {
      setProgress(value);
    });

    if (reduceMotion) {
      motion.setValue(0);
      return () => motion.removeListener(listener);
    }

    const animation = Animated.loop(
      Animated.timing(motion, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      motion.removeListener(listener);
      motion.setValue(0);
    };
  }, [motion, reduceMotion]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Three smiling children waving hello"
    >
      <Svg width="100%" height="100%" viewBox="0 0 360 250">
        {/* Soft background decorations */}
        <Circle cx={180} cy={116} r={108} fill="#F4EFFF" />
        <Circle cx={27} cy={49} r={7} fill="#F5CF76" />
        <Circle cx={331} cy={37} r={5} fill="#E994A9" />
        <Circle cx={342} cy={137} r={8} fill="#DFF7E2" />

        <Path
          d="M66 17 L69 25 L77 28 L69 31 L66 39 L63 31 L55 28 L63 25 Z"
          fill="#F5CF76"
        />
        <Path
          d="M293 13 L296 20 L303 23 L296 26 L293 33 L290 26 L283 23 L290 20 Z"
          fill="#9472D4"
        />

        {children.map((child, index) => {
          const angle = reduceMotion
            ? 0
            : Math.sin(progress * Math.PI * 4 + index * 0.8) * 20;

          return (
            <G
              key={child.hairStyle}
              transform={`translate(${child.x} ${child.y})`}
            >
              <Ellipse
                cx={48}
                cy={166}
                rx={37}
                ry={7}
                fill="#DDD2EF"
              />

              {/* Trousers and shoes */}
              <Rect
                x={26} y={123} width={19} height={36}
                rx={8} fill="#4C496B"
              />
              <Rect
                x={51} y={123} width={19} height={36}
                rx={8} fill="#4C496B"
              />
              <Rect
                x={20} y={150} width={25} height={13}
                rx={6} fill="#FFF8F2"
              />
              <Rect
                x={51} y={150} width={25} height={13}
                rx={6} fill="#FFF8F2"
              />

              {/* Resting arm */}
              <Path
                d="M29 82 Q15 99 19 116"
                fill="none"
                stroke={child.skin}
                strokeWidth={12}
                strokeLinecap="round"
              />

              {/* Waving arm rotates around the shoulder */}
              <G
                transform={`translate(68 82) rotate(${angle})`}
              >
                <Path
                  d="M0 0 Q18 -10 17 -34"
                  fill="none"
                  stroke={child.skin}
                  strokeWidth={12}
                  strokeLinecap="round"
                />

                <Ellipse
                  cx={17} cy={-39} rx={9} ry={11}
                  fill={child.skin}
                />

                {/* Fingers */}
                <Path
                  d="M10 -43 L7 -51
                     M15 -47 L14 -56
                     M20 -47 L22 -55
                     M24 -43 L28 -49
                     M9 -36 L3 -40"
                  fill="none"
                  stroke={child.skin}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              </G>

              {/* Shirt and neck */}
              <Rect
                x={23} y={76} width={51} height={57}
                rx={18} fill={child.shirt}
              />
              <Rect
                x={41} y={63} width={15} height={19}
                rx={7} fill={child.skin}
              />
              <Path
                d="M48 94 L51 101 L59 102 L53 107 L55 115
                   L48 111 L41 115 L43 107 L37 102 L45 101 Z"
                fill="#FFF0C9"
              />

              {/* Hair behind the face */}
              <Ellipse
                cx={48} cy={41} rx={29} ry={32}
                fill={child.hair}
              />

              {child.hairStyle === 'pigtails' && (
                <G>
                  <Ellipse
                    cx={17} cy={50} rx={12} ry={20}
                    fill={child.hair}
                  />
                  <Ellipse
                    cx={79} cy={50} rx={12} ry={20}
                    fill={child.hair}
                  />
                  <Circle cx={21} cy={37} r={5} fill="#F5CF76" />
                  <Circle cx={75} cy={37} r={5} fill="#F5CF76" />
                </G>
              )}

              {/* Ears and face */}
              <Circle cx={23} cy={47} r={6} fill={child.skin} />
              <Circle cx={73} cy={47} r={6} fill={child.skin} />
              <Ellipse
                cx={48} cy={46} rx={25} ry={27}
                fill={child.skin}
              />

              {/* Fringe */}
              <Path
                d="M23 37 Q20 9 48 12 Q77 10 74 38
                   Q62 33 53 24 Q43 36 23 37 Z"
                fill={child.hair}
              />

              {child.hairStyle === 'curly' && (
                <G fill={child.hair}>
                  <Circle cx={25} cy={25} r={10} />
                  <Circle cx={37} cy={16} r={11} />
                  <Circle cx={52} cy={14} r={11} />
                  <Circle cx={66} cy={22} r={11} />
                </G>
              )}

              {/* Eyes, cheeks and smile */}
              <Circle cx={39} cy={45} r={2.6} fill="#302321" />
              <Circle cx={58} cy={45} r={2.6} fill="#302321" />

              <Ellipse
                cx={32} cy={54} rx={5} ry={3}
                fill="#E58888" opacity={0.55}
              />
              <Ellipse
                cx={65} cy={54} rx={5} ry={3}
                fill="#E58888" opacity={0.55}
              />

              <Path
                d="M40 56 Q48 66 57 56"
                fill="none"
                stroke="#713E38"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 360 / 250,
  },
});