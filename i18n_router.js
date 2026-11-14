// Language URL router for AI-OCEAN.
// Korean pages stay at the current path. English lives under /en/.
// ?lang=en|ko on a mismatched URL client-side redirects to the paired path,
// preserving every other query param (start, job, UTM, internal) and the hash.
(function (root) {
  var SITE = 'https://thepersonalityai.com';

  // Posts that are not translations of each other: send the visitor to the
  // language index instead of inventing a fake alternate URL.
  var UNPAIRED = {
    '/blog/mbti-vs-bigfive-ocean/': { en: '/en/blog/', ko: '/blog/mbti-vs-bigfive-ocean/' },
    '/blog/big-five-personality-test-for-careers/': { en: '/blog/big-five-personality-test-for-careers/', ko: '/blog/' }
  };

  function normPath(pathname) {
    var p = String(pathname || '/');
    if (!p) p = '/';
    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') p += '/';
    if (p === '/index.html' || p === '/index.htm') p = '/';
    if (p === '/en/index.html' || p === '/en/index.htm') p = '/en/';
    return p;
  }

  function pathLang(pathname) {
    var p = normPath(pathname);
    return (p === '/en/' || p.indexOf('/en/') === 0) ? 'en' : 'ko';
  }

  function isKoreanHome(pathname) {
    var p = normPath(pathname);
    return p === '/';
  }

  function pairPath(pathname, toLang) {
    var p = normPath(pathname);
    var unpaired = UNPAIRED[p];
    if (unpaired && unpaired[toLang]) return unpaired[toLang];
    var current = pathLang(p);
    if (current === toLang) return p;
    if (toLang === 'en') {
      if (p === '/') return '/en/';
      return '/en' + p;
    }
    if (p === '/en/') return '/';
    if (p.indexOf('/en/') === 0) {
      var rest = p.slice(3);
      return rest || '/';
    }
    return p;
  }

  function withSearch(path, search, hash, dropLang) {
    var qs = String(search || '');
    if (qs.charAt(0) === '?') qs = qs.slice(1);
    var params;
    try { params = new URLSearchParams(qs); } catch (e) { params = null; }
    if (params) {
      if (dropLang) params.delete('lang');
      qs = params.toString();
    }
    return path + (qs ? '?' + qs : '') + (hash || '');
  }

  function pairUrl(toLang, loc) {
    loc = loc || (typeof location !== 'undefined' ? location : { pathname: '/', search: '', hash: '' });
    return withSearch(pairPath(loc.pathname, toLang), loc.search, loc.hash, true);
  }

  function maybeRedirect(loc, storage) {
    loc = loc || (typeof location !== 'undefined' ? location : null);
    if (!loc) return null;
    var langParam = null;
    try {
      langParam = new URLSearchParams(loc.search || '').get('lang');
    } catch (e) {}
    var current = pathLang(loc.pathname);
    var dest = null;

    if (langParam === 'en' || langParam === 'ko') {
      if (langParam !== current) dest = pairUrl(langParam, loc);
    } else if (!langParam && isKoreanHome(loc.pathname)) {
      var stored = null;
      try {
        stored = (storage || (typeof localStorage !== 'undefined' ? localStorage : null));
        stored = stored && stored.getItem('ocean_lang');
      } catch (e) { stored = null; }
      // Returning English users who bookmarked "/" land on /en/. Crawlers have
      // no localStorage, so the Korean homepage stays the default document.
      if (stored === 'en') dest = pairUrl('en', loc);
    }

    if (dest) {
      var here = (loc.pathname || '') + (loc.search || '') + (loc.hash || '');
      if (dest !== here && dest !== (loc.pathname + loc.search + loc.hash)) return dest;
    }
    return null;
  }

  function apply() {
    root.OCEAN_PATH_LANG = pathLang(root.location && root.location.pathname);
    var dest = maybeRedirect(root.location);
    if (dest && typeof root.location !== 'undefined' && root.location.replace) {
      root.location.replace(dest);
      return true;
    }
    try {
      if (root.OCEAN_PATH_LANG) localStorage.setItem('ocean_lang', root.OCEAN_PATH_LANG);
    } catch (e) {}
    return false;
  }

  root.oceanPathLang = pathLang;
  root.oceanPairPath = pairPath;
  root.oceanPairUrl = pairUrl;
  root.oceanMaybeRedirect = maybeRedirect;
  root.oceanNormPath = normPath;
  root.OCEAN_SITE = SITE;

  if (typeof location !== 'undefined' && root === (typeof window !== 'undefined' ? window : root)) {
    apply();
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
