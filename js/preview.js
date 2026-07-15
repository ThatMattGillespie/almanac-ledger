/* Preview surface controller for the comparison mockups.
   Desktop (hover): row mouseenter cross-fades the sticky side preview.
   Mobile (scroll): the row crossing the viewport's focus band drives a
   sticky top preview. Approach 2 also expands a write-up + CTA on click. */

(function () {
  var stage = document.querySelector('.lg-stage');
  if (!stage) return;

  var frame = document.querySelector('.lg-preview-frame');
  var imgs = frame ? frame.querySelectorAll('.lg-preview-img') : [];
  var capTitle = document.querySelector('.lg-preview-title');
  var capS = document.querySelector('.lg-preview-status');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.lg-row'));
  if (!frame || imgs.length < 2) return;

  var buf = 0;
  imgs[0].classList.add('is-active');
  var curCover = imgs[0].getAttribute('src');

  function setPreview(cover, title, status, veil) {
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
    if (capTitle) capTitle.textContent = title || '';
    if (capS) capS.textContent = status || '';
    frame.classList.toggle('is-veiled', !!veil);
  }

  function dataFor(r) {
    return {
      cover: r.dataset.cover,
      title: r.dataset.vtitle,
      status: r.dataset.vstatus,
      veil: r.dataset.veil === '1'
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
          var d = dataFor(e.target);
          setPreview(d.cover, d.title, d.status, d.veil);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    rows.forEach(function (r) { io.observe(r); });
  }

  // Approach 2: expand a write-up + CTA on click (open rows only)
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
