# Rendered experience audit and decisions

The owner requested a serious reassessment of the latest complete-polish version, not another control-only pass. The starting site was run and inspected in Chromium at 1440px and 390px. The historical README was not used as evidence of design quality.

## What the rendered site showed

The launch threshold and segmented mark were effective brand assets. Local logo assets worked. The typography and existing palette provided a recognizable starting point.

The narrative repeated the same promise in the hero, thesis strip, examples, brief studio, and OS section. The mobile examples were roughly 1750px tall and the repeated brief studio roughly 1872px tall. A visitor had to pass through multiple explanations before the page offered a next step. The dark studio felt like a second landing page, rather than the next beat of one story. Small, polished interface mockups still framed Omnia too narrowly. Two opening-soon notices ended the journey without capturing interest.

## Structural decision

Use five sections, each with one job:

1. **Opening:** the central “Everything works together” statement, a large segmented mark, and one succinct promise. Removed the three-column thesis strip and tiny orbit labels.
2. **One developed possibility:** a service business creates a new customer capability, from preferences through expertise and availability to delivery. An editorial illustration makes the thought tangible without pretending to be a shipped product. Removed the four-scene menu and repeated brief studio.
3. **Ecosystem:** global, regional and proprietary systems establish reach. Existing local logos remain unchanged; removed the extra map core and ornamental network controls.
4. **Working relationship:** consulting now explains how collaboration would proceed. Technical depth is optional inside this section, not a standalone architecture argument.
5. **Invitation:** one inquiry form for prospective clients, partners, investors and launch interest, backed by D1 and a private admin inbox once the account is configured.

## Art direction

Retain frost, violet, lavender and mint, the local typeface, and the intentional welcome. Give the opening enough scale to establish ambition. Use a single full-violet story field, frost ecosystem, and softer lavender approach section. Flat color, larger typography and deliberate spacing establish transitions; no particles, glass cards, new gradients or generic scroll-reveal stack. The one developed possibility is explicitly illustrative. Its scope does not define the company.

The service drawing, its text and the booking/delivery context should be read together. The diagram is a concept illustration, not a screenshot or claimed product interface. The logo's restrained ambient movement and the existing outward welcome departure carry the brand motion. Navigation and the optional disclosure retain meaningful interaction.

## Contact decision

The owner confirmed Cloudflare DNS ownership and requested a private admin destination instead of a company email address. Pages Functions plus D1 implement that request. Admin reads/updates require cryptographically verified Cloudflare Access tokens. Production deployment, database ID, and Access account/application configuration remain required; no fake endpoint, public admin password or invented company mailbox is used.

## Verification

The website was rendered and reviewed at desktop and phone sizes, with additional checks at intermediate widths and 320px. Local Cloudflare runtime checks exercise real D1 writes, independent database readback, public form errors, and unauthorized admin rejection. Cryptographic verification uses controlled signed-token/JWKS fixtures to test valid, forged, wrong-audience and expired tokens. Admin UI rendering uses an explicit fixture; a live Access login cannot be demonstrated without account configuration. Those are local checks, not a claim that production is deployed.

The final invitation also supports launch interest without requiring a business brief: choosing updates hides the message field and saves an interest record. Both inquiry and interest submissions were verified in the real local database. The static preview and unconfigured backend never claim a successful submission.
