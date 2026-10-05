export const QUOTES = [
  '“The secret of getting ahead is getting started.” — Mark Twain',
  '“Focus on being productive instead of busy.” — Tim Ferriss',
  '“It always seems impossible until it\'s done.” — Nelson Mandela',
  '“You don\'t have to be great to start, but you have to start to be great.” — Zig Ziglar',
  '“Success is the sum of small efforts, repeated day in and day out.” — Robert Collier',
  '“Do the hard work first. The easy work will take care of itself.” — Dale Carnegie',
  '“Concentrate all your thoughts upon the work in hand.” — Alexander Graham Bell',
  '“The best time to plant a tree was 20 years ago. The second best time is now.” — Proverb',
  '“Small daily improvements are the key to staggering long-term results.” — Robin Sharma',
  '“Amateurs sit and wait for inspiration. The rest of us just get up and go to work.” — Stephen King',
  '“Motivation gets you going, but discipline keeps you growing.” — John C. Maxwell',
  '“You will never always be motivated, so you must learn to be disciplined.” — Jim Rohn',
  '“Starve your distractions, feed your focus.” — Unknown',
  '“The way to get started is to quit talking and begin doing.” — Walt Disney',
  '“What gets measured gets managed.” — Peter Drucker',
  '“Discipline is choosing between what you want now and what you want most.” — Abraham Lincoln',
  '“You are what you repeatedly do. Excellence, then, is not an act, but a habit.” — Will Durant',
  '“Don\'t watch the clock; do what it does. Keep going.” — Sam Levenson',
];

let lastIndex = -1;

/** A quote, never the same one twice in a row. */
export function pickQuote(): string {
  let index = lastIndex;
  while (QUOTES.length > 1 && index === lastIndex) {
    index = Math.floor(Math.random() * QUOTES.length);
  }
  lastIndex = index;
  return QUOTES[index];
}
