/* Standalone Ledger site: scroll reveal + email capture (no concept switcher). */

(function () {
  // ---- scroll reveal ----
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- email capture (prototype: no backend) ----
  document.querySelectorAll('form[data-capture]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value || !input.checkValidity()) {
        if (input) input.reportValidity();
        return;
      }
      const done = document.createElement('p');
      done.className = 'capture-done';
      done.setAttribute('role', 'status');
      done.textContent = form.dataset.done || "You're on the list.";
      form.replaceWith(done);
    });
  });

  // ---- cinematic opening: dim the fixed hero as the register scrolls over it ----
  const heroOverlay = document.querySelector('.reg-hero-overlay');
  if (heroOverlay && window.matchMedia('(min-width: 1001px)').matches) {
    let ticking = false;
    const dim = function () {
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      heroOverlay.style.opacity = (p * 0.6).toFixed(3);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(dim); }
    }, { passive: true });
    dim();
  }

  // ---- mobile sticky hero: offset main by the fixed hero's height ----
  // The hero is position:fixed on mobile (≤1000px), so main needs an explicit
  // margin-top equal to the hero's rendered height. Recompute on resize/load
  // since the hero height changes with viewport (image scales with vw/vh).
  (function () {
    if (!window.matchMedia('(max-width: 1000px)').matches) return;
    const head = document.querySelector('.reg-head');
    const main = document.querySelector('main');
    if (!head || !main) return;
    let ticking = false;
    const offset = function () {
      main.style.marginTop = head.offsetHeight + 'px';
      ticking = false;
    };
    const schedule = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(offset); }
    };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    window.addEventListener('orientationchange', schedule, { passive: true });
    // hero images affect height; recompute as each one loads
    head.querySelectorAll('img').forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', schedule, { once: true });
      img.addEventListener('error', schedule, { once: true });
    });
    schedule();
  })();

  // ---- ledger row preview (desktop flourish; the aside is hidden on mobile) ----
  const preview = document.getElementById('ledger-preview');
  const previewAside = document.querySelector('.register-preview');
  // Keep --aside-half (half the aside's measured height) in sync with the
  // CSS `top: calc(50% - var(--aside-half))` rule. This is what centers the
  // sticky preview vertically AND makes it release exactly when its bottom
  // edge meets the last ledger row's bottom (the containing-block bottom).
  // Recompute on resize and on hover, since gaining/losing the caption's
  // status line changes the aside height by ~16px.
  var syncAsideHalf = function () {
    if (!previewAside) return;
    previewAside.style.setProperty(
      '--aside-half',
      (previewAside.offsetHeight / 2) + 'px'
    );
  };
  if (previewAside) {
    syncAsideHalf();
    window.addEventListener('resize', syncAsideHalf);
  }
  if (preview) {
    const img = preview.querySelector('img');
    const fallback = preview.querySelector('.preview-fallback');
    const fallbackNum = preview.querySelector('.preview-fallback .numeral');
    const capTitle = document.querySelector('.preview-cap-title');
    const capStatus = document.querySelector('.preview-cap-status');
    const capTitleDefault = capTitle ? capTitle.textContent : '';
    document.querySelectorAll('.ledger-row[data-part]').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        const src = row.dataset.img;
        if (src) {
          img.src = src;
          img.hidden = false;
          fallback.hidden = true;
        } else {
          img.hidden = true;
          fallback.hidden = false;
          const n = row.dataset.part;
          fallbackNum.innerHTML =
            '<span class="lead">' + n.charAt(0) + '</span>' +
            (n.length > 1 ? '<span class="tail">' + n.slice(1) + '</span>' : '');
        }
        // caption reflects the hovered entry: its title + status
        const titleEl = row.querySelector('.lg-title');
        const statusEl = row.querySelector('.lg-status');
        if (capTitle && titleEl) capTitle.textContent = titleEl.textContent;
        if (capStatus) {
          capStatus.textContent = statusEl ? statusEl.textContent : '';
          const state = statusEl
            ? Array.prototype.filter.call(statusEl.classList, function (c) { return c.indexOf('st-') === 0; }).join(' ')
            : '';
          capStatus.className = 'preview-cap-status' + (state ? ' ' + state : '');
        }
        preview.classList.add('is-active');
        syncAsideHalf();
      });
      row.addEventListener('mouseleave', function () {
        preview.classList.remove('is-active');
        if (capTitle) capTitle.textContent = capTitleDefault;
        if (capStatus) { capStatus.textContent = ''; capStatus.className = 'preview-cap-status'; }
        syncAsideHalf();
      });
    });
  }
})();
