# Design System Strategy: The Luminous Ledger

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Luminous Ledger."** 

In the context of IoT energy monitoring, we are not just displaying data; we are visualizing invisible forces. This system rejects the cluttered, "dashboard-heavy" tropes of traditional industrial software. Instead, it adopts the authoritative, high-trust aesthetic of premium fintech. 

We move beyond the "template" look by utilizing **intentional asymmetry**—where primary KPIs are offset to draw the eye—and **tonal depth**, where elements aren't just placed on a grid, but emerged from a deep, atmospheric background. The interface should feel like a physical object of precision, where light (data) cuts through the dark (the void) with absolute clarity.

## 2. Colors & Surface Architecture
This system utilizes a sophisticated palette of deep slates and luminous indigos to establish an environment of high-end analytical focus.

### The Semantic Palette
- **Primary (`#c0c1ff`):** Used for critical action states and primary data threads.
- **Surface (`#0b1326`):** The foundation. A deep, infinite navy that provides the necessary contrast for luminosity.
- **Tertiary (`#4ae176`):** Reserved for "Grid Health" and "Positive Savings" indicators.

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a card (`surface_container_high`) should sit on a section background (`surface_container_low`) to create a discernible edge through value contrast alone.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material tiers to define importance:
- **Level 0 (Base):** `surface` (#0b1326) – The "desk" everything sits on.
- **Level 1 (Sections):** `surface_container_low` (#131b2e) – Large groupings of content.
- **Level 2 (Cards):** `surface_container_high` (#222a3d) – Individual data modules.
- **Level 3 (Interactive):** `surface_container_highest` (#2d3449) – Hover states and active selections.

### The "Glass & Gradient" Rule
To prevent the dark mode from feeling "flat" or "muddy," use **Glassmorphism** for floating elements (like dropdown menus or mobile navigation docks). Use `surface_bright` at 60% opacity with a `24px` backdrop blur. 
**Signature Texture:** Main CTA buttons must use a subtle linear gradient from `primary` (#c0c1ff) to `primary_container` (#8083ff) at a 135-degree angle to provide a "lit" effect.

## 3. Typography: Editorial Precision
We use **Public Sans** to bridge the gap between technical utility and modern elegance.

- **Display Scales (KPI Focus):** `display-lg` (3.5rem) and `display-md` (2.75rem) are reserved for the "Hero Metric" (e.g., Total kWh). These should have a slightly tighter tracking (-0.02em) to feel like a high-end finance journal.
- **Headline Scales:** `headline-sm` (1.5rem) uses `on_surface` to anchor major sections.
- **Label Scales:** `label-md` (0.75rem) and `label-sm` (0.6875rem) use `on_surface_variant` for metadata. These should be in All Caps with +0.05em tracking for maximum legibility at small sizes.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines.

- **The Layering Principle:** Place a `surface_container_highest` element inside a `surface_container` area to create a "lift" effect. The contrast in slate values provides a softer, more organic separation than a shadow.
- **Ambient Shadows:** When an element must "float" (e.g., a modal), use a shadow with a `48px` blur and `8%` opacity. The shadow color must be sampled from `surface_container_lowest` (#060e20), not pure black, to keep the depth feeling natural and atmospheric.
- **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a line that disappears into the background, maintaining the "No-Line" aesthetic.

## 5. Components

### Cards & Analytics Modules
- **Rule:** No dividers. Use `1.5rem` (xl) corner radius for main containers and `1rem` (lg) for nested items.
- **Data Spacing:** Use the `2rem` spacing unit between distinct data clusters to allow the "Luminous" elements to breathe.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `9999px` (full) radius. No border.
- **Secondary:** `surface_container_highest` fill with `primary` text.
- **Tertiary:** Transparent background with `on_surface_variant` text; shifts to `on_surface` on hover.

### Inputs & Selectors
- **Fields:** Use `surface_container_lowest` as the field background. The bottom edge should have a 2px "indicator" of `outline_variant` that transforms to `primary` on focus.
- **Chips:** For filtering timeframes (1D, 1W, 1M). Use `surface_container_high` for unselected and `primary` with `on_primary` text for selected.

### Energy-Specific Components
- **The Glow Chart:** Area charts should use a `primary` stroke. The "fill" of the area chart should be a gradient from `primary` (at 20% opacity) to `surface` (at 0% opacity). This creates a "pulse" effect that feels like live energy.
- **Status Orbs:** For device connectivity, use `tertiary` (success) with a small outer glow (4px blur) using the same color at 30% opacity.

## 6. Do's and Don'ts

### Do:
- **Do** use `display-lg` typography for numbers. In an energy platform, the data is the hero.
- **Do** use "Surface Stacking" (nesting lighter slates on darker slates) to define hierarchy.
- **Do** lean into the "Luminous" aspect by using semi-transparent overlays for tooltips.

### Don't:
- **Don't** use 1px solid white or grey borders. It breaks the premium fintech immersion.
- **Don't** use pure black (#000000). The `surface` (#0b1326) provides a much richer, "high-trust" depth.
- **Don't** crowd the interface. If a screen feels full, increase the spacing tokens. The "Luxury" of this system comes from its refusal to be cramped.