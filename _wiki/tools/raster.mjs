// A tiny software rasterizer shared by the model renderers: textured quads in view space (x right, y up, z towards
// the viewer) in, an antialiased transparent PNG out. Orthographic, depth tested, nearest-neighbour texture sampling.
import { encodePng } from './png.mjs';

/** Light per world direction, like the GUI item lighting: top brightest, the two front sides darker. */
export function shadeFor(normal) {
  const light = [-0.35, 0.85, 0.4];
  const length = Math.hypot(...light);
  const dot = (normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]) / length;
  return 0.55 + 0.45 * Math.max(0, dot);
}

export function rotate([x, y, z], axis, degrees) {
  const a = degrees * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  if (axis === 'x') return [x, y * c - z * s, y * s + z * c];
  if (axis === 'y') return [x * c + z * s, y, -x * s + z * c];
  return [x * c - y * s, x * s + y * c, z];
}

/**
 * quads: [{ points: [4 × [x, y, z]], uvs: [4 × [u, v]] (0..1 of the texture), texture: { width, height, data },
 * shade: 0..1, emissive?: true (drawn over the colour at its spot, ignoring depth ties) }]. Returns a PNG buffer, or
 * null when nothing is drawn. The model is fitted to fill `fill` of the image.
 */
export function rasterize(quads, size = 128, fill = 0.9) {
  if (!quads.length) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const quad of quads) for (const p of quad.points) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const ss = 3; // supersampling
  const big = size * ss;
  const scale = (big * fill) / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const toScreen = (p) => [big / 2 + (p[0] - cx) * scale, big / 2 - (p[1] - cy) * scale, p[2]];

  const color = new Float32Array(big * big * 4);
  const depth = new Float32Array(big * big).fill(-Infinity);
  const draw = (quad) => {
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
          if (quad.emissive ? z < depth[index] - 0.01 : z <= depth[index]) continue;
          const u = w0 * t0[0] + w1 * t1[0] + w2 * t2[0];
          const v = w0 * t0[1] + w1 * t1[1] + w2 * t2[1];
          const tx = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
          const ty = Math.min(height - 1, Math.max(0, Math.floor(v * height)));
          const ti = (ty * width + tx) * 4;
          const alpha = data[ti + 3] / 255;
          if (alpha < 0.1) continue;
          if (!quad.emissive) depth[index] = z;
          color[index * 4] = data[ti] * quad.shade;
          color[index * 4 + 1] = data[ti + 1] * quad.shade;
          color[index * 4 + 2] = data[ti + 2] * quad.shade;
          color[index * 4 + 3] = quad.emissive ? Math.max(alpha, color[index * 4 + 3]) : alpha;
        }
      }
    }
  };
  for (const quad of quads) if (!quad.emissive) draw(quad);
  for (const quad of quads) if (quad.emissive) draw(quad);

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
