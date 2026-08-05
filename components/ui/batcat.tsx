"use client";

import { memo, useEffect, useId, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Geometry. viewBox is 180x180 rendered at 40px, so 1 CSS px = 4.5
 * units. That conversion governs every amplitude below: anything under
 * ~7 units is invisible as motion, anything under ~13 units is
 * invisible as a held pose. See the design spec for the full analysis.
 * ------------------------------------------------------------------ */
const HEAD = { x: 90, y: 110 };
const EYE_L_X = 77.5;
const EYE_R_X = 103.5;
const EYE_Y = 112;
const EAR_L_X = 60;
const EAR_R_X = 120;
const EAR_Y = 34;

const EYE_TRAVEL = 20;
const HEAD_TRAVEL = 6;
const EAR_LAG_TRAVEL = 3;

/* Ear bases are pushed well below the clip circle so that rotating the
 * character can never pull a triangle corner into view. Entirely
 * clipped; no visual change at rest. */
const earPath = (apexX: number, apexY: number, mirror: boolean) =>
  mirror
    ? `M${apexX} ${apexY}L53 210H190Z`
    : `M${apexX} ${apexY}L127 210H-10Z`;

/* ------------------------------------------------------------------ *
 * Tuning. Every autonomous gesture is rate-limited here on purpose.
 * Do not raise these because "it never fires" — you will see this a
 * hundred times more often than any visitor does.
 * ------------------------------------------------------------------ */
const TICK_MS = 100;

const R_NEAR = 140; // px: full proximity stimulus
const R_FAR = 700; // px: zero stimulus
const R_TRACK_SAT = 100; // px: gaze deflection saturates
const V_REF = 1200; // px/s: speed normalisation
const V_STARTLE = 2500; // px/s
const R_STARTLE = 80; // px

const TAU_AROUSAL_UP = 0.25;
const TAU_AROUSAL_DOWN = 3.0;
const INTEREST_UP = 0.55; // per second
const INTEREST_DOWN = 0.12;

const T_BORED_MS = 25_000;
const T_DROWSY_MS = 45_000;

const SACCADE_MS = 110;
const SACCADE_DEADZONE = 5; // viewBox units
const SACCADE_LATENCY = [80, 160];
const DOUBLE_TAKE_MS = 800;

const STARTLE_REFRACTORY_MS = 2500;
const FLICK_EVERY = [5000, 11_000];
const LOOKAWAY_EVERY = [12_000, 20_000];
const TILT_COOLDOWN_MS = 25_000;
const SLOWBLINK_COOLDOWN_MS = 20_000;

type Mode =
  | "startled"
  | "tracking"
  | "curious"
  | "idle"
  | "bored"
  | "drowsy";

/** Per-mode resting pose. Modes set policy; appearance is continuous. */
const POLICY: Record<
  Mode,
  { earY: number; earSpread: number; lidRy: number; lidCy: number; gain: number }
> = {
  startled: { earY: 54, earSpread: -12, lidRy: 9, lidCy: 2, gain: 1 },
  tracking: { earY: 26, earSpread: -4, lidRy: 15, lidCy: 0, gain: 1 },
  curious: { earY: 30, earSpread: 0, lidRy: 16, lidCy: 0, gain: 0.9 },
  idle: { earY: 34, earSpread: 0, lidRy: 14, lidCy: 0, gain: 0.55 },
  bored: { earY: 45, earSpread: 5, lidRy: 10, lidCy: 3, gain: 0 },
  drowsy: { earY: 52, earSpread: 10, lidRy: 6, lidCy: 8, gain: 0 },
};

/** Idle look targets, in normalised gaze space. Deliberately hardcoded:
 * gaze resolves to ~8 distinguishable directions at 40px, so resolving
 * real DOM coordinates would buy precision nobody can perceive. */
const LOOK_TARGETS: Array<[number, number]> = [
  [0.75, 0.35], // toward the nav row
  [0.95, 0.1], // toward the theme toggle
  [-0.6, 0.2], // away, left
  [0, -0.35], // up, middle distance
  [-0.35, 0.5], // down-left, page content
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function BatCatImpl({
  width = 96,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const clipId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");

  /* Continuous values. None of these are React state — writing them
   * never re-renders. React holds exactly one value: `mode`. */
  const gazeX = useMotionValue(0);
  const gazeY = useMotionValue(0);
  const lidRy = useMotionValue(14);
  const lidRyR = useMotionValue(14);
  const lidCy = useMotionValue(0);
  const eyeRx = useMotionValue(8);
  const earLY = useMotionValue(EAR_Y);
  const earRY = useMotionValue(EAR_Y);
  const earSpread = useMotionValue(0);
  const tilt = useMotionValue(0);
  const rootTy = useMotionValue(0);
  const rootSy = useMotionValue(1);

  /* Head and ears trail the eyes. The lag is what sells the head-turn;
   * eyes lead because real eyes saccade ahead of the head. */
  const headFollowX = useSpring(gazeX, { stiffness: 110, damping: 20, mass: 0.9 });
  const headFollowY = useSpring(gazeY, { stiffness: 110, damping: 20, mass: 0.9 });
  const earFollowX = useSpring(gazeX, { stiffness: 90, damping: 19, mass: 1 });

  /* Smooth pursuit. Real eyes track a moving target continuously and
   * saccade only to jump to a NEW fixation point — so the cursor is
   * followed smoothly here, and saccades are reserved for autonomous
   * looking-around (see LOOK_TARGETS). Fast and critically damped:
   * 2*sqrt(k*m) = 2*sqrt(560*0.4) = 29.9, so it tracks hard without
   * overshooting — a wobble here would read as instability, not life. */
  const EYE_SPRING = { stiffness: 560, damping: 30, mass: 0.4 };
  const eyeGazeX = useSpring(gazeX, EYE_SPRING);
  const eyeGazeY = useSpring(gazeY, EYE_SPRING);

  /* Vergence: eyes converge slightly on a near target, the way real
   * eyes do when focusing on something close. Absolute displacement
   * this small would be invisible, but this changes the *gap* between
   * two adjacent shapes — the gap is 10 units, so 2.5 units per eye is
   * a 50% change in the one relationship the viewer can actually read. */
  const vergence = useSpring(useMotionValue(0), {
    stiffness: 200,
    damping: 26,
    mass: 0.6,
  });

  const headCx = useTransform(headFollowX, (v) => HEAD.x + v * HEAD_TRAVEL);
  const headCy = useTransform(headFollowY, (v) => HEAD.y + v * HEAD_TRAVEL);
  const eyeLCx = useTransform(
    [eyeGazeX, vergence] as MotionValue[],
    ([g, v]: number[]) => EYE_L_X + g * EYE_TRAVEL + v
  );
  const eyeRCx = useTransform(
    [eyeGazeX, vergence] as MotionValue[],
    ([g, v]: number[]) => EYE_R_X + g * EYE_TRAVEL - v
  );
  const eyeCy = useTransform(
    [eyeGazeY, lidCy] as MotionValue[],
    ([g, l]: number[]) => EYE_Y + g * EYE_TRAVEL + l
  );

  const earLD = useTransform(
    [earLY, earSpread, earFollowX] as MotionValue[],
    ([y, s, f]: number[]) => earPath(EAR_L_X - s - f * EAR_LAG_TRAVEL, y, false)
  );
  const earRD = useTransform(
    [earRY, earSpread, earFollowX] as MotionValue[],
    ([y, s, f]: number[]) => earPath(EAR_R_X + s - f * EAR_LAG_TRAVEL, y, true)
  );

  /* Pivot sits below the chin so a tilt reads as a head on a neck.
   * At (90,120) an 11 degree tilt moves the ear tips 2.8px; here it
   * moves them 5.1px for the same rotation. */
  const rootTransform = useTransform(
    [tilt, rootTy, rootSy] as MotionValue[],
    ([r, ty, sy]: number[]) =>
      `translate(0 ${ty}) rotate(${r} 90 155) translate(0 155) scale(1 ${sy}) translate(0 -155)`
  );

  /* framer-motion special-cases `transform` and builds it from its own
   * x/y/scale props, so binding a MotionValue to the SVG attribute
   * yields "[object Object]". Writing it imperatively is one attribute
   * write per frame during a gesture and zero the rest of the time.
   * CSS transforms are not an option here: transform-box and
   * transform-origin on SVG children are inconsistent across browsers. */
  const rootRef = useRef<SVGGElement>(null);
  useEffect(() => {
    const apply = (v: string) => rootRef.current?.setAttribute("transform", v);
    apply(rootTransform.get());
    return rootTransform.on("change", apply);
  }, [rootTransform]);

  /* ---------------------------------------------------------------- *
   * Reduced motion: blink only. Nothing else ticks, no listeners are
   * registered, no mind runs. Blinking is presence/absence rather than
   * vestibular motion, so it does not carry the risk the setting
   * exists to mitigate — and the mark stays alive instead of dead.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!prefersReducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const loop = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === "visible") {
          animate(lidRy, 0, { duration: 0.07 }).then(() => {
            animate(lidRy, 14, { duration: 0.14 });
            lidRyR.set(0);
            animate(lidRyR, 14, { duration: 0.14 });
          });
          lidRyR.set(0);
        }
        loop();
      }, rand(6000, 10_000));
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [prefersReducedMotion, lidRy, lidRyR]);

  /* ---------------------------------------------------------------- *
   * The mind.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = svgRef.current;
    if (!el) return;

    // Mutable model state. Never React state.
    const m = {
      rect: null as DOMRect | null,
      cx: 0,
      cy: 0,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      present: false,
      speed: 0,
      arousal: 0,
      interest: 0,
      idleSince: Date.now(),
      mode: "idle" as Mode,
      modeSince: Date.now(),
      lastStartle: 0,
      lastTilt: 0,
      lastSlowBlink: 0,
      nextFlick: Date.now() + rand(...(FLICK_EVERY as [number, number])),
      nextLookAway: Date.now() + rand(...(LOOKAWAY_EVERY as [number, number])),
      nextBlink: Date.now() + rand(1600, 4400),
      gestureUntil: 0,
      saccadeAt: 0,
      pendingGaze: null as [number, number] | null,
      holdGazeUntil: 0,
      lookIndex: -1,
      visible: true,
    };

    const measure = () => {
      m.rect = el.getBoundingClientRect();
    };
    measure();

    /* -------------------- input -------------------- */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // tracking is meaningless without a cursor
      m.lastX = e.clientX;
      m.lastY = e.clientY;
      m.lastT = performance.now();
      m.present = true;

      /* Aim on the event, not on the 10Hz tick. Waiting for the tick
       * put up to 100ms of latency between the cursor and the eyes,
       * which reads as lag no matter how good the spring is. The rect
       * is cached, so this is four arithmetic ops and two motion-value
       * writes — no layout read, no React render. */
      const gain = POLICY[m.mode].gain;
      if (!gain || !m.rect || Date.now() < m.holdGazeUntil) return;
      const dx = e.clientX - (m.rect.left + m.rect.width / 2);
      const dy = e.clientY - (m.rect.top + m.rect.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const ratio = Math.min(1, d / R_TRACK_SAT);
      gazeX.set((dx / d) * ratio * gain);
      gazeY.set((dy / d) * ratio * gain);
      // Converge on anything inside ~90px; released as the cursor recedes.
      vergence.set(Math.max(0, 1 - d / 90) * 2.5);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget === null) m.present = false;
    };
    const onBlur = () => {
      m.present = false;
    };
    /* Suspension. Both paths fully detach the pointer listener and stop
     * the mind, because everything here is JS-driven: content-visibility
     * skips rendering work but does nothing about JavaScript writing
     * attributes to an element nobody can see. Measured before adding
     * this: 472 attribute writes/sec while scrolled out of view. */
    let mindTimer: ReturnType<typeof setInterval> | null = null;
    let speedTimer: ReturnType<typeof setInterval> | null = null;
    let onScreen = true;
    let tabVisible = true;

    const suspend = () => {
      if (mindTimer) clearInterval(mindTimer);
      if (speedTimer) clearInterval(speedTimer);
      mindTimer = speedTimer = null;
      window.removeEventListener("pointermove", onMove);
      m.present = false;
    };

    const resume = () => {
      if (mindTimer) return;
      measure();
      m.idleSince = Date.now();
      window.addEventListener("pointermove", onMove, { passive: true });
      speedTimer = setInterval(sampleSpeed, 50);
      mindTimer = setInterval(tick, TICK_MS);
    };

    const sync = () => (onScreen && tabVisible ? resume() : suspend());

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      m.visible = tabVisible;
      sync();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "100px" }
    );
    io.observe(el);

    window.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", onVisibility);

    /* -------------------- gestures -------------------- */
    /* Both lids are driven independently so they can be offset. Real
     * eyelids are never perfectly synchronised, and ~18ms of stagger is
     * below conscious notice but reads as organic rather than mechanical
     * — the same trick as the exponential blink interval, one level down. */
    const LID_STAGGER_MS = 18;

    const blink = (slow = false) => {
      const closeMs = slow ? 0.42 : 0.07;
      const openMs = slow ? 0.52 : 0.14;
      const hold = slow ? 280 : 40;
      const target = slow ? 2.5 : 0;
      const rest = POLICY[m.mode].lidRy;
      const closeEase: [number, number, number, number] = [0.4, 0, 1, 1];
      // A touch of overshoot on the way open: lids rebound slightly past
      // rest before settling, which is what a real blink does.
      const openEase: [number, number, number, number] = slow
        ? [0.2, 0.8, 0.3, 1]
        : [0.2, 1.25, 0.5, 1];

      animate(lidRy, target, { duration: closeMs, ease: closeEase });
      setTimeout(
        () => animate(lidRyR, target, { duration: closeMs, ease: closeEase }),
        LID_STAGGER_MS
      );
      setTimeout(() => {
        animate(lidRy, rest, { duration: openMs, ease: openEase });
        setTimeout(
          () => animate(lidRyR, rest, { duration: openMs, ease: openEase }),
          LID_STAGGER_MS
        );
      }, closeMs * 1000 + hold);
    };

    const flick = () => {
      const left = Math.random() < 0.5;
      const mv = left ? earLY : earRY;
      const base = POLICY[m.mode].earY;
      animate(mv, base - 7, { duration: 0.06, ease: [0, 0, 0.2, 1] }).then(() =>
        animate(mv, base, { duration: 0.14, ease: [0.34, 1.3, 0.64, 1] })
      );
    };

    const lookAway = () => {
      const side = Math.random() < 0.5 ? -1 : 1;
      m.holdGazeUntil = Date.now() + 800;
      animate(gazeX, side * 0.7, { duration: 0.11, ease: [0.2, 0.9, 0.2, 1] });
      animate(gazeY, 0.2, { duration: 0.11 });
      setTimeout(flick, 140);
      m.gestureUntil = Date.now() + 1200;
    };

    const startle = () => {
      const now = Date.now();
      if (now - m.lastStartle < STARTLE_REFRACTORY_MS) return;
      m.lastStartle = now;
      setMode((prev) => (prev === "startled" ? prev : "startled"));
      m.mode = "startled";
      m.modeSince = now;
      m.gestureUntil = now + 1000;

      // Phase 1: pop.
      animate(rootTy, -11, { duration: 0.07, ease: [0.1, 0.9, 0.2, 1] });
      animate(rootSy, 1.05, { duration: 0.07 });
      animate(lidRy, 20, { duration: 0.07 });
      animate(lidRyR, 20, { duration: 0.07 });
      animate(eyeRx, 11, { duration: 0.07 });
      animate(earLY, 26, { duration: 0.07 });
      animate(earRY, 26, { duration: 0.07 });
      animate(earSpread, -10, { duration: 0.07 });

      // Phase 2: flatten. The two phases are the entire read — a
      // single-phase jump reads as a rendering glitch.
      setTimeout(() => {
        animate(rootTy, 4, { duration: 0.15, ease: [0.4, 0, 1, 1] });
        animate(rootSy, 0.95, { duration: 0.15 });
        animate(lidRy, 9, { duration: 0.15 });
        animate(lidRyR, 9, { duration: 0.15 });
        animate(earLY, 54, { duration: 0.15 });
        animate(earRY, 54, { duration: 0.15 });
        animate(earSpread, -12, { duration: 0.15 });
      }, 70);

      // Phase 3: recover, ears trailing.
      setTimeout(() => {
        animate(rootTy, 0, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
        animate(rootSy, 1, { duration: 0.6 });
        animate(eyeRx, 8, { duration: 0.6 });
        setTimeout(() => {
          animate(earLY, POLICY.tracking.earY, { duration: 0.6 });
          animate(earRY, POLICY.tracking.earY, { duration: 0.6 });
          animate(earSpread, POLICY.tracking.earSpread, { duration: 0.6 });
        }, 180);
      }, 220);
    };

    const tiltHead = (side: number) => {
      const now = Date.now();
      if (now - m.lastTilt < TILT_COOLDOWN_MS) return;
      m.lastTilt = now;
      m.gestureUntil = now + 1800;
      animate(tilt, side * 11, { duration: 0.26, ease: [0.34, 1.2, 0.64, 1] });
      animate(side > 0 ? earRY : earLY, POLICY.curious.earY - 8, { duration: 0.26 });
      animate(side > 0 ? earLY : earRY, POLICY.curious.earY + 3, { duration: 0.26 });
      animate(eyeRx, 10, { duration: 0.26 });
      setTimeout(() => {
        animate(tilt, 0, { duration: 0.42, ease: [0.4, 0, 0.2, 1] });
        animate(eyeRx, 8, { duration: 0.42 });
      }, 260 + rand(800, 1400));
    };

    const applyPose = (next: Mode) => {
      const p = POLICY[next];
      animate(earLY, p.earY, { duration: 0.38, ease: [0.16, 1, 0.3, 1] });
      animate(earRY, p.earY, { duration: 0.38, ease: [0.16, 1, 0.3, 1] });
      animate(earSpread, p.earSpread, { duration: 0.38 });
      animate(lidRy, p.lidRy, { duration: 0.38 });
      animate(lidRyR, p.lidRy, { duration: 0.38 });
      animate(lidCy, p.lidCy, { duration: 0.38 });
    };

    /* The nodding-off beats are the whole gesture. A monotonic fade
     * reads as an opacity transition; the failed recoveries read as a
     * living thing losing a fight. */
    const noddingOff = () => {
      [600, 1200].forEach((t) =>
        setTimeout(() => {
          if (m.mode !== "drowsy") return;
          animate(lidRy, 12, { duration: 0.18, ease: [0, 0, 0.2, 1] });
          animate(lidRyR, 12, { duration: 0.18 });
          setTimeout(() => {
            if (m.mode !== "drowsy") return;
            animate(lidRy, POLICY.drowsy.lidRy, {
              duration: 0.5,
              ease: [0.55, 0, 1, 0.45],
            });
            animate(lidRyR, POLICY.drowsy.lidRy, { duration: 0.5 });
          }, 180);
        }, t)
      );
    };

    const enter = (next: Mode) => {
      if (m.mode === next) return;
      m.mode = next;
      m.modeSince = Date.now();
      setMode(next);
      applyPose(next);
      if (next === "drowsy") noddingOff();
    };

    /* -------------------- the tick -------------------- */
    const tick = () => {
      if (!m.visible || !m.rect) return;
      const now = Date.now();
      const dt = TICK_MS / 1000;

      // Stimulus. Proximity is necessary — a fast cursor 900px away
      // contributes nothing, because distant motion is not about you.
      let stimulus = 0;
      let dist = Infinity;
      if (m.present) {
        const cx = m.rect.left + m.rect.width / 2;
        const cy = m.rect.top + m.rect.height / 2;
        const dx = m.lastX - cx;
        const dy = m.lastY - cy;
        dist = Math.hypot(dx, dy);

        const age = performance.now() - m.lastT;
        if (age > 150) m.speed *= 0.6;

        const sProx = clamp01((R_FAR - dist) / (R_FAR - R_NEAR));
        const sSpeed = clamp01(m.speed / V_REF);
        stimulus = sProx * (0.55 + 0.45 * sSpeed);

        if (dist < R_STARTLE && m.speed > V_STARTLE) startle();
      }

      // arousal: fast to notice, slow to forget.
      const tau = stimulus > m.arousal ? TAU_AROUSAL_UP : TAU_AROUSAL_DOWN;
      m.arousal += (stimulus - m.arousal) * (1 - Math.exp(-dt / tau));

      // interest is an integrator, not a lag. This is the primary
      // anti-twitch mechanism: a cursor flying past on its way to the
      // nav raises arousal briefly and interest barely at all.
      if (m.arousal > 0.35) {
        m.interest = clamp01(
          m.interest + INTEREST_UP * ((m.arousal - 0.35) / 0.65) * dt
        );
      } else {
        m.interest = clamp01(m.interest - INTEREST_DOWN * dt);
      }

      if (stimulus > 0.15) m.idleSince = now;

      // Mode selection. Every threshold has a matched pair with a gap,
      // so boundary chatter is structurally impossible.
      const dwell = now - m.modeSince;
      const busy = now < m.gestureUntil;

      if (m.mode === "startled") {
        if (dwell > 1000) enter(m.interest > 0.3 ? "tracking" : "idle");
      } else if (!busy) {
        if (m.interest >= 0.55 && dwell > 600) {
          if (
            m.mode === "tracking" &&
            dist < R_NEAR &&
            m.speed < 120 &&
            dwell > 900
          ) {
            enter("curious");
            tiltHead(m.lastX > m.rect.left + m.rect.width / 2 ? 1 : -1);
          } else if (m.mode !== "curious") {
            enter("tracking");
          }
        } else if (m.interest < 0.35) {
          const idleMs = now - m.idleSince;
          if (idleMs > T_DROWSY_MS) enter("drowsy");
          else if (idleMs > T_BORED_MS) enter("bored");
          else if (dwell > 600) enter("idle");
        }
      }

      /* Autonomous gaze only. Following the cursor is handled on the
       * pointer event above, as smooth pursuit; saccades are reserved
       * for jumping to a NEW fixation point, which is what real eyes
       * actually do and what keeps tracking from feeling laggy. */
      const tracking = POLICY[m.mode].gain > 0 && m.present;
      if (now > m.holdGazeUntil && !busy && !tracking) {
        let target: [number, number] | null = null;

        if (m.mode === "bored" || m.mode === "drowsy") {
          target = [-0.5, 0.25];
        } else if (now > m.nextLookAway) {
          // Non-repeating: never the same target twice running.
          let i = Math.floor(Math.random() * LOOK_TARGETS.length);
          if (i === m.lookIndex) i = (i + 1) % LOOK_TARGETS.length;
          m.lookIndex = i;
          target = LOOK_TARGETS[i];
          m.nextLookAway = now + rand(...(LOOKAWAY_EVERY as [number, number]));
        }

        if (target) {
          const drift =
            Math.abs(target[0] - gazeX.get()) * EYE_TRAVEL +
            Math.abs(target[1] - gazeY.get()) * EYE_TRAVEL;
          if (drift > SACCADE_DEADZONE && !m.saccadeAt) {
            // The latency is what reads as deciding to look at
            // something, rather than being yanked toward it.
            m.pendingGaze = target;
            m.saccadeAt = now + rand(...(SACCADE_LATENCY as [number, number]));
          }
        }
      }

      if (m.saccadeAt && now >= m.saccadeAt && m.pendingGaze) {
        const [tx, ty] = m.pendingGaze;
        // Real saccades overshoot the target slightly and correct back.
        const ease: [number, number, number, number] = [0.2, 1.12, 0.45, 1];
        animate(gazeX, tx, { duration: SACCADE_MS / 1000, ease });
        animate(gazeY, ty, { duration: SACCADE_MS / 1000, ease });
        m.saccadeAt = 0;
        m.pendingGaze = null;
      }

      // Release convergence whenever it is not looking at something near.
      if (!tracking || dist > 90) vergence.set(0);

      // The double take: when the cursor leaves, keep looking at where
      // it was for a beat. Exactly what an animal does when something
      // it was watching disappears.
      if (!m.present && m.holdGazeUntil === 0) {
        m.holdGazeUntil = now + DOUBLE_TAKE_MS;
      } else if (m.present) {
        m.holdGazeUntil = Math.min(m.holdGazeUntil, now);
      }

      // Autonomous punctuation.
      if (now > m.nextBlink && !busy) {
        const slow =
          m.mode === "tracking" &&
          dist < R_NEAR &&
          now - m.lastSlowBlink > SLOWBLINK_COOLDOWN_MS;
        if (slow) m.lastSlowBlink = now;
        blink(slow);
        // Exponential intervals, not uniform: uniform draws never
        // cluster, which is why they read as metronomic.
        const base = m.mode === "bored" || m.mode === "drowsy" ? 7000 : 1600;
        const mean = m.mode === "bored" || m.mode === "drowsy" ? 4000 : 2800;
        m.nextBlink =
          now + Math.min(base - Math.log(1 - Math.random()) * mean, 11_000);
        if (Math.random() < 0.2 && !slow) setTimeout(() => blink(), 200);
      }

      if (now > m.nextFlick && !busy) {
        flick();
        const [lo, hi] =
          m.mode === "bored" || m.mode === "drowsy"
            ? [6000, 9000]
            : (FLICK_EVERY as [number, number]);
        m.nextFlick = now + rand(lo, hi);
      }

      if (now > m.nextLookAway && POLICY[m.mode].gain > 0 && !busy) {
        lookAway();
        m.nextLookAway = now + rand(...(LOOKAWAY_EVERY as [number, number]));
      }
    };

    // Speed is sampled off the raw event stream, never in the handler —
    // a 1000Hz mouse costs three assignments per event, not a model run.
    const sampleSpeed = () => {
      const dx = m.lastX - m.cx;
      const dy = m.lastY - m.cy;
      m.speed = m.speed * 0.65 + Math.min(Math.hypot(dx, dy) * 20, 4000) * 0.35;
      m.cx = m.lastX;
      m.cy = m.lastY;
    };

    resume();

    return () => {
      suspend();
      io.disconnect();
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    prefersReducedMotion,
    gazeX,
    gazeY,
    lidRy,
    lidRyR,
    lidCy,
    eyeRx,
    earLY,
    earRY,
    earSpread,
    tilt,
    rootTy,
    rootSy,
    vergence,
  ]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 180 180"
      data-mode={mode}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="90" cy="90" r="90" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Outside the transform group on purpose: if the background
            transforms it pulls away from the clip and the badge edge
            shows a crescent gap. */}
        <circle
          cx="90"
          cy="90"
          r="90"
          className={cn("fill-zinc-900 dark:fill-zinc-100")}
        />
        <g ref={rootRef}>
          <motion.path d={earLD} className={cn("fill-zinc-100 dark:fill-zinc-900")} />
          <motion.path d={earRD} className={cn("fill-zinc-100 dark:fill-zinc-900")} />
          <motion.circle
            r="42"
            cx={headCx}
            cy={headCy}
            className={cn("fill-zinc-100 dark:fill-zinc-900")}
          />
          <motion.ellipse
            rx={eyeRx}
            ry={lidRy}
            cx={eyeLCx}
            cy={eyeCy}
            className={cn("fill-zinc-900 dark:fill-zinc-100")}
          />
          <motion.ellipse
            rx={eyeRx}
            ry={lidRyR}
            cx={eyeRCx}
            cy={eyeCy}
            className={cn("fill-zinc-900 dark:fill-zinc-100")}
          />
        </g>
      </g>
    </svg>
  );
}

/* header.tsx re-renders on every navigation (usePathname) and every
 * theme change, which would drag BatCat with it and force a re-diff of
 * every motion element. Props are stable literals, so memo is free. */
const BatCat = memo(BatCatImpl);
export default BatCat;
