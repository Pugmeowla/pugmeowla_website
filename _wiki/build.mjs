// Builds the Infinity Stone Core wiki: _wiki/pages + _wiki/data -> wiki/ (plain static HTML).
//   node _wiki/build.mjs
// No dependencies. Fails (exit code 1) on broken internal links, missing anchors or missing images.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, nav } from './site.mjs';
import { macros } from './lib/macros.mjs';
import { highlight } from './lib/highlight.mjs';
import { escapeHtml, slugify, stripTags } from './lib/util.mjs';
import { abilities, groups } from './data/abilities.mjs';
import { items } from './data/items.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const pagesDir = path.join(here, 'pages');
const outDir = path.join(siteRoot, 'wiki');

// ───────────── load pages ─────────────
function listPages(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? listPages(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    : entry.name.endsWith('.html') ? [`${prefix}${entry.name}`] : []);
}

function parsePage(file) {
  const source = fs.readFileSync(path.join(pagesDir, file), 'utf8');
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

const pages = Object.fromEntries(listPages(pagesDir).map((file) => [file, parsePage(file)]));
const order = nav.flatMap((section) => section.pages);
const errors = [];
for (const file of order) if (!pages[file]) errors.push(`nav lists missing page ${file}`);
for (const file of Object.keys(pages)) {
  if (!order.includes(file) && file !== '404.html') errors.push(`page ${file} is not in the nav (site.mjs)`);
}
const sectionOf = (file) => nav.find((section) => section.pages.includes(file));
const titleOf = (file) => pages[file]?.meta.title || file;

// ───────────── page rendering ─────────────
const rootPrefix = (file) => '../'.repeat(file.split('/').length - 1);

function expandMacros(body, ctx) {
  return body.replace(/\{\{\s*([a-z][a-z-]*)((?:\s+(?:"[^"]*"|[^\s}]+))*)\s*\}\}/g, (whole, name, rawArgs) => {
    const macro = macros[name];
    if (!macro) {
      errors.push(`${ctx.path}: unknown macro {{${name}}}`);
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
      errors.push(`${ctx.path}: {{${name}${rawArgs}}}: ${error.message}`);
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

function processHeadings(html, file) {
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

const img = (src, alt = '', cls = 'px') => `<img src="@/assets/img/${src}" alt="${escapeHtml(alt)}" class="${cls}" loading="lazy">`;

function sidebar(current) {
  return nav.map((section) => {
    const open = section.pages.includes(current);
    const links = section.pages.map((file) => {
      const active = file === current;
      return `<li><a href="@/${file}"${active ? ' aria-current="page" class="active"' : ''}>${escapeHtml(pages[file]?.meta.nav || titleOf(file))}</a></li>`;
    }).join('');
    return `<details class="nav-group"${open ? ' open' : ''}><summary>${img(section.icon, '', 'px nav-icon')}<span>${escapeHtml(section.title)}</span></summary><ul>${links}</ul></details>`;
  }).join('');
}

function breadcrumbs(file) {
  if (file === 'index.html') return '';
  const section = sectionOf(file);
  const crumbs = [`<li><a href="@/index.html">Wiki</a></li>`];
  if (section && section.pages[0] !== file && section.pages[0] !== 'index.html') {
    crumbs.push(`<li><a href="@/${section.pages[0]}">${escapeHtml(section.title)}</a></li>`);
  } else if (section && section.pages[0] !== 'index.html') {
    crumbs.push(`<li><span>${escapeHtml(section.title)}</span></li>`);
  }
  crumbs.push(`<li aria-current="page">${escapeHtml(titleOf(file))}</li>`);
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs.join('')}</ol></nav>`;
}

function pager(file) {
  const i = order.indexOf(file);
  if (i < 0) return '';
  const prev = order[i - 1], next = order[i + 1];
  const link = (target, label, cls) => target
    ? `<a class="pager-link ${cls}" href="@/${target}"><small>${label}</small><span>${escapeHtml(titleOf(target))}</span></a>`
    : '<span></span>';
  return `<nav class="pager" aria-label="Previous and next page">${link(prev, '← Previous', 'prev')}${link(next, 'Next →', 'next')}</nav>`;
}

function related(meta) {
  if (!meta.related) return '';
  const files = meta.related.split(',').map((s) => s.trim()).filter(Boolean);
  for (const f of files) if (!pages[f]) errors.push(`related page ${f} does not exist`);
  return `<section class="related" aria-labelledby="related-heading"><h2 id="related-heading" class="no-toc">Related pages</h2><div class="related-grid">${
    files.filter((f) => pages[f]).map((f) => `<a class="related-card" href="@/${f}">${pages[f].meta.icon ? img(pages[f].meta.icon) : ''}<span><strong>${escapeHtml(titleOf(f))}</strong><small>${escapeHtml(pages[f].meta.description || '')}</small></span></a>`).join('')
  }</div></section>`;
}

function tocHtml(toc, depth = 3) {
  const entries = toc.filter((t) => t.level <= depth);
  if (entries.length < 3) return { aside: '', inline: '' };
  const list = `<ol>${entries.map((t) => `<li class="toc-l${t.level}"><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`).join('')}</ol>`;
  return {
    aside: `<aside class="toc" aria-label="On this page"><p class="toc-title">On this page</p>${list}</aside>`,
    inline: `<details class="toc-inline"><summary>On this page</summary>${list}</details>`,
  };
}

function layout(file, meta, content, toc, { base = null } = {}) {
  const t = tocHtml(toc, meta.toc === 'h2' ? 2 : 3);
  const isHome = file === 'index.html';
  const title = isHome ? `${site.name}` : `${meta.title} · ${site.name}`;
  const description = meta.description || `${site.modName} documentation.`;
  const head = meta.icon && !isHome ? `<img class="page-icon px" src="@/assets/img/${meta.icon}" alt="">` : '';
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
<link rel="icon" type="image/png" href="@/assets/img/favicon.png">
<link rel="stylesheet" href="@/assets/css/wiki.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${isHome ? 'home' : 'doc'}">
<a class="skip-link" href="#content">Skip to content</a>
<header class="topbar">
  <button type="button" class="menu-toggle" aria-controls="sidebar" aria-expanded="false" aria-label="Open navigation"><span></span></button>
  <a class="brand" href="@/index.html"><img src="@/assets/img/logo.png" alt="" width="40" height="40"><span>Infinity Stone Core<small>Wiki</small></span></a>
  <div class="search" role="search">
    <label class="visually-hidden" for="search-input">Search the wiki</label>
    <input id="search-input" type="search" placeholder="Search abilities, items, commands…" autocomplete="off" spellcheck="false"
      role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
    <kbd class="search-key" aria-hidden="true">/</kbd>
    <div id="search-results" class="search-results" role="listbox" hidden></div>
  </div>
  <a class="home-link" href="@/../index.html">Pugmeowla</a>
</header>
<div class="shell${t.aside ? ' has-toc' : ''}">
  <nav id="sidebar" class="sidebar" aria-label="Wiki">
    <div class="sidebar-inner">
      <a class="sidebar-version" href="@/compatibility.html">v${site.modVersion} · MC ${site.minecraft} · Forge</a>
      ${sidebar(file)}
    </div>
  </nav>
  <div class="scrim" hidden></div>
  <main id="content" class="content" tabindex="-1">
    ${breadcrumbs(file)}
    ${isHome ? '' : `<header class="page-head">${head}<div><h1>${escapeHtml(meta.title)}</h1>${meta.lead ? `<p class="lead">${meta.lead}</p>` : ''}</div></header>`}
    ${t.inline}
    <article class="prose">
${content}
    </article>
    ${related(meta)}
    ${pager(file)}
    <footer class="footer">
      <p><strong>${escapeHtml(site.modName)}</strong> by Pugmeowla. Documents mod version ${site.modVersion} for Minecraft ${site.minecraft}.</p>
      <p><a href="${site.curseforge}">CurseForge</a> · <a href="${site.modrinth}">Modrinth</a> · <a href="${site.discord}">Discord</a> · <a href="@/../index.html">All projects</a></p>
    </footer>
  </main>
  ${t.aside}
</div>
<button type="button" class="to-top" aria-label="Back to top" hidden>↑</button>
<div class="lightbox" role="dialog" aria-modal="true" aria-label="Image preview" hidden><button type="button" class="lightbox-close" aria-label="Close">×</button><figure><img alt=""><figcaption></figcaption></figure></div>
<script src="@/assets/js/search-index.js" defer></script>
<script src="@/assets/js/wiki.js" defer></script>
</body>
</html>
`;
}

// ───────────── build ─────────────
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(path.join(here, 'static'), path.join(outDir, 'assets'), { recursive: true });

const searchRecords = [];
const finalize = (html, prefix) => html.replace(/(href|src)="@\//g, `$1="${prefix}`).replace(/data-root="@\/"/, `data-root="${prefix}"`);

for (const file of [...order, '404.html']) {
  const page = pages[file];
  if (!page) continue;
  const ctx = { path: file, errors, pages };
  let html = expandMacros(page.body, ctx);
  html = processCode(html);
  const { html: withIds, toc } = processHeadings(html, file);
  const isNotFound = file === '404.html';
  const baseScript = isNotFound
    ? `(function(){var s=location.pathname.split('/').filter(Boolean),i=s.indexOf('wiki'),r;`
      + `if(i>=0)r='/'+s.slice(0,i).join('/')+(i?'/':'');else if(/github\\.io$/.test(location.hostname)&&s.length>1)r='/'+s[0]+'/';else r='/';`
      + `document.write('<base href="'+r+'wiki/">')})()`
    : null;
  const out = layout(file, page.meta, withIds, toc, { base: baseScript });
  if (isNotFound) {
    fs.writeFileSync(path.join(siteRoot, '404.html'), finalize(out, ''));
    continue;
  }
  const target = path.join(outDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, finalize(out, rootPrefix(file)));

  // Search: one record per page, then one per h2/h3 section with its text.
  const sectionTitle = sectionOf(file)?.title || '';
  const plain = (s) => stripTags(s).replace(/\s+/g, ' ').trim();
  searchRecords.push({ k: 'page', t: page.meta.title, s: sectionTitle, u: file, x: plain(page.meta.description || page.meta.lead || '') });
  const parts = withIds.split(/(?=<h[23][\s>])/);
  for (const part of parts) {
    const m = part.match(/^<h[23][^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/);
    if (!m || /no-toc/.test(m[0].slice(0, m[0].indexOf('>')))) continue;
    const text = plain(part.slice(m[0].length)).slice(0, 400);
    searchRecords.push({ k: 'section', t: plain(m[2].replace(/<a class="heading-anchor"[\s\S]*?<\/a>/g, '')), s: page.meta.title, u: `${file}#${m[1]}`, x: text });
  }
}

for (const ability of abilities) {
  const group = groups[ability.group];
  searchRecords.push({ k: 'ability', t: ability.name, s: group.name, u: `${ability.page || group.page}#${slugify(ability.key)}`,
    x: stripTags(ability.summary) });
}
for (const item of items) {
  searchRecords.push({ k: 'item', t: item.name, s: item.id, u: `items.html#item-${slugify(item.id.split(':')[1])}`, x: stripTags(item.desc) });
}
fs.writeFileSync(path.join(outDir, 'assets/js/search-index.js'),
  `// Generated by _wiki/build.mjs\nwindow.WIKI_INDEX=${JSON.stringify(searchRecords)};\n`);

// ───────────── verify links, anchors and images ─────────────
const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(outDir);
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
  if (anchor && target.endsWith('.html') && !idsOf(target).has(anchor) && !anchor.startsWith('item-')) {
    errors.push(`${label}: missing anchor #${anchor} in ${path.relative(siteRoot, target)}`);
  }
  if (anchor && anchor.startsWith('item-') && !idsOf(target).has(anchor)) errors.push(`${label}: missing item ${anchor}`);
}
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) checkRef(file, m[1], path.relative(siteRoot, file));
}
for (const record of searchRecords) checkRef(path.join(outDir, 'index.html'), record.u, `search index (${record.t})`);

console.log(`Built ${Object.keys(pages).length} pages, ${searchRecords.length} search records into ${path.relative(process.cwd(), outDir) || outDir}`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${[...new Set(errors)].join('\n  ')}`);
  process.exit(1);
}
