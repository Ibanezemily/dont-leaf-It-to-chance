// Board artwork + geometry imported from Figma
// "Board small ver. - print + page size" — node 254:2723
// https://www.figma.com/design/s0ZT7CGKbukVegcWBJT6Qi/Project-Alpha?node-id=254-2723
//
// Every vector here is an exported Figma asset (the ring bands and splats carry
// noise/grain filters that can't be reproduced by hand). Placement below mirrors
// Figma exactly: each piece is drawn at its natural SVG size, centred on `cx`/`cy`,
// then rotated `rot` degrees about that centre (`flipY` mirrors first).

import innerPath from './inner-path.svg';
import middlePath from './middle-path.svg';
import outerPath from './outer-path.svg';
import ellipse94Stroke from './ellipse94-stroke.svg';
import arc425 from './arc-425.svg';
import arc494 from './arc-494.svg';
import arc495 from './arc-495.svg';
import tileEllipse8 from './tile-ellipse8.svg';
import innerPathBridge from './inner-path-bridge.svg';
import middlePathBridge1 from './middle-path-bridge-1.svg';
import middlePathBridge2 from './middle-path-bridge-2.svg';
import outerPathBridge from './outer-path-bridge.svg';
import outerPathBridge1 from './outer-path-bridge-1.svg';
import pathBridge from './path-bridge.svg';
import finishSplat1 from './finish-splat-1.svg';
import finishSplat2 from './finish-splat-2.svg';
import finishSplat3 from './finish-splat-3.svg';
import splatDot1 from './splat-dot-1.svg';
import splatDot2 from './splat-dot-2.svg';
import splatDot3 from './splat-dot-3.svg';
import splatDot4 from './splat-dot-4.svg';
import gateBadge113 from './gate-badge-113.svg';
import gateBadge114 from './gate-badge-114.svg';
import gateBadge115 from './gate-badge-115.svg';
import gateBadge116 from './gate-badge-116.svg';
import gateBadge117 from './gate-badge-117.svg';
import gateBadge47 from './gate-badge-47.svg';
import ellipse34 from './ellipse34.svg';
// Exported as PNG: the SVG version of this 30×20 graphic is 916 kB of
// flattened noise geometry, vs 3 kB at 4× raster.
import eggs from './eggs.png';
import puddle from './puddle.svg';
import decoGroup105 from './deco-group105.svg';
import decoGroup106 from './deco-group106.svg';
import decoGroup119 from './deco-group119.svg';
import decoGroup120 from './deco-group120.svg';
import decoGroup121 from './deco-group121.svg';
import decoGroup51 from './deco-group51.svg';
import decoGroup53 from './deco-group53.svg';
import decoGroup80 from './deco-group80.svg';
import deco9 from './deco-9.svg';
import decoRect58 from './deco-rect58.svg';
import decoRect59 from './deco-rect59.svg';
import decoRect78 from './deco-rect78.svg';
import decoRect79 from './deco-rect79.svg';
import decoEllipse44 from './deco-ellipse44.svg';
import decoEllipse95 from './deco-ellipse95.svg';

// ── Frame ──────────────────────────────────────────────────────────────────
// Figma artboard is a landscape print sheet; the board is centred in it.
export const BOARD_W = 792;
export const BOARD_H = 612;
export const BOARD_CX = 396;
export const BOARD_CY = 306;

export const PAGE_BG = '#f1fde8';

// ── Tile styling (Figma "Board Spaces" component) ──────────────────────────
export const TILE_SZ = 53; // diameter
export const TILE_R = TILE_SZ / 2;
export const TILE_TRIVIA_FILL = '#d0e497';
export const TILE_PLAIN_FILL = '#f1fde8'; // same as the page — reads as a hole in the track
export const TILE_INK = '#334207';
export const TILE_QMARK_SZ = 23.38;
export const TILE_ELLIPSE = tileEllipse8;
export const TILE_ELLIPSE_SZ = 43;

// Grass / caterpillar blades are plain shapes in Figma, not exported vectors.
export const BLADE_COLOR = '#475f23';
export const BLADE_W = 3.035;
export const BLADE_H = 24.277;
export const BLADE_RX = 1.395;

export type ArtPiece = {
  src: string;
  w: number; // natural SVG width
  h: number; // natural SVG height
  cx: number;
  cy: number;
  rot?: number; // degrees, clockwise
  flipY?: boolean; // mirrored vertically before rotating (Figma's -scale-y-100)
  // Some Figma layers inset the image asymmetrically inside their wrapper, so the
  // artwork is offset from the wrapper centre *within the rotated frame*.
  offX?: number;
  offY?: number;
  // Bridges and their "3 🍃" badges paint above the tiles so a gate is never
  // hidden behind the space it leads off. Everything else sits under them.
  top?: boolean;
};

// Painted back-to-front, matching Figma's layer order. Ring tiles are drawn
// between the `top: true` pieces and the rest; player pieces go above both.
export const ART: ArtPiece[] = [
  { src: decoGroup120, w: 22.7067, h: 40.3088, cx: 759.079, cy: 63.5765, rot: -119.52, flipY: true },
  { src: innerPath, w: 193.82, h: 193.82, cx: 396.5, cy: 306.5 },
  { src: outerPath, w: 560.82, h: 560.82, cx: 396, cy: 306 },
  { src: arc495, w: 157.747, h: 151.038, cx: 272.4385, cy: 490.699, rot: -102.61, flipY: true },
  { src: middlePath, w: 378.82, h: 378.82, cx: 396, cy: 306 },
  { src: arc494, w: 157.747, h: 151.038, cx: 613.403, cy: 263.574, rot: 121.56, flipY: true },
  { src: ellipse94Stroke, w: 137, h: 137, cx: 397.5, cy: 304.5 },
  { src: finishSplat1, w: 69.1965, h: 70.3329, cx: 728.932, cy: 176.5005 },
  { src: arc425, w: 115.709, h: 128.397, cx: 258.5495, cy: 300.5555, rot: -41.95, flipY: true },
  { src: finishSplat2, w: 69.1966, h: 70.3325, cx: 657.932, cy: 546.5005 },
  { src: innerPathBridge, w: 51.0245, h: 59.4156, cx: 333.36, cy: 387.87, rot: 83.98 , top: true },
  { src: ellipse34, w: 22.01, h: 21.3648, cx: 417.5, cy: 278.98, rot: 87.76 },
  { src: middlePathBridge2, w: 51.1088, h: 56.5935, cx: 535.18, cy: 170.86, rot: -91.86 , top: true },
  { src: middlePathBridge1, w: 54.1802, h: 52.8099, cx: 395.91, cy: 501.09, rot: 38 , top: true },
  { src: outerPathBridge, w: 61.8962, h: 59.4633, cx: 108.5, cy: 309.41, rot: 126.1 , top: true },
  { src: gateBadge116, w: 31.2816, h: 58.3041, cx: 534.393, cy: 167.359, rot: -131.9 , top: true },
  { src: gateBadge114, w: 31.2816, h: 58.3041, cx: 395.401, cy: 502.912 , top: true },
  { src: gateBadge115, w: 31.2816, h: 58.3041, cx: 113.1635, cy: 308.8945, rot: 88.98 , top: true },
  { src: outerPathBridge1, w: 80.9984, h: 81.4517, cx: 668.36, cy: 197.5, rot: 159.1, flipY: true , top: true },
  { src: pathBridge, w: 80.9984, h: 81.4517, cx: 605.35, cy: 509.37, rot: -137.97, flipY: true , top: true },
  { src: gateBadge117, w: 31.2816, h: 58.3041, cx: 664.117, cy: 196.886, rot: -109.48 , top: true },
  { src: gateBadge113, w: 31.2816, h: 58.3041, cx: 604.438, cy: 506.294, rot: -48.43 , top: true },
  { src: eggs, w: 30.25, h: 20.5, cx: 397.7245, cy: 322.738 },
  { src: puddle, w: 215.766, h: 111.082, cx: 65.113, cy: 550.461 },
  { src: finishSplat3, w: 69.1961, h: 70.333, cx: 48.932, cy: 306.5 },
  { src: splatDot1, w: 22.3271, h: 22.6734, cx: 695.341, cy: 519.514 },
  { src: splatDot2, w: 22.3272, h: 22.6734, cx: 604.341, cy: 567.514 },
  { src: splatDot3, w: 22.3271, h: 22.6735, cx: 72.341, cy: 258.514 },
  { src: splatDot4, w: 22.3272, h: 22.6734, cx: 708.831, cy: 124.504 },
  // Inner-ring gate badge — Figma keeps its "3" and leaf glyph as separate layers.
  { src: gateBadge47, w: 31.2816, h: 58.3041, cx: 324.911, cy: 388.9245, rot: -128.1 , top: true },
  { src: decoGroup105, w: 8.46666, h: 14.7956, cx: 339.5225, cy: 380.345, rot: -1.28 , top: true },
  { src: decoGroup106, w: 29.7406, h: 56.1369, cx: 710.2785, cy: 68.7955, rot: -58.9 },
  { src: deco9, w: 8.26242, h: 11.7618, cx: 330.1985, cy: 381.386, rot: 2.95 , top: true },
  // Butterfly at the puddle (lower left)
  { src: decoGroup51, w: 60.299, h: 64.2514, cx: 31.5695, cy: 482.378, rot: -11.82 },
  { src: decoGroup80, w: 26.1208, h: 46.5174, cx: 21.279, cy: 478.9235, rot: -169.43, flipY: true },
  { src: decoRect58, w: 35.0533, h: 35.0525, cx: 79, cy: 481.9215, rot: -14.9, offX: 12.9985, offY: 10.0645 },
  { src: decoRect59, w: 13.1484, h: 13.1477, cx: 116.33, cy: 496.3155, rot: -31.92, offX: -5.624, offY: 2.455 },
  // Caterpillar on leaves (top right)
  { src: decoGroup53, w: 63.9682, h: 32.4347, cx: 731.5285, cy: 39.195, rot: 4.08, offX: -0.2415, offY: -0.2428 },
  { src: decoGroup119, w: 23.9968, h: 41.2168, cx: 750.2275, cy: 90.6805, rot: -53.2 },
  { src: decoEllipse44, w: 1.72316, h: 3.56679, cx: 708.0065, cy: 56.114, rot: -45.55 },
  { src: decoEllipse95, w: 1.92815, h: 2.62239, cx: 711.8205, cy: 59.083, rot: -58.9 },
  // Chrysalis on a branch (top left)
  { src: decoRect78, w: 15.5782, h: 98.4675, cx: 27.6885, cy: 44.0845, rot: 42.7, offX: 0.2605, offY: 4.3 },
  { src: decoRect79, w: 6.26875, h: 13.1948, cx: 54.0785, cy: 25.889, rot: 72.34, offX: 0.3417, offY: 0.4335 },
  { src: decoGroup121, w: 36.4231, h: 67.6667, cx: 56.471, cy: 60.022, rot: -179.88, flipY: true },
];

// Grass tufts and the two caterpillar body segments by the puddle.
export const BLADES: Array<{ cx: number; cy: number; rot?: number }> = [
  { cx: -56.4825, cy: 552.4085 },
  { cx: -47.3825, cy: 543.2985 },
  { cx: 110.874, cy: 594.7475, rot: -33.31 },
  { cx: 116.5975, cy: 586.7985 },
  { cx: 123.6805, cy: 592.6595, rot: 19.91 },
  { cx: 50.934, cy: 129.0775, rot: -33.31 },
  { cx: 57.5175, cy: 123.1385 },
  { cx: 63.7305, cy: 126.9995, rot: 19.91 },
  { cx: 653.934, cy: 78.0775, rot: -33.31 },
  { cx: 660.5175, cy: 72.1385 },
  { cx: 666.7305, cy: 75.9995, rot: 19.91 },
  { cx: 118.934, cy: 59.0775, rot: -33.31 },
  { cx: 125.5175, cy: 53.1385 },
  { cx: 131.7305, cy: 56.9995, rot: 19.91 },
  { cx: 729.934, cy: 456.0775, rot: -33.31 },
  { cx: 736.5175, cy: 450.1385 },
  { cx: 742.7305, cy: 453.9995, rot: 19.91 },
  { cx: 745.934, cy: 546.0775, rot: -33.31 },
  { cx: 752.5175, cy: 540.1385 },
  { cx: 758.7305, cy: 543.9995, rot: 19.91 },
];

// "finish" wordmarks sitting on the three red splats.
export const FINISH_LABELS = [
  { x: 729, y: 176.43 },
  { x: 656.62, y: 546.35 },
  { x: 47.91, y: 307.57 },
];

export const START_LABEL = { x: 396.5, y: 302.5 };

// ── Tiles ──────────────────────────────────────────────────────────────────
// Ordered clockwise (the direction the big green arrows point). `rot` is the
// tile's own rotation in Figma — it turns the "?" glyph to face along the track.
export type TileKind = 'trivia' | 'normal';
export type Tile = { x: number; y: number; rot: number; kind: TileKind };

export const TILES: Tile[][] = [
  // Ring 1 — inner, 6 tiles
  [
    { x: 457.71, y: 312.64, rot: 96.69, kind: 'normal' },
    { x: 421.31, y: 361.49, rot: 156.69, kind: 'trivia' },
    { x: 360.79, y: 354.4, rot: -143.31, kind: 'normal' },
    { x: 336.68, y: 298.45, rot: -83.31, kind: 'trivia' },
    { x: 373.08, y: 249.59, rot: -23.31, kind: 'trivia' },
    { x: 433.59, y: 256.68, rot: 36.69, kind: 'trivia' },
  ],
  // Ring 2 — middle, 8 tiles
  [
    { x: 503.46, y: 410.15, rot: 157.5, kind: 'normal' },
    { x: 394.78, y: 455.17, rot: 180, kind: 'trivia' },
    { x: 286.09, y: 410.15, rot: -135, kind: 'normal' },
    { x: 241.08, y: 301.47, rot: -90, kind: 'normal' },
    { x: 286.09, y: 192.79, rot: -45, kind: 'trivia' },
    { x: 394.78, y: 147.77, rot: 0, kind: 'trivia' },
    { x: 503.46, y: 192.79, rot: 45, kind: 'normal' },
    { x: 548.48, y: 301.47, rot: 90, kind: 'trivia' },
  ],
  // Ring 3 — outer, 16 tiles
  [
    { x: 634.82, y: 306.32, rot: 90, kind: 'normal' },
    { x: 616.67, y: 397.59, rot: 112.5, kind: 'trivia' },
    { x: 564.97, y: 474.97, rot: 135, kind: 'trivia' },
    { x: 487.59, y: 526.67, rot: 157.5, kind: 'normal' },
    { x: 396.32, y: 544.82, rot: 180, kind: 'normal' },
    { x: 305.05, y: 526.67, rot: -157.5, kind: 'trivia' },
    { x: 227.68, y: 474.97, rot: -135, kind: 'trivia' },
    { x: 175.98, y: 397.59, rot: -112.5, kind: 'normal' },
    { x: 157.82, y: 306.32, rot: -90, kind: 'normal' },
    { x: 173.62, y: 211.62, rot: -67.5, kind: 'normal' },
    { x: 227.68, y: 137.68, rot: -45, kind: 'trivia' },
    { x: 305.05, y: 85.98, rot: -22.5, kind: 'trivia' },
    { x: 396.32, y: 67.82, rot: 0, kind: 'normal' },
    { x: 487.59, y: 85.98, rot: 22.5, kind: 'trivia' },
    { x: 564.97, y: 137.68, rot: 45, kind: 'trivia' },
    { x: 616.67, y: 215.05, rot: 67.5, kind: 'normal' },
  ],
];

export const RING_SEGS = TILES.map(r => r.length);

// ── Gates ──────────────────────────────────────────────────────────────────
// Each Figma "3 🍃" badge marks a bridge off a specific tile. `to` is where the
// bridge lands: a tile on the next ring, or 'finish' for the three red splats.
export type Gate = { ring: number; seg: number; to: { ring: number; seg: number } | 'finish' };

export const GATES: Gate[] = [
  { ring: 0, seg: 2, to: { ring: 1, seg: 2 } }, // inner path bridge
  { ring: 1, seg: 1, to: { ring: 2, seg: 4 } }, // middle path bridge 1
  { ring: 1, seg: 6, to: { ring: 2, seg: 14 } }, // middle path bridge 2
  { ring: 2, seg: 2, to: 'finish' }, // lower-right splat
  { ring: 2, seg: 8, to: 'finish' }, // left splat
  { ring: 2, seg: 15, to: 'finish' }, // upper-right splat
];

export function gateAt(ring: number, seg: number): Gate | undefined {
  return GATES.find(g => g.ring === ring && g.seg === seg);
}

export function tileAt(ring: number, seg: number): Tile {
  return TILES[ring][seg];
}

/** SVG transform placing an art piece at its Figma position. */
export function artTransform(a: ArtPiece): string {
  const parts = [`translate(${a.cx} ${a.cy})`];
  if (a.rot) parts.push(`rotate(${a.rot})`);
  if (a.flipY) parts.push('scale(1 -1)');
  if (a.offX || a.offY) parts.push(`translate(${a.offX ?? 0} ${a.offY ?? 0})`);
  parts.push(`translate(${-a.w / 2} ${-a.h / 2})`);
  return parts.join(' ');
}
