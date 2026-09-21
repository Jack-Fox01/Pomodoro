# Pomodoro

A gamified Pomodoro timer. Focus in sessions, take breaks, and build a habit — with a streak calendar, notes, and a levelling avatar.

## Features

- **Focus timer** — set any focus length, with a circular countdown ring.
- **Break timer** — set a break length; a "break screen" appears when focus ends.
- **Skip challenge** — abandoning a focus session early requires beating a quick game: Maths, Tiles (memory match), or a tap-to-attack Boss.
- **Break cancel** — ending a break early just asks for a yes/no confirmation.
- **Session tracking** — rate each completed session (😞 / 😐 / 🙂 / 🤩) and see it on a monthly calendar with a colour-coded quality dot.
- **Streaks** — consecutive days with logged sessions, with milestones and confetti.
- **Notes & to-dos** — a draggable, reorderable to-do list plus a freeform notes area, and per-day notes on the calendar.
- **Avatar profile** — pick a character; it levels up (XP) as you complete sessions.
- **Themes** — Dark mode and a Retro (32-bit) mode.
- **Sounds & effects** — Web Audio chimes, fanfares, and confetti (no assets needed).

## Running it

No build step and no dependencies. Just open `index.html` in a browser.

> Data is stored in the browser's `localStorage` (per device). Clearing browser data resets it.

## Roadmap

- Port to a cross-platform native app (React Native + Expo, TypeScript) using this file as the design spec.
