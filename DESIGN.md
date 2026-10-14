# DESIGN.md

A portable design language for any app: dashboards, SaaS tools, marketing sites, portfolios, docs, mobile web. It's derived from GitPeak's visual system, but generalized so the *structure* stays fixed while the *brand values* (palette, fonts, radius) are swappable.

**How to use this file:** Sections marked **[Fixed]** are the bones. Keep them as-is across projects. Sections marked **[Swappable]** are brand decisions. Change the values, never the roles.

---

## 1. Philosophy [Fixed]

1. **Tokens over values.** Components never contain raw hex, px radii, or ad-hoc durations. They reference semantic tokens. Rebranding means editing one token file.
2. **Depth through translucency, not shadows.** Surfaces float via blur, soft borders, and a 1px ring over an ambient background. Avoid heavy drop shadows and skeuomorphism.
3. **One display voice.** A single accent typeface (serif, or any distinctive face) for the biggest headline moment. Everything else uses the body face. Don't add a second display face.
4. **Dark-first, tinted neutrals.** Base surfaces are slightly tinted (never pure `#000`/`#fff`). Light mode is supported by remapping the same tokens, not by restyling components.
5. **Motion is seasoning.** Short, physical, purposeful: entrance once, feedback on interaction. Ambient loops are limited to two at once.
6. **Large, consistent radius.** One radius family used everywhere; no sharp corners in primary UI.
7. **Accessible by default.** Contrast, focus rings, reduced-motion, and touch targets are part of the system, not an afterthought (see §12).

---

## 2. Token architecture [Fixed]

Three layers. Components only ever touch layer 3.

```
Layer 1  Primitives   --palette-violet-300: #c4a7e7        (raw values, never used in components)
Layer 2  Semantic     --iris / --base / --text ...          (roles, themeable)
Layer 3  Component    --button-bg / --card-border ...       (optional, per-component aliases)
```

For small projects, collapse to layers 1–2. Never skip straight from primitives to components.

### Naming rule
Name tokens by **role**, not by color. `--accent`, not `--purple`. The reference palette below uses Rosé Pine names (`iris`, `foam`) for continuity; in a new project you can rename to `--accent` / `--accent-2` and keep identical roles.

---

## 3. Color system

### 3.1 Roles [Fixed]

| Token | Role | Used for |
| --- | --- | --- |
| `--base` | Page background | `<body>`, app shell |
| `--surface` | Card / panel background | Cards, sidebars, before glass blur |
| `--overlay` | Elevated surface | Popovers, dropdowns, modals, menus |
| `--muted` | Lowest-emphasis | Disabled text, placeholder, decorative icons |
| `--subtle` | Secondary text | Labels, captions, meta, helper text |
| `--text` | Primary text | Body copy, headings |
| `--highlight-low` | Border / divider | Default borders, hairlines |
| `--highlight-med` | Hover / active fill | Row hover, scrollbar thumb, pressed state |
| `--highlight-high` | Strong border / selected | Selected rows, focused container border |
| `--accent` (iris) | **Primary accent** | Primary buttons, links, focus ring, caret, active nav |
| `--accent-2` (foam) | **Secondary accent** | Gradient partner to accent, decorative glows, info chips |
| `--accent-3` (rose) | Tertiary accent | Third stop in gradients only |
| `--success` (pine) | Positive status | Success, online, growth |
| `--warning` (gold) | Caution status | Warnings, pending |
| `--danger` (love) | Negative status | Errors, destructive actions, delete |

Rules:
- **Accents are not status colors.** Accent = brand/interaction. `success/warning/danger` = meaning. Never use `--danger` as decoration or `--accent` for an error.
- Status colors also appear in data-viz. Keep the same mapping in charts.
- Always pair color with another cue (icon, label, shape). Never rely on color alone.

### 3.2 Reference palette (dark) [Swappable]

```css
:root {
  --base: #191724;
  --surface: #1f1d2e;
  --overlay: #26233a;
  --muted: #6e6a86;
  --subtle: #908caa;
  --text: #e0def4;

  --highlight-low: #21202e;
  --highlight-med: #403d52;
  --highlight-high: #524f67;

  --accent: #c4a7e7;     /* iris */
  --accent-2: #9ccfd8;   /* foam */
  --accent-3: #ebbcba;   /* rose */

  --success: #31748f;    /* pine */
  --warning: #f6c177;    /* gold */
  --danger: #eb6f92;     /* love */
}
```

### 3.3 Reference palette (light) [Swappable]

Light mode remaps the **same tokens**. Components don't change.

```css
[data-theme='light'] {
  --base: #faf4ed;
  --surface: #fffaf3;
  --overlay: #f2e9e1;
  --muted: #9893a5;
  --subtle: #797593;
  --text: #575279;

  --highlight-low: #f4ede8;
  --highlight-med: #dfdad9;
  --highlight-high: #cecacd;

  --accent: #907aa9;
  --accent-2: #56949f;
  --accent-3: #d7827e;

  --success: #286983;
  --warning: #ea9d34;
  --danger: #b4637a;
}
```

### 3.4 Building your own palette [Swappable]

To rebrand: keep the **neutral ramp structure** (base → surface → overlay, highlight low → high, muted → subtle → text) and replace accents.

1. Pick a **tinted neutral hue** (violet, blue, green, warm). Base lightness ≈ 8–12% for dark, 96–98% for light, with 3–8% saturation.
2. Surfaces step up in lightness by ~3–5% each (`base` → `surface` → `overlay`).
3. Pick `--accent` with strong presence (L ≈ 65–75% in dark mode) and `--accent-2` ~60–120° around the wheel for gradients.
4. Verify contrast (see §12) before committing.

### 3.5 Translucency: always `color-mix()` [Fixed]

Never hand-write `rgba()` for a themed color.

```css
background: color-mix(in srgb, var(--accent) 15%, transparent);
border-color: color-mix(in srgb, var(--subtle) 20%, transparent);
```

Fallback for old browsers: precompute a `--accent-15` style token, but `color-mix()` is supported in all current evergreen browsers.

### 3.6 Tailwind mapping (optional) [Fixed shape]

```css
@theme {
  --color-base: var(--base);
  --color-surface: var(--surface);
  --color-overlay: var(--overlay);
  --color-muted: var(--muted);
  --color-subtle: var(--subtle);
  --color-text: var(--text);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-highlight-low: var(--highlight-low);
  --color-highlight-med: var(--highlight-med);
  --color-highlight-high: var(--highlight-high);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);

  /* shadcn-style aliases */
  --color-background: var(--base);
  --color-foreground: var(--text);
  --color-primary: var(--accent);
  --color-primary-foreground: var(--base);
  --color-border: var(--highlight-low);
  --color-muted-foreground: var(--subtle);
  --color-destructive: var(--danger);
}
```

For non-Tailwind stacks (CSS Modules, styled-components, vanilla), use the CSS variables directly; the roles are identical.

---

## 4. Typography

### 4.1 Font roles [Fixed roles, Swappable faces]

| Role | Reference face | Job |
| --- | --- | --- |
| **Body** | `DM Mono` (fallback `JetBrains Mono`, `monospace`) | Paragraphs, labels, buttons, nav, tables |
| **Display** | `Instrument Serif` (italic-capable) | The one big headline per page/screen |
| **Code** | `JetBrains Mono` | Code blocks, inline code, IDs, hashes |

```css
:root {
  --font-body: 'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-code: 'JetBrains Mono', ui-monospace, monospace;
}
body { font-family: var(--font-body); }
```

**Adapting the body face.** The mono body gives a dev-tool voice. For apps targeting a general audience, swap `--font-body` to a clean sans (Inter, Geist, DM Sans) and keep the display serif + mono for code/meta. The rest of the system doesn't change. Rule: **if you change the body face, keep mono for numbers, IDs, and micro-labels** to preserve the technical texture.

Loading:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@300;400;500&display=swap" />
```

Use `font-display: swap` and self-host for production when possible.

### 4.2 Type scale [Fixed]

| Token | Size | Use |
| --- | --- | --- |
| `--text-micro` | 10px | Badges, counts, chart ticks |
| `--text-xs` | 12px | Meta, captions, helper text |
| `--text-sm` | 14px | Default UI text, buttons, table cells |
| `--text-base` | 16px | Long-form body, inputs (prevents iOS zoom) |
| `--text-lg` | 18–20px | Card titles, lead paragraphs |
| `--text-2xl` | 24–28px | Section titles (display face) |
| `--text-4xl` | 40–48px | Page titles |
| `--text-hero` | 56–72px | Hero headline (display face, once per page) |

Line height: `1` for hero, `1.2` for headings, `1.5–1.6` for body.
Tracking: hero `-0.02em`; body `0`; uppercase labels `+0.15em` to `+0.2em`.

### 4.3 The signature header pattern [Fixed]

Eyebrow → display headline → subhead. Use for page titles, empty states, onboarding, section intros.

```html
<header class="page-header">
  <span class="eyebrow">section label</span>
  <h1 class="display"><span class="gradient-text">Product Name</span></h1>
  <p class="subhead">one-line description of what this is</p>
</header>
```

```css
.eyebrow {
  font: 400 0.7rem/1 var(--font-body);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--subtle);
}
.display {
  font: 400 clamp(2.5rem, 6vw + 1rem, 4.5rem)/1 var(--font-display);
  letter-spacing: -0.02em;
}
.subhead {
  font: 400 0.75rem/1.5 var(--font-body);
  letter-spacing: 0.05em;
  color: var(--subtle);
  margin-top: 0.25rem;
}
```

Scale it down for inner pages: eyebrow stays the same, display drops to `--text-2xl`/`--text-4xl`, subhead is optional.

### 4.4 Gradient text [Fixed]

```css
.gradient-text {
  color: var(--accent); /* fallback */
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Use on **one** element per screen. Gradient text on body copy or multiple headings kills the effect.

---

## 5. Spacing, radius, elevation

### 5.1 Spacing scale [Fixed]

4px base unit. Use only these steps: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`.

```css
:root {
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;
  --space-20: 80px; --space-24: 96px;
}
```

Responsive page padding: `40px` (mobile) → `64px` (sm) → `80px` (md+). Section gap: `32px` → `48px`. Inside cards: `24px`. Inside dense controls: `8–12px`.

### 5.2 Radius [Swappable value, Fixed usage]

```css
:root {
  --radius-sm: 8px;    /* badges, small chips */
  --radius-md: 12px;   /* inputs, inline controls */
  --radius-lg: 16px;   /* search bars, popovers */
  --radius-xl: 32px;   /* cards, buttons (the "4xl" look) */
  --radius-full: 9999px;
}
```

Rule: **nested radius = outer radius − padding.** A card at `32px` with `8px` padding holds children at `24px`.
Tone dial: set `--radius-xl` to `12px` for a more utilitarian/enterprise feel; the system still holds.

### 5.3 Elevation [Fixed]

Three levels, built from ring + blur + soft shadow:

| Level | Recipe | Use |
| --- | --- | --- |
| 0 | none | Page content |
| 1 | `box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 5%, transparent), 0 4px 6px -1px rgb(0 0 0 / .2)` | Cards, panels |
| 2 | `.glass` (below) | Floating: search, toasts, sticky headers |
| 3 | `.glass` + stronger shadow `0 32px 64px -16px rgb(0 0 0 / .45)` | Modals, command palette |

### 5.4 Glass surface [Fixed]

```css
.glass {
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid color-mix(in srgb, var(--subtle) 15%, transparent);
  box-shadow:
    0 1px 0 0 color-mix(in srgb, var(--text) 6%, transparent) inset,
    0 32px 64px -16px rgb(0 0 0 / 0.45);
}
```

Glass only reads well over a non-flat background (the aurora in §6, an image, or a gradient). On a flat background, use a solid `--surface` with the level-1 ring. Always provide a solid fallback for browsers without `backdrop-filter`:

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--surface); }
}
```

### 5.5 Decorative color blobs [Fixed]

Soft radial glows inside cards add color without noise:

```html
<div aria-hidden="true" class="blob"></div>
```
```css
.blob {
  position: absolute; top: -48px; left: -48px;
  width: 176px; height: 176px; border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  filter: blur(64px);
  pointer-events: none;
}
```
Parent needs `position: relative; overflow: hidden`; content wrapper needs `position: relative` so it sits above the blob. One blob per card, max two.

---

## 6. Atmosphere: the aurora background [Fixed]

Two slow, blurred radial gradients drifting behind everything. Place once at the app root.

```html
<div class="aurora-bg" aria-hidden="true"></div>
```
```css
.aurora-bg {
  position: fixed; inset: 0; z-index: -10;
  background-color: var(--base);
  overflow: hidden;
}
.aurora-bg::before,
.aurora-bg::after {
  content: ''; position: absolute; border-radius: 50%;
  filter: blur(120px);
  animation: drift 25s ease-in-out infinite;
}
.aurora-bg::before {
  width: 70vw; height: 70vw; top: -20%; left: -10%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%);
  animation-duration: 20s;
}
.aurora-bg::after {
  width: 60vw; height: 60vw; bottom: -15%; right: -10%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-2) 10%, transparent) 0%, transparent 70%);
  animation-duration: 28s;
  animation-direction: reverse;
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(40px, -60px) scale(1.08); }
  66%      { transform: translate(-30px, 40px) scale(0.95); }
}
```

Intensity dial: raise the `12%` / `10%` mix values for marketing pages; lower to `6–8%` for data-dense dashboards so charts stay readable.
Performance: on low-power devices or `prefers-reduced-motion`, drop the animation and keep the static gradients.

**Alternatives when aurora doesn't fit** (e.g., a document-heavy app): a single static radial gradient at one corner, or a subtle noise/grid texture at 3–5% opacity. Keep the same glass surfaces on top.

---

## 7. Motion

### 7.1 Principles [Fixed]

- **Two categories only:** entrance and interaction feedback. Plus two permitted ambient loops (aurora drift, loading shimmer/pulse).
- Animate only `transform`, `opacity`, `filter`, `clip-path`. Never layout properties (`width`, `height`, `top`, `margin`).
- Motion should communicate (something appeared, something is pressable, something is loading). If it communicates nothing, remove it.

### 7.2 Tokens [Fixed]

```css
:root {
  --dur-fast: 150ms;     /* hover, press, color change */
  --dur-base: 250ms;     /* lift, toggles, popovers */
  --dur-slow: 350ms;     /* modals, drawers, page transitions */
  --dur-enter: 500ms;    /* entrance fade-up */
  --ease-snappy: cubic-bezier(0.25, 1, 0.5, 1);  /* hover/press/overlays */
  --ease-ambient: ease-in-out;                    /* loops only */
  --stagger: 80ms;                                /* entrance stagger step */
}
```

### 7.3 Patterns [Fixed]

**Entrance**
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp var(--dur-enter) ease both; }
/* stagger: style="animation-delay: calc(var(--stagger) * N)" */
```
Cap stagger at ~6 items; beyond that, animate the group as one.

**Hover lift / press dip**
```css
.lift { transition: transform var(--dur-base) var(--ease-snappy); }
.lift:hover  { transform: translateY(-2.5px); }
.lift:active { transform: translateY(1px) scale(0.98); }
```

**Loading shimmer**
```css
.shimmer { position: relative; overflow: hidden; }
.shimmer::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%,
    color-mix(in srgb, var(--accent) 11%, transparent) 40%,
    color-mix(in srgb, var(--text) 15%, transparent) 50%,
    color-mix(in srgb, var(--accent) 11%, transparent) 60%,
    transparent 100%);
  transform: translateX(-100%);
  animation: shimmer 2s ease-in-out infinite;
}
@keyframes shimmer { to { transform: translateX(100%); } }
```

**Overlays (modal / popover / drawer)**: fade + 8–12px translate, `--dur-slow`, `--ease-snappy`. Exit is faster than enter (~70% of duration).

### 7.4 Reduced motion [Fixed, required]

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .aurora-bg::before, .aurora-bg::after { animation: none; }
}
```

---

## 8. Layout

- **Max content width:** `1200px` for apps and dashboards, `720px` for reading/long-form, `1440px` for marketing. Center with `margin-inline: auto`.
- **Grid:** 12-column on desktop, 4 on mobile, `24px` gutter (`16px` mobile).
- **Breakpoints:** `640` (sm), `768` (md), `1024` (lg), `1280` (xl). Design mobile-first.
- **App shell:** sidebar (`240–280px`, glass or solid `--surface`) + top bar (glass, sticky) + content on the aurora. Collapse sidebar to a drawer below `lg`.
- **Density modes:** comfortable (default: `--space-4` row padding) and compact (`--space-2`). Implement as a single `data-density` attribute that remaps spacing tokens, not per-component overrides.
- **Z-index scale:** `-10` background · `0` content · `10` sticky · `20` dropdown · `30` modal · `40` toast · `50` tooltip.

---

## 9. Components

Each component lists **anatomy, tokens, states**. All interactive components must implement: default, hover, active/pressed, focus-visible, disabled, and (where relevant) loading and error.

### 9.1 Button

Base: `radius-xl`, `text-sm`, weight 500, icon-aware padding, press feedback, disabled at `opacity: .5` + `pointer-events: none`.

| Variant | Style | Use |
| --- | --- | --- |
| `primary` | `bg: --accent`, `color: --base`, hover `accent @ 80%` | One per view |
| `gradient` | Tinted wash: `linear-gradient(135deg, accent 20%, accent-2 15%)`, `border: accent @ 25%`, text `--accent`, uppercase, wide tracking | Hero CTA |
| `secondary` | `bg: --highlight-low`, hover `--highlight-med` | Supporting actions |
| `outline` | `border: --highlight-med`, transparent bg, hover `--highlight-low` | Tertiary |
| `ghost` | Transparent, hover `--highlight-med` | Toolbars, icon buttons |
| `link` | `color: --accent`, underline on hover, `offset: 4px` | Inline |
| `danger` | `bg: --danger @ 15%`, `color: --danger`, border `--danger @ 30%` | Destructive |

Sizes: `xs 24px · sm 32px · md 36px · lg 40px`. Icon-only buttons are square at the same sizes. Minimum touch target 44×44px on touch devices (pad the hit area if the visual is smaller).

Loading: replace the label with a spinner of the same width (avoid layout shift), set `aria-busy="true"`.

### 9.2 Card

```css
.card {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: var(--space-6);
  padding-block: var(--space-6);
  border-radius: var(--radius-xl);
  background: var(--surface);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--text) 8%, transparent),
              0 4px 6px -1px rgb(0 0 0 / .2);
  font-size: var(--text-sm);
}
.card.glass { background: color-mix(in srgb, var(--surface) 60%, transparent); }
```
Anatomy: header (eyebrow/title/action) · content · footer (optional). Interactive cards get `.lift` and a focus ring on the whole card.

### 9.3 Input / Field

Two patterns:

**A. Embedded (search bars, command inputs):** transparent, borderless input living inside a `.glass` wrapper that owns the border/focus state.
```css
.input-embedded {
  flex: 1; border: 0; background: transparent; outline: none;
  padding: 12px 8px; font: 400 var(--text-base) var(--font-body);
  caret-color: var(--accent);
}
.input-embedded::placeholder { opacity: .3; }
.glass:focus-within { border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
```

**B. Standalone (forms):** `bg: --highlight-low`, `border: 1px solid --highlight-med`, `radius-md`, `height 40px`, `padding 0 12px`. Focus: border `--accent` + focus ring.

Always: visible `<label>` (eyebrow style OK), helper text in `--subtle`, error text in `--danger` with an icon and `aria-describedby`. Inputs are `16px` minimum to prevent mobile zoom. `caret-color: var(--accent)` everywhere.

### 9.4 Badge / chip / tag

Tinted, not solid:
```css
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 8px; border-radius: var(--radius-sm);
  font: 400 var(--text-micro)/1 var(--font-body);
  background: color-mix(in srgb, var(--tone, var(--accent-2)) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--tone, var(--accent-2)) 20%, transparent);
  color: var(--tone, var(--accent-2));
}
/* usage: style="--tone: var(--success)" */
```
Status badges set `--tone` to `success/warning/danger` and include an icon or dot.

### 9.5 Navigation

- **Top bar:** glass, sticky, `56–64px`, logo left, actions right. Active link: `--accent` text + 2px underline or tinted pill.
- **Sidebar:** items `36–40px`, `radius-lg`, icon + label. Active: `bg: accent @ 12%`, text `--accent`. Hover: `--highlight-med @ 50%`.
- **Tabs:** underline style (2px `--accent` indicator, animated with `transform`) or segmented pill inside a `--highlight-low` track.
- **Breadcrumbs:** `text-xs`, `--subtle`, separator `/` in `--muted`, current page in `--text`.
- **Mobile:** bottom tab bar (glass, 5 items max) or a drawer.

### 9.6 Modal / dialog / drawer

Level-3 glass on a scrim: `background: color-mix(in srgb, var(--base) 60%, transparent)` + `backdrop-filter: blur(4px)`. Radius `--radius-xl`. Max width `480px` (confirm), `640px` (form), full-height drawer `420px` from the right. Trap focus, close on `Esc`, return focus to the trigger, lock body scroll.

### 9.7 Popover / dropdown / tooltip

`--overlay` background (solid or glass), `radius-lg`, 1px ring, level-2 shadow. Menu items 32–36px, hover `--highlight-med`. Tooltips: `text-xs`, delay 300ms, never contain interactive content.

### 9.8 Table / data list

No heavy grid lines. Header row: eyebrow style (`uppercase`, `--subtle`, `0.15em` tracking). Rows separated by `--highlight-low` hairlines; hover `--highlight-med @ 40%`; selected `accent @ 8%` with a 2px left accent bar. Numbers right-aligned in the code/mono face with tabular figures (`font-variant-numeric: tabular-nums`). Sticky header on a glass background.

### 9.9 Toast / notification

Level-2 glass, `radius-lg`, bottom-right (top-center on mobile), 4–6s auto-dismiss (persist errors), icon + message + optional action, tinted left bar for status. Announce via `role="status"` (or `role="alert"` for errors).

### 9.10 Empty, loading, error states

- **Loading:** skeletons with `.shimmer` matching final layout; spinner only for button/inline actions. Show skeleton after ~200ms to avoid flash.
- **Empty:** the eyebrow → display → subhead pattern at a smaller scale + one primary action + a faint decorative blob.
- **Error:** `--danger` tinted card, plain-language message, retry action. Never show raw stack traces.

### 9.11 Charts / data-viz

Series colors in order: `--accent`, `--accent-2`, `--accent-3`, then `--success`, `--warning`, `--danger` reserved for their meaning. Gridlines `--highlight-low`; axis text `--subtle` at `text-micro` in the code face. Fills use `color-mix()` at 15–25% under strokes. Tooltips are glass. Never rely on color alone: add direct labels or patterns.

### 9.12 Scrollbars

```css
* { scrollbar-width: thin; scrollbar-color: var(--highlight-med) transparent; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: var(--highlight-med); border-radius: 99px; }
```

---

## 10. Iconography [Fixed]

- **Library:** [Lucide](https://lucide.dev) (thin-stroke, geometric, pairs with mono type). One icon library per project, no mixing.
- **Stroke:** `1.5–2px`, consistent. **Sizes:** `12 / 14 / 16 / 20 / 24`. Icons next to text should be slightly *smaller* than the text's cap height equivalent (e.g. 13–14px beside 14px text), not larger.
- Decorative icons: `aria-hidden="true"`. Icon-only buttons need `aria-label`.
- Color: inherit `currentColor`; tint with tokens, never hard-coded.

---

## 11. Imagery & illustration

- Avatars/thumbnails: `radius-lg` or `full`, 1px ring (`--highlight-med`), no heavy borders.
- Photos get a soft overlay gradient (`--base` → transparent) when text sits on top.
- Illustrations: flat, limited to palette tokens, 1.5px strokes to match icons. Avoid stock 3D/clipart styles.
- Empty-state and hero visuals can use the blob + aurora treatment instead of illustration.

---

## 12. Accessibility [Fixed, required]

- **Contrast:** body text ≥ 4.5:1 against its surface, large text and UI components ≥ 3:1. Check `--subtle` and `--muted` on `--surface` *and* on glass over the aurora. `--muted` is for non-essential text only.
- **Focus:** every interactive element has a visible `:focus-visible` ring:
  ```css
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: inherit; }
  ```
  Never `outline: none` without a replacement.
- **Targets:** ≥ 44×44px touch, ≥ 24×24px pointer.
- **Motion:** honor `prefers-reduced-motion` (§7.4). No auto-playing motion that can't be paused beyond the two ambient loops.
- **Transparency:** honor `prefers-reduced-transparency` / `prefers-contrast: more` by switching glass to solid `--surface` and strengthening borders.
  ```css
  @media (prefers-contrast: more), (prefers-reduced-transparency: reduce) {
    .glass { background: var(--surface); backdrop-filter: none; border-color: var(--highlight-high); }
  }
  ```
- **Semantics:** real `<button>`, `<a>`, `<label>`, landmarks, heading order. Don't convey state by color alone.
- **Gradient text:** keep a solid `color` fallback and ensure the lightest gradient stop still meets 3:1 for large text.

---

## 13. Theming & customization

**Theme switching** (optional): set `data-theme="light|dark"` on `<html>`, remap the §3 tokens, persist the choice, and default to `prefers-color-scheme`. Avoid a flash by setting the attribute in an inline script in `<head>`.

**Multiple brand themes:** because components only use roles, a theme is just a token block:
```css
[data-theme='ocean'] { --base:#0b1620; --surface:#10212e; --accent:#5ec4ff; --accent-2:#7af0d4; /* ... */ }
```

**Customization dials** (adjust these first when adapting to a new product):

| Dial | Low-key / enterprise | Default | Expressive / consumer |
| --- | --- | --- | --- |
| `--radius-xl` | 8–12px | 32px | 32–40px |
| Aurora intensity | off / 6% | 10–12% | 18–25% |
| Glass blur | none (solid) | 20px | 28px |
| Display face usage | headings only | hero only | hero + section titles |
| Motion durations | ×0.8 | ×1 | ×1.2 |
| Gradient text | none | hero | hero + accents |

---

## 14. Adapting to app types

| App type | Emphasis | Adjustments |
| --- | --- | --- |
| **Dashboard / analytics** | Density, legibility | Aurora at 6–8%, compact density, solid surfaces for tables, glass only for floating UI, tabular mono numbers, sans body face optional |
| **SaaS product / admin** | Clarity, speed | Smaller radius (12–16px), one primary button per view, sidebar shell, restrained gradients |
| **Marketing / landing** | Impact | Full eyebrow→display→subhead hero, strong aurora, gradient CTA, large spacing (`96px` section gaps), staggered entrances |
| **Portfolio / personal** | Personality | Serif display used more, project cards with blobs, hover lifts, minimal nav |
| **Docs / content** | Readability | `720px` measure, body `16px` / 1.6, solid surfaces, glass only on nav, code face for blocks, no ambient loops |
| **Mobile web / PWA** | Touch | 44px targets, bottom tab bar, drawers instead of popovers, reduce blur radius to `12px` for performance |
| **E-commerce** | Trust, conversion | Solid cards for product grids, status tokens for stock/price changes, restrained motion near checkout |

---

## 15. Implementation checklist

1. Add the fonts and define the §3 tokens (dark + light blocks).
2. Add base CSS: `body` bg/color/font, `::selection`, scrollbars, `:focus-visible`, reduced-motion block.
3. Add the `.aurora-bg` element once at the app root (or the chosen alternative).
4. Create `.glass`, `.gradient-text`, `.fade-in-up`, `.lift`, `.shimmer` utilities.
5. Build primitives in this order: Button → Card → Input → Badge → Nav → Modal/Popover → Table → Toast.
6. Verify: contrast pass in both themes, keyboard-only walkthrough, reduced-motion on, 320px and 1440px widths, glass fallback with `backdrop-filter` disabled.

---

## 16. Do / Don't

**Do**
- Reference tokens, never raw values; use `color-mix()` for every translucent tint.
- Keep the eyebrow → display → subhead rhythm for titles.
- Use one primary button, one gradient-text element, and one display headline per view.
- Keep radius, spacing, and durations on their scales.
- Pair every status color with an icon or label.
- Let aurora + glass provide depth; use the 1px ring for definition.
- Test with reduced motion, high contrast, and a keyboard.

**Don't**
- Don't introduce a second display face or mix icon libraries.
- Don't use pure black/white, or neutrals with no tint.
- Don't use accents (`--accent`, `--accent-2`) to mean success/error.
- Don't stack heavy drop shadows or skeuomorphic bevels.
- Don't run more than the two ambient loops (aurora drift, shimmer/pulse) at once.
- Don't animate layout properties or use linear easing for interaction.
- Don't put glass on a flat background, or put long-form text on glass over a busy backdrop.
- Don't use `--muted` for text that carries meaning.
- Don't hardcode hex values in components.
