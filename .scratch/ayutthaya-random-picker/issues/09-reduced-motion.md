# 09 — Reduced motion

**What to build:** When the OS requests reduced motion, the app still shows a fair result but without the Race: a plain 3-2-1 countdown, then a still 3D scene (or still 2D fallback) with every boat moored and the **Winner** boat at the finish line with a static highlight, and the result immediately. Camera motion, waves, flag motion, bobbing, particles and confetti are all off.

**Blocked by:** 06 — Result screen and post-Race actions; 12 — Ayutthaya environment; 13 — Race camera and crowded Races.

**Status:** done

- [x] Reads `prefers-reduced-motion` and reacts to changes; no in-app toggle
- [x] Countdown numbers change without zoom/bounce; the session goes countdown → finished without racing; Race Duration ignored
- [x] Still scene: fixed camera, no waves, flag motion, bobbing, particles or confetti (3D renders on demand rather than every frame); the result uses a static spotlight and at most a short fade
- [x] Short note shown: "โหมดลดการเคลื่อนไหว: แสดงผลทันที"
- [x] CSS animations/transitions also disabled under the media query
- [x] Test via `PickerSession`: a reduced-motion start reaches finished with a valid Winner and never enters racing

**Notes:**
- `PickerSession.setReducedMotion(on)`: each Race records the setting when it begins, so switching mid-Race never glitches the current one. A reduced Race goes countdown (3, 2, 1, no GO) → finished at the end of the countdown, whatever the Race Duration; the Winner is drawn exactly as before.
- Tests (via `PickerSession`): never enters racing and reaches the result; countdown sequence 3, 2, 1, null; Winner at 1 and every other boat short of it; fairness over 4000 draws; Play Again honours a setting switched back off.
- `usePrefersReducedMotion` (matchMedia via useSyncExternalStore) follows OS changes live; the App pushes it into the session and down to the renderers.
- 3D: on-demand rendering (`frameloop="demand"`) with a `SessionInvalidator` and a DOM `SessionTicker` keeping the clock moving; no waves, flag motion, bobbing, sway, camera glide or zoom, and no particles; the Winner keeps a steady gold ring and light.
- 2D fallback: no bobbing and a steady (non-pulsing) Winner glow.
- CSS animations (countdown pop, confetti) were already disabled by the global reduced-motion rule from 01; confetti simply does not appear.
- Verified in the browser by overriding `matchMedia` (the CSS media query itself cannot be emulated from the pane): note shown, plain countdown with boats at the start, cut to the Winner at the finish, result at ~5.4 s with a 5-minute Race Duration selected.
- Not committed — no git repo yet.
