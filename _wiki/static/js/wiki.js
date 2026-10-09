// Infinity Stone Core Wiki: navigation, search and interactive components. No dependencies.
(function () {
  'use strict';
  var root = document.documentElement.getAttribute('data-root') || '';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

  // ───── Mobile navigation drawer ─────
  var menu = $('.menu-toggle'), scrim = $('.scrim'), sidebar = $('#sidebar');
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    scrim.hidden = !open;
    if (open) { var active = $('a.active', sidebar) || $('a', sidebar); if (active) active.focus(); }
  }
  if (menu) {
    menu.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
    scrim.addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.body.classList.contains('nav-open')) { setNav(false); menu.focus(); }
    });
  }
  var activeLink = $('.sidebar a.active');
  if (activeLink && activeLink.scrollIntoView) {
    var inner = $('.sidebar-inner');
    if (inner && activeLink.offsetTop > inner.clientHeight - 80) inner.scrollTop = activeLink.offsetTop - inner.clientHeight / 2;
  }

  // ───── Global search ─────
  var input = $('#search-input'), results = $('#search-results');
  var index = (window.WIKI_INDEX || []).map(function (r) {
    return { r: r, title: (r.t || '').toLowerCase(), section: (r.s || '').toLowerCase(), text: (r.x || '').toLowerCase() };
  });
  var selected = -1, current = [];
  var kindLabel = { page: 'Page', section: 'Section', ability: 'Ability', item: 'Item' };
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mark(text, terms) {
    var html = escapeHtml(text);
    terms.forEach(function (term) {
      if (term.length < 2) return;
      html = html.replace(new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return html;
  }
  function snippet(text, terms) {
    if (!text) return '';
    var lower = text.toLowerCase(), at = -1;
    terms.forEach(function (t) { var i = lower.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; });
    var start = Math.max(0, at - 50);
    return (start ? '…' : '') + text.slice(start, start + 150) + (text.length > start + 150 ? '…' : '');
  }
  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var scored = [];
    index.forEach(function (entry) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], s = 0;
        if (entry.title === t) s = 30;
        else if (entry.title.indexOf(t) === 0) s = 18;
        else if (new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(entry.title)) s = 14;
        else if (entry.title.indexOf(t) >= 0) s = 9;
        else if (entry.section.indexOf(t) >= 0) s = 4;
        else if (entry.text.indexOf(t) >= 0) s = 2;
        if (!s) return;
        score += s;
      }
      if (entry.r.k === 'page') score += 3;
      if (entry.r.k === 'ability' || entry.r.k === 'item') score += 2;
      scored.push({ entry: entry, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 12).map(function (s) { return s.entry.r; });
  }
  function renderResults() {
    var query = input.value.trim();
    current = search(query);
    selected = current.length ? 0 : -1;
    if (!query) { closeResults(); return; }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    results.innerHTML = current.length ? current.map(function (r, i) {
      return '<a class="search-result" role="option" id="sr-' + i + '" aria-selected="' + (i === selected) + '" href="' + root + r.u + '">'
        + '<span class="kind kind-' + r.k + '">' + kindLabel[r.k] + '</span><span><strong>' + mark(r.t, terms) + '</strong>'
        + '<small>' + escapeHtml(r.s) + (r.x ? ' — ' + mark(snippet(r.x, terms), terms) : '') + '</small></span></a>';
    }).join('') : '<p class="search-empty">Nothing found for “' + escapeHtml(query) + '”. Try an ability, item or command name.</p>';
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', selected >= 0 ? 'sr-0' : '');
  }
  function closeResults() {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }
  function moveSelection(delta) {
    if (!current.length) return;
    selected = (selected + delta + current.length) % current.length;
    $$('.search-result', results).forEach(function (el, i) { el.setAttribute('aria-selected', String(i === selected)); });
    var el = $('#sr-' + selected);
    input.setAttribute('aria-activedescendant', 'sr-' + selected);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  if (input) {
    input.addEventListener('input', renderResults);
    input.addEventListener('focus', function () { if (input.value.trim()) renderResults(); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); moveSelection(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveSelection(-1); }
      else if (event.key === 'Enter' && selected >= 0) { event.preventDefault(); window.location.href = root + current[selected].u; closeResults(); }
      else if (event.key === 'Escape') { if (input.value) { input.value = ''; closeResults(); } else input.blur(); }
    });
    document.addEventListener('click', function (event) { if (!event.target.closest('.search')) closeResults(); });
    results.addEventListener('click', function () { closeResults(); });
    document.addEventListener('keydown', function (event) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((event.key === '/' && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  // ───── Copy buttons ─────
  $$('.copy-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var code = button.closest('.code-block').querySelector('code').innerText;
      var done = function () {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(function () { button.textContent = 'Copy'; button.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done, fallback);
      else fallback();
      function fallback() {
        var area = document.createElement('textarea');
        area.value = code; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select();
        try { document.execCommand('copy'); done(); } catch (e) { button.textContent = 'Select & copy'; }
        document.body.removeChild(area);
      }
    });
  });

  // ───── Table of contents: highlight the section in view ─────
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[decodeURIComponent(a.hash.slice(1))] = a; });
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var headings = Object.keys(byId);
      var firstVisible = headings.filter(function (id) { return visible[id]; })[0];
      if (firstVisible) {
        tocLinks.forEach(function (a) { a.classList.remove('current'); });
        byId[firstVisible].classList.add('current');
      }
    }, { rootMargin: '-70px 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) observer.observe(el); });
  }

  // ───── Back to top ─────
  var toTop = $('.to-top');
  if (toTop) {
    var onScroll = function () { toTop.hidden = window.scrollY < 600; };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#content'); if (main) main.focus({ preventScroll: true });
    });
  }

  // ───── Lightbox ─────
  var lightbox = $('.lightbox'), lastFocus = null;
  function openLightbox(src, caption) {
    lastFocus = document.activeElement;
    $('img', lightbox).src = src;
    $('img', lightbox).alt = caption || '';
    $('figcaption', lightbox).textContent = caption || '';
    lightbox.hidden = false;
    $('.lightbox-close', lightbox).focus();
  }
  function closeLightbox() { lightbox.hidden = true; if (lastFocus) lastFocus.focus(); }
  if (lightbox) {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-zoom]');
      if (trigger) { event.preventDefault(); openLightbox(trigger.getAttribute('data-zoom'), trigger.getAttribute('data-caption')); }
    });
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox || event.target.closest('.lightbox-close')) closeLightbox(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
  }

  // ───── Filter panels (abilities, items) ─────
  $$('.filter-panel').forEach(function (panel) {
    var text = $('.filter-input', panel), select = $('.filter-select', panel);
    var chips = $$('.filter-chip', panel);
    var rows = $$('.index-row, .item-tile', panel);
    var count = $('[data-count]', panel), empty = $('.filter-empty', panel);
    function apply() {
      var terms = (text.value || '').toLowerCase().split(/\s+/).filter(Boolean);
      var active = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).map(function (c) {
        return c.getAttribute('data-filter-group') || c.getAttribute('data-filter-category');
      });
      var activation = select ? select.value : '';
      var shown = 0;
      rows.forEach(function (row) {
        var haystack = row.getAttribute('data-text') || '';
        var key = row.getAttribute('data-group') || row.getAttribute('data-category');
        var ok = terms.every(function (t) { return haystack.indexOf(t) >= 0; })
          && (!active.length || active.indexOf(key) >= 0)
          && (!activation || row.getAttribute('data-activation') === activation);
        row.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown;
      empty.hidden = shown > 0;
    }
    text.addEventListener('input', apply);
    if (select) select.addEventListener('change', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
        apply();
      });
    });
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) { text.value = params.get('q'); }
    if (params.get('source')) chips.forEach(function (c) { if (c.getAttribute('data-filter-group') === params.get('source')) c.setAttribute('aria-pressed', 'true'); });
    apply();
  });

  // ───── Item details dialog ─────
  var dialog = $('.item-dialog');
  function openItem(tile) {
    if (!dialog || !tile) return;
    $('.dialog-body', dialog).innerHTML = $('template', tile).innerHTML;
    if (dialog.showModal) { if (!dialog.open) dialog.showModal(); } else dialog.setAttribute('open', '');
    if (history.replaceState) history.replaceState(null, '', '#' + tile.id);
  }
  if (dialog) {
    $$('.item-open').forEach(function (button) { button.addEventListener('click', function () { openItem(button.closest('.item-tile')); }); });
    $('.dialog-close', dialog).addEventListener('click', function () { dialog.close ? dialog.close() : dialog.removeAttribute('open'); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      var tile = document.getElementById(location.hash.slice(1));
      if (tile) $('.item-open', tile).focus();
    });
    var openFromHash = function () {
      var target = location.hash && document.getElementById(location.hash.slice(1));
      if (target && target.classList.contains('item-tile')) {
        target.hidden = false;
        target.scrollIntoView({ block: 'center' });
        openItem(target);
      }
    };
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  // ───── Tabs (stone selector and data-tabs blocks) ─────
  function wireTabs(tablist, tabs, panels) {
    function select(i, focus) {
      tabs.forEach(function (tab, j) {
        tab.setAttribute('aria-selected', String(i === j));
        tab.tabIndex = i === j ? 0 : -1;
        panels[j].hidden = i !== j;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var n = tabs.length;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); select((i + 1) % n, true); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); select((i - 1 + n) % n, true); }
        else if (event.key === 'Home') { event.preventDefault(); select(0, true); }
        else if (event.key === 'End') { event.preventDefault(); select(n - 1, true); }
      });
    });
    return select;
  }
  $$('.stone-selector').forEach(function (selector) {
    var tabs = $$('[role="tab"]', selector);
    var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('aria-controls')); });
    wireTabs($('[role="tablist"]', selector), tabs, panels);
  });
  $$('.tabs[data-tabs]').forEach(function (block, n) {
    var sections = $$(':scope > section', block);
    var list = document.createElement('div');
    list.className = 'tab-list';
    list.setAttribute('role', 'tablist');
    var tabs = sections.map(function (section, i) {
      var id = 'tabs-' + n + '-' + i;
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.id = id + '-tab';
      button.setAttribute('aria-controls', id);
      button.textContent = section.getAttribute('data-tab');
      section.id = id;
      section.setAttribute('role', 'tabpanel');
      section.setAttribute('aria-labelledby', button.id);
      list.appendChild(button);
      return button;
    });
    block.insertBefore(list, block.firstChild);
    wireTabs(list, tabs, sections)(0, false);
  });

  // ───── Spoilers ─────
  $$('.spoiler').forEach(function (button) {
    button.addEventListener('click', function () {
      var text = button.nextElementSibling;
      text.hidden = false;
      button.remove();
      text.setAttribute('tabindex', '-1');
      text.focus();
    });
  });
})();
