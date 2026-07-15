/* Preview surface controller (Approach 1, refined).
   Scroll drives everything: whichever row sits in the viewport's focus band
   becomes .is-focus and swings the cover + its one-line preview into the panel.
   Desktop  = sticky side panel (cover, sentence, status, CTA arrow).
   Mobile   = sticky top band (cover only); the focused row expands its sentence.
   Approach 2 (superseded) still expands a write-up + CTA on click. */

(function () {
  var stage = document.querySelector('.lg-stage');
  if (!stage) return;

  var frame = document.querySelector('.lg-preview-frame');
  var imgs = frame ? frame.querySelectorAll('.lg-preview-img') : [];
  var capDesc = document.querySelector('.lg-preview-desc');
  var capStatus = document.querySelector('.lg-preview-status');
  var cta = document.querySelector('.lg-preview-cta');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.lg-row'));
  if (!frame || imgs.length < 2) return;

  var buf = 0;
  imgs[0].classList.add('is-active');
  var curCover = imgs[0].getAttribute('src');

  function setCover(cover, veil) {
    if (cover && cover !== curCover) {
      var nextIdx = 1 - buf;
      var next = imgs[nextIdx];
      var done = false;   // guard: complete-check and onload must not both run
      var show = function () {
        if (done) return;
        done = true;
        next.onload = null;
        next.classList.add('is-active');
        imgs[buf].classList.remove('is-active');
        buf = nextIdx;
      };
      next.onload = show;
      next.src = cover;
      if (next.complete) show();
      curCover = cover;
    }
    frame.classList.toggle('is-veiled', !!veil);
  }

  function setPreview(d) {
    setCover(d.cover, d.veil);
    if (capDesc) capDesc.textContent = d.desc || '';
    if (capStatus) capStatus.textContent = d.status || '';
    if (cta) {
      if (d.href) {
        cta.setAttribute('href', d.href);
        cta.hidden = false;
      } else {
        cta.hidden = true;
        cta.removeAttribute('href');
      }
    }
  }

  function dataFor(r) {
    var descEl = r.querySelector('.lg-desc');
    return {
      cover: r.dataset.cover,
      desc: descEl ? descEl.textContent.trim() : '',
      status: r.dataset.vstatus,
      veil: r.dataset.veil === '1',
      href: r.tagName === 'A' ? r.getAttribute('href') : (r.dataset.href || null)
    };
  }

  // One model on every screen: scroll position drives the preview. Whichever
  // row sits in the viewport's focus band becomes .is-focus and swings the
  // cover, so nobody has to hover or click just to browse.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          rows.forEach(function (r) { r.classList.remove('is-focus'); });
          e.target.classList.add('is-focus');
          setPreview(dataFor(e.target));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    rows.forEach(function (r) { io.observe(r); });
  }

  // Approach 2 (superseded): expand a write-up + CTA on click (open rows only)
  if (document.body.classList.contains('approach-2')) {
    document.querySelectorAll('.lg-row.is-open').forEach(function (r) {
      r.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;   // let the CTA navigate
        var open = r.classList.toggle('is-expanded');
        r.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      r.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          r.click();
        }
      });
    });
  }
})();
