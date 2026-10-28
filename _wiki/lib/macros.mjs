// {{macro args}} used inside pages. Each returns HTML. "@/" is the version root, "@w/" the wiki root (shared assets).
// createMacros(data) builds the macro set for one documented version from that version's data files.
import { escapeHtml, slugify, stripTags } from './util.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pictures of vanilla and Palladium ingredients, copied by tools/sync-ingredients.mjs.
const ingredientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../static/img/ingredients');

export function createMacros({ site, stones, abilities, groups, items, categories, skins = [],
  abilityTypes = [], conditions = [], otherTypes = [], recipes = [], trees = {} }) {
const stoneById = Object.fromEntries(stones.map((s) => [s.id, s]));
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));
const img = (src, alt = '', cls = 'px') => src
  ? `<img src="@w/assets/img/${src}" alt="${escapeHtml(alt)}" class="${cls}" loading="lazy">`
  : `<span class="${cls} img-missing" role="img" aria-label="${escapeHtml(alt || 'No image')}"></span>`;

const fullId = (id) => (id.includes(':') ? id : `${site.namespace}:${id}`);
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
// costName is singular, like "Aspect of Existence"; the plural adds an s to its first word.
const costLabel = (cost) => cost === null || cost === undefined ? 'No unlock needed' : cost === 0 ? 'Free unlock'
  : `${cost} ${cost === 1 ? site.costName : site.costName.replace(/^(\S+)/, '$1s')}`;

// The tags on an ability card or skill tree panel: how you use it, its cooldown, what it costs.
function abilityTags(ability) {
  const meta = [`<li class="tag tag-activation">${escapeHtml(ability.activation)}</li>`];
  if (ability.cooldown) meta.push(`<li class="tag">Cooldown ${seconds(ability.cooldown)}</li>`);
  // Wikis without an unlock currency (site.costName) show the skill-tree step in ability.unlock instead.
  if (site.costName) meta.push(`<li class="tag tag-cost">${costLabel(ability.cost)}</li>`);
  else if (ability.unlock) meta.push(`<li class="tag tag-cost">${escapeHtml(ability.unlock)}</li>`);
  if (ability.confirm) meta.push('<li class="tag tag-warn">Press twice to confirm</li>');
  return meta;
}

function abilityCard(ability) {
  const group = groups[ability.group];
  const stoneColor = stoneById[ability.group]?.color;
  const meta = abilityTags(ability);
  const requires = (ability.requires || []).map((key) => {
    const other = getAbility(`${ability.group}/${key}`);
    return `<a href="${abilityUrl(other)}">${escapeHtml(other.name)}</a>`;
  });
  const needs = (ability.needsStones || []).filter((id) => id !== ability.group || ability.needsStones.length === 6);
  const rest = `${requires.length ? `<p class="ability-req"><span>Requires</span> ${requires.join(', ')}</p>` : ''}
    ${needs.length ? `<p class="ability-req"><span>Needs stones</span> ${needs.map((id) => stoneChip(id)).join(' ')}</p>` : ''}
    ${ability.details || ''}
    <p class="ability-id"><code>${escapeHtml(group.power)}</code>${ability.type ? ` · <code>${escapeHtml(ability.type)}</code>` : ''}</p>`;
  // site.collapsibleAbilities: a one-line row (icon, name, summary cut short, how you use it) that opens to the rest.
  if (site.collapsibleAbilities) {
    return `<details class="ability-card ability-fold" id="${slugify(ability.key)}" data-group="${ability.group}"${stoneColor ? ` style="--accent:${stoneColor}"` : ''}>
  <summary><span class="ability-icon">${img(ability.icon, '')}</span><span class="ability-fold-text"><strong class="ability-name">${escapeHtml(ability.name)}</strong>`
      + `<span class="ability-summary">${ability.summary}</span></span></summary>
  <div class="ability-body"><ul class="tags">${meta.join('')}</ul>
    ${rest}
  </div>
</details>`;
  }
  return `<article class="ability-card" id="${slugify(ability.key)}" data-group="${ability.group}"${stoneColor ? ` style="--accent:${stoneColor}"` : ''}>
  <div class="ability-icon">${img(ability.icon, '')}</div>
  <div class="ability-body">
    <h3 class="ability-name no-toc">${escapeHtml(ability.name)}<a class="heading-anchor" href="#${slugify(ability.key)}" aria-label="Link to ${escapeHtml(ability.name)}">#</a></h3>
    <p class="ability-summary">${ability.summary}</p>
    <ul class="tags">${meta.join('')}</ul>
    ${requires.length ? `<p class="ability-req"><span>Requires</span> ${requires.join(', ')}</p>` : ''}
    ${needs.length ? `<p class="ability-req"><span>Needs stones</span> ${needs.map((id) => stoneChip(id)).join(' ')}</p>` : ''}
    ${ability.details || ''}
    <p class="ability-id"><code>${escapeHtml(group.power)}</code>${ability.type ? ` · <code>${escapeHtml(ability.type)}</code>` : ''}</p>
  </div>
</article>`;
}

function stoneChip(id) {
  const stone = stoneById[id];
  if (!stone) throw new Error(`unknown stone ${id}`);
  return `<a class="chip stone-chip" style="--accent:${stone.color}" href="@/stones/${id}.html">${img(`stones/${id}_stone.png`, '')}${escapeHtml(stone.name)}</a>`;
}

// ───── Crafting grids, shared by {{recipe}}, {{recipebook}} and the item popups ─────
const titleCase = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// A tag shows this wiki's own item of that material when there is one (#forge:ingots/titanium -> Titanium Ingot).
const TAG_KINDS = { ingots: 'ingot', plates: 'plate', dusts: 'dust', nuggets: 'nugget', storage_blocks: 'block', blocks: 'block', gems: 'gem' };
function ingredientCell(id, pic) {
  if (!id) return '<span class="craft-cell"></span>';
  let item = itemById[id.startsWith('#') ? '' : fullId(id)], label;
  if (id.startsWith('#')) {
    const [kind, material] = id.slice(1).split(':').pop().split('/');
    label = material ? `Any ${titleCase(material)} ${titleCase(TAG_KINDS[kind] || kind)}` : titleCase(kind);
    if (material && TAG_KINDS[kind]) item = itemById[`${site.namespace}:${material}_${TAG_KINDS[kind]}`];
  }
  if (item) return `<a class="craft-cell" href="@/items.html#${itemAnchor(item)}" title="${escapeHtml(label || item.name)}">${img(item.img, label || item.name)}</a>`;
  const name = label || titleCase(id.split(':').pop());
  const copied = !id.startsWith('#') && `${id.replace(':', '_')}.png`;
  if (!pic && copied && fs.existsSync(path.join(ingredientDir, copied))) pic = `ingredients/${copied}`;
  return `<span class="craft-cell" title="${escapeHtml(name)}">${pic ? img(pic, name) : `<small>${escapeHtml(name)}</small>`}</span>`;
}
function craftHtml(cells, out, count, station) {
  return `<div class="craft"><div class="craft-grid">${cells.join('')}</div><span class="craft-arrow" aria-hidden="true">${station ? `<small>${station}</small>` : ''}→</span>`
    + `<a class="craft-cell craft-out" href="@/items.html#${itemAnchor(out)}" title="${escapeHtml(out.name)}">${img(out.img, out.name)}${count > 1 ? `<b>${count}</b>` : ''}</a></div>`;
}
const recipeCard = (title, craft, note) => `<figure class="recipe">${title ? `<h4 class="recipe-title">${escapeHtml(title)}</h4>` : ''}${craft}`
  + `${note ? `<figcaption>${note}</figcaption>` : ''}</figure>`;
// A recipe from data/recipes.mjs, laid out in a 3 × 3 grid (shapeless ones fill it from the top left).
function dataRecipe(r) {
  const out = itemById[r.out];
  let cells;
  if (r.type === 'shaped') {
    cells = r.rows.concat(['', '', '']).slice(0, 3).flatMap((row) => [...row.padEnd(3, ' ')].map((c) => ingredientCell(c === ' ' ? '' : r.key[c])));
  } else if (r.type === 'smelting') {
    cells = [null, null, null, null, r.ingredients[0], null, null, null, null].map((id) => ingredientCell(id));
  } else {
    cells = [...r.ingredients, ...Array(9).fill(null)].slice(0, 9).map((id) => ingredientCell(id));
  }
  const note = [r.type === 'shapeless' ? 'Shapeless' : '', r.note || ''].filter(Boolean).join(' · ');
  return recipeCard(out.name, craftHtml(cells, out, r.count, r.type === 'smelting' ? 'Furnace' : ''), note);
}
const usableRecipes = recipes.filter((r) => itemById[r.out]);
const recipesFor = (id) => usableRecipes.filter((r) => r.out === id);

function itemDetail(item) {
  return `<div class="item-detail">
    <div class="item-detail-head">${img(item.img, item.name, 'px item-detail-img')}<div><h3 class="no-toc">${escapeHtml(item.name)}</h3></div></div>
    <code class="item-id">${escapeHtml(item.id)}</code>
    <p>${item.desc}</p>
    <dl><dt>How to get it</dt><dd>${item.obtain}</dd>${item.rarity ? `<dt>Rarity</dt><dd>${item.rarity}</dd>` : ''}
    <dt>Category</dt><dd>${escapeHtml(categories.find((c) => c.id === item.category).name)}</dd></dl>
    ${recipesFor(item.id).length ? `<div class="recipe-grid recipe-grid-small">${recipesFor(item.id).map(dataRecipe).join('')}</div>` : ''}
    ${item.page && item.page !== 'items.html' ? `<p><a class="button-link" href="@/${item.page}">Read more →</a></p>` : ''}
  </div>`;
}

const macros = {
  version: () => escapeHtml(site.label),

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
    // notree: only the ones that aren't in the group's {{skilltree}}.
    if (options.notree) list = list.filter((a) => !a.pos);
    if (!list.length) return '';
    if (options.only) {
      const keys = options.only.split(',');
      list = keys.map((key) => getAbility(`${group}/${key}`));
    }
    return `<div class="ability-list">${list.map(abilityCard).join('\n')}</div>`;
  },

  costtable([group]) {
    const list = abilities.filter((a) => a.group === group && a.cost !== null && a.cost !== undefined);
    const rows = list.map((a) => `<tr><td><a href="${abilityUrl(a)}">${escapeHtml(a.name)}</a></td><td>${a.cost === 0 ? 'Free' : a.cost}</td>`
      + `<td>${(a.requires || []).map((k) => escapeHtml(getAbility(`${group}/${k}`).name)).join(', ') || 'Nothing'}</td><td>${escapeHtml(a.activation)}</td></tr>`).join('');
    const total = list.reduce((sum, a) => sum + a.cost, 0);
    return `<div class="table-wrap"><table><thead><tr><th>Ability</th><th>Cost</th><th>Unlock after</th><th>Use</th></tr></thead>`
      + `<tbody>${rows}</tbody><tfoot><tr><td>Everything</td><td>${total}</td><td colspan="2"></td></tr></tfoot></table></div>`;
  },

  // Every stone's skill tree bought out, from the same costs as costtable, with how many temple chests or Shards that is.
  costtotals() {
    const totals = stones.map((s) => ({ stone: s, total: abilities
      .filter((a) => a.group === s.id && typeof a.cost === 'number').reduce((sum, a) => sum + a.cost, 0) }));
    const all = totals.reduce((sum, t) => sum + t.total, 0);
    const rows = totals.map(({ stone, total }) => `<tr><td><a href="@/stones/${stone.id}.html">${escapeHtml(stone.name)}</a></td>`
      + `<td>${total.toLocaleString('en-US')}</td></tr>`).join('');
    return `<div class="callout"><span class="callout-title">Fun fact: maxing out every stone</span>`
      + `<p>Buying every ability in all six skill trees takes <strong>${all.toLocaleString('en-US')}</strong> Aspects of Existence. `
      + `That's about ${Math.round(all / 2.5).toLocaleString('en-US')} Infinity Temple chests at 2.5 a chest, `
      + `or ${Math.ceil(all / 4).toLocaleString('en-US')} Shards of Existence crafted 4 at a time.</p>`
      + `<div class="table-wrap"><table><thead><tr><th>Stone</th><th>Aspects to max it</th></tr></thead><tbody>${rows}</tbody>`
      + `<tfoot><tr><td>All six</td><td>${all.toLocaleString('en-US')}</td></tr></tfoot></table></div></div>`;
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
  <dl><dt>Found in</dt><dd>${container}</dd><dt>Location</dt><dd><a href="@/structures.html#${s.anchor || slugify(s.structureName)}">${escapeHtml(s.structureName)}</a> (${escapeHtml(s.dimension)})</dd>
  <dt>Abilities</dt><dd>${list.length}, including ${list.slice(0, 5).map((a) => `<a href="${abilityUrl(a)}">${escapeHtml(a.name)}</a>`).join(', ')}</dd></dl>
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
  <div class="skin-views">
    <button type="button" class="skin-zoom skin-zoom-model" data-zoom="@w/assets/img/skin-models/${skin.id}.png" data-caption="${escapeHtml(skin.title)}, worn" aria-label="Enlarge ${escapeHtml(skin.title)} as worn">${img(`skin-models/${skin.id}.png`, `${skin.title} as worn`, 'px skin-model')}<span>Worn</span></button>
    <button type="button" class="skin-zoom" data-zoom="@w/assets/img/skins/${skin.id}.png" data-caption="${escapeHtml(skin.title)}, item" aria-label="Enlarge ${escapeHtml(skin.title)} item">${img(`skins/${skin.id}.png`, `${skin.title} item`, 'px skin-img')}<span>Item</span></button>
  </div>
  <h3 class="no-toc">${escapeHtml(skin.title)}</h3>
  <p class="skin-unlock">${!skin.unlock
    ? '<span>Unlock:</span> <em>Secret</em>'
    : skin.secret
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

  // A skill tree drawn like the in-game screen: nodes at their gui_position, elbow lines from each parent, and an info
  // panel for the node you click (wiki.js). Without JavaScript every panel shows, as a list. Nodes need pos: [x, y].
  // unit: pixels per gui_position unit (the board's size; it scrolls sideways when wider than the page).
  // bg: the power's background, a color (#64209c) or a tiled texture under assets/img (default: Alien Evolution's machined metal).
  skilltree([group], options) {
    // From data/trees.mjs when the wiki has it (every node in the game's tree, dummies too, with the game's parents);
    // otherwise from the abilities that have a pos.
    const tree = trees[group];
    const nodes = tree ? tree.map((n) => {
      const a = n.ability && getAbility(`${group}/${n.ability}`);
      return a ? { ...a, pos: n.pos, parents: n.parents, treeKey: n.key }
        : { group, key: n.key, treeKey: n.key, name: n.name, summary: n.summary || 'A step in the skill tree.', icon: n.icon, cost: n.cost,
          activation: 'Unlock', type: 'palladium:dummy', pos: n.pos, parents: n.parents, blank: /^dummy\d*$/.test(n.name) };
    }) : abilities.filter((a) => a.group === group && a.pos);
    if (!nodes.length) throw new Error(`no skill tree nodes in ${group}`);
    const byTreeKey = Object.fromEntries(nodes.map((n) => [n.treeKey || n.key, n]));
    const parentsOf = (n) => (n.parents ? n.parents.map((k) => byTreeKey[k]?.key) : n.requires || []).filter(Boolean);
    const xs = nodes.map((n) => n.pos[0]), ys = nodes.map((n) => n.pos[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const spanX = Math.max(...xs) - minX, spanY = Math.max(...ys) - minY;
    const unit = Number(options.unit || 150);
    const at = (n) => [(n.pos[0] - minX) * 100, (n.pos[1] - minY) * 100];
    const pct = (v, span) => (span ? (v / (span * 100)) * 100 : 50);
    const byKey = Object.fromEntries(nodes.map((n) => [n.key, n]));
    const lines = nodes.flatMap((n) => parentsOf(n).filter((k) => byKey[k]).map((k) => {
      const [x1, y1] = at(byKey[k]), [x2, y2] = at(n), mid = (x1 + x2) / 2;
      return `<path d="M${x1} ${y1}H${mid}V${y2}H${x2}" data-from="${k}" data-to="${n.key}"/>`;
    })).join('');
    const free = (n) => (site.costName ? !n.cost : n.unlock === 'Free');
    const live = nodes.filter((n) => !n.blank);
    const buttons = nodes.map((n) => {
      const [x, y] = at(n);
      const i = live.indexOf(n);
      // Blank filler slots (the game uses them to draw letters) are just empty frames.
      if (n.blank) return `<span class="st-node st-blank" style="left:${pct(x, spanX)}%;top:${pct(y, spanY)}%" aria-hidden="true"></span>`;
      // The node carries the entry's anchor, so links to <page>#<key> (search, the ability list) land on the tree.
      return `<button type="button" class="st-node${free(n) ? ' st-free' : ''}" id="${slugify(n.key)}" data-node="${n.key}" aria-pressed="${i === 0}" `
        + `style="left:${pct(x, spanX)}%;top:${pct(y, spanY)}%" title="${escapeHtml(n.name)}">${img(n.icon, n.name)}</button>`;
    }).join('');
    const link = (k) => `<a href="#${slugify(k)}" data-node-link="${k}">${escapeHtml(byKey[k].name)}</a>`;
    const panels = live.map((n, i) => {
      const needs = parentsOf(n).map((k) => (byKey[k] ? link(k) : macros.ab([`${group}/${k}`]))).join(', ');
      const children = live.filter((o) => parentsOf(o).includes(n.key)).map((o) => link(o.key)).join(', ');
      const gives = (n.gives || []).map((ref) => macros.ab([ref])).join(', ');
      const stonesNeeded = (n.needsStones || []).filter((id) => id !== n.group || n.needsStones.length === 6);
      return `<section class="st-info${i === 0 ? ' active' : ''}" data-info="${n.key}" aria-live="polite">
  <div class="st-info-head">${img(n.icon, '', 'px st-info-icon')}<div><h3 class="no-toc">${escapeHtml(n.name)}</h3><ul class="tags">${abilityTags(n).join('')}</ul></div></div>
  <p>${n.summary}</p>
  ${n.details || ''}
  <dl>${gives ? `<dt>Unlocks</dt><dd>${gives}</dd>` : ''}<dt>Needs</dt><dd>${needs || 'Nothing, it\'s a starting entry'}</dd>${children ? `<dt>Leads to</dt><dd>${children}</dd>` : ''}${stonesNeeded.length ? `<dt>Stones</dt><dd>${stonesNeeded.map((id) => stoneChip(id)).join(' ')}</dd>` : ''}</dl>
  <p class="ability-id"><code>${escapeHtml(groups[n.group].power)}</code> · <code>${escapeHtml(n.type || n.key)}</code></p>
</section>`;
    }).join('');
    const accent = stoneById[group]?.color;
    return `<div class="skill-tree" data-skill-tree${accent ? ` style="--accent:${accent}"` : ''}>
  <div class="st-scroll"${!options.bg ? '' : options.bg.startsWith('#') ? ` style="background-color:${options.bg};background-image:linear-gradient(rgba(8, 10, 8, 0.45), rgba(8, 10, 8, 0.45))"` : ` style="background-image:linear-gradient(rgba(8, 10, 8, 0.55), rgba(8, 10, 8, 0.55)),url(@w/assets/img/${options.bg})"`}><div class="st-board" style="width:${Math.max(spanX * unit, 60)}px;height:${Math.max(spanY * unit, 60)}px">
    <svg class="st-lines" viewBox="0 0 ${Math.max(spanX * 100, 1)} ${Math.max(spanY * 100, 1)}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
    ${buttons}
  </div></div>
  <div class="st-panels">${panels}</div>
</div>`;
  },

  // A crafting grid: {{recipe rows="ckc,lxr,cgc" c=alienevo:upgrade_crystal k=timeclock_key ... out=chronosapien_dna count=6}}.
  // title and note add a heading and a line under it; put several in <div class="recipe-grid"> to lay them out side by side.
  // Letters are lowercase; a space or "." is an empty slot. Items not in this wiki's list show their name, with a
  // picture from the options' img_<letter> when given.
  recipe(args, options) {
    const rows = options.rows.split(',').map((row) => row.padEnd(3, ' '));
    const cells = rows.flatMap((row) => [...row].map((c) => (c === ' ' || c === '.' ? ingredientCell('') : ingredientCell(options[c], options[`img_${c}`]))));
    const craft = craftHtml(cells, getItem(options.out), Number(options.count || 1));
    return options.title || options.note ? recipeCard(options.title, craft, options.note) : craft;
  },

  // Every recipe in data/recipes.mjs, one folding section per item category (materials start closed).
  recipebook() {
    return categories.map((c) => {
      const list = usableRecipes.filter((r) => itemById[r.out].category === c.id);
      if (!list.length) return '';
      return `<details class="fold-section"${c.id === 'material' || c.id === 'block' ? '' : ' open'}><summary>${escapeHtml(c.name)} <small>(${list.length})</small></summary>`
        + `<div class="recipe-grid">${list.map(dataRecipe).join('')}</div></details>`;
    }).join('\n');
  },

  // The recipes for some items: {{recipes infinity_gauntlet tesseract}}.
  recipes(ids) {
    const list = ids.flatMap((id) => recipesFor(fullId(id)));
    if (!list.length) throw new Error(`no recipes for ${ids.join(', ')}`);
    return `<div class="recipe-grid">${list.map(dataRecipe).join('')}</div>`;
  },


  figure(args, options) {
    return `<figure class="figure"><button type="button" class="zoomable" data-zoom="@w/assets/img/${options.src}" data-caption="${escapeHtml(options.caption || '')}" aria-label="Enlarge image">`
      + `<img src="@w/assets/img/${options.src}" alt="${escapeHtml(options.alt || options.caption || '')}" class="${options.pixel === 'false' ? '' : 'px'}" loading="lazy"></button>`
      + `${options.caption ? `<figcaption>${options.caption}</figcaption>` : ''}</figure>`;
  },
};

return macros;
}
