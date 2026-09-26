# 07 — Synthesised sound

**What to build:** With sound turned on, the Race has audio: a tick per countdown number, a gong at GO, a soft Thai-style (pentatonic, ranat-like) loop while racing, and a flourish for the Winner — all synthesised with Web Audio, no files. Sound is off by default and can be toggled at any time.

**Blocked by:** 03 — Race Engine and a basic Canvas Race.

**Status:** done

- [x] `SoundManager` interface with cues countdown, start, race (loop), water (loop), ambient environment (loop), winner; Web Audio implementation (water/ambient from filtered noise); the interface allows a file-based implementation later
- [x] AudioContext created only after the user enables sound (no autoplay block)
- [x] 🔊/🔇 toggle in the top corner with aria-label and pressed state; works mid-Race (stops/starts the loop immediately)
- [x] Default is off
- [x] The Race loop stops on finish, on skip and when leaving the Race; no errors when Web Audio is unavailable

**Notes:**
- `soundDirector` (pure, tested) maps session changes to one-shots (tick on 3/2/1, gong at GO, winner on reaching finished — including after a skip) and to the loops each phase wants (countdown/finished: ambient + water; racing: + race; input/result: none).
- `SoundManager.setLoops(loops)` replaced separate start/stop calls: the manager remembers the wanted loops while muted and restarts them on unmute.
- Synthesis: countdown tick (triangle 880 Hz), gong (inharmonic sine partials, long decay), ranat-like pentatonic melody + soft drum via a lookahead scheduler, water (low-passed noise with slow sway), ambient (quiet band-passed noise), winner arpeggio + gong. Muting suspends the AudioContext.
- The toggle has a fixed label "เสียง" with `aria-pressed`; it is hidden when Web Audio is unavailable.
- Verified in the browser by instrumenting `AudioContext.prototype`: no context before the first click; tick/gong during countdown; water + ambient beds start with the countdown; the ranat loop plays while racing; muting mid-Race creates no new sounds and suspends; unmuting resumes; no sounds are produced on the result screen.
- Not committed — no git repo yet.
