# AI-native positioning update: verification

## Scope and preservation

The starting source is `f36beec`, tagged `before-ai-native-update`. This update preserves the existing visual identity, palette, type, segmented mark, welcome, capsule controls, Lenis, responsive navigation, ecosystem assets, inquiry behavior and private inbox. The changes concern positioning, the early OS presentation, the architecture explanation and the replacement narrative. No framework, logo research, AI service, product backend or deployment integration was added.

The original apparel story script and its unused garment assets are removed. The deployment asset list now includes `omnia-story.js`.

## Product corrections

The hero identifies Omnia as an AI-native technology ecosystem. Omnia OS is presented in a substantial section immediately after the opening, with existing business technology surrounding a shared foundation and native intelligence. It is not presented as a dashboard or an application the client must configure. Omnia handles integration, configuration, deployment and the necessary engineering.

Four Module types remain in optional technical depth: Connectors, Extensions, Automations and Custom Services. Native intelligence and the agent runtime are explained separately. The current internal architecture is documented in AI_NATIVE_ARCHITECTURE.md; earlier briefs and reviews are historical.

The main story has five connected states: an existing business; introduction of Omnia OS; an intelligent responsibility; coordination across multiple agents; broader non-agent capabilities. The same tool objects remain in the composition. Three predefined responsibilities change the objective, context, permitted capabilities, tasks and human approval boundaries. The example does not accept an arbitrary request or pretend to process a live AI response.

AI is native to the OS. The early breadth note, scope section and final story state also explain connections, extensions, deterministic workflows and purpose-built functionality. Individual Solutions need not depend on AI. The story is labeled illustrative and the site remains coming soon. No deployed agents, live operations, completed integrations, customers or performance metrics are fabricated.

## Browser review

Chromium checks cover desktop, tablet and mobile sizes: 1440×1000, 1024×900, 820×1000, 760×900, 390×844 and 320×740, with reduced motion in the narrowest case. The early OS section, four-type taxonomy, five scene controls, automatic scroll selection, persistent existing tools, responsibility/context/boundary changes, internal context scrolling, keyboard navigation, FAQ animations, inquiry draft preservation, loaded local assets and horizontal overflow are checked. The narrative makes no API calls and does not reload the page.

The mobile review exposed a scene-selection issue when different states changed the stage height. Mobile stages now retain one height across states, and the story opts out of scroll anchoring. Responsibility context remains independently scrollable, with an explicit cue to approval boundaries.

Without JavaScript, the OS overview, all five narrative scenes and native disclosures remain readable; inactive controls and the welcome gate are hidden. A 390×600 short-viewport check confirms that the story returns to normal document flow.

These are implementation and editorial checks, not a user study or evidence of a deployed intelligence runtime. Screenshots and a walkthrough support review of the actual presentation.

## Existing backend

The backend handlers, private inbox, Access verification, schema, Cloudflare configuration, route/header rules, inquiry JavaScript, navigation/disclosure script, welcome stylesheet and integration marks match the starting checkpoint. The existing cryptographic Access fixture checks passed.

The new page was exercised in the actual local Cloudflare Pages runtime under its CSP. A business inquiry and a launch registration returned 201 after storage; independent SQLite readback matched the submitted fields. A simulated storage failure retained the visitor's draft. The private inbox returned 401 without authentication. The story ran under the CSP without browser exceptions.

Production is not deployed. Cloudflare account authorization, a production D1 binding and owner-only Access configuration remain necessary, as documented in CLOUDFLARE_SETUP.md. Credentials and local test records are excluded from the delivery archive.
