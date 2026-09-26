# 08 — Persistence

**What to build:** Reloading the page brings back the last Roster, Race Duration, sound setting and Theme. Broken or unavailable storage never breaks the app.

**Blocked by:** 02 — Full Roster management; 04 — Race Duration presets; 07 — Synthesised sound; 11 — 3D Race end to end (provides the Theme config and id).

**Status:** done

- [x] Single storage adapter over localStorage under a versioned key storing Roster names, Race Duration, sound enabled and theme id
- [x] All reads/writes wrapped; invalid fields discarded individually and replaced with defaults (unknown duration → 10 s, unknown theme → ayutthaya, >50 names → first 50)
- [x] Roster saves debounced during editing
- [x] Sound restored as a preference only; the AudioContext still waits for a user gesture
- [x] Tests: storage throwing on get/set, malformed JSON, wrong types, old/unknown version → defaults, never throws

**Notes:**
- `createPreferencesStore(storage)` lives in `features/preferences` (it needs Roster, Race Duration and Theme rules, so it is not a generic util). Key `ayutthaya-random-picker`, `version: 1`; each field is validated on its own.
- Theme ids live in a render-free `themes/registry` (initial bundle); the 3D chunk maps ids to scene themes via `three/sceneThemes`. The stored id is threaded App → RaceStage → RaceScene3D.
- Roster/Race Duration saves are debounced (400 ms) and flushed on `pagehide`; sound/Theme changes save immediately.
- The session is seeded through the existing `addNames` / `setRaceDuration` actions — no new session API.
- A restored "sound on" only records the preference: the SoundManager now creates the AudioContext only when something should play (the Start click), so no autoplay warning on load.
- Verified in the browser: Roster, 1-minute duration and sound-on restored after reload with no AudioContext warning; corrupted JSON (with writes blocked during reload) loads defaults without crashing.
- Not committed — no git repo yet.
