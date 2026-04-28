# BadgeTool

SVG / PNG → 3D badge design tool. Upload a vector or raster image, preview the extruded 3D model in real time, and export as GLB or JSON.

Pure client-side SPA. All data is stored in browser IndexedDB — no backend required.

---

## Features

- **SVG upload** — Drag and drop or click to select `.svg`; all paths are parsed as editable layers
- **PNG vectorization** — Upload `.png`; automatically traced to SVG via [vtracer-wasm](https://github.com/jsscheller/vtracer-wasm), then processed into the 3D pipeline
- **Real-time 3D preview** — Three.js renderer with OrbitControls for interactive rotation
- **Layer settings** — Each path can have its own thickness, bevel, material (6 PBR presets), color, and Z offset
- **Dome effect** — Front-convex / back-concave surface displacement
- **Auto-save** — Silently saves to IndexedDB 2 s after editing stops (only for previously-saved works)
- **Work gallery** — Spiral gallery with pan/zoom, live 3D preview, rename, and delete
- **Export** — GLB 3D model, JSON backup, or ZIP of all works

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build

```bash
npm run build    # TypeScript check + Vite bundle
npm run preview  # Preview production build
```

---

## Usage

### Creating a new work

1. Click **New** on the home screen, or navigate directly to `/work/:id`
2. Drag and drop a `.svg` or `.png` file onto the left panel
   - PNG files are automatically vectorized (progress shown during conversion)
3. Select a path from the layer list and adjust settings in the right panel
4. The 3D viewport updates in real time; drag to rotate

### Layer operations

| Action | Description |
|--------|-------------|
| Click | Select a single layer |
| Cmd/Ctrl + Click | Add to / remove from selection |
| Shift + Click | Range select |
| Cmd/Ctrl + A | Select all |
| Esc | Clear selection |
| Delete / Backspace | Delete selected layers |
| Double-click layer name | Rename |

### Material presets

| Material | Description |
|----------|-------------|
| Brushed Gold | Brushed gold, high metalness |
| Aged Silver | Weathered silver, slightly rough |
| Blackened Steel | Dark steel, very low reflectance |
| Copper | Warm copper tones |
| White Ceramic | White ceramic, non-metallic |
| Matte Polymer | Matte plastic, no gloss |

### Export

- **Export GLB** — Bottom of the right panel; exports a `.glb` 3D model
- **Export JSON** — Exports a work backup including a snapshot
- **Home download icon** — Exports all works as a ZIP archive

---

## Tech Stack

| Item | Version |
|------|---------|
| Vite | 6.x |
| React | 19 |
| TypeScript | 5.x |
| Three.js | 0.177 |
| @react-three/fiber | 9.x |
| @react-three/drei | 10.x |
| React Router | v7 |
| vtracer-wasm | 0.1.0 |
| JSZip | 3.x |
| Lucide React | latest |

---

## Project Structure

```
src/
├── pages/
│   ├── WorkspaceHome.tsx     # Home gallery
│   └── MedalWorkbench.tsx    # Editor
├── components/
│   ├── ModelPreview.tsx      # react-three-fiber Canvas
│   └── HomeLivePreviewLayer.tsx  # Multi-viewport WebGL layer for home
├── lib/
│   ├── modelBuilder.ts       # SVG → THREE.Group
│   ├── pngToSvg.ts           # PNG → SVG (vtracer-wasm)
│   ├── workStorage.ts        # IndexedDB
│   ├── snapshot.ts           # Off-screen snapshot
│   ├── exportModel.ts        # GLTFExporter
│   └── ...
└── styles/globals.css
```

---

## Data Format

Works are stored as JSON, compatible with the [badgetool](https://github.com/maowu/VibeCodingTools) showcase ZIP format:

```jsonc
{
  "kind": "com.badgetool.work",
  "schemaVersion": 1,
  "document": { "id": "...", "title": "...", "createdAt": "...", "updatedAt": "..." },
  "source": { "primaryAssetId": "...", "assets": [{ "kind": "source-svg", "text": "..." }] },
  "scene": { "settings": { "modelSize": 4.8, "canvas": {}, "dome": {}, "shapeSettings": {} } },
  "preview": { "snapshot": { "dataUrl": "data:image/png;base64,..." } }
}
```

---

## License

MIT
