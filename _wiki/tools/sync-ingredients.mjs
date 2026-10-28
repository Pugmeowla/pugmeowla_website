// Copies the pictures of recipe ingredients that aren't this wiki's own items (vanilla, Palladium) into
// static/img/ingredients/<namespace>_<name>.png, where the {{recipe}} grids look for them.
// Usage: node tools/sync-ingredients.mjs --vanilla <assets/minecraft/textures folder> [--palladium <palladium-common jar>]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { decodePng, encodePng } from './png.mjs';
import os from 'node:os';
import { renderModel } from './render-model.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const vanilla = option('vanilla'), palladium = option('palladium');
if (!vanilla) {
  console.error('Usage: node tools/sync-ingredients.mjs --vanilla <assets/minecraft/textures> [--palladium <palladium-common jar>]');
  process.exit(1);
}
const out = path.join(here, '../static/img/ingredients');
fs.mkdirSync(out, { recursive: true });

// Every ingredient ID: the Infinity recipes, and the {{recipe}} macros in every page.
const ids = new Set();
const { recipes } = await import(pathToFileURL(path.join(here, '../infinity/8.0/data/recipes.mjs')));
for (const r of recipes) for (const id of [...Object.values(r.key || {}), ...(r.ingredients || [])]) ids.add(id);
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) {
      for (const m of fs.readFileSync(full, 'utf8').matchAll(/\{\{recipe [^}]*\}\}/g)) {
        for (const v of m[0].matchAll(/\s[a-z]=([a-z_]+:[a-z0-9_]+)/g)) ids.add(v[1]);
      }
    }
  }
})(here.replace(/tools$/, ''));

// An animated texture (frames stacked downwards) is cut to its first frame.
// The size is read from the PNG header, so paletted images that decodePng can't read still go through when they're square.
const square = (buffer) => {
  if (buffer.readUInt32BE(20) <= buffer.readUInt32BE(16)) return buffer;
  const png = decodePng(buffer);
  return encodePng({ width: png.width, height: png.width, data: png.data.subarray(0, png.width * png.width * 4) });
};
const fromJar = (entry) => {
  try { return execFileSync('unzip', ['-p', palladium, entry], { maxBuffer: 1 << 24 }); } catch { return null; }
};

let copied = 0;
const missing = [];
for (const id of [...ids].filter((id) => !id.startsWith('#'))) {
  const [ns, name] = id.split(':');
  let buffer = null;
  if (ns === 'minecraft') {
    // Items drawn from frames (clock_00.png) use their first one.
    const files = ['item', 'block'].flatMap((sub) => [`${sub}/${name}.png`, `${sub}/${name}_00.png`]);
    const file = files.map((f) => path.join(vanilla, f)).find((f) => fs.existsSync(f));
    if (file) buffer = fs.readFileSync(file);
  } else if (ns === 'palladium' && palladium) {
    buffer = fromJar(`assets/palladium/textures/item/${name}.png`);
    if (!buffer?.length) buffer = null;
  }
  if (buffer) { fs.writeFileSync(path.join(out, `${ns}_${name}.png`), square(buffer)); copied++; } else if (ns === 'minecraft' || ns === 'palladium') missing.push(id);
}
// An anvil icon for Minecraft Forge on the requirements lists. The texture folder has no models, so this is vanilla's
// anvil shape (block/template_anvil) rebuilt here and drawn like an inventory icon.
if (fs.existsSync(path.join(vanilla, 'block/anvil.png'))) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-anvil-'));
  fs.mkdirSync(path.join(tmp, 'minecraft/models/block'), { recursive: true });
  fs.symlinkSync(vanilla, path.join(tmp, 'minecraft/textures'));
  const all = (texture) => Object.fromEntries(['north', 'south', 'east', 'west', 'up', 'down'].map((f) => [f, { texture }]));
  const top = (body, up) => ({ ...all(body), up: { texture: up } });
  fs.writeFileSync(path.join(tmp, 'minecraft/models/block/anvil.json'), JSON.stringify({
    textures: { body: 'block/anvil', top: 'block/anvil_top' },
    elements: [
      { from: [2, 0, 2], to: [14, 4, 14], faces: all('#body') },
      { from: [4, 4, 3], to: [12, 5, 13], faces: all('#body') },
      { from: [6, 5, 4], to: [10, 10, 12], faces: all('#body') },
      { from: [3, 10, 0], to: [13, 16, 16], faces: top('#body', '#top') },
    ],
  }));
  const png = renderModel(tmp, 'minecraft:block/anvil', 128);
  if (png) { fs.writeFileSync(path.join(out, 'minecraft_anvil.png'), png); copied++; }
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`${copied} ingredient pictures into static/img/ingredients/${missing.length ? `; none found for ${missing.join(', ')}` : ''}`);
