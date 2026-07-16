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

  // ---- ledger row preview (desktop flourish; the aside is hidden on mobile) ----
  const preview = document.getElementById('ledger-preview');
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
      });
      row.addEventListener('mouseleave', function () {
        preview.classList.remove('is-active');
        if (capTitle) capTitle.textContent = capTitleDefault;
        if (capStatus) { capStatus.textContent = ''; capStatus.className = 'preview-cap-status'; }
      });
    });
  }
})();
