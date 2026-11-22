export type Mode =
  | "startled"
  | "purring"
  | "pouncing"
  | "annoyed"
  | "hanging"
  | "dizzy"
  | "tracking"
  | "curious"
  | "idle"
  | "bored"
  | "drowsy";

export type Side = "left" | "right";

export interface PosePolicy {
  earY: number;
  /** Positive pushes both ears outward away from center. */
  earSpread: number;
  lidRy: number;
  lidCy: number;
  eyeRx: number;
  flatTop: number;
  slant: number;
  gain: number;
}

export interface CircadianProfile {
  isNight: boolean;
  boredMs: number;
  drowsyMs: number;
  lidBonus: number;
  earBonus: number;
}

/* ------------------------------------------------------------------ *
 * Balanced feline proportions. viewBox is 180x180 rendered at 40px
 * (1 CSS px = 4.5 viewBox units). Displacements under ~7 units do not
 * register as motion; held poses need ~13 units to read at 40px.
 * ------------------------------------------------------------------ */
export const HEAD = { x: 90, y: 110 };
export const HEAD_RX = 39;
export const HEAD_RY = 40;
export const EYE_L_X = 77.5;
export const EYE_R_X = 102.5;
export const EYE_Y = 112;
export const EAR_L_X = 62;
export const EAR_R_X = 118;
export const EAR_Y = 32;

export const EYE_TRAVEL = 18;
export const HEAD_TRAVEL = 6;
export const EAR_LAG_TRAVEL = 3;

export const FALLBACK_LOOK_TARGETS: Array<[number, number]> = [
  [0.75, 0.35],
  [0.95, 0.1],
  [-0.6, 0.2],
  [0, -0.35],
  [-0.35, 0.5],
];

/* ------------------------------------------------------------------ *
 * Timing, stimulus & tactile tuning.
 * ------------------------------------------------------------------ */
export const TICK_MS = 100;

export const R_NEAR = 140;
export const R_FAR = 700;
export const R_TRACK_SAT = 100;
export const V_REF = 1200;
export const V_STARTLE = 2500;
export const R_STARTLE = 80;

export const TAU_AROUSAL_UP = 0.25;
export const TAU_AROUSAL_DOWN = 3.0;
export const INTEREST_UP = 0.55;
export const INTEREST_DOWN = 0.12;

export const SACCADE_MS = 110;
export const SACCADE_DEADZONE = 5;
export const SACCADE_LATENCY: [number, number] = [80, 160];
export const DOUBLE_TAKE_MS = 800;
export const LID_STAGGER_MS = 18;

export const STARTLE_REFRACTORY_MS = 2500;
export const FLICK_EVERY: [number, number] = [5000, 11_000];
export const LOOKAWAY_EVERY: [number, number] = [12_000, 20_000];
export const TILT_COOLDOWN_MS = 25_000;
export const SLOWBLINK_COOLDOWN_MS = 18_000;
export const POUNCE_COOLDOWN_MS = 12_000;
export const ANNOYED_COOLDOWN_MS = 8000;
export const BATHANG_COOLDOWN_MS = 20_000;
export const REUNION_AWAY_MS = 15_000;

export const R_PET = 34;
export const V_PET_MAX = 650;
export const PET_MIN_STROKE_PX = 6;
export const PET_REVERSALS = 2;
export const PET_WINDOW_MS = 1400;
export const PET_HOLD_MS = 1600;
export const PET_MAX_CONTINUOUS_MS = 3600;
export const PET_REENTER_COOLDOWN_MS = 1200;

export const R_HOVER_BLINK = 48;
export const V_HOVER_MAX = 100;
export const HOVER_BLINK_MS = 1200;

export const R_WIGGLE_MIN = 65;
export const R_WIGGLE_MAX = 220;
export const V_WIGGLE_MIN = 180;
export const V_WIGGLE_MAX = 1800;
export const WIGGLE_MIN_DELTA_PX = 12;
export const WIGGLE_REVERSALS = 4;
export const WIGGLE_WINDOW_MS = 1600;

export const DIZZY_COOLDOWN_MS = 12_000;
export const DIZZY_RADIANS = Math.PI * 2 * 2.75;
export const R_ORBIT_MIN = 20;
export const R_ORBIT_MAX = 220;

export const SCROLL_BREEZE_SPEED = 900;
export const SCROLL_BREEZE_COOLDOWN_MS = 2500;

export const R_POKE = 26;
export const POKE_WINDOW_MS = 2400;
export const POKE_ANNOYED_COUNT = 3;
export const POKE_BATHANG_COUNT = 5;

export const POLICY: Record<Mode, PosePolicy> = {
  startled: {
    earY: 53,
    earSpread: 13,
    lidRy: 9,
    lidCy: 2,
    eyeRx: 8.8,
    flatTop: 0.4,
    slant: 0,
    gain: 1,
  },
  purring: {
    earY: 40,
    earSpread: 8,
    lidRy: 11,
    lidCy: 0,
    eyeRx: 10,
    flatTop: 0,
    slant: 0,
    gain: 0.2,
  },
  pouncing: {
    earY: 22,
    earSpread: -4,
    lidRy: 16,
    lidCy: 0,
    eyeRx: 9.6,
    flatTop: 0.35,
    slant: 0.68,
    gain: 1,
  },
  annoyed: {
    earY: 56,
    earSpread: 22,
    lidRy: 7.5,
    lidCy: 2,
    eyeRx: 8.8,
    flatTop: 0.9,
    slant: 0.2,
    gain: 0,
  },
  hanging: {
    earY: 27,
    earSpread: -2,
    lidRy: 15,
    lidCy: 0,
    eyeRx: 9.2,
    flatTop: 0,
    slant: 0,
    gain: 0.4,
  },
  dizzy: {
    earY: 44,
    earSpread: 10,
    lidRy: 11.5,
    lidCy: 0,
    eyeRx: 8.8,
    flatTop: 0.25,
    slant: 0,
    gain: 0,
  },
  tracking: {
    earY: 25,
    earSpread: -4,
    lidRy: 15,
    lidCy: 0,
    eyeRx: 8.4,
    flatTop: 0,
    slant: 0.1,
    gain: 1,
  },
  curious: {
    earY: 27,
    earSpread: -2,
    lidRy: 16,
    lidCy: 0,
    eyeRx: 9.4,
    flatTop: 0,
    slant: 0,
    gain: 0.9,
  },
  idle: {
    earY: 32,
    earSpread: 0,
    lidRy: 14,
    lidCy: 0,
    eyeRx: 7.8,
    flatTop: 0,
    slant: 0,
    gain: 0.55,
  },
  bored: {
    earY: 44,
    earSpread: 5,
    lidRy: 10,
    lidCy: 3,
    eyeRx: 7.8,
    flatTop: 0.45,
    slant: 0,
    gain: 0,
  },
  drowsy: {
    earY: 51,
    earSpread: 10,
    lidRy: 6.5,
    lidCy: 7.5,
    eyeRx: 7.8,
    flatTop: 0.72,
    slant: 0,
    gain: 0,
  },
};

export function getCircadianProfile(date: Date = new Date()): CircadianProfile {
  const hour = date.getHours();
  const isNight = hour >= 22 || hour < 4;
  return isNight
    ? {
        isNight: true,
        boredMs: 42_000,
        drowsyMs: 75_000,
        lidBonus: 1.5,
        earBonus: -3,
      }
    : {
        isNight: false,
        boredMs: 25_000,
        drowsyMs: 45_000,
        lidBonus: 0,
        earBonus: 0,
      };
}
