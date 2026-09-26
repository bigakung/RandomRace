# The Race is rendered in 3D (Three.js / React Three Fiber) with the 2D canvas kept as a fallback

The Race scene moves to a real-time 3D renderer built on Three.js, React Three Fiber and Drei, loaded lazily so the Roster screen stays light. Both the 3D renderer and the original 2D canvas renderer only read `laneProgress(now)` from `PickerSession`; neither decides anything about the outcome (ADR-0001). The 2D renderer is deliberately kept — not dead code — as the fallback when WebGL is unavailable or the context is lost mid-Race, so school machines without GPU acceleration can still run a Race with the same Winner.

## Consequences

- Participant names in 3D are drawn to 2D canvas textures on sprites, not SDF text (Drei `<Text>`), because the browser's own shaping positions Thai vowels and tone marks correctly and no external font fetch is needed.
- Rendering quality (low/medium) is chosen automatically and only ever changes visuals, never the Race plan.
