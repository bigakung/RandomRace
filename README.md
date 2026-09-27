# Ayutthaya Random Picker

A themed name picker for classrooms, teams and lucky draws. Enter 2–50 names, press **เริ่มแข่ง / START RACE**, and a fairly drawn Winner is revealed as a traditional Thai boat race down a river in old Ayutthaya — rendered in real-time 3D, with a 2D fallback.

- The **Winner is drawn before anything moves** with `crypto.getRandomValues` (unbiased rejection sampling). The race is only a visualisation of that draw; nothing on screen can change it ([ADR-0001](docs/adr/0001-winner-drawn-before-race.md)).
- Static site: no backend, no database, works offline once loaded (fonts are self-hosted, no external URLs are fetched).
- Thai UI, mobile-first, keyboard accessible, respects `prefers-reduced-motion`.

## Quick start

Requires Node.js 20+ (developed on Node 24).

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-checks, then builds the static site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally |
| `npm test` | Runs the Vitest suite once |
| `npm run typecheck` | TypeScript (strict) with no output |
| `npm run lint` | ESLint |

> On some Windows setups Vite's file watcher occasionally misses an edit; restart `npm run dev` if the page does not reflect a change.

## Deploy

The build is plain static files in `dist/`. Vite's `base` is relative (`./`), so the same build works at a domain root or under a sub-path.

- **Cloudflare Pages / Vercel / Netlify:** connect the repository, build command `npm run build`, output directory `dist`. No extra configuration.
- **GitHub Pages:** build, then publish `dist/` (for example with the `actions/upload-pages-artifact` + `actions/deploy-pages` workflow, or by pushing `dist/` to a `gh-pages` branch). It works under `/<repository>/` without changes.

There are no routes, so no SPA fallback rules are needed.

## How it works

```
Roster (names) ──► PickerSession ──► selectWinner (crypto)   ◄── the only place the outcome is decided
                        │
                        ├─► RaceEngine: time-based RacePlan (Winner reaches the line exactly at Race Duration)
                        │
                        └─► laneProgress(now) ──► 3D renderer (Three.js / React Three Fiber)
                                                 └► 2D canvas renderer (fallback)
```

- **`PickerSession`** (`src/features/session`) is a framework-free state machine: `input → preparing → countdown → racing → finished → result` (`preparing` is the renderer's own getting-ready step — [ADR-0003](docs/adr/0003-countdown-waits-for-stage-ready.md)). Time is passed in (`stageReady(now)`, `tick(now)`), so the animation loop drives it and tests control it. React only re-renders when the phase or countdown changes — never per frame.
- **Race Engine** (`src/features/race/raceEngine.ts`) integrates per-Lane speed profiles (base speed, waves, "surge then tire" bursts, a late burst for the Winner) into distance curves. Only the Winner reaches 1.0, exactly at the chosen Race Duration; boats never move backwards or jump; lead changes keep long races lively.
- **Renderers** only read `laneProgress(now)`; a renderer's only other say is *when* it is ready ([ADR-0002](docs/adr/0002-3d-renderer-with-2d-fallback.md), [ADR-0003](docs/adr/0003-countdown-waits-for-stage-ready.md)). The 3D scene (`src/three`) is lazy-loaded so the Roster screen stays light. Pressing Start draws the Winner immediately, then waits for the renderer: 3D compiles its shaders and draws one hidden frame before the countdown clock starts (usually near-instant, since the chunk preloads while names are typed); a short loading message appears only if that takes a moment. After the first Race the stage stays mounted (hidden, not rendering) so every Race reuses the same renderer and compiled shaders; without WebGL, or if the GPU context is lost mid-Race, the 2D canvas renderer takes over with the same Winner and timing.
- **Themes** (`src/themes`) supply the Vehicle, scenery, Surface (the ground a Vehicle rides on — a river, a dirt track…) and lighting presets; the copy that names and describes each Theme lives in `themes/registry.ts` so it's available before the 3D chunk loads. The engine and camera know only Lanes and Vehicles, and read the ground only through `Surface`/`surfaceHeightAt` ([ADR-0004](docs/adr/0004-surface-is-theme-provided.md)), so a new Theme needs no engine changes — proved by two: Ayutthaya (a river) and a Thai elephant race (dry land). Picked once, on the Roster screen; it never changes how a Winner is chosen or how the Race moves.
- **Quality** is chosen automatically (low on phones / weak hardware, else medium) and steps down on a sustained low frame rate. It changes visuals only.

Vocabulary (Participant, Roster, Race, Lane, Vehicle, Leader, Winner, Race Duration, Theme) is defined in [CONTEXT.md](CONTEXT.md). Specs live in [docs/spec](docs/spec).

## Project structure

```
src/
  App.tsx                      screen switching, preferences, sound, reduced motion
  copy/th.ts                   user-facing Thai text that doesn't depend on the Theme
  components/                  ConfirmDialog (<dialog>), ErrorBoundary
  hooks/                       usePrefersReducedMotion
  utils/random.ts              crypto RNG, randomInt (rejection sampling), seeded RNG for tests
  features/
    picker/                    Roster rules and the Roster screen (name/duration/Theme pickers)
    session/                   PickerSession state machine (+ most tests)
    race/                      Race Engine, winnerSelector, RaceStage, 2D fallback, Leader panel
    result/                    Result screen
    sound/                     Web Audio SoundManager and phase → sound mapping
    preferences/               localStorage adapter (versioned, validates every field)
  three/                       3D renderer: scene, camera, vehicles, effects, quality, layout maths
  themes/
    registry.ts                Theme ids + copy (no rendering code, safe for the initial bundle)
    ayutthaya/                 boat, river Surface, scenery, lighting preset, optional GLB asset slots
    elephant/                  elephant, dirt-track Surface, countryside scenery, lighting preset
```

## Assets

All art is procedural low-poly geometry, so the app needs no model files. To use your own models, put GLB files under `public/models/…` and set the matching slot in that Theme's own `assets.ts` (Ayutthaya: `vehicle`, `temple`, `chedi`, `prang`; elephant: `vehicle`). A missing or broken file falls back to the procedural model. GLBs are loaded without Draco (drei would otherwise fetch its decoder from a CDN).

## Testing

`npm test` runs 143 tests. Almost all of them go through one seam — `PickerSession` — covering fairness, Roster rules, the Race flow, the Winner always crossing first with continuous motion (2 and 50 Lanes, 5 s to 5 min), skip (including a skip before the countdown clock ever starts), post-race actions and reduced motion. The other pure modules tested directly are the random utility, the 3D scene layout and camera maths, each Theme's scenery placement, the Theme registry, quality selection, the sound director and the preferences adapter. Rendering code is verified manually in the browser.

## Accessibility

- Keyboard: logical tab order, visible focus rings, Enter to add names, Esc to skip a race; focus moves to the skip button when a race starts and to the Winner when it ends.
- Screen readers: labelled controls, the countdown and Winner in live regions, the race canvas described in text.
- `prefers-reduced-motion`: the race animation is skipped — a plain countdown, a still scene with the Winner at the finish, then the result.
