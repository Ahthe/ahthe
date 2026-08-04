# Micro-animations and BatCat rework — design

**Date:** 2026-08-03
**Status:** Approved, pending implementation plan
**Scope:** Motion system for the portfolio site, plus a rewrite of the BatCat logo component

---

## Goal

Introduce a small, consistent motion system across the site and fix the BatCat
component's internals — without making the site look animated.

The site's job is to get its author interviews. Motion serves continuity and
feedback only. Anything a visitor consciously notices as "an animation" has
failed.

## Decisions on record

Two choices were made explicitly by the site owner and constrain everything below.

1. **Motion intent: quiet, invisible polish.** Not a frontend skill demo. This
   rules out scroll-triggered reveals, animated nav text, card entrance
   choreography, and an expressive mascot.
2. **BatCat stays as-is in placement.** 40px, in the header, on every page. It
   gets fixed and refined, not enlarged or given new personality states.

A third choice was made by the implementer and should be revisited if it feels
wrong in the browser:

3. **Page-enter motion: 280ms on `cubic-bezier(0.16, 1, 0.3, 1)`, 8px rise, no
   stagger.** Chosen over the same curve *with* a 45ms stagger, because stagger
   draws attention to the choreography itself, and dropping it lets us delete
   the existing stagger mechanism rather than tune it. Reverting to a staggered
   variant is a single-line change.

## Current state

Existing motion, as audited:

| Element | Location | Status |
| --- | --- | --- |
| `enter` keyframe (`1s ease-out`, 10px) | `tailwind.config.ts:61-69` | Too slow — a full second |
| `.container > *` stagger, `--delay: 120ms` | `globals.css:232-236` | Used on the about page only |
| `animate-enter` | `app/(about)/page.tsx:49` | About page only; all other routes hard-cut |
| `MovingElement` magnetic hover | `components/ui/moving-element.tsx` | Working, used on the theme toggle |
| `AnimatedText` letter-roll | `components/ui/animated-text.tsx` | Built, imported at `header.tsx:11`, never rendered |
| `.fade` class | `header.tsx:42` | Not defined anywhere — a no-op |
| `whileHover` scale on project links | `app/projects/page.tsx` | Working |
| `prefers-reduced-motion` handling | — | **None, anywhere on the site** |

The two most visible defects are that only one route animates in, and that the
nav reflows on every navigation (see §3).

---

## 1. Motion tokens

All motion on the site resolves to three durations and two curves. Ad-hoc
timing values are not permitted after this change.

```css
/* app/globals.css — inside @layer base :root */
--ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1); /* reveals: fast out, long settle */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);  /* symmetric: state toggles */
--dur-fast:  150ms;  /* hover, focus, colour */
--dur-base:  280ms;  /* page enter */
--dur-slow:  400ms;  /* theme cross-fade only */
```

The long deceleration tail on `--ease-out-soft` is the entire reason the result
reads as considered rather than templated. It is the same curve family used by
Linear and Vercel.

**Edits:**

- `tailwind.config.ts:69` — `enter: "enter 1s ease-out"` becomes
  `enter: "enter 280ms cubic-bezier(0.16, 1, 0.3, 1)"`. The literal is repeated
  here because Tailwind's config cannot read the CSS custom property; the two
  must be kept in sync, and a comment in the config should say so.
- `tailwind.config.ts:62` — keyframe `translateY(10px)` becomes `translateY(8px)`.
- `globals.css:232-236` — delete the `.container > *` stagger block entirely.

---

## 2. Page enter, applied consistently

`animate-enter` currently exists on the about page alone, so about fades up and
every other route hard-cuts. The inconsistency is more noticeable than either
behaviour would be on its own.

Add `animate-enter` to the `Container` on:

- `app/work/page.tsx`
- `app/projects/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/projects/[slug]/page.tsx`

and keep it on `app/(about)/page.tsx:49`.

**This is deliberately not a layout-level route transition.** Animating at the
layout boundary requires `AnimatePresence` and a client component, which would
convert `/`, `/work`, and `/projects` from prerendered static pages into
client-rendered ones. Six one-line edits cost nothing and preserve static
rendering.

**Incidental fix:** `components/shared/container.tsx:29` interpolates
`${className}` directly, so every `Container` rendered without a `className`
emits a literal `undefined` in its class attribute. Since this change adds a
`className` to six more call sites, switch the component to `cn()` from
`lib/utils.ts` while we are here.

---

## 3. Navigation

**Fix the layout shift.** `components/header.tsx:68` swaps `font-normal` for
`font-semibold` on the active link. Semibold glyphs are wider, so the entire nav
reflows every time the route changes — sibling links physically move. This is
the single most conspicuous motion defect on the site and it is unintentional.

Replace the weight swap with a non-metric indicator:

- All links render at `font-normal` at all times.
- Inactive links: `opacity-60`.
- Active link: full opacity plus a 1px underline in `currentColor`.
- Transition `opacity` over `--dur-fast` on `--ease-standard`.

Note: do **not** use `--accent` for the underline. In light mode it resolves to
`hsl(214 3.31% 91.4%)` against a `zinc-50` background, and in dark mode to
`hsl(240 3.7% 15.9%)` against `zinc-950` — near-invisible in both. This is
already why the underline in `AnimatedText` reads as absent. `currentColor` at
reduced opacity inherits correctly in both themes.

Because nothing changes width, nothing moves.

**Delete `AnimatedText`.** Remove the unused import at `header.tsx:11` and
delete `components/ui/animated-text.tsx`. The letter-by-letter roll is precisely
the showy motion decision 1 rules out; leaving the file in place preserves it as
debt for no benefit.

**Delete the `.fade` class** from `header.tsx:42`. It is not defined in
`globals.css`, `tailwind.config.ts`, or anywhere else, and has never done
anything.

**Keep `MovingElement`** on the theme toggle. It is subtle, it works, and it is
the only element on the site where physical feedback is warranted.

---

## 4. Hover, focus, and transition hygiene

**Replace `transition-all`** with explicit properties at `header.tsx:69`,
`globals.css:118`, and `components/social.tsx:16`. `transition-all` animates
layout-affecting properties as well as paint-only ones; it is a performance
smell and an occasional source of unintended animation. Use `transition-colors`
or `transition-opacity` as appropriate, at `--dur-fast`.

**Add `focus-visible` rings.** The site currently has no visible focus style
beyond the browser default. Add a consistent ring built on the existing `--ring`
custom property, applied to links, buttons, and the theme toggle. This is an
accessibility fix that happens to also read as polish.

---

## 5. Theme cross-fade

`app/layout.tsx:76` sets `disableTransitionOnChange`, so light/dark switching is
an instantaneous flip.

**Keep that flag.** Removing it makes every element on the page transition its
colours simultaneously, which looks cheap and is why the flag exists.

Instead, wrap the `setTheme` call in `components/header.tsx:34-36` with the View
Transitions API:

```ts
// prefersReducedMotion comes from framer-motion's useReducedMotion(),
// called at the top of the Header component.
const toggleTheme = () => {
  const next = resolvedTheme === "dark" ? "light" : "dark";
  if (!document.startViewTransition || prefersReducedMotion) {
    setTheme(next);
    return;
  }
  document.startViewTransition(() => setTheme(next));
};
```

with a matching CSS block giving the view transition a `--dur-slow` cross-fade.

**Support:** Chrome and Edge cross-fade. Safari and Firefox fall through to the
current instant flip. There is no broken intermediate state in any browser —
the feature either engages or does not.

This is the highest-impact item in the spec and the only one carrying real
risk. It is severable: cutting it invalidates nothing else.

---

## 6. BatCat rewrite

**File:** `components/ui/batcat.tsx` (currently 355 lines)

Visual output, size, placement, and behaviour stay the same. Only the internals
change, plus one addition (§6.4).

### 6.1 Delete

- **Lines 1-172** — the entire previous version of the component, commented out.
- **`idleTime` / `setIdleTime`, `isConfused` / `setIsConfused`, `lastMovementRef`**
  (lines 202-204). `setIsConfused(false)` is called on every mouse move, but
  `isConfused` is never read and nothing ever sets it `true`. A half-built
  "confused when idle" feature, inert.
- **`earsMaxOffset`** (line 220) — declared, never used; the ear offset is
  computed from `headMoveX` instead.
- **The `touchmove` listener** (lines 270-278, 282, 285). Cursor tracking is
  meaningless on touch devices, and a `touchmove` listener doing work on every
  event harms scroll performance on exactly the devices least able to absorb it.
  Blink is retained on touch; tracking is not.

### 6.2 Fix the performance model

Current behaviour: a `mousemove` listener on `window` fires across every page,
and each event past a 5px threshold calls `setPositions`, re-rendering the SVG.
Worse, `calculatePositions` calls `getBoundingClientRect()` on every event
(line 209) — a forced layout read per mouse move, for a 40px logo.

Replacement:

- Drive `cx` / `cy` through framer-motion `useSpring` motion values on
  `motion.circle` and `motion.ellipse`. The SVG attributes update without React
  re-rendering.
- Cache the bounding rect in a ref; recompute on `scroll` and `resize` only.
- Register the `mousemove` listener as `{ passive: true }`.
- Replace `document.getElementById("brand")` (line 207) with a `useRef` on the
  `<svg>`. The hardcoded ID breaks if the component is ever rendered twice.

### 6.3 Fix the geometry

The ear paths at lines 321 and 326 begin `M${x} 34L${x} 34…` — the first two
points are identical, a degenerate zero-length line segment. Harmless, but it is
leftover noise; emit the triangle directly.

### 6.4 Add differential spring lag

The one genuinely new behaviour. Today every part tracks the cursor instantly
and in lockstep, which reads as mechanical. Give each layer its own spring, all
critically damped so nothing overshoots or bounces:

| Layer | stiffness | damping | mass | Effect |
| --- | --- | --- | --- | --- |
| Eyes | 170 | 20 | 0.6 | Leads — tracks the cursor most responsively |
| Head | 110 | 20 | 0.9 | Trails the eyes slightly |
| Ears | 90 | 19 | 1.0 | Trails the head |

Damping values are set at approximately `2·√(k·m)` — critical damping — so the
motion settles without bounce. The perceived life comes from the *lag between
layers*, not from springiness. At 40px this is felt more than seen, which is
the intent.

Existing tracking constants are unchanged: `maxDistance` 100, head offset 6,
eye offset 20, ear factor 0.5.

### 6.5 Reduced motion

Guard with framer-motion's `useReducedMotion()`. When set: eyes centred, no
cursor tracking, no blink, no listeners registered at all.

### 6.6 Retained

- 40px in the header, per decision 2.
- Random blink on a 2000-5000ms interval, 200ms closed.
- The light/dark fill inversion via `fill-zinc-900 dark:fill-zinc-100`.

Expected result: roughly 355 lines to roughly 110, with no layout reads on the
mouse-move path.

---

## 7. Reduced motion, site-wide

The site has no `prefers-reduced-motion` handling of any kind today.

Add a global block to `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This covers all CSS-driven motion. It does **not** reach JavaScript-driven
springs, which is why BatCat needs its own `useReducedMotion()` guard (§6.5) and
the theme toggle needs its own check (§5).

---

## 8. Explicitly out of scope

Considered and dropped, so the decision is on record rather than rediscovered:

- Scroll-triggered reveals and viewport-entry animation
- Animated nav text (the `AnimatedText` letter-roll — being deleted)
- Project and blog card entrance choreography
- Layout-level route transition orchestration via `AnimatePresence`
- Any enlargement of, or new personality states for, BatCat
- Any change to the interactive Go visualisation components in
  `components/interactive-components/` — they are unrelated to this work

---

## 9. Verification

The build must stay clean, and one specific property must hold:

1. `pnpm build` completes without new warnings, **and** `/`, `/work`, and
   `/projects` are still marked `○ (Static)` in the route table. This is the
   guardrail proving no page was accidentally converted to a client component.
2. DevTools → Rendering → *Emulate `prefers-reduced-motion: reduce`* → every
   page-enter animation, hover transition, and BatCat behaviour stills.
3. DevTools → Performance, recording while moving the cursor across the header →
   no scripting spikes and no forced-reflow warnings attributable to BatCat.
4. Navigate between all four nav routes → nav links do not shift horizontally.
5. Toggle the theme in Chrome → cross-fade. In Safari or Firefox → instant flip,
   no visual artefact.

Items 1 and 4 are the ones most likely to regress silently and should be
re-checked before the work is considered done.

---

## 10. Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| View Transitions cross-fade conflicts with `next-themes` class swapping | Medium | Severable — cut §5 entirely; nothing else depends on it |
| Spring lag reads as sluggish rather than alive at 40px | Medium | Tune stiffness upward; values in §6.4 are a starting point, not a result |
| Removing the stagger makes the about page feel flat | Low | Revert to the staggered variant — one line |
| `focus-visible` ring clashes with the existing `--ring` value in dark mode | Low | `--ring` is already defined for both themes in `globals.css:40,83` |
