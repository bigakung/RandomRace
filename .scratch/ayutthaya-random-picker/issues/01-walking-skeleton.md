# 01 — Walking skeleton: Roster in, fair Winner out

**What to build:** A runnable static app where the user adds names (typing + Enter, or pasting multiple lines), presses "เริ่มแข่ง / START RACE", and sees the fairly drawn **Winner** with their number as plain text. No Race animation yet. Establishes the project tooling, the `random` utility and the `PickerSession` seam that every later ticket builds on. See spec: docs/spec/ayutthaya-random-picker.md and ADR-0001.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Vite + React + TypeScript (strict) project; `npm install`, `npm run dev`, `npm run build`, `npm test`, `npm run lint` and typecheck scripts all work
- [x] Vite base is relative so the build works under a sub-path
- [x] Thai fonts self-hosted via `@fontsource` (display face + Sarabun); no external font/image URLs
- [x] Feature-based structure; single Thai copy module; logic in pure modules, React only renders/dispatches
- [x] `randomInt` uses `crypto.getRandomValues` with rejection sampling (no modulo bias), falls back to `Math.random` if crypto is missing; shared `Rng` interface injectable for tests
- [x] `PickerSession` (pure, RNG + time injected) supports adding/pasting names and `start`, drawing exactly one Winner before anything else happens
- [x] Start with fewer than 2 Participants is refused with a clear Thai message, no crash
- [x] Tests: randomInt bounds (incl. single-value range), uniform distribution within tolerance over 10k+ draws, crypto fallback; Winner is always a Roster Participant; exactly one Winner; 2 and 50 Participants

**Notes:** Time injection into `PickerSession` is deferred to 03, where the first time-driven phase (countdown) appears. Not committed — the folder is not a git repo yet.
