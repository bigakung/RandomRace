# 10 — Polish and acceptance

**What to build:** The finished experience: from the first second it feels like an Ayutthaya-themed name-picking game on both phone and desktop, is fully keyboard accessible, and every Definition-of-Done item is verified. Includes the README and the final report.

**Blocked by:** 01–04, 06–09, 11–13 (05 is superseded).

**Status:** done

- [x] Mobile-first responsive layout, also polished on desktop; clear hierarchy Title → Roster → Race Duration → prominent Start → Race → Winner; no admin-panel look
- [x] Keyboard pass: logical tab order, visible focus rings, Enter/Esc behaviours, aria-labels on all controls
- [x] No crashes: empty Roster, single name, garbage paste, storage unavailable (tests + browser)
- [ ] Rapid resize/rotate mid-Race — not stress-tested; resize is handled by ResizeObserver (2D) and R3F (3D) and single resizes/orientation changes were exercised during 03, 11 and 13
- [x] README: run, build, deploy (GitHub Pages / Cloudflare Pages / Vercel with `npm run build` → `dist`), architecture overview
- [x] `npm install`, `npm run dev`, `npm run build`, typecheck, lint and tests all pass
- [x] Manual check in the browser at mobile and desktop widths with 2, ~10 and 50 Participants; sound toggle, persistence and reduced motion verified
- [x] Performance pass: no per-frame React renders (measured as zero DOM mutations mid-Race rather than with the React profiler), no allocations in frame loops, geometries/materials/textures disposed on unmount, 3D chunk lazy and initial bundle small, 60 fps on desktop
- [ ] Frame rate on a real phone at low quality — not measured (only phone-size emulation on a desktop GPU)
- [x] Review pass: architecture, performance, security (no external URLs, no `dangerouslySetInnerHTML`, names treated as text), accessibility, maintainability
- [x] Final report: changed files, architecture, structure, dependencies added, run, build, deploy, test results, known limitations, next steps

**Notes:**
- Layout: Start is sticky at the bottom on phones so it is always in reach; shorter placeholder; readable backing for the race notes; the sky gradient shows behind the canvas while shaders compile.
- Camera: the far-bank temples are now part of the framing on every screen shape, so the river sits low in the picture with the city behind it instead of an empty foreground bank.
- Focus: moves to the skip button when a Race starts, to the Winner heading on the result, and to the add-name field after Edit Names / New Race (never on first load, to avoid popping the phone keyboard). Tab order checked: sound → add name → add → per-row edit/delete → clear all → Race Duration (one stop, arrows) → Start.
- Performance: per-frame loops in the engine, layout, fleet and camera are plain index loops (no closures/iterators per frame). Measured mid-Race: 60 fps and zero DOM mutations over 4 s (6 Lanes). Geometries/materials/textures created per scene are disposed on unmount; boat parts and scenery materials are intentionally page-lifetime singletons.
- Security review: no external URLs fetched (verified in the production build: every resource from the same origin), no `innerHTML`/`dangerouslySetInnerHTML`/`eval`, names only ever rendered as text or drawn to canvas, no `any`. The Draco CDN URL is present inside drei's bundle but never used (`useGLTF(url, false)`).
- Verified in the browser: phone input and result screens, 2 / 16 / 17 / 50 Participants, the 2D fallback's Winner glow, Esc skip, and a full Race on the production build (`npm run preview`).
- Not committed — no git repo yet.
