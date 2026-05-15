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
})();

// Fetch petition count, set the number, and let CSS animate the bar to width.
fetch('/petition-count.json')
  .then(r => r.json())
  .then(data => {
    const count = Number(data.signature_count) || 0;
    document.getElementById('petitionCount').textContent = count.toLocaleString();
    document.getElementById('petitionFill').style.width =
      Math.min(count / 10000 * 100, 100) + '%';
  })
  .catch(() => {
    document.getElementById('petitionCount').textContent = '—';
  });