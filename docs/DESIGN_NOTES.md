# Current design direction

See `WEBSITE_VISION.md` and `ARCHITECTURE_ADDITION.md` for the current source of truth. This file describes the redesign implemented in October 2026.

## Presentation

Frost `#F2F0FA` is the main canvas, with ultraviolet `#5B45D6`, lavender `#C9C2F2`, a deep cosmos violet `#20164F` for the transformation band, and a restrained mint `#69E3C0` signal that marks live connections and outcomes. Manrope throughout, with a widened type scale: display down to tight `-0.065em` tracking, body no smaller than 10px anywhere on the page.

The experience is now one directed narrative rather than a collection of similar sections:

1. **Welcome** — the intentional coming-soon threshold (preserved). Four segments depart outward; the site emerges.
2. **Hero** — “Everything works together.” with a convergence stage: five real business streams converge into the dimensional Omnia core, which periodically loosens and re-locks. A thesis strip below states the whole offer in three parts.
3. **Possibilities** — four scenes (conversation → fulfilled order; payment → whole business in step; bespoke software around a team; executive answers). Each scene pairs a system chain with the new capability it creates. The lamp illustration lives inside the first scene. One honest note covers the section.
4. **Ecosystem** — three families around the business core with an interactive lens (All/Global/Regional/Custom). Regional depth is framed as a worldwide advantage.
5. **Transformation** — a deep-violet band that replaces the generic 01/02/03 consulting steps and the abstract “fits your business” diagram. Three selectable briefs map the brief → engineering → experienced reality, with an assembly gesture on the Omnia mark. A quiet “not another” strip draws the category line without naming competitors.
6. **Omnia OS** — two-level: the surface promise plus an optional layer explorer (Consulting / Solutions / Modules / OS core) with honest in-development framing.
7. **Early access** — two honest pathways (waitlist, direct conversation), both Netlify Forms, with truthful local-preview and failure states. No faked success, no silent collection.

## Motion and accessibility

Autonomous, orchestrated motion only — no pointer tracking. The convergence stage, scene sequences, lens focusing, and the brief assembly are either autonomous or answer a visitor action. Lenis manages smooth wheel/anchor scrolling. Offscreen and hidden-page animations pause; reduced motion rests every animated element in its final, readable state (base styles are the lit state; keyframes only pulse). Tabs support arrows, Home/End, roving focus; the lens is a pressed-button group; the OS layers are buttons with `aria-pressed`. Forms have labels, autocomplete, `role="status"` announcement regions, honeypots, and honest validation.

## Identity assets

All ten marks are local. The four regional marks (Wafeq, Foodics, Ziina, Telr) are now sourced from the companies' own websites and stored under `assets/integration-marks/` — the favicon-cache runtime approach is retired. Provenance: `ATTRIBUTION.md`, `BRAND_SOURCES.json`.

## Submission handling

Waitlist and inquiry forms are wired to Netlify Forms with progressive enhancement: without JavaScript they POST natively; with JavaScript they announce success, local-preview, or failure truthfully. Deployment note: confirm both forms appear in the Netlify dashboard after the first deploy of this build.

## Skills and references

Applied the downloaded Anthropic [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) and [webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) skills: subject-specific visuals, screenshot critique, DOM inspection, and in-app browser checks at multiple widths.
