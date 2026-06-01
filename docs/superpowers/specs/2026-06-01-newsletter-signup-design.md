# Newsletter signup - design

**Date:** 2026-06-01
**Status:** Approved, in build

## Goal

Let citizens sign up to the BioRevolution Coalition newsletter (petition progress
and campaign updates) directly from the site, without leaving the page.

## Decisions

- **Provider:** Mailchimp, dedicated audience "Biorevolution Coalition newsletter"
  inside the existing BBIA account (datacentre us11). Chosen over a custom backend
  so deliverability, unsubscribe and the confirmation step are handled for us.
- **Opt-in:** double opt-in (Mailchimp's default for signup forms). The subscriber
  is added as *pending* and must click a confirmation link before they receive
  anything. Strong GDPR consent record; protects sender reputation.
- **Fields:** email only (lowest friction for a campaign CTA).
- **Consent model:** double opt-in plus a short consent line under the box.
  Mailchimp's "Marketing Permissions" GDPR checkboxes are NOT rendered - we build
  our own email-only markup, so they never appear.
- **Sender:** audience default from-name set to "BioRevolution Coalition"
  (from-address news@bbia.org.uk).

## Mailchimp integration values (public form values, safe in repo)

- Submit host: `bbia.us11.list-manage.com`
- Account id (`u`): `98ac0ec9b49125f74fb3db572`
- Audience id (`id`): `fe0cae2c04`
- Form id (`f_id`): `0032cbe3f0`
- Honeypot field: `b_98ac0ec9b49125f74fb3db572_fe0cae2c04`

## How it works

No backend. The browser submits to Mailchimp's `post-json` endpoint via JSONP
(a dynamically injected `<script>` with a one-off global callback - the standard
vanilla-JS cross-domain pattern, no libraries added). Mailchimp replies
`{result, msg}`; we show our own clean message in an `aria-live` region and never
reload or redirect. Because the audience uses double opt-in, Mailchimp sends the
confirmation email itself.

## On-page states

| Situation | Message |
|---|---|
| Success | "Thanks - please check your inbox to confirm your subscription." |
| Already subscribed | "You're already on the list - thank you." |
| Empty / invalid email | "Please enter a valid email address." |
| Network / Mailchimp error | "Something went wrong - please try again." |

## Placement

Petition section (`#petition`), right-hand column, directly beneath the share
strip and above the supporters blocks - the natural "sign -> share -> stay
updated" progression under the Sign the petition CTA.

## Files

- `index.html` - signup block markup in the petition right column.
- `styles.css` - `.newsletter-signup` styles, matching site tokens (cream
  section, forest-ink text, leaf-green CTA).
- `script.js` - email validation + JSONP submit + inline response handling.

## Testing

Manual (static site): run locally, submit a real address, confirm a *pending*
contact appears in the Mailchimp audience and the confirmation email arrives;
then exercise the invalid-email and already-subscribed paths in the browser.
