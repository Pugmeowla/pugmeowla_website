// Copies the images the wiki uses out of the mod's resources into _wiki/static/img, and renders the
// Infinity Stone icons (the mod's stone texture tinted with each stone's color, drawn as a small cube).
//
//   node _wiki/tools/sync-assets.mjs [path/to/mod]
//
// Only needed when the mod's textures change; the copied images are committed with the site.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { decodePng, encodePng } from './png.mjs';
import { renderModel } from './render-model.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const modDir = path.resolve(process.argv[2] || process.env.INFINITY_MOD_DIR
  || '/Users/andre/Desktop/stuff/modding/java/infinity');
const resources = path.join(modDir, 'common/src/main/resources');
const textures = path.join(resources, 'assets/infinity/textures');
const out = path.join(root, '_wiki/static/img');

if (!fs.existsSync(textures)) {
  console.error(`Mod resources not found at ${resources}. Pass the mod folder as an argument.`);
  process.exit(1);
}

function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  let count = 0;
  for (const name of fs.readdirSync(from)) {
    const source = path.join(from, name);
    if (fs.statSync(source).isFile() && name.endsWith('.png') && filter(name)) {
      fs.copyFileSync(source, path.join(to, name));
      count++;
    }
  }
  return count;
}

// Emissive (_e) and glow overlays aren't useful on their own.
const notOverlay = (name) => !/_e\.png$|_glow\.png$/.test(name);
// Item icons come from the model renders below.
console.log('skins', copyDir(path.join(textures, 'item/gauntlet_skins'), path.join(out, 'skins')));
console.log('icons', copyDir(path.join(textures, 'icon'), path.join(out, 'icons')));
console.log('blocks', copyDir(path.join(textures, 'block'), path.join(out, 'blocks')));
fs.mkdirSync(path.join(out, 'gui'), { recursive: true });
for (const name of ['infinity_gauntlet.png', 'portal.png']) {
  fs.copyFileSync(path.join(textures, 'gui', name), path.join(out, 'gui', name));
}
fs.copyFileSync(path.join(resources, 'logo.png'), path.join(out, 'logo.png'));

// The site's own project banner, shrunk for the wiki's hero (macOS sips; skipped elsewhere).
const banner = path.join(root, 'infinity.png');
if (fs.existsSync(banner)) {
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', '1400', banner,
      '--out', path.join(out, 'banner.jpg')], { stdio: 'ignore' });
    execFileSync('sips', ['-Z', '64', path.join(resources, 'logo.png'), '--out', path.join(out, 'favicon.png')],
      { stdio: 'ignore' });
  } catch {
    console.warn('sips unavailable: banner.jpg / favicon.png not regenerated');
  }
}

// Stone icons: textures/item/infinity_stone.png is LucraftCore's 6x6x6 box-UV cube (32x16 layout, here 4x).
const stoneTexture = decodePng(fs.readFileSync(path.join(textures, 'item/infinity_stone.png')));
const scale = stoneTexture.width / 32;
const n = 6 * scale;
const texel = (u, v) => {
  const i = (Math.floor(v) * stoneTexture.width + Math.floor(u)) * 4;
  return stoneTexture.data.subarray(i, i + 4);
};

function renderStone(hex, size) {
  const color = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const k = size / (2 * n) * 0.92;
  const c = Math.cos(Math.PI / 6);
  const data = Buffer.alloc(size * size * 4);
  const ox = size / 2, oy = size / 2;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const sx = (px + 0.5 - ox) / (c * k), sy = (py + 0.5 - oy) / k;
      let tex = null, shade = 1;
      // Top face (y = n): sx = x - z, sy = (x + z) / 2 - n
      const xt = (sx + 2 * (sy + n)) / 2, zt = (2 * (sy + n) - sx) / 2;
      if (xt >= 0 && xt < n && zt >= 0 && zt < n) { tex = texel(n + xt, zt); shade = 1; }
      else {
        // Front face (z = n): x = sx + n, y = (x + n) / 2 - sy
        const xf = sx + n, yf = (xf + n) / 2 - sy;
        if (xf >= 0 && xf < n && yf >= 0 && yf < n) { tex = texel(n + xf, 2 * n - 1 - yf); shade = 0.82; }
        else {
          // Right face (x = n): z = n - sx, y = (n + z) / 2 - sy
          const zr = n - sx, yr = (n + zr) / 2 - sy;
          if (zr >= 0 && zr < n && yr >= 0 && yr < n) { tex = texel(2 * n + (n - 1 - zr), 2 * n - 1 - yr); shade = 0.66; }
        }
      }
      if (!tex || tex[3] === 0) continue;
      const i = (py * size + px) * 4;
      for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.min(255, Math.round(tex[ch] * color[ch] / 255 * shade));
      data[i + 3] = 255;
    }
  }
  return encodePng({ width: size, height: size, data });
}

fs.mkdirSync(path.join(out, 'stones'), { recursive: true });
const stoneDir = path.join(resources, 'data/infinity/gauntlet_stones');
for (const file of fs.readdirSync(stoneDir)) {
  const stone = JSON.parse(fs.readFileSync(path.join(stoneDir, file), 'utf8'));
  const name = file.replace('.json', '');
  fs.writeFileSync(path.join(out, 'stones', `${name}.png`), renderStone(stone.color, 96));
  console.log('stone', name, stone.color);
}

// One icon per item: 3D item models are rendered like an inventory slot, flat ones use their layer0 texture.
const assets = path.join(resources, 'assets');
const models = path.join(assets, 'infinity/models/item');
const renders = path.join(out, 'renders');
fs.mkdirSync(renders, { recursive: true });
let rendered = 0;
for (const file of fs.readdirSync(models)) {
  const id = file.replace('.json', '');
  const model = JSON.parse(fs.readFileSync(path.join(models, file), 'utf8'));
  const layer0 = model.textures?.layer0;
  if (layer0) {
    const texture = path.join(assets, layer0.split(':')[0], 'textures', `${layer0.split(':')[1]}.png`);
    if (fs.existsSync(texture)) { fs.copyFileSync(texture, path.join(renders, `${id}.png`)); rendered++; }
    continue;
  }
  if (model.parent === 'infinity:item/infinity_stone') continue; // stones: see stones/
  const png = renderModel(assets, `infinity:item/${id}`, 128);
  if (png) { fs.writeFileSync(path.join(renders, `${id}.png`), png); rendered++; }
}
console.log('renders', rendered);

// Gauntlet skins in the inventory: the gauntlet item model with the skin's item texture.
const skinRenders = path.join(out, 'skin-renders');
fs.mkdirSync(skinRenders, { recursive: true });
for (const file of fs.readdirSync(path.join(textures, 'item/gauntlet_skins'))) {
  const id = file.replace('.png', '');
  const png = renderModel(assets, 'infinity:item/infinity_gauntlet', 128, { 0: `infinity:item/gauntlet_skins/${id}` });
  if (png) fs.writeFileSync(path.join(skinRenders, `${id}.png`), png);
}
console.log('skin renders', fs.readdirSync(skinRenders).length);
