import { type MotionValue } from "framer-motion";
import {
  DOUBLE_TAKE_MS,
  FLICK_EVERY,
  HOVER_BLINK_MS,
  INTEREST_DOWN,
  INTEREST_UP,
  LOOKAWAY_EVERY,
  POKE_ANNOYED_COUNT,
  POKE_BATHANG_COUNT,
  POLICY,
  REUNION_AWAY_MS,
  R_FAR,
  R_HOVER_BLINK,
  R_NEAR,
  R_PET,
  R_POKE,
  R_STARTLE,
  SACCADE_DEADZONE,
  SACCADE_LATENCY,
  SACCADE_MS,
  SCROLL_BREEZE_SPEED,
  SLOWBLINK_COOLDOWN_MS,
  TAU_AROUSAL_DOWN,
  TAU_AROUSAL_UP,
  TICK_MS,
  V_HOVER_MAX,
  V_REF,
  V_STARTLE,
  getCircadianProfile,
  type Mode,
  type Side,
} from "./config";
import {
  clamp,
  clamp01,
  gazeFromClientPoint,
  lerp,
  rand,
} from "./geometry";
import { createGestures, type MindState } from "./gestures";
import { createGestureScheduler, type BatCatRig } from "./rig";
import {
  collectDomLookTargets,
  createOrbitDetector,
  createPetDetector,
  createPokeTracker,
  createSiteSensors,
  createWiggleDetector,
} from "./senses";

const setIfChanged = (
  mv: MotionValue<number>,
  target: number,
  eps = 0.05
) => {
  if (Math.abs(mv.get() - target) > eps) {
    mv.set(target);
  }
};

export function startBatCatMind(
  el: SVGSVGElement,
  rig: BatCatRig,
  setMode: (mode: Mode) => void
): () => void {
  const nowInit = Date.now();
  const scheduler = createGestureScheduler();
  const petDetector = createPetDetector();
  const wiggleDetector = createWiggleDetector();
  const orbitDetector = createOrbitDetector();
  const pokeTracker = createPokeTracker();

  const m: MindState = {
    rect: null,
    cx: 0,
    cy: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    present: false,
    speed: 0,
    arousal: 0,
    interest: 0,
    idleSince: nowInit,
    mode: "idle",
    modeSince: nowInit,
    lastStartle: 0,
    lastTilt: 0,
    lastSlowBlink: 0,
    lastPounce: 0,
    lastAnnoyed: 0,
    lastBatHang: 0,
    lastDizzy: 0,
    lastScrollBreeze: 0,
    nearHoverSince: 0,
    purringActive: false,
    purrStartedAt: 0,
    purrLeanDir: 1,
    autoBatHung: false,
    nextFlick: nowInit + rand(FLICK_EVERY[0], FLICK_EVERY[1]),
    nextLookAway: nowInit + rand(LOOKAWAY_EVERY[0], LOOKAWAY_EVERY[1]),
    nextBlink: nowInit + rand(1600, 4400),
    saccadeAt: 0,
    pendingGaze: null,
    holdGazeUntil: 0,
    lookIndex: -1,
    domTargets: [],
    navHover: null,
    lastPathname: window.location.pathname,
    suspendedAt: 0,
    visible: true,
    circadian: getCircadianProfile(),
  };

  const g = createGestures(rig, scheduler, m, setMode);

  let lastScrollY = window.scrollY;
  let lastScrollAt = performance.now();

  const measure = () => {
    m.rect = el.getBoundingClientRect();
    if (m.rect) {
      m.domTargets = collectDomLookTargets(el, m.rect);
    }
  };
  measure();

  /* -------------------- input & site sensors -------------------- */
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const now = Date.now();
    m.lastX = e.clientX;
    m.lastY = e.clientY;
    m.lastT = performance.now();
    m.present = true;

    if (!m.rect) return;
    const gain = POLICY[m.mode].gain;
    const { gx, gy, dist, dx, dy } = gazeFromClientPoint(
      e.clientX,
      e.clientY,
      m.rect,
      gain
    );

    const pet = petDetector.feed(dx, dist, m.speed, now);
    if (pet.active) {
      m.idleSince = now;
      m.interest = Math.max(m.interest, 0.7);
      if (pet.leanDir) m.purrLeanDir = pet.leanDir;
      if (!m.purringActive && !scheduler.isBusy("choreo")) {
        g.enterPurr(m.purrLeanDir);
      } else {
        g.updatePurrLean(m.purrLeanDir);
      }
      return;
    }

    if (m.purringActive && (pet.expired || !petDetector.isActive(now))) {
      g.exitPurr(true);
    }

    if (!scheduler.isBusy("choreo")) {
      const spinDir = orbitDetector.feed(dx, dy, dist, now);
      if (spinDir !== 0) {
        m.idleSince = now;
        g.dizzySpin(spinDir);
        return;
      }

      if (wiggleDetector.feed(dx, dy, dist, m.speed, now)) {
        m.idleSince = now;
        m.interest = Math.max(m.interest, 0.85);
        g.pounceCrouch(dx >= 0 ? 1 : -1);
      }
    }

    if (!gain || now < m.holdGazeUntil) return;
    rig.gazeX.set(gx);
    rig.gazeY.set(gy);
    rig.vergenceTarget.set(Math.max(0, 1 - dist / 90) * 2.5);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!m.rect) measure();
    if (!m.rect) return;
    const now = Date.now();
    const { gx, gy, dist, dx } = gazeFromClientPoint(
      e.clientX,
      e.clientY,
      m.rect,
      1
    );
    const isTouch = e.pointerType === "touch";
    const directHitRadius = isTouch ? 34 : R_POKE;

    if (dist <= directHitRadius) {
      m.idleSince = now;
      m.arousal = Math.max(m.arousal, 0.8);
      m.interest = Math.max(m.interest, 0.65);

      if (e.shiftKey) {
        pokeTracker.reset();
        g.batHang();
        return;
      }

      const count = pokeTracker.record(now);
      if (count >= POKE_BATHANG_COUNT) {
        pokeTracker.reset();
        g.batHang();
      } else if (count >= POKE_ANNOYED_COUNT) {
        g.annoyedAirplane(dx >= 0 ? -1 : 1);
      } else {
        if (m.mode === "bored" || m.mode === "drowsy") {
          g.switchMode("tracking");
        }
        g.pokeHop(dx >= 0 ? 1 : -1);
      }
      return;
    }

    if (isTouch) {
      m.idleSince = now;
      m.arousal = Math.max(m.arousal, 0.65);
      m.holdGazeUntil = now + 950;
      const side: Side = dx >= 0 ? "right" : "left";
      g.acousticEarSwivel(side);
      scheduler.run("gaze", (ctx) => {
        ctx.busyFor(900);
        ctx.anim(rig.gazeX, gx, {
          duration: SACCADE_MS / 1000,
          ease: [0.2, 1.12, 0.45, 1],
        });
        ctx.anim(rig.gazeY, gy, {
          duration: SACCADE_MS / 1000,
          ease: [0.2, 1.12, 0.45, 1],
        });
      });
      return;
    }

    if (
      dist > 220 &&
      !scheduler.isBusy("choreo") &&
      (m.mode === "idle" || m.mode === "bored" || now < m.holdGazeUntil)
    ) {
      g.acousticEarSwivel(dx >= 0 ? "right" : "left");
    }
  };

  const onLeave = (e: PointerEvent) => {
    if (e.relatedTarget === null) m.present = false;
  };
  const onBlur = () => {
    m.present = false;
  };

  const onScroll = () => {
    measure();
    const t = performance.now();
    const y = window.scrollY;
    const dt = (t - lastScrollAt) / 1000;
    const dy = y - lastScrollY;
    lastScrollY = y;
    lastScrollAt = t;

    if (
      dt > 0.008 &&
      dy / dt > SCROLL_BREEZE_SPEED &&
      onScreen &&
      m.visible &&
      !scheduler.isBusy("choreo") &&
      !m.purringActive
    ) {
      g.scrollBreeze();
    }
  };

  const sensors = createSiteSensors(el, {
    onThemeChange: (dir) => {
      m.idleSince = Date.now();
      m.arousal = Math.max(m.arousal, 0.7);
      if (dir === "to-light") {
        g.themeGlare();
      } else {
        g.themeNightPerk();
      }
    },
    onNavHover: (targetRect) => {
      if (!targetRect || !m.rect) {
        m.navHover = null;
        return;
      }
      const cx = targetRect.left + targetRect.width / 2;
      const cy = targetRect.top + targetRect.height / 2;
      const { gx, gy } = gazeFromClientPoint(cx, cy, m.rect, 0.9, 180);
      m.navHover = { gx, gy };
    },
    onSecretCue: (cue) => {
      m.idleSince = Date.now();
      m.arousal = Math.max(m.arousal, 0.75);
      if (cue === "bat") {
        g.batHang();
      } else {
        g.happyMeow();
      }
    },
  });

  /* -------------------- suspension & lifecycle -------------------- */
  let mindTimer: ReturnType<typeof setInterval> | null = null;
  let speedTimer: ReturnType<typeof setInterval> | null = null;
  let routeMeasureTimer: ReturnType<typeof setTimeout> | null = null;
  let wasPresent = false;
  let onScreen = true;
  let tabVisible = document.visibilityState === "visible";

  const sampleSpeed = () => {
    const dx = m.lastX - m.cx;
    const dy = m.lastY - m.cy;
    m.speed = m.speed * 0.65 + Math.min(Math.hypot(dx, dy) * 20, 4000) * 0.35;
    m.cx = m.lastX;
    m.cy = m.lastY;
  };

  const enter = (next: Mode) => {
    if (m.mode === next) return;
    g.switchMode(next);
    g.applyPose(next);
    if (next === "drowsy") g.noddingOff();
  };

  /* -------------------- 10 Hz mind tick -------------------- */
  const tick = () => {
    if (!m.visible || !m.rect) return;
    const now = Date.now();
    const dt = TICK_MS / 1000;

    // Route change glance
    const currentPath = window.location.pathname;
    if (currentPath !== m.lastPathname) {
      m.lastPathname = currentPath;
      m.idleSince = now;
      g.routeGlance();
      if (routeMeasureTimer) clearTimeout(routeMeasureTimer);
      routeMeasureTimer = setTimeout(measure, 280);
    }

    // Stimulus
    let stimulus = 0;
    let dist = Infinity;
    let cursorDx = 0;
    if (m.present) {
      const cx = m.rect.left + m.rect.width / 2;
      const cy = m.rect.top + m.rect.height / 2;
      cursorDx = m.lastX - cx;
      const dy = m.lastY - cy;
      dist = Math.hypot(cursorDx, dy);

      const age = performance.now() - m.lastT;
      if (age > 150) m.speed *= 0.6;

      const sProx = clamp01((R_FAR - dist) / (R_FAR - R_NEAR));
      const sSpeed = clamp01(m.speed / V_REF);
      stimulus = sProx * (0.55 + 0.45 * sSpeed);

      if (dist < R_STARTLE && m.speed > V_STARTLE) {
        g.startle();
      }
    }

    // Asymmetric arousal & interest integrator
    const tau = stimulus > m.arousal ? TAU_AROUSAL_UP : TAU_AROUSAL_DOWN;
    m.arousal += (stimulus - m.arousal) * (1 - Math.exp(-dt / tau));

    if (m.arousal > 0.35) {
      m.interest = clamp01(
        m.interest + INTEREST_UP * ((m.arousal - 0.35) / 0.65) * dt
      );
    } else {
      m.interest = clamp01(m.interest - INTEREST_DOWN * dt);
    }

    if (stimulus > 0.15) m.idleSince = now;

    // Exit purr if petting paused, expired, or cursor left; otherwise lean smoothly
    if (
      m.purringActive &&
      (!m.present || dist > R_PET + 14 || !petDetector.isActive(now))
    ) {
      g.exitPurr(true);
    } else if (m.purringActive) {
      g.updatePurrLean(m.purrLeanDir);
    }

    const choreoBusy = scheduler.isBusy("choreo");

    // Sustained gentle hover -> slow blink
    if (
      m.present &&
      dist <= R_HOVER_BLINK &&
      m.speed < V_HOVER_MAX &&
      !m.purringActive
    ) {
      if (m.nearHoverSince === 0) m.nearHoverSince = now;
      if (
        now - m.nearHoverSince >= HOVER_BLINK_MS &&
        now - m.lastSlowBlink >= SLOWBLINK_COOLDOWN_MS &&
        !scheduler.isBusy("choreo", "blink")
      ) {
        m.lastSlowBlink = now;
        m.nearHoverSince = now;
        g.blink(true);
      }
    } else {
      m.nearHoverSince = 0;
    }

    // Mode selection with hysteresis gaps
    const dwell = now - m.modeSince;
    const idleMs = now - m.idleSince;

    if (m.mode === "startled") {
      if (dwell > 1000 && !choreoBusy) {
        enter(m.interest > 0.3 ? "tracking" : "idle");
      }
    } else if (!choreoBusy && !m.purringActive) {
      if (m.interest >= 0.55 && dwell > 600) {
        if (
          m.mode === "tracking" &&
          dist < R_NEAR &&
          m.speed < 120 &&
          dwell > 900
        ) {
          enter("curious");
          g.tiltHead(cursorDx >= 0 ? 1 : -1);
        } else if (m.mode !== "curious") {
          enter("tracking");
        }
      } else if (m.interest < 0.35) {
        if (idleMs > m.circadian.drowsyMs) enter("drowsy");
        else if (idleMs > m.circadian.boredMs) enter("bored");
        else if (dwell > 600) enter("idle");
      }
    }

    // Continuous arousal + boredom blending + independent acoustic ear radar
    const canBlend =
      !choreoBusy &&
      !scheduler.isBusy("pose") &&
      (m.mode === "idle" ||
        m.mode === "tracking" ||
        m.mode === "curious" ||
        m.mode === "bored" ||
        m.mode === "drowsy");

    if (canBlend) {
      const p = POLICY[m.mode];
      const boredStart = m.circadian.boredMs * 0.55;
      const boredRamp = clamp01(
        (idleMs - boredStart) / Math.max(1, m.circadian.boredMs - boredStart)
      );
      const drowsyRamp = clamp01(
        (idleMs - m.circadian.boredMs) /
          Math.max(1, m.circadian.drowsyMs - m.circadian.boredMs)
      );

      let targetLidRy = p.lidRy;
      let targetLidCy = p.lidCy;
      let targetFlatTop = p.flatTop;
      let targetEarBaseY = p.earY;

      if (m.mode === "idle") {
        targetEarBaseY += m.circadian.earBonus + boredRamp * 6;
        targetLidRy += m.circadian.lidBonus - boredRamp * 2.5 + m.arousal * 1.4;
        targetLidCy += boredRamp * 2;
        targetFlatTop += boredRamp * 0.25;
      } else if (m.mode === "bored") {
        targetEarBaseY = lerp(POLICY.bored.earY, POLICY.drowsy.earY, drowsyRamp);
        targetLidRy = lerp(POLICY.bored.lidRy, POLICY.drowsy.lidRy, drowsyRamp);
        targetLidCy = lerp(POLICY.bored.lidCy, POLICY.drowsy.lidCy, drowsyRamp);
        targetFlatTop = lerp(
          POLICY.bored.flatTop,
          POLICY.drowsy.flatTop,
          drowsyRamp
        );
      } else {
        targetEarBaseY += m.circadian.earBonus - m.arousal * 1.5;
        targetLidRy += m.circadian.lidBonus + m.arousal * 0.8;
      }

      // Independent 2D acoustic ear radar (even when looking away or idle)
      let radarL = 0;
      let radarR = 0;
      let radarSpreadL = 0;
      let radarSpreadR = 0;
      if (m.present && dist < R_FAR) {
        const radarStrength = clamp01((R_FAR - dist) / (R_FAR - R_NEAR));
        const cursorSideBias = clamp(cursorDx / 120, -1, 1);
        if (cursorSideBias < -0.1) {
          radarL = -5.5 * radarStrength * -cursorSideBias;
          radarSpreadL = 3 * radarStrength * -cursorSideBias;
          radarR = 2 * radarStrength * -cursorSideBias;
        } else if (cursorSideBias > 0.1) {
          radarR = -5.5 * radarStrength * cursorSideBias;
          radarSpreadR = 3 * radarStrength * cursorSideBias;
          radarL = 2 * radarStrength * cursorSideBias;
        }
      }

      setIfChanged(rig.poseLidRy, targetLidRy);
      if (!scheduler.isBusy("blink")) {
        setIfChanged(rig.lidCy, targetLidCy);
      }
      setIfChanged(rig.flatTop, targetFlatTop, 0.002);
      setIfChanged(rig.crescent, 0, 0.002);
      setIfChanged(rig.slant, p.slant, 0.002);

      if (!scheduler.isBusy("ear")) {
        setIfChanged(rig.earLY, targetEarBaseY + radarL);
        setIfChanged(rig.earRY, targetEarBaseY + radarR);
        setIfChanged(rig.earSpreadL, p.earSpread + radarSpreadL);
        setIfChanged(rig.earSpreadR, p.earSpread + radarSpreadR);
      }

      // Keep body centered without hover/pat sliding or zoom shift
      setIfChanged(rig.rootSx, 1, 0.002);
      setIfChanged(rig.rootSy, 1, 0.002);
      setIfChanged(rig.rootTx, 0, 0.04);
      setIfChanged(rig.rootTy, 0, 0.04);
      setIfChanged(rig.tilt, 0, 0.04);
      setIfChanged(rig.flip, 0, 0.05);
    }

    // Autonomous gaze & nav hover target
    const tracking = POLICY[m.mode].gain > 0 && m.present;
    if (now > m.holdGazeUntil && !choreoBusy && !m.purringActive && !tracking) {
      let target: [number, number] | null = null;

      if (m.navHover) {
        target = [m.navHover.gx, m.navHover.gy];
      } else if (m.mode === "bored" || m.mode === "drowsy") {
        target = [-0.5, 0.25];
      } else if (now > m.nextLookAway) {
        const pool =
          m.domTargets.length > 0
            ? m.domTargets
            : ([[0.75, 0.35]] as Array<[number, number]>);
        let i = Math.floor(Math.random() * pool.length);
        if (i === m.lookIndex && pool.length > 1) {
          i = (i + 1) % pool.length;
        }
        m.lookIndex = i;
        target = pool[i];
        m.nextLookAway = now + rand(LOOKAWAY_EVERY[0], LOOKAWAY_EVERY[1]);
      }

      if (target) {
        const drift =
          Math.abs(target[0] - rig.gazeX.get()) * 18 +
          Math.abs(target[1] - rig.gazeY.get()) * 18;
        if (drift > SACCADE_DEADZONE && !m.saccadeAt) {
          m.pendingGaze = target;
          m.saccadeAt = now + rand(SACCADE_LATENCY[0], SACCADE_LATENCY[1]);
        }
      }
    }

    if (m.saccadeAt && now >= m.saccadeAt && m.pendingGaze) {
      const [tx, ty] = m.pendingGaze;
      const ease: [number, number, number, number] = [0.2, 1.12, 0.45, 1];
      scheduler.run("gaze", (ctx) => {
        ctx.anim(rig.gazeX, tx, { duration: SACCADE_MS / 1000, ease });
        ctx.anim(rig.gazeY, ty, { duration: SACCADE_MS / 1000, ease });
      });
      m.saccadeAt = 0;
      m.pendingGaze = null;
    }

    if (!tracking || dist > 90) {
      if (rig.vergenceTarget.get() !== 0) rig.vergenceTarget.set(0);
    }

    if (!m.present && wasPresent) {
      m.holdGazeUntil = now + DOUBLE_TAKE_MS;
    } else if (m.present && m.holdGazeUntil <= now) {
      m.holdGazeUntil = 0;
    }
    wasPresent = m.present;

    // Autonomous punctuation
    if (
      now > m.nextBlink &&
      !choreoBusy &&
      !m.purringActive &&
      m.mode !== "hanging"
    ) {
      const slow =
        m.mode === "tracking" &&
        dist < R_NEAR &&
        now - m.lastSlowBlink > SLOWBLINK_COOLDOWN_MS;
      if (slow) m.lastSlowBlink = now;
      g.blink(slow, !slow && Math.random() < 0.2);
      const base = m.mode === "bored" || m.mode === "drowsy" ? 7000 : 1600;
      const mean = m.mode === "bored" || m.mode === "drowsy" ? 4000 : 2800;
      m.nextBlink =
        now + Math.min(base - Math.log(1 - Math.random()) * mean, 11_000);
    }

    if (now > m.nextFlick && !choreoBusy && !m.purringActive) {
      g.earFlick();
      const [lo, hi] =
        m.mode === "bored" || m.mode === "drowsy" ? [6000, 9000] : FLICK_EVERY;
      m.nextFlick = now + rand(lo, hi);
    }

    if (
      now > m.nextLookAway &&
      POLICY[m.mode].gain > 0 &&
      !choreoBusy &&
      !m.purringActive &&
      !m.navHover
    ) {
      const awaySide = m.present
        ? cursorDx >= 0
          ? -1
          : 1
        : Math.random() < 0.5
          ? -1
          : 1;
      const cursorSide: Side | undefined = m.present
        ? cursorDx >= 0
          ? "right"
          : "left"
        : undefined;
      g.lookAway(awaySide, cursorSide);
      m.nextLookAway = now + rand(LOOKAWAY_EVERY[0], LOOKAWAY_EVERY[1]);
    }

    // Rare nocturnal dark-mode bat hang easter egg (once per session)
    if (
      !m.autoBatHung &&
      m.circadian.isNight &&
      document.documentElement.classList.contains("dark") &&
      idleMs > 32_000 &&
      !m.present &&
      !choreoBusy
    ) {
      m.autoBatHung = true;
      g.batHang();
    }
  };

  const suspend = () => {
    if (mindTimer) clearInterval(mindTimer);
    if (speedTimer) clearInterval(speedTimer);
    if (routeMeasureTimer) clearTimeout(routeMeasureTimer);
    mindTimer = speedTimer = routeMeasureTimer = null;
    m.suspendedAt = Date.now();
    m.present = false;
    wasPresent = false;
    m.purringActive = false;
    m.purrStartedAt = 0;
    m.purrLeanDir = 1;
    m.navHover = null;
    petDetector.reset();
    orbitDetector.reset();
    scheduler.cancelAll();
    sensors.detach();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onPointerDown);
  };

  const resume = () => {
    if (mindTimer) return;
    const now = Date.now();
    m.circadian = getCircadianProfile();
    measure();
    sensors.attach();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    speedTimer = setInterval(sampleSpeed, 50);
    mindTimer = setInterval(tick, TICK_MS);

    if (m.suspendedAt > 0 && now - m.suspendedAt >= REUNION_AWAY_MS) {
      m.idleSince = now;
      g.wakeUpReunion();
    } else {
      m.idleSince = now;
    }
    m.suspendedAt = 0;
  };

  const sync = () => {
    if (onScreen && tabVisible) resume();
    else suspend();
  };

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
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  document.addEventListener("visibilitychange", onVisibility);

  resume();

  return () => {
    suspend();
    io.disconnect();
    window.removeEventListener("pointerout", onLeave);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measure);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
