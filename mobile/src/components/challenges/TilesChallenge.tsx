import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shuffle } from '../../domain/random';
import { useAppTheme } from '../../theme/ThemeContext';

const EMOJIS = ['🍅', '⏰', '🌿'];

type Tile = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

function buildTiles(): Tile[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, index) => ({
    id: index,
    emoji,
    flipped: false,
    matched: false,
  }));
}

type TilesChallengeProps = {
  onComplete: () => void;
};

export function TilesChallenge({ onComplete }: TilesChallengeProps) {
  const { colors } = useAppTheme();

  const [tiles, setTiles] = useState<Tile[]>(buildTiles);

  const firstIndex = useRef<number | null>(null);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function press(index: number) {
    if (locked.current) return;

    const tile = tiles[index];
    if (tile.flipped || tile.matched) return;


    const opened = tiles.map((t, i) => (i === index ? { ...t, flipped: true } : t));

    if (firstIndex.current === null) {
      firstIndex.current = index;
      setTiles(opened);
      return;
    }

    const first = firstIndex.current;
    firstIndex.current = null;

    if (opened[first].emoji === opened[index].emoji) {
      const matched = opened.map((t, i) =>
        i === first || i === index ? { ...t, matched: true } : t
      );
      setTiles(matched);

      if (matched.every((t) => t.matched)) {
        timer.current = setTimeout(onComplete, 400);
      }
      return;
    }

    // No match: show both, then turn them back over.
    locked.current = true;
    setTiles(opened);
    timer.current = setTimeout(() => {
      setTiles((current) =>
        current.map((t, i) => (i === first || i === index ? { ...t, flipped: false } : t))
      );
      locked.current = false;
    }, 750);
  }

  return (
    <View style={styles.grid}>
      {tiles.map((tile, index) => {
        const faceUp = tile.flipped || tile.matched;
        return (
          <Pressable
            key={tile.id}
            onPress={() => press(index)}
            style={[
              styles.tile,
              {
                backgroundColor: tile.matched ? colors.breakColor : colors.chipBg,
                borderRadius: 14,
              },
            ]}
          >
            <Text style={[styles.face, { color: tile.matched ? '#ffffff' : colors.ink }]}>
              {faceUp ? tile.emoji : '?'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  tile: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    fontSize: 30,
    fontWeight: '700',
  },
});
