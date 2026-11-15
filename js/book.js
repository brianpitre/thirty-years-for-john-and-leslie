/* ============================================================
   THIRTY YEARS · FOR JOHN & LESLIE — the book

   One book; scrolling (or the arrows, or the arrow keys) turns its pages.
   On a phone or tablet nothing scrolls: a swipe left or right turns the page,
   and the page follows the finger.
   Desktop = open spreads · small screens = one page at a time
   Reduced motion or ?flat=1 = the book laid flat, spread by spread.

   The mechanics are the Zoe book's (Archive/Zoe Conference 2026/.../book-site),
   with three additions: the book comes to rest on a whole page (it never sits
   half-turned), arrows and keys turn one page at a time, and leaves far from
   the open page are taken out of the scene so a 45-page book stays light.

   All words, photos and links live in js/content.js.
   ============================================================ */
(function () {
  'use strict';

  var B = window.BOOK || { copy: {}, chapters: [], people: [] };
  var C = B.copy || {};

  var flat = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /[?&]flat=1/.test(window.location.search);   // ?flat=1 forces the laid-flat book (QA / accessibility)

  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* a locked-down frame */ }
  window.scrollTo(0, 0);

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* "Thirty *Years*" -> the starred words in the guide's italic accent */
  function rich(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  function plain(s) { return String(s == null ? '' : s).replace(/\*/g, ''); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  /* '12:34' / '1:02:16' / 754 -> seconds; '' or nonsense -> null ('0:00' is a real time) */
  function seconds(t) {
    if (t == null || t === '') return null;
    if (typeof t === 'number') return isFinite(t) && t >= 0 ? Math.floor(t) : null;
    var parts = String(t).trim().split(':');
    if (!parts.length || parts.length > 3) return null;
    var total = 0;
    for (var i = 0; i < parts.length; i++) {
      if (!/^\d+(\.\d+)?$/.test(parts[i])) return null;
      total = total * 60 + parseFloat(parts[i]);
    }
    return Math.floor(total);
  }

  /* ---------- Loader: lift it once the fonts are in ---------- */
  var loader = document.getElementById('loader');
  function dismissLoader() { if (loader) loader.classList.add('is-done'); }
  setTimeout(dismissLoader, 2600);   // never hold the book hostage to a slow font

  /* ============================================================
     CONTENT — every page of the book, built from js/content.js
     ============================================================ */
  var ARROW = '<svg viewBox="0 0 42 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6h39M35 1.5 40 6l-5 4.5"/></svg>';

  /* a photo as a card, with the name on a label at its lower left. The label carries the name only:
     John and Leslie know who each of these people is to them (Brian, 13 Nov).
     The card is 3:2, a window on the 2:1 picture (Brian, 14 Nov: the photos may be "cropped more"; a
     square would cut one of a couple out of three of them, and a couple is always together). `focus`
     in content.js says where that window sits across the picture: 0 its left edge, 100 its right.
     (No decoding="async": a page that comes back into the scene must paint its photo with it, not a
     frame later.) */
  function shot(p) {
    var fx = p.focus == null || isNaN(Number(p.focus)) ? 50 : clamp(Number(p.focus), 0, 100);
    return '<figure class="shot">' +
      '<div class="shot__card"><img src="images/people/' + esc(p.photo) + '.jpg" width="1600" height="800" alt="' + esc(p.name) +
      '" style="object-position:' + fx + '% 50%"></div>' +
      '<figcaption class="plate"><span class="plate__name">' + esc(p.name) + '</span></figcaption>' +
      '</figure>';
  }

  /* THE FILM'S TITLE COLOURS (Brian, 14 Nov: "use the colors that were used for the title animation so
     that the colors coordinate with the video title"). The film's titles come in five combinations of
     the guide's colours, dealt 1, 2, 3, 4, 5, 1, ... by each person's place in the book (John and
     Leslie Film Graphics/title-options.html: COMBOS, combo=auto). A person's quote page and the label
     on their photo take the same one (book.css: .tone--*). `combo: 3` on a person in content.js
     overrides the deal, for the day the film's order differs from the book's. */
  /* (in the book the first is the page's own cream and the second Coffee Bean, where the film has
     paper and olive: book.css says why) */
  var TONES = ['cream', 'coffee', 'mustard', 'sage', 'orange'];
  function toneOf(p) {
    var c = parseInt(p.combo, 10), i = Math.max(0, (B.people || []).indexOf(p));
    return TONES[c >= 1 && c <= 5 ? c - 1 : i % 5];
  }

  /* The film's own address, opening at `start` seconds: what a plain link needs (a YouTube or Vimeo
     page, or a file). A start of 0 is SAID (?t=0), never left off: a link with no time lets YouTube
     pick the film up where that viewer last stopped (Brian, 15 Nov, of page 44's button: "specify the
     start at 0:00 so that the linked video does not automatically pick up where it last played"). With
     t=0 YouTube's own page carries a start of 0 seconds, as it does for any other time; with no t it
     carries none (read from the page that day). No start at all (null), or a link of another kind:
     the address as it is. */
  function timedUrl(url, start) {
    var m, at = start != null && start >= 0 ? Math.floor(start) : null;
    if (at == null) return url;
    if ((m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/))([\w-]{11})/i))) {
      return 'https://youtu.be/' + m[1] + '?t=' + at;
    }
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-z]+))?/i))) {
      return 'https://vimeo.com/' + m[1] + (m[2] ? '/' + m[2] : '') + '#t=' + at + 's';
    }
    if (/\.(mp4|m4v|webm|mov)([?#]|$)/i.test(url)) return url.replace(/#.*$/, '') + '#t=' + at;
    return url;
  }
  /* How a Watch link opens the film (content.js: filmOpens):
       'over'  it plays over the book, in the site's own player
       'tab'   a plain link to the film itself, at that person's time, in a new tab
       'link'  the same link, with nothing said about where it opens: the artifact copy (its build
               sets this). An artifact may not show another site inside itself, and its frame may
               not open a tab or a window of its own (target="_blank" and window.open do nothing
               there): its viewer takes a plain link and opens it outside the page. */
  var FILM_OPENS = B.filmOpens === 'tab' || B.filmOpens === 'link' ? B.filmOpens : 'over';

  /* the Watch link: live when it has a link, "coming soon" until then.
     `start` (seconds) opens the film at that person's place in it.
     (the label's last letter is set apart: book.css takes its letter-spacing off, or the hairline
     under the line would run on past it) */
  function watchBtn(url, label, soon, title, big, start) {
    var cls = 'watch' + (big ? ' watch--big' : '');
    function inner(text) {
      text = String(text);
      return '<span class="watch__in"><i class="play" aria-hidden="true"></i><span class="watch__label">' +
        esc(text.slice(0, -1)) + '<span class="watch__end">' + esc(text.slice(-1)) + '</span></span></span>';
    }
    if (url && FILM_OPENS !== 'over') {
      return '<a class="' + cls + ' js-film-link" href="' + esc(timedUrl(url, start)) + '"' +
        (FILM_OPENS === 'tab' ? ' target="_blank" rel="noopener"' : '') +
        ' data-film="' + esc(url) + '"' + (start != null ? ' data-start="' + start + '"' : '') +
        ' aria-label="' + esc(label + ': ' + title + (FILM_OPENS === 'tab' ? ' (opens in a new tab)' : ' (opens the film’s own page)')) + '">' +
        inner(label) + '</a>';
    }
    if (url) {
      return '<a class="' + cls + ' js-watch" href="' + esc(url) + '" data-title="' + esc(title) + '"' +
        (start != null ? ' data-start="' + start + '"' : '') + '>' + inner(label) + '</a>';
    }
    return '<span class="' + cls + ' watch--soon">' + inner(soon) + '</span>';
  }

  /* the display size for a quote of this length, on a page to itself (Brian, 14 Nov: "it's fine if
     the quotes are larger in size, since they'll sit on a page alone"); js then shrinks any that
     still overflow */
  function quoteSize(q) {
    var n = plain(q).length;
    return n <= 48 ? 4.3 : n <= 74 ? 3.8 : n <= 98 ? 3.3 : n <= 120 ? 2.95 : 2.65;
  }
  /* Who says the line: their first name stands under EVERY quote (Brian, 14 Nov: "add the first name
     for each quote, even if it's just one person": one page at a time the quote is seen without
     the photo, and nothing said whose it was). For a couple content.js says which of them (`by`);
     for one person it is the first name from `name`, with the title if there is one ("Pastor Don"). */
  function speaker(p) {
    if (p.by) return String(p.by);
    var m = String(p.name == null ? '' : p.name).match(/^((?:Pastors?|Ps\.?|Dr\.?)\s+)?(\S+)/i);
    return m ? (m[1] || '') + m[2] : '';
  }
  /* A quotation's opening mark hangs outside the left edge, so every line of letters starts on the
     same edge (Brian, 14 Nov, of page 3: "the letters are left-justified, but the quotation marks are
     to the left of the justification"). */
  var OPEN_MARK = '<span class="quote__open">“</span>';

  var RUNNING_HEAD = plain(C.title || 'Thirty Years') + ' · ' + (C.flourish || 'for Pastors John & Leslie');

  /* Which cover: content.js says (cover: 'names' | 'title' | 'box'); ?cover=title tries another without editing. */
  var COVER_KINDS = ['names', 'title', 'box'];
  var COVER_NAMES = { names: 'Names', title: 'Olive', box: 'Box' };     // what the "try another cover" button calls them
  var COVER_KIND = (function () {
    var q = (window.location.search.match(/[?&]cover=(names|title|box)\b/) || [])[1];
    var c = q || B.cover || 'names';
    return /^(names|title|box)$/.test(c) ? c : 'names';
  })();

  /* The rows of names (inside the cover, on the last page, and on the 'names' cover), set the way the
     anniversary art sets the locations: one line of them, over and over, each row picking it up
     somewhere else. */
  function coverRows() {
    var words = (C.coverWords && C.coverWords.length) ? C.coverWords : (B.people || []).map(function (p) {
      var w = String(p.name).replace(/^(Pastors?|Ps\.?|Dr\.?)\s+/i, '').split(' ');
      return w.length > 1 ? w.slice(0, -1).join(' ') : w[0];         // "Pete & Kristi Sciacchetano" -> "Pete & Kristi"; "Pastor Don Matheny" -> "Don"
    });
    var n = words.length, out = '';
    if (!n) return '';
    for (var r = 0; r < 40; r++) {
      var from = (r * 5) % n, line = [];
      for (var k = 0; k < Math.max(2 * n, 28); k++) line.push(words[(from + k) % n]);
      out += '<span style="margin-left:-' + (((r * 37) % 100) / 100 * 6).toFixed(2) + 'em">' + esc(line.join(' \u2022 ')) + ' \u2022</span>';
    }
    return out;
  }

  var COVER_FOR = C.coverFlourish || 'for Pastors John & Leslie';      // the flourish on the two covers that are not in use
  var COVER = {
    cls: '', chrome: 'none', label: 'Cover',       // cls is set by setCoverKind(), below
    html: function () {
      if (COVER_KIND === 'names') {
        return '<div class="cover__rows" aria-hidden="true">' + coverRows() + '</div>' +
          '<div class="cover__lockup">' +
          '<img class="cover__badge" src="images/brand/LC-1.png" width="1184" height="752" alt="The Life Church: celebrating 30 years of God\u2019s faithfulness. Established 1996.">' +
          '<svg class="cover__script" viewBox="0 0 1000 250" role="img" aria-label="' + esc(COVER_FOR) + '">' +
          '<text class="sk-shadow" x="500" y="176" text-anchor="middle" aria-hidden="true">' + esc(COVER_FOR) + '</text>' +
          '<text class="sk-top" x="500" y="176" text-anchor="middle" aria-hidden="true">' + esc(COVER_FOR) + '</text>' +
          '</svg>' +
          '</div>';
      }
      /* the chosen cover (Brian, 13 Nov): the "30 years" mark, The Life Church, the years under it. Nothing else. */
      if (COVER_KIND === 'title') {
        return '<div class="cover__stack">' +
          '<img class="cover__mark" src="images/brand/NUMBER-3.png" width="966" height="344" alt="30 years">' +
          '<p class="cover__church">' + esc(C.coverChurch || 'The Life Church') + '</p>' +
          '<p class="cover__dates">' + esc(C.coverDates || '1996–2026') + '</p>' +
          '</div>';
      }
      return '<img class="cover__badge" src="images/brand/30th-3.png" width="1168" height="742" alt="The Life Church, 30 years, established 1996">' +
        '<div class="cover__plate">' +
        '<p class="kicker">' + esc(C.kicker) + '</p>' +
        '<p class="cover__title">' + rich(C.title) + '</p>' +
        '</div>' +
        '<p class="cover__for">' + esc(COVER_FOR) + '</p>';
    }
  };
  function setCoverKind(k) {
    COVER_KIND = k;
    COVER.cls = 'pg--cover cover--' + k + (k === 'box' ? '' : ' grain');
  }
  setCoverKind(COVER_KIND);

  /* The inside of the cover, and the last page: the rows of names and nothing else (Brian, 13 Nov). */
  function namesHTML() { return '<div class="cover__rows" aria-hidden="true">' + coverRows() + '</div>'; }
  var ENDPAPER = { cls: 'pg--endpaper pg--names grain', chrome: 'none', label: '', html: namesHTML };

  var BLANK = { cls: 'pg--blank', chrome: 'none', html: function () { return ''; } };

  /* ---- the pages, in book order. PAGES[n - 1] is page n; odd pages are right-hand pages. ---- */
  var PAGES = [];
  function page(def) { def.no = PAGES.length + 1; PAGES.push(def); return def; }

  page({
    chrome: 'none', label: 'Title page', html: function () {
      return '<div class="titlepage">' +
        '<img class="titlepage__badge" src="images/brand/30th-1.png" width="1168" height="742" alt="The Life Church, 30 years, established 1996">' +
        '<p class="kicker">' + esc(C.kicker) + '</p>' +
        '<h2 class="titlepage__title">' + rich(C.title) + '</h2>' +
        '<p class="titlepage__for">' + esc(C.flourish) + '</p>' +
        '<i class="rule"></i>' +
        '<p class="titlepage__sub">' + esc(C.subtitle) + '</p>' +
        '</div>';
    }
  });

  /* page 2: the dedication, in words only (Brian, 13 Nov) */
  page({
    chrome: 'none', label: 'Dedication', html: function () {
      return '<div class="front">' +
        '<p class="front__lead">' + rich(C.dedicationLead) + '</p>' +
        '<i class="rule"></i>' +
        '<p class="front__ded">' + rich(C.dedication) + '</p>' +
        '</div>';
    }
  });

  page({
    /* (no running head and no page number here: Brian, 15 Nov, "the text at the top of page 3 can be
       removed"; on a phone it broke into two lines. Pages 1 and 2 have none either.) */
    chrome: 'none', label: 'The question', html: function () {
      return '<div class="ask">' +
        '<p class="kicker">' + esc(C.questionKicker) + '</p>' +
        '<h2 class="ask__q">' + OPEN_MARK + rich(C.question) + '”</h2>' +
        '<i class="rule"></i>' +
        (C.questionBody || []).map(function (p) { return '<p class="body">' + rich(p) + '</p>'; }).join('') +
        '<p class="kicker ask__turn"><span>Turn the page</span>' + ARROW + '</p>' +
        '</div>';
    }
  });

  var JUMPS = { cover: 0 };          // jump name -> page number (0 = the closed cover)

  /* EVERY PART AND EVERY PERSON IS A SPREAD (Brian, 14 Nov).
     A part opens on two pages of its colour: on the left its number and its title and nothing else,
     on the right who is in it, at the foot of the page.
     A person is two pages: on the left their line, alone, in the colours of their title in the film;
     on the right their photo, the label with their name, and the button to their place in the film.
     (So each part starts on a left-hand page, and one page at a time they simply follow in order.) */
  /* To try other colours on the parts without editing content.js: ?parts=mustard,orange,coffee,sage
     (one for each part, in order; a name that is not a part colour is ignored). Local only: an
     artifact's link carries no ?options. */
  var PARTS_TRY = ((window.location.search.match(/[?&]parts=([a-z,]+)/) || [])[1] || '').split(',');
  (B.chapters || []).forEach(function (ch, idx) {
    var members = (B.people || []).filter(function (p) { return p.chapter === ch.id; });
    var head = ch.part + ' · ' + plain(ch.title);
    var tried = /^(mustard|sage|olive|orange|khaki|coffee)$/.test(PARTS_TRY[idx] || '') ? PARTS_TRY[idx] : '';
    var chapCls = 'pg--chap chap--' + (tried || ch.colour || 'orange');

    var opener = page({
      cls: chapCls, chrome: 'none', label: plain(ch.title),
      html: function () {
        return '<div class="chap">' +
          '<div class="num" role="img" aria-label="' + esc(ch.part) + '"><span>' + ('0' + (idx + 1)).slice(-2) + '</span></div>' +
          '<h2 class="chap__title">' + esc(plain(ch.title)) + '</h2>' +
          (ch.lede ? '<p class="chap__lede">' + rich(ch.lede) + '</p>' : '') +
          '</div>';
      }
    });
    JUMPS[ch.id] = opener.no;

    page({
      cls: chapCls + ' pg--toc', chrome: 'none', label: plain(ch.title),
      html: function () {
        return '<div class="chap">' +
          '<ol class="chap__list" aria-label="' + esc(plain(ch.title)) + '">' + members.map(function (p) {
            return '<li><a href="#" data-jump="p-' + esc(p.id) + '">' +
              '<span class="chap__name">' + esc(p.name) + '</span>' +
              '<span class="chap__since">' + esc(p.since) + '</span>' +
              '<span class="chap__no" aria-label="page ' + p._no + '">' + p._no + '</span>' +
              '</a></li>';
          }).join('') + '</ol>' +
          '</div>';
      }
    });

    members.forEach(function (p) {
      var tone = 'tone--' + toneOf(p);
      var said = page({
        cls: 'pg--quote ' + tone, chrome: 'none', label: p.name,
        html: function () {
          return '<blockquote class="qpage">' +
            '<p class="quote" style="--q:' + quoteSize(p.quote) + 'em">' + OPEN_MARK + rich(p.quote) + '”</p>' +
            '<div class="quote__end"><i class="rule"></i><span class="quote__by">' + esc(speaker(p)) + '</span></div>' +
            '<cite class="visually-hidden">' + esc(p.name) + '</cite>' +
            '</blockquote>';
        }
      });
      page({
        cls: 'pg--person ' + tone, label: p.name, head: head, html: function () {
          var at = seconds(p.start);
          return '<div class="person">' +
            shot(p) +
            (B.pageLinks === false ? '' :
              '<div class="person__foot">' +
              watchBtn(B.filmUrl && at != null ? B.filmUrl : '', p.watchLabel || 'Watch the full answer',
                'Video coming soon', p.name, false, at) +
              '</div>') +
            '</div>';
        }
      });
      /* a link to a person, and the number beside their name in the part's list, go to their line:
         the left-hand page of their spread, and the first of their two pages one page at a time */
      p._no = said.no;
      JUMPS['p-' + p.id] = said.no;
    });
  });

  /* The closing page is a left-hand page, facing the last one. (If the count of pages ever makes it
     fall on the right, a page with the mark alone goes in before it.) */
  if (PAGES.length % 2 === 0) {
    page({ chrome: 'none', label: '', html: function () {
      return '<div class="titlepage"><img class="titlepage__badge" src="images/brand/30th-1.png" width="1168" height="742" alt=""></div>';
    } });
  }

  /* the closing words (page 44), and the button that plays the film (Brian, 13 Nov: the link goes here) */
  var WATCH = page({
    cls: 'pg--closing grain', chrome: 'none', label: plain(C.watchLabel || 'Watch the film'), html: function () {
      return '<img class="closing__mark" src="images/brand/LC-1.png" width="1184" height="752" alt="">' +
        '<p class="closing__kicker">' + esc(C.closingKicker) + '</p>' +
        '<p class="closing__line">' + esc(plain(C.closing)) + '</p>' +
        '<p class="closing__body">' + esc(plain(C.closingBody)) + '</p>' +
        /* (from 0:00, said outright: see timedUrl) */
        watchBtn(B.filmUrl, C.watchLabel || 'Watch the film', C.watchSoon || 'Film link coming soon', RUNNING_HEAD, true, 0);
    }
  });
  JUMPS.watch = WATCH.no;

  /* the last page (45; a right-hand page, it never turns): the rows of names, like the inside of the cover */
  page({ cls: 'pg--names grain', chrome: 'none', label: '', html: namesHTML });

  /* ---------- nav links, from the parts ---------- */
  (function buildNav() {
    var links = (B.chapters || []).map(function (ch) {
      return '<a href="#" data-jump="' + esc(ch.id) + '">' + esc(ch.nav || plain(ch.title)) + '</a>';
    }).join('');
    var nav = document.getElementById('navLinks');
    var menu = document.getElementById('mobileMenu');
    if (nav) nav.innerHTML = links + '<a href="#" class="nav__cta" data-jump="watch">' + esc(C.watchLabel || 'Watch the film') + '</a>';
    if (menu) menu.innerHTML = links + '<a href="#" class="mmenu__cta" data-jump="watch">' + esc(C.watchLabel || 'Watch the film') + '</a>';
  })();

  /* ============================================================
     RENDER
     ============================================================ */
  var bookWrap = document.getElementById('bookWrap');
  var scrollSection = document.getElementById('bookScroll');
  var pagerWhere = document.getElementById('pagerWhere');
  var pagerNo = document.getElementById('pagerNo');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');

  /* Trying covers (content.js: coverPicker). While the cover is undecided, a small button under the
     closed book shows the next one. A link's ?cover= cannot be used everywhere the book is shown. */
  var coverBtn = document.getElementById('coverBtn');
  var coverPicker = B.coverPicker === true && !!coverBtn;
  function coverLabel() {
    if (!coverPicker) return;
    var i = COVER_KINDS.indexOf(COVER_KIND);
    var txt = coverBtn.querySelector('span');
    if (txt) txt.textContent = 'Cover ' + (i + 1) + '/' + COVER_KINDS.length + ' · ' + COVER_NAMES[COVER_KIND];
    coverBtn.setAttribute('title', 'Show the next cover');
  }
  /* the cover's face is swapped where it lies: nothing else in the book is rebuilt */
  function swapCover(kind) {
    setCoverKind(kind);
    if (S && S.faces[0]) {
      bookWrap.setAttribute('data-cover', kind);
      S.faces[0].front.innerHTML = pageHTML(COVER, 'recto');
    }
    coverLabel();
  }
  if (coverPicker) {
    coverLabel();
    coverBtn.addEventListener('click', function () {
      swapCover(COVER_KINDS[(COVER_KINDS.indexOf(COVER_KIND) + 1) % COVER_KINDS.length]);
    });
  }

  function pageHTML(def, side) {
    var cls = 'pg pg--' + side + (def.cls ? ' ' + def.cls : '');
    if (def.chrome === 'none') return '<div class="' + cls + '">' + def.html() + '</div>';
    return '<div class="' + cls + '">' +
      '<div class="pg__head"><span>' + esc(def.head || RUNNING_HEAD) + '</span><span class="pg__folio">' + def.no + '</span></div>' +
      '<div class="pg__body">' + def.html() + '</div>' +
      '</div>';
  }

  /* Rules and pinstripes are drawn in whole device pixels, scaled with the book:
     a 1.3px stripe beats against the pixel grid and the cards shimmer. */
  function setUnits(el) {
    var em = parseFloat(getComputedStyle(el).fontSize) || 16;
    el.style.setProperty('--u', Math.max(1, Math.round(em / 17)) + 'px');
    el.style.setProperty('--rule', Math.max(2, Math.round(em * 0.115)) + 'px');
  }

  /* Shrink any quote that does not fit its page (a long line, or a small screen),
     and any part opener's list that runs past the foot of its page. */
  function fitQuotes(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.pg--quote'), function (pg) {
      var box = pg.querySelector('.qpage'), q = pg.querySelector('.quote');
      if (!box || !q) return;
      var s = 1;
      q.style.setProperty('--qs', '1');
      /* (too tall for the page, or a word too long for the line) */
      while ((box.scrollHeight > box.clientHeight + 1 || q.scrollWidth > q.clientWidth + 1) && s > 0.5) {
        s -= 0.04;
        q.style.setProperty('--qs', s.toFixed(2));
      }
    });
    Array.prototype.forEach.call(root.querySelectorAll('.pg--chap'), function (pg) {
      var box = pg.querySelector('.chap'), list = pg.querySelector('.chap__list');
      if (!box || !list) return;
      var cp = 1, cn = parseFloat(getComputedStyle(list).getPropertyValue('--cn0')) || 1, ct = 1;
      var floor = cn * 0.78;
      list.style.setProperty('--cp', cp);
      list.style.setProperty('--cn', cn);
      box.style.setProperty('--ct', ct);
      while (box.scrollHeight > box.clientHeight + 1 && (cp > 0.4 || cn > floor || ct > 0.62)) {
        if (cp > 0.4) { cp -= 0.05; list.style.setProperty('--cp', cp.toFixed(2)); }
        else if (cn > floor) { cn -= 0.03; list.style.setProperty('--cn', cn.toFixed(2)); }
        else { ct -= 0.04; box.style.setProperty('--ct', ct.toFixed(2)); }       // last resort: the heading gives way
      }
    });
  }

  /* Builds the physical book and returns its leaves' meta. */
  function buildBook(single) {
    bookWrap.classList.toggle('book-wrap--single', single);
    bookWrap.setAttribute('data-cover', COVER_KIND);
    setUnits(bookWrap);
    var html = '<div class="book" id="book">';
    html += '<div class="bshadow bshadow--right" id="shRight"><i></i></div>';
    html += '<div class="bshadow bshadow--left"><i id="shLeft"></i></div>';
    html += '<div class="board board--right grain" id="boardRight"></div>';
    /* the spine: the cloth between the two boards, seen at the shut book's left (js: setDepth) */
    html += '<div class="bspine grain" id="spine"></div>';
    /* the two stacks of pages (js draws their edges: see setDepth) */
    html += '<div class="bblock bblock--left" id="blockLeft"></div>';
    /* (the right-hand stack, with the ink rule round its rounded back at the foot of the spine) */
    html += '<div class="bstack" id="stackRight"><div class="bblock bblock--right" id="blockRight"></div><i class="bback" id="back"></i></div>';
    /* the foot of the spine, under the shut book: the ink rule round the cloth's turn (what it and
       .bback enclose is the back board and the pages themselves: setDepth) */
    html += '<div class="bfoot" id="foot"><i class="bfoot__cloth"></i></div>';

    var leaves = [];
    var last = PAGES[PAGES.length - 1];
    if (!single) {
      /* leaf 0 = cover | inside of the cover; leaf i = page 2i-1 | page 2i; the last page never turns */
      leaves.push({ front: pageHTML(COVER, 'recto'), back: pageHTML(ENDPAPER, 'verso'), cover: true });
      for (var i = 1; i <= (PAGES.length - 1) / 2; i++) {
        leaves.push({ front: pageHTML(PAGES[2 * i - 2], 'recto'), back: pageHTML(PAGES[2 * i - 1], 'verso') });
      }
    } else {
      /* one page to a leaf, its back blank. A turned leaf stays where it lands, off to the left, and a
         strip of it shows at the screen's left edge (Brian, 13 Nov: the page that was just turned
         should still be there to see). */
      leaves.push({ front: pageHTML(COVER, 'recto'), back: pageHTML(ENDPAPER, 'verso'), cover: true });
      for (var m = 0; m < PAGES.length - 1; m++) {
        leaves.push({ front: pageHTML(PAGES[m], 'recto'), back: pageHTML(BLANK, 'verso') });
      }
    }
    /* starts hidden: the timeline reveals it as the last leaf lifts */
    html += '<div class="page-static" style="visibility:hidden">' + pageHTML(last, 'recto') + '</div>';

    leaves.forEach(function (leaf, i) {
      /* Back faces start visibility:hidden: backface-visibility alone is not honoured
         mid-animation by every engine; the timeline swaps faces at the edge-on moment. */
      html += '<div class="leaf' + (leaf.cover ? ' leaf--cover' : '') + '" data-leaf="' + i + '" style="z-index:' + (80 - i) + '">' +
        '<div class="leaf__face leaf__face--front">' + leaf.front + '</div>' +
        '<div class="leaf__face leaf__face--back" style="visibility:hidden">' + leaf.back + '</div>' +
        '</div>';
    });

    html += '<div class="cast" id="cast"></div>';
    html += '</div>';
    /* the pages' outer margins turn them */
    html += '<button class="turn-zone turn-zone--prev" type="button" tabindex="-1" aria-hidden="true" data-turn="-1"></button>';
    html += '<button class="turn-zone turn-zone--next" type="button" tabindex="-1" aria-hidden="true" data-turn="1"></button>';
    bookWrap.innerHTML = html;
    fitQuotes(bookWrap);
    return leaves;
  }

  /* ============================================================
     ANIMATE — one scrubbed timeline; each leaf turn = 1 beat
     ============================================================ */
  var tl = null;        // the timeline
  var lenis = null;     // smooth scrolling (only where the book is scrolled)
  var swipeMode = false;   // true on a phone or tablet: pages turn by swiping, nothing scrolls (see MOVING)
  var S = null;         // everything about the current build
  var EPS = 0.3;        // real depth between stacked leaves (px): paint order inside preserve-3d is not to be trusted (buildTimeline sets it for the book's length)
  var TOPZ = 400;
  var SETTLE = 0.5;     // how far through the cover's turn the book has finished settling flat (0.5: as the cover stands on edge)

  function buildTimeline(single) {
    var leaves = buildBook(single);
    var leafEls = Array.prototype.slice.call(bookWrap.querySelectorAll('.leaf'));
    var n = leafEls.length;
    var book = document.getElementById('book');
    var staticPg = bookWrap.querySelector('.page-static');

    /* The leaves lie EPS apart in real depth, and perspective draws a deeper page a hair smaller. A
       book with more leaves stacks them closer, so that its last pages sit about as deep as the last
       pages of the 25-page book did (4.2px in spreads, 8.1px one page at a time) and are drawn the
       same size against the cover's frame. Never closer than 0.2px: what lies between two leaves
       (the turning leaf's shadow, the left-hand stack) sits half a step from each. */
    EPS = clamp((single ? 8.1 : 4.2) / (n + 1), 0.2, 0.3);
    document.getElementById('blockLeft').style.transform = 'translateZ(' + (EPS / 2).toFixed(3) + 'px)';

    S = {
      single: single, n: n, leafEls: leafEls, staticPg: staticPg,
      faces: leafEls.map(function (el) {
        return { front: el.querySelector('.leaf__face--front'), back: el.querySelector('.leaf__face--back') };
      }),
      cast: document.getElementById('cast'),
      shLeft: document.getElementById('shLeft'),
      shRight: document.getElementById('shRight'),
      board: document.getElementById('boardRight'),
      spine: document.getElementById('spine'),
      blockR: document.getElementById('blockRight'),
      blockL: document.getElementById('blockLeft'),
      stackR: document.getElementById('stackRight'),
      back: document.getElementById('back'),
      foot: document.getElementById('foot'),
      starts: [], rests: [0], rest: -1, parkedAt: -1, depthKey: ''
    };
    S.footCloth = S.foot.querySelector('.bfoot__cloth');

    /* DEPTH. The book is drawn the way the guide draws a card's shadow: what lies lower shows down and
       to the right. Shut, the stack of pages and the back board show under the cover, joined at the
       left by the spine. As the cover lifts, the book settles flat: its thickness draws in under the
       pages, which do not move (Brian, 14 Nov: the cover and the first page slid down into place).
       Open, the cover is one frame of constant width round both pages (Brian, 13 Nov: the cover
       itself should stay consistent), and each stack of pages shows its ruled edge inside that frame:
       at the foot, and on its own outer side. */
    var cs = getComputedStyle(bookWrap);
    var em = parseFloat(cs.fontSize) || 16;
    var unit = parseFloat(cs.getPropertyValue('--u')) || 1;
    var rule = parseFloat(cs.getPropertyValue('--rule')) || 2;
    function ems(name) { return (parseFloat(cs.getPropertyValue(name)) || 0) * em; }   // an em length from book.css, in px
    var sq = ems('--sq'), spineW = ems('--spine-w');
    S.em = em; S.sq = sq; S.spineW = spineW; S.rule = rule;
    S.tuck = ems('--tuck');                              // how far the back board, its shadow and the pages run on under the spine
    S.thickShut = snap(ems('--thick'));                  // the whole block of pages, seen under the shut cover (book.css leaves room for it under the book)
    S.thickOpen = snap(em * 0.34);                       // one stack at its fullest, once the book lies open (well inside --sq: the frame must show past it)
    S.shadowOff = em * 0.62;                             // the hard shadow's own offset
    S.blockR.style.boxShadow = edgeLayers(S.thickShut, unit, rule, 1);
    S.blockL.style.boxShadow = edgeLayers(S.thickOpen, unit, rule, -1);

    /* Where things sit across the window. Spreads: the book is centred and the spine is its middle.
       One page at a time: the page sits to the right, far enough that a strip of whatever has been
       turned shows at the left edge of the screen. */
    var W = window.innerWidth, wrapW = bookWrap.offsetWidth, pageW = single ? wrapW : wrapW / 2;
    var spineX = W / 2, strip = 0;
    if (single) {
      var roomRight = sq + S.shadowOff + 6;                          // the board's margin and its shadow, right of the page
      strip = Math.max(0, Math.min(em * 4.2, W - pageW - roomRight));
      spineX = (W - (strip + pageW + roomRight)) / 2 + strip;
      /* a window wide enough to hold the turned page whole (a short, wide one): sit as an open book does */
      if (W / 2 >= pageW + sq + 10) spineX = W / 2;
      bookWrap.style.setProperty('--single-shift', (spineX - (W - pageW) / 2).toFixed(1) + 'px');
      bookWrap.style.setProperty('--strip', Math.min(spineX, pageW).toFixed(1) + 'px');
    } else {
      bookWrap.style.removeProperty('--single-shift');
      bookWrap.style.removeProperty('--strip');
    }
    /* (for swiping: see MOVING) where the spine is and how wide a page is, in px across the window */
    S.pageW = pageW; S.spineX = spineX;
    S.commit = clamp(0.26 * pageW, 64, 120);             // a page carried this far (px) goes on over when it is let go
    S.reach = clamp(0.2 * pageW, 48, 90) / pageW;        // a leaf called from off the screen is under the finger by this much of a move (in page widths)
    /* shut, the whole of the book (spine, cover, pages, back board, half its shadow) is centred */
    S.shutX = W / 2 - spineX - (-spineW + pageW + sq + S.thickShut + S.shadowOff * 0.5) / 2;

    /* Shut, the book sits exactly where it will lie open: the cover is where page 1 will be, at the
       same size, and its thickness shows below and to the right (book.css sizes the book and leaves
       the room under it: --fit, --thick). So nothing slides or grows as it opens.
       Only in a window where that cannot fit (the shut book would run into the pager, or off the
       side) is it drawn a little smaller or lifted, and then by no more than it takes. */
    var wrapH = bookWrap.offsetHeight;
    var navEl = document.getElementById('nav'), pagerEl = document.getElementById('pager');
    var reachUp = wrapH / 2 + sq, reachDown = wrapH / 2 + sq + S.thickShut + S.shadowOff;   // from the middle of its pages
    var objW = spineW + pageW + sq + S.thickShut + S.shadowOff;
    var midY = bookWrap.offsetTop + wrapH / 2;
    /* (its top is the open book's top: wherever that is allowed to be, the shut cover is too) */
    var topLimit = Math.min((navEl ? navEl.offsetHeight : 0) - (W < 900 ? 4 : 12), midY - reachUp);
    var botLimit = pagerEl ? pagerEl.offsetTop : bookWrap.offsetTop + wrapH + 60;
    S.shutScale = clamp(Math.min(1, (botLimit - topLimit) / (reachUp + reachDown), (W - 10) / objW), 0.8, 1);
    if (S.shutScale > 0.993) S.shutScale = 1;            // (a hair too big is not worth a change of size)
    var topAt = midY - reachUp * S.shutScale, botAt = midY + reachDown * S.shutScale;
    S.shutY = botAt > botLimit ? botLimit - botAt : (topAt < topLimit ? topLimit - topAt : 0);
    if (Math.abs(S.shutY) < 1.5) S.shutY = 0;

    /* What lies under the pages is pushed back in real depth (paint order inside preserve-3d is not to be
       trusted). Perspective would then draw it a hair smaller than the pages it belongs to: the cover's
       frame would step at the spine, and the stacks' edges would come out thin. So each is scaled up
       by exactly what perspective takes off, about the point perspective shrinks toward. */
    var persp = parseFloat(cs.perspective) || 0;
    function pushedBack(el, z) {
      el.style.transformOrigin = (wrapW / 2 - el.offsetLeft).toFixed(2) + 'px ' + (wrapH / 2 - el.offsetTop).toFixed(2) + 'px';
      return ' scale(' + (persp ? (persp - z) / persp : 1).toFixed(5) + ')';
    }
    S.boardFix = pushedBack(S.board, -13);
    S.shadowFix = pushedBack(S.shRight, -18);
    S.stackR.style.transform = 'translateZ(-10px)' + pushedBack(S.stackR, -10);
    S.spine.style.transform = 'translateZ(-8px)' + pushedBack(S.spine, -8);
    S.foot.style.transform = 'translateZ(-9px)' + pushedBack(S.foot, -9);
    var shL = S.shLeft.parentElement;
    shL.style.transform = 'translate3d(' + S.shadowOff.toFixed(2) + 'px,' + S.shadowOff.toFixed(2) + 'px,-18px)' + pushedBack(shL, -18);

    var INTRO = 0.18;                    // a little slack before the cover lifts
    var HOLD = single ? 0.4 : 0.5;       // reading room after each turn (the book also comes to rest there)
    var VH = single ? 46 : 54;           // scroll per beat

    gsap.config({ force3D: true });
    gsap.set(book, { x: S.shutX });      // shut: centred; it slides to its open place as the cover comes over
    leafEls.forEach(function (el, i) { gsap.set(el, { z: -i * EPS }); });
    gsap.set(staticPg, { z: -(n + 1) * EPS });

    var vars = { defaults: { ease: 'none' }, onUpdate: onTimelineUpdate };
    if (swipeMode) {
      vars.paused = true;                // swiped: the book keeps its own clock (see MOVING)
    } else {
      vars.scrollTrigger = {
        trigger: scrollSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        pin: '#stage',
        anticipatePin: 1,
        onUpdate: onAnyScroll
      };
    }
    tl = gsap.timeline(vars);

    var t = INTRO;
    leaves.forEach(function (leaf, i) {
      var el = leafEls[i], front = S.faces[i].front, back = S.faces[i].back;
      S.starts.push(t);

      tl.set(el, { zIndex: TOPZ }, t);
      tl.to(el, {
        rotationY: -180, z: i * EPS, duration: 1, ease: 'power1.inOut',
        onUpdate: function () {
          var th = -gsap.getProperty(el, 'rotationY');           // 0 (flat on the right) .. 180 (flat on the left)
          var rad = th * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
          /* flat tint: the side turned from the light goes one tone darker */
          front.style.setProperty('--shade', (th < 90 ? s * 0.10 : 0).toFixed(3));
          back.style.setProperty('--shade', (th >= 90 ? s * 0.28 : 0.28).toFixed(3));
          /* hard shadow on the page beneath: light from the upper left, so it shows past the leaf's free edge */
          S.cast.style.transform = 'translateZ(' + (-(i + 0.5) * EPS).toFixed(2) + 'px) scaleX(' + Math.max(0, c + 0.34 * s).toFixed(4) + ')';
          S.cast.style.opacity = (s * 0.4).toFixed(3);
          /* the cover's own shadow grows out from the spine as it comes down on the left */
          if (i === 0 && S.shLeft) S.shLeft.style.transform = 'scaleX(' + Math.max(0, -c).toFixed(4) + ')';
        }
      }, t);
      if (i === 0) tl.to(book, { x: 0, duration: 1, ease: 'power1.inOut' }, t);

      /* Deterministic face swap at the edge-on moment (90deg): a scrubbed set() applies
         forward and reverts when scrolled back. */
      tl.set(front, { visibility: 'hidden' }, t + 0.5);
      tl.set(back, { visibility: 'visible' }, t + 0.5);
      if (i === n - 1) tl.set(staticPg, { visibility: 'visible' }, t);
      tl.set(el, { zIndex: i + 1 }, t + 1);

      t += 1;
      S.rests.push(t + HOLD / 2);        // the book rests here: this leaf has landed
      t += (i < n - 1) ? HOLD : HOLD / 2;
    });
    tl.to({}, { duration: 0.001 }, t - 0.001);   // the timeline ends on the last rest
    S.rests[S.rests.length - 1] = tl.duration();

    /* scrolled: the page is as tall as the turning takes. Swiped: it is the screen, and no taller. */
    scrollSection.style.height = swipeMode ? '' : Math.round(tl.duration() * VH + 100) + 'vh';

    onTimelineUpdate();
    setRest(0);
    /* (for proofs and tests; the film's title pages drive tl and state from here) */
    window.__jlBook = {
      tl: tl, state: S, pages: PAGES, jumps: JUMPS, goTo: goTo, goToPage: goToPage,
      swipe: { on: swipeMode, start: dragStart, move: dragMove, end: dragEnd, moving: function () { return gliding; } }
    };
  }

  /* ---------- which page a rest shows, and back ---------- */
  function restForPage(no) {
    if (!S) return 0;
    if (no <= 0) return 0;
    return S.single ? no : (no >> 1) + 1;
  }
  function pagesAtRest(r) {            // [left page no or 0, right page no]; one page when single
    if (r <= 0) return [];
    if (S.single) return [r];
    return [2 * r - 2, 2 * r - 1];
  }
  /* how to open the closed book, in words that fit the screen in hand (a phone's line is short) */
  function openHint() {
    if (swipeMode || window.matchMedia('(pointer: coarse)').matches) return 'Swipe or tap to open';
    return window.innerWidth < 560 ? 'Scroll or click to open' : 'Scroll, or press the arrow, to open';
  }
  function labelAtRest(r) {
    if (r <= 0) return { where: openHint(), no: plain(C.title) };
    var ps = pagesAtRest(r), names = [];
    ps.forEach(function (no) {
      var def = no === 0 ? ENDPAPER : PAGES[no - 1];
      if (def && def.label && names.indexOf(def.label) < 0) names.push(def.label);
    });
    var nums = ps.filter(function (no) { return no > 0; });
    return {
      where: names.join(' · '),
      no: (nums.length > 1 ? 'Pages ' + nums[0] + '–' + nums[1] : 'Page ' + nums[0]) + ' of ' + PAGES.length
    };
  }

  /* ---------- only the open pages are reachable by keyboard / screen reader ---------- */
  function setAccess(el, on) {
    if (!el) return;
    if (on) { el.inert = false; el.removeAttribute('aria-hidden'); }
    else { el.inert = true; el.setAttribute('aria-hidden', 'true'); }
  }
  function setRest(r) {
    if (!S || r === S.rest) return;
    S.rest = r;
    bookWrap.classList.toggle('is-closed', r === 0);
    S.faces.forEach(function (f, i) {
      setAccess(f.front, i === r);
      setAccess(f.back, !S.single && i === r - 1);
    });
    setAccess(S.staticPg, r === S.n);
    var lab = labelAtRest(r);
    pagerWhere.textContent = lab.where;
    pagerNo.textContent = lab.no;
    if (coverPicker) { coverBtn.hidden = r !== 0; pagerNo.hidden = r === 0; }   // the closed book: the cover button takes that line
    prevBtn.disabled = r <= 0;
    nextBtn.disabled = r >= S.rests.length - 1;
  }
  function nearestRest(time) {
    var best = 0, d = Infinity;
    for (var i = 0; i < S.rests.length; i++) {
      var dd = Math.abs(S.rests[i] - time);
      if (dd < d) { d = dd; best = i; }
    }
    return best;
  }

  /* ---------- depth: the edges of the stacks, the back board, the shadow ---------- */
  function snap(v) { var d = window.devicePixelRatio || 1; return Math.round(v * d) / d; }   // to whole device pixels

  /* The edge of a stack of pages, as hard box-shadow layers stepped down and outward (dir 1: to the
     right, for the right-hand stack; -1: to the left, for the left-hand one): paper, paper, a line, and
     so on, then an ink rule. Each layer stops at --t (the stack's thickness, set by setDepth), so a
     thinner stack simply shows fewer lines; the ink rule is never thicker than the stack. */
  function edgeLayers(maxPx, unit, rule, dir) {
    var out = [], count = Math.ceil(maxPx / unit) + 1;
    function x(v) { return dir < 0 ? 'calc(-1 * ' + v + ')' : v; }
    for (var k = 1; k <= count; k++) {
      var o = 'min(' + (k * unit) + 'px,var(--t,0px))';
      out.push(x(o) + ' ' + o + ' 0 0 ' + (k % 3 === 0 ? 'var(--edge-line)' : 'var(--paper)'));
    }
    var e = 'calc(var(--t,0px) + min(' + rule + 'px,var(--t,0px)))';
    out.push(x(e) + ' ' + e + ' 0 0 var(--ink)');
    return out.join(',');
  }
  function setThick(el, t) {
    el.style.setProperty('--t', t + 'px');
    el.style.visibility = t < 0.5 ? 'hidden' : 'visible';
  }
  /* A length for a clip-path: an edge of the element's own box, or one of the book's own measures,
     plus so many px. (Not plain px from the top left: these paths must hold while the window is being
     resized, when the boxes have already changed and this script's px have not caught up.) */
  function at(base, px) { return 'calc(' + base + (px < 0 ? ' - ' : ' + ') + Math.abs(px).toFixed(2) + 'px)'; }
  /* A quarter of an ellipse as clip-path points: from its lowest point (cx, cy + ry) round to its
     leftmost (cx - rx, cy); cx and cy are given as at() takes them, a base and px. Fourteen chords;
     what they miss of the curve is a twentieth of a pixel. */
  function quarter(xBase, cx, yBase, cy, rx, ry) {
    var out = [], N = 14;
    for (var i = 0; i <= N; i++) {
      var a = (Math.PI / 2) * i / N;
      out.push(at(xBase, cx - rx * Math.sin(a)) + ' ' + at(yBase, cy + ry * Math.cos(a)));
    }
    return out.join(',');
  }

  /* shut: 1 while the book is shut, falling to 0 as it settles flat (see SETTLE).
     lifted: leaves that have left the right-hand stack · landed: leaves lying on the left (the cover
     counts as one in both: it is taken out again here, it is not a page). */
  function setDepth(shut, lifted, landed) {
    var span = Math.max(1, S.n - 1);
    var shareR = 1 - 0.9 * clamp(lifted - 1, 0, span) / span;
    var shareL = clamp(landed - 1, 0, span) / span;
    var tR = snap(shut * S.thickShut + (1 - shut) * S.thickOpen * shareR);
    var tL = snap((1 - shut) * S.thickOpen * shareL);
    var drop = snap(shut * S.thickShut);               // how far the back board sits below (and to the right of) the cover
    var key = tR + '|' + tL + '|' + drop + '|' + shut.toFixed(3);
    if (key === S.depthKey) return;
    S.depthKey = key;
    setThick(S.blockR, tR);
    setThick(S.blockL, tL);

    /* THE FOOT OF THE SPINE. Under the spine, below the level of the cover's foot, one looks into the
       end of the spine: the cloth turns under in a quarter round to meet the back board (as wide as
       the spine, as deep as the board sits low), and inside that turn is the rounded back of the
       pages. Both are let through from what already lies there: the back board and the stack of
       pages each run on under the spine, and each is cut to show in its own quarter round as well
       as to the right of the hinge. .bfoot rules the two curves in ink. */
    var W = S.spineW;
    var back = Math.max(0, tR - S.sq + S.rule);        // how far the pages' edge reaches below the cover's foot, its ink rule included
    var backX = Math.min(back, W - S.rule - Math.max(2.5, 0.2 * S.em));   // ...and to the left: never into the cloth's own rule
    /* (the cloth's turn is drawn down to the last pixel of `drop`: without it the back board's foot
       would step down at the hinge for the last moments of the settle, which are its slowest) */
    var hasFoot = drop > 0.75, hasBack = hasFoot && back > 3.5;

    /* The back board: right of the hinge, and the cloth's turn. In the board's own box the hinge is
       --tuck from its left edge, less `drop` (the board itself has moved that far right), and the
       level of the cover's foot is `drop` above its lower edge. */
    var TUCK = 'var(--tuck)', END = '100%', OUT = 'calc(100% + 2px)';
    var hinge = at(TUCK, -drop);
    var bp = [hinge + ' -2px', OUT + ' -2px', OUT + ' ' + OUT, hinge + ' ' + OUT];
    if (hasFoot) bp.push(quarter(TUCK, -drop, END, -drop, W - 1, Math.max(0.01, drop - 1)), hinge + ' ' + at(END, -drop));
    S.board.style.transform = 'translate3d(' + drop + 'px,' + drop + 'px,-13px)' + S.boardFix;
    S.board.style.clipPath = 'polygon(' + bp.join(',') + ')';

    /* the shadow: the same outline, a shadow's offset on (its box starts a spine's width further left) */
    var sp = [hinge + ' -2px', OUT + ' -2px', OUT + ' ' + OUT, at(TUCK, hasFoot ? W - drop : -drop) + ' ' + OUT];
    if (hasFoot) sp.push(quarter(TUCK, W - drop, END, -drop, W, drop));
    var sh = (S.shadowOff + drop).toFixed(2);
    S.shRight.style.transform = 'translate3d(' + sh + 'px,' + sh + 'px,-18px)' + S.shadowFix;
    S.shRight.style.clipPath = 'polygon(' + sp.join(',') + ')';

    /* the pages: right of the hinge, and their rounded back (the cover's foot is --sq below their box) */
    var FAR = 'calc(100% + 9em)', FOOT = '100% + var(--sq)';
    var pp = [TUCK + ' -2px', FAR + ' -2px', FAR + ' ' + FAR, TUCK + ' ' + FAR];
    if (hasBack) pp.push(quarter(TUCK, 0, FOOT, 0, backX - 1, back - 1), TUCK + ' ' + at(FOOT, 0));
    S.blockR.style.clipPath = 'polygon(' + pp.join(',') + ')';

    /* the two ink rules: round the cloth's turn, and round the pages' rounded back */
    S.foot.style.setProperty('--drop', drop + 'px');
    S.footCloth.style.visibility = hasFoot ? 'visible' : 'hidden';
    S.stackR.style.setProperty('--back-x', backX.toFixed(2) + 'px');
    S.stackR.style.setProperty('--back-y', back.toFixed(2) + 'px');
    S.back.style.visibility = hasBack ? 'visible' : 'hidden';

    /* (only where the shut book could not sit at its open size and place: see shutScale and shutY) */
    bookWrap.style.transform = (shut > 0.001 && (S.shutScale < 1 || S.shutY))
      ? 'translate(0px,' + (S.shutY * shut).toFixed(2) + 'px) scale(' + (1 - (1 - S.shutScale) * shut).toFixed(4) + ')'
      : '';
  }

  /* Runs whenever the timeline's playhead moves. */
  function onTimelineUpdate() {
    if (!S || !tl) return;
    var time = tl.time();
    var k = 0;                                   // leaves that have fully turned
    while (k < S.n && time >= S.starts[k] + 1 - 1e-4) k++;

    /* keep only the leaves near the open page in the scene */
    if (k !== S.parkedAt) {
      S.parkedAt = k;
      /* (never the cover: once open, it is the board the left-hand pages lie on) */
      for (var i = 1; i < S.n; i++) S.leafEls[i].classList.toggle('leaf--parked', i < k - 2 || i > k + 1);
    }

    /* the stacks: thinner on the right as each leaf lifts off, thicker on the left as each one lands */
    var lifting = k < S.n && time > S.starts[k] + 1e-4;
    var turned = clamp(-(Number(gsap.getProperty(S.leafEls[0], 'rotationY')) || 0) / 180, 0, 1);   // the cover: 0 shut .. 1 open
    /* The book settles flat while the cover is still on its way up, easing to a stop: by the time the
       cover stands on edge, everything under it is in its open place. The cover then comes down on a
       book that is not moving (before, the back board was still creeping in as the cover landed). */
    var shut = turned >= SETTLE ? 0 : Math.pow(1 - turned / SETTLE, 2);
    setDepth(shut, k + (lifting ? 1 : 0), k);
    setRest(nearestRest(time));
  }

  /* ============================================================
     MOVING — scroll or swipe, come to rest, arrows, keys, jumps

     A computer scrolls, and the scroll position is the book's clock.
     A phone or tablet swipes (Brian, 14 Nov: "move through pages by swiping left or right rather than
     scrolling"): nothing scrolls there, the book keeps its own clock, and a finger moves it directly.
     ============================================================ */
  function yForTime(time) {
    var st = tl.scrollTrigger;
    return st.start + (time / tl.duration()) * (st.end - st.start);
  }
  function scrollTime() { return tl.scrollTrigger.progress * tl.duration(); }
  function bookTime() { return swipeMode ? tl.time() : scrollTime(); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  var gliding = false, glideGuard = null, snapTimer = null, targetRest = 0, modalOpen = false;

  function glideTo(y, dur) {
    gliding = true;
    clearTimeout(glideGuard);
    glideGuard = setTimeout(function () { gliding = false; }, dur * 1000 + 450);
    if (lenis) {
      lenis.scrollTo(y, { duration: dur, easing: easeInOut, onComplete: function () { gliding = false; } });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  /* The book never sits half-turned: once the scrolling stops, it settles on the nearest whole page. */
  function onAnyScroll() {
    clearTimeout(snapTimer);
    if (!tl || gliding || modalOpen) return;
    snapTimer = setTimeout(settle, 170);
  }
  function settle() {
    if (!tl || !S || swipeMode || gliding || modalOpen) return;
    var r = nearestRest(scrollTime());
    var y = yForTime(S.rests[r]);
    if (Math.abs(window.scrollY - y) < 2) return;
    targetRest = r;
    glideTo(y, 0.55);
  }
  /* the reader always outranks a glide in progress */
  function userTookOver() {
    if (swipeMode) return;
    clearTimeout(snapTimer);
    if (gliding) { gliding = false; clearTimeout(glideGuard); }
  }
  window.addEventListener('wheel', userTookOver, { passive: true });
  window.addEventListener('touchstart', function () {
    if (swipeMode) return;
    if (gliding && lenis) lenis.reset();        // a finger on the page stops a programmatic glide dead
    userTookOver();
  }, { passive: true });

  /* ---------- the book's own clock (swiped screens) ---------- */
  var clock = null;                       // the move in progress: { tween, from, to, dur, ease }
  /* An ease that starts at the speed the book already has and comes to a soft stop. m is that speed,
     as a multiple of the average speed the move needs: 0 = from a standstill. */
  function carryOn(m) {
    m = clamp(m || 0, 0, 3);              // (past 3 it would overshoot and come back)
    return function (p) { return ((p - 2) * p + 1) * p * m + (3 - 2 * p) * p * p; };
  }
  function clockSpeed() {                 // beats a second, signed; 0 at rest
    if (!clock) return 0;
    var p = clock.tween.progress(), a = Math.max(0, p - 0.002), b = Math.min(1, p + 0.002);
    return b > a ? (clock.ease(b) - clock.ease(a)) / (b - a) * (clock.to - clock.from) / clock.dur : 0;
  }
  function stopClock() {
    if (clock) { clock.tween.kill(); clock = null; }
    gliding = false;
  }
  function runClock(to, dur, ease, done) {
    if (clock) clock.tween.kill();
    var c = clock = { from: tl.time(), to: to, dur: dur, ease: ease };
    gliding = true;
    c.tween = gsap.to(tl, {
      time: to, duration: dur, ease: ease,
      onComplete: function () {
        if (clock !== c) return;
        clock = null; gliding = false;
        if (done) done();
      }
    });
  }

  function goTo(r, instant) {
    if (flat || !tl || !S) return;
    r = clamp(r, 0, S.rests.length - 1);
    var moving = gliding;
    var from = moving ? targetRest : nearestRest(bookTime());
    targetRest = r;
    /* an unhurried turn: about a second and a half for one page (Brian, 13 Nov: it was turning too quickly) */
    var dur = Math.min(3.4, 1.35 + 0.16 * Math.abs(r - from));
    if (swipeMode) {
      dropDrag();
      var gap = S.rests[r] - tl.time();
      if (instant || Math.abs(gap) < 1e-4) { stopClock(); tl.time(S.rests[r]); onTimelineUpdate(); return; }
      /* from rest, the glide a computer's arrows give; already turning, it carries on at the speed it has */
      runClock(S.rests[r], dur, moving ? carryOn(clockSpeed() * dur / gap) : easeInOut);
      return;
    }
    var y = yForTime(S.rests[r]);
    if (instant) {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      return;
    }
    glideTo(y, dur);
  }
  function step(d) {
    if (flat || !tl || !S) return;
    goTo((gliding ? targetRest : nearestRest(bookTime())) + d);
  }
  function goToPage(no) {
    if (flat) {
      var target = no > 0 ? document.getElementById('flat-p' + no) : null;
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      else window.scrollTo(0, 0);
      return;
    }
    goTo(restForPage(no));
  }

  /* ---------- swiping: the page follows the finger ----------
     A swipe to the left lifts the page that is showing and carries it over; a swipe to the right
     brings the last one back. Let go, and the leaf goes on to whichever side it was heading (carried
     far enough, or flicked) or falls back where it was. One swipe, one page. */
  var drag = null;          // the finger (or held mouse button) now on the book
  var SLOP = 10;            // px a finger may wander before it means anything
  var FLICK = 0.3;          // px per ms: let go at this speed, the page goes that way however short the swipe

  function zoomed() { var vv = window.visualViewport; return !!vv && vv.scale > 1.02; }
  function dropDrag() {
    drag = null;
    document.documentElement.classList.remove('is-turning');
  }
  function dragStart(x, y, t) {
    dropDrag();
    if (!swipeMode || flat || modalOpen || !tl || !S || zoomed()) return;
    drag = { x0: x, y0: y, x: x, trail: [[t, x, tl.time()]], on: false, dead: false, loose: false, leaf: -1 };
  }
  /* take hold of a leaf: the one that turns forward, or the one that comes back */
  function take(d, back, x) {
    var j = back ? d.rest - 1 : d.rest;
    d.back = back;
    d.ax = x;                                    // its turn is measured from here, so it does not jump as it is taken
    d.leaf = j >= 0 && j < S.n ? j : -1;         // (no page that way: nothing to hold)
    d.e = back ? -1 : 1;                         // the cosine of its angle: 1 flat on the right, -1 flat on the left
    /* Did the finger come down on the leaf it is about to move? Then the leaf is HELD there: the spot
       under the finger stays under it, so a page held nearer the spine swings further for the same
       move (within reason). If not (one page at a time, the leaf that comes back is off the screen
       to the left), the leaf is CALLED: its free edge comes to the finger, then stays under it. */
    d.spine = S.spineX + (d.rest === 0 ? S.shutX : 0);
    var held = (d.x0 - d.spine) / S.pageW * (back ? -1 : 1);
    d.gain = held > 0.2 ? 1 / clamp(held, 0.55, 1) : 0;
  }
  /* put leaf j at the angle whose cosine is e: 1 flat on the right, -1 flat on the left */
  function setLeaf(j, e) {
    var f = Math.acos(clamp(e, -1, 1)) / Math.PI;                         // how far through the half turn
    var tau = f < 0.5 ? Math.sqrt(f / 2) : 1 - Math.sqrt((1 - f) / 2);    // (the timeline's own power1.inOut, undone)
    tl.time(S.starts[j] + tau);
  }
  function follow(d, x) {
    var m = (x - d.ax) / S.pageW;                // the finger's move in page widths, + to the right
    /* back past where it started: let that leaf lie, and take the one the other way */
    if (d.back ? m < -SLOP / S.pageW : m > SLOP / S.pageW) {
      if (d.leaf >= 0) setLeaf(d.leaf, d.back ? -1 : 1);
      take(d, !d.back, x);
      m = 0;
    }
    if (d.leaf < 0) return;
    var e0 = d.back ? -1 : 1, e;                 // e: the cosine of the leaf's angle; e0: where it lies now
    m = Math.max(0, d.back ? m : -m);            // how far it has been carried
    if (d.gain) {
      e = e0 + (d.back ? 1 : -1) * d.gain * m;
    } else {
      /* called: over the first thumb's width of the move its edge comes to the finger (quickly at
         first, easing in to meet it), and from there the edge is under the finger */
      var u = Math.min(1, m / S.reach), near = 1 - (1 - u) * (1 - u);
      e = e0 + (clamp((x - d.spine) / S.pageW, -1, 1) - e0) * near;
    }
    d.e = clamp(e, -1, 1);
    setLeaf(d.leaf, d.e);
  }
  /* true when the browser should keep its hands off this move */
  function dragMove(x, y, t) {
    var d = drag;
    if (!d) return false;
    if (d.dead) return true;
    var dx = x - d.x0, dy = y - d.y0;
    d.x = x;
    if (!d.on) {
      var across = Math.abs(dx), down = Math.abs(dy);
      if (across < SLOP && down < SLOP) return false;
      /* A swipe: it has gone sideways, and not steeply (a thumb swipes in an arc: within about 60
         degrees of level counts). Plainly up and down is not one, and nothing here scrolls. */
      if (across < SLOP || across < down * 0.6) {
        if (down >= 3 * SLOP) d.dead = true;
        return true;
      }
      d.on = true;
      document.documentElement.classList.add('is-turning');
      if (gliding) d.loose = true;               // the book is already turning: this swipe is counted when it ends
      else { d.rest = nearestRest(tl.time()); take(d, dx > 0, x); }
    }
    if (!d.loose) follow(d, x);
    d.trail.push([t, x, tl.time()]);
    if (d.trail.length > 16) d.trail.shift();
    return true;
  }
  /* let go of leaf j: it carries on to the side it is going, from the speed the finger had it, and lands softly */
  function letGo(j, turn, beats) {
    var to = S.starts[j] + (turn ? 1 : 0), gap = to - tl.time();
    var rest = turn ? j + 1 : j;
    targetRest = rest;
    function land() { tl.time(S.rests[rest]); onTimelineUpdate(); }
    if (Math.abs(gap) < 1e-3) { stopClock(); land(); return; }
    var dur = 0.26 + 0.5 * Math.abs(gap);        // a whole turn left to go: three quarters of a second
    runClock(to, dur, carryOn(beats * dur / gap), land);
  }
  /* true if that was a swipe (so a click that follows it is not a click) */
  function dragEnd(t, cancelled) {
    var d = drag;
    dropDrag();
    if (!d || !d.on || d.dead) return false;
    /* the finger's speed over its last 60 ms or so (px per ms, + to the right), and the clock's (beats a second) */
    var tr = d.trail, last = tr[tr.length - 1], v = 0, beats = 0;
    if (!cancelled && t - last[0] < 90) {
      for (var i = tr.length - 2; i >= 0; i--) {
        var dt = last[0] - tr[i][0];
        if (dt >= 60 || i === 0) {
          if (dt > 8) { v = (last[1] - tr[i][1]) / dt; beats = (last[2] - tr[i][2]) / dt * 1000; }
          break;
        }
      }
    }
    var moved = d.x - d.x0;
    var flick = Math.abs(moved) >= 28 && Math.abs(v) >= FLICK;
    if (d.loose) {
      if (!cancelled && (flick || Math.abs(moved) >= S.commit)) step((flick ? v : moved) < 0 ? 1 : -1);
      return true;
    }
    if (d.leaf < 0) return true;
    /* let go without a flick: a leaf carried far enough, or already past standing on edge, goes on over;
       one let go early falls back where it was */
    var carried = (d.back ? d.x - d.ax : d.ax - d.x) >= S.commit || (d.back ? d.e > 0 : d.e < 0);
    var turn = cancelled ? d.back          // (put down where it was)
      : flick ? v < 0                      // flicked: it goes the way it was flicked
      : carried !== d.back;
    letGo(d.leaf, turn, beats);
    return true;
  }

  var stage = document.getElementById('stage');
  function fromBook(e) { return !(e.target && e.target.closest && e.target.closest('.pager')); }   // (the arrows are for tapping)
  if (stage) {
    stage.addEventListener('touchstart', function (e) {
      if (!swipeMode) return;
      if (e.touches.length !== 1 || !fromBook(e)) { dragEnd(e.timeStamp, true); return; }   // a second finger: put the page down
      dragStart(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp);
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (!swipeMode || !drag) return;
      if (e.touches.length !== 1) { dragEnd(e.timeStamp, true); return; }
      if (dragMove(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp) && e.cancelable) e.preventDefault();
    }, { passive: false });
    stage.addEventListener('touchend', function (e) {
      if (swipeMode && drag && !e.touches.length) dragEnd(e.timeStamp, false);
    });
    stage.addEventListener('touchcancel', function (e) {
      if (swipeMode && drag) dragEnd(e.timeStamp, true);
    });

    /* a mouse or trackpad on such a screen (a tablet with a keyboard case) drags the page the same way */
    var mouseHeld = false, noClickUntil = 0;
    stage.addEventListener('mousedown', function (e) {
      if (!swipeMode || e.button !== 0 || !fromBook(e)) return;
      mouseHeld = true;
      dragStart(e.clientX, e.clientY, e.timeStamp);
    });
    window.addEventListener('mousemove', function (e) {
      if (!mouseHeld || !drag) return;
      if (dragMove(e.clientX, e.clientY, e.timeStamp)) {
        e.preventDefault();
        var sel = window.getSelection ? window.getSelection() : null;
        if (sel && sel.removeAllRanges) sel.removeAllRanges();
      }
    });
    window.addEventListener('mouseup', function (e) {
      if (!mouseHeld) return;
      mouseHeld = false;
      if (dragEnd(e.timeStamp, false)) noClickUntil = e.timeStamp + 80;
    });
    document.addEventListener('click', function (e) {              // the click a mouse sends as a drag ends
      if (e.timeStamp < noClickUntil) { e.stopPropagation(); e.preventDefault(); }
    }, true);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });   // (a photo, or a link, is not to be dragged off the page)

    /* ...and its wheel turns one page to a stroke */
    var wheelSum = 0, wheelDone = false, wheelQuiet = null;
    window.addEventListener('wheel', function (e) {
      if (!swipeMode || flat || modalOpen || e.ctrlKey) return;
      clearTimeout(wheelQuiet);
      wheelQuiet = setTimeout(function () { wheelSum = 0; wheelDone = false; }, 160);
      if (wheelDone) return;
      wheelSum += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(wheelSum) > 30) { wheelDone = true; step(wheelSum > 0 ? 1 : -1); }
    }, { passive: true });

    /* pinched in to read: let the screen pan as it normally would (book.css: .is-zoomed) */
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        document.documentElement.classList.toggle('is-zoomed', zoomed());
      });
    }
  }

  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  document.addEventListener('keydown', function (e) {
    if (modalOpen) { if (e.key === 'Escape') closeVideo(); return; }
    if (e.key === 'Escape') { closeMenu(); return; }
    if (flat || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var el = e.target;
    if (el && el.closest && el.closest('input,textarea,select,[contenteditable]')) return;
    var onControl = el && el.closest && el.closest('a,button');
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': e.preventDefault(); step(1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); step(-1); break;
      case ' ': if (!onControl) { e.preventDefault(); step(e.shiftKey ? -1 : 1); } break;
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(S ? S.rests.length - 1 : 0); break;
    }
  });

  /* nav links, the lists on the part openers, the brand: anything with data-jump */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-jump]') : null;
    if (a) {
      e.preventDefault();
      closeMenu();
      var name = a.getAttribute('data-jump');
      goToPage(JUMPS[name] != null ? JUMPS[name] : 0);
      return;
    }
    var w = e.target.closest ? e.target.closest('.js-watch') : null;
    if (w) {
      e.preventDefault();
      openVideo(w.getAttribute('href'), w.getAttribute('data-title') || '', w,
        w.hasAttribute('data-start') ? Number(w.getAttribute('data-start')) : null);
      return;
    }
    /* a plain link to the film ('tab', 'link'): the browser, or the artifact's viewer, follows it */
    var fl = e.target.closest ? e.target.closest('.js-film-link') : null;
    if (fl) {
      if (FILM_OPENS === 'link' && !e.defaultPrevented) guardFilmLink(fl);
      return;
    }
    /* a page's outer margin turns it; the closed cover opens the book */
    var z = e.target.closest ? e.target.closest('[data-turn]') : null;
    if (z) { step(parseInt(z.getAttribute('data-turn'), 10)); return; }
    if (S && S.rest === 0 && e.target.closest && e.target.closest('.pg--cover')) step(1);
  });

  /* where the book is scrolled, a sideways flick on a touch screen turns a page too (a laptop with one) */
  var swipe = null;
  window.addEventListener('touchstart', function (e) {
    swipe = !swipeMode && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null;
  }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (!swipe || modalOpen || flat || swipeMode) return;
    var t = e.changedTouches[0], dx = t.clientX - swipe.x, dy = t.clientY - swipe.y, dt = Date.now() - swipe.t;
    swipe = null;
    if (dt < 700 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------- Menu (small screens) ---------- */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mobileMenu');
  function closeMenu() {
    if (!burger || !burger.classList.contains('is-open')) return;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    mmenu.classList.remove('is-open');
    mmenu.setAttribute('aria-hidden', 'true');
    mmenu.inert = true;
  }
  if (burger) {
    mmenu.inert = true;
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mmenu.classList.toggle('is-open', open);
      mmenu.setAttribute('aria-hidden', String(!open));
      mmenu.inert = !open;
    });
  }

  /* ============================================================
     THE FILM — plays over the book
     Vimeo and YouTube links become their players; an .mp4 plays as is;
     anything else opens in a new tab.
     ============================================================ */
  var lightbox = document.getElementById('lightbox');
  var lbFrame = document.getElementById('lightboxFrame');
  var lbTitle = document.getElementById('lightboxTitle');
  var lbClose = document.getElementById('lightboxClose');
  var lbOpener = null;

  function embedFor(url, start) {
    var m, t;
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-z]+))?/i))) {
      var h = m[2] || (url.match(/[?&]h=([0-9a-z]+)/i) || [])[1];
      t = start != null ? start + 's' : (url.match(/#t=([0-9hms]+)/i) || [])[1];
      return { kind: 'iframe', src: 'https://player.vimeo.com/video/' + m[1] + '?' + (h ? 'h=' + h + '&' : '') +
        'autoplay=1&title=0&byline=0&portrait=0&dnt=1' + (t ? '#t=' + t : '') };
    }
    if ((m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/))([\w-]{11})/i))) {
      t = start != null ? start : (url.match(/[?&#]t=(\d+)/) || url.match(/[?&]start=(\d+)/) || [])[1];
      return { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0' + (t != null && t !== '' ? '&start=' + t : '') };   // (a start of 0 is said too: see timedUrl)
    }
    if (/\.(mp4|m4v|webm|mov)([?#]|$)/i.test(url)) return { kind: 'video', src: url, start: start };
    return null;
  }
  /* the player's frame takes the picture's shape, as large as the window allows */
  function shapeFrame(ratio) {
    ratio = clamp(Number(ratio) || 16 / 9, 0.5, 3);
    lbFrame.style.aspectRatio = String(ratio);
    lbFrame.style.width = 'min(100%, calc((100vh - 130px) * ' + ratio.toFixed(4) + '))';
  }
  function openVideo(url, title, opener, start) {
    if (!url) return;
    var e = embedFor(url, start);
    if (!e || !lightbox) { window.open(url, '_blank', 'noopener'); return; }
    lbOpener = opener || null;
    lbTitle.textContent = title || '';
    shapeFrame(B.videoAspect || 16 / 9);
    if (e.kind === 'iframe') {
      lbFrame.innerHTML = '<iframe src="' + esc(e.src) + '" title="' + esc(title || 'Video') + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    } else {
      lbFrame.innerHTML = '<video src="' + esc(e.src) + '" controls autoplay playsinline></video>';
      var v = lbFrame.querySelector('video');     /* a file knows its own shape */
      v.addEventListener('loadedmetadata', function () {
        if (v.videoWidth && v.videoHeight) shapeFrame(v.videoWidth / v.videoHeight);
        if (e.start != null && e.start > 0 && e.start < v.duration) v.currentTime = e.start;
      });
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    modalOpen = true;
    clearTimeout(snapTimer);
    if (drag) dragEnd(0, true);
    if (lenis) lenis.stop();
    lbClose.focus();
  }
  function closeVideo() {
    if (!modalOpen) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbFrame.innerHTML = '';                   // stops playback
    modalOpen = false;
    if (lenis) lenis.start();
    if (lbOpener && lbOpener.focus) lbOpener.focus();
    lbOpener = null;
  }
  if (lbClose) lbClose.addEventListener('click', closeVideo);
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeVideo(); });

  /* 'link' (the artifact copy), and the book is shown inside a frame. The frame's viewer is meant to
     take the link and open it outside the page. Should nothing take it, the frame ITSELF would go to
     the film's page, which will not load inside a frame: the book would be gone until the page was
     loaded again. So that one step is watched for, last in line, and stopped; the film's player is
     then tried in a tab of its own (it opens where the frame is allowed one; where it is not, nothing
     happens, and the book is still there). Where the browser cannot watch for it, nothing is done. */
  function guardFilmLink(a) {
    var nav = window.navigation;
    if (window.top === window || !nav || !nav.addEventListener) return;
    var href = a.href, done = false;
    function onNav(e) {
      if (done || e.defaultPrevented || !e.cancelable || !e.destination || e.destination.url !== href) return;
      done = true;
      e.preventDefault();
      var p = embedFor(a.getAttribute('data-film') || href,
        a.hasAttribute('data-start') ? Number(a.getAttribute('data-start')) : null);
      try { window.open(p && p.kind === 'iframe' ? p.src : href, '_blank'); } catch (err) { /* not allowed one */ }
    }
    nav.addEventListener('navigate', onNav);
    setTimeout(function () { nav.removeEventListener('navigate', onNav); }, 1500);
  }

  /* ============================================================
     REDUCED MOTION — lay the book flat
     ============================================================ */
  function buildFlat() {
    scrollSection.innerHTML = '';
    scrollSection.removeAttribute('style');
    var html = '<div class="flatbook bk" data-cover="' + COVER_KIND + '">';
    html += '<div class="flat-spread flat-spread--one" style="font-size:clamp(9px,1.42vw,17px)">' + pageHTML(COVER, 'recto') + '</div>';
    html += '<div class="flat-spread">' + pageHTML(ENDPAPER, 'verso') +
      '<div id="flat-p1" style="display:contents">' + pageHTML(PAGES[0], 'recto') + '</div></div>';
    for (var i = 1; i < PAGES.length; i += 2) {
      html += '<div class="flat-spread">' +
        '<div id="flat-p' + PAGES[i].no + '" style="display:contents">' + pageHTML(PAGES[i], 'verso') + '</div>' +
        (PAGES[i + 1] ? '<div id="flat-p' + PAGES[i + 1].no + '" style="display:contents">' + pageHTML(PAGES[i + 1], 'recto') + '</div>' : '') +
        '</div>';
    }
    html += '</div>';
    scrollSection.innerHTML = html;
    var fb = scrollSection.querySelector('.flatbook');
    Array.prototype.forEach.call(fb.querySelectorAll('.flat-spread'), setUnits);
    fitQuotes(fb);
  }

  /* ============================================================
     FONTS — the brand fonts are licensed files and stay out of a published copy
     (README). Where they are missing, bring in the guide's look-alikes rather
     than dropping to Georgia and Helvetica. Nothing is fetched when they are here.
     ============================================================ */
  function brandFontsIn() {
    var ok = false;
    try {
      /* (Fraunces counts too: a published copy links the look-alikes itself, so there is nothing more to fetch) */
      document.fonts.forEach(function (f) { if (/Museum|Fraunces/i.test(f.family) && f.status === 'loaded') ok = true; });
    } catch (e) { ok = true; }
    return ok;
  }
  function lookAlikes(done) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,800;1,9..144,400' +
      '&family=Montserrat:wght@400;500;700&family=Grand+Hotel&display=swap';
    var called = false;
    function finish() { if (!called) { called = true; done(); } }
    l.onload = function () {
      /* the faces load once the text asks for them: give layout a beat, then wait for them */
      setTimeout(function () {
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(finish); else finish();
      }, 60);
      setTimeout(finish, 2500);
    };
    l.onerror = finish;
    document.head.appendChild(l);
  }

  /* ============================================================
     BOOT + responsive rebuild
     ============================================================ */
  /* One page at a time on a narrow or upright screen, or when a spread would be too small to read.
     (--chrome is the height the stylesheet keeps clear of the book; it shrinks in a short window.) */
  /* A phone app can run the page under its system bars; the scene pads itself clear of them (book.css).
     0 everywhere else. */
  function safeInsets() {
    var sc = document.getElementById('scene');
    if (!sc) return 0;
    var cs = getComputedStyle(sc);
    return (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  }
  function isSingle() {
    var w = window.innerWidth, h = window.innerHeight;
    var root = getComputedStyle(document.documentElement);
    var chrome = (parseFloat(root.getPropertyValue('--chrome')) || 176) + (parseFloat(root.getPropertyValue('--head')) || 0) + safeInsets();
    var fit = parseFloat(root.getPropertyValue('--fit')) || 1;      // the room kept for the shut book's thickness
    var spreadEm = Math.min(0.92 * w, (h - chrome) * 1.5 / fit) / 64;
    return w < 720 || w / h < 1.2 || spreadEm < 9.5;
  }
  var currentSingle = null, lastW = 0, lastH = 0;

  /* A PHONE OR A TABLET turns the pages by swiping left or right, and nothing scrolls (Brian, 14 Nov).
     That is any screen whose own pointer is a finger. A computer keeps the scroll, touch screen or
     not. (?swipe=1 or ?swipe=0 on the link forces one or the other: for testing.) */
  function wantsSwipe() {
    var forced = (window.location.search.match(/[?&]swipe=([01])/) || [])[1];
    if (forced != null) return forced === '1';
    return window.matchMedia('(pointer: coarse)').matches ||
      ((navigator.maxTouchPoints || 0) > 0 && window.matchMedia('(hover: none)').matches);
  }
  function lenisTick(time) { if (lenis) lenis.raf(time * 1000); }
  function setSwipe(on) {
    swipeMode = on;
    document.documentElement.classList.toggle('is-swipe', on);
    if (on) {
      /* nothing scrolls, so nothing needs smoothing */
      if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); lenis = null; window.__lenis = null; }
      gsap.ticker.lagSmoothing(500, 33);
      window.scrollTo(0, 0);
    } else if (!lenis && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.0 });
      window.__lenis = lenis;
      lenis.on('scroll', function () { ScrollTrigger.update(); });
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* A link can open the book at a page: #friends, #p-fuentes, #watch, or #p12 (a page number). */
  function pageFromHash() {
    var h = (window.location.hash || '').slice(1);
    if (!h) return null;
    if (JUMPS[h] != null) return JUMPS[h];
    return /^p\d+$/.test(h) ? clamp(parseInt(h.slice(1), 10), 0, PAGES.length) : null;
  }
  window.addEventListener('hashchange', function () {
    var no = pageFromHash();
    if (no != null) goToPage(no);
  });

  function rebuild() {
    var pageNo = 0;
    if (tl && S) {
      var ps = pagesAtRest(gliding ? targetRest : nearestRest(bookTime()));
      pageNo = ps.length ? ps[ps.length - 1] : 0;       // stay on the page we were reading
      dropDrag();
      stopClock();
      if (tl.scrollTrigger) tl.scrollTrigger.kill(true);
      tl.kill();
      tl = null;
    }
    setSwipe(wantsSwipe());                             // (before anything is measured: it changes what the stage is)
    currentSingle = isSingle();
    buildTimeline(currentSingle);
    if (lenis) lenis.resize();
    ScrollTrigger.refresh();
    if (pageNo) goTo(restForPage(pageNo), true);
  }

  function boot() {
    if (flat || !window.gsap || !window.ScrollTrigger) {
      flat = true;
      document.documentElement.classList.add('is-flat');
      document.body.classList.add('dots');
      buildFlat();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
        fitQuotes(scrollSection); dismissLoader();
        if (pageFromHash()) goToPage(pageFromHash());
        if (!brandFontsIn()) lookAlikes(function () { fitQuotes(scrollSection); });
      }); else dismissLoader();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    lastW = window.innerWidth; lastH = window.innerHeight;
    rebuild();                                          // (decides whether this screen scrolls or swipes: wantsSwipe)
    if (pageFromHash()) goTo(restForPage(pageFromHash()), true);

    /* ?still=12 holds the book open at page 12 with no scrolling at all (0 = the closed cover).
       For proofs and screenshots: a headless browser cannot scroll a pinned page.
       &turn=0.4 holds the leaf that brings that page in 40% of the way through its turn. */
    var still = (window.location.search.match(/[?&]still=(\d+)/) || [])[1];
    if (still != null) {
      var sr = restForPage(clamp(parseInt(still, 10), 0, PAGES.length));
      var turn = parseFloat((window.location.search.match(/[?&]turn=([0-9.]+)/) || [])[1]);
      if (tl.scrollTrigger) tl.scrollTrigger.disable(false);
      window.scrollTo(0, 0);
      /* (a proof is a still: no fades. A headless capture can stop before one has run, and then an
         arrow that has just gone out of use is photographed half way there) */
      document.documentElement.classList.add('is-still');
      tl.time(!isNaN(turn) && sr > 0 ? S.starts[sr - 1] + clamp(turn, 0, 1) : S.rests[sr]);
      onTimelineUpdate();
      if (loader) loader.style.display = 'none';
    }

    /* the fonts change every measure: fit the quotes again once they are in, then lift the loader */
    function refit() {
      if (!S) return;
      S.leafEls.forEach(function (el) { el.classList.remove('leaf--parked'); });
      fitQuotes(bookWrap);
      S.parkedAt = -1;
      onTimelineUpdate();
    }
    function fontsIn() {
      refit();
      dismissLoader();
      if (!brandFontsIn()) lookAlikes(refit);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsIn); else fontsIn();

    window.addEventListener('load', function () {
      if (lenis) lenis.resize();
      ScrollTrigger.refresh();
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var w = window.innerWidth, h = window.innerHeight;
        /* where a phone scrolls, its address bar sliding away changes only the height: not a reason to
           rebuild. Where it swipes, nothing scrolls and the bar stays put: a new height is a new window. */
        var touch = window.matchMedia('(pointer: coarse)').matches;
        if (w === lastW && (h === lastH || (touch && !swipeMode)) && wantsSwipe() === swipeMode) return;
        lastW = w; lastH = h;
        rebuild();
      }, 220);
    });
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
