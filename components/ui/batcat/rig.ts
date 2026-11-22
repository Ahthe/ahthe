"use client";

import { useMemo } from "react";
import {
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  type Easing,
  type MotionValue,
} from "framer-motion";
import {
  EAR_LAG_TRAVEL,
  EAR_L_X,
  EAR_R_X,
  EAR_Y,
  EYE_L_X,
  EYE_R_X,
  EYE_TRAVEL,
  EYE_Y,
  HEAD,
  HEAD_TRAVEL,
  POLICY,
} from "./config";
import { buildRootTransform, earPath, eyePath } from "./geometry";

export type Channel = "blink" | "ear" | "gaze" | "pose" | "choreo";

export type AnimControl = ReturnType<typeof animate>;

export interface AnimOptions {
  duration?: number;
  delay?: number;
  ease?: Easing | Easing[];
}

export interface ChannelContext {
  isAlive: () => boolean;
  anim: (
    mv: MotionValue<number>,
    to: number,
    options?: AnimOptions
  ) => AnimControl | null;
  after: (ms: number, cb: () => void) => void;
  busyFor: (ms: number) => void;
}

export interface GestureScheduler {
  run: (channel: Channel, fn: (ctx: ChannelContext) => void) => void;
  cancel: (channel: Channel) => void;
  cancelMany: (channels: Channel[]) => void;
  cancelAll: () => void;
  isBusy: (...channels: Channel[]) => boolean;
}

const ALL_CHANNELS: Channel[] = ["blink", "ear", "gaze", "pose", "choreo"];

export function createGestureScheduler(): GestureScheduler {
  const buckets: Record<
    Channel,
    {
      gen: number;
      timers: number[];
      controls: AnimControl[];
      busyUntil: number;
    }
  > = {
    blink: { gen: 0, timers: [], controls: [], busyUntil: 0 },
    ear: { gen: 0, timers: [], controls: [], busyUntil: 0 },
    gaze: { gen: 0, timers: [], controls: [], busyUntil: 0 },
    pose: { gen: 0, timers: [], controls: [], busyUntil: 0 },
    choreo: { gen: 0, timers: [], controls: [], busyUntil: 0 },
  };

  const cancel = (channel: Channel) => {
    const b = buckets[channel];
    b.gen += 1;
    b.busyUntil = 0;
    for (let i = 0; i < b.timers.length; i += 1) {
      window.clearTimeout(b.timers[i]);
    }
    for (let i = 0; i < b.controls.length; i += 1) {
      b.controls[i].stop();
    }
    b.timers = [];
    b.controls = [];
  };

  const cancelMany = (channels: Channel[]) => {
    for (let i = 0; i < channels.length; i += 1) {
      cancel(channels[i]);
    }
  };

  const cancelAll = () => {
    cancelMany(ALL_CHANNELS);
  };

  const isBusy = (...channels: Channel[]) => {
    const now = Date.now();
    for (let i = 0; i < channels.length; i += 1) {
      if (buckets[channels[i]].busyUntil > now) return true;
    }
    return false;
  };

  const run = (channel: Channel, fn: (ctx: ChannelContext) => void) => {
    cancel(channel);
    const b = buckets[channel];
    const myGen = b.gen;

    const ctx: ChannelContext = {
      isAlive: () => b.gen === myGen,
      anim: (mv, to, options) => {
        if (b.gen !== myGen) return null;
        const ctrl = animate(mv, to, options);
        b.controls.push(ctrl);
        return ctrl;
      },
      after: (ms, cb) => {
        if (b.gen !== myGen) return;
        const id = window.setTimeout(() => {
          if (b.gen !== myGen) return;
          cb();
        }, ms);
        b.timers.push(id);
      },
      busyFor: (ms) => {
        if (b.gen !== myGen) return;
        const until = Date.now() + ms;
        if (until > b.busyUntil) b.busyUntil = until;
      },
    };

    fn(ctx);
  };

  return { run, cancel, cancelMany, cancelAll, isBusy };
}

export interface BatCatRig {
  gazeX: MotionValue<number>;
  gazeY: MotionValue<number>;
  vergenceTarget: MotionValue<number>;
  poseLidRy: MotionValue<number>;
  lidOpenL: MotionValue<number>;
  lidOpenR: MotionValue<number>;
  lidCy: MotionValue<number>;
  eyeRx: MotionValue<number>;
  flatTop: MotionValue<number>;
  crescent: MotionValue<number>;
  slant: MotionValue<number>;
  earLY: MotionValue<number>;
  earRY: MotionValue<number>;
  earFlickOffsetL: MotionValue<number>;
  earFlickOffsetR: MotionValue<number>;
  earSpreadL: MotionValue<number>;
  earSpreadR: MotionValue<number>;
  rootTx: MotionValue<number>;
  rootTy: MotionValue<number>;
  tilt: MotionValue<number>;
  rootSx: MotionValue<number>;
  rootSy: MotionValue<number>;
  flip: MotionValue<number>;
  headCx: MotionValue<number>;
  headCy: MotionValue<number>;
  earLD: MotionValue<string>;
  earRD: MotionValue<string>;
  eyeLD: MotionValue<string>;
  eyeRD: MotionValue<string>;
  rootTransform: MotionValue<string>;
}

const EYE_SPRING = { stiffness: 560, damping: 30, mass: 0.4 };
const HEAD_SPRING = { stiffness: 110, damping: 20, mass: 0.9 };
const EAR_SPRING = { stiffness: 90, damping: 19, mass: 1 };
const VERGENCE_SPRING = { stiffness: 200, damping: 26, mass: 0.6 };
const BODY_SPRING = { stiffness: 240, damping: 24, mass: 0.65 };
const SCALE_SPRING = { stiffness: 260, damping: 25, mass: 0.6 };
const POSE_SPRING = { stiffness: 280, damping: 26, mass: 0.6 };

export function useBatCatRig(): BatCatRig {
  const gazeX = useMotionValue(0);
  const gazeY = useMotionValue(0);
  const vergenceTarget = useMotionValue(0);

  const poseLidRy = useMotionValue(POLICY.idle.lidRy);
  const lidOpenL = useMotionValue(1);
  const lidOpenR = useMotionValue(1);
  const lidCy = useMotionValue(0);
  const eyeRx = useMotionValue(POLICY.idle.eyeRx);
  const flatTop = useMotionValue(0);
  const crescent = useMotionValue(0);
  const slant = useMotionValue(0);

  const earLY = useMotionValue(EAR_Y);
  const earRY = useMotionValue(EAR_Y);
  const earFlickOffsetL = useMotionValue(0);
  const earFlickOffsetR = useMotionValue(0);
  const earSpreadL = useMotionValue(0);
  const earSpreadR = useMotionValue(0);

  const rootTx = useMotionValue(0);
  const rootTy = useMotionValue(0);
  const tilt = useMotionValue(0);
  const rootSx = useMotionValue(1);
  const rootSy = useMotionValue(1);
  const flip = useMotionValue(0);

  const headFollowX = useSpring(gazeX, HEAD_SPRING);
  const headFollowY = useSpring(gazeY, HEAD_SPRING);
  const earFollowX = useSpring(gazeX, EAR_SPRING);
  const eyeGazeX = useSpring(gazeX, EYE_SPRING);
  const eyeGazeY = useSpring(gazeY, EYE_SPRING);
  const vergence = useSpring(vergenceTarget, VERGENCE_SPRING);

  const smoothRootTx = useSpring(rootTx, BODY_SPRING);
  const smoothRootTy = useSpring(rootTy, BODY_SPRING);
  const smoothTilt = useSpring(tilt, BODY_SPRING);
  const smoothRootSx = useSpring(rootSx, SCALE_SPRING);
  const smoothRootSy = useSpring(rootSy, SCALE_SPRING);

  const smoothEarLY = useSpring(earLY, POSE_SPRING);
  const smoothEarRY = useSpring(earRY, POSE_SPRING);
  const smoothEarSpreadL = useSpring(earSpreadL, POSE_SPRING);
  const smoothEarSpreadR = useSpring(earSpreadR, POSE_SPRING);
  const smoothPoseLidRy = useSpring(poseLidRy, POSE_SPRING);
  const smoothLidCy = useSpring(lidCy, POSE_SPRING);
  const smoothFlatTop = useSpring(flatTop, POSE_SPRING);

  const headCx = useTransform(headFollowX, (v) => HEAD.x + v * HEAD_TRAVEL);
  const headCy = useTransform(headFollowY, (v) => HEAD.y + v * HEAD_TRAVEL);

  const earLD = useTransform(
    [
      smoothEarLY,
      earFlickOffsetL,
      smoothEarSpreadL,
      earFollowX,
    ] as MotionValue<number>[],
    ([y, flickY, spread, follow]: number[]) =>
      earPath(EAR_L_X - spread - follow * EAR_LAG_TRAVEL, y + flickY, "left")
  );
  const earRD = useTransform(
    [
      smoothEarRY,
      earFlickOffsetR,
      smoothEarSpreadR,
      earFollowX,
    ] as MotionValue<number>[],
    ([y, flickY, spread, follow]: number[]) =>
      earPath(EAR_R_X + spread - follow * EAR_LAG_TRAVEL, y + flickY, "right")
  );

  const eyeLD = useTransform(
    [
      eyeGazeX,
      eyeGazeY,
      vergence,
      smoothLidCy,
      eyeRx,
      smoothPoseLidRy,
      lidOpenL,
      smoothFlatTop,
      crescent,
      slant,
    ] as MotionValue<number>[],
    ([gx, gy, v, lcy, rx, ry, open, ft, cr, sl]: number[]) =>
      eyePath({
        cx: EYE_L_X + gx * EYE_TRAVEL + v,
        cy: EYE_Y + gy * EYE_TRAVEL + lcy,
        rx,
        ry: ry * open,
        flatTop: ft,
        crescent: cr,
        slant: sl,
        side: "left",
      })
  );

  const eyeRD = useTransform(
    [
      eyeGazeX,
      eyeGazeY,
      vergence,
      smoothLidCy,
      eyeRx,
      smoothPoseLidRy,
      lidOpenR,
      smoothFlatTop,
      crescent,
      slant,
    ] as MotionValue<number>[],
    ([gx, gy, v, lcy, rx, ry, open, ft, cr, sl]: number[]) =>
      eyePath({
        cx: EYE_R_X + gx * EYE_TRAVEL - v,
        cy: EYE_Y + gy * EYE_TRAVEL + lcy,
        rx,
        ry: ry * open,
        flatTop: ft,
        crescent: cr,
        slant: sl,
        side: "right",
      })
  );

  const rootTransform = useTransform(
    [
      smoothRootTx,
      smoothRootTy,
      smoothTilt,
      smoothRootSx,
      smoothRootSy,
      flip,
    ] as MotionValue<number>[],
    ([tx, ty, r, sx, sy, fl]: number[]) =>
      buildRootTransform(tx, ty, r, sx, sy, fl)
  );

  return useMemo(
    () => ({
      gazeX,
      gazeY,
      vergenceTarget,
      poseLidRy,
      lidOpenL,
      lidOpenR,
      lidCy,
      eyeRx,
      flatTop,
      crescent,
      slant,
      earLY,
      earRY,
      earFlickOffsetL,
      earFlickOffsetR,
      earSpreadL,
      earSpreadR,
      rootTx,
      rootTy,
      tilt,
      rootSx,
      rootSy,
      flip,
      headCx,
      headCy,
      earLD,
      earRD,
      eyeLD,
      eyeRD,
      rootTransform,
    }),
    [
      gazeX,
      gazeY,
      vergenceTarget,
      poseLidRy,
      lidOpenL,
      lidOpenR,
      lidCy,
      eyeRx,
      flatTop,
      crescent,
      slant,
      earLY,
      earRY,
      earFlickOffsetL,
      earFlickOffsetR,
      earSpreadL,
      earSpreadR,
      rootTx,
      rootTy,
      tilt,
      rootSx,
      rootSy,
      flip,
      headCx,
      headCy,
      earLD,
      earRD,
      eyeLD,
      eyeRD,
      rootTransform,
    ]
  );
}
