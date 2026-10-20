// Renders the wiki's model pictures that sync-assets doesn't: things worn on the player (armor, effects, gauntlets from
// the addon mods with their stones in), Malekith, and the Infinity Generator's blocks. Writes static/img/models/.
// Usage: node tools/render-extras.mjs <infinity mod folder> [--addonpacks <folder>] [--generator <unzipped jar>]
//   [--omnitrix <folder>] [--vanilla <folder>]
// --omnitrix: a folder with the Alien Evolution, Into the Omniverse and Omnitrix Evolution jars unzipped into it, so the Infintrix gloves are
// drawn on their Omnitrix. --vanilla: the vanilla 1.20.1 client jar's and Forge universal jar's assets unzipped, for the
// items that only use vanilla or Forge models (the Temple Beacon and the molten metal buckets).
// The stones aren't part of any model (the mod draws them in code), so each is added as a glowing cube in its stone's
// color at the gauntlet's own stone positions.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, encodePng } from './png.mjs';
import { renderGeos } from './render-geo.mjs';
import { renderModel } from './render-model.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const modDir = args[0] && !args[0].startsWith('--') ? args[0] : process.env.INFINITY_MOD_DIR;
if (!modDir) {
  console.error('Usage: node tools/render-extras.mjs <infinity mod folder> [--addonpacks <folder>] [--generator <unzipped jar>]'
    + ' [--omnitrix <folder with unzipped Alien Evolution and Into the Omniverse jars>] [--vanilla <unzipped vanilla + Forge assets>]');
  process.exit(1);
}
const addonpacks = option('addonpacks') || path.join(modDir, 'forge/run/addonpacks');
const generatorJar = option('generator');
const omnitrixMods = option('omnitrix');
const assets = path.join(modDir, 'common/src/main/resources/assets');
const out = path.join(here, '../static/img/models');
fs.mkdirSync(out, { recursive: true });

const geo = (name, namespace = 'infinity', root = assets) => path.join(root, namespace, 'geo', `${name}.geo.json`);
const tex = (name, namespace = 'infinity', root = assets) => path.join(root, namespace, 'textures/models', `${name}.png`);
const player = (skin = 'pugmeowla', hide = []) => ({ geo: geo('player'), texture: tex(skin), hide });
// Just the left arm, for close-ups of what's worn on it.
const arm = () => player('pugmeowla', ['head', 'body', 'right_arm', 'right_leg', 'left_leg', 'hat', 'jacket', 'right_sleeve', 'right_pants', 'left_pants']);
const pack = (folder) => path.join(addonpacks, folder, 'assets');

// Solid-color stone cubes. Placements are the custom gauntlet format: {origin, size?, bone?}, in menu slot order
// (Space, Mind, Reality, Power, Time, Soul, as in the Infinity Gauntlet's menu).
const STONE_COLORS = ['#0255FF', '#FFD300', '#FF0130', '#C32AD1', '#13CF55', '#DE7300'];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-stones-'));
function stones(placements) {
  return placements.map((placement, slot) => {
    const color = STONE_COLORS[slot];
    const png = path.join(tmp, `stone${slot}.png`);
    const data = Buffer.alloc(16 * 16 * 4);
    for (let i = 0; i < 256; i++) {
      data[i * 4] = parseInt(color.slice(1, 3), 16); data[i * 4 + 1] = parseInt(color.slice(3, 5), 16);
      data[i * 4 + 2] = parseInt(color.slice(5, 7), 16); data[i * 4 + 3] = 255;
    }
    fs.writeFileSync(png, encodePng({ width: 16, height: 16, data }));
    const file = path.join(tmp, `stones_${Math.random().toString(36).slice(2)}.geo.json`);
    fs.writeFileSync(file, JSON.stringify({ 'minecraft:geometry': [{
      description: { texture_width: 16, texture_height: 16 },
      bones: [{ name: placement.bone || 'left_arm', pivot: [0, 0, 0],
        cubes: [{ origin: placement.origin, size: placement.size || [1, 0.9, 0.9], uv: [0, 0] }] }],
    }] }));
    return { geo: file, texture: png, emissive: true };
  });
}
// The Infinity Gauntlet's six sockets, which most custom gauntlets reuse.
const SOCKETS = [
  { origin: [7.65, 11.75, -1.15] }, { origin: [7.65, 13.25, -0.55] }, { origin: [7.65, 11.75, 0.15] },
  { origin: [7.65, 11.75, -2.35] }, { origin: [4.55, 12.15, -2.65], size: [0.9, 0.9, 0.9] }, { origin: [7.65, 11.75, 1.45] },
];
const sockets = (secondY) => SOCKETS.map((s, i) => (i === 1 ? { origin: [7.65, secondY, -0.55] } : s));
const gauntletFile = (folder, file) => JSON.parse(fs.readFileSync(path.join(addonpacks, folder, 'data/infinity/gauntlets', file), 'utf8'));

// Views: the whole body slightly from the front-left, or close on the left arm.
const BODY = { size: 220, view: [12, 200, 0] };
const LEFT_ARM = { size: 220, view: [20, 115, -55], fill: 0.9 };

const jobs = {
  malekith: [[player('malekith')], BODY],
  time_rings: [[player(), { geo: geo('time_rings'), texture: tex('time_rings'), emissive: true }], BODY],
  infinity_gauntlet_worn: [[arm(), { geo: geo('gauntlet'), texture: tex('gauntlet') }, ...stones(SOCKETS)], LEFT_ARM],
  snap_burn: [[arm(), { geo: geo('gauntlet'), texture: tex('gauntlet_burn') }, ...stones(SOCKETS)], LEFT_ARM],
  protocol_nano_gauntlet: [[arm(), { geo: geo('nano_gauntlet_85'), texture: tex('nano_gauntlet_85'), glow: tex('nano_gauntlet_85_glow') }, ...stones(SOCKETS)], LEFT_ARM],
  protocol_endosym_gauntlet: [[arm(), { geo: geo('endosym_gauntlet'), texture: tex('endosym_gauntlet'), glow: tex('endosym_gauntlet_glow') }, ...stones(SOCKETS)], LEFT_ARM],
};
// An Omnitrix's texture with part overlays on top, as the mod's render layer builds it. A new Prototype Omnitrix has
// every part score at -1 (no overlay), so its default look is the base texture alone.
function overlaid(base, overlays) {
  const image = decodePng(fs.readFileSync(base));
  const data = Buffer.from(image.data);
  for (const file of overlays.filter((f) => fs.existsSync(f))) {
    const top = decodePng(fs.readFileSync(file));
    if (top.width !== image.width || top.height !== image.height) continue;
    for (let i = 0; i < data.length; i += 4) {
      const a = top.data[i + 3] / 255;
      if (!a) continue;
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(top.data[i + c] * a + data[i + c] * (1 - a));
      data[i + 3] = Math.max(data[i + 3], top.data[i + 3]);
    }
  }
  const file = path.join(tmp, `overlaid_${Math.random().toString(36).slice(2)}.png`);
  fs.writeFileSync(file, encodePng({ width: image.width, height: image.height, data }));
  return file;
}
const omnitrix = {};
if (omnitrixMods) {
  const ae = path.join(omnitrixMods, 'assets/alienevo'), aeo = path.join(omnitrixMods, 'assets/aeo');
  const proto = path.join(ae, 'textures/models/prototype_omnitrix');
  omnitrix.prototype = [{ geo: path.join(ae, 'geo/prototype_omnitrix.geo.json'),
    texture: overlaid(path.join(proto, 'prototype.png'), ['base_primary', 'base_secondary', 'base_tertiary', 'buttons', 'core_side',
      'core_top', 'dial_inner', 'dial_outer', 'tubes'].map((part) => path.join(proto, part, `${part}_-1.png`))) }];
  // (Its glow texture is cut down by an alpha mask in game, so drawn whole it would cover the watch.)
  omnitrix.recal = [{ geo: path.join(ae, 'geo/recal_omnitrix.geo.json'), texture: path.join(ae, 'textures/models/recal_omnitrix/recal.png'),
    glow: path.join(ae, 'textures/models/recal_omnitrix/recal_glow.png') }];
  const oe = path.join(omnitrixMods, 'assets/omni_evo');
  omnitrix.ultimatrix = [{ geo: path.join(oe, 'geo/ult_omnitrix.geo.json'), texture: path.join(oe, 'textures/models/recal_omnitrix/ult.png'),
    glow: path.join(oe, 'textures/models/recal_omnitrix/recal_glow.png') }];
  omnitrix.omniverse = [{ geo: path.join(aeo, 'geo/completed_omnitrix.geo.json'), texture: path.join(aeo, 'textures/models/ov_omnitrix/completed.png'),
    glow: path.join(aeo, 'textures/models/glow/completed/omniverse_glow.png') },
  { geo: path.join(aeo, 'geo/completed_omnitrix_lid.geo.json'), texture: path.join(aeo, 'textures/models/ov_omnitrix/faceplates/faceplate_0_0.png') }];
}
const infintrix = pack('infintrix-3.0-beta-3.4');
if (fs.existsSync(infintrix)) {
  const glove = (name) => ({ geo: geo(name, 'infintrix', infintrix), texture: tex(name, 'infintrix', infintrix) });
  const slots = (file) => gauntletFile('infintrix-3.0-beta-3.4', file).slots;
  jobs.infintrix_prototype = [[arm(), ...(omnitrix.prototype || []), glove('prototype_infintrix'), ...stones(slots('prototype_omnitrix.json'))], LEFT_ARM];
  jobs.infintrix_recalibrated = [[arm(), ...(omnitrix.recal || []), glove('ult_infintrix'), ...stones(slots('recal_omnitrix.json'))], LEFT_ARM];
  jobs.infintrix_ultimatrix = [[arm(), ...(omnitrix.ultimatrix || []), glove('ult_infintrix'), ...stones(slots('ult_omnitrix.json'))], LEFT_ARM];
  if (omnitrix.omniverse) jobs.infintrix_omniverse = [[arm(), ...omnitrix.omniverse, ...stones(slots('omniverse_omnitrix.json'))], LEFT_ARM];
}
const wakanda = path.join(addonpacks, 'wakanda-1.0.0/assets/wakanda');
if (fs.existsSync(wakanda)) {
  jobs.wakanda_necklace = [[player(), { geo: path.join(wakanda, 'palladium/model_layers/black_panther_necklace.json'),
    texture: path.join(wakanda, 'textures/models/black_panther_necklace.png') },
  ...stones(gauntletFile('wakanda-1.0.0', 'black_panther_necklace.json').slots)], { size: 220, view: [10, 180, 0] }];
}

let count = 0;
for (const [name, [parts, options]] of Object.entries(jobs)) {
  const png = renderGeos(parts, options);
  if (png) { fs.writeFileSync(path.join(out, `${name}.png`), png); count++; } else console.warn(`couldn't render ${name}`);
}
if (generatorJar) {
  const jarAssets = path.join(generatorJar, 'assets');
  for (const stone of ['', '_power', '_space', '_reality', '_soul', '_time', '_mind']) {
    const png = renderModel(jarAssets, `infinitygenerator:block/infinity_generator${stone}`, 160);
    if (png) { fs.writeFileSync(path.join(out, `infinity_generator${stone}.png`), png); count++; }
  }
}
// The Temple Beacon is a vanilla beacon model, and the buckets are Forge's fluid container: the bucket with its fluid
// mask filled by the fluid's still texture (water_still for these) times the fluid's tint (InfinityFluids).
const vanilla = option('vanilla');
if (vanilla) {
  const renders = path.join(here, '../static/img/renders');
  const beacon = renderModel(path.join(vanilla, 'assets'), 'minecraft:block/beacon', 128);
  if (beacon) { fs.writeFileSync(path.join(renders, 'temple_beacon.png'), beacon); count++; }
  const read = (file) => decodePng(fs.readFileSync(path.join(vanilla, 'assets', file)));
  const bucket = read('minecraft/textures/item/bucket.png');
  const mask = read('forge/textures/item/mask/bucket_fluid.png');
  const water = read('minecraft/textures/block/water_still.png');
  for (const [name, tint] of [['molten_uru', 0xB32E08], ['molten_titanium', 0x404040],
    ['molten_gold_titanium_alloy', 0x635C1B], ['molten_ferro-titanium-gold_alloy', 0x8D7D57]]) {
    const data = Buffer.from(bucket.data);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const i = (y * 16 + x) * 4;
      if (mask.data[i + 3] < 128) continue;
      const w = (y * water.width + x) * 4; // the first animation frame
      data[i] = Math.round(water.data[w] * ((tint >> 16) & 255) / 255);
      data[i + 1] = Math.round(water.data[w + 1] * ((tint >> 8) & 255) / 255);
      data[i + 2] = Math.round(water.data[w + 2] * (tint & 255) / 255);
      data[i + 3] = 255;
    }
    fs.writeFileSync(path.join(renders, `${name}_bucket.png`), encodePng({ width: 16, height: 16, data }));
    count++;
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('models', count);
