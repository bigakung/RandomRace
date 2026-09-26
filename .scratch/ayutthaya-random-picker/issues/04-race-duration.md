# 04 — Race Duration presets

**What to build:** The user picks a **Race Duration** from presets — 5 s, 10 s (default), 30 s, 1 min, 2 min, 5 min — and the Race lasts exactly that long, with more lead changes the longer it runs so long Races stay exciting.

**Blocked by:** 03 — Race Engine and a basic Canvas Race.

**Status:** done

- [x] Segmented preset control near the Start button, keyboard-operable, clearly shows the selection; locked during a Race
- [x] Default is 10 seconds
- [x] The Winner crosses the finish line exactly at the chosen duration for every preset
- [x] Number of surges / lead changes scales with duration (roughly one every 3–6 s); the Winner does not lead the whole way on longer presets
- [x] Tests via `PickerSession`: finish time equals duration for each preset; at least a minimum number of lead changes for 1 min+ presets; no-teleport and Winner-first invariants hold at 5 min

**Notes:**
- `PickerSession` gained `raceDurationMs` state and `setRaceDuration(ms)` (presets only, input phase only); `RACE_DURATION_PRESETS_MS` is the single source for the UI.
- Engine changes needed for long Races (found by the new lead-change tests): surge widths are in seconds (1.5–4 s) instead of a fraction of the Race; each surge is paired with an equal slump ("surge then tire") so gains are temporary — permanent gains add up like a random walk whose leader rarely changes; the speed wave's period is 12–30 s; plan resolution scales at 8 samples per second (min 240); non-Winner end points tightened to 0.90–0.985 for a closer pack and finish.
- Measured lead changes (8 Lanes, 10 seeds) all meet the test minimums: ≥3 at 1 min, ≥5 at 2 min, ≥10 at 5 min.
- UI is a native radio group styled as segments (arrow keys work); wraps to 3×2 below 400 px.
- Not committed — no git repo yet.
