import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Todo } from '../domain/types';
import { useAppTheme } from '../theme/ThemeContext';

/** Fixed row height, so a drag distance can be converted into a number of rows. */
export const TODO_ROW_HEIGHT = 48;

type TodoRowProps = {
  todo: Todo;
  index: number;
  onVanish: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
};

export function TodoRow({ todo, index, onVanish, onRemove, onReorder }: TodoRowProps) {
  const { colors } = useAppTheme();

  const [dragging, setDragging] = useState(false);
  const vanish = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;

  // The PanResponder is built once, so it must read these through refs —
  // otherwise it would close over a stale index after a reorder.
  const indexRef = useRef(index);
  indexRef.current = index;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setDragging(true),
      onPanResponderMove: (_event, gesture) => drag.setValue(gesture.dy),
      onPanResponderRelease: (_event, gesture) => {
        const shift = Math.round(gesture.dy / TODO_ROW_HEIGHT);
        drag.setValue(0);
        setDragging(false);
        if (shift !== 0) onReorderRef.current(indexRef.current, indexRef.current + shift);
      },
      onPanResponderTerminate: () => {
        drag.setValue(0);
        setDragging(false);
      },
    })
  ).current;

  function complete() {
    Animated.timing(vanish, {
      toValue: 1,
      duration: 260,
      useNativeDriver: false,
    }).start(() => onVanish(todo.id));
  }

  return (
    <Animated.View
      style={{
        opacity: vanish.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [
          {
            translateX: vanish.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }),
          },
          { scale: vanish.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) },
        ],
      }}
    >
      <Animated.View
        style={[
          styles.row,
          {
            height: TODO_ROW_HEIGHT,
            borderBottomColor: colors.line,
            transform: [{ translateY: drag }],
          },
          dragging && {
            backgroundColor: colors.chipBg,
            borderRadius: 10,
            zIndex: 10,
            elevation: 6,
          },
        ]}
      >
        <View {...responder.panHandlers} style={styles.grip}>
          <Text style={[styles.gripLabel, { color: colors.inkSoft }]}>≡</Text>
        </View>

        <Pressable
          accessibilityLabel="Complete task"
          onPress={complete}
          style={[
            styles.check,
            { borderColor: colors.line, borderRadius: 7 },
          ]}
        />

        <Text style={[styles.text, { color: colors.ink }]} numberOfLines={2}>
          {todo.text}
        </Text>

        <Pressable
          accessibilityLabel="Delete task"
          onPress={() => {
            onRemove(todo.id);
          }}
          style={styles.delete}
        >
          <Text style={[styles.deleteLabel, { color: colors.inkSoft }]}>✕</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  grip: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gripLabel: {
    fontSize: 18,
    lineHeight: 22,
  },
  check: {
    width: 22,
    height: 22,
    borderWidth: 2,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
  delete: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  deleteLabel: {
    fontSize: 16,
  },
});
