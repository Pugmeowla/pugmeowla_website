// Renders a Minecraft (Blockbench) JSON item model to a PNG icon, the way it looks in an inventory slot:
// the model's own display.gui rotation (or the vanilla block angle), orthographic, faces shaded by direction.
import fs from 'node:fs';
import path from 'node:path';
import { decodePng } from './png.mjs';
import { rasterize, rotate, shadeFor } from './raster.mjs';

const textureCache = new Map();

function loadTexture(assets, ref) {
  const [namespace, rest] = ref.includes(':') ? ref.split(':') : ['minecraft', ref];
  const file = path.join(assets, namespace, 'textures', `${rest}.png`);
  if (!textureCache.has(file)) {
    textureCache.set(file, fs.existsSync(file) ? decodePng(fs.readFileSync(file)) : null);
  }
  return textureCache.get(file);
}

function loadModel(assets, ref) {
  const [namespace, rest] = ref.includes(':') ? ref.split(':') : ['minecraft', ref];
  const file = path.join(assets, namespace, 'models', `${rest}.json`);
  if (!fs.existsSync(file)) return null;
  const model = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (model.parent && !/^(minecraft:)?(item|block)\/(generated|handheld)$/.test(model.parent)) {
    const parent = loadModel(assets, model.parent);
    if (parent) {
      return {
        ...parent, ...model,
        textures: { ...(parent.textures || {}), ...(model.textures || {}) },
        elements: model.elements || parent.elements,
        display: { ...(parent.display || {}), ...(model.display || {}) },
      };
    }
  }
  return model;
}

export const FACES = {
  north: { corners: (a, b) => [[b[0], b[1], a[2]], [a[0], b[1], a[2]], [a[0], a[1], a[2]], [b[0], a[1], a[2]]], normal: [0, 0, -1],
    uv: (a, b) => [16 - b[0], 16 - b[1], 16 - a[0], 16 - a[1]] },
  south: { corners: (a, b) => [[a[0], b[1], b[2]], [b[0], b[1], b[2]], [b[0], a[1], b[2]], [a[0], a[1], b[2]]], normal: [0, 0, 1],
    uv: (a, b) => [a[0], 16 - b[1], b[0], 16 - a[1]] },
  west: { corners: (a, b) => [[a[0], b[1], a[2]], [a[0], b[1], b[2]], [a[0], a[1], b[2]], [a[0], a[1], a[2]]], normal: [-1, 0, 0],
    uv: (a, b) => [a[2], 16 - b[1], b[2], 16 - a[1]] },
  east: { corners: (a, b) => [[b[0], b[1], b[2]], [b[0], b[1], a[2]], [b[0], a[1], a[2]], [b[0], a[1], b[2]]], normal: [1, 0, 0],
    uv: (a, b) => [16 - b[2], 16 - b[1], 16 - a[2], 16 - a[1]] },
  up: { corners: (a, b) => [[a[0], b[1], a[2]], [b[0], b[1], a[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]], normal: [0, 1, 0],
    uv: (a, b) => [a[0], a[2], b[0], b[2]] },
  down: { corners: (a, b) => [[a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], a[1], a[2]], [a[0], a[1], a[2]]], normal: [0, -1, 0],
    uv: (a, b) => [a[0], 16 - b[2], b[0], 16 - a[2]] },
};

export function renderModel(assets, ref, size = 128, textureOverrides = {}) {
  const loaded = loadModel(assets, ref);
  const model = loaded && { ...loaded, textures: { ...(loaded.textures || {}), ...textureOverrides } };
  if (model && !model.elements && model.textures?.all) {
    // minecraft:block/cube_all, which isn't in the mod's resources.
    const face = { texture: '#all' };
    model.elements = [{ from: [0, 0, 0], to: [16, 16, 16],
      faces: Object.fromEntries(Object.keys(FACES).map((name) => [name, face])) }];
  }
  if (!model || !model.elements) return null;
  const resolve = (key) => {
    let value = key;
    for (let i = 0; i < 8 && value && value.startsWith('#'); i++) value = model.textures?.[value.slice(1)];
    return value;
  };
  const gui = model.display?.gui?.rotation || [30, 225, 0];
  const view = (p) => {
    let v = [p[0] - 8, p[1] - 8, p[2] - 8];
    v = rotate(v, 'z', gui[2]);
    v = rotate(v, 'y', gui[1]);
    v = rotate(v, 'x', gui[0]);
    return v;
  };

  const quads = [];
  for (const element of model.elements) {
    const from = element.from, to = element.to;
    const transform = (p) => {
      const r = element.rotation;
      if (!r || !r.angle) return p;
      const o = r.origin || [8, 8, 8];
      const q = rotate([p[0] - o[0], p[1] - o[1], p[2] - o[2]], r.axis, r.angle);
      return [q[0] + o[0], q[1] + o[1], q[2] + o[2]];
    };
    for (const [name, face] of Object.entries(element.faces || {})) {
      const definition = FACES[name];
      if (!definition) continue;
      const texture = loadTexture(assets, resolve(face.texture) || '');
      if (!texture) continue;
      const uv = face.uv || definition.uv(from, to);
      const corners = definition.corners(from, to).map(transform);
      const r = element.rotation;
      const worldNormal = r && r.angle ? rotate(definition.normal, r.axis, r.angle) : definition.normal;
      const uvCorners = [[uv[0], uv[1]], [uv[2], uv[1]], [uv[2], uv[3]], [uv[0], uv[3]]];
      const steps = ((face.rotation || 0) / 90) % 4;
      const mapped = [0, 1, 2, 3].map((i) => uvCorners[(i - steps + 4) % 4]);
      quads.push({
        points: corners.map(view), uvs: mapped.map(([u, v]) => [u / 16, v / 16]), texture,
        shade: element.shade === false ? 1 : shadeFor(worldNormal),
      });
    }
  }
  return rasterize(quads, size);
}
