# BioRevolution Coalition - First-pass prototype

Plain single-page prototype built from `BioRevolution-Website-Brief-v2.md` and `brandbook.html`. Three files only: `index.html`, `styles.css`, `script.js`. No framework, no build step. Open `index.html` in a browser.

## Ready for real copy

Every spot that needs campaign-master-doc text carries an inline `<!-- PLACEHOLDER: ... -->` comment in `index.html`. Search for `PLACEHOLDER` to find them all. They are concentrated in:

- S2 Petition - four body paragraphs
- S3 Critical Flaw - four hex-card titles and bodies
- S4 Problem - long-read prose and the four policy-barrier accordion items
- S5 Innovation Gap - the source line under the stat
- S6 Solution - five roadmap-node labels and the three stat values + sources
- S7 Case Studies - both card bodies (the comparison table values are illustrative)

Pre-approved golden copy (hero strapline, section H2s, innovation-gap stat, innovation-gap pull-quote) is already in place verbatim per brief §11.

## Stubbed for later phases (per brandbook §12)

These are visual-only in the prototype. Phase 4 / phase 5 work.

- **Petition counter.** Live. `update-petition-count.php` runs every 5 minutes as a cPanel Cron job, fetches `petition.parliament.uk/petitions/767417.json`, and writes `petition-count.json`; `script.js` reads it to render the count and progress bar.
- **Hero scroll-morph.** Static end-state composition only. Phase 4 adds the morph from shard to branching form.
- **Odometer counter animation.** None. Phase 4 drops Odometer.js in.
- **GSAP DrawSVG on the roadmap path.** Static dashed path only. Phase 4 animates it in on scroll.
- **Dynamic OG image.** Not wired. Phase 4 adds `@vercel/og` with live signature count.
- **Coalition logo strip.** Six dashed placeholder slots in the footer. Swap in real member logos (greyscale by default, colour on hover via CSS filter).
- **Favicon.** Not included. Phase 2 / 5.
- **Self-hosted fonts.** Using Google Fonts CDN (Archivo + Archivo Narrow + Inter). Phase 5 self-hosts to hit Lighthouse LCP under 2.0s.
- **SVGO pass.** Not applied. Phase 5.

## Live in the prototype

- All nine sections in brief §8, in order, with the light/dark rhythm per §6
- Sticky nav: hidden on hero, solidifies past 80vh with Forest Ink @ 95% + backdrop blur
- Strapline lockup treatment, reserved to the strapline (hero + footer) per §4
- Button, hex card, stat block, progress bar, section header components from §7 lifted from brandbook
- Card hover Voronoi opacity 8% -> 22% (the one live animation from §9)
- Three-audience CTA grid in hero
- Policy-barriers accordion on §4 using `<details>` + hex affordance that rotates 60 degrees on open
- Case study expand/collapse cards (only one open at a time, via the 12 lines in `script.js`)
- Fossil vs biogenic carbon cycle SVG diagram in §4
- Fossil vs bio comparison table in §7 case 2

## Design-rule compliance

Checked against brief §3 and brandbook §03 colour rules:

- Leaf Green never used for text under 18px (stat numerals at 64px+ only)
- Chartreuse never used on Cream (only on Forest Ink backgrounds)
- Amber used as decoration only, once per section max (single slash in hero SVG)
- Body text is Forest Ink on Cream or Cream on Forest Ink everywhere
- Strapline lockup used for the strapline only (hero + footer), no generic H1s use it

## Copy-rule compliance

- British English throughout (colour, organisation, behaviour, realise, programme)
- Hyphens only, no em-dashes, no en-dashes

## To view

```
open index.html
```

Or in this repo's directory, double-click `index.html`.
