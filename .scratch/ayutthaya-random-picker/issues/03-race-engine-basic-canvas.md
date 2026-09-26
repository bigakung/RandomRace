# 03 — Race Engine and a basic Canvas Race

**What to build:** After Start, a 3-2-1-GO countdown plays and then every Participant races in its own **Lane** on a Canvas (simple shapes are fine). Lanes move at varying speeds and overtake each other; the pre-drawn **Winner** always crosses the finish line first. The user can skip to the result. Fixed 10-second Race for now.

**Blocked by:** 01 — Walking skeleton.

**Status:** done

- [x] Race Engine is pure (no React/DOM/Canvas): builds a time-based RacePlan from Lane count, Winner index, duration and Rng before the countdown; `progressAt(t)` returns 0…1 per Lane
- [x] Plan = base speed + random variation + small wave + surges; the Winner reaches 1.0 exactly at the duration; other Lanes stay below 1.0 until then; progress is continuous and non-decreasing
- [x] `PickerSession` phases: input → countdown → racing → finished → result, driven by `tick(now)`
- [x] A single requestAnimationFrame loop reads the plan directly; React state only changes on phase changes, not per frame
- [x] Canvas fills its container, follows resize (ResizeObserver) and devicePixelRatio (capped); no crash on resize mid-Race
- [x] Lane height derived from Lane count; all Lanes visible without scrolling for 2–50 Participants
- [x] "ข้ามไปดูผล ⏭" button and Esc skip to finished with the same Winner; no cancel action exists (ADR-0001)
- [x] Roster editing and Start are locked during countdown/racing
- [x] Tests (many seeds, 2 and 50 Lanes): no Lane finishes before the Winner, the Winner finishes at the duration, bounded per-step delta (no teleport), the Race always finishes, skip keeps the Winner

**Notes:** Time is passed explicitly (`start(now)`, `tick(now)`, `skip(now)`), and `laneProgress(now)` is read by the canvas loop each frame without React updates. The engine integrates a per-Lane speed profile (base + wave + surges, plus a late burst for the Winner) into a distance curve scaled so the Winner ends at exactly 1 and others at 0.82–0.98; plans where the Winner leads at mid-race are re-drawn (up to 12 times). Countdown/GO overlay is DOM (aria-live); on-canvas art is intentionally plain until 05. With 50 Lanes on a short screen the hulls are too small for numbers — the numbers-only mode and top-3 panel land in 05. Not committed — no git repo yet.
