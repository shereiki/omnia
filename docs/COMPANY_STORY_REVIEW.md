# Company introduction and new story review

## Editorial result

The opening names the consulting-led company and its design/build/connect/operate relationship. The next section explains how a business engages Omnia with an objective, and how existing tools, new software and additional capabilities can be combined around it.

The hotel illustration is introduced only after that company model. Its subject is a new service the hotel group wants to offer: a guest can shape one stay across its collection. Guests choose time alone or time together. The resulting experience changes, including the alternative offered when rain affects the day. A family picnic can become a hosted workshop at a sister property, with relevant context carried to its staff. The host confirms the alternative; the illustration does not imply unlimited availability or autonomous business decisions.

The last chapter reveals the combination of existing operating tools, custom guest experiences, cross-property service rules and staff context. The following section explicitly widens the scope to team capabilities and entirely new services. The story is an illustration, not a definition of Omnia or a finished product.

The relationship section explains investigation, scope, engineering, testing and agreed ongoing support. Omnia OS remains optional supporting depth. The final invitation supports business, partnership, investor and launch-interest inquiries.

## Browser checks

Chromium, using the actual local Cloudflare Pages runtime:

- Desktop at 1440px, mobile at 390px, and narrow mobile at 320px with reduced motion.
- Seven sections, company explanation before the story, all four story chapters.
- Intention choices update the guest experience and the changed-day alternative; choices persist through back and next navigation.
- Only the current chapter is shown with JavaScript. Without JavaScript, all four chapters remain readable and inactive navigation controls are hidden.
- Editable inquiry handoff preserves an existing visitor draft.
- Mobile navigation, Escape dismissal, optional Omnia OS disclosure, loaded local images and horizontal overflow.
- No browser exceptions in these checks. Desktop and mobile screenshots inspected.

These are implementation and editorial checks, not usability research or evidence of a deployed hospitality solution.

## Preserved functionality

Compared 31 files byte-for-byte against `omnia-discovery-update.zip`: welcome styles, original application/navigation and inquiry behavior, identity assets, private inbox, backend handlers, schema, headers, route and Cloudflare configuration.

A test inquiry was saved by the real local D1 handler and independently read from SQLite with every submitted field matched. The private inbox rejected an unauthenticated request with HTTP 401. Cryptographic Cloudflare Access checks passed with controlled local fixtures.

Production is not deployed. Cloudflare account setup, a production D1 binding and owner-only Access configuration are still required. Local state, test inquiries and credentials are excluded from the delivered archive.
