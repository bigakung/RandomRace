# 05 — Theme abstraction and the Ayutthaya scene

**What to build:** The Race looks like old Ayutthaya: a warm, cinematic, slightly playful river scene with temples, chedi, city walls, Thai houses, trees, sky and traditional flags, and each Participant as a colourful traditional Thai boat. All art is procedural and lives behind a **Theme** abstraction so future Themes need no engine changes. Crowded Races stay readable.

**Blocked by:** 03 — Race Engine and a basic Canvas Race.

**Status:** superseded — replaced by 11 (3D Race tracer), 12 (Ayutthaya environment) and 13 (Race camera and crowded Races) after the 3D upgrade decision (ADR-0002, docs/spec/3d-upgrade.md). Do not implement.

- [ ] `ThemeConfig` (id, name, palette incl. cyclic Vehicle colours, copy) + `ThemeRenderer` hooks (background, Vehicle, finish line, celebration) + registry keyed by id; the Race Engine knows nothing about boats
- [ ] Ayutthaya Theme drawn procedurally on Canvas; art modules separate from logic; no external image URLs
- [ ] Static scenery pre-rendered to an offscreen layer and redrawn only on resize
- [ ] Light ambient animation: rippling water, slow clouds, waving flags, boat bobbing, light particles — smooth on mobile
- [ ] When Lanes are too narrow for names, boats show numbers only and a live "top 3 leaders" panel appears
- [ ] Canvas text waits for fonts to load before the first draw
- [ ] Unknown theme id resolves to ayutthaya (tested)
- [ ] No theme picker UI
