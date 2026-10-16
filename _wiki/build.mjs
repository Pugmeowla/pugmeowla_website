// Builds the Infinity Stone Core wiki for every documented version:
//   _wiki/versions/<id>/{pages,data,nav.mjs}  ->  wiki/ (latest) and wiki/<id>/ (older versions)
//   node _wiki/build.mjs
// No dependencies. Fails (exit code 1) on broken internal links, missing anchors or missing images.
//
// Link tokens in pages and macros: "@/" is the version's root, "@w/" the wiki root (shared assets),
// "@s/" the website root (the homepage).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { site } from './site.mjs';
import { createMacros } from './lib/macros.mjs';
import { highlight } from './lib/highlight.mjs';
import { escapeHtml, slugify, stripTags } from './lib/util.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const wikiDir = path.join(siteRoot, 'wiki');
const errors = [];

// ───────────── load versions ─────────────
function listPages(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? listPages(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    : entry.name.endsWith('.html') ? [`${prefix}${entry.name}`] : []);
}

function parsePage(dir, file) {
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const m = line.match(/^([a-z_]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
    }
  }
  return { path: file, meta, body: match ? source.slice(match[0].length) : source };
}

const versions = [];
for (const id of site.versions) {
  const dir = path.join(here, 'versions', id);
  const { version, nav } = await import(pathToFileURL(path.join(dir, 'nav.mjs')));
  const data = await import(pathToFileURL(path.join(dir, 'data', 'index.mjs')));
  const pagesDir = path.join(dir, 'pages');
  const pages = Object.fromEntries(listPages(pagesDir).map((file) => [file, parsePage(pagesDir, file)]));
  const order = nav.flatMap((section) => section.pages);
  for (const file of order) if (!pages[file]) errors.push(`${id}: nav lists missing page ${file}`);
  for (const file of Object.keys(pages)) {
    if (!order.includes(file) && file !== '404.html') errors.push(`${id}: page ${file} is not in the nav`);
  }
  versions.push({ ...version, nav, pages, order, data,
    macros: createMacros({ site: { ...site, ...version }, ...data }) });
}

// ───────────── page rendering ─────────────
function expandMacros(body, ctx, macros) {
  return body.replace(/\{\{\s*([a-z][a-z-]*)((?:\s+(?:"[^"]*"|[^\s}]+))*)\s*\}\}/g, (whole, name, rawArgs) => {
    const macro = macros[name];
    if (!macro) {
      errors.push(`${ctx.label}: unknown macro {{${name}}}`);
      return whole;
    }
    const args = [], options = {};
    for (const token of rawArgs.match(/(?:[a-z_]+=)?(?:"[^"]*"|[^\s]+)/g) || []) {
      const kv = token.match(/^([a-z_]+)=(.*)$/);
      const unquote = (v) => v.replace(/^"(.*)"$/, '$1');
      if (kv) options[kv[1]] = unquote(kv[2]);
      else args.push(unquote(token));
    }
    try {
      return macro(args, options, ctx);
    } catch (error) {
      errors.push(`${ctx.label}: {{${name}${rawArgs}}}: ${error.message}`);
      return '';
    }
  });
}

function processCode(html) {
  return html.replace(/<pre data-lang="([a-z]+)"(?: data-title="([^"]*)")?>([\s\S]*?)<\/pre>/g, (_, lang, title, code) => {
    const text = code.replace(/^\n/, '').replace(/\s+$/, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return `<div class="code-block"><div class="code-head"><span>${escapeHtml(title || lang.toUpperCase())}</span>`
      + `<button type="button" class="copy-button" aria-label="Copy code">Copy</button></div>`
      + `<pre><code class="lang-${lang}">${highlight(text, lang)}</code></pre></div>`;
  });
}

// Links every mention of another mod in page text to its page, with its icon in front. Text inside links, code,
// headings and form controls is left alone, so nothing gets linked twice and IDs like palladium:command stay plain.
const MOD_LINK_SKIP = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'script', 'style', 'button', 'summary', 'option', 'select', 'textarea', 'kbd']);
function linkMods(html, mods) {
  const entries = mods.flatMap((mod) => mod.names.map((name) => ({ mod, name })));
  const pattern = new RegExp(`(?<![\\w])(?:${entries.map((e, i) => `(?<m${i}>${e.name})`).join('|')})(?![\\w])`, 'g');
  let depth = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      const tag = part.match(/^<(\/?)([a-zA-Z0-9]+)/);
      if (tag && MOD_LINK_SKIP.has(tag[2].toLowerCase())) depth = tag[1] ? Math.max(0, depth - 1) : depth + 1;
      return part;
    }
    if (depth || !part.trim()) return part;
    return part.replace(pattern, (...args) => {
      const groups = args.at(-1);
      const { mod } = entries[Number(Object.keys(groups).find((k) => groups[k] !== undefined).slice(1))];
      // The icon stays on the same line as the first word; the rest of a long name can wrap.
      const [first, ...rest] = args[0].split(' ');
      return `<a class="mod-link" href="${mod.modrinth || mod.curseforge}"><span class="mod-link-lead"><img class="mod-icon" src="@w/assets/img/compat/${mod.icon}.png" alt="" loading="lazy">${first}</span>${rest.length ? ` ${rest.join(' ')}` : ''}</a>`;
    });
  }).join('');
}

function processHeadings(html) {
  const used = new Set();
  const toc = [];
  for (const id of html.matchAll(/\sid="([^"]+)"/g)) used.add(id[1]);
  const out = html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (whole, level, attrs, inner) => {
    let id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
    if (!id && !/no-toc/.test(attrs)) {
      const base = slugify(stripTags(inner)) || 'section';
      id = base;
      for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
      used.add(id);
      attrs = `${attrs} id="${id}"`;
    }
    if (/no-toc/.test(attrs)) return `<h${level}${attrs}>${inner}</h${level}>`;
    toc.push({ level: Number(level), id, text: stripTags(inner).trim() });
    return `<h${level}${attrs}>${inner}<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`;
  });
  return { html: out, toc };
}

const img = (src, alt = '', cls = 'px') => `<img src="@w/assets/img/${src}" alt="${escapeHtml(alt)}" class="${cls}" loading="lazy">`;

function tocHtml(toc, depth = 3) {
  const entries = toc.filter((t) => t.level <= depth);
  if (entries.length < 3) return { aside: '', inline: '' };
  const list = `<ol>${entries.map((t) => `<li class="toc-l${t.level}"><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`).join('')}</ol>`;
  return {
    aside: `<aside class="toc" aria-label="On this page"><p class="toc-title">On this page</p>${list}</aside>`,
    inline: `<details class="toc-inline"><summary>On this page</summary>${list}</details>`,
  };
}

function renderer(v) {
  const { pages, nav, order } = v;
  const sectionOf = (file) => nav.find((section) => section.pages.includes(file));
  const titleOf = (file) => pages[file]?.meta.title || file;

  // Sidebar icons load straight away: on phones the menu is hidden until opened, and lazy icons would pop in late.
  const navIcon = (src) => img(src, '', 'px nav-icon').replace(' loading="lazy"', '');
  const sidebar = (current) => nav.map((section) => {
    // A one-page entry (the wiki home) is a plain link the same size as a section heading.
    if (section.link) {
      const file = section.pages[0];
      const active = file === current;
      return `<a class="nav-top${active ? ' active' : ''}" href="@/${file}"${active ? ' aria-current="page"' : ''}>${navIcon(section.icon)}<span>${escapeHtml(section.title)}</span></a>`;
    }
    const open = section.pages.includes(current);
    const links = section.pages.map((file) => {
      const active = file === current;
      return `<li><a href="@/${file}"${active ? ' aria-current="page" class="active"' : ''}>${escapeHtml(pages[file]?.meta.nav || titleOf(file))}</a></li>`;
    }).join('');
    return `<details class="nav-group"${open ? ' open' : ''}><summary>${navIcon(section.icon)}<span>${escapeHtml(section.title)}</span></summary><ul>${links}</ul></details>`;
  }).join('');

  // The version switcher: the same page in the other version when it exists, otherwise its home page.
  const switcher = (file) => {
    const items = versions.map((other) => {
      const target = other.pages[file] && file !== '404.html' ? file : 'index.html';
      const href = `@w/${other.outDir ? `${other.outDir}/` : ''}${target}`;
      const current = other.id === v.id;
      const status = other.id === site.released ? 'Current release' : other.status;
      return `<li><a href="${href}"${current ? ' aria-current="true" class="active"' : ''}><strong>${escapeHtml(other.label)}</strong><small>${escapeHtml(status)}</small></a></li>`;
    }).join('');
    const label = `v${escapeHtml(v.label)} · MC ${escapeHtml(v.minecraft)} · ${escapeHtml(v.loader)}`;
    // With only one documented version there's nothing to switch to, so it's a plain label.
    if (versions.length < 2) return `<p class="version-switch version-label">${label}</p>`;
    return `<details class="version-switch"><summary><span>${label}</span></summary>`
      + `<p class="version-switch-title">Documentation version</p><ul>${items}</ul></details>`;
  };

  const breadcrumbs = (file) => {
    if (file === 'index.html') return '';
    const section = sectionOf(file);
    const crumbs = [`<li><a href="@/index.html">Wiki ${escapeHtml(v.label)}</a></li>`];
    // The section links to its overview page when it has one (stones/index.html and so on), otherwise it's plain text.
    // It's left out when it would repeat the page's own title.
    if (section && !section.link && section.title !== titleOf(file)) {
      const overview = section.pages[0];
      crumbs.push(overview !== file && overview !== 'index.html' && overview.endsWith('index.html')
        ? `<li><a href="@/${overview}">${escapeHtml(section.title)}</a></li>`
        : `<li><span>${escapeHtml(section.title)}</span></li>`);
    }
    crumbs.push(`<li aria-current="page">${escapeHtml(titleOf(file))}</li>`);
    return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.join('')}</ol></nav>`;
  };

  const pager = (file) => {
    const i = order.indexOf(file);
    if (i < 0) return '';
    const prev = order[i - 1], next = order[i + 1];
    const link = (target, label, cls) => target
      ? `<a class="pager-link ${cls}" href="@/${target}"><small>${label}</small><span>${escapeHtml(titleOf(target))}</span></a>`
      : '';
    return `<nav class="pager" aria-label="Previous and next page">${link(prev, '← Previous', 'prev')}${link(next, 'Next →', 'next')}</nav>`;
  };

  const notice = () => {
    const other = versions.find((o) => o.id !== v.id && (v.id === site.released ? true : o.id === site.released));
    if (!v.notice) return '';
    // Links to the other version's docs when they're on the site; without them it's just the notice.
    const link = other ? ` <a href="@w/${other.outDir ? `${other.outDir}/` : ''}index.html">${escapeHtml(v.noticeLink || `Read the ${other.label} docs`)}</a>` : '';
    // The inline script hides a dismissed notice before it paints, so it doesn't flash on every page.
    return `<div class="version-notice" data-notice="${v.id}"><p>${v.notice}${link}</p>`
      + `<button type="button" class="version-notice-close" aria-label="Dismiss notice">×</button>`
      + `<script>try{if(localStorage.getItem('wiki-notice-${v.id}'))document.currentScript.parentNode.hidden=true}catch(e){}</script></div>`;
  };

const prefs = (where) => `<div class="prefs prefs-${where}">
    <div class="platform-switch" role="group" aria-label="Open mod links on">
      <button type="button" data-platform-choice="modrinth" aria-pressed="true">Modrinth</button>
      <button type="button" data-platform-choice="curseforge" aria-pressed="false">CurseForge</button>
    </div>
    <button type="button" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">
      <svg class="icon-moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1z" fill="currentColor"/></svg>
      <svg class="icon-sun" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></g></svg>
    </button>
  </div>`;
  const layout = (file, meta, content, toc, { base = null } = {}) => {
    const t = tocHtml(toc, meta.toc === 'h2' ? 2 : 3);
    const isHome = file === 'index.html';
    const title = isHome ? `${site.name} (${v.label})` : `${meta.title} · ${site.name} ${v.label}`;
    const description = meta.description || `${site.modName} documentation.`;
    const head = meta.icon && !isHome ? `<img class="page-icon px" src="@w/assets/img/${meta.icon}" alt="">` : '';
    return `<!DOCTYPE html>
<html lang="en" data-root="@/">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${base ? `<script>${base}</script>` : ''}
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#eecd95">
<link rel="icon" type="image/png" href="@w/assets/img/favicon.png">
<link rel="stylesheet" href="@w/assets/css/wiki.css">
<script>(function(){var d=document.documentElement,dark=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches,t,p;d.classList.add('js');try{t=localStorage.getItem('wiki-theme');p=localStorage.getItem('wiki-platform')}catch(e){}d.setAttribute('data-theme',t==='light'||t==='dark'?t:(dark?'dark':'light'));d.setAttribute('data-platform',p==='curseforge'?'curseforge':'modrinth')})()</script>
</head>
<body class="${isHome ? 'home' : 'doc'}">
<a class="skip-link" href="#content">Skip to content</a>
<header class="topbar">
  <button type="button" class="menu-toggle" aria-controls="sidebar" aria-expanded="false" aria-label="Open navigation"><span></span></button>
  <a class="brand" href="@/index.html"><img src="@w/assets/img/logo.png" alt="" width="40" height="40"><span>Infinity Stone Core<small>Wiki ${escapeHtml(v.label)}</small></span></a>
  <div class="search" role="search">
    <label class="visually-hidden" for="search-input">Search the ${escapeHtml(v.label)} wiki</label>
    <input id="search-input" type="search" placeholder="Search abilities, items, commands…" autocomplete="off" spellcheck="false"
      role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
    <kbd class="search-key" aria-hidden="true">/</kbd>
    <div id="search-results" class="search-results" role="listbox" hidden></div>
  </div>
  ${prefs('top')}
  <a class="home-link" href="@s/index.html">Pugmeowla</a>
</header>
<div class="shell${t.aside ? ' has-toc' : ''}">
  <nav id="sidebar" class="sidebar" aria-label="Wiki">
    <div class="sidebar-inner">
      ${prefs('drawer')}
      ${switcher(file)}
      ${sidebar(file)}
    </div>
  </nav>
  <div class="scrim" hidden></div>
  <main id="content" class="content" tabindex="-1">
    ${notice()}
    ${breadcrumbs(file)}
    ${isHome ? '' : `<header class="page-head">${head}<div><h1>${escapeHtml(meta.title)}</h1>${meta.lead ? `<p class="lead">${meta.lead}</p>` : ''}</div></header>`}
    ${t.inline}
    <article class="prose">
${content}
    </article>
    ${pager(file)}
    <footer class="footer">
      <p><strong>${escapeHtml(site.modName)}</strong> by Pugmeowla. These pages document version ${escapeHtml(v.label)} for Minecraft ${escapeHtml(v.minecraft)}.</p>
      <p><a href="${site.curseforge}">CurseForge</a> · <a href="${site.modrinth}">Modrinth</a> · <a href="${site.discord}">Discord</a> · <a href="@s/index.html">All projects</a></p>
    </footer>
  </main>
  ${t.aside}
</div>
<button type="button" class="to-top" aria-label="Back to top" hidden>↑</button>
<div class="lightbox" role="dialog" aria-modal="true" aria-label="Image preview" hidden><button type="button" class="lightbox-close" aria-label="Close">×</button><figure><img alt=""><figcaption></figcaption></figure></div>
<script src="@w/assets/js/search-${v.id}.js" defer></script>
<script src="@w/assets/js/wiki.js" defer></script>
</body>
</html>
`;
  };

  return { layout, sectionOf };
}

// ───────────── build ─────────────
fs.rmSync(wikiDir, { recursive: true, force: true });
fs.mkdirSync(wikiDir, { recursive: true });
// Finder's .DS_Store files are never copied into the site.
fs.cpSync(path.join(here, 'static'), path.join(wikiDir, 'assets'), { recursive: true, filter: (src) => path.basename(src) !== '.DS_Store' });

const up = (n) => '../'.repeat(n);
// Rewrites the link tokens for a page that sits `depth` folders below the wiki root, `inVersion` of them inside its version.
const finalize = (html, depth, inVersion) => html
  .replace(/(href|src|data-zoom)="@w\//g, `$1="${up(depth)}`)
  .replace(/(href|src)="@s\//g, `$1="${up(depth + 1)}`)
  .replace(/(href|src)="@\//g, `$1="${up(inVersion)}`)
  .replace(/data-root="@\/"/, `data-root="${up(inVersion)}"`);

const allSearch = [];
let pageCount = 0;
for (const v of versions) {
  const { layout, sectionOf } = renderer(v);
  const out = path.join(wikiDir, v.outDir);
  const searchRecords = [];
  const plain = (s) => stripTags(s).replace(/\s+/g, ' ').trim();

  for (const file of [...v.order, '404.html']) {
    const page = v.pages[file];
    if (!page) continue;
    const ctx = { path: file, label: `${v.id}/${file}`, errors, pages: v.pages };
    let html = expandMacros(page.body, ctx, v.macros);
    html = processCode(html);
    // Long IDs, paths and options in inline code break after a ':', '/' or '|' instead of in the middle of a word,
    // and inside tables (narrow columns) after a '_' too.
    const softBreaks = (chars) => (whole, text) => `<code>${text.replace(new RegExp(`([${chars}])(?=[^\\s${chars}])`, 'g'), '$1<wbr>')}</code>`;
    html = html.replace(/<table[\s\S]*?<\/table>/g, (table) => table.replace(/<code>([^<]{16,})<\/code>/g, softBreaks(':/|_')));
    html = html.replace(/<code>([^<]{16,})<\/code>/g, softBreaks(':/|'));
    if (v.data.mods && file !== 'index.html' && file !== '404.html') html = linkMods(html, v.data.mods);
    // Any link to a mod that's on both sites follows the reader's Modrinth / CurseForge choice (wiki.js swaps the href).
    for (const mod of v.data.mods || []) {
      if (!mod.modrinth || !mod.curseforge) continue;
      html = html.split(`href="${mod.modrinth}"`).join(`href="${mod.modrinth}" data-modrinth="${mod.modrinth}" data-curseforge="${mod.curseforge}"`);
    }
    const { html: withIds, toc } = processHeadings(html);

    if (file === '404.html') {
      // GitHub Pages serves the site root's 404.html for every missing path, so its links resolve against a <base>.
      if (v.outDir) continue;
      const base = `(function(){var s=location.pathname.split('/').filter(Boolean),i=s.indexOf('wiki'),r;`
        + `if(i>=0)r='/'+s.slice(0,i).join('/')+(i?'/':'');else if(/github\\.io$/.test(location.hostname)&&s.length>1)r='/'+s[0]+'/';else r='/';`
        + `document.write('<base href="'+r+'wiki/">')})()`;
      fs.writeFileSync(path.join(siteRoot, '404.html'), finalize(layout(file, page.meta, withIds, toc, { base }), 0, 0));
      continue;
    }

    const inVersion = file.split('/').length - 1;
    const depth = inVersion + (v.outDir ? v.outDir.split('/').length : 0);
    const target = path.join(out, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, finalize(layout(file, page.meta, withIds, toc), depth, inVersion));
    pageCount++;

    // Search: one record per page, then one per h2/h3 section with its text.
    searchRecords.push({ k: 'page', t: page.meta.title, s: sectionOf(file)?.title || '', u: file, x: plain(page.meta.description || page.meta.lead || '') });
    for (const part of withIds.split(/(?=<h[23][\s>])/)) {
      const m = part.match(/^<h[23][^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/);
      if (!m || /no-toc/.test(m[0].slice(0, m[0].indexOf('>')))) continue;
      searchRecords.push({ k: 'section', t: plain(m[2].replace(/<a class="heading-anchor"[\s\S]*?<\/a>/g, '')), s: page.meta.title,
        u: `${file}#${m[1]}`, x: plain(part.slice(m[0].length)).slice(0, 400) });
    }
  }

  const { abilities, groups, items } = v.data;
  for (const ability of abilities) {
    const group = groups[ability.group];
    searchRecords.push({ k: 'ability', t: ability.name, s: group.name, u: `${ability.page || group.page}#${slugify(ability.key)}`, x: stripTags(ability.summary) });
  }
  for (const item of items) {
    searchRecords.push({ k: 'item', t: item.name, s: item.id, u: `items.html#item-${slugify(item.id.split(':')[1])}`, x: stripTags(item.desc) });
  }
  fs.writeFileSync(path.join(wikiDir, `assets/js/search-${v.id}.js`),
    `// Generated by _wiki/build.mjs\nwindow.WIKI_INDEX=${JSON.stringify(searchRecords)};\n`);
  allSearch.push([v, searchRecords]);
}

// ───────────── verify links, anchors and images ─────────────
const htmlFiles = [path.join(siteRoot, 'index.html')];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(wikiDir);
const idCache = new Map();
const idsOf = (file) => {
  if (!idCache.has(file)) idCache.set(file, new Set([...fs.readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(file);
};
function checkRef(fromFile, ref, label) {
  if (/^(https?:|mailto:|data:|javascript:)/.test(ref)) return;
  const [rawPath, anchor] = ref.split('#');
  const target = rawPath ? path.resolve(path.dirname(fromFile), rawPath.split('?')[0]) : fromFile;
  if (!fs.existsSync(target)) { errors.push(`${label}: broken link ${ref}`); return; }
  if (anchor && target.endsWith('.html') && !idsOf(target).has(anchor)) {
    errors.push(`${label}: missing anchor #${anchor} in ${path.relative(siteRoot, target)}`);
  }
}
const checkIgnored = /\/(project[345]-image\.jpg|infintrix\.png)$/; // the homepage's own pre-existing placeholders
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src|data-zoom)="([^"]+)"/g)) {
    if (file.endsWith(`${path.sep}pugmeowla_website${path.sep}index.html`) && checkIgnored.test(`/${m[1]}`)) continue;
    checkRef(file, m[1], path.relative(siteRoot, file));
  }
}
for (const [v, records] of allSearch) {
  for (const record of records) checkRef(path.join(wikiDir, v.outDir, 'index.html'), record.u, `${v.id} search index (${record.t})`);
}

console.log(`Built ${pageCount} pages in ${versions.length} version${versions.length === 1 ? "" : "s"} (${versions.map((v) => v.id).join(', ')}) into wiki/`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${[...new Set(errors)].join('\n  ')}`);
  process.exit(1);
}
