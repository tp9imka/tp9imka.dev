// Board layout. On phones WORK and VERIFY share one column so cards stay readable,
// and MERGED becomes a narrow drop strip on the right.
export type Col = { x: number; w: number };
export type BoardGeo = { narrow: boolean; cols: [Col, Col, Col]; cw: number; guardX: number };

const NARROW_BELOW_PX = 640;
const NARROW_SPLIT = 0.64;
const MAX_CARD_PX = 330;
const LANE_PAD_PX = 28;
const NARROW_PAD_PX = 16;

export function boardGeometry(width: number): BoardGeo {
  if (width < NARROW_BELOW_PX) {
    const split = Math.round(width * NARROW_SPLIT);
    const flight = { x: 0, w: split };
    return { narrow: true, cols: [flight, flight, { x: split, w: width - split }], cw: split - NARROW_PAD_PX, guardX: split };
  }
  const lw = width / 3;
  return { narrow: false, cols: [{ x: 0, w: lw }, { x: lw, w: lw }, { x: 2 * lw, w: lw }], cw: Math.min(MAX_CARD_PX, lw - LANE_PAD_PX), guardX: 2 * lw };
}
