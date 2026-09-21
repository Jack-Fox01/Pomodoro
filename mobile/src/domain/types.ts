export type Phase = 'focus' | 'break';

export type Session = {
    date: string;
    phase: Phase;
    seconds: number;
    completedAt: number;
    skipped: boolean;
}