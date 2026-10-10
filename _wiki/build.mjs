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

  const sidebar = (current) => nav.map((section) => {
    const open = section.pages.includes(current);
    const links = section.pages.map((file) => {
      const active = file === current;
      return `<li><a href="@/${file}"${active ? ' aria-current="page" class="active"' : ''}>${escapeHtml(pages[file]?.meta.nav || titleOf(file))}</a></li>`;
    }).join('');
    return `<details class="nav-group"${open ? ' open' : ''}><summary>${img(section.icon, '', 'px nav-icon')}<span>${escapeHtml(section.title)}</span></summary><ul>${links}</ul></details>`;
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
    return `<details class="version-switch"><summary><span>v${escapeHtml(v.label)} · MC ${escapeHtml(v.minecraft)} · ${escapeHtml(v.loader)}</span></summary>`
      + `<p class="version-switch-title">Documentation version</p><ul>${items}</ul></details>`;
  };

  const breadcrumbs = (file) => {
    if (file === 'index.html') return '';
    const section = sectionOf(file);
    const crumbs = [`<li><a href="@/index.html">Wiki ${escapeHtml(v.label)}</a></li>`];
    if (section && section.pages[0] !== file && section.pages[0] !== 'index.html') {
      crumbs.push(`<li><a href="@/${section.pages[0]}">${escapeHtml(section.title)}</a></li>`);
    } else if (section && section.pages[0] !== 'index.html') {
      crumbs.push(`<li><span>${escapeHtml(section.title)}</span></li>`);
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
      : '<span></span>';
    return `<nav class="pager" aria-label="Previous and next page">${link(prev, '← Previous', 'prev')}${link(next, 'Next →', 'next')}</nav>`;
  };

  const related = (meta) => {
    if (!meta.related) return '';
    const files = meta.related.split(',').map((s) => s.trim()).filter(Boolean);
    for (const f of files) if (!pages[f]) errors.push(`${v.id}: related page ${f} does not exist`);
    return `<section class="related" aria-labelledby="related-heading"><h2 id="related-heading" class="no-toc">Related pages</h2><div class="related-grid">${
      files.filter((f) => pages[f]).map((f) => `<a class="related-card" href="@/${f}">${pages[f].meta.icon ? img(pages[f].meta.icon) : ''}<span><strong>${escapeHtml(titleOf(f))}</strong><small>${escapeHtml(pages[f].meta.description || '')}</small></span></a>`).join('')
    }</div></section>`;
  };

  const notice = () => {
    const other = versions.find((o) => o.id !== v.id && (v.id === site.released ? true : o.id === site.released));
    if (!v.notice || !other) return '';
    const href = `@w/${other.outDir ? `${other.outDir}/` : ''}index.html`;
    return `<p class="version-notice">${v.notice} <a href="${href}">${escapeHtml(v.noticeLink || `Read the ${other.label} docs`)}</a></p>`;
  };

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
<script>document.documentElement.classList.add('js')</script>
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
  <a class="home-link" href="@s/index.html">Pugmeowla</a>
</header>
<div class="shell${t.aside ? ' has-toc' : ''}">
  <nav id="sidebar" class="sidebar" aria-label="Wiki">
    <div class="sidebar-inner">
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
    ${related(meta)}
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
fs.cpSync(path.join(here, 'static'), path.join(wikiDir, 'assets'), { recursive: true });

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

console.log(`Built ${pageCount} pages in ${versions.length} versions (${versions.map((v) => v.id).join(', ')}) into wiki/`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${[...new Set(errors)].join('\n  ')}`);
  process.exit(1);
}
