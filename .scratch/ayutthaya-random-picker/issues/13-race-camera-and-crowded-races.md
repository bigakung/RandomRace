# 13 — Race camera and crowded Races

**What to build:** The camera becomes cinematic and the scene stays readable with many **Participants**: it glides along with the Race, keeps the **Leader** (and so the **Winner** at the finish) in view, adds a subtle move at GO and eases near the finish line, and frames tall phone screens properly. Races with more than 16 Participants label boats with numbers only and show a live top-3 Leader panel with names.

**Blocked by:** 11 — 3D Race end to end.

**Status:** done

- [x] Camera follows smoothly (interpolated) along the river: target between the rear boat and the Leader, clamped so the Leader stays in view; no continuous rotation, no first-person view
- [x] Subtle camera move when GO appears; eases/slows as the Winner approaches the finish
- [x] Portrait/tall screens get their own framing (further back and higher), not a shrunken desktop view
- [x] Label mode: `#n ชื่อ` for ≤16 Lanes, number only above 16
- [x] HTML top-3 Leader panel (number + name) above the canvas for >16 Lanes, updated a few times per second without per-frame React renders; announced politely to assistive tech at a low rate or not at all
- [x] Tests (scene layout, pure): follow target keeps the Leader's X within the visible span for sampled Race states; finish line in view when the Winner reaches progress 1; label mode switches at 16
- [ ] Manual: 2, 16, 17 and 50 Participants on desktop and phone portrait — partly done: 6 and 50 on desktop, 6 on portrait; the 16/17 switch is covered by the `labelMode` test only

**Notes:**
- Scene layout gained `followRig` (fits every Lane over a ±10 stretch — ±6 on portrait — at 14° pitch, 32° on portrait), `framingAround`, `followCenterX` (midpoint of rear and Leader, Leader kept within 80% of the window, settling 25% of the window before the finish) and `labelMode` (names ≤16 Lanes). The whole-track `cameraFraming` was removed; its guarantees are now asserted on the follow rig.
- Portrait framing also includes a far-bank point so the camera looks at the centre of Lanes + temples: the river sits in the lower half and the chedis fill the top instead of an empty foreground.
- `RaceCamera` eases with frame-rate-independent exponential smoothing (2.2/s, 1.1/s near the finish), starts 12% pulled back during the countdown so GO glides in, and pushes in 6% as the Leader passes 85%. It never rotates on its own.
- The Leader panel is an HTML overlay shared by the 3D and 2D renderers, refreshed every 250 ms and re-rendered only when the top 3 change; it is not a live region.
- Verified in the browser: 50 Lanes (numbers on boats, Leader panel updating, finish gate in view), 6 Lanes (large boats, readable Thai names, no panel), portrait phone (temples above, river below, camera panning with the Leader).
- The first second after the 3D chunk loads can show the plain sky colour while shaders compile; frames resume where the session clock is.
- Not committed — no git repo yet.
