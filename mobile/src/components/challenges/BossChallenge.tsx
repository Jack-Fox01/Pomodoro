import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../theme/ThemeContext';

const MAX_HP = 15;

function hpColor(hp: number): string {
  if (hp > MAX_HP * 0.5) return '#3ddc97';
  if (hp > MAX_HP * 0.25) return '#ffd166';
  return '#ff5252';
}

type BossChallengeProps = {
  onComplete: () => void;
};

export function BossChallenge({ onComplete }: BossChallengeProps) {
  const { colors } = useAppTheme();
  const [hp, setHp] = useState(MAX_HP);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function attack() {
    if (hp <= 0) return;

    const next = hp - 1;
    setHp(next);
    if (next <= 0) timer.current = setTimeout(onComplete, 450);
  }

  const dead = hp <= 0;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.hpLabel, { color: colors.inkSoft }]}>
        BOSS HP {hp} / {MAX_HP}
      </Text>

      <View style={[styles.hpTrack, { backgroundColor: colors.ringTrack, borderRadius: 999 }]}>
        <View
          style={[
            styles.hpFill,
            {
              width: `${(hp / MAX_HP) * 100}%`,
              backgroundColor: hpColor(hp),
              borderRadius: 999,
            },
          ]}
        />
      </View>

      <Pressable onPress={attack} style={styles.boss}>
        <Text style={[styles.bossEmoji, dead && styles.bossDead]}>{dead ? '💀' : '👾'}</Text>
      </Pressable>

      <Text style={[styles.hint, { color: colors.inkSoft }]}>
        {dead ? 'Defeated!' : 'TAP THE BOSS TO ATTACK!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hpTrack: {
    width: '100%',
    height: 14,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
  },
  boss: {
    paddingVertical: 10,
  },
  bossEmoji: {
    fontSize: 64,
    lineHeight: 76,
  },
  bossDead: {
    opacity: 0.5,
  },
  hint: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
