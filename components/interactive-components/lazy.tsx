"use client";

import dynamic from "next/dynamic";

/**
 * Lazy boundary for the Go visualisers.
 *
 * These must be declared inside a *client* module. Calling next/dynamic from
 * components/mdx.tsx — a Server Component — does not split them out: Next
 * includes every client component reachable from a route's server module graph
 * in that route's client manifest and preloads it. Measured: with dynamic()
 * in mdx.tsx, a post using none of these still downloaded exactly the same 14
 * chunks as the one post that uses them.
 *
 * Declared here with `ssr: false`, each becomes a genuine async chunk fetched
 * only when a post actually renders the component.
 */

export const TaskSimulator = dynamic(
  () => import("./task-simulator").then((m) => m.TaskSimulator),
  { ssr: false }
);

export const RaceConditionVisualizer = dynamic(
  () => import("./race-condition-visualizer").then((m) => m.RaceConditionVisualizer),
  { ssr: false }
);

export const GoroutineScheduler = dynamic(
  () => import("./goroutine-scheduler").then((m) => m.GoroutineScheduler),
  { ssr: false }
);

export const ChannelSimulator = dynamic(
  () => import("./channel-simulator").then((m) => m.ChannelSimulator),
  { ssr: false }
);

export const UnbufferedChannelDemo = dynamic(
  () => import("./unbuffered-channel").then((m) => m.UnbufferedChannelDemo),
  { ssr: false }
);

export const CodePlayground = dynamic(
  () => import("./code-playground").then((m) => m.CodePlayground),
  { ssr: false }
);
