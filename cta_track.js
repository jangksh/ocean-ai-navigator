// Shared CTA click tracking for type and blog pages (home uses the in-page handler).
(function () {
  function track(name, params) {
    try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {}
  }
  function isBlog() { return /\/blog(\/|$)/.test(location.pathname); }
  function isType() { return /\/types\//.test(location.pathname); }
  function utmContent(el) {
    try { return new URL(el.href, location.href).searchParams.get('utm_content') || ''; } catch (e) { return ''; }
  }
  function ctaPosition(el) {
    var marked = el.closest('[data-cta-position]');
    if (marked && marked.getAttribute('data-cta-position')) {
      var pos = marked.getAttribute('data-cta-position');
      if (pos.indexOf('type_') === 0 || pos.indexOf('blog_') === 0) return pos;
      if (isType()) return pos.indexOf('type_') === 0 ? pos : 'type_' + pos;
      if (isBlog()) return pos.indexOf('blog_') === 0 ? pos : 'blog_' + pos;
      return pos;
    }
    var content = utmContent(el);
    var inNav = !!(el.closest('nav') || el.closest('.site-header'));
    if (isType()) {
      if (content === 'header' || (inNav && content === '')) return 'type_nav';
      if (content === 'hero') return 'type_hero';
      if (content === 'top') return 'type_top';
      if (content === 'bottom') return 'type_bottom';
      return 'type_page';
    }
    if (isBlog()) {
      if (content === 'header' || (inNav && (content === '' || !content))) return 'blog_nav';
      if (content === 'hero') return 'blog_hero';
      if (content === 'top') return 'blog_top';
      if (content === 'bottom' || content === 'end') return 'blog_bottom';
      if (content === 'blog_index') return 'blog_index';
      return 'blog_inline';
    }
    return content || 'unknown';
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[href*="start=1"]');
    if (!a) return;
    var params = { cta_position: ctaPosition(a) };
    // Modifier / middle / new-tab clicks leave this page open, so gtag's
    // ~5s event batch can still be sent. Do not block those navigations.
    var plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
      (!a.target || a.target === '_self') && !e.defaultPrevented;
    if (!plain) {
      track('cta_click', params);
      return;
    }
    // A plain left click navigates away immediately. gtag queues events for
    // about 5s and fires event_callback when the event is queued, not when
    // the collect request is sent, so the hit is lost on navigation. Hold
    // the click, flush gtag's pagehide listeners while this page is still
    // alive, then go.
    e.preventDefault();
    var href = a.href;
    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      location.href = href;
    };
    track('cta_click', params);
    setTimeout(function () {
      try { window.dispatchEvent(new Event('pagehide')); } catch (err) {}
    }, 0);
    setTimeout(go, 200);
  }, true);
})();
