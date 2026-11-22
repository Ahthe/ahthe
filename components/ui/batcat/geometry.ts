import {
  EAR_L_X,
  EAR_R_X,
  EAR_Y,
  EYE_L_X,
  EYE_R_X,
  EYE_Y,
  POLICY,
  R_TRACK_SAT,
  type Side,
} from "./config";

const K = 0.55228475;

export const clamp = (n: number, lo: number, hi: number) =>
  n < lo ? lo : n > hi ? hi : n;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const rand = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
};

/**
 * Balanced ear silhouette with deep bases (y=220, x=6..174) so that no tilt,
 * hop, peek-a-boo duck, airplane-ear spread, or 180° flip pulls a triangle
 * corner inside the r=90 circular clip.
 */
export const earPath = (apexX: number, apexY: number, side: Side): string =>
  side === "right"
    ? `M${fmt(apexX)} ${fmt(apexY)}L58 220H174Z`
    : `M${fmt(apexX)} ${fmt(apexY)}L122 220H6Z`;

export interface EyePathParams {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  flatTop: number;
  crescent: number;
  slant: number;
  side: Side;
}

/**
 * Generates an eye silhouette path morphing smoothly between a regular
 * ellipse, a flat-top D-lid, an inner-slanted focus eye, and a happy "^"
 * crescent. Uses 4 cubic Bézier segments so topology stays constant.
 */
export function eyePath({
  cx,
  cy,
  rx,
  ry,
  flatTop,
  crescent,
  slant,
  side,
}: EyePathParams): string {
  const ft = clamp01(flatTop);
  const cr = clamp01(crescent);
  const sl = clamp(slant, -1, 1);
  const safeRx = Math.max(0, rx);
  const safeRy = Math.max(0, ry);

  if (safeRx <= 0.3 || (safeRy <= 0.35 && cr < 0.15)) {
    return "";
  }

  const topY = cy - safeRy;
  const botY = cy + safeRy;
  const sideY = lerp(cy, topY + safeRy * 0.12, ft);
  const innerDrop = sl * safeRy * 0.45;

  const topLY = topY + (side === "right" ? innerDrop : 0);
  const topRY = topY + (side === "left" ? innerDrop : 0);
  const sideLY = sideY + (side === "right" ? innerDrop * 0.8 : 0);
  const sideRY = sideY + (side === "left" ? innerDrop * 0.8 : 0);
  const topMidY = (topLY + topRY) * 0.5;

  // Base anchor points: Left, TopMid, Right, Bottom
  const L0x = cx - safeRx;
  const L0y = sideLY;
  const TM0x = cx;
  const TM0y = topMidY;
  const R0x = cx + safeRx;
  const R0y = sideRY;
  const B0x = cx;
  const B0y = botY;

  // Base control points
  const s1c1x0 = cx - safeRx;
  const s1c1y0 = lerp(cy - safeRy * K, topLY, ft);
  const s1c2x0 = cx - safeRx * K;
  const s1c2y0 = lerp(topMidY, (topLY + topMidY) * 0.5, ft);

  const s2c1x0 = cx + safeRx * K;
  const s2c1y0 = lerp(topMidY, (topRY + topMidY) * 0.5, ft);
  const s2c2x0 = cx + safeRx;
  const s2c2y0 = lerp(cy - safeRy * K, topRY, ft);

  const botSpanR = Math.max(0.1, botY - sideRY);
  const s3c1x0 = cx + safeRx;
  const s3c1y0 = sideRY + botSpanR * K;
  const s3c2x0 = cx + safeRx * K;
  const s3c2y0 = botY;

  const botSpanL = Math.max(0.1, botY - sideLY);
  const s4c1x0 = cx - safeRx * K;
  const s4c1y0 = botY;
  const s4c2x0 = cx - safeRx;
  const s4c2y0 = sideLY + botSpanL * K;

  if (cr <= 0.001) {
    return `M${fmt(L0x)} ${fmt(L0y)}C${fmt(s1c1x0)} ${fmt(s1c1y0)} ${fmt(s1c2x0)} ${fmt(s1c2y0)} ${fmt(TM0x)} ${fmt(TM0y)}C${fmt(s2c1x0)} ${fmt(s2c1y0)} ${fmt(s2c2x0)} ${fmt(s2c2y0)} ${fmt(R0x)} ${fmt(R0y)}C${fmt(s3c1x0)} ${fmt(s3c1y0)} ${fmt(s3c2x0)} ${fmt(s3c2y0)} ${fmt(B0x)} ${fmt(B0y)}C${fmt(s4c1x0)} ${fmt(s4c1y0)} ${fmt(s4c2x0)} ${fmt(s4c2y0)} ${fmt(L0x)} ${fmt(L0y)}Z`;
  }

  // Happy crescent target ("^ ^")
  const effRy = Math.max(safeRy, 9);
  const rxC = safeRx * 1.12;
  const tipY = cy + effRy * 0.34;
  const outerPeakY = cy - effRy * 0.86;
  const innerPeakY = cy - effRy * 0.12;

  const Lcx = cx - rxC;
  const Lcy = tipY;
  const TMcx = cx;
  const TMcy = outerPeakY;
  const Rcx = cx + rxC;
  const Rcy = tipY;
  const Bcx = cx;
  const Bcy = innerPeakY;

  const s1c1xc = cx - rxC;
  const s1c1yc = lerp(outerPeakY, tipY, 0.42);
  const s1c2xc = cx - rxC * 0.55;
  const s1c2yc = outerPeakY;

  const s2c1xc = cx + rxC * 0.55;
  const s2c1yc = outerPeakY;
  const s2c2xc = cx + rxC;
  const s2c2yc = lerp(outerPeakY, tipY, 0.42);

  const s3c1xc = cx + rxC * 0.72;
  const s3c1yc = lerp(tipY, innerPeakY, 0.48);
  const s3c2xc = cx + rxC * 0.42;
  const s3c2yc = innerPeakY;

  const s4c1xc = cx - rxC * 0.42;
  const s4c1yc = innerPeakY;
  const s4c2xc = cx - rxC * 0.72;
  const s4c2yc = lerp(tipY, innerPeakY, 0.48);

  const Lx = lerp(L0x, Lcx, cr);
  const Ly = lerp(L0y, Lcy, cr);
  const TMx = lerp(TM0x, TMcx, cr);
  const TMy = lerp(TM0y, TMcy, cr);
  const Rx = lerp(R0x, Rcx, cr);
  const Ry = lerp(R0y, Rcy, cr);
  const Bx = lerp(B0x, Bcx, cr);
  const By = lerp(B0y, Bcy, cr);

  return `M${fmt(Lx)} ${fmt(Ly)}C${fmt(lerp(s1c1x0, s1c1xc, cr))} ${fmt(lerp(s1c1y0, s1c1yc, cr))} ${fmt(lerp(s1c2x0, s1c2xc, cr))} ${fmt(lerp(s1c2y0, s1c2yc, cr))} ${fmt(TMx)} ${fmt(TMy)}C${fmt(lerp(s2c1x0, s2c1xc, cr))} ${fmt(lerp(s2c1y0, s2c1yc, cr))} ${fmt(lerp(s2c2x0, s2c2xc, cr))} ${fmt(lerp(s2c2y0, s2c2yc, cr))} ${fmt(Rx)} ${fmt(Ry)}C${fmt(lerp(s3c1x0, s3c1xc, cr))} ${fmt(lerp(s3c1y0, s3c1yc, cr))} ${fmt(lerp(s3c2x0, s3c2xc, cr))} ${fmt(lerp(s3c2y0, s3c2yc, cr))} ${fmt(Bx)} ${fmt(By)}C${fmt(lerp(s4c1x0, s4c1xc, cr))} ${fmt(lerp(s4c1y0, s4c1yc, cr))} ${fmt(lerp(s4c2x0, s4c2xc, cr))} ${fmt(lerp(s4c2y0, s4c2yc, cr))} ${fmt(Lx)} ${fmt(Ly)}Z`;
}

export function buildRootTransform(
  tx: number,
  ty: number,
  tilt: number,
  sx: number,
  sy: number,
  flip: number
): string {
  if (
    Math.abs(tx) < 0.001 &&
    Math.abs(ty) < 0.001 &&
    Math.abs(tilt) < 0.001 &&
    Math.abs(sx - 1) < 0.001 &&
    Math.abs(sy - 1) < 0.001 &&
    Math.abs(flip) < 0.001
  ) {
    return "";
  }
  return `rotate(${fmt(flip)} 90 90) translate(${fmt(tx)} ${fmt(ty)}) rotate(${fmt(tilt)} 90 155) translate(90 155) scale(${fmt(sx)} ${fmt(sy)}) translate(-90 -155)`;
}

export function gazeFromClientPoint(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  gain: number,
  satRadius: number = R_TRACK_SAT
): { gx: number; gy: number; dist: number; dx: number; dy: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  const d = dist || 1;
  const ratio = Math.min(1, dist / satRadius);
  return {
    gx: (dx / d) * ratio * gain,
    gy: (dy / d) * ratio * gain,
    dist,
    dx,
    dy,
  };
}

export const INITIAL_EAR_L = earPath(EAR_L_X, EAR_Y, "left");
export const INITIAL_EAR_R = earPath(EAR_R_X, EAR_Y, "right");
export const INITIAL_EYE_L = eyePath({
  cx: EYE_L_X,
  cy: EYE_Y,
  rx: POLICY.idle.eyeRx,
  ry: POLICY.idle.lidRy,
  flatTop: 0,
  crescent: 0,
  slant: 0,
  side: "left",
});
export const INITIAL_EYE_R = eyePath({
  cx: EYE_R_X,
  cy: EYE_Y,
  rx: POLICY.idle.eyeRx,
  ry: POLICY.idle.lidRy,
  flatTop: 0,
  crescent: 0,
  slant: 0,
  side: "right",
});
