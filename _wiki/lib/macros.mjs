// {{macro args}} used inside _wiki/pages. Each returns HTML; "@/" is the wiki root and is rewritten per page.
import { site } from '../site.mjs';
import { stones, stoneById } from '../data/stones.mjs';
import { abilities, groups } from '../data/abilities.mjs';
import { items, itemById, categories } from '../data/items.mjs';
import { skins } from '../data/skins.mjs';
import { abilityTypes, conditions, otherTypes } from '../data/reference.mjs';
import { escapeHtml, slugify, stripTags } from './util.mjs';

const img = (src, alt = '', cls = 'px') => src
  ? `<img src="@/assets/img/${src}" alt="${escapeHtml(alt)}" class="${cls}" loading="lazy">`
  : `<span class="${cls} img-missing" role="img" aria-label="${escapeHtml(alt || 'No image')}"></span>`;

const fullId = (id) => (id.includes(':') ? id : `infinity:${id}`);
const getItem = (id) => {
  const item = itemById[fullId(id)];
  if (!item) throw new Error(`unknown item ${id}`);
  return item;
};
const itemAnchor = (item) => `item-${slugify(item.id.split(':')[1])}`;
const getAbility = (ref) => {
  const [group, key] = ref.split('/');
  const ability = abilities.find((a) => a.group === group && a.key === key);
  if (!ability) throw new Error(`unknown ability ${ref}`);
  return ability;
};
const abilityUrl = (ability) => `@/${ability.page || groups[ability.group].page}#${slugify(ability.key)}`;
const seconds = (ticks) => {
  const s = ticks / 20;
  return `${Number.isInteger(s) ? s : s.toFixed(2).replace(/0+$/, '')} s`;
};
const costLabel = (cost) => cost === null || cost === undefined ? 'No unlock needed' : cost === 0 ? 'Free unlock'
  : `${cost} Aspect${cost === 1 ? '' : 's'} of Existence`;

function abilityCard(ability) {
  const group = groups[ability.group];
  const stoneColor = stoneById[ability.group]?.color;
  const meta = [`<li class="tag tag-activation">${escapeHtml(ability.activation)}</li>`];
  if (ability.cooldown) meta.push(`<li class="tag">Cooldown ${seconds(ability.cooldown)}</li>`);
  meta.push(`<li class="tag tag-cost">${costLabel(ability.cost)}</li>`);
  if (ability.confirm) meta.push('<li class="tag tag-warn">Press twice to confirm</li>');
  const requires = (ability.requires || []).map((key) => {
    const other = getAbility(`${ability.group}/${key}`);
    return `<a href="${abilityUrl(other)}">${escapeHtml(other.name)}</a>`;
  });
  const needs = (ability.needsStones || []).filter((id) => id !== ability.group || ability.needsStones.length === 6);
  return `<article class="ability-card" id="${slugify(ability.key)}" data-group="${ability.group}"${stoneColor ? ` style="--accent:${stoneColor}"` : ''}>
  <div class="ability-icon">${img(ability.icon, '')}</div>
  <div class="ability-body">
    <h3 class="ability-name no-toc">${escapeHtml(ability.name)}<a class="heading-anchor" href="#${slugify(ability.key)}" aria-label="Link to ${escapeHtml(ability.name)}">#</a></h3>
    <p class="ability-summary">${ability.summary}</p>
    <ul class="tags">${meta.join('')}</ul>
    ${requires.length ? `<p class="ability-req"><span>Requires</span> ${requires.join(', ')}</p>` : ''}
    ${needs.length ? `<p class="ability-req"><span>Needs stones</span> ${needs.map((id) => stoneChip(id)).join(' ')}</p>` : ''}
    ${ability.details || ''}
    <p class="ability-id"><code>${escapeHtml(group.power)}</code> · <code>${escapeHtml(ability.type)}</code></p>
  </div>
</article>`;
}

function stoneChip(id) {
  const stone = stoneById[id];
  if (!stone) throw new Error(`unknown stone ${id}`);
  return `<a class="chip stone-chip" style="--accent:${stone.color}" href="@/stones/${id}.html">${img(`stones/${id}_stone.png`, '')}${escapeHtml(stone.name)}</a>`;
}

function itemDetail(item) {
  return `<div class="item-detail">
    <div class="item-detail-head">${img(item.img, item.name, 'px item-detail-img')}<div><h3 class="no-toc">${escapeHtml(item.name)}</h3><code>${escapeHtml(item.id)}</code></div></div>
    <p>${item.desc}</p>
    <dl><dt>How to get it</dt><dd>${item.obtain}</dd>${item.rarity ? `<dt>Rarity</dt><dd>${item.rarity}</dd>` : ''}
    <dt>Category</dt><dd>${escapeHtml(categories.find((c) => c.id === item.category).name)}</dd></dl>
    ${item.page && item.page !== 'items.html' ? `<p><a class="button-link" href="@/${item.page}">Read more →</a></p>` : ''}
  </div>`;
}

export const macros = {
  version: () => escapeHtml(site.modVersion),

  count([what]) {
    const lists = { abilities, items, skins, stones };
    if (!lists[what]) throw new Error(`unknown list ${what}`);
    return String(lists[what].length);
  },

  item([id, label]) {
    const item = getItem(id);
    return `<a class="chip item-chip" href="@/items.html#${itemAnchor(item)}">${img(item.img, '')}${escapeHtml(label || item.name)}</a>`;
  },

  stone([id]) { return stoneChip(id); },

  ab([ref, label]) {
    const ability = getAbility(ref);
    return `<a class="ability-link" href="${abilityUrl(ability)}">${escapeHtml(label || ability.name)}</a>`;
  },

  page([file, ...label], options, ctx) {
    return `<a href="@/${file}">${escapeHtml(label.join(' ') || file)}</a>`;
  },

  abilities([group], options) {
    let list = abilities.filter((a) => a.group === group);
    if (!list.length) throw new Error(`no abilities in group ${group}`);
    if (options.only) {
      const keys = options.only.split(',');
      list = keys.map((key) => getAbility(`${group}/${key}`));
    }
    return `<div class="ability-list">${list.map(abilityCard).join('\n')}</div>`;
  },

  costtable([group]) {
    const list = abilities.filter((a) => a.group === group && a.cost !== null && a.cost !== undefined);
    const rows = list.map((a) => `<tr><td><a href="${abilityUrl(a)}">${escapeHtml(a.name)}</a></td><td>${a.cost === 0 ? 'Free' : a.cost}</td>`
      + `<td>${(a.requires || []).map((k) => escapeHtml(getAbility(`${group}/${k}`).name)).join(', ') || '—'}</td><td>${escapeHtml(a.activation)}</td></tr>`).join('');
    const total = list.reduce((sum, a) => sum + a.cost, 0);
    return `<div class="table-wrap"><table><thead><tr><th>Ability</th><th>Cost</th><th>Unlock after</th><th>Use</th></tr></thead>`
      + `<tbody>${rows}</tbody><tfoot><tr><td>Everything</td><td>${total}</td><td colspan="2"></td></tr></tfoot></table></div>`;
  },

  abilityindex() {
    const groupButtons = Object.entries(groups)
      .filter(([id]) => abilities.some((a) => a.group === id))
      .map(([id, g]) => `<button type="button" class="filter-chip" data-filter-group="${id}" aria-pressed="false"${stoneById[id] ? ` style="--accent:${stoneById[id].color}"` : ''}>${escapeHtml(g.name)}</button>`).join('');
    const activations = [...new Set(abilities.map((a) => a.activation))];
    const rows = abilities.map((a) => {
      const g = groups[a.group];
      const color = stoneById[a.group]?.color || '#8a6d5d';
      const text = `${a.name} ${g.name} ${stripTags(a.summary)} ${a.type} ${a.key}`.toLowerCase();
      return `<li class="index-row" data-group="${a.group}" data-activation="${escapeHtml(a.activation)}" data-text="${escapeHtml(text)}" style="--accent:${color}">
  <a href="${abilityUrl(a)}">${img(a.icon, '', 'px index-icon')}<span class="index-main"><strong>${escapeHtml(a.name)}</strong><small>${a.summary}</small></span>
  <span class="index-side"><span class="tag tag-group">${escapeHtml(g.name)}</span><span class="tag">${escapeHtml(a.activation)}</span>${a.cooldown ? `<span class="tag">${seconds(a.cooldown)}</span>` : ''}${a.cost ? `<span class="tag tag-cost">${a.cost} AoE</span>` : ''}</span></a>
</li>`;
    }).join('\n');
    return `<div class="filter-panel" data-filter-list="abilities">
  <div class="filter-row"><label class="visually-hidden" for="ability-filter">Filter abilities</label>
  <input id="ability-filter" class="filter-input" type="search" placeholder="Filter by name, effect or ability type…" autocomplete="off">
  <label class="visually-hidden" for="activation-filter">Activation</label>
  <select id="activation-filter" class="filter-select"><option value="">Any activation</option>${activations.map((a) => `<option>${escapeHtml(a)}</option>`).join('')}</select></div>
  <div class="filter-chips" role="group" aria-label="Filter by source">${groupButtons}</div>
  <p class="filter-count" aria-live="polite"><span data-count>${abilities.length}</span> of ${abilities.length} abilities</p>
  <ul class="index-list">${rows}</ul>
  <p class="filter-empty" hidden>No abilities match. Try a shorter search.</p>
</div>`;
  },

  stonegrid() {
    return `<div class="stone-grid">${stones.map((s) => `<a class="stone-card" href="@/stones/${s.id}.html" style="--accent:${s.color};--glint:${s.glint}">
  ${img(`stones/${s.id}_stone.png`, s.name, 'px stone-img')}<strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.tagline)}</small></a>`).join('')}</div>`;
  },

  stoneselector() {
    const tabs = stones.map((s, i) => `<button type="button" role="tab" id="tab-${s.id}" aria-controls="panel-${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--accent:${s.color};--glint:${s.glint}">${img(`stones/${s.id}_stone.png`, '', 'px')}<span>${escapeHtml(s.name.replace(' Stone', ''))}</span></button>`).join('');
    const panels = stones.map((s, i) => {
      const list = abilities.filter((a) => a.group === s.id);
      const container = s.container ? macros.item([s.container]) : `Traded for ${macros.item(['best_friends_soul'])}`;
      return `<section role="tabpanel" id="panel-${s.id}" aria-labelledby="tab-${s.id}" class="selector-panel" style="--accent:${s.color}"${i ? ' hidden' : ''}>
  <div class="selector-visual">${img(`stones/${s.id}_stone.png`, s.name, 'px selector-stone')}</div>
  <div class="selector-info"><h3 class="no-toc">${escapeHtml(s.name)}</h3><p>${escapeHtml(s.tagline)}</p>
  <dl><dt>Found in</dt><dd>${container}</dd><dt>Location</dt><dd><a href="@/structures.html#${slugify(s.structureName)}">${escapeHtml(s.structureName)}</a> (${escapeHtml(s.dimension)})</dd>
  <dt>Abilities</dt><dd>${list.length} — ${list.slice(0, 5).map((a) => `<a href="${abilityUrl(a)}">${escapeHtml(a.name)}</a>`).join(', ')}${list.length > 5 ? '…' : ''}</dd></dl>
  <p><a class="button-link" href="@/stones/${s.id}.html">Open the ${escapeHtml(s.name)} page →</a></p></div>
</section>`;
    }).join('');
    return `<div class="stone-selector"><div role="tablist" aria-label="Infinity Stones" class="selector-tabs">${tabs}</div>${panels}</div>`;
  },

  itemgallery() {
    const chips = categories.map((c) => `<button type="button" class="filter-chip" data-filter-category="${c.id}" aria-pressed="false">${escapeHtml(c.name)}</button>`).join('');
    const tiles = items.map((item) => `<li class="item-tile" id="${itemAnchor(item)}" data-category="${item.category}" data-text="${escapeHtml(`${item.name} ${item.id}`.toLowerCase())}">
  <button type="button" class="item-open" aria-haspopup="dialog">${img(item.img, '', 'px item-img')}<span>${escapeHtml(item.name)}</span></button>
  <template>${itemDetail(item)}</template>
</li>`).join('\n');
    return `<div class="filter-panel" data-filter-list="items">
  <div class="filter-row"><label class="visually-hidden" for="item-filter">Filter items</label>
  <input id="item-filter" class="filter-input" type="search" placeholder="Filter by name or ID (e.g. uru, infinity:orb)…" autocomplete="off"></div>
  <div class="filter-chips" role="group" aria-label="Filter by category">${chips}</div>
  <p class="filter-count" aria-live="polite"><span data-count>${items.length}</span> of ${items.length} items</p>
  <ul class="item-grid">${tiles}</ul>
  <p class="filter-empty" hidden>No items match.</p>
</div>
<dialog class="item-dialog" aria-label="Item details"><button type="button" class="dialog-close" aria-label="Close">×</button><div class="dialog-body"></div></dialog>`;
  },

  itemcards(ids) {
    return `<div class="item-cards">${ids.map((id) => {
      const item = getItem(id);
      return `<div class="item-card">${itemDetail(item)}</div>`;
    }).join('')}</div>`;
  },

  skingallery() {
    return `<div class="skin-grid">${skins.map((skin) => `<article class="skin-card" id="skin-${slugify(skin.id)}">
  <button type="button" class="skin-zoom" data-zoom="@/assets/img/skin-renders/${skin.id}.png" data-caption="${escapeHtml(skin.title)}" aria-label="Enlarge ${escapeHtml(skin.title)}">${img(`skin-renders/${skin.id}.png`, skin.title, 'px skin-img')}</button>
  <h3 class="no-toc">${escapeHtml(skin.title)}</h3>
  <p class="skin-unlock">${skin.secret
    ? `<span>Unlock:</span> <button type="button" class="spoiler" aria-label="Reveal unlock item">Reveal</button><span class="spoiler-text" hidden>${escapeHtml(skin.unlock)}</span>`
    : `<span>Unlock:</span> ${escapeHtml(skin.unlock)}`}</p>
  ${skin.notes ? `<p class="skin-notes">${escapeHtml(skin.notes)}</p>` : ''}
  <code>${escapeHtml(skin.id)}</code>
</article>`).join('')}</div>`;
  },

  pagecards(files, options, ctx) {
    return `<div class="page-cards">${files.map((file) => {
      const [path, iconOverride] = file.split('|');
      const page = ctx.pages?.[path];
      return `<a class="page-card" href="@/${path}">${iconOverride || page?.meta.icon ? img(iconOverride || page.meta.icon) : ''}<span><strong>${escapeHtml(page?.meta.title || path)}</strong><small>${escapeHtml(page?.meta.description || '')}</small></span></a>`;
    }).join('')}</div>`;
  },

  reference([what]) {
    if (what === 'other') {
      return `<div class="table-wrap"><table><thead><tr><th>Kind</th><th>ID</th><th>What it is</th></tr></thead><tbody>${
        otherTypes.map(([kind, id, desc]) => `<tr><td>${escapeHtml(kind)}</td><td><code>${escapeHtml(id)}</code></td><td>${escapeHtml(desc)}</td></tr>`).join('')}</tbody></table></div>`;
    }
    const list = what === 'conditions' ? conditions : abilityTypes;
    if (!list) throw new Error(`unknown reference ${what}`);
    return list.map((entry) => `<h3 id="${slugify(entry.id)}"><code>${escapeHtml(entry.id)}</code></h3>
<p>${escapeHtml(entry.desc)}</p>
${entry.props.length ? `<div class="table-wrap"><table><thead><tr><th>Property</th><th>Default</th><th>Description</th></tr></thead><tbody>${
  entry.props.map(([name, def, desc]) => `<tr><td><code>${escapeHtml(name)}</code></td><td><code>${escapeHtml(def)}</code></td><td>${escapeHtml(desc)}</td></tr>`).join('')}</tbody></table></div>` : ''}`).join('\n');
  },

  figure(args, options) {
    return `<figure class="figure"><button type="button" class="zoomable" data-zoom="@/assets/img/${options.src}" data-caption="${escapeHtml(options.caption || '')}" aria-label="Enlarge image">`
      + `<img src="@/assets/img/${options.src}" alt="${escapeHtml(options.alt || options.caption || '')}" class="${options.pixel === 'false' ? '' : 'px'}" loading="lazy"></button>`
      + `${options.caption ? `<figcaption>${options.caption}</figcaption>` : ''}</figure>`;
  },
};
