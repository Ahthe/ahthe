"use client";

import { memo, useEffect, useId, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { HEAD, HEAD_RX, HEAD_RY, type Mode } from "./batcat/config";
import {
  INITIAL_EAR_L,
  INITIAL_EAR_R,
  INITIAL_EYE_L,
  INITIAL_EYE_R,
  rand,
} from "./batcat/geometry";
import { startBatCatMind } from "./batcat/mind";
import { useBatCatRig } from "./batcat/rig";

function BatCatImpl({
  width = 96,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const clipId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<SVGGElement>(null);
  const earLRef = useRef<SVGPathElement>(null);
  const earRRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGEllipseElement>(null);
  const eyeLRef = useRef<SVGPathElement>(null);
  const eyeRRef = useRef<SVGPathElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");

  const rig = useBatCatRig();

  /* Imperative MotionValue subscriptions keep continuous SVG updates
   * off React's render tree and eliminate <motion.*> SSR/hydration
   * mismatches (`useLayoutEffect` warnings and attr differences). */
  useEffect(() => {
    const applyTransform = (v: string) => {
      const node = rootRef.current;
      if (!node) return;
      if (v) node.setAttribute("transform", v);
      else node.removeAttribute("transform");
    };
    const applyEarL = (v: string) => earLRef.current?.setAttribute("d", v);
    const applyEarR = (v: string) => earRRef.current?.setAttribute("d", v);
    const applyHeadCx = (v: number) =>
      headRef.current?.setAttribute("cx", String(v));
    const applyHeadCy = (v: number) =>
      headRef.current?.setAttribute("cy", String(v));
    const applyEyeL = (v: string) => eyeLRef.current?.setAttribute("d", v);
    const applyEyeR = (v: string) => eyeRRef.current?.setAttribute("d", v);

    applyTransform(rig.rootTransform.get());
    applyEarL(rig.earLD.get());
    applyEarR(rig.earRD.get());
    applyHeadCx(rig.headCx.get());
    applyHeadCy(rig.headCy.get());
    applyEyeL(rig.eyeLD.get());
    applyEyeR(rig.eyeRD.get());

    const unsubs = [
      rig.rootTransform.on("change", applyTransform),
      rig.earLD.on("change", applyEarL),
      rig.earRD.on("change", applyEarR),
      rig.headCx.on("change", applyHeadCx),
      rig.headCy.on("change", applyHeadCy),
      rig.eyeLD.on("change", applyEyeL),
      rig.eyeRD.on("change", applyEyeR),
    ];

    return () => {
      for (let i = 0; i < unsubs.length; i += 1) {
        unsubs[i]();
      }
    };
  }, [rig]);

  /* Reduced motion: blink only. No listeners, no observers, no mind. */
  useEffect(() => {
    if (!prefersReducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    let ctrlL: ReturnType<typeof animate> | null = null;
    let ctrlR: ReturnType<typeof animate> | null = null;

    const loop = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === "visible") {
          ctrlL = animate(rig.lidOpenL, 0, { duration: 0.07 });
          ctrlR = animate(rig.lidOpenR, 0, { duration: 0.07 });
          ctrlL.then(() => {
            if (cancelled) return;
            ctrlL = animate(rig.lidOpenL, 1, { duration: 0.14 });
            ctrlR = animate(rig.lidOpenR, 1, { duration: 0.14 });
          });
        }
        loop();
      }, rand(6000, 10_000));
    };

    loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrlL?.stop();
      ctrlR?.stop();
    };
  }, [prefersReducedMotion, rig.lidOpenL, rig.lidOpenR]);

  /* Full living character mind. */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = svgRef.current;
    if (!el) return;
    return startBatCatMind(el, rig, setMode);
  }, [prefersReducedMotion, rig]);

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
          className="fill-zinc-900 dark:fill-zinc-100"
        />
        <g ref={rootRef}>
          <path
            ref={earLRef}
            d={INITIAL_EAR_L}
            className="fill-zinc-100 dark:fill-zinc-900"
          />
          <path
            ref={earRRef}
            d={INITIAL_EAR_R}
            className="fill-zinc-100 dark:fill-zinc-900"
          />
          <ellipse
            ref={headRef}
            rx={HEAD_RX}
            ry={HEAD_RY}
            cx={HEAD.x}
            cy={HEAD.y}
            className="fill-zinc-100 dark:fill-zinc-900"
          />
          <path
            ref={eyeLRef}
            d={INITIAL_EYE_L}
            className="fill-zinc-900 dark:fill-zinc-100"
          />
          <path
            ref={eyeRRef}
            d={INITIAL_EYE_R}
            className="fill-zinc-900 dark:fill-zinc-100"
          />
        </g>
      </g>
    </svg>
  );
}

/* header.tsx re-renders on every navigation (usePathname) and every
 * theme change, which would drag BatCat with it and force a re-diff of
 * every SVG element. Props are stable literals, so memo is free. */
const BatCat = memo(BatCatImpl);
export default BatCat;
