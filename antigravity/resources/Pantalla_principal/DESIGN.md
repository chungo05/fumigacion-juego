# Design System Document: The Entomologist’s Workbench

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Macro Workbench."** 

We are moving away from the "flat" nature of casual mobile games toward a tactile, high-fidelity editorial experience. Imagine a macro-photograph of a master craftsman’s table—worn by time, stained by sap, and scattered with vibrant specimens. This design system rejects the "floating UI" trope. Instead, every element is either physically carved into the wood (intaglio) or placed upon it like a precious artifact. 

We break the "template" look through intentional asymmetry: elements should feel like they were placed by hand, not snapped to a rigid digital grid. We utilize high-contrast typography scales and deep tonal shifts to create a sense of discovery and physical presence.

## 2. Colors: The Earth & The Specimen
The palette is a dialogue between the muted, ancient tones of the environment and the hyper-saturated, electric colors of nature.

*   **Primary Roles:** Use `primary` (#f6cfc2) and `primary-container` (#bc998d) to represent raw, sanded wood and highlights.
*   **The Specimen Accents:** `secondary` (#91f78e) represents "Mantis Green"—use this for success states and growth. `tertiary` (#ff7166) represents "Ladybug Red"—reserved for high-energy actions, errors, or critical alerts.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be defined solely through background color shifts. A section is not "boxed in"; it exists because it is a `surface-container-low` block resting on a `surface` background.

### Surface Hierarchy & Nesting
Treat the UI as a physical material.
*   **Carved Elements (Nested):** To create an "engraved" look, nest a `surface-container-lowest` (#000000) area inside a `surface-container` (#2a130f). This represents the depth of the wood grain.
*   **Placed Elements (Stacked):** To represent an object sitting on the table, use `surface-container-highest` (#3a1e19) to create a subtle lift against the darker base.

### The "Glass & Gradient" Rule
To elevate the "rustic" feel into a "premium" space, use "Amber Glassmorphism." Floating panels (like tooltips or pop-ups) should use `surface-container-high` at 80% opacity with a `backdrop-blur` of 12px. Main CTAs should utilize a subtle linear gradient from `primary` to `primary-dim` to simulate the natural sheen of polished wood or resin.

## 3. Typography: The Bold Record
The typography strategy pairs the structural authority of **Epilogue** with the modern clarity of **Plus Jakarta Sans**.

*   **The Hero Scale:** Use `display-lg` (Epilogue) for primary game stats (e.g., "Level 42" or "Bug Count"). The bold, playful nature of Epilogue should feel like it was branded or stamped into the wood.
*   **The Editorial Body:** Use `plusJakartaSans` for all `body` and `label` roles. This provides a clean, contemporary contrast to the rustic background, ensuring that even in a "worn" environment, the data remains clinical and readable.
*   **Intentional Hierarchy:** We use dramatic size differences (e.g., a `display-sm` headline next to a `label-md` descriptor) to create an editorial layout that feels curated rather than generic.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are replaced by **Ambient Occlusion** and **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural "recessed" effect.
*   **Ambient Shadows:** When a "floating" effect is required (e.g., a specimen card), shadows must be extra-diffused. Use a 24px blur with 6% opacity. The shadow color must be a tinted version of `on-surface` (#ffded8) rather than pure black, simulating light passing through organic material.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use the `outline-variant` token at 15% opacity. This creates a "soft edge" rather than a hard line.

## 5. Components

### Buttons: The Tactile Interaction
*   **Primary (The "Placed" Block):** Use `primary-container`. High roundedness (`lg` or `xl`). No border. Use a subtle inner-shadow to make it look like a physical wood block.
*   **Secondary (The "Carved" Slot):** Use `surface-container-lowest`. This should look like a finger-sized groove carved into the table. Text should be `primary`.
*   **States:** On `hover`, increase the brightness of the surface tier. On `press`, shift the color to a deeper container tier to simulate physical compression.

### Chips: The Specimen Labels
*   **Style:** Small, high-contrast pills. Use `secondary-container` for bug-related stats and `tertiary-container` for heat or danger.
*   **Layout:** Always use `label-md` for text to maintain a professional, scientific-log look.

### Lists & Stats
*   **Forbid Dividers:** Never use a line to separate list items. Use vertical white space (from the Spacing Scale) or alternate between `surface-container-low` and `surface-container-lowest` backgrounds.
*   **Leading Elements:** Use circular avatars for bug icons, treated with a 2px `outline` using `primary-fixed-dim` to make them "pop" like specimens under a glass lens.

### Input Fields: The Engraved Groove
*   **Visuals:** Inputs should always look "carved." Use `surface-container-lowest` with a `md` roundedness.
*   **States:** The "active" state is indicated not by a bold border, but by the label shifting to `secondary` (Bug Green) and a subtle `surface-bright` glow behind the text.

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace asymmetry. Group elements in clusters to mimic a desk, rather than a perfectly centered grid.
*   **Do** use `display-lg` for single-digit numbers to emphasize their importance as "game trophies."
*   **Do** use backdrop blurs on any overlapping surfaces to maintain the "Amber Glass" premium feel.

### Don’t:
*   **Don’t** use pure white (#FFFFFF) or pure black (#000000) for anything other than extreme depth. Stick to the palette's earthy neutrals.
*   **Don’t** use 1px solid borders. If the layout feels "bleary," increase the contrast between your `surface-container` tiers instead.
*   **Don’t** use generic system icons. If an icon is needed, it should feel hand-drawn or "etched" into the UI.