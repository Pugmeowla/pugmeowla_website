// Copies and renders the Deus Chrono-Machina wiki's pictures into static/img/deus/: item icons (textures, or the
// block model drawn like the inventory does), the Clockwork ability icons, and the GeckoLib models of Clockwork's
// uniforms and the mod's mobs.
// Usage: node tools/render-deus.mjs <unzipped Deus Chrono-Machina jar> [--alienevo <unzipped Alien Evolution jar>]
// --alienevo adds the Alien Evolution crafting ingredients (Upgrade Chip, Upgrade Crystal, Galvan Metal).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, encodePng } from './png.mjs';
import { renderGeos } from './render-geo.mjs';
import { renderModel } from './render-model.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const jar = args[0];
if (!jar || jar.startsWith('--')) {
  console.error('Usage: node tools/render-deus.mjs <unzipped Deus Chrono-Machina jar> [--alienevo <unzipped Alien Evolution jar>]');
  process.exit(1);
}
const assets = path.join(jar, 'assets');
const out = path.join(here, '../static/img/deus');
for (const dir of ['items', 'icons', 'models']) fs.mkdirSync(path.join(out, dir), { recursive: true });

// An animated texture (frames stacked downwards) becomes its first frame.
function firstFrame(file) {
  const png = decodePng(fs.readFileSync(file));
  if (png.height <= png.width) return fs.readFileSync(file);
  return encodePng({ width: png.width, height: png.width, data: png.data.subarray(0, png.width * png.width * 4) });
}
const textureFile = (ref) => {
  const [ns, rest] = ref.includes(':') ? ref.split(':') : ['minecraft', ref];
  return path.join(assets, ns, 'textures', `${rest}.png`);
};

// ───── items ─────
let items = 0;
for (const file of fs.readdirSync(path.join(assets, 'chrono/models/item'))) {
  const id = file.replace(/\.json$/, '');
  // Compass needle frames, EMP states, alien icons, and spawn eggs the wiki does not show.
  if (/^compass_\d|^galvan_emp_o|_icon$|^kirara_hoshi/.test(id)) continue;
  const model = JSON.parse(fs.readFileSync(path.join(assets, 'chrono/models/item', file), 'utf8'));
  const target = path.join(out, 'items', `${id}.png`);
  // Spawn eggs, discs and the geo-rendered blocks have a flat texture of their own; a mural shows its carved front.
  const mural = id.match(/^ancient_chrono_mural_([ivx]+)_block$/);
  const flat = mural ? path.join(assets, `chrono/textures/block/mural_${mural[1]}_front.png`) : model.textures?.layer0 ? textureFile(model.textures.layer0) : path.join(assets, 'chrono/textures/item', `${id.replace(/_block$/, '')}.png`);
  if (fs.existsSync(flat)) {
    fs.writeFileSync(target, firstFrame(flat));
    items++;
    continue;
  }
  const png = renderModel(assets, `chrono:item/${id}`, 128);
  if (png) { fs.writeFileSync(target, png); items++; } else if (id !== 'ship_spawn_egg') console.warn(`no picture for ${id}`);
}
// The Galvan Compass and EMP show their default / switched-off texture.
fs.writeFileSync(path.join(out, 'items/galvan_compass.png'), firstFrame(path.join(assets, 'chrono/textures/item/compass_default.png')));
fs.writeFileSync(path.join(out, 'items/galvan_emp.png'), firstFrame(path.join(assets, 'chrono/textures/item/galvan_emp_off.png')));
const alienevo = option('alienevo');
if (alienevo) {
  for (const id of ['upgrade_chip', 'upgrade_crystal', 'galvan_metal']) {
    fs.writeFileSync(path.join(out, 'items', `${id}.png`), firstFrame(path.join(alienevo, 'assets/alienevo/textures/item', `${id}.png`)));
  }
}

// ───── ability icons, effect icons, logo ─────
const iconDir = path.join(assets, 'chrono_machina/textures/icon');
for (const file of fs.readdirSync(iconDir)) if (file.endsWith('.png')) fs.copyFileSync(path.join(iconDir, file), path.join(out, 'icons', file));
for (const file of fs.readdirSync(path.join(iconDir, 'chronosapien_upgrade'))) {
  fs.copyFileSync(path.join(iconDir, 'chronosapien_upgrade', file), path.join(out, 'icons', `upgrade_${file}`));
}
fs.copyFileSync(path.join(jar, 'logo.png'), path.join(out, 'logo.png'));

// ───── models ─────
const geo = (ns, name) => path.join(assets, ns, 'geo', `${name}.geo.json`);
const models = {
  // Clockwork's four Omnitrix uniforms, and the Upgrade fusion form.
  ...Object.fromEntries(['prototype', '10k', 'default', 'ov'].map((u) => [`clockwork_${u}`, [{
    geo: geo('chrono_machina', `chronosapien_${u}`),
    texture: path.join(assets, `chrono_machina/textures/models/aliens/alien_88/chronosapien_uniform_${u}.png`),
    glow: path.join(assets, `chrono_machina/textures/models/aliens/alien_88/chronosapien_glow_${u}_0.png`),
  }]])),
  clockwork_upgrade: [{
    geo: geo('chrono_machina', 'chronosapien_upgrade'),
    texture: path.join(assets, 'chrono_machina/textures/models/aliens/alien_88/chronosapien_upgrade_default.png'),
    glow: path.join(assets, 'chrono_machina/textures/models/aliens/alien_88/chronosapien_upgrade_glow_default.png'),
  }],
  ...Object.fromEntries(['time_beast', 'maltruant', 'exo_skull', 'subdora'].map((mob) => [mob, [{
    geo: geo('chrono', mob),
    texture: path.join(assets, `chrono/textures/models/aliens/${mob}/${mob}.png`),
    glow: path.join(assets, `chrono/textures/models/aliens/${mob}/${mob}_glow.png`),
  }]])),
  ship: [{ geo: geo('chrono', 'galvanic_mechamorph_ship'), texture: path.join(assets, 'chrono/textures/models/aliens/ship/galvanic_mechamorph_ship.png'),
    glow: path.join(assets, 'chrono/textures/models/aliens/ship/galvanic_mechamorph_ship_glow.png') }],
  time_bomb: [{ geo: geo('chrono', 'chronosapien_time_bomb'), texture: path.join(assets, 'chrono/textures/block/chronosapien_time_bomb_block.png'),
    glow: path.join(assets, 'chrono/textures/block/chronosapien_time_bomb_block_glow.png') }],
  ...Object.fromEntries(['key', 'gear', 'hex', 'part1', 'part2'].map((part) => [`maltruant_${part}_block`, [{
    geo: geo('chrono', `maltruant_${part}_block`), texture: path.join(assets, `chrono/textures/block/maltruant_${part}_block.png`),
  }]])),
};
let rendered = 0;
for (const [name, parts] of Object.entries(models)) {
  const usable = parts.filter((p) => fs.existsSync(p.geo) && fs.existsSync(p.texture));
  if (!usable.length) { console.warn(`no model for ${name}`); continue; }
  // Glow masks that aren't there are left out rather than skipping the model.
  const png = renderGeos(usable.map((p) => ({ ...p, glow: p.glow && fs.existsSync(p.glow) ? p.glow : null })), { size: 320 });
  fs.writeFileSync(path.join(out, 'models', `${name}.png`), png);
  rendered++;
}
console.log(`${items} items, ${rendered} models into static/img/deus/`);
