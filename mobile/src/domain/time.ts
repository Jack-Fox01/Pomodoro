export function formatClock(totalSeconds: number) : string{
    const safe = Math.max(0, Math.floor(totalSeconds)); // what does this do
    const minutes = Math.floor(safe / 60); // what does this do
    const seconds = safe % 60; // what does this do
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
} // this function changes seconds to 'mm:ss'

