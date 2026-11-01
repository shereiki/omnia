# OMNIA — Visual Refinement, Scroll Experience & Brand Consistency

**Project:** `omnia-os-visual-rebuild.zip`

## Your assignment

The current website has a strong visual identity. The colors, typography, 3D elements, dimensional logo, floating interfaces, and overall art direction are approved.

However, several sections have confusing diagrams, inconsistent branding, poor positioning, unnecessary disclaimers, and interactions that do not feel like a sophisticated technology company's website.

**This is a visual refinement and interaction engineering task. NOT a website redesign or product strategy exercise.**

Work directly in the existing project. Preserve the overall design and implement the corrections below exactly.

## 1. Fix the OS and Modules visualizations

The visuals in the Omnia Modules section and **"One environment. Every part of the experience."** are unnecessarily complicated.

The issue is not the aesthetic. The aesthetic is good.

The problem is the composition.

### Remove confusing visual decoration

- Remove orbital lines that connect to nothing.
- Remove decorative connectors without clear endpoints.
- Remove arbitrary curves and symbols that resemble technical architecture but convey no meaning.
- Stop placing floating elements in positions that suggest relationships that don't exist.
- Do not use repeated generic developer symbols such as `{}`.
- Avoid piling unrelated cards around a central logo purely to fill the available space.

### Establish a clear visual hierarchy

Every visualization should distinguish:

**Omnia OS:** The persistent AI-native foundation.

**Omnia Modules:** Extensible capabilities that are installed, configured, combined, and customized.

**Native Intelligence:** The built-in AI environment that can work with permitted knowledge, tools, and Modules.

**Solutions:** The resulting interfaces, applications, workflows, intelligent experiences, and services.

These should have clear, understandable relationships.

The audience should be able to recognize what they're looking at without reading multiple paragraphs.

### Visual connections

Only use connection lines when they convey something real.

Every visible connection must have identifiable endpoints.

If a line doesn't clearly communicate a relationship, remove it.

Don't connect every component to every other component.

Favor a few meaningful relationships over a complex network of decorative curves.

Preserve the existing dimensional visual language, soft lavender surfaces, mint accents, restrained shadows, and sophisticated typography.

**Simplify the information architecture, not the visual quality.**

## 2. Make the five-stage exploration scroll-driven using Lenis

The current five stages require visitors to click arrows to advance.

Change this to an immersive, scroll-driven experience using Lenis.

### Required behavior

- Visitors scroll naturally into the Omnia OS exploration.
- The current visual environment becomes the focus.
- As visitors continue scrolling, the experience progresses through five stages.
- Each stage introduces or emphasizes a new capability.
- Previously introduced capabilities remain part of the environment.
- Scrolling upward reverses the progression naturally.
- After the fifth stage, scrolling continues normally into the next website section.

Use Lenis for smooth scrolling, synchronized with the existing animation system.

Implement a restrained scroll-pinned or scroll-linked presentation where appropriate.

**Do not create a scroll trap.**

Do not require excessive scrolling to advance through one stage.

Do not force visitors to scroll through enormous empty sections.

Scrolling must feel fluid, responsive, and premium.

### Stage progression

Keep the existing five-stage product concepts:

1. The Omnia OS foundation and connected technology.
2. Native intelligence becomes available throughout the environment.
3. Omnia Modules extend functionality.
4. Capabilities combine into complete experiences, including new frontends.
5. Deeply customized Modules, interfaces, intelligence, and services form a tailored Solution.

Do not replace the content with another fictional industry case study.

### Manual navigation

Keep the stage counter and existing navigation arrows as secondary controls.

Clicking a stage control must synchronize the active stage with the scroll position.

Do not let the arrow controls and scroll position produce inconsistent states.

Use scroll observers or measured scroll progress rather than fragile wheel-event interception.

Respect `prefers-reduced-motion`, keyboard navigation, touch devices, and mobile scrolling.

If the pinning approach doesn't work cleanly on smaller screens, use a responsive non-pinned progression.

## 3. Fix logo consistency across the entire site

The Omnia logo currently appears with inconsistent treatments: white in some places, purple in others, and sometimes with differently arranged colors.

This looks accidental.

### Establish one canonical logo treatment

Use the existing approved segmented Omnia mark as the source of truth.

Maintain consistent:

- Segment geometry.
- Purple and mint color placement.
- Orientation.
- Proportions.
- Spacing.
- Dimensional treatment where applicable.

Use the full-color mark on surfaces with suitable contrast.

A monochrome white variation is acceptable only when necessary on a dark or saturated background.

Do not arbitrarily recolor or reconstruct the logo for individual sections.

**The logo should look like the same brand asset everywhere, not several interpretations of it.**

Audit the hero, welcome animation, Omnia OS visualizations, Native Intelligence section, Module representations, floating cards, and footer.

Centralize the logo styles/assets where practical to prevent future inconsistency.

Do not redesign the logo.

## 4. Fix the floating interface illustration

The large floating workspace illustration is one of the better visual elements on the website.

**Keep its composition, dimensional treatment, rotation, typography, and overall appearance.**

However, it currently resembles a generic fictional software interface.

Add subtle, meaningful Omnia branding.

### Required changes

- Add the Omnia mark to the workspace header or an appropriate interface location.
- Make it clear when the viewer is seeing an Omnia-powered interface.
- Use consistent Omnia branding on the floating feature card.
- Replace generic placeholder branding and meaningless microcopy with credible labels.
- Maintain the elegant minimal interface; do not clutter it with logos.

Most importantly, preserve the distinction between:

1. Omnia extending an existing third-party application.
2. Omnia creating a completely new frontend.
3. Omnia delivering both frontend and backend capabilities together.

Do not imply that third-party applications suddenly become Omnia-branded.

Where the visual depicts an existing third-party tool, show Omnia as the source of the added capabilities rather than the owner of that original interface.

## 5. Fix the "Intelligence, built in" positioning

In the existing Omnia OS visualization, the mint-green **"Intelligence, built in"** pill floats awkwardly beneath the logo.

Its position makes it look disconnected from the OS and partially aligned with an unrelated orbital line.

This must be corrected.

Native intelligence is part of Omnia OS itself.

Don't depict it as a separate plugin, add-on, or floating feature beneath the platform.

Integrate the intelligence label into the OS platform's visual structure.

Possible implementation: a clearly contained native intelligence layer within the main OS representation.

Do not add another floating sticker or decorative badge.

The relationship must be immediately obvious: **intelligence is built into the OS**.

## 6. Fix the serious Native Intelligence layout collision

In the internal agent visualization, the lower section contains:

- A mint-green oval platform.
- A dimensional Omnia logo.
- An "Omnia OS" label.
- Floating Module and approval cards.
- A disclaimer beneath the illustration.

These currently collide visually.

The logo extends below the intended composition, the OS label overlaps the logo/platform, and the bottom text sits uncomfortably close to the illustration.

### Required solution

Rebuild the positioning within this specific visualization.

- Give the Omnia OS identity a dedicated, properly aligned position.
- Remove unnecessary oval geometry if it complicates the layout.
- Ensure the logo and its label do not overlap.
- Establish clear separation between the agent interface and underlying OS representation.
- Align the Module and permission elements intentionally.
- Remove overlapping shadows and unintended stacking artifacts.
- Ensure all elements remain within their parent container.
- Eliminate all text collisions at desktop and mobile sizes.

**Do not solve this with arbitrary negative margins or by hiding overflow and clipping the problem.**

Fix the actual layout and positioning rules.

The finished composition should look balanced and designed, not patched.

## 7. Remove unnecessary prelaunch disclaimers

Codex keeps inserting awkward language such as:

"Predetermined illustration. Omnia is coming soon."

"An illustrative environment. Familiar tools, new capabilities."

"These Modules are examples, not a released catalog."

These disclaimers appear repeatedly underneath otherwise beautiful visuals and make the website feel insecure and overly legalistic.

**Remove these repetitive captions and disclaimers throughout the website.**

The website already establishes that Omnia is coming soon.

Keep one tasteful, visible prelaunch indicator in the appropriate global location.

Do not make misleading claims about live deployments, released products, existing clients, or verified partnerships.

But do not attach unnecessary caveats to every visualization.

The visuals should speak for themselves.

Remove other filler statements that merely restate what the visual already shows.

## 8. Correct the "Keep what works." integration section

The current integration presentation risks implying that the displayed logos represent the entire Omnia integration ecosystem.

This is incorrect.

Omnia can be engineered to work with a very broad range of technology, including:

- Common global software platforms.
- Regional and industry-specific applications.
- Internal or proprietary business systems.
- Legacy technology.
- Custom APIs and services.
- Technologies that require newly engineered Connectors.

The displayed companies and logos should communicate recognizable examples, **not a complete catalog or a fixed list of supported integrations**.

### Required copy

**Heading:** Keep what works. Build beyond it.

**Supporting copy:**

"Omnia works with the technology your organization already relies on—from familiar platforms to specialized applications and systems built entirely in-house.

With Omnia Modules, existing technology can be connected, extended, and combined with entirely new capabilities. And when a connection or capability doesn't already exist, we can engineer it."

Keep the existing recognizable platform logos, but make the visual layout communicate an open-ended ecosystem.

Do not invent new partnerships or claim that integrations have been released.

Do not turn the section into an enormous logo directory.

## 9. Refine the Modules presentation

The current Module visualizations use cards, labels, and connectors without enough clarity about what Modules actually contribute.

Modules are an important part of Omnia's identity.

They are not merely technical infrastructure or hidden implementation details.

### Correct conceptual presentation

**Omnia OS is the foundation.**

**Modules expand its capabilities.**

**Native intelligence can use permitted Modules and connected context.**

**Solutions combine these elements into tailored experiences and functionality.**

Show Modules joining and expanding the environment.

Make it visually apparent that a Module may provide:

- A new connection.
- Functionality inside existing software.
- Coordinated automation.
- A custom backend service.
- Capabilities used by a new interface or application.

Modules aren't restricted to behind-the-scenes functions.

However, do not imply every Module is itself a complete frontend application.

### Composition

Use a smaller number of well-designed, recognizable Module elements.

Each should have a clear identity, purpose, and visual relationship to the OS.

Avoid repeated generic labels such as "Omnia Module" inside every oversized rectangle.

Show accumulation and extensibility without simply making the screen more crowded at each stage.

Don't build a fictional app marketplace or self-service installation experience.

Omnia handles configuration, engineering, and ongoing management for clients.

## 10. Audit copy and remove technical vagueness

Improve awkward generic copy throughout the relevant visuals.

Avoid empty phrases such as:

- "A familiar place. With new possibilities."
- "Information brought together."
- "A capability of your own."
- "Bring the next idea to life."
- "Work with the right context."

These may sound pleasant but convey little concrete meaning.

Use short, specific language about what the technology actually enables.

Avoid making Omnia sound exclusively like an automation platform, chatbot builder, or backend integration service.

Omnia can deliver complete technological environments, including frontends, backends, applications, integrations, Modules, and native AI agents.

Do not add unnecessarily long corporate explanations.

Keep the tone contemporary, technically confident, and understandable to nontechnical business owners.

## 11. Preserve everything that is already approved

Do not change:

- The overall Omnia brand identity.
- Segmented logo design.
- Purple, mint, and lavender palette.
- Existing typography.
- Welcome screen.
- Main hero composition.
- "Everything works together."
- Native Intelligence product architecture.
- Internal and customer-facing agent concepts.
- Six agent customization dimensions.
- Existing navigation.
- Backend, contact forms, and private inbox.

Do not introduce new product strategy, pricing packages, customer case studies, or industry-specific narratives.

Do not replace the framework or rewrite unrelated components.

This is a limited-scope, high-quality visual and UX pass.

## 12. Mandatory visual verification

Do not consider the task complete simply because the code compiles.

Use browser screenshots and inspect the actual rendered website.

Review these components at desktop, tablet, and mobile widths:

1. The hero and floating interface.
2. The five-stage OS exploration, all five states.
3. The Modules visualization.
4. The Native Intelligence visualization.
5. The internal/customer agent switch.
6. The integration ecosystem.

Check for:

- Overlapping text and logos.
- Misaligned cards.
- Unintended clipping.
- Incorrect stacking contexts.
- Meaningless connector lines.
- Inconsistent logo treatments.
- Excessive empty space.
- Poor mobile composition.
- Broken scroll interaction.
- Inconsistent scroll/arrow state.
- Decorative captions that add no information.

Test Lenis scrolling both directions, including rapid scrolling and direct stage navigation.

Test keyboard navigation, reduced-motion preferences, and touch scrolling.

Use the actual screenshots to identify and fix visual regressions. Do not declare a layout acceptable solely from reviewing the CSS.

## Final outcome

The website should feel like a premium, forward-thinking technology company with a sophisticated and genuinely extensible platform.

The user should intuitively understand:

**Omnia OS** is the foundation.

**Omnia Modules** expand what it can do.

**Native Intelligence** makes that environment intelligent and powers highly customizable agents.

**Omnia Solutions** can encompass entire frontends, backends, integrations, applications, and operating capabilities.

The design should explain these relationships elegantly, without messy diagrams or excessive prose.

**Do not redesign Omnia. Clean up the execution, implement the scroll experience, and make the existing visuals coherent and exceptional.**

Implement directly. Return the updated project and a concise description of what changed.