import {
  DIZZY_RADIANS,
  FALLBACK_LOOK_TARGETS,
  PET_HOLD_MS,
  PET_MAX_CONTINUOUS_MS,
  PET_MIN_STROKE_PX,
  PET_REENTER_COOLDOWN_MS,
  PET_REVERSALS,
  PET_WINDOW_MS,
  POKE_WINDOW_MS,
  R_ORBIT_MAX,
  R_ORBIT_MIN,
  R_PET,
  R_WIGGLE_MAX,
  R_WIGGLE_MIN,
  V_PET_MAX,
  V_WIGGLE_MAX,
  V_WIGGLE_MIN,
  WIGGLE_MIN_DELTA_PX,
  WIGGLE_REVERSALS,
  WIGGLE_WINDOW_MS,
} from "./config";
import { gazeFromClientPoint } from "./geometry";

export type ThemeChangeDirection = "to-light" | "to-dark";
export type SecretCue = "bat" | "meow";

export function collectDomLookTargets(
  svgEl: SVGSVGElement,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">
): Array<[number, number]> {
  const candidates: Element[] = [];
  const headerLinks = document.querySelectorAll(
    "header a[href], header button"
  );
  headerLinks.forEach((node) => {
    if (!node.contains(svgEl) && node !== svgEl) {
      candidates.push(node);
    }
  });

  const mainAnchor = document.querySelector("main h1, main p");
  if (mainAnchor) candidates.push(mainAnchor);

  const out: Array<[number, number]> = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const r = candidates[i].getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const { gx, gy } = gazeFromClientPoint(cx, cy, rect, 1, 220);

    let duplicate = false;
    for (let j = 0; j < out.length; j += 1) {
      if (Math.hypot(out[j][0] - gx, out[j][1] - gy) < 0.2) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) out.push([gx, gy]);
  }

  return out.length >= 2 ? out : FALLBACK_LOOK_TARGETS.slice();
}

export interface SiteSensorCallbacks {
  onThemeChange: (dir: ThemeChangeDirection) => void;
  onNavHover: (rect: DOMRect | null) => void;
  onSecretCue: (cue: SecretCue) => void;
}

export function createSiteSensors(
  svgEl: SVGSVGElement,
  callbacks: SiteSensorCallbacks
) {
  let attached = false;
  let wasDark = false;
  let attachedAt = 0;
  let themeObserver: MutationObserver | null = null;
  let activeNavEl: Element | null = null;
  let keyBuffer = "";
  const headerRoot: EventTarget = svgEl.closest("header") || document;

  const onPointerOver = (e: Event) => {
    const target = e.target as Element | null;
    if (!target || !target.closest) return;
    const interactive = target.closest("a[href], button");
    if (!interactive || interactive.contains(svgEl)) return;
    if (activeNavEl === interactive) return;
    activeNavEl = interactive;
    callbacks.onNavHover(interactive.getBoundingClientRect());
  };

  const onPointerOut = (e: Event) => {
    if (!activeNavEl) return;
    const mouse = e as PointerEvent;
    const related = mouse.relatedTarget as Element | null;
    if (related && activeNavEl.contains(related)) return;
    activeNavEl = null;
    callbacks.onNavHover(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target) {
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
    }
    if (e.key.length !== 1) return;
    keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-4);
    if (keyBuffer.slice(-3) === "bat") {
      keyBuffer = "";
      callbacks.onSecretCue("bat");
    } else if (keyBuffer === "meow") {
      keyBuffer = "";
      callbacks.onSecretCue("meow");
    }
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    attachedAt = Date.now();
    wasDark = document.documentElement.classList.contains("dark");

    themeObserver = new MutationObserver(() => {
      if (Date.now() - attachedAt < 500) {
        wasDark = document.documentElement.classList.contains("dark");
        return;
      }
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark !== wasDark) {
        wasDark = isDark;
        callbacks.onThemeChange(isDark ? "to-dark" : "to-light");
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    headerRoot.addEventListener("pointerover", onPointerOver, {
      passive: true,
    });
    headerRoot.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: true });
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    activeNavEl = null;
    keyBuffer = "";
    themeObserver?.disconnect();
    themeObserver = null;
    headerRoot.removeEventListener("pointerover", onPointerOver);
    headerRoot.removeEventListener("pointerout", onPointerOut);
    window.removeEventListener("keydown", onKeyDown);
  };

  return { attach, detach };
}

export function createPetDetector() {
  let hasLast = false;
  let lastDx = 0;
  let lastDir = 0;
  let startedAt = 0;
  let activeUntil = 0;
  let cooldownUntil = 0;
  let reversals: number[] = [];

  const reset = () => {
    hasLast = false;
    lastDir = 0;
    startedAt = 0;
    activeUntil = 0;
    reversals = [];
  };

  const isActive = (now: number) =>
    now < activeUntil &&
    (startedAt === 0 || now - startedAt < PET_MAX_CONTINUOUS_MS);

  const feed = (
    dx: number,
    dist: number,
    speed: number,
    now: number
  ): { active: boolean; expired: boolean; leanDir: number } => {
    if (now < cooldownUntil) {
      reset();
      return { active: false, expired: false, leanDir: 0 };
    }

    if (startedAt > 0 && now - startedAt >= PET_MAX_CONTINUOUS_MS) {
      const lean = lastDir;
      cooldownUntil = now + PET_REENTER_COOLDOWN_MS;
      reset();
      return { active: false, expired: true, leanDir: lean };
    }

    if (startedAt > 0 && now >= activeUntil) {
      const lean = lastDir;
      reset();
      return { active: false, expired: true, leanDir: lean };
    }

    if (dist > R_PET || speed > V_PET_MAX) {
      if (now >= activeUntil) reset();
      return { active: isActive(now), expired: false, leanDir: lastDir };
    }

    if (!hasLast) {
      hasLast = true;
      lastDx = dx;
      return { active: isActive(now), expired: false, leanDir: lastDir };
    }

    const moveX = dx - lastDx;
    if (Math.abs(moveX) >= PET_MIN_STROKE_PX) {
      const dir = moveX > 0 ? 1 : -1;
      if (lastDir !== 0 && dir !== lastDir) {
        reversals = reversals.filter((t) => now - t <= PET_WINDOW_MS);
        reversals.push(now);
      }
      lastDir = dir;
      lastDx = dx;
      if (startedAt > 0) {
        activeUntil = now + PET_HOLD_MS;
      } else if (reversals.length >= PET_REVERSALS) {
        startedAt = now;
        activeUntil = now + PET_HOLD_MS;
      }
    }

    return { active: isActive(now), expired: false, leanDir: lastDir };
  };

  return { feed, isActive, reset };
}

export function createWiggleDetector() {
  let hasLast = false;
  let lastDx = 0;
  let lastDy = 0;
  let prevVx = 0;
  let prevVy = 0;
  let reversals: number[] = [];

  const reset = () => {
    hasLast = false;
    prevVx = 0;
    prevVy = 0;
    reversals = [];
  };

  const feed = (
    dx: number,
    dy: number,
    dist: number,
    speed: number,
    now: number
  ): boolean => {
    if (
      dist < R_WIGGLE_MIN ||
      dist > R_WIGGLE_MAX ||
      speed < V_WIGGLE_MIN ||
      speed > V_WIGGLE_MAX
    ) {
      if (dist < R_WIGGLE_MIN || dist > R_WIGGLE_MAX + 40) reset();
      return false;
    }

    if (!hasLast) {
      hasLast = true;
      lastDx = dx;
      lastDy = dy;
      return false;
    }

    const vx = dx - lastDx;
    const vy = dy - lastDy;
    if (Math.hypot(vx, vy) >= WIGGLE_MIN_DELTA_PX) {
      if ((prevVx !== 0 || prevVy !== 0) && vx * prevVx + vy * prevVy < 0) {
        reversals = reversals.filter((t) => now - t <= WIGGLE_WINDOW_MS);
        reversals.push(now);
      }
      prevVx = vx;
      prevVy = vy;
      lastDx = dx;
      lastDy = dy;

      if (reversals.length >= WIGGLE_REVERSALS) {
        reversals = [];
        return true;
      }
    }

    return false;
  };

  return { feed, reset };
}

export function createOrbitDetector() {
  let hasLast = false;
  let lastAngle = 0;
  let lastTime = 0;
  let accumulated = 0;

  const reset = () => {
    hasLast = false;
    accumulated = 0;
  };

  const feed = (dx: number, dy: number, dist: number, now: number): number => {
    if (dist < R_ORBIT_MIN || dist > R_ORBIT_MAX || now - lastTime > 650) {
      reset();
      if (dist >= R_ORBIT_MIN && dist <= R_ORBIT_MAX) {
        hasLast = true;
        lastAngle = Math.atan2(dy, dx);
        lastTime = now;
      }
      return 0;
    }

    const angle = Math.atan2(dy, dx);
    if (!hasLast) {
      hasLast = true;
      lastAngle = angle;
      lastTime = now;
      return 0;
    }

    let dTheta = angle - lastAngle;
    while (dTheta > Math.PI) dTheta -= Math.PI * 2;
    while (dTheta <= -Math.PI) dTheta += Math.PI * 2;

    lastAngle = angle;
    lastTime = now;

    if (Math.abs(dTheta) > 0.35 && dTheta * accumulated < 0) {
      accumulated = dTheta;
    } else {
      accumulated += dTheta;
    }

    if (Math.abs(accumulated) >= DIZZY_RADIANS) {
      const dir = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      return dir;
    }

    return 0;
  };

  return { feed, reset };
}

export function createPokeTracker() {
  let pokes: number[] = [];

  const record = (now: number): number => {
    pokes = pokes.filter((t) => now - t <= POKE_WINDOW_MS);
    pokes.push(now);
    return pokes.length;
  };

  const reset = () => {
    pokes = [];
  };

  return { record, reset };
}
