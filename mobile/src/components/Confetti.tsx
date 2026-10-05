import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const COLORS = ['#e8553f', '#2f9e7f', '#f2b23c', '#a3c94f', '#6f8ef2', '#e887c2'];

const SCREEN_HEIGHT = Dimensions.get('window').height;

type ConfettiProps = {
  count?: number;
  onDone: () => void;
};

type Piece = {
  left: number;
  color: string;
  width: number;
  height: number;
  delay: number;
  duration: number;
  spin: number;
  anim: Animated.Value;
};

/**
 * Mount this to play a burst of falling confetti; it calls `onDone` when
 * everything has landed so the parent can unmount it.
 */
export function Confetti({ count = 80, onDone }: ConfettiProps) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: Math.random() * 6 + 6,
        height: Math.random() * 10 + 8,
        delay: Math.random() * 500,
        duration: 1600 + Math.random() * 1200,
        spin: Math.random() * 720 - 360,
        anim: new Animated.Value(0),
      })),
    [count]
  );

  // Keep the callback out of the dependency list so the burst never restarts.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const animations = pieces.map((piece) =>
      Animated.timing(piece.anim, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start(() => onDoneRef.current());
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.piece,
            {
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              opacity: piece.anim.interpolate({
                inputRange: [0, 0.75, 1],
                outputRange: [1, 1, 0],
              }),
              transform: [
                {
                  translateY: piece.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, SCREEN_HEIGHT],
                  }),
                },
                {
                  rotate: piece.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${piece.spin}deg`],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
