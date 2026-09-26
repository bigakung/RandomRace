# 11 — 3D Race end to end (tracer)

**What to build:** After "เริ่มแข่ง", the Race plays in a real 3D scene: a sunset river with animated water and banks, a traditional Thai boat per **Participant** with its number and name floating above it, moving exactly as the existing Race plan dictates, and a simple finish gate. The 3D code loads lazily so the Roster screen stays instant, and devices without WebGL (or that lose the context mid-Race) get the existing 2D Race with the same **Winner**. See docs/spec/3d-upgrade.md, ADR-0001, ADR-0002.

**Blocked by:** 03 — Race Engine and a basic Canvas Race.

**Status:** done

- [x] `three`, `@react-three/fiber`, `@react-three/drei` added; no other rendering dependencies
- [x] `selectWinner(roster, rng)` extracted and used by `PickerSession.start`; all existing session tests pass unchanged
- [x] 3D Race module lazy-loaded and preloaded on app open; initial bundle stays close to its current size; a short "กำลังเตรียมแม่น้ำ…" message if not ready at start
- [x] One frame loop calls `session.tick(now)` and positions Vehicles from `laneProgress(now)` via refs — no React state updates or allocations per frame
- [x] Perspective camera, slightly elevated, diagonal across the river; distance/height computed from Lane count and aspect so all Lanes fit (static camera is fine in this ticket)
- [x] Sunset lighting (hemisphere + warm directional sun), gradient sky, fog that keeps the farthest Lane clear; `timeOfDay` preset config with only `sunset` implemented
- [x] Translucent historical-toned river plane with lightweight vertex waves; river banks
- [x] Procedural traditional Thai boat Vehicle (hull, decorations, small flag) coloured per Lane, bobbing/swaying/tilting slightly; neutral naming (Vehicle, not Boat) outside the Ayutthaya Theme
- [x] Names drawn with Sarabun to canvas textures on billboard sprites (`#n ชื่อ`, truncated with …); textures disposed on Roster change/unmount; Thai marks render correctly
- [x] Simple 3D finish gate at progress 1; the Winner's boat reaches it exactly when the Race finishes
- [x] Quality config (`low`/`medium`/`high`), chosen automatically (coarse pointer + small screen, ≤4 cores or ≤4 GB → low; else medium); performance monitor steps down once on sustained low fps, never up; quality changes visuals only
- [x] WebGL detected at startup → 2D fallback with a Thai note when unavailable; `webglcontextlost` mid-Race switches to 2D and continues with the same Winner and timing
- [x] Countdown/GO overlay, skip button and Esc work over the 3D scene; canvas has an accessible description
- [x] Tests (scene layout, pure): Lane positions for 2 and 50 Lanes (count, spacing, no overlap, river width), progress 0 → start X and 1 → finish X, camera framing keeps nearest and farthest Lanes in the frustum for landscape and portrait at 2/16/50 Lanes; quality choice from device signals (missing signals → medium)
- [x] Manual: 3D Race with 2, ~10, 50 Participants on desktop and phone sizes; WebGL disabled → 2D; forced context loss → 2D continues

**Notes:**
- Bundle: initial 75 KB gzip (unchanged), lazy 3D chunk 246 KB gzip. Vite warns the 3D chunk is >500 KB minified; it is lazy, so the warning is expected.
- `laneProgress(now, out?)` / `progressAt(elapsed, out?)` gained an optional reusable output array so the 3D frame loop allocates nothing.
- The React Compiler `react-hooks/immutability` lint rule is off for `src/three/**` and theme `.tsx` files only, because R3F animates by mutating three.js objects.
- Labels use `sizeAttenuation: false` (constant screen size). With many Lanes they overlap — 13 adds the numbers-only mode and Leader panel.
- The static camera frames the whole track, so boats are small (especially on portrait phones) and the river sits in the middle band; 13's follow camera and portrait framing fix this. Pitch was lowered to 19° so a band of sunset sky and fog is visible at the top for 12's silhouettes.
- Verified in the browser: 3D Race with 2/4/6/8/50 Participants, loading message while the chunk compiles, WebGL unavailable → 2D with note, forced context loss mid-Race → continues in 2D at the same time, portrait phone size.
- Dev-server note: on this Windows machine Vite's watcher occasionally misses edits; restart `npm run dev` if the page does not reflect a change.
- Not committed — no git repo yet.
