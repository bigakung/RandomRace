# 12 — Ayutthaya environment and asset system

**What to build:** The 3D river becomes recognisably old Ayutthaya: stylised low-poly temples with tiered roofs, prang/chedi, city walls, raised Thai houses, palms and vegetation, flags, a bridge where it fits, distant temple silhouettes against the sunset, and a decorated finish gate with Thai banners and golden details. Any procedural model can later be swapped for a GLB by setting a path in the Theme's asset configuration, and a missing model never breaks the Race.

**Blocked by:** 11 — 3D Race end to end.

**Status:** done

- [x] Environment composed of small components (river banks, temple, chedi/prang, city wall, Thai house, trees/vegetation, flags, bridge, silhouettes, finish gate decorations) — no single giant component
- [x] Historically inspired Thai forms and warm palette; no modern, European, fantasy-castle or combat elements
- [x] Repeated objects (trees, flags, wall segments, small decorations) use instancing with shared geometries and materials; flags wave with a cheap vertex/time animation
- [x] Scenery placed outside the widest river (50 Lanes) so it never overlaps a Lane; key buildings visible behind the Race from the default camera
- [x] Low quality renders noticeably fewer scenery objects and no shadows; medium adds sun shadows for Vehicles and a few key buildings only
- [x] Typed Ayutthaya asset configuration (vehicle, temple, chedi, house, … → GLB path or null), all null for now; paths not hard-coded in components
- [x] One model component: null → procedural, path → GLB load, load failure → procedural via error boundary, no crash
- [x] Manual: pointing a slot at a missing file shows the procedural model and the Race still runs; frame rate acceptable on desktop and phone sizes

**Notes:**
- Placement is a pure, seeded function (`planScenery(riverHalfWidth, detail)`), tested: nothing intrudes on the river at 2 or 50 Lanes, the bridge is beyond the finish line, the camera-side bank is clear for |x| < 30, temples sit behind the wall, low detail has < 70% of the objects, and the plan is identical every Race.
- Landmarks loosely echo Wat Phra Si Sanphet (three bell chedis) and Wat Chaiwatthanaram (Khmer-style prang), with ordination halls (three stacked red/green gable roofs, gold chofa), a brick wall with merlons and watchtowers, stilt houses, sugar palms and round trees, waving temple banners, an arched footbridge, horizon silhouettes, and red/gold pennants on the finish gate.
- Instanced: house parts, merlons, towers, palms, trees, flags, pennants. Landmarks are individual meshes so each can be a GLB.
- Asset slots: `vehicle`, `temple`, `chedi`, `prang` (all `null`). Houses/trees/flags have no slot because they are instanced; a GLB Vehicle is not tinted per Lane.
- `ThemeModel` loads GLBs with Draco off (drei would otherwise fetch its decoder from a CDN). Verified: pointing `chedi` at a missing file keeps the procedural chedis, the 3D scene and the Race running.
- 3D chunk grew to 271 KB gzip (GLTF loader). Measured 60 fps with 50 Lanes and full scenery at 1280×800.
- The static camera leaves the camera-side bank as a large empty foreground and can crop the tallest spires — 13's framing work should aim the view at the river and far bank.
- Not committed — no git repo yet.
