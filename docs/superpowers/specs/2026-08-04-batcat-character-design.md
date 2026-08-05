# BatCat character system — design

**Date:** 2026-08-04
**Status:** Awaiting approval
**Supersedes:** the BatCat sections (§6, and the §8 exclusion) of
`2026-08-03-micro-animations-design.md`. The rest of that spec stands.

---

## 0. What changed, and why this contradicts yesterday's spec

Yesterday's spec recorded two owner decisions that this document reverses:

- Motion intent "quiet, invisible polish", with an expressive mascot ruled out.
- §8: "Any enlargement of, or new personality states for, BatCat" — out of scope.

The owner changed direction with the tradeoff stated explicitly, and confirmed
it twice. That is a decision, not drift. This spec records the new intent so the
reversal is legible to anyone reading the repo later.

**New intent:** BatCat is the site's single deliberate personality moment.
Everything else on the site stays at "quiet polish". The rest of the motion
system is unchanged.

## 1. Decisions on record

| # | Decision | Chosen by |
|---|---|---|
| 1 | Temperament: **aloof cat × curious bat** — restraint as baseline, startle reflex underneath | Owner |
| 2 | **Drowsy is the floor.** It never fully sleeps | Owner |
| 3 | Under `prefers-reduced-motion`: **blink only**, all positional motion off | Owner |
| 4 | Stays 40×40 in the header, on every page | Owner (carried forward) |
| 5 | Performance budget is a hard gate, not a goal | Owner |

**Character definition.** Notices you, holds the gaze a beat, then deliberately
looks away. Feigns indifference while its ears keep tracking you. Gets bored
when ignored and visibly fights sleep — but never loses. Underneath the
composure is a bat's startle reflex: sudden movement snaps it to full attention
before it recovers its dignity. The comedy and the life both come from the gap
between the two.

## 2. The governing constraint: 1 CSS px = 4.5 viewBox units

Rendered at 40×40 from a 180×180 viewBox. Every design decision follows from
this. Measured feature sizes:

| Feature | viewBox | CSS px |
|---|---|---|
| Head diameter | 84 | 18.7 |
| Eye width (rx 8) | 16 | 3.56 |
| Eye height (ry 14) | 28 | 6.22 |
| Eye centre-to-centre | 26 | 5.78 |
| Ear tip above head crown | 34 | 7.56 |
| Muzzle (eye bottom → chin) | 26 | 5.78 |

**Two perception thresholds:**
- *Animated* displacement becomes perceptible at ~7 units (1.5 CSS px).
- A *held pose* needs ~13 units (3 CSS px) to be identifiable without an A/B.

Gestures may be subtler than states. A state must commit.

**Structural fact that governs legibility:** the ears and head share a fill, so
there is no seam. The character is one light silhouette with two dark holes,
on a dark disc. It has exactly two readable landmarks — the top outline (ear
tips and the dark notch between them) and the two eye holes. Everything else
is undifferentiated mass. **If a change does not alter the top outline or the
eye holes, it does not exist.**

**Duration is the one free channel.** Amplitude is scarce; time is not.
Identical geometry at 250 ms reads as a reflex and at 1220 ms as affection.
Exploit timing hard.

## 3. Architecture

Division of labour, derived from measurement (§7):

| Concern | Mechanism | Why |
|---|---|---|
| Cursor tracking | framer-motion springs (existing) | Event-driven and self-terminating; already correct |
| Discrete gestures | **WAAPI `element.animate()`** | Zero per-frame JS; real `cancel()`; `finished` promise |
| Mode | React state → `data-mode` on the `<svg>` | Changes a few times/minute |
| Offscreen suspension | `content-visibility: auto` | One CSS line; measured to beat IntersectionObserver |
| Blink scheduling | `setTimeout`, **guarded on visibility** | See §7.2 — timers are not throttled in hidden tabs |

**No second rAF loop.** framer-motion already runs one shared batcher. If
per-frame JS is ever needed, join it via the exported `frame.update(cb, true)`.

**WAAPI replaces the CSS-transition blink.** Today `ry` animates via a CSS class
(`transition-[ry] duration-150`) while tracking runs on motion values — two
animation systems on two clocks. A CSS-driven blink cannot be cleanly aborted
mid-flight, which breaks the moment a startle needs to interrupt one. WAAPI
gives one clock and real cancellation.

### 3.1 SVG structure

```
<svg data-mode="idle">              ← CSS keyframes target THIS (a CSS box: 0 layout)
  <circle id="bg" />                ← OUTSIDE the transform group
  <g transform="rotate(...)">       ← tilt only; excludes the background
    <path ear-left /> <path ear-right />
    <circle head /> <ellipse eye-l /> <ellipse eye-r />
  </g>
</svg>
```

Two hard rules:
- **The background circle must stay outside the transform group.** If it
  transforms, it pulls away from the clip and the badge edge shows a crescent gap.
- **Extend the ear triangle bases before adding any rotation** — bases to
  y=210, outer x to −10 / 190. Entirely clipped, zero visual change, and it
  guarantees no rotation up to ±14° pulls a triangle corner into view.

Rotation pivot is **(90, 155)** — below the chin, like a neck. At (90,120) an
11° tilt moves the ear tips 2.8 CSS px; at (90,155) the same tilt moves them
5.1 px. Pivot placement doubles the read for free.

### 3.2 New primitive

**Ear apex Y** (currently hardcoded at 34). One number in the existing path
template, and the highest payoff per unit of cost in the whole design — it
unlocks the entire ear alphabet. Range 22–58.

Ear apex **X** stays as a lag channel only. At 0.67 CSS px of travel it is
sub-pixel and **can never express a state**.

## 4. The behaviour set

Ordered by impact ÷ complexity. All ship.

### 4.1 Blink cadence rework — highest value, ~2 lines

Current: `Math.random() * 3000 + 2000`. A uniform draw reads as **metronomic**,
because uniform distributions never cluster.

New: interval = `1.6s + Exponential(mean 2.8s)`, clamped to [1.6s, 9s], with
**20% of blinks doubled** (second blink 200 ms after the first reopens).
Close 70 ms ease-in · hold 40 ms · open 140 ms ease-out. Asymmetric, as real
eyelids are.

This alone is most of the difference between "animated" and "alive".

### 4.2 Ear flick — best life-per-byte

One ear, chosen at random: `apexX ± 9`, `apexY − 7`. Tip travels 2.5 CSS px.
Out 60 ms ease-out · back 140 ms with slight overshoot. Total 200 ms.

Every 5–11 s while idle-awake. Also fires as the opening frame of the startle
and the drowsy nod — it is the character's universal "something happened"
punctuation.

### 4.3 Saccadic gaze — a repair, not an addition

Continuous spring-tracked eyes are the **weakest** part of BatCat at 40 px. A
3.56 px-wide shape moving in sub-pixel increments does not read as smooth
motion; it reads as **antialiasing shimmer**, because fractional edge coverage
oscillates and the eye visibly brightens and dims.

Replace with saccades: jump to target in 110 ms, then hold. Re-target only when
the target drifts >5 units from current gaze (dead zone). Add **80–160 ms
latency** before the jump — the delay is what reads as *deciding* to look
rather than mirroring.

Head and ears keep continuous springs. Discrete eyes over continuous head is
also biologically correct — saccade plus smooth pursuit.

Gaze resolves to roughly **8 distinguishable directions**. Nothing may depend
on finer targeting.

### 4.4 Alert perk

Ears `apexY 34 → 22`, spread to 56/124; eyes `rx 8 → 10`, `ry 14 → 17`;
tracking gain → 1.0. Ear tips rise 3.8 CSS px. Onset 130 ms on
`--ease-out-soft` with the ears overshooting to `apexY 18` at t=90 ms.

The eye scale is only ~1 px of edge displacement, which should fail — it works
because dark *area* rises 52% inside 130 ms, and area change on a
high-contrast blob is detected as a transient. **Below ~+30% area this stops
working**; that is the floor for any eye-scale cue.

### 4.5 The double take

When the cursor leaves, hold the gaze on its **last known position for 800 ms**
before releasing. Five lines, and the most life-like moment in the design —
it is exactly what an animal does when something it was watching disappears.

### 4.6 Look-away

Both eyes offset `(±14, +4)` — a 3.1 CSS px paired jump — with an ear flick at
t+140 ms to sell it. Out 110 ms, hold 800 ms ±250, return 320 ms. Fast out,
slow back.

Every 12–20 s while idle-awake. This is the aloof-cat core: it breaks the
"always staring" uncanniness.

### 4.7 Curiosity head tilt

Root `rotate 0 → ±11°` about (90,155), sign following the cursor side, plus
**asymmetric ears** (raised side `apexY −8`, `apexX −3`; other side `apexY +3`)
and eyes to `rx 10, ry 16`. Onset 260 ms with slight overshoot · hold 1100 ms
±300 · return 420 ms.

**Must be ≥10°.** A 5° tilt is undetectable at this size. The tilt reads almost
entirely through the ear tips — rotating the 26-unit eye line by 11° produces
only 1.1 px of vertical differential, which is invisible. The asymmetric ear
does at least half the work.

At most once per 25 s; never twice consecutively.

### 4.8 Slow-blink — emotion from duration alone

Geometrically **identical to a blink**. Close 420 ms to `ry 2.5` with
`cy 112 → 118` · hold 280 ms · open 520 ms with a 60 ms overshoot. Total
~1220 ms. Ears relax `apexY 34 → 39`.

250 ms is a reflex; 1220 ms is a deliberate affiliative signal — a real cat
behaviour. One timing curve on parameters that already exist.

Reactive: sustained hover >1.2 s on the logo. At most once per 20 s.

### 4.9 Bored → drowsy (the floor)

**Bored**, after ~25 s of visible idle: ears `apexY 45`, spread 65/115; eyes
`ry 10`, `cy 115`; gaze parked at `(−10, +5)` with tracking off; blink interval
stretches to 7–11 s **and blinks slow** (close 110 ms, total 340 ms); ear flick
every 6–9 s. Silhouette top drops 3.1 CSS px, clearing the held-pose threshold.

**Drowsy**, after ~45 s: eyes `ry 14 → 6` **with `cy 112 → 120`** — this pins
the bottom edge and drops only the top, which is what makes it read as a
top-down eyelid (*sleepy*) rather than a symmetric squint (*suspicious*). Same
two parameters, opposite meanings. Ears `apexY 52`, spread 70/110.

**The two nodding-off beats are the whole gesture.** At t=600 ms and t=1200 ms
the lids snap back open to `ry 12` for 180 ms, then fall again on a
gravity-like ease-in. A monotonic fade reads as an opacity transition. The
*failed recoveries* are what read as a living thing losing a fight.

Drowsy is terminal. It never closes.

### 4.10 Startle — the bat reflex

Two-phase, and the two phases are the entire read:
- **0–70 ms pop:** root `ty −11`, `sy 1.05`, `sx 0.96`; eyes `rx 11, ry 20`;
  ears `apexY 26`, spread **wide** 50/130.
- **70–220 ms flatten:** root `ty +4`, `sy 0.95`, `sx 1.05`; ears **pin**
  `apexY 54`, staying wide; eyes `ry 9`, `cy 114` — narrowed, wary.
- **220–1000 ms:** recover to alert, ears lagging 180 ms behind everything else.

A single-phase jump reads as a glitch.

Triggers: cursor crossing within 80 px at >2500 px/s, or `pointerdown` within
60 px. **Never autonomous. Never on page load** — it would read as a layout bug.
**Refractory period 2500 ms**, without which a jittering cursor fires it
repeatedly and the character looks broken.

## 5. State model

Six states. `ALERT` from the original proposal is merged into the startle decay
tail — at 40 px it is not distinguishable from TRACKING or IDLE.

`STARTLED · TRACKING · CURIOUS · IDLE · BORED · DROWSY`

### 5.1 Continuous variables

Two, not three. Held in one mutable ref, updated on a **10 Hz** tick.

**`arousal`** ∈ [0,1] — first-order lag toward `max(stimulus, startleFloor)`.
`TAU_UP = 0.25 s`, `TAU_DOWN = 3.0 s`. **The asymmetry is load-bearing:** fast
to notice, slow to forget, is what animals do and is most of why this reads as
motivated rather than reactive.

**`interest`** ∈ [0,1] — an **integrator**, not a lag. Rises at 0.55/s while
`arousal > 0.35` (~1.8 s to saturate); falls at 0.12/s (~8.3 s to decay).
**This is the primary anti-twitch mechanism** — a cursor flying past on its way
to the nav raises arousal briefly and interest barely at all, so no state
change occurs.

**`energy` is cut.** Its entire observable effect was a ±3.5 s shift in the
drowsy timeout — imperceptible as intent, and it introduced a genuine bug in
its naive form (falling asleep while being actively played with reads as
broken, not tired). `T_BORED` is a flat 25 s, `T_DROWSY` a flat 45 s.

### 5.2 Stimulus

```
s_prox  = clamp01((700 - d) / (700 - 140))      // d in CSS px
s_speed = clamp01(v / 1200)
stimulus = s_prox * (0.55 + 0.45 * s_speed)     // multiplication, not addition
```

Proximity is **necessary**: a fast cursor 900 px away contributes nothing,
because distant motion is not about you. The 0.55 floor means a *parked* nearby
cursor still sustains attention, which is what makes CURIOUS reachable.

Guard: skip events with `dt < 8 ms` (dt≈0 → infinite speed → spurious startle),
and decay `v` toward 0 if no event arrives for 150 ms, or a parked cursor
retains its last speed forever.

### 5.3 Transitions

Every threshold has a **matched pair with a gap** — enter TRACKING at
`interest ≥ 0.55`, leave at `< 0.35`. No single-threshold comparison appears
anywhere. Boundary chatter is structurally impossible.

Minimum dwell per state (STARTLED 700 ms fixed, TRACKING 600, CURIOUS 1200,
IDLE 1500, BORED 2000, DROWSY 2500). Startle is priority 0 and ignores dwell
entirely.

### 5.4 Why it never looks random

1. **States set policy, not appearance.** Lid aperture, blink rate and gaze
   latency are continuous functions of `arousal`. So the transition into DROWSY
   is not a visual event — the lids have been sinking for seconds already. **The
   state change is the conclusion of something visible, never its cause.** If a
   reviewer sees a pop at a transition, this principle was violated.
2. **Nothing happens without a sustained cause** — the integrator plus minimum
   dwell means the observer always sees the cause before the effect.
3. **It looks at real things.** Idle gaze targets are resolved from actual DOM —
   the nav links (`header.tsx:85-111`), the theme toggle (`:113-127`), the page
   `<h1>` — never random coordinates. Weighted, never the same target twice
   running, preferring whichever is nearest the last known cursor position.
   Looking at something that exists reads as intent; arbitrary coordinates read
   as a random number generator even with identical statistics.
4. **Randomness is confined to three places**: blink jitter (±25%), idle dwell
   (1.8–4.0 s), and target selection among a fixed DOM-derived set. **Randomness
   never decides *whether* a state changes.** No `Math.random()` in the FSM.

## 6. Rejected — and why

This list is load-bearing; most are things one reaches for by reflex.

| Candidate | Why not |
|---|---|
| **Any mouth** — smile, frown, yawn | 5.8 px of muzzle → a 0.67 px stroke. **No yawn, ever** — faking one with eyes and scale reads as a stretch |
| Eyebrows | ~6.7 px of forehead; an angled brow degenerates to a grey smear |
| Whiskers | 1–2 unit strokes; sub-pixel by 3× |
| Pupil dilation | 0.44 px of edge displacement — invisible even side by side |
| **Breathing / idle bob** | ±0.64 px over 8 s. Slow motion needs *more* amplitude, not less. Idle life must come from **discrete gestures**, never continuous low-amplitude motion |
| **Micro-saccades** | *Actively harmful* — invisible as motion, visible as shimmer |
| Colour / blush / glow | Breaks a deliberately 2-tone mark that inverts by theme |
| Tail | Would break the clip circle and change the header's layout box |
| Cat-slit pupils | Internal detail inside a 3.56 × 6.22 px shape |
| **Ear rotation about its own apex** | **A trap** — the apex is the only visible part, the base is clipped. Rotating about it moves nothing you can see |
| Wink | "One eye closed" reads; ***which* eye is only ~60% identifiable**. Never attach meaning to the side |
| Full sleep | Owner decision 2 |
| Text, glyphs, "zzz", tooltips, `aria-live` | Turns designed into clip-art, and would sit 16 px from the author's name |

## 7. Performance

### 7.1 The measurements that decided §3

Production build, headless Chrome, matched frame counts (~1322), control
reproduced to within 0.2%:

| Driver | Script µs/frame | Layouts / 8 s |
|---|---|---|
| framer-motion today (5 springs) | 341 | 1322 |
| Same writes, hand-rolled rAF | 109 | 1322 |
| CSS keyframes on an inner `<g>` | 17 | 1322 |
| **CSS keyframes on the outer `<svg>`** | **21** | **104** |

framer-motion costs **~232 µs/frame of library tax** — SVG elements are
structurally ineligible for its accelerated path
(`AcceleratedAnimation.supports()` requires an `HTMLElement`), so every frame is
main-thread JS. And animating the **outer `<svg>`** costs zero layout while an
inner `<g>` costs 1322 — the `<svg>` is a CSS box, a `<g>` goes through Blink's
SVG layout path every frame.

Corrected assumption: path `d` writes measure **0.565 µs** versus 0.67 µs for a
transform. `d` is the *cheapest* of the three. The 8-attr vs 1-attr gap is about
touching fewer **elements**, not about `d`.

### 7.2 Three defects in the current implementation

1. **The blink scheduler runs in hidden tabs forever.** `batcat.tsx:129-135`
   uses `setTimeout`. Measured: rAF drops 165 → 1 tick/s when backgrounded, but
   `setTimeout` measured **10.3 → 10.0 — unthrottled**. Guard the scheduler on
   `visibilitychange`.
2. **The global reduced-motion block is a trap.** `globals.css:262-271` forces
   `animation-duration: 0.01ms; iteration-count: 1`, which snaps an element to
   its 100% keyframe and *holds it*. Harmless today (symmetric keyframes) but
   any asymmetric animation freezes in a broken pose. BatCat needs explicit
   `animation: none`.
3. **`clipPath id="batcat-clip"` is hardcoded** (`batcat.tsx:149`). Render twice
   and the clip breaks. Use `useId()`.

### 7.3 Additional fixes

- **`React.memo` on BatCat.** `header.tsx` re-renders on every navigation
  (`usePathname`, :32) and every theme change (:35), dragging BatCat with it and
  forcing framer to re-diff five motion elements. Props are already stable
  literals.
- **`aria-hidden="true"` and `focusable="false"` on the `<svg>`.** It is
  decorative; the accessible name is the `sr-only` sibling at `header.tsx:72`.
  **Hard rule: the character must never write to the accessibility tree.**
- **`content-visibility: auto` + `contain-intrinsic-size: 40px 40px`** on the
  wrapper. Measured: an offscreen CSS animation still ran 990 style recalcs in
  6 s; this took it to zero. One CSS line, beats an IntersectionObserver.

### 7.4 Budget — a gate, not a goal

| Metric | Limit |
|---|---|
| Main-thread work per frame | < 1 ms |
| React re-renders from continuous motion | **0** |
| New long tasks (>50 ms) | 0 |
| CPU when tab hidden or scrolled out | **0** |
| Bundle growth | < 3 kB |

Steady-state re-renders should end up **lower than today**, because the blink
`useState` is eliminated.

## 8. Reduced motion (owner decision 3)

Keep **exactly one behaviour: the blink**, at a 6–10 s cadence. Drop all
positional motion, tracking, tilt, gestures and mode changes. No listeners
registered, no tick, no FSM — nothing runs.

Rationale: blinking is presence/absence, not vestibular motion, so it does not
carry the risk the setting exists to mitigate, while the mark stays alive
rather than becoming a dead logo.

**Implementation trap:** the natural approach is to run the machine and suppress
only the visuals. That is wrong. Under reduced motion nothing should tick at
all. The current code already gets this right by returning before registering
listeners — preserve that shape.

## 9. Scope discipline

One file: `components/ui/batcat.tsx`. One constants block, one `POLICY` record,
one `evaluate()` function. Target ~300 lines.

**Do not build:** a generic FSM library, a behaviour tree, a config/tuning
schema, separate hooks per concern, an event bus, a context provider, or a
debug overlay — `data-mode` on the SVG covers inspection. **If a second file
appears, the design has failed.**

## 10. Verification

1. `pnpm build` clean; `/`, `/work`, `/projects` still `○ (Static)`.
2. React DevTools Profiler, 60 s of cursor movement over the header → **zero**
   renders attributable to cursor movement or blink.
3. DevTools Performance Monitor: **0 layouts/sec** while idle-animating;
   **0 style recalcs/sec** when scrolled out of view.
4. SVG attribute-write probe — today reports ~480/sec under cursor motion:
   ```js
   const svg = document.querySelector('header svg');
   let n = 0; const mo = new MutationObserver(r => n += r.length);
   mo.observe(svg, { attributes: true, subtree: true });
   setTimeout(() => { mo.disconnect(); console.log('writes/sec:', n / 10); }, 10000);
   ```
   Target when idle and offscreen: **0**.
5. Background the tab for 60 s → **zero** timer callbacks (verifies §7.2 #1).
6. Emulate `prefers-reduced-motion` → blink only; **zero listeners** registered
   (check the Event Listeners panel, not just the visuals).
7. Idle 50 s on the landing page → bored by ~25 s, drowsy by ~45 s with two
   visible nodding-off beats. **Nothing pops** at any transition.
8. Park the cursor on each threshold radius and jiggle → **no mode chatter**
   (watch `data-mode` in the Elements panel).
9. Scroll a blog post past the header → no BatCat scripting afterwards.

## 10a. Corrections found during implementation

Two things in this spec were wrong and were changed after measuring.

**1. Saccades are for autonomous looking, not for tracking.** §4.3 specified
saccadic gaze for cursor tracking, on the grounds that continuous sub-pixel
motion reads as antialiasing shimmer. Built that way it felt **laggy**, and the
owner said so immediately — correctly. The reasoning conflated two different eye
behaviours: real eyes use *smooth pursuit* to follow a moving target and
*saccades* only to jump to a new fixation point.

Implemented: smooth pursuit for the cursor, driven on the pointer event rather
than the 10 Hz tick (waiting for the tick added up to 100 ms of latency on its
own), with a fast critically-damped spring. Saccades are retained only for the
autonomous look targets, where the deliberate latency is the point. Measured
147 ms to 90% on a 400 px cursor jump, continuous motion every frame, no
overshoot.

**2. `content-visibility` does not suspend this.** §7.3 claimed it replaces an
IntersectionObserver, based on a measurement of *CSS* animations where the
browser skips style and layout. This animation is JavaScript writing attributes:
`content-visibility` skips rendering work, not JS execution. Measured with it in
place: **472 attribute writes/sec while scrolled out of view.**

Implemented: a real IntersectionObserver that stops the tick and detaches the
pointer listener, sharing one suspend/resume path with `visibilitychange`.
Measured after: **0 writes/sec offscreen.** The CSS property is retained for the
rendering-side saving it does provide.

**Measured result (production build):**

| Condition | writes/sec | p95 frame |
|---|---|---|
| Idle, cursor away | 58 | 6.2 ms |
| Cursor actively moving over the logo | 965 | 6.2 ms |
| Scrolled out of view | **0** | 6.2 ms |
| `prefers-reduced-motion` | **0** | — |

Frame time is identical across all conditions with zero frames over 20 ms. At
~0.6 µs per attribute write, the busiest case costs ~10 µs/frame — 0.06% of a
16 ms budget.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Reads as unprofessional to a hiring manager | Aloof temperament, no sleep, no glyphs, no silhouette breaks. Frequency caps on every autonomous gesture |
| Repetition fatigue across 5 page views in one session | Gestures are rate-limited; the visibility-gated clock means most idle behaviour never triggers on content pages |
| Peripheral-motion distraction while reading | The header is **not sticky** — it scrolls away within one viewport, and `content-visibility` stops it entirely |
| Author is the worst judge of frequency | Caps are specified here as numbers, not tuned by feel. Do not raise them because "it never fires" — you will see this 100× more than any visitor |
| Scope creep into a framework | §9 |
