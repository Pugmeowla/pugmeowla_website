// Renders a Minecraft (Blockbench) JSON item model to a PNG icon, the way it looks in an inventory slot:
// the model's own display.gui rotation (or the vanilla block angle), orthographic, faces shaded by direction.
import fs from 'node:fs';
import path from 'node:path';
import { decodePng, encodePng } from './png.mjs';

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

function rotate([x, y, z], axis, degrees) {
  const a = degrees * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  if (axis === 'x') return [x, y * c - z * s, y * s + z * c];
  if (axis === 'y') return [x * c + z * s, y, -x * s + z * c];
  return [x * c - y * s, x * s + y * c, z];
}

const FACES = {
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

/** Light per world direction, like the GUI item lighting: top brightest, the two front sides darker. */
function shadeFor(normal) {
  const light = [-0.35, 0.85, 0.4];
  const length = Math.hypot(...light);
  const dot = (normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]) / length;
  return 0.55 + 0.45 * Math.max(0, dot);
}

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
        points: corners.map(view), uvs: mapped, texture,
        shade: element.shade === false ? 1 : shadeFor(worldNormal),
      });
    }
  }
  if (!quads.length) return null;

  // Fit the projected model into the image.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const quad of quads) for (const p of quad.points) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const ss = 3; // supersampling
  const big = size * ss;
  const scale = (big * 0.9) / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const toScreen = (p) => [big / 2 + (p[0] - cx) * scale, big / 2 - (p[1] - cy) * scale, p[2]];

  const color = new Float32Array(big * big * 4);
  const depth = new Float32Array(big * big).fill(-Infinity);
  for (const quad of quads) {
    const s = quad.points.map(toScreen);
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) {
      const p0 = s[a], p1 = s[b], p2 = s[c];
      const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]);
      if (Math.abs(area) < 1e-6) continue;
      const x0 = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
      const x1 = Math.min(big - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
      const y0 = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
      const y1 = Math.min(big - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));
      const t0 = quad.uvs[a], t1 = quad.uvs[b], t2 = quad.uvs[c];
      const { width, height, data } = quad.texture;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((p1[0] - px) * (p2[1] - py) - (p2[0] - px) * (p1[1] - py)) / area;
          const w1 = ((p2[0] - px) * (p0[1] - py) - (p0[0] - px) * (p2[1] - py)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
          const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
          const index = y * big + x;
          if (z <= depth[index]) continue;
          const u = (w0 * t0[0] + w1 * t1[0] + w2 * t2[0]) / 16;
          const v = (w0 * t0[1] + w1 * t1[1] + w2 * t2[1]) / 16;
          const tx = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
          const ty = Math.min(height - 1, Math.max(0, Math.floor(v * height)));
          const ti = (ty * width + tx) * 4;
          const alpha = data[ti + 3] / 255;
          if (alpha < 0.1) continue;
          depth[index] = z;
          color[index * 4] = data[ti] * quad.shade;
          color[index * 4 + 1] = data[ti + 1] * quad.shade;
          color[index * 4 + 2] = data[ti + 2] * quad.shade;
          color[index * 4 + 3] = alpha;
        }
      }
    }
  }

  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < ss; dy++) for (let dx = 0; dx < ss; dx++) {
        const i = ((y * ss + dy) * big + x * ss + dx) * 4;
        const alpha = color[i + 3];
        r += color[i] * alpha; g += color[i + 1] * alpha; b += color[i + 2] * alpha; a += alpha;
      }
      const o = (y * size + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.round(a / (ss * ss) * 255);
      }
    }
  }
  return encodePng({ width: size, height: size, data: out });
}
