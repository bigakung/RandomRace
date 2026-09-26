# 06 — Result screen and post-Race actions

**What to build:** When the Winner crosses the line, the 3D scene celebrates — the camera eases towards the Winner's boat, it glows, golden particles and confetti burst — then the result screen names the **Winner** ("🏆 ผู้ชนะ" plus name and number) and offers the three next steps. The 2D fallback shows a simpler celebration.

**Blocked by:** 02 — Full Roster management; 11 — 3D Race end to end; 13 — Race camera and crowded Races.

**Status:** done

- [x] Result shows the Winner name and #number (distinguishes duplicates); announced via aria-live
- [x] 3D Winner moment during the finish hold: camera eases in, Winner Vehicle emissive highlight + gold light, pooled golden particles and confetti scaled by quality level; no allocations per frame
- [x] Result screen spotlight, lightweight; 2D fallback gets a simple celebration too
- [x] "แข่งอีกครั้ง / PLAY AGAIN": same Roster, new independent draw, straight into countdown; the same Participant may win again
- [x] "แก้ไขรายชื่อ / EDIT NAMES": back to input with the Roster intact
- [x] "เริ่มใหม่ / NEW RACE": confirmation dialog ("ล้างรายชื่อทั้ง N คน?"), then clears the Roster; cancelling keeps it
- [x] Buttons bilingual (Thai large, English small), keyboard-operable; focus moves sensibly to the result
- [x] Tests via `PickerSession`: playAgain keeps the Roster and redraws (different injected RNG → different Winner); editNames keeps the Roster; newRace clears it

**Notes:**
- `PickerSession` gained `playAgain(now)`, `editNames()` and `newRace()` (result phase only). Play Again and Start share one internal `beginRace`, so every Race — first or repeated — draws its Winner and plan the same way. Race Duration survives all three.
- Tests (via `PickerSession`): a switched random source changes the next Winner, Play Again restarts the countdown with the same Roster, 40 repeated draws hit every Participant, the new Winner still crosses first, Edit Names keeps the Roster, New Race clears it, and the actions are ignored outside the result.
- 3D Winner moment (`WinnerEffect`): pulsing additive gold ring on the water, a gold point light, and pooled gold sparkles + falling confetti (60 / 240 / 400 particles for low / medium / high). The light stays in the scene at zero intensity so no shader recompiles at the finish. The camera pushes in to 80% and slides across the river towards the Winner's Lane during the finish hold.
- 2D fallback: pulsing gold glow and outline on the Winner's boat.
- Result screen: CSS spotlight + light conic ray, 28 CSS confetti pieces (hidden under reduced motion by the global rule), focus moved to the Winner heading, `aria-live` region.
- A shared native `<dialog>` `ConfirmDialog` (Cancel focused first, Esc cancels) now backs both New Race and the Roster's Clear all, replacing `window.confirm`.
- Verified in the browser: Winner moment with confetti over the Winner, result → Edit Names (6 names, 5 s duration kept) → Start → result → Play Again (countdown, GO, a different Winner) → New Race → confirm → empty Roster; dialog cancel keeps the result.
- Deviation: the Winner is highlighted with a gold ring and light around it rather than an emissive tint on the hull, so the effect works for any Theme's Vehicle (including GLB models) without reaching into its materials.
- Not seen in the browser: the 2D fallback's Winner glow (code path only), and the result layout at phone width.
- Not committed — no git repo yet.
