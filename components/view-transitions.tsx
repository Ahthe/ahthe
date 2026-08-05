"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => {
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
};

/**
 * Cross-fades route changes using the View Transitions API.
 *
 * Deliberately implemented by intercepting link clicks rather than with
 * AnimatePresence around {children} in the root layout. Wrapping the
 * layout would convert every page into a client component and cost the
 * static prerendering of /, /work and /projects — a guardrail the motion
 * spec has protected from the start. This costs one delegated listener.
 *
 * Chrome and Edge cross-fade; Safari and Firefox fall through to the
 * normal instant navigation. There is no broken intermediate state.
 */
export function ViewTransitions() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const doc = document as DocumentWithViewTransition;
    if (prefersReducedMotion || !doc.startViewTransition) return;

    const onClick = (event: MouseEvent) => {
      // Leave modified clicks alone — they mean "new tab", "download", etc.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same-page hash links are handled by native smooth scrolling.
      if (url.pathname === window.location.pathname && url.hash) return;
      if (url.pathname === window.location.pathname && !url.search) return;

      event.preventDefault();

      doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            router.push(url.pathname + url.search);
            // Resolve once React has committed the new route. The API
            // holds the old frame until this settles, so a slightly
            // generous window is safer than a torn frame.
            const start = Date.now();
            const settle = () => {
              if (
                window.location.pathname === url.pathname ||
                Date.now() - start > 600
              ) {
                requestAnimationFrame(() => resolve());
              } else {
                requestAnimationFrame(settle);
              }
            };
            settle();
          })
      );
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router, prefersReducedMotion]);

  return null;
}
