# Spec: Ayutthaya Random Picker

Labels: `ready-for-agent`

Vocabulary follows [CONTEXT.md](../../CONTEXT.md). Respects [ADR-0001](../adr/0001-winner-drawn-before-race.md).

> **Update:** the Race rendering, Theme art and camera parts of this spec are superseded by [the 3D upgrade spec](./3d-upgrade.md) and [ADR-0002](../adr/0002-3d-renderer-with-2d-fallback.md). The 2D canvas renderer remains as the WebGL fallback. Everything else here still applies.

## Problem Statement

Teachers, event hosts and anyone running a lucky draw need to pick one person from a list fairly, in front of an audience, in a way that is fun to watch. Plain random pickers are dull and look untrustworthy; existing race-style pickers are generic and not rooted in Thai culture. The user wants to paste a list of names, press one button, and have the room watch a short, exciting reveal whose outcome is genuinely random and cannot be steered.

## Solution

A single-page static web app, fully in Thai with bilingual primary buttons. The user builds a **Roster** of 2–50 **Participants**, picks a **Race Duration**, and presses "เริ่มแข่ง / START RACE". The **Winner** is drawn with a cryptographically strong, unbiased random draw *before* anything moves. A 3-2-1-GO countdown follows, then every Participant appears as a traditional Thai boat (the **Vehicle** of the Ayutthaya **Theme**) racing in its own **Lane** on a river in front of old Ayutthaya — temples, chedi, city walls, Thai houses, trees and flags. Boats overtake each other convincingly, and the pre-drawn Winner always crosses the finish line first at exactly the chosen Race Duration. A celebration screen then names the Winner (with their number), and the user can play again, edit names, or start fresh. Everything works offline once loaded, respects reduced-motion settings, and remembers the last Roster and settings.

## User Stories

### Building the Roster
1. As a teacher, I want to type a name and press Enter to add it, so that I can build the Roster quickly.
2. As a teacher, I want to paste a multi-line list of names into the add field, so that I can import a whole class at once.
3. As a user, I want pasted text to be split by line, trimmed, and stripped of blank lines, so that messy clipboard content still produces a clean Roster.
4. As a user, I want to be told how many names were dropped when a paste would exceed 50 Participants, so that I understand why some names are missing.
5. As a user, I want only the first 50 Participants kept when I exceed the limit, so that the app never refuses my whole paste.
6. As a user, I want to edit a Participant's name in place, so that I can fix typos without deleting and re-adding.
7. As a user, I want to delete a single Participant, so that I can remove someone who is absent.
8. As a user, I want a "clear all" action, so that I can start a completely new list.
9. As a user, I want each Participant shown with its number (#1, #2, …), so that I can tell people apart.
10. As a user, I want duplicate names flagged with a small "ชื่อซ้ำ" badge without being blocked, so that two students with the same name can both take part and I know it.
11. As a user, I want an edit that leaves a name empty to be rejected with a clear message, so that the Roster never contains blank Participants.
12. As a user, I want to see how many Participants I have and the 2–50 limit, so that I know whether I can start.
13. As a user, I want the start button disabled with an explanation when there are fewer than 2 Participants, so that I understand what to do next.
14. As a user, I want an empty-state hint when the Roster is empty, so that I know where to begin within seconds of opening the page.

### Settings
15. As a user, I want to choose a Race Duration from presets (5 s, 10 s, 30 s, 1 min, 2 min, 5 min), so that I can match the reveal to the mood of the room.
16. As a user, I want Race Duration to default to 10 seconds, so that the first Race is short and snappy.
17. As a user, I want a sound on/off toggle that is off by default, so that the app never blares unexpectedly and the browser never blocks it.
18. As a user, I want my Roster, Race Duration, sound setting and Theme remembered across reloads, so that I don't retype my class every lesson.

### Racing
19. As a user, I want the Winner decided by a fair random draw before the animation starts, so that the result cannot be influenced by the animation, device speed or frame rate.
20. As a user, I want every Participant to have an equal chance in every Race, so that the draw is fair.
21. As a user, I want a 3-2-1-GO countdown, so that the audience knows the Race is about to begin.
22. As a user, I want each Participant to appear as a colourful traditional Thai boat in its own Lane, so that everyone can find themselves.
23. As a user, I want boats to move at slightly different, varying speeds and overtake each other, so that the Race feels real and suspenseful.
24. As a user, I want longer Race Durations to have proportionally more lead changes, so that a 5-minute Race stays exciting.
25. As a user, I want boats never to jump or teleport, so that the Race looks believable.
26. As a user, I want the pre-drawn Winner to always cross the finish line first, exactly at the chosen Race Duration, so that the visualisation matches the draw.
27. As a user with many Participants, I want all Lanes visible on one screen without scrolling, so that I never miss the finish.
28. As a user with many Participants, I want names shortened to numbers on the boats when Lanes are narrow and a live "top 3 leaders" panel shown, so that the Race is still readable.
29. As a mobile user, I want the river to fit my screen and adapt when I rotate or resize, so that the Race looks good on any device.
30. As a user on a high-DPI screen, I want crisp graphics and text, so that the Race looks polished.
31. As a user, I want a gentle living background — rippling water, slow clouds, waving flags, bobbing boats, light particles — so that the scene feels like old Ayutthaya without slowing my device.
32. As a user, I want a "ข้ามไปดูผล ⏭" button (and Esc) during the countdown and Race, so that I can jump to the result of a long Race.
33. As a user, I want skipping to reveal the same Winner that was already drawn, so that skipping cannot change the outcome.
34. As an audience member, I want there to be no way to cancel a Race midway and re-roll, so that the host cannot secretly steer the result.
35. As a user, I want the Roster and settings locked while a Race is in progress, so that nothing changes mid-Race.

### Result
36. As a user, I want a celebration screen showing "🏆 ผู้ชนะ" with the Winner's name and number, so that everyone knows exactly who won, even with duplicate names.
37. As a user, I want a spotlight, confetti and golden particles on the result, so that the moment feels special.
38. As a user, I want "แข่งอีกครั้ง / PLAY AGAIN" to run a new Race with the same Roster and a fresh independent draw, so that I can pick again quickly.
39. As a user, I understand the same Participant may win twice in a row, so that every draw stays truly fair.
40. As a user, I want "แก้ไขรายชื่อ / EDIT NAMES" to return to the Roster with all names intact, so that I can remove the Winner or adjust the list.
41. As a user, I want "เริ่มใหม่ / NEW RACE" to clear the Roster after I confirm, so that I can start a new group without losing my list by accident.

### Sound
42. As a user with sound on, I want a tick on each countdown number, a gong at GO, a soft Thai-style looping rhythm during the Race and a flourish for the Winner, so that the Race feels lively.
43. As a user, I want to toggle sound at any time, including mid-Race, so that I can silence it instantly.

### Accessibility
44. As a keyboard user, I want every control reachable and operable by keyboard with a visible focus ring, so that I can run the app without a mouse.
45. As a screen-reader user, I want meaningful labels on all controls and the Winner announced, so that I know the result.
46. As a user with reduced motion enabled, I want the Race skipped — a plain countdown, then a still scene with the Winner at the finish and the result shown immediately without confetti or moving background — so that I still get the result without motion.
47. As a user with reduced motion, I want a short note explaining that the result is shown immediately, so that I understand why there is no Race.

### Robustness
48. As a user, I want the app to keep working when localStorage is unavailable or holds corrupted data, so that private browsing or old data never breaks it.
49. As a user, I want clear Thai error messages instead of crashes for empty input, a single name, or odd pasted content, so that I always know what to do.
50. As a user, I want the app to work offline once loaded, including fonts, so that a poor classroom connection doesn't matter.

### Future themes
51. As a future developer, I want to add a new Theme (elephant, Muay Thai, Songkran, Loy Krathong) by supplying scenery, Vehicle art, colours and wording only, so that I never need to touch the Race Engine or draw logic.
52. As a future developer, I want the stored Theme to fall back to Ayutthaya if it no longer exists, so that removing a Theme never breaks returning users.

## Implementation Decisions

- **Static SPA**: React + TypeScript (strict) + Vite, HTML5 Canvas for the Race, plain CSS. No backend, no router. Vite `base` is relative so one build deploys unchanged to GitHub Pages (sub-path), Cloudflare Pages or Vercel. No deployment config or CI workflow is added now; deploy steps live in the README.
- **Dependencies**: only React, and self-hosted Thai fonts via `@fontsource` (a traditional display face such as Charm/Chonburi for headings, Sarabun for body). Dev tooling: Vitest, ESLint (flat config). No animation, audio, confetti or state libraries.
- **Feature-based structure**: `picker` (Roster building), `race` (engine, session, renderer bridge), `result` (celebration), `theme` (ThemeConfig, registry, Ayutthaya renderer and procedural art), `sound`, plus shared `utils` (random, storage) and a single Thai copy module. Business logic lives in pure modules; React components only render and dispatch.
- **Random utility**: `randomInt(min, max, source?)` using `crypto.getRandomValues` with rejection sampling to eliminate modulo bias; falls back to `Math.random` only if crypto is unavailable. Also exposes a seedable RNG shape so the engine and tests share one `Rng` interface. Every Race draws independently; there is no "don't repeat last Winner" rule.
- **Roster module** (pure): parses pasted text (split on any newline style, trim, drop blanks, cap at 50 and report how many were dropped), validates edits (no empty names), numbers Participants by position, and flags duplicate names. Participants are identified by position number, not name; numbers renumber when an earlier Participant is removed.
- **Race Engine** (pure, no React/DOM/Canvas): given Lane count, Winner index, Race Duration and an `Rng`, builds a **RacePlan** before the countdown. `progressAt(t)` returns each Lane's progress in 0…1 for elapsed time t. The plan is time-based (not frame-based): per-Lane base speed + random variation + small wave, a number of surges/lead changes that scales with Race Duration (roughly one every 3–6 s), the Winner reaching 1.0 exactly at Race Duration, and every other Lane clamped below 1.0 up to that moment. Progress is continuous and monotonic non-decreasing (no teleport). The engine knows nothing about boats or themes.
- **PickerSession** (pure state machine, the primary seam): owns phase (`input → preparing → countdown → racing → finished → result`; see [ADR-0003](../adr/0003-countdown-waits-for-stage-ready.md) for `preparing`), Roster, Race Duration, validation errors, the drawn Winner and the current RacePlan. Actions: set/edit/remove/clear Roster entries, paste text, set Race Duration, start, stageReady(now), tick(now), skip, playAgain, editNames, newRace (confirmation is a UI concern; the action itself clears). Time and RNG are injected. Start is refused with a readable error for fewer than 2 Participants. Skip jumps to finished with the same Winner, from `preparing`, `countdown` or `racing`. There is no cancel action (ADR-0001). Reduced motion is an input to start: the session goes countdown → finished directly.
- **Theme abstraction**: `ThemeConfig` = id, display name, palette (UI colours + a cyclic list of Vehicle colours), copy (e.g. scene title "กรุงศรีอยุธยา"), and a **ThemeRenderer** with draw hooks for background (static layer + ambient animation), Vehicle, finish line, and celebration. Themes live in a registry keyed by id; the stored id falls back to `ayutthaya`. No theme picker UI until a second Theme exists. Art is procedural Canvas drawing kept in theme-specific modules separate from logic, so it can later be swapped for image assets.
- **Canvas renderer bridge**: a hook owns one `requestAnimationFrame` loop that reads the session's RacePlan and elapsed time directly and calls the active ThemeRenderer — React state is only updated on phase changes, not per frame. Canvas is sized to its container with `ResizeObserver` and scaled by `devicePixelRatio` (capped for performance). Static scenery is pre-rendered to an offscreen layer and redrawn only on resize. Lane height is derived from Lane count; below a readability threshold names are replaced by numbers on the boats and a live top-3 panel is shown. Fonts are awaited (`document.fonts.ready`) before the first draw.
- **Sound**: a `SoundManager` interface with `play(cue)` / `startLoop()` / `stopLoop()` / `setEnabled()` for cues `countdown`, `start`, `race`, `winner`. The implementation synthesises tones with the Web Audio API (ticks, gong, pentatonic ranat-style loop, winner flourish); the AudioContext is created only after a user gesture enables sound. The interface allows a file-based implementation later. Default is off.
- **Persistence**: one storage adapter wrapping localStorage under a versioned key, storing Roster names, Race Duration, sound enabled and theme id. All reads/writes are try/catch; invalid or corrupted data is discarded field-by-field and replaced with defaults. Saves are debounced on Roster edits.
- **UI**: single responsive page, mobile-first. Hierarchy Title → Roster → Race Duration → prominent Start → Race → Winner. Thai primary copy; primary buttons show Thai large with English small (เริ่มแข่ง / START RACE, แข่งอีกครั้ง / PLAY AGAIN, แก้ไขรายชื่อ / EDIT NAMES, เริ่มใหม่ / NEW RACE). Warm, cinematic, playful Ayutthaya styling (gold, terracotta, deep river teal), never an admin-panel look. Sound toggle in the top corner. NEW RACE uses a confirmation dialog. Winner announced through an `aria-live` region. Reduced motion is read from `prefers-reduced-motion` only (no in-app toggle), and also disables CSS celebration effects.

## Testing Decisions

- Good tests exercise external behaviour through the highest seam and never assert on internal structure (plan internals, private helpers, render calls). Randomness and time are injected so tests are deterministic.
- **Primary seam — PickerSession** (covers roster, engine and winner selection together):
  - Winner is always a Participant of the Roster; exactly one Winner per Race.
  - Race reaches finished; `tick` past Race Duration always finishes; skip finishes with the same Winner.
  - For many seeds and Roster sizes (2 and 50 included), sampling `progressAt` across the Race: no Lane reaches the finish before the Winner, the Winner reaches it at Race Duration, progress is continuous and non-decreasing (bounded per-step delta = no teleport), and at least one lead change occurs for longer durations.
  - playAgain keeps the Roster and performs a new draw (different injected RNG output → different Winner); editNames keeps the Roster; newRace clears it.
  - Validation: fewer than 2 refused with message; empty-name edits rejected; paste trimming/blank removal; >50 capped with dropped count; duplicate names kept, numbered distinctly and flagged.
  - Reduced motion: start goes to finished without racing and with a valid Winner.
- **Secondary seam — random utility**: bounds inclusive for many ranges, single-value range, distribution of 10k+ draws within tolerance of uniform (no modulo bias), fallback path when crypto is missing.
- **Persistence adapter**: behaves with localStorage throwing or containing malformed JSON (returns defaults, never throws).
- Not unit-tested: Canvas renderer, Theme art, React components, SoundManager — verified by typecheck, lint, build and manual run in a browser.
- Prior art: none — this is a new repo; these tests establish the pattern.

## Out of Scope

- Backend, accounts, database, sharing links, analytics.
- Full finishing order / ranking of non-Winners; multi-winner draws in one Race.
- Automatic "exclude previous Winner" mode (users remove Winners via Edit Names).
- Cancelling a Race mid-way.
- Theme picker UI and any Theme other than Ayutthaya (architecture only).
- Real audio files, music, volume control.
- i18n / language switching.
- In-app reduced-motion toggle.
- Deployment itself, CI workflows, `git init`.
- Image/bitmap artwork (procedural art only for now).

## Further Notes

- Definition of Done: `npm install`, `npm run dev`, `npm run build`, typecheck, lint and tests all pass; 2–50 Participants work end to end on desktop and mobile widths; sound toggle, persistence and reduced motion verified manually.
- Final report must cover architecture, structure, dependencies, run/build/deploy steps, test results, known limitations and next steps.
- Do not copy design, code, assets or branding from Duck Race Name Picker; it is inspiration only.
