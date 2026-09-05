# JAM machine

A spatial tour: JAM as a machine in space. Protocol copy targets [Gray Paper 0.8.0](https://github.com/gavofyork/graypaper/tree/v0.8.0). The core anatomy preserves the connected in-core/on-chain shape of Gavin's JAM Core Anatomy diagram.

The first view is an establishing shot. The separate, collapsed **Learn JAM** panel offers six short readings without moving the camera. The package view has a manually controlled successful-work example; Play advances it once, while Back, Next and Replay allow inspection. Durations are illustrative, not protocol timeslots. This is not a protocol simulator.

## Run

```bash
pnpm install
pnpm dev
```

Build a static `dist/` (Cloudflare Pages, S3, any static host):

```bash
pnpm build
pnpm preview
```

## Controls

Use the bottom scale buttons, or scroll over the canvas to zoom between views. Trackpad pinch over the canvas zooms the 3D scene rather than the page. Drag to orbit; right-drag to pan. With the canvas focused, arrow keys change scale and plain +/− zoom. Browser Ctrl/Cmd zoom shortcuts keep their native behavior outside the canvas.

Hover, click, or keyboard-focus an underlined term to open its explanation. Enter moves focus to its source link when present. Escape closes it. Reduced motion freezes ambient animation and uses static poses for journey stages.

## Structure

- `src/content/`: versioned glossary, lessons, journey steps, state inventory and transition descriptions.
- `src/experience/`: scene orchestration, camera views, input handling and playback state.
- `src/scene/`: Three.js objects, shared spatial layout and rendering helpers.
- `src/ui/`: independent reading panel, journey controls, navigation and explanation bubbles.

The 17 cylinder slices represent state components in the paper's tuple order. Symbols on the newest cylinder refer to posterior state. STF plates describe operations, not another state inventory or a strict execution sequence; a full dependency-graph visualization is not implemented.

## Checks

```bash
pnpm typecheck
pnpm test
```

Tests cover journey pause/progression/completion and the specification's state inventory. No additional test package is required (Node 22 type stripping).

## Sources

- [Gray Paper](https://graypaper.com/)
- [Demystifying JAM](https://blog.kianenigma.com/posts/tech/demystifying-jam/)
- [jamcha.in docs](https://docs.jamcha.in/)

If a label and the paper disagree, the paper wins.
