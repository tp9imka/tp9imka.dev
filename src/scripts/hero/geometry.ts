export type Size = { w: number; h: number };
const EDGE_PX = 8;

// Keeps a cursor and its trailing label fully inside the stage.
export function clampPoint(x: number, y: number, stage: Size, label: Size): { x: number; y: number } {
  const maxX = Math.max(EDGE_PX, stage.w - label.w - EDGE_PX);
  const maxY = Math.max(EDGE_PX, stage.h - label.h - EDGE_PX);
  return { x: Math.min(Math.max(x, EDGE_PX), maxX), y: Math.min(Math.max(y, EDGE_PX), maxY) };
}
