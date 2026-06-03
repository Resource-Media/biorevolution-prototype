/* BioRevolution Coalition - Klaro consent configuration.
 *
 * Mirrors the Klaro setup on resourcemedia.eco, pared down to a single
 * Analytics purpose (Google Analytics 4). Opt-in by default: nothing
 * non-essential runs until the visitor accepts.
 *
 * GA is loaded two ways belt-and-braces:
 *   1. Klaro script-blocking - the gtag.js loader in <head> is
 *      type="text/plain" with data-name="google-analytics", so Klaro only
 *      injects it once analytics consent is given.
 *   2. Google Consent Mode v2 - <head> defaults every storage type to
 *      "denied"; the callback below flips analytics_storage to "granted"
 *      on accept (and back to "denied" on decline).
 *
 * Sentry error tracking sets no cookies in its current config, so it is
 * treated as strictly necessary and is not listed here.
 */
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  storageMethod: 'localStorage',
  storageName: 'klaro-consent',
  htmlTexts: true,
  cookieExpiresAfterDays: 365,
  default: false,        // opt-in: services off until accepted
  mustConsent: false,    // non-blocking notice, not a wall
  acceptAll: true,
  hideDeclineAll: false, // show a "Decline" button as prominent as "Accept"
  hideLearnMore: false,
  noticeAsModal: false,
  disablePoweredBy: true,

  translations: {
    en: {
      consentNotice: {
        description:
          'We use a single anonymous analytics cookie to understand how people use this site, so we can improve the campaign. Nothing is set unless you accept.',
        learnMore: 'Choose',
      },
      consentModal: {
        title: 'Privacy &amp; cookies',
        description:
          'We only set cookies for anonymous analytics, and only if you allow it. You can change your choice at any time. Read more on our <a href="/privacy.html">Privacy &amp; Cookies</a> page.',
      },
      ok: 'Accept',
      decline: 'Decline',
      acceptAll: 'Accept',
      acceptSelected: 'Save choices',
      purposes: {
        analytics: {
          title: 'Analytics',
          description:
            'Helps us understand how visitors use the site so we can improve it. Provided by Google Analytics.',
        },
      },
      privacyPolicyUrl: '/privacy.html',
    },
  },

  services: [
    {
      name: 'google-analytics',
      title: 'Google Analytics',
      purposes: ['analytics'],
      required: false,
      default: false,
      optOut: false,
      // Cookies Klaro should clear if consent is declined or withdrawn.
      cookies: [
        [/^_ga/, '/', 'biorevolution.uk'],
        [/^_ga/, '/', '.biorevolution.uk'],
      ],
      // Bridge Klaro's choice to Google Consent Mode v2.
      callback: function (consent) {
        if (typeof window.gtag === 'function') {
          window.gtag('consent', 'update', {
            analytics_storage: consent ? 'granted' : 'denied',
          });
        }
      },
    },
  ],
};
