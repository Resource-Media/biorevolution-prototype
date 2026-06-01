// BioRevolution Coalition - prototype interactions.
// Kept intentionally small; real animations (Odometer, GSAP DrawSVG,
// hero scroll-morph) arrive in phase 4.

(function () {
  const nav = document.getElementById('siteNav');
  const threshold = () => window.innerHeight * 0.8;

  function onScroll() {
    if (window.scrollY > threshold()) {
      nav.classList.add('is-solid');
    } else {
      nav.classList.remove('is-solid');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Only one case study open at a time (nicer for scanning on a long page).
  const cases = document.querySelectorAll('.case');
  cases.forEach(el => {
    el.addEventListener('toggle', () => {
      if (el.open) {
        cases.forEach(other => { if (other !== el) other.open = false; });
      }
    });
  });

  // Join the coalition form - submits to Web3Forms, shows inline thanks.
  const joinForm = document.getElementById('join-form');
  const joinThanks = document.getElementById('join-thanks');
  if (joinForm && joinThanks) {
    joinForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = joinForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      try {
        const res = await fetch(joinForm.action, {
          method: 'POST',
          body: new FormData(joinForm),
          headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          joinForm.hidden = true;
          joinThanks.hidden = false;
          joinThanks.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Join the coalition'; }
        alert('Sorry - something went wrong. Please email info@biorevolution.uk and we will add you manually.');
        console.error('Join form error:', err);
      }
    });
  }

  // Newsletter signup -> Mailchimp "Biorevolution Coalition newsletter" audience.
  // Submits via JSONP (cross-domain, no backend) so the page never reloads. The
  // audience uses double opt-in, so a successful submit means the contact is
  // pending and Mailchimp has sent them a confirmation link.
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterResponse = document.getElementById('newsletterResponse');
  if (newsletterForm && newsletterResponse) {
    const MAILCHIMP_URL = 'https://bbia.us11.list-manage.com/subscribe/post-json' +
      '?u=98ac0ec9b49125f74fb3db572&id=fe0cae2c04&f_id=0032cbe3f0';
    const emailInput = document.getElementById('newsletterEmail');
    const honeypot = newsletterForm.querySelector('input[name^="b_"]');
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');

    function showResponse(message, kind) {
      newsletterResponse.textContent = message;
      newsletterResponse.classList.remove('is-success', 'is-error');
      newsletterResponse.classList.add('is-visible', kind === 'error' ? 'is-error' : 'is-success');
    }
    function resetButton() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Subscribe'; }
    }

    // Mailchimp's post-json endpoint invokes a named global callback (JSONP).
    function mailchimpJsonp(url) {
      return new Promise((resolve, reject) => {
        const cb = 'mc_cb_' + Date.now();
        const script = document.createElement('script');
        const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 10000);
        function cleanup() {
          clearTimeout(timer);
          delete window[cb];
          if (script.parentNode) script.parentNode.removeChild(script);
        }
        window[cb] = (data) => { cleanup(); resolve(data); };
        script.onerror = () => { cleanup(); reject(new Error('network')); };
        script.src = url + '&c=' + cb;
        document.body.appendChild(script);
      });
    }

    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Honeypot filled = bot. Pretend success, send nothing.
      if (honeypot && honeypot.value) {
        newsletterForm.hidden = true;
        showResponse('Thanks - please check your inbox to confirm your subscription.', 'success');
        return;
      }
      const email = (emailInput.value || '').trim();
      // Light client-side check; Mailchimp does the authoritative validation.
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showResponse('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Subscribing...'; }
      const params = 'EMAIL=' + encodeURIComponent(email) +
        (honeypot ? '&' + encodeURIComponent(honeypot.name) + '=' : '');
      try {
        const data = await mailchimpJsonp(MAILCHIMP_URL + '&' + params);
        const msg = (data && data.msg) || '';
        if (data && data.result === 'success') {
          newsletterForm.hidden = true;
          showResponse('Thanks - please check your inbox to confirm your subscription.', 'success');
        } else if (/already subscribed/i.test(msg)) {
          showResponse("You're already on the list - thank you.", 'success');
          resetButton();
        } else {
          showResponse('Something went wrong - please try again.', 'error');
          resetButton();
          if (window.Sentry) {
            Sentry.captureMessage('Newsletter signup rejected: ' + msg, {
              level: 'warning', tags: { feature: 'newsletter' }
            });
          }
        }
      } catch (err) {
        showResponse('Something went wrong - please try again.', 'error');
        resetButton();
        if (window.Sentry) Sentry.captureException(err, { tags: { feature: 'newsletter' } });
      }
    });
  }
})();

// Fetch petition count, set the number, and let CSS animate the bar to width.
const PETITION_COUNT_FALLBACK = '—';
fetch('/petition-count.json')
  .then(r => {
    if (!r.ok) throw new Error(`petition-count.json HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    const count = Number(data.signature_count) || 0;
    const countEl = document.getElementById('petitionCount');
    if (!countEl) throw new Error('petition count element #petitionCount missing');
    const fillEl = document.getElementById('petitionFill');
    if (!fillEl) throw new Error('petition fill element #petitionFill missing');
    countEl.textContent = count.toLocaleString();
    fillEl.style.width = Math.min(count / 10000 * 100, 100) + '%';
  })
  .catch(err => {
    const countEl = document.getElementById('petitionCount');
    if (countEl) countEl.textContent = PETITION_COUNT_FALLBACK;
    if (window.Sentry) {
      Sentry.captureException(err, { tags: { feature: 'signature_count' } });
    }
  });

// After page load, verify the petition count and fill actually rendered.
// Catches silent failures (renamed IDs, script never reached the update line,
// blocked asset) that the fetch error handler above can't see.
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.Sentry) return;
    const countEl = document.getElementById('petitionCount');
    const fillEl = document.getElementById('petitionFill');
    const countText = countEl ? countEl.textContent.trim() : '';
    const fillWidth = fillEl ? fillEl.style.width : '';
    const countRendered = countText && countText !== PETITION_COUNT_FALLBACK;
    const fillRendered = fillWidth && parseFloat(fillWidth) > 0;
    if (!countRendered) {
      Sentry.captureMessage('Petition count not rendered', {
        level: 'warning',
        tags: { feature: 'signature_count', check: 'render_count' },
        extra: {
          countElementPresent: !!countEl,
          countText,
        },
      });
    }
    if (!fillRendered) {
      Sentry.captureMessage('Petition fill not rendered', {
        level: 'warning',
        tags: { feature: 'signature_count', check: 'render_fill' },
        extra: {
          fillElementPresent: !!fillEl,
          fillWidth,
        },
      });
    }
  }, 5000);
});