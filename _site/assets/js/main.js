// Marcelo Lopez Lopez — light interactivity only. No framework, no build step.
(function () {
  'use strict';

  // Mobile menu toggle
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Reveal-on-scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Footer year (keeps copyright current without redeploys)
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Live Google reviews (Featurable JSON API) -----------------------
  // Progressive enhancement: the page ships a curated wall server-side; if the
  // widget id is set and the fetch succeeds, we swap in live Google reviews,
  // rendered in the site's own card design. On any failure we keep the wall.
  var list = document.getElementById('reviews-list');
  var widgetId = list && list.getAttribute('data-featurable-widget');
  if (list && widgetId) {
    fetch('https://api.featurable.com/v1/widgets/' + widgetId)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (data) {
        var reviews = (data && data.reviews) || [];
        if (!reviews.length) return;

        var summary = document.querySelector('[data-reviews-summary]');
        if (summary) {
          var avg = data.averageRating ? Number(data.averageRating) : 5;
          var count = data.totalReviewCount || reviews.length;
          summary.innerHTML =
            '<span class="big">' + avg.toFixed(1) + '</span>' +
            '<span class="stars" aria-hidden="true">' + starRow(Math.round(avg)) + '</span>' +
            '<span>from ' + count + ' Google review' + (count === 1 ? '' : 's') + '</span>';
        }

        list.innerHTML = reviews.map(reviewCard).join('');
      })
      .catch(function () { /* keep the curated fallback already in the DOM */ });
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  function starRow(n) {
    var out = '';
    for (var i = 0; i < 5; i++) {
      out += i < n ? '&#9733;' : '<span style="color:var(--line);">&#9733;</span>';
    }
    return out;
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function googleG() {
    return '<svg class="review-g" width="18" height="18" viewBox="0 0 24 24" aria-label="Google review" role="img">' +
      '<path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8z"/>' +
      '<path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.3-1.9-6.2-4.6H2.2v2.8A11 11 0 0 0 12 23z"/>' +
      '<path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8z"/>' +
      '<path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/>' +
      '</svg>';
  }

  function reviewCard(rv) {
    var reviewer = rv.reviewer || {};
    var name = esc(reviewer.displayName || 'Google user');
    var rating = Number(rv.starRating) || 5;
    var comment = esc(rv.comment || '');
    var date = fmtDate(rv.createTime);
    var avatar = reviewer.profilePhotoUrl
      ? '<img class="review-avatar" src="' + esc(reviewer.profilePhotoUrl) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<span class="review-avatar review-avatar--initial">' + name.charAt(0) + '</span>';

    return '<figure class="review-card reveal is-visible">' +
      '<div class="review-head">' + avatar +
        '<div><strong style="color:var(--ink);">' + name + '</strong>' +
        '<div class="stars" aria-label="' + rating + ' out of 5 stars">' + starRow(rating) + '</div></div>' +
        googleG() +
      '</div>' +
      (comment ? '<blockquote class="review-quote">&ldquo;' + comment + '&rdquo;</blockquote>' : '') +
      (date ? '<figcaption class="review-date mt-3">' + date + '</figcaption>' : '') +
      '</figure>';
  }
})();
