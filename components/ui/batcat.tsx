"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/** Rest geometry, in viewBox units. */
const HEAD = { x: 90, y: 110 };
const LEFT_EYE = { x: 77.5, y: 112 };
const RIGHT_EYE = { x: 103.5, y: 112 };
const LEFT_EAR_X = 60;
const RIGHT_EAR_X = 120;

/** How far each layer travels at full cursor distance. */
const HEAD_TRAVEL = 6;
const EYE_TRAVEL = 20;
const EAR_TRAVEL = 3;

/** Cursor distance at which tracking saturates. */
const MAX_DISTANCE = 100;

/**
 * Each layer gets its own spring. Damping is set at roughly 2·√(k·m) —
 * critical damping — so nothing overshoots or bounces. The sense of life comes
 * from the *lag between layers*: eyes lead, head trails, ears trail furthest.
 */
const EYE_SPRING = { stiffness: 170, damping: 20, mass: 0.6 };
const HEAD_SPRING = { stiffness: 110, damping: 20, mass: 0.9 };
const EAR_SPRING = { stiffness: 90, damping: 19, mass: 1.0 };

const BLINK_MIN_MS = 2000;
const BLINK_RANGE_MS = 3000;
const BLINK_DURATION_MS = 200;

export default function BatCat({
  width = 96,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Normalised cursor direction, each axis in [-1, 1] and scaled by how far the
  // cursor is from the logo. Written on pointer move; never stored in state, so
  // moving the mouse does not re-render React.
  const dirX = useMotionValue(0);
  const dirY = useMotionValue(0);

  const eyeX = useSpring(dirX, EYE_SPRING);
  const eyeY = useSpring(dirY, EYE_SPRING);
  const headX = useSpring(dirX, HEAD_SPRING);
  const headY = useSpring(dirY, HEAD_SPRING);
  const earX = useSpring(dirX, EAR_SPRING);

  const headCx = useTransform(headX, (v) => HEAD.x + v * HEAD_TRAVEL);
  const headCy = useTransform(headY, (v) => HEAD.y + v * HEAD_TRAVEL);
  const leftEyeCx = useTransform(eyeX, (v) => LEFT_EYE.x + v * EYE_TRAVEL);
  const rightEyeCx = useTransform(eyeX, (v) => RIGHT_EYE.x + v * EYE_TRAVEL);
  const eyeCy = useTransform(eyeY, (v) => LEFT_EYE.y + v * EYE_TRAVEL);

  // Ears counter-rotate against the head, which reads as the head turning.
  const leftEarD = useTransform(
    earX,
    (v) => `M${LEFT_EAR_X - v * EAR_TRAVEL} 34L127 180H17Z`
  );
  const rightEarD = useTransform(
    earX,
    (v) => `M${RIGHT_EAR_X - v * EAR_TRAVEL} 34L53 180H163Z`
  );

  // Cursor tracking. No listeners at all when reduced motion is requested.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const measure = () => {
      rectRef.current = svgRef.current?.getBoundingClientRect() ?? null;
    };

    // Measured once here and on scroll/resize — never inside the move handler,
    // where it would force a layout read on every pointer event.
    measure();

    const handleMove = (event: MouseEvent) => {
      const rect = rectRef.current;
      if (!rect) return;

      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(offsetX, offsetY);
      if (distance === 0) return;

      const ratio = Math.min(1, distance / MAX_DISTANCE);
      dirX.set((offsetX / distance) * ratio);
      dirY.set((offsetY / distance) * ratio);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // Touch is deliberately not handled: cursor tracking is meaningless without
    // a cursor, and a touchmove listener costs scroll performance on exactly
    // the devices least able to absorb it.
  }, [dirX, dirY, prefersReducedMotion]);

  // Blink. One render every few seconds, which is cheap enough for state.
  useEffect(() => {
    if (prefersReducedMotion) return;

    let closeTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      closeTimer = setTimeout(() => {
        setIsBlinking(true);
        openTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, BLINK_DURATION_MS);
      }, Math.random() * BLINK_RANGE_MS + BLINK_MIN_MS);
    };

    scheduleBlink();

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <svg ref={svgRef} width={width} height={height} viewBox="0 0 180 180">
      <defs>
        <clipPath id="batcat-clip">
          <circle cx="90" cy="90" r="90" />
        </clipPath>
      </defs>
      <g clipPath="url(#batcat-clip)">
        <circle
          cx="90"
          cy="90"
          r="90"
          className={cn("fill-zinc-900 dark:fill-zinc-100")}
        />
        <motion.path
          d={leftEarD}
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
        />
        <motion.path
          d={rightEarD}
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
        />
        <motion.circle
          r="42"
          cx={headCx}
          cy={headCy}
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
        />
        <motion.ellipse
          rx="8"
          cx={leftEyeCx}
          cy={eyeCy}
          ry={isBlinking ? "0" : "14"}
          className={cn(
            "fill-zinc-900 dark:fill-zinc-100 transition-[ry] duration-150 ease-in-out"
          )}
        />
        <motion.ellipse
          rx="8"
          cx={rightEyeCx}
          cy={eyeCy}
          ry={isBlinking ? "0" : "14"}
          className={cn(
            "fill-zinc-900 dark:fill-zinc-100 transition-[ry] duration-150 ease-in-out"
          )}
        />
      </g>
    </svg>
  );
}
