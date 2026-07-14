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
})();
