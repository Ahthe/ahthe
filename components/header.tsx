"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./shared/container";
import BatCat from "./ui/batcat";
import { MovingElement } from "./ui/moving-element";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const NAV_ITEMS = {
  about: "/",
  work: "/work",
  projects: "/projects",
  blog: "/blog",
};

/**
 * `startViewTransition` is not present in every lib.dom version, and is absent
 * in Safari and Firefox at runtime. Typing it as optional lets us feature-detect
 * without a cast at the call site.
 */
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export const Header = () => {
  const pathname = usePathname();
  // Add state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // Only show client-side components after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const doc = document as DocumentWithViewTransition;

    // Chrome and Edge cross-fade. Safari, Firefox, and anyone who asked for
    // reduced motion get the instant flip the site had before.
    if (prefersReducedMotion || !doc.startViewTransition) {
      setTheme(next);
      return;
    }

    // flushSync so the class swap lands inside the transition's capture window.
    doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }, [resolvedTheme, setTheme, prefersReducedMotion]);

  return (
    <header>
      <Container size="large">
        <nav
          className="flex flex-col items-center md:items-start justify-start py-8 tracking-tight w-full sm:pr-0 md:pr-6 lg:pr-0"
          aria-label="Main navigation"
        >
          <div className="flex flex-row items-center">
            <Link href="/">
              {/* content-visibility skips style and layout entirely once
                  the header scrolls out of view. Measured to beat an
                  IntersectionObserver, at one line and no JS. */}
              <div className="w-[40px] h-[40px] [content-visibility:auto] [contain-intrinsic-size:40px_40px]">
                <BatCat width={40} height={40} />
              </div>
              <span className="sr-only">Syed Ahthesham Ali</span>
            </Link>

            <div className="flex flex-col ml-4">
              <span className="text-medium inline-block font-medium">
                Syed Ahthesham Ali
              </span>
              <span className="opacity-60">Software Engineer</span>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between sm:justify-end w-full mt-8 sm:mt-4 mb-0 sm:mb-4 tracking-tight">
            <div className="inline-flex items-center">
              {Object.entries(NAV_ITEMS).map(([name, href]) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={name}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      // Weight stays constant. Swapping to font-semibold on the
                      // active link changes its width and reflows the whole nav
                      // on every navigation.
                      "relative flex align-middle font-normal py-1 px-2",
                      "transition-opacity [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-standard)]",
                      isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {name}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-x-2 -bottom-px h-px bg-current"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            {isMounted && (
              <MovingElement
                className="rounded-full p-[10px]"
                change={toggleTheme}
                ariaLabel={`Switch to ${
                  resolvedTheme === "dark" ? "light" : "dark"
                } mode`}
              >
                {resolvedTheme === "dark" ? (
                  <Moon size={20} />
                ) : (
                  <Sun size={20} />
                )}
              </MovingElement>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
};
