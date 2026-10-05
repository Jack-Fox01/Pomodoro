import { useState } from 'react';

import { pickOne } from '../../domain/random';
import type { ChallengeType } from '../../domain/types';
import { ChallengeModal } from '../ChallengeModal';
import { BossChallenge } from './BossChallenge';
import { MathChallenge } from './MathChallenge';
import { TilesChallenge } from './TilesChallenge';

type ResolvedChallenge = 'math' | 'tiles' | 'boss';

const ALL: ResolvedChallenge[] = ['math', 'tiles', 'boss'];

const COPY: Record<ResolvedChallenge, { title: string; hint: string }> = {
  math: { title: 'Solve 3 maths problems', hint: 'Answer correctly to skip this session' },
  tiles: { title: 'Match all the pairs', hint: 'Find every matching pair to skip this session' },
  boss: { title: 'Defeat the boss!', hint: 'Tap fast to skip this session' },
};

type ChallengeGameProps = {
  type: ChallengeType;
  onComplete: () => void;
  onCancel: () => void;
};

/**
 * Picks which game to play. 'random' is resolved exactly once, on mount —
 * a re-render must never swap the game out from under the player.
 */
export function ChallengeGame({ type, onComplete, onCancel }: ChallengeGameProps) {
  const [resolved] = useState<ResolvedChallenge>(() =>
    type === 'random' ? pickOne(ALL) : type
  );

  const copy = COPY[resolved];

  return (
    <ChallengeModal title={copy.title} hint={copy.hint} onCancel={onCancel}>
      {resolved === 'math' && <MathChallenge onComplete={onComplete} />}
      {resolved === 'tiles' && <TilesChallenge onComplete={onComplete} />}
      {resolved === 'boss' && <BossChallenge onComplete={onComplete} />}
    </ChallengeModal>
  );
}
