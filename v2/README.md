# Cinematic edition · Korean and English preview

Purpose: help a first-time reader remember and retell the Bible's redemptive story.
The 13 existing chapter anchors are preserved. Jesus has three consecutive visual
beats (arrival, cross, resurrection), not a simultaneous split-screen. Existing
Scripture, explanatory content, maps, FAQ, prayer and copyright notices remain.

## Art and implementation

Production artwork was generated with OpenAI image generation, then encoded with
Sharp as 640px and 960px WebP. These are actual shipped assets, not concept-only
mockups. This is layered 2D cinematography, **not real-time 3D**. Source prompts are
in ART-DIRECTION.md. Images are imaginative interpretations, not archaeological
reconstructions; the same disclosure is displayed to readers.

Native scroll, no scroll interception, no autoplay audio, no WebGL dependency.
Only visible stages have scroll-driven camera translation; atmospheric breathing
pauses offscreen. Reduced motion disables both. Reading mode removes the tall
visual stages. Text has no fixed-height clipping or opacity reveal dependency.
The silent years are ordinary visible document content, not a sticky trigger.

Only Korean and English mount the cinematic reader. Other languages keep their
existing content/layout. The original language prerender, SEO, hreflang, legal
notices and deep links remain. English preview assets resolve to their own origin.
Images after the hero are lazy-loaded; the service worker does not eagerly fetch
the whole artwork set. Currently uncached artwork needs a first online visit.

## Verification

Run `node tools/test-cinema.mjs` and `npm run build`.
Manual QA: 360, 390, 412, 480 CSS-pixel widths, landscape, 200% text zoom,
chapter links, all 13 drawers, silence, sequential cross/resurrection, language,
sharing, QR, reading mode, reduced motion. Physical screen resolution is not CSS
viewport width. Do not claim Galaxy hardware testing from desktop screenshots.

The feature branch is the review surface. Do not merge to main or roll out to
other languages without the owner's approval.
