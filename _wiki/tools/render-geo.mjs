// Renders a GeckoLib (Bedrock) .geo.json model to a PNG, the way GeckoLib draws it: bones with pivots and rotations,
// cubes with per-face or box UVs, inflate and their own rotation, and an optional emissive glow texture on top.
// Used for the gauntlet skins, whose worn models are geo models on the player's left arm.
import fs from 'node:fs';
import { decodePng } from './png.mjs';
import { FACES } from './render-model.mjs';
import { rasterize, rotate, shadeFor } from './raster.mjs';

const loadPng = (file) => (file && fs.existsSync(file) ? decodePng(fs.readFileSync(file)) : null);

// GeckoLib mirrors Bedrock's X axis into Minecraft's (Blockbench does the same when it exports), and flips X and Y
// rotations to match.
const toJava = ([x, y, z]) => [-x, y, z];
const rotationToJava = (r = [0, 0, 0]) => [-r[0], -r[1], r[2]];

/** Rotates around a pivot X first, then Y, then Z, like GeckoLib's pose stack. */
function rotateAround(point, pivot, [rx, ry, rz]) {
  let v = [point[0] - pivot[0], point[1] - pivot[1], point[2] - pivot[2]];
  if (rx) v = rotate(v, 'x', rx);
  if (ry) v = rotate(v, 'y', ry);
  if (rz) v = rotate(v, 'z', rz);
  return [v[0] + pivot[0], v[1] + pivot[1], v[2] + pivot[2]];
}

/** Box UV in Blockbench's layout, as [u0, v0, u1, v1] per face relative to the cube's uv. */
function boxUv([sx, sy, sz]) {
  return {
    north: [sz, sz, sz + sx, sz + sy],
    east: [0, sz, sz, sz + sy],
    south: [sz * 2 + sx, sz, sz * 2 + sx * 2, sz + sy],
    west: [sz + sx, sz, sz * 2 + sx, sz + sy],
    up: [sz + sx, sz, sz, 0],
    down: [sz + sx * 2, 0, sz + sx, sz],
  };
}

/**
 * geoFile: the model. texture / glowTexture: PNG files. view: [pitch, yaw, roll] in degrees applied after the model's
 * own transforms. Returns a PNG buffer, or null if the model or texture is missing.
 */
export function renderGeo(geoFile, textureFile, { glowTexture = null, size = 128, view = [25, 210, 0], flip = true } = {}) {
  if (!fs.existsSync(geoFile)) return null;
  const texture = loadPng(textureFile);
  if (!texture) return null;
  const glow = loadPng(glowTexture);
  const geometry = JSON.parse(fs.readFileSync(geoFile, 'utf8'))['minecraft:geometry'][0];
  const texW = geometry.description.texture_width, texH = geometry.description.texture_height;
  const bones = Object.fromEntries((geometry.bones || []).map((bone) => [bone.name, bone]));

  // A point in a bone's space through the bone and every parent, outermost last.
  const throughBones = (point, bone) => {
    let p = point;
    for (let b = bone; b; b = b.parent ? bones[b.parent] : null) {
      if (b.rotation) p = rotateAround(p, toJava(b.pivot || [0, 0, 0]), rotationToJava(b.rotation));
    }
    return p;
  };
  const viewOf = (p) => {
    // The worn model hangs from the shoulder with the fingers down; turned over, the gauntlet stands upright.
    let v = flip ? rotate(p, 'z', 180) : p;
    v = rotate(v, 'y', view[1]);
    v = rotate(v, 'x', view[0]);
    return view[2] ? rotate(v, 'z', view[2]) : v;
  };

  const quads = [];
  for (const bone of geometry.bones || []) {
    for (const cube of bone.cubes || []) {
      const inflate = cube.inflate || 0;
      const [sx, sy, sz] = cube.size;
      const ox = -(cube.origin[0] + sx);
      const from = [ox - inflate, cube.origin[1] - inflate, cube.origin[2] - inflate];
      const to = [ox + sx + inflate, cube.origin[1] + sy + inflate, cube.origin[2] + sz + inflate];
      const cubeRotation = cube.rotation ? rotationToJava(cube.rotation) : null;
      const cubePivot = toJava(cube.pivot || [0, 0, 0]);
      const place = (p) => throughBones(cubeRotation ? rotateAround(p, cubePivot, cubeRotation) : p, bone);
      const box = Array.isArray(cube.uv) ? boxUv(cube.size) : null;
      for (const [name, definition] of Object.entries(FACES)) {
        let rect;
        if (box) {
          const r = box[name];
          rect = [cube.uv[0] + r[0], cube.uv[1] + r[1], cube.uv[0] + r[2], cube.uv[1] + r[3]];
        } else {
          const face = cube.uv?.[name];
          if (!face) continue;
          const [w, h] = face.uv_size || [0, 0];
          rect = [face.uv[0], face.uv[1], face.uv[0] + w, face.uv[1] + h];
        }
        const uvCorners = [[rect[0], rect[1]], [rect[2], rect[1]], [rect[2], rect[3]], [rect[0], rect[3]]]
          .map(([u, v]) => [u / texW, v / texH]);
        const corners = definition.corners(from, to).map(place);
        // The normal after the cube's and bones' rotations, for shading.
        const origin = place([0, 0, 0]);
        const tip = place(definition.normal);
        const normal = viewOf([tip[0] - origin[0], tip[1] - origin[1], tip[2] - origin[2]]);
        const points = corners.map(viewOf);
        const shade = shadeFor([normal[0], normal[1], normal[2]]);
        quads.push({ points, uvs: uvCorners, texture, shade });
        if (glow) quads.push({ points, uvs: uvCorners, texture: glow, shade: 1, emissive: true });
      }
    }
  }
  return rasterize(quads, size, 0.86);
}
