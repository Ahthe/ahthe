import {
  ANNOYED_COOLDOWN_MS,
  BATHANG_COOLDOWN_MS,
  DIZZY_COOLDOWN_MS,
  LID_STAGGER_MS,
  POLICY,
  POUNCE_COOLDOWN_MS,
  SCROLL_BREEZE_COOLDOWN_MS,
  STARTLE_REFRACTORY_MS,
  TILT_COOLDOWN_MS,
  type CircadianProfile,
  type Mode,
  type Side,
} from "./config";
import { rand } from "./geometry";
import type { BatCatRig, GestureScheduler } from "./rig";

export interface MindState {
  rect: DOMRect | null;
  cx: number;
  cy: number;
  lastX: number;
  lastY: number;
  lastT: number;
  present: boolean;
  speed: number;
  arousal: number;
  interest: number;
  idleSince: number;
  mode: Mode;
  modeSince: number;
  lastStartle: number;
  lastTilt: number;
  lastSlowBlink: number;
  lastPounce: number;
  lastAnnoyed: number;
  lastBatHang: number;
  lastDizzy: number;
  lastScrollBreeze: number;
  nearHoverSince: number;
  purringActive: boolean;
  purrStartedAt: number;
  purrLeanDir: number;
  autoBatHung: boolean;
  nextFlick: number;
  nextLookAway: number;
  nextBlink: number;
  saccadeAt: number;
  pendingGaze: [number, number] | null;
  holdGazeUntil: number;
  lookIndex: number;
  domTargets: Array<[number, number]>;
  navHover: { gx: number; gy: number } | null;
  lastPathname: string;
  suspendedAt: number;
  visible: boolean;
  circadian: CircadianProfile;
}

export function createGestures(
  rig: BatCatRig,
  scheduler: GestureScheduler,
  m: MindState,
  setMode: (mode: Mode) => void
) {
  const switchMode = (next: Mode) => {
    if (m.mode === next) return;
    m.mode = next;
    m.modeSince = Date.now();
    setMode(next);
  };

  const applyPose = (next: Mode, duration = 0.38) => {
    const p = POLICY[next];
    const circadianActive =
      next === "idle" || next === "tracking" || next === "curious";
    const earBonus = circadianActive ? m.circadian.earBonus : 0;
    const lidBonus = circadianActive ? m.circadian.lidBonus : 0;

    scheduler.run("pose", (ctx) => {
      ctx.busyFor(duration * 1000);
      const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
      ctx.anim(rig.earLY, p.earY + earBonus, { duration, ease });
      ctx.anim(rig.earRY, p.earY + earBonus, { duration, ease });
      ctx.anim(rig.earSpreadL, p.earSpread, { duration, ease });
      ctx.anim(rig.earSpreadR, p.earSpread, { duration, ease });
      ctx.anim(rig.poseLidRy, p.lidRy + lidBonus, { duration, ease });
      ctx.anim(rig.lidCy, p.lidCy, { duration, ease });
      ctx.anim(rig.eyeRx, p.eyeRx, { duration, ease });
      ctx.anim(rig.flatTop, p.flatTop, { duration, ease });
      ctx.anim(rig.slant, p.slant, { duration, ease });
      ctx.anim(rig.crescent, next === "purring" ? 1 : 0, { duration, ease });
    });
  };

  const blink = (slow = false, double = false) => {
    scheduler.run("blink", (ctx) => {
      const closeMs = slow ? 0.42 : 0.07;
      const openMs = slow ? 0.52 : 0.14;
      const hold = slow ? 280 : 40;
      const targetOpen = slow ? 0.18 : 0;
      const closeEase: [number, number, number, number] = [0.4, 0, 1, 1];
      const openEase: [number, number, number, number] = slow
        ? [0.2, 0.85, 0.3, 1]
        : [0.2, 1.25, 0.5, 1];

      const cycleMs = (closeMs + openMs) * 1000 + hold + LID_STAGGER_MS;
      ctx.busyFor(double && !slow ? cycleMs + 270 : cycleMs);

      const triggerSingle = (offsetMs: number) => {
        const start = () => {
          ctx.anim(rig.lidOpenL, targetOpen, {
            duration: closeMs,
            ease: closeEase,
          });
          ctx.after(LID_STAGGER_MS, () => {
            ctx.anim(rig.lidOpenR, targetOpen, {
              duration: closeMs,
              ease: closeEase,
            });
          });

          if (slow) {
            const restCy = POLICY[m.mode].lidCy;
            ctx.anim(rig.lidCy, restCy + 6, {
              duration: closeMs,
              ease: closeEase,
            });
            ctx.anim(rig.earFlickOffsetL, 5, { duration: closeMs });
            ctx.anim(rig.earFlickOffsetR, 5, { duration: closeMs });
          }

          ctx.after(closeMs * 1000 + hold, () => {
            ctx.anim(rig.lidOpenL, 1, { duration: openMs, ease: openEase });
            ctx.after(LID_STAGGER_MS, () => {
              ctx.anim(rig.lidOpenR, 1, { duration: openMs, ease: openEase });
            });
            if (slow) {
              ctx.anim(rig.lidCy, POLICY[m.mode].lidCy, {
                duration: openMs,
                ease: openEase,
              });
              ctx.anim(rig.earFlickOffsetL, 0, { duration: openMs });
              ctx.anim(rig.earFlickOffsetR, 0, { duration: openMs });
            }
          });
        };

        if (offsetMs === 0) start();
        else ctx.after(offsetMs, start);
      };

      triggerSingle(0);
      if (double && !slow) {
        triggerSingle(270);
      }
    });
  };

  const earFlick = (preferredSide?: Side) => {
    const side: Side =
      preferredSide ?? (Math.random() < 0.5 ? "left" : "right");
    const mv = side === "left" ? rig.earFlickOffsetL : rig.earFlickOffsetR;
    scheduler.run("ear", (ctx) => {
      ctx.busyFor(220);
      ctx.anim(mv, -8, { duration: 0.06, ease: [0, 0, 0.2, 1] });
      ctx.after(60, () => {
        ctx.anim(mv, 0, { duration: 0.14, ease: [0.34, 1.3, 0.64, 1] });
      });
    });
  };

  const acousticEarSwivel = (side: Side) => {
    const off = side === "left" ? rig.earFlickOffsetL : rig.earFlickOffsetR;
    const spread = side === "left" ? rig.earSpreadL : rig.earSpreadR;
    const baseSpread = POLICY[m.mode].earSpread;

    scheduler.run("ear", (ctx) => {
      ctx.busyFor(560);
      ctx.anim(off, -8, { duration: 0.09, ease: [0.16, 1, 0.3, 1] });
      ctx.anim(spread, baseSpread + 6, {
        duration: 0.09,
        ease: [0.16, 1, 0.3, 1],
      });
      ctx.after(340, () => {
        ctx.anim(off, 0, { duration: 0.2 });
        ctx.anim(spread, POLICY[m.mode].earSpread, { duration: 0.2 });
      });
    });
  };

  const scrollBreeze = () => {
    const now = Date.now();
    if (now - m.lastScrollBreeze < SCROLL_BREEZE_COOLDOWN_MS) return;
    m.lastScrollBreeze = now;
    const baseSpread = POLICY[m.mode].earSpread;

    scheduler.run("ear", (ctx) => {
      ctx.busyFor(460);
      ctx.anim(rig.earFlickOffsetL, 10, { duration: 0.11 });
      ctx.anim(rig.earFlickOffsetR, 10, { duration: 0.11 });
      ctx.anim(rig.earSpreadL, baseSpread + 8, { duration: 0.11 });
      ctx.anim(rig.earSpreadR, baseSpread + 8, { duration: 0.11 });
      ctx.after(200, () => {
        ctx.anim(rig.earFlickOffsetL, 0, { duration: 0.24 });
        ctx.anim(rig.earFlickOffsetR, 0, { duration: 0.24 });
        ctx.anim(rig.earSpreadL, POLICY[m.mode].earSpread, { duration: 0.24 });
        ctx.anim(rig.earSpreadR, POLICY[m.mode].earSpread, { duration: 0.24 });
      });
    });

    if (!m.present && !scheduler.isBusy("gaze")) {
      m.holdGazeUntil = now + 320;
      scheduler.run("gaze", (ctx) => {
        ctx.busyFor(320);
        ctx.anim(rig.gazeY, 0.5, { duration: 0.12 });
      });
    }
  };

  const lookAway = (awaySide: number, cursorSide?: Side) => {
    m.holdGazeUntil = Date.now() + 900;
    scheduler.run("gaze", (ctx) => {
      ctx.busyFor(1200);
      ctx.anim(rig.gazeX, awaySide * 0.72, {
        duration: 0.11,
        ease: [0.2, 0.9, 0.2, 1],
      });
      ctx.anim(rig.gazeY, 0.18, { duration: 0.11 });
      ctx.anim(rig.vergenceTarget, 0, { duration: 0.14 });
      ctx.after(140, () => earFlick(cursorSide));
    });
  };

  const startle = () => {
    const now = Date.now();
    if (now - m.lastStartle < STARTLE_REFRACTORY_MS) return;
    m.lastStartle = now;
    m.purringActive = false;
    m.purrStartedAt = 0;
    scheduler.cancelMany(["blink", "ear", "pose", "gaze"]);
    switchMode("startled");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1020);
      ctx.anim(rig.lidOpenL, 1, { duration: 0.05 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.05 });
      ctx.anim(rig.crescent, 0, { duration: 0.05 });
      ctx.anim(rig.flatTop, 0, { duration: 0.05 });
      ctx.anim(rig.slant, 0, { duration: 0.05 });
      ctx.anim(rig.flip, 0, { duration: 0.15 });
      ctx.anim(rig.tilt, 0, { duration: 0.07 });
      ctx.anim(rig.rootTx, 0, { duration: 0.07 });
      ctx.anim(rig.rootTy, -11, { duration: 0.07, ease: [0.1, 0.9, 0.2, 1] });
      ctx.anim(rig.rootSy, 1.06, { duration: 0.07 });
      ctx.anim(rig.rootSx, 0.96, { duration: 0.07 });
      ctx.anim(rig.poseLidRy, 19, { duration: 0.07 });
      ctx.anim(rig.lidCy, 0, { duration: 0.07 });
      ctx.anim(rig.eyeRx, 10, { duration: 0.07 });
      ctx.anim(rig.earLY, 22, { duration: 0.07 });
      ctx.anim(rig.earRY, 22, { duration: 0.07 });
      ctx.anim(rig.earFlickOffsetL, 0, { duration: 0.05 });
      ctx.anim(rig.earFlickOffsetR, 0, { duration: 0.05 });
      ctx.anim(rig.earSpreadL, -5, { duration: 0.07 });
      ctx.anim(rig.earSpreadR, -5, { duration: 0.07 });

      ctx.after(70, () => {
        ctx.anim(rig.rootTy, 10, { duration: 0.15, ease: [0.4, 0, 1, 1] });
        ctx.anim(rig.rootSy, 0.94, { duration: 0.15 });
        ctx.anim(rig.rootSx, 1.05, { duration: 0.15 });
        ctx.anim(rig.poseLidRy, 8.5, { duration: 0.15 });
        ctx.anim(rig.lidCy, 2, { duration: 0.15 });
        ctx.anim(rig.flatTop, 0.5, { duration: 0.15 });
        ctx.anim(rig.earLY, 52, { duration: 0.15 });
        ctx.anim(rig.earRY, 52, { duration: 0.15 });
        ctx.anim(rig.earSpreadL, 16, { duration: 0.15 });
        ctx.anim(rig.earSpreadR, 16, { duration: 0.15 });
      });

      ctx.after(240, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.56, ease: [0.22, 1, 0.36, 1] });
        ctx.anim(rig.rootSy, 1, { duration: 0.56 });
        ctx.anim(rig.rootSx, 1, { duration: 0.56 });
        ctx.anim(rig.eyeRx, POLICY.tracking.eyeRx, { duration: 0.56 });
        ctx.anim(rig.poseLidRy, POLICY.tracking.lidRy, { duration: 0.56 });
        ctx.anim(rig.lidCy, 0, { duration: 0.56 });
        ctx.anim(rig.flatTop, 0, { duration: 0.56 });
      });

      ctx.after(410, () => {
        ctx.anim(rig.earLY, POLICY.tracking.earY, { duration: 0.56 });
        ctx.anim(rig.earRY, POLICY.tracking.earY, { duration: 0.56 });
        ctx.anim(rig.earSpreadL, POLICY.tracking.earSpread, { duration: 0.56 });
        ctx.anim(rig.earSpreadR, POLICY.tracking.earSpread, { duration: 0.56 });
      });
    });
  };

  const tiltHead = (side: number) => {
    const now = Date.now();
    if (now - m.lastTilt < TILT_COOLDOWN_MS) return;
    m.lastTilt = now;
    const hold = rand(800, 1200);

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(260 + hold + 440);
      ctx.anim(rig.tilt, side * 11, {
        duration: 0.26,
        ease: [0.34, 1.2, 0.64, 1],
      });
      ctx.anim(rig.rootSx, 1.04, { duration: 0.26 });
      ctx.anim(rig.rootSy, 1.04, { duration: 0.26 });
      ctx.anim(
        side > 0 ? rig.earRY : rig.earLY,
        POLICY.curious.earY - 8,
        { duration: 0.26 }
      );
      ctx.anim(
        side > 0 ? rig.earLY : rig.earRY,
        POLICY.curious.earY + 4,
        { duration: 0.26 }
      );
      ctx.anim(rig.eyeRx, 9.2, { duration: 0.26 });
      ctx.anim(rig.poseLidRy, 15.5, { duration: 0.26 });
      ctx.anim(rig.flatTop, 0, { duration: 0.2 });

      ctx.after(260 + hold, () => {
        ctx.anim(rig.tilt, 0, { duration: 0.42, ease: [0.4, 0, 0.2, 1] });
        ctx.anim(rig.rootSx, 1, { duration: 0.42 });
        ctx.anim(rig.rootSy, 1, { duration: 0.42 });
        ctx.anim(rig.eyeRx, POLICY[m.mode].eyeRx, { duration: 0.42 });
        ctx.anim(rig.poseLidRy, POLICY[m.mode].lidRy, { duration: 0.42 });
        ctx.anim(rig.earLY, POLICY[m.mode].earY, { duration: 0.42 });
        ctx.anim(rig.earRY, POLICY[m.mode].earY, { duration: 0.42 });
      });
    });
  };

  const noddingOff = () => {
    scheduler.run("pose", (ctx) => {
      ctx.busyFor(2100);
      const beats = [600, 1350];
      for (let i = 0; i < beats.length; i += 1) {
        ctx.after(beats[i], () => {
          if (m.mode !== "drowsy") return;
          ctx.anim(rig.poseLidRy, 12, {
            duration: 0.18,
            ease: [0, 0, 0.2, 1],
          });
          ctx.anim(rig.flatTop, 0.2, { duration: 0.18 });
          ctx.anim(rig.lidCy, 2, { duration: 0.18 });
          ctx.after(180, () => {
            if (m.mode !== "drowsy") return;
            ctx.anim(rig.poseLidRy, POLICY.drowsy.lidRy, {
              duration: 0.5,
              ease: [0.55, 0, 1, 0.45],
            });
            ctx.anim(rig.flatTop, POLICY.drowsy.flatTop, { duration: 0.5 });
            ctx.anim(rig.lidCy, POLICY.drowsy.lidCy, { duration: 0.5 });
          });
        });
      }
    });
  };

  const themeGlare = () => {
    scheduler.cancelMany(["blink", "ear", "pose"]);
    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1280);
      ctx.anim(rig.lidOpenL, 1, { duration: 0.08 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.08 });
      ctx.anim(rig.crescent, 0, { duration: 0.08 });
      ctx.anim(rig.slant, 0, { duration: 0.1 });
      ctx.anim(rig.poseLidRy, 4.5, { duration: 0.12 });
      ctx.anim(rig.flatTop, 0.92, { duration: 0.12 });
      ctx.anim(rig.lidCy, 3.5, { duration: 0.12 });
      ctx.anim(rig.earLY, 52, { duration: 0.14 });
      ctx.anim(rig.earRY, 52, { duration: 0.14 });
      ctx.anim(rig.earSpreadL, 14, { duration: 0.14 });
      ctx.anim(rig.earSpreadR, 14, { duration: 0.14 });
      ctx.anim(rig.rootTy, 6, { duration: 0.14 });
      ctx.anim(rig.rootSy, 0.96, { duration: 0.14 });
      ctx.anim(rig.rootSx, 1.02, { duration: 0.14 });

      ctx.after(420, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.35 });
        ctx.anim(rig.rootSy, 1, { duration: 0.35 });
        ctx.anim(rig.rootSx, 1, { duration: 0.35 });
        blink(false, true);
      });

      ctx.after(860, () => {
        applyPose(m.mode, 0.38);
      });
    });
  };

  const themeNightPerk = () => {
    scheduler.cancelMany(["blink", "pose"]);
    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1150);
      ctx.anim(rig.lidOpenL, 1, { duration: 0.08 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.08 });
      ctx.anim(rig.crescent, 0, { duration: 0.08 });
      ctx.anim(rig.flatTop, 0, { duration: 0.12 });
      ctx.anim(rig.slant, 0, { duration: 0.12 });
      ctx.anim(rig.eyeRx, 9.6, { duration: 0.16 });
      ctx.anim(rig.poseLidRy, 17.5, { duration: 0.16 });
      ctx.anim(rig.lidCy, 0, { duration: 0.16 });
      ctx.anim(rig.earLY, 18, { duration: 0.16, ease: [0.2, 1.2, 0.4, 1] });
      ctx.anim(rig.earRY, 18, { duration: 0.16, ease: [0.2, 1.2, 0.4, 1] });
      ctx.anim(rig.earSpreadL, -4, { duration: 0.16 });
      ctx.anim(rig.earSpreadR, -4, { duration: 0.16 });
      ctx.anim(rig.rootSx, 1.04, { duration: 0.16 });
      ctx.anim(rig.rootSy, 1.04, { duration: 0.16 });
      ctx.anim(rig.rootTy, -3, { duration: 0.16 });

      ctx.after(220, () => {
        if (ctx.isAlive()) earFlick();
      });

      ctx.after(750, () => {
        ctx.anim(rig.rootSx, 1, { duration: 0.36 });
        ctx.anim(rig.rootSy, 1, { duration: 0.36 });
        ctx.anim(rig.rootTy, 0, { duration: 0.36 });
        applyPose(m.mode, 0.36);
      });
    });
  };

  const enterPurr = (leanDir: number) => {
    m.purringActive = true;
    m.purrStartedAt = Date.now();
    scheduler.cancelMany(["blink", "ear", "choreo"]);
    switchMode("purring");
    scheduler.run("pose", (ctx) => {
      ctx.busyFor(260);
      const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
      ctx.anim(rig.lidOpenL, 1, { duration: 0.14 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.14 });
      ctx.anim(rig.crescent, 1, { duration: 0.22, ease });
      ctx.anim(rig.flatTop, 0, { duration: 0.18 });
      ctx.anim(rig.slant, 0, { duration: 0.18 });
      ctx.anim(rig.eyeRx, POLICY.purring.eyeRx, { duration: 0.22, ease });
      ctx.anim(rig.poseLidRy, POLICY.purring.lidRy, { duration: 0.22, ease });
      ctx.anim(rig.lidCy, 0, { duration: 0.22 });
      ctx.anim(rig.earLY, POLICY.purring.earY, { duration: 0.24, ease });
      ctx.anim(rig.earRY, POLICY.purring.earY, { duration: 0.24, ease });
      ctx.anim(rig.earSpreadL, POLICY.purring.earSpread, { duration: 0.24 });
      ctx.anim(rig.earSpreadR, POLICY.purring.earSpread, { duration: 0.24 });
      ctx.anim(rig.earFlickOffsetL, 0, { duration: 0.15 });
      ctx.anim(rig.earFlickOffsetR, 0, { duration: 0.15 });
      ctx.anim(rig.rootTx, 0, { duration: 0.22 });
      ctx.anim(rig.rootTy, 0, { duration: 0.22 });
      ctx.anim(rig.rootSx, 1, { duration: 0.22 });
      ctx.anim(rig.rootSy, 1, { duration: 0.22 });
      ctx.anim(rig.tilt, leanDir * 5, { duration: 0.22, ease });
    });
  };

  const updatePurrLean = (leanDir: number) => {
    if (!m.purringActive || scheduler.isBusy("pose")) return;
    rig.tilt.set(leanDir * 5);
  };

  const exitPurr = (contentedBlink = true) => {
    if (!m.purringActive) return;
    m.purringActive = false;
    m.purrStartedAt = 0;
    const next: Mode = m.interest >= 0.45 && m.present ? "tracking" : "idle";
    switchMode(next);
    scheduler.cancel("pose");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(480);
      const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
      ctx.anim(rig.tilt, 0, { duration: 0.42, ease });
      ctx.anim(rig.crescent, 0, { duration: 0.36, ease });
      applyPose(next, 0.45);
      if (contentedBlink) {
        ctx.after(160, () => {
          if (ctx.isAlive()) blink(false);
        });
      }
    });
  };

  const dizzySpin = (dir: number) => {
    const now = Date.now();
    if (now - m.lastDizzy < DIZZY_COOLDOWN_MS) return;
    m.lastDizzy = now;
    m.purringActive = false;
    m.purrStartedAt = 0;
    m.holdGazeUntil = now + 2300;
    scheduler.cancelMany(["blink", "ear", "pose", "gaze"]);
    switchMode("dizzy");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(2350);
      ctx.anim(rig.crescent, 0, { duration: 0.08 });
      ctx.anim(rig.slant, 0, { duration: 0.08 });
      ctx.anim(rig.poseLidRy, POLICY.dizzy.lidRy, { duration: 0.14 });
      ctx.anim(rig.flatTop, POLICY.dizzy.flatTop, { duration: 0.14 });
      ctx.anim(rig.eyeRx, POLICY.dizzy.eyeRx, { duration: 0.14 });
      ctx.anim(rig.rootTx, 0, { duration: 0.14 });
      ctx.anim(rig.rootTy, 2, { duration: 0.14 });
      ctx.anim(rig.rootSx, 1, { duration: 0.14 });
      ctx.anim(rig.rootSy, 1, { duration: 0.14 });

      ctx.anim(rig.lidOpenL, 0.35, { duration: 0.14 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.14 });
      ctx.anim(rig.tilt, dir * 13, { duration: 0.28 });
      ctx.anim(rig.earLY, 38, { duration: 0.24 });
      ctx.anim(rig.earRY, 50, { duration: 0.24 });
      ctx.anim(rig.gazeX, dir * 0.6, { duration: 0.22 });
      ctx.anim(rig.gazeY, -0.3, { duration: 0.22 });

      ctx.after(320, () => {
        ctx.anim(rig.tilt, -dir * 12, { duration: 0.32 });
        ctx.anim(rig.earLY, 50, { duration: 0.28 });
        ctx.anim(rig.earRY, 38, { duration: 0.28 });
        ctx.anim(rig.gazeX, -dir * 0.6, { duration: 0.28 });
        ctx.anim(rig.gazeY, 0.35, { duration: 0.28 });
        ctx.anim(rig.lidOpenL, 1, { duration: 0.16 });
        ctx.anim(rig.lidOpenR, 0.35, { duration: 0.16 });
      });

      ctx.after(660, () => {
        ctx.anim(rig.tilt, dir * 9, { duration: 0.28 });
        ctx.anim(rig.earLY, 36, { duration: 0.24 });
        ctx.anim(rig.earRY, 48, { duration: 0.24 });
        ctx.anim(rig.gazeX, dir * 0.45, { duration: 0.24 });
        ctx.anim(rig.gazeY, 0.25, { duration: 0.24 });
      });

      ctx.after(980, () => {
        ctx.anim(rig.tilt, -dir * 6, { duration: 0.24 });
        ctx.anim(rig.gazeX, 0, { duration: 0.24 });
        ctx.anim(rig.gazeY, 0, { duration: 0.24 });
        ctx.anim(rig.lidOpenL, 1, { duration: 0.16 });
        ctx.anim(rig.lidOpenR, 1, { duration: 0.16 });
      });

      // Shake it off
      const shakes = [
        [1300, dir * 10],
        [1440, -dir * 10],
        [1580, dir * 5],
        [1720, 0],
      ];
      for (let i = 0; i < shakes.length; i += 1) {
        const [delay, angle] = shakes[i];
        ctx.after(delay, () => {
          ctx.anim(rig.tilt, angle, { duration: 0.12 });
        });
      }

      ctx.after(1300, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.35 });
        ctx.anim(rig.earLY, POLICY.idle.earY, { duration: 0.35 });
        ctx.anim(rig.earRY, POLICY.idle.earY, { duration: 0.35 });
      });

      ctx.after(1780, () => {
        if (ctx.isAlive()) blink(false);
      });

      ctx.after(2050, () => {
        const next: Mode = m.present ? "tracking" : "idle";
        switchMode(next);
        applyPose(next, 0.32);
      });
    });
  };

  const pokeHop = (side: number) => {
    scheduler.cancelMany(["blink", "pose"]);
    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(540);
      ctx.anim(rig.crescent, 0, { duration: 0.08 });
      ctx.anim(rig.flatTop, 0, { duration: 0.08 });
      ctx.anim(rig.rootTy, -7, { duration: 0.07, ease: [0.1, 0.9, 0.2, 1] });
      ctx.anim(rig.tilt, side * 7, { duration: 0.1, ease: [0.2, 1.1, 0.4, 1] });
      ctx.anim(rig.earLY, 21, { duration: 0.09 });
      ctx.anim(rig.earRY, 21, { duration: 0.09 });
      ctx.anim(rig.poseLidRy, 15.5, { duration: 0.09 });
      ctx.after(75, () => {
        if (ctx.isAlive()) blink(false);
      });
      ctx.after(180, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.3, ease: [0.22, 1, 0.36, 1] });
        ctx.anim(rig.tilt, 0, { duration: 0.32 });
        applyPose(m.mode, 0.32);
      });
    });
  };

  const annoyedAirplane = (awaySide: number) => {
    const now = Date.now();
    if (now - m.lastAnnoyed < ANNOYED_COOLDOWN_MS) return;
    m.lastAnnoyed = now;
    m.purringActive = false;
    m.purrStartedAt = 0;
    m.holdGazeUntil = now + 2100;
    scheduler.cancelMany(["blink", "ear", "pose", "gaze"]);
    switchMode("annoyed");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(2200);
      const ease: [number, number, number, number] = [0.2, 0.9, 0.2, 1];
      ctx.anim(rig.lidOpenL, 1, { duration: 0.1 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.1 });
      ctx.anim(rig.crescent, 0, { duration: 0.1 });
      ctx.anim(rig.earLY, POLICY.annoyed.earY, { duration: 0.16, ease });
      ctx.anim(rig.earRY, POLICY.annoyed.earY, { duration: 0.16, ease });
      ctx.anim(rig.earSpreadL, POLICY.annoyed.earSpread, { duration: 0.16, ease });
      ctx.anim(rig.earSpreadR, POLICY.annoyed.earSpread, { duration: 0.16, ease });
      ctx.anim(rig.earFlickOffsetL, 0, { duration: 0.1 });
      ctx.anim(rig.earFlickOffsetR, 0, { duration: 0.1 });
      ctx.anim(rig.poseLidRy, POLICY.annoyed.lidRy, { duration: 0.16 });
      ctx.anim(rig.lidCy, POLICY.annoyed.lidCy, { duration: 0.16 });
      ctx.anim(rig.eyeRx, POLICY.annoyed.eyeRx, { duration: 0.16 });
      ctx.anim(rig.flatTop, POLICY.annoyed.flatTop, { duration: 0.16 });
      ctx.anim(rig.slant, POLICY.annoyed.slant, { duration: 0.16 });
      ctx.anim(rig.rootTx, 0, { duration: 0.16 });
      ctx.anim(rig.rootTy, 5, { duration: 0.16 });
      ctx.anim(rig.rootSy, 0.96, { duration: 0.16 });
      ctx.anim(rig.rootSx, 1.03, { duration: 0.16 });
      ctx.anim(rig.tilt, -awaySide * 4, { duration: 0.16 });
      ctx.anim(rig.gazeX, awaySide * 0.85, { duration: 0.12, ease });
      ctx.anim(rig.gazeY, 0.1, { duration: 0.12 });
      ctx.anim(rig.vergenceTarget, 0, { duration: 0.12 });

      ctx.after(1750, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.38 });
        ctx.anim(rig.rootSy, 1, { duration: 0.38 });
        ctx.anim(rig.rootSx, 1, { duration: 0.38 });
        ctx.anim(rig.tilt, 0, { duration: 0.38 });
        switchMode("idle");
        applyPose("idle", 0.4);
      });
    });
  };

  const pounceCrouch = (targetSide: number) => {
    const now = Date.now();
    if (now - m.lastPounce < POUNCE_COOLDOWN_MS) return;
    m.lastPounce = now;
    m.purringActive = false;
    m.purrStartedAt = 0;
    scheduler.cancelMany(["blink", "ear", "pose"]);
    switchMode("pouncing");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1750);
      ctx.anim(rig.lidOpenL, 1, { duration: 0.1 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.1 });
      ctx.anim(rig.crescent, 0, { duration: 0.1 });
      ctx.anim(rig.rootTx, 0, { duration: 0.2 });
      ctx.anim(rig.rootTy, 10, { duration: 0.2, ease: [0.22, 1, 0.36, 1] });
      ctx.anim(rig.rootSy, 0.92, { duration: 0.2 });
      ctx.anim(rig.rootSx, 1.03, { duration: 0.2 });
      ctx.anim(rig.eyeRx, POLICY.pouncing.eyeRx, { duration: 0.2 });
      ctx.anim(rig.poseLidRy, POLICY.pouncing.lidRy, { duration: 0.2 });
      ctx.anim(rig.lidCy, 0, { duration: 0.2 });
      ctx.anim(rig.flatTop, POLICY.pouncing.flatTop, { duration: 0.2 });
      ctx.anim(rig.slant, POLICY.pouncing.slant, { duration: 0.2 });
      ctx.anim(rig.earLY, POLICY.pouncing.earY, { duration: 0.2 });
      ctx.anim(rig.earRY, POLICY.pouncing.earY, { duration: 0.2 });
      ctx.anim(rig.earSpreadL, POLICY.pouncing.earSpread, { duration: 0.2 });
      ctx.anim(rig.earSpreadR, POLICY.pouncing.earSpread, { duration: 0.2 });

      const shimmies = [
        [280, 4.5],
        [430, -4.5],
        [580, 3.5],
        [730, -3],
        [880, targetSide * 2],
      ];
      for (let i = 0; i < shimmies.length; i += 1) {
        const [delay, angle] = shimmies[i];
        ctx.after(delay, () => {
          ctx.anim(rig.tilt, angle, { duration: 0.11, ease: "easeInOut" });
        });
      }

      ctx.after(1280, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.36, ease: [0.22, 1, 0.36, 1] });
        ctx.anim(rig.rootSy, 1, { duration: 0.36 });
        ctx.anim(rig.rootSx, 1, { duration: 0.36 });
        ctx.anim(rig.tilt, 0, { duration: 0.36 });
        const next: Mode = m.present ? "tracking" : "idle";
        switchMode(next);
        applyPose(next, 0.36);
      });
    });
  };

  const batHang = () => {
    const now = Date.now();
    if (now - m.lastBatHang < BATHANG_COOLDOWN_MS) return;
    m.lastBatHang = now;
    m.purringActive = false;
    m.purrStartedAt = 0;
    m.holdGazeUntil = now + 3200;
    scheduler.cancelMany(["blink", "ear", "pose", "gaze"]);
    switchMode("hanging");

    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(3250);
      ctx.anim(rig.lidOpenL, 1, { duration: 0.1 });
      ctx.anim(rig.lidOpenR, 1, { duration: 0.1 });
      ctx.anim(rig.crescent, 0, { duration: 0.1 });
      ctx.anim(rig.flatTop, 0, { duration: 0.1 });
      ctx.anim(rig.slant, 0, { duration: 0.1 });
      ctx.anim(rig.tilt, 0, { duration: 0.12 });
      ctx.anim(rig.rootTx, 0, { duration: 0.12 });
      ctx.anim(rig.rootSx, 1, { duration: 0.12 });
      ctx.anim(rig.rootSy, 1, { duration: 0.12 });
      ctx.anim(rig.gazeX, 0, { duration: 0.16 });
      ctx.anim(rig.gazeY, 0.15, { duration: 0.16 });
      ctx.anim(rig.vergenceTarget, 0, { duration: 0.14 });
      ctx.anim(rig.rootTy, 8, { duration: 0.12 });

      ctx.after(100, () => {
        ctx.anim(rig.flip, 180, {
          duration: 0.46,
          ease: [0.34, 1.12, 0.64, 1],
        });
        ctx.anim(rig.rootTy, 0, { duration: 0.35 });
        ctx.anim(rig.eyeRx, POLICY.hanging.eyeRx, { duration: 0.3 });
        ctx.anim(rig.poseLidRy, POLICY.hanging.lidRy, { duration: 0.3 });
        ctx.anim(rig.lidCy, 0, { duration: 0.3 });
        ctx.anim(rig.earLY, POLICY.hanging.earY, { duration: 0.3 });
        ctx.anim(rig.earRY, POLICY.hanging.earY, { duration: 0.3 });
        ctx.anim(rig.earSpreadL, POLICY.hanging.earSpread, { duration: 0.3 });
        ctx.anim(rig.earSpreadR, POLICY.hanging.earSpread, { duration: 0.3 });
      });

      ctx.after(1150, () => {
        if (ctx.isAlive()) blink(false);
      });

      ctx.after(1850, () => {
        if (ctx.isAlive()) earFlick();
      });

      ctx.after(2450, () => {
        ctx.anim(rig.flip, 0, {
          duration: 0.52,
          ease: [0.22, 1, 0.36, 1],
        });
        ctx.anim(rig.rootTy, 3, { duration: 0.25 });
      });

      ctx.after(2750, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.24 });
      });

      ctx.after(3020, () => {
        const next: Mode = m.present ? "tracking" : "idle";
        switchMode(next);
        applyPose(next, 0.32);
      });
    });
  };

  const wakeUpReunion = () => {
    scheduler.cancelMany(["blink", "ear", "pose"]);
    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1150);
      ctx.anim(rig.rootTx, 0, { duration: 0.05 });
      ctx.anim(rig.rootTy, 14, { duration: 0.05 });
      ctx.anim(rig.rootSx, 1, { duration: 0.05 });
      ctx.anim(rig.rootSy, 1, { duration: 0.05 });
      ctx.anim(rig.poseLidRy, 6.5, { duration: 0.05 });
      ctx.anim(rig.flatTop, 0.68, { duration: 0.05 });
      ctx.anim(rig.lidCy, 5, { duration: 0.05 });
      ctx.anim(rig.earLY, 48, { duration: 0.05 });
      ctx.anim(rig.earRY, 48, { duration: 0.05 });
      ctx.anim(rig.earSpreadL, 8, { duration: 0.05 });
      ctx.anim(rig.earSpreadR, 8, { duration: 0.05 });
      ctx.anim(rig.crescent, 0, { duration: 0.05 });
      ctx.anim(rig.slant, 0, { duration: 0.05 });

      ctx.after(200, () => {
        ctx.anim(rig.rootTy, 0, { duration: 0.36, ease: [0.22, 1, 0.36, 1] });
        ctx.anim(rig.poseLidRy, 14.5, { duration: 0.24 });
        ctx.anim(rig.flatTop, 0, { duration: 0.2 });
        ctx.anim(rig.lidCy, 0, { duration: 0.24 });
        ctx.anim(rig.earLY, 24, { duration: 0.26, ease: [0.2, 1.2, 0.4, 1] });
        ctx.anim(rig.earRY, 24, { duration: 0.26, ease: [0.2, 1.2, 0.4, 1] });
        ctx.anim(rig.earSpreadL, -3, { duration: 0.26 });
        ctx.anim(rig.earSpreadR, -3, { duration: 0.26 });
        ctx.anim(rig.eyeRx, 8, { duration: 0.24 });
        if (ctx.isAlive()) blink(false);
      });

      ctx.after(380, () => {
        if (ctx.isAlive()) earFlick();
      });

      ctx.after(820, () => {
        applyPose(m.mode, 0.34);
      });
    });
  };

  const routeGlance = () => {
    if (scheduler.isBusy("choreo") || m.purringActive) return;
    m.holdGazeUntil = Date.now() + 600;
    scheduler.run("gaze", (ctx) => {
      ctx.busyFor(650);
      ctx.anim(rig.gazeX, 0, { duration: 0.14 });
      ctx.anim(rig.gazeY, 0.68, {
        duration: 0.14,
        ease: [0.2, 1.1, 0.45, 1],
      });
      ctx.after(80, () => {
        if (ctx.isAlive()) earFlick();
      });
    });
  };

  const happyMeow = () => {
    scheduler.cancelMany(["blink", "pose"]);
    scheduler.run("choreo", (ctx) => {
      ctx.busyFor(1100);
      ctx.anim(rig.crescent, 1, { duration: 0.18, ease: [0.22, 1, 0.36, 1] });
      ctx.anim(rig.flatTop, 0, { duration: 0.14 });
      ctx.anim(rig.slant, 0, { duration: 0.14 });
      ctx.anim(rig.eyeRx, 9.2, { duration: 0.18 });
      ctx.anim(rig.poseLidRy, 10.5, { duration: 0.18 });
      ctx.anim(rig.tilt, 7, { duration: 0.2, ease: [0.34, 1.2, 0.64, 1] });
      ctx.anim(rig.earLY, 36, { duration: 0.2 });
      ctx.anim(rig.earRY, 36, { duration: 0.2 });
      ctx.anim(rig.earSpreadL, 6, { duration: 0.2 });
      ctx.anim(rig.earSpreadR, 6, { duration: 0.2 });

      ctx.after(750, () => {
        ctx.anim(rig.tilt, 0, { duration: 0.32 });
        applyPose(m.mode, 0.34);
      });
    });
  };

  return {
    switchMode,
    applyPose,
    blink,
    earFlick,
    acousticEarSwivel,
    scrollBreeze,
    lookAway,
    startle,
    tiltHead,
    noddingOff,
    themeGlare,
    themeNightPerk,
    enterPurr,
    updatePurrLean,
    exitPurr,
    dizzySpin,
    pokeHop,
    annoyedAirplane,
    pounceCrouch,
    batHang,
    wakeUpReunion,
    routeGlance,
    happyMeow,
  };
}
