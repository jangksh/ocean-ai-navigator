// Language URL router for AI-OCEAN.
// Korean pages stay at the current path. English lives under /en/.
// Spanish lives under /es/, including /es/types/{code}/ and /es/privacy/.
// ?lang=en|ko|es on a mismatched URL client-side redirects to the paired path,
// preserving every other query param (start, job, UTM, internal) and the hash.
// Returning visitors with a saved ocean_lang of "en" or "es" who land on "/"
// are sent to /en/ or /es/. First-time visitors stay on the requested URL —
// language follows the path (/, /en/, /es/), with a small dismissible hint
// if the browser language is a different site language. ?lang=en|ko|es is
// treated as an explicit choice and is saved. Known crawlers are never
// redirected, so each language homepage stays crawlable; hreflang x-default
// is English.
(function (root) {
  var SITE = 'https://thepersonalityai.com';
  var PREFIX = { en: '/en', es: '/es' };

  // Posts that are not translations of each other: send the visitor to the
  // language index instead of inventing a fake alternate URL.
  var UNPAIRED = {
    '/blog/sbti-vs-bigfive-ocean/': { en: '/en/blog/', ko: '/blog/sbti-vs-bigfive-ocean/', es: '/es/' },
    '/blog/mbti-vs-bigfive-ocean/': { en: '/en/blog/', ko: '/blog/mbti-vs-bigfive-ocean/', es: '/es/' },
    '/blog/free-personality-test-career-bigfive/': { en: '/en/blog/', ko: '/blog/free-personality-test-career-bigfive/', es: '/es/' },
    '/en/blog/interpret-big-five-scores/': { en: '/en/blog/interpret-big-five-scores/', ko: '/blog/', es: '/es/' },
    '/blog/big-five-personality-test-for-careers/': { en: '/en/blog/big-five-personality-test-for-careers/', ko: '/blog/', es: '/es/' },
    // No Spanish teams page yet — send es to the English inquiry page.
    '/teams/': { en: '/en/teams/', ko: '/teams/', es: '/en/teams/' },
    '/en/teams/': { en: '/en/teams/', ko: '/teams/', es: '/en/teams/' }
  };

  var CRAWLER_UA = /Googlebot|AdsBot-Google|Mediapartners-Google|Google-InspectionTool|bingbot|BingPreview|Yandex(Bot|Images)?|Baiduspider|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|Bytespider|GPTBot|ClaudeBot|CCBot|anthropic-ai|ChatGPT-User|meta-externalagent/i;

  function isCrawler(ua) {
    return CRAWLER_UA.test(String(ua || ''));
  }

  function browserLang(nav) {
    nav = nav || (typeof navigator !== 'undefined' ? navigator : null);
    if (!nav) return '';
    var lang = nav.language || (nav.languages && nav.languages[0]) || '';
    return String(lang || '');
  }

  function isKoreanBrowser(nav) {
    return /^ko(-|$)/i.test(browserLang(nav));
  }

  function normPath(pathname) {
    var p = String(pathname || '/');
    if (!p) p = '/';
    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') p += '/';
    if (p === '/index.html' || p === '/index.htm') p = '/';
    if (p === '/en/index.html' || p === '/en/index.htm') p = '/en/';
    if (p === '/es/index.html' || p === '/es/index.htm') p = '/es/';
    return p;
  }

  function pathLang(pathname) {
    var p = normPath(pathname);
    if (p === '/es/' || p.indexOf('/es/') === 0) return 'es';
    if (p === '/en/' || p.indexOf('/en/') === 0) return 'en';
    return 'ko';
  }

  function isKoreanHome(pathname) {
    return normPath(pathname) === '/';
  }

  function stripLangPrefix(p) {
    p = normPath(p);
    if (p === '/en/' || p === '/es/') return '/';
    if (p.indexOf('/en/') === 0) return p.slice(3) || '/';
    if (p.indexOf('/es/') === 0) return p.slice(3) || '/';
    return p;
  }

  function addLangPrefix(rest, toLang) {
    rest = normPath(rest);
    if (toLang === 'ko' || !PREFIX[toLang]) return rest;
    // There is no Spanish blog yet — send those paths to the Spanish home.
    if (toLang === 'es') {
      if (rest.indexOf('/blog/') === 0) {
        return '/es/';
      }
    }
    return PREFIX[toLang] + (rest === '/' ? '/' : rest);
  }

  function pairPath(pathname, toLang) {
    var p = normPath(pathname);
    var unpaired = UNPAIRED[p];
    if (unpaired && unpaired[toLang]) return unpaired[toLang];
    var current = pathLang(p);
    if (current === toLang) return p;
    var rest = stripLangPrefix(p);
    var unpairedRest = UNPAIRED[rest];
    if (unpairedRest && unpairedRest[toLang]) return unpairedRest[toLang];
    return addLangPrefix(rest, toLang);
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

  function maybeRedirect(loc, storage, nav) {
    loc = loc || (typeof location !== 'undefined' ? location : null);
    if (!loc) return null;
    var langParam = null;
    try {
      langParam = new URLSearchParams(loc.search || '').get('lang');
    } catch (e) {}
    var current = pathLang(loc.pathname);
    var dest = null;

    if (langParam === 'en' || langParam === 'ko' || langParam === 'es') {
      try {
        var store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
        if (store && store.setItem) store.setItem('ocean_lang', langParam);
      } catch (e) {}
      if (langParam !== current) dest = pairUrl(langParam, loc);
    } else if (!langParam && isKoreanHome(loc.pathname)) {
      var stored = null;
      try {
        stored = (storage || (typeof localStorage !== 'undefined' ? localStorage : null));
        stored = stored && stored.getItem('ocean_lang');
      } catch (e) { stored = null; }
      if (stored === 'en' || stored === 'es') {
        dest = pairUrl(stored, loc);
      }
      // First-time visitors (no saved preference) stay on the requested
      // path. Language follows the URL; a small hint may offer a switch.
      // Crawlers are also left in place.
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
    // Do not write ocean_lang from the URL path. First-time visitors should
    // not get a saved preference until they choose a language (switcher,
    // hint, or ?lang=).
    return false;
  }

  function hasLangPreference(storage) {
    try {
      var store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
      var v = store && store.getItem && store.getItem('ocean_lang');
      return v === 'en' || v === 'ko' || v === 'es';
    } catch (e) { return false; }
  }

  function siteLangFromBrowser(nav) {
    var lang = browserLang(nav).toLowerCase();
    if (/^ko(-|$)/.test(lang)) return 'ko';
    if (/^es(-|$)/.test(lang)) return 'es';
    if (/^en(-|$)/.test(lang)) return 'en';
    return '';
  }

  root.oceanPathLang = pathLang;
  root.oceanPairPath = pairPath;
  root.oceanPairUrl = pairUrl;
  root.oceanMaybeRedirect = maybeRedirect;
  root.oceanNormPath = normPath;
  root.oceanIsCrawler = isCrawler;
  root.oceanBrowserSiteLang = siteLangFromBrowser;
  root.oceanHasLangPreference = hasLangPreference;
  root.OCEAN_SITE = SITE;

  if (typeof location !== 'undefined' && root === (typeof window !== 'undefined' ? window : root)) {
    apply();
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
