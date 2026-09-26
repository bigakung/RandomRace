# Spec: 3D Race — Ayutthaya Random Picker

Labels: `ready-for-agent`

Extends [the base spec](./ayutthaya-random-picker.md). Vocabulary follows [CONTEXT.md](../../CONTEXT.md). Respects [ADR-0001](../adr/0001-winner-drawn-before-race.md) (Winner drawn before the Race; animation is a pre-computed plan) and [ADR-0002](../adr/0002-3d-renderer-with-2d-fallback.md) (3D renderer with the 2D canvas kept as fallback).

## Problem Statement

The Race works and is fair, but it is drawn as flat shapes on a 2D canvas. For a room full of students or event guests, the reveal is the whole point: a flat strip of coloured bars does not feel like old Ayutthaya, does not build suspense, and is not memorable. The host wants the moment after "เริ่มแข่ง" to feel like a small cinematic game — traditional Thai boats racing down a river past temples and chedi at golden hour — without losing fairness, speed on school hardware, or accessibility.

## Solution

After the user presses "เริ่มแข่ง", the Race is shown as a real-time 3D scene: a stylised low-poly reconstruction of a stretch of the Chao Phraya at Ayutthaya at sunset, with temples, chedi, city walls, Thai houses, trees, flags and a decorated finish gate. Every **Participant** is a 3D traditional Thai boat (the **Vehicle** of the Ayutthaya **Theme**) with its name floating above it, bobbing on animated water. A cinematic camera looks diagonally across the river, frames every **Lane**, and glides along with the Race. The pre-drawn **Winner** still always crosses first; when it does, the camera eases in, the boat is highlighted and golden particles and confetti celebrate before the result screen appears. The Roster screen stays a light HTML page that opens instantly; the 3D scene loads in the background while names are typed. Devices without WebGL get the existing 2D Race with the same fair result. Rendering quality adapts automatically; reduced-motion users get a still 3D scene and the result immediately.

## User Stories

### The 3D Race
1. As a host, I want the Race shown as a real 3D scene of old Ayutthaya, so that the reveal feels like an event rather than a chart.
2. As an audience member, I want to recognise Thai architecture — prang/chedi, temple halls with tiered roofs, city walls, raised Thai houses, palms — so that the scene clearly reads as Ayutthaya, not a generic fantasy world.
3. As a family audience, I want a warm, colourful, slightly playful low-poly style with no weapons or combat imagery, so that it suits classrooms and children.
4. As a viewer, I want a golden-hour sky with soft fog and distant temple silhouettes, so that the scene has depth and atmosphere without hiding the boats.
5. As a viewer, I want the river water to gently move with waves and a slightly translucent historical green-brown tone, so that it feels alive.
6. As a Participant, I want my own traditional Thai boat with a decorated hull and a small flag, so that I can cheer for "my" boat.
7. As a Participant, I want my number and name floating above my boat and always facing the camera, so that I can find myself at any moment.
8. As a Participant with a Thai name containing stacked vowels and tone marks, I want my name rendered correctly, so that it is not garbled.
9. As a viewer, I want boats to bob, sway slightly and tilt with the water while moving forward, so that the motion looks natural.
10. As a viewer, I want boats to accelerate, slow down and overtake each other, so that the Race feels unpredictable and exciting.
11. As a viewer, I want a decorated 3D finish gate with banners and flags, so that everyone can see where the Race ends.
12. As a viewer, I want the 3-2-1-GO countdown shown as a cinematic overlay on the 3D scene, so that the start feels dramatic.
13. As a viewer, I want a subtle camera move when GO appears, so that the start has energy.

### Fairness
14. As a host, I want the Winner still drawn with the cryptographically strong random source before anything moves, so that 3D visuals can never influence the outcome.
15. As a host, I want the Winner to always cross the finish line first in 3D exactly as in 2D, so that what the room sees is the real result.
16. As a host, I want quality changes, frame drops or switching to 2D mid-Race never to change the Winner or the Race timing, so that every device shows the same result.

### Camera and crowded Races
17. As a viewer, I want a slightly elevated perspective camera looking diagonally across the river with temples in the background, so that I see both the Race and the scenery.
18. As a viewer, I want the camera to follow the Race smoothly without spinning or jerking, so that I am never disoriented.
19. As a viewer, I want the Leader — and therefore the Winner at the finish — always kept in view, so that nobody misses the decisive moment.
20. As a host with 2 Participants, I want a close, intimate framing, so that the Race is not lost in an empty river.
21. As a host with 50 Participants, I want the river to widen and the camera to pull back so every Lane fits, so that everyone can find their boat.
22. As a viewer of a Race with more than 16 Participants, I want boats labelled with numbers only and a live "top 3 Leaders" panel with names, so that the scene stays readable.
23. As a phone user holding the phone upright, I want the camera framed for a tall screen rather than a shrunken desktop view, so that the Race is still clear.

### Winner moment
24. As a viewer, I want the camera to ease towards the Winner as it crosses, so that the moment feels cinematic.
25. As a viewer, I want the Winner's boat highlighted with a glow and golden particles and confetti, so that the celebration is obvious.
26. As a viewer, I want the result screen with the Winner's name and number, Play Again, Edit Names and New Race to follow the celebration, so that I can continue.

### Loading and fallback
27. As a teacher on slow school Wi-Fi, I want the Roster screen to open instantly without waiting for 3D code, so that I can start typing names straight away.
28. As a teacher, I want the 3D scene to load in the background while I type, so that the Race usually starts without a wait.
29. As a user whose 3D scene is not yet ready when I press start, I want a short "กำลังเตรียมแม่น้ำ…" message, so that I know it is loading rather than broken.
30. As a user on a machine without WebGL, I want the 2D Race with a short note that 3D is unavailable, so that I can still pick a Winner.
31. As a user whose graphics context is lost mid-Race, I want the Race to continue in 2D with the same Winner and timing, so that the reveal is not ruined.
32. As a user, I want the app to keep working offline once loaded, including 3D and fonts, so that a dropped connection does not matter.

### Performance and quality
33. As a desktop user, I want smooth animation close to 60 fps, so that the Race looks polished.
34. As a phone or low-spec user, I want automatically reduced detail — no shadows, fewer scenery objects, fewer particles, simpler water, lower pixel ratio — so that the Race stays smooth.
35. As a user whose device starts struggling mid-Race, I want quality to step down automatically and not flicker back up, so that the Race stays fluid.
36. As a user, I want no quality menu to configure, so that the app stays simple.

### Accessibility
37. As a user with reduced motion enabled, I want no Race animation: a plain countdown, then a still 3D scene with the Winner's boat at the finish line and the result immediately, so that I avoid motion but still see a fair result.
38. As a screen-reader user, I want the 3D scene described in text and the Winner announced, so that I get the result without seeing the canvas.
39. As a keyboard user, I want Esc and the skip button to keep working during the 3D Race, so that I can jump to the result.

### Sound
40. As a user with sound on, I want gentle water and ambient environment sounds during the Race in addition to the countdown, start and winner cues, so that the scene feels immersive.
41. As a user, I want sound off by default and never autoplaying, so that the app never surprises me.

### Future development
42. As a future developer, I want to swap any procedural scenery object or the Vehicle for a GLB model by setting one path in the Theme's asset configuration, so that art can improve without code changes.
43. As a future developer, I want a missing or broken model file to fall back to procedural geometry without crashing, so that a bad asset never breaks a live Race.
44. As a future developer, I want time-of-day presets (morning, day, sunset, night) to be pure configuration, so that new lighting moods need no scene rewrite.
45. As a future developer, I want the 3D renderer to use neutral names (Vehicle, Lane, Theme) and read only Race progress, so that an elephant or festival Theme can reuse it.

## Implementation Decisions

- **Unchanged core**: `PickerSession` (phases, timing, Roster, skip, lock), the Race Engine's time-based plan and `laneProgress(now)`, the crypto random utility and Race Duration presets remain as they are. The Race still produces exactly one Winner; Leaders are display-only (CONTEXT.md).
- **Winner selection** is extracted into a small `selectWinner(roster, rng)` function used by `PickerSession.start`; behaviour is identical.
- **Dependencies added**: `three`, `@react-three/fiber`, `@react-three/drei` (used sparingly: e.g. performance monitoring and GLTF loading). No postprocessing library, no physics, no text library beyond Drei.
- **Lazy 3D**: the 3D Race is a lazily loaded module; its import is started (preloaded) when the app opens so it is usually ready by the time the user starts a Race. If not yet ready, the Race stage shows a brief loading message; the session clock still runs from `start(now)`.
- **Renderer contract** (ADR-0002): both renderers receive the session and read `getState()` and `laneProgress(now)` per frame; neither can change the outcome. The 3D renderer calls `session.tick(now)` from its frame loop exactly like the 2D loop, so only one loop ever drives the clock.
- **Renderer choice**: WebGL availability is detected once at startup; without it the 2D renderer is used with a short Thai note. On `webglcontextlost` during a Race the stage switches to the 2D renderer and continues from the current session time.
- **Scene layout module** (pure, framework-free): given Lane count and viewport aspect it returns Lane Z positions (fixed spacing, river width grows with Lane count), the X of the start and finish lines, the progress→X mapping, the camera distance/height/angle that fits all Lanes in the frustum for both landscape and portrait, the camera follow target given current progress (midpoint between the rear boat and the Leader, clamped so the Leader stays in view, easing near the finish), and the label mode (names for ≤16 Lanes, numbers only above). The Race track length is fixed; Race Duration only changes speed.
- **Vehicle motion**: per frame, each Vehicle's X comes from Lane progress via the layout; bob, sway, pitch and roll are small time-based offsets (unique phase per Lane) added in the frame loop through refs. No React state changes per frame; no allocations inside the frame callback.
- **Names**: each Participant label is drawn once to a 2D canvas (Sarabun, correct Thai shaping) and used as a texture on a billboard sprite above the Vehicle; long names are truncated with "…". Textures are disposed when the Roster changes or the scene unmounts.
- **Leader panel**: an HTML overlay above the canvas showing the top 3 Leaders (number + name), updated at a low rate (a few times per second) via a ref-driven DOM update or a throttled state, never per frame.
- **Theme structure**: the Ayutthaya Theme provides its config (palette, Vehicle colours, copy, time-of-day preset with sky/sun/fog/light colours — only `sunset` implemented), its procedural Vehicle, and its scenery components. The environment is composed of small components: river, river banks, temples, chedi/prang, city wall, Thai houses, trees and vegetation, flags, a bridge where it fits, finish gate, distant silhouettes. Repeated objects (trees, flags, wall segments, small decorations) use instancing with shared geometries and materials.
- **Assets**: a typed asset configuration maps each model slot (vehicle, temple, chedi, house, …) to a GLB path or `null`. A single model component renders the procedural fallback for `null`, loads the GLB otherwise, and falls back to procedural if loading fails (error boundary). No asset files ship yet; all slots are `null`.
- **Water**: a subdivided plane with lightweight vertex wave animation and a translucent standard material; no real-time reflections. Low quality uses fewer subdivisions and no animated normals.
- **Lighting and atmosphere**: hemisphere + warm directional sun (+ low ambient fill), exponential fog tuned so the farthest Lane stays clear, gradient sky. Shadows only from the sun onto the water/banks for Vehicles and a few key buildings, and only at medium quality.
- **Quality** (`low` | `medium` | `high` config): chosen automatically at startup — coarse pointer with a small screen, `hardwareConcurrency ≤ 4` or `deviceMemory ≤ 4` → low, otherwise medium; `high` exists as configuration only. A performance monitor steps down one level on sustained low frame rate and never steps back up during the session. Quality affects pixel ratio cap, shadows, scenery density, particle counts and water detail only.
- **Winner effect**: on `finished`, the camera eases towards the Winner, the Winner Vehicle gets an emissive highlight and a gold light, and a pooled particle system emits golden sparkles and confetti (count scaled by quality); the HTML result follows after the existing finish hold.
- **Reduced motion**: when `prefers-reduced-motion: reduce`, the session skips racing (as already specified); the 3D scene renders still — no camera motion, waves, flag motion, bobbing or particles — with the Winner's Vehicle at the finish line and a static highlight.
- **Sound**: the planned Web Audio SoundManager gains `water` and `ambient` loop cues alongside countdown, start, race and winner; off by default and only after a user gesture.
- **Accessibility**: the 3D canvas has an accessible text description (number of boats, scene), the countdown and Winner remain in `aria-live` HTML, Esc/skip unchanged.
- **Structure**: 3D code lives in its own area (scene, vehicles, camera, effects, quality) separate from features; Ayutthaya-specific config and assets live under a themes area; the 2D renderer moves under the race feature as the explicit fallback. Existing session, roster, random and engine modules keep their names.

## Testing Decisions

- Good tests assert externally observable behaviour through the highest seam; no tests of Three.js objects, shader code or React component internals. Randomness and time stay injected.
- **Primary seam — PickerSession**: all existing tests (fairness, Winner-first, no teleport, skip, lock, flow) continue to pass unchanged after `selectWinner` is extracted; they are the proof that the 3D upgrade did not alter outcomes.
- **New seam — scene layout** (pure):
  - Lane positions: correct count, strictly increasing, constant spacing, no overlap, river width contains all Lanes, for 2 and 50 Lanes.
  - Progress mapping: 0 → start line, 1 → finish line exactly, monotonic.
  - Camera framing: for 2, 16, 50 Lanes and for landscape and portrait aspects, the nearest and farthest Lanes project inside the view frustum (checked with plain projection maths, not Three.js objects).
  - Follow target: the Leader's X is always within the visible span; at progress where the Winner reaches 1 the finish line is in view.
  - Label mode: names at ≤16, numbers above.
  - Quality choice: device-signal combinations map to low/medium as specified; missing signals default to medium.
- **Manual verification in the browser**: 3D Race with 2, ~10 and 50 Participants at desktop and phone sizes; WebGL disabled → 2D fallback with note; forced context loss mid-Race → continues in 2D with same Winner; asset slot pointed at a missing file → procedural fallback, no crash; reduced motion → still scene; frame rate observed with the performance overlay off.
- Prior art: the session tests (`race`, `rosterManagement`, `pickerSession`) and the random utility tests.

## Out of Scope

- Full finishing order or rankings; multiple Winners per Race.
- Real GLB/GLTF art assets (the pipeline exists; no models ship).
- Time-of-day modes other than sunset; a user-facing time-of-day or quality selector.
- Post-processing (bloom, depth of field), real-time reflections, physics.
- Putting the Roster, buttons or result UI inside the 3D world.
- A 3D scene on the Roster screen.
- Real audio files.
- Other Themes (elephant, Muay Thai, festival) — architecture only.

## Further Notes

- Priority when time is short: real 3D scene → river → Vehicles → names → Race → Winner-first → finish gate → Winner effect → responsive camera → performance → scenery richness. The Race must work before the city gets detailed.
- Bundle impact is expected to be roughly 250–300 KB gzip for the lazily loaded 3D chunk; the initial Roster screen bundle should stay close to its current size.
- Troika/SDF text was rejected for names because it fetches a default font from a CDN unless configured and does not use browser shaping for Thai marks (ADR-0002).
