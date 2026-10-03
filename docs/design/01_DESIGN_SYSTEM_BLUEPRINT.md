# StudySpace — Design System Blueprint v1: Quiet Academic / Technical Productivity

> **Document Status**: Locked Specification  
> **Audience**: Design Engineers, Frontend Engineers, Mobile Engineers, AI Coding Agents  
> **Brand Vision**: Editorial hierarchy + technical precision + soft purple identity + high information density + controlled whitespace + subtle motion + native mobile ergonomics.

---

## 1. Brand Identity & Preservation Core

StudySpace is an academic workspace built for university students and lifelong learners. We are **redesigning the product interface**, not rebranding StudySpace.

### 1.1 Non-Negotiable Brand Assets
- **StudySpace Logo & Symbol Mark**: The official purple gradient "S" monogram (`/branding/studyspace-mark.png`) and lockup (`StudySpaceLogo.tsx`) are preserved.
- **Brand Purple Identity**: Purple is our anchor identity, evoking focus, intellectual clarity, and calmness.
- **Atmospheric Obsidian Dark Theme**: Deep obsidian black (`#090D16`) with subtle ambient violet/indigo tinting.
- **Crisp Editorial Light Theme**: Crisp porcelain white and slate (`#F8FAFC`, `#FFFFFF`) with sharp typographic contrast.

---

## 2. Color Token Architecture

Rather than arbitrary hex codes scattered across CSS, StudySpace uses an 11-step brand purple scale paired with strict semantic aliases and WCAG AA-compliant status tokens.

### 2.1 The StudySpace Purple Palette (`study`)
```css
@theme {
  --color-study-50:  #fbf8ff;
  --color-study-100: #f4ecff;
  --color-study-200: #e9d8fd;
  --color-study-300: #d6b4fc;
  --color-study-400: #bb82f7;
  --color-study-500: #9f52f1;  /* Vibrant Accent */
  --color-study-600: #7c3aed;  /* Primary Brand Purple */
  --color-study-700: #6d28d9;  /* Deep Brand Purple */
  --color-study-800: #5b21b6;
  --color-study-900: #4c1d95;  /* Deep Purple Dark Tone */
  --color-study-950: #2e1065;
}
```

### 2.2 Semantic Surface & Text Tokens
Every UI element references semantic tokens, ensuring flawless automatic switching between Light and Dark modes.

| Semantic Token | Light Mode Value | Dark Mode Value | Purpose & Architectural Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#f8fafc` (Slate 50) | `#090d16` (Obsidian Dark) | The fundamental background of the viewport. |
| `--surface` | `#ffffff` (Pure White) | `#111726` (Navy Obsidian) | Main content containers, sheets, and sidebar. |
| `--surface-raised`| `#f1f5f9` (Slate 100) | `#1a2234` (Elevated Slate) | Hover states, active list rows, chips, and sub-panels. |
| `--border-subtle` | `#e2e8f0` (Slate 200) | `#1e293b` (Slate 800) | Standard container boundaries and hairline dividers. |
| `--border-strong` | `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | Active card borders, inputs, and tab dividers. |
| `--text-primary`  | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Primary headings, titles, and high-emphasis data. |
| `--text-secondary`| `#475569` (Slate 600) | `#cbd5e1` (Slate 300) | Body text, class times, faculty names, descriptions. |
| `--text-muted`    | `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | Captions, subtle metadata, timestamps, shortcuts. |
| `--accent`        | `#7c3aed` (Study 600) | `#8b5cf6` (Study 500) | Primary CTA buttons, active nav indicators, links. |
| `--accent-hover`  | `#6d28d9` (Study 700) | `#a78bfa` (Study 400) | Hover state for interactive primary actions. |
| `--accent-muted`  | `#f4ecff` (Study 100) | `#2e1065` (Study 950) | Active navigation pill background, selected chips. |

### 2.3 Semantic Status & Risk Tokens (WCAG AA Compliant)
Status colors communicate academic reality (attendance thresholds, task priorities, sync states) and **must never be overridden with brand purple**.

| Status Domain | State / Value | Light Background | Light Foreground | Dark Background | Dark Foreground | Meaning & Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Attendance Safe** | `SAFE` / `Present` | `#ecfdf5` | `#047857` (Emerald 700) | `#064e3b` | `#a7f3d0` (Emerald 200) | Attendance $\ge \text{Target}$ with $\ge 2$ bunks remaining; class marked present. |
| **Attendance Warning** | `WARNING` / `Upcoming` | `#fffbeb` | `#92400e` (Amber 800) | `#78350f` | `#fde68a` (Amber 200) | Attendance $\ge \text{Target}$ but $\le 1$ bunk remaining (danger zone); class upcoming. |
| **Attendance Critical** | `CRITICAL` / `Absent` | `#fef2f2` | `#991b1b` (Red 800) | `#7f1d1d` | `#fecaca` (Red 200) | Attendance $< \text{Target}$ requiring mandatory recovery; class marked absent. |
| **Neutral / Cancelled** | `Cancelled` / `Exempt` | `#f1f5f9` | `#475569` (Slate 600) | `#1e293b` | `#94a3b8` (Slate 400) | Class cancelled by faculty or rescheduled; timetable exception. |
| **Info / Scheduled** | `Info` / `Notice` | `#eff6ff` | `#1d4ed8` (Blue 700) | `#1e3a8a` | `#bfdbfe` (Blue 200) | Informational digest, timetable updates, system notices. |

---

## 3. Surface & Elevation Grammar

To combat the "card-inside-card" AI slop syndrome, StudySpace enforces a strict 3-tier surface model:
1. **Canvas (`--canvas`)**: The viewport background. Never has a border or shadow.
2. **Surface (`--surface`)**: Primary content containers, such as the sidebar, header, timetable day column, or hero banner.
3. **Raised (`--surface-raised`)**: Elevated sub-elements embedded within a surface, such as an interactive class row, an input field, or an active badge.

```
┌────────────────────────────────────────────────────────────┐
│ CANVAS (--canvas)                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SURFACE (--surface, border-subtle)                   │  │
│  │   ┌──────────────────────────────────────────────┐   │  │
│  │   │ RAISED ELEMENT (--surface-raised, no border) │   │  │
│  │   │ 08:30  SE Lab  CT-09              [Present]  │   │  │
│  │   └──────────────────────────────────────────────┘   │  │
│  │   ┌──────────────────────────────────────────────┐   │  │
│  │   │ RAISED ELEMENT (--surface-raised, no border) │   │  │
│  │   │ 09:30  AEM     LT-02             [Upcoming]  │   │  │
│  │   └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **No Nested Border Rule**: A container with a border must never contain child elements that also have prominent borders. Internal items are separated by clean whitespace, subtle background shifts (`--surface-raised`), or hairline dividers (`divide-y divide-border-subtle`).

---

## 4. Geometry: Radii, Spacing & Borders

### 4.1 Border Radius Scale
Arbitrary rounding (e.g., `rounded-[24px]`, `rounded-[32px]`) is prohibited. StudySpace uses 4 disciplined radius tokens:
- `sm` (`6px`): Small badges, status dots, tooltips, and tags.
- `md` (`10px`): Form inputs, dropdown menus, action buttons, table rows.
- `lg` (`16px`): Major surface containers, modals, bottom sheets, hero cards.
- `full` (`9999px`): Circular avatars, icon buttons, progress rings, pill toggles.

### 4.2 Spacing Scale (4px / 8px Baseline Grid)
- `2xs` (`4px`) | `xs` (`8px`) | `sm` (`12px`) | `md` (`16px`) | `lg` (`24px`) | `xl` (`32px`) | `2xl` (`48px`).

### 4.3 Border & Shadow Scale
- **Borders**:
  - `subtle`: `1px solid var(--border-subtle)` (standard layout boundaries).
  - `strong`: `1px solid var(--border-strong)` (focused inputs, active items).
  - `focus`: `2px solid var(--accent)` with `2px offset` (accessible keyboard navigation).
- **Shadows**:
  - `none`: Default for 95% of components. Borders provide clean structural definition.
  - `soft`: `0 4px 20px -2px rgba(0, 0, 0, 0.05)` (floating popovers, dropdown menus).
  - `elevated`: `0 10px 30px -4px rgba(0, 0, 0, 0.25)` (modals, bottom sheets, command palette).

---

## 5. Typography System

Typography provides hierarchy and editorial authority without relying on heavy boxes.

### 5.1 Typefaces
- **Primary Interface**: `Plus Jakarta Sans` (fallback: `Inter`, system sans-serif) for high legibility, clean geometric shapes, and a friendly yet serious academic demeanor.
- **Data & Tabular**: `JetBrains Mono` with tabular numbers (`font-variant-numeric: tabular-nums`) for timetables, clock times, percentages, bunk allowances, and code notes.

### 5.2 Type Scale
| Role | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `32px` (2rem) | `800` (Bold) | `1.15` | `-0.025em` | Hero welcome greetings, key milestone numbers. |
| **H1** | `24px` (1.5rem) | `700` (Bold) | `1.2` | `-0.02em` | Page titles (Attendance Tracker, Timetable). |
| **H2** | `18px` (1.125rem)| `600` (SemiBold) | `1.3` | `-0.015em` | Section headers (Today's Schedule, Study Activity). |
| **H3** | `15px` (0.9375rem)| `600` (SemiBold) | `1.4` | `-0.01em` | Card titles, course names, modal headers. |
| **Body** | `14px` (0.875rem)| `400` (Regular) | `1.5` | `0` | Standard text, descriptions, task titles. |
| **Body Small** | `13px` (0.8125rem)| `400` / `500` | `1.4` | `0` | Class metadata, room names, secondary notes. |
| **Caption** | `11px` (0.6875rem)| `500` (Medium) | `1.3` | `+0.02em` | Status tags, uppercase labels, chart legends. |
| **Numeric/Data**| `14px` / `20px` | `600` (Mono) | `1.0` | `0` | Percentages (`84.7%`), class times (`08:30 - 09:30`), counters. |

---

## 6. Motion & Animation Rules

Animation must remain subtle, intentional, and performance-conscious.

### 6.1 Motion Durations & Easings
- **Instant (`0ms`)**: Toggle states, tab switches when virtualized.
- **Quick (`150ms`, `ease-out`)**: Hover states, button press scaling (`scale(0.98)`), checkbox marks.
- **Standard (`250ms`, `cubic-bezier(0.16, 1, 0.3, 1)`)**: Modal open/close, drawer slide-over, accordion expand.
- **Emphasis (`350ms`, `cubic-bezier(0.34, 1.56, 0.64, 1)`)**: Milestone unlock celebration, Pomodoro completion ring.

### 6.2 The Stack Decision: No Experimental View Transitions
As confirmed in our architectural stack review:
- Next.js documentation explicitly flags `viewTransition` as experimental and not production-ready.
- **Web Motion Stack**: Standard Next.js client-side navigation + CSS transitions + Motion (`motion/react`) for localized micro-interactions.
- **Flutter Motion Stack**: Native Flutter `Hero` animations, explicit implicit animation widgets (`AnimatedContainer`, `AnimatedOpacity`), and `flutter_animate` for sequenced reveals.
- **Reduced Motion**: Strict adherence to `prefers-reduced-motion: reduce`. All duration tokens collapse to `0.01ms`.

---

## 7. Operational Design Rules & Contracts

### Rule 1: The Gradient Budget (Max 1 Per Viewport)
A maximum of **one primary gradient region** is allowed per viewport.
- **Permitted**: The Hero Welcome banner, OR the Next Class action card, OR the Active Pomodoro ring.
- **Strictly Prohibited**: Gradient header + gradient button + gradient icon + gradient card + gradient background all visible at once.

### Rule 2: Unified Lucide Iconography
- All icons across Web and Mobile must originate from the **Lucide** icon family.
- Icon stroke width: `2px` for 16px/20px icons; `1.5px` for 24px+ icons.
- Emojis are strictly banned from UI chrome, buttons, tabs, and status indicators.

### Rule 3: Skeletons Over Spinners
- Never display full-page blank screens with spinning loaders.
- Use structured skeleton layouts reflecting the actual geometry of the loading content (`Skeletonizer` on Flutter, structural CSS skeleton blocks on Web).

### Rule 4: Empty States with Brand Geometry
- Empty states must use the StudySpace brand geometry (the subtle purple "S" monogram or geometric wireframe) rather than generic third-party vector illustrations of sad characters.

### Rule 5: Voice & Content Rules (No Marketing Fluff)
| Prohibited AI / Marketing Fluff | Required StudySpace Direct Student Voice |
| :--- | :--- |
| "Unlock your academic potential with smart AI" | "You're on track. Two classes left today." |
| "Seamless timetable and learning experience" | "Schedule synchronized across devices." |
| "Supercharge your daily focus sessions" | "45 minutes studied today. Goal: 2h." |
| "Stay ahead of your attendance curve" | "Attendance is 3 classes below target. Attend next 2 classes to recover." |

---

## 8. AI Agent UI Contract: The Non-Negotiable Rules

Any engineer or AI agent implementing screens in StudySpace must obey this checklist:

```markdown
### DO NOT:
- DO NOT introduce arbitrary border radii (use only sm=6px, md=10px, lg=16px, full).
- DO NOT invent new hex colors or utility color classes outside the design-system tokens.
- DO NOT use emojis as UI icons or status badges.
- DO NOT add gradients without explicit budget justification.
- DO NOT create card-inside-card bordered layouts.
- DO NOT add floating neon glow effects or heavy dropped shadows.
- DO NOT duplicate attendance mathematical calculations in UI components.
- DO NOT mix icon families (Lucide only).

### ALWAYS:
- ALWAYS use semantic tokens for surfaces, text, and status colors.
- ALWAYS maintain one clear hero element per screen.
- ALWAYS format numbers and clock times with tabular monospace styling.
- ALWAYS provide loading skeletons, empty states, and error states.
- ALWAYS test layouts down to 320px width and verify zero horizontal overflow.
- ALWAYS respect prefers-reduced-motion.
- ALWAYS use direct, factual student copy.
```
