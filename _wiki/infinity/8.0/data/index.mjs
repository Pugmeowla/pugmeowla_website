// Everything the 8.0 pages and macros read.
import { abilities as list } from './abilities.mjs';
import { trees } from './trees.mjs';

export { stones } from './stones.mjs';
export { groups } from './abilities.mjs';
// Abilities with a skill tree spot get pos, so {{abilities ... notree=1}} can leave them out.
const spot = (a) => trees[a.group]?.find((n) => n.ability === a.key)?.pos;
export const abilities = list.map((a) => (spot(a) ? { ...a, pos: spot(a) } : a));
export { trees };
export { items, categories } from './items.mjs';
export { skins } from './skins.mjs';
export { abilityTypes, conditions, otherTypes } from './reference.mjs';
export { mods } from './mods.mjs';
export { recipes } from './recipes.mjs';
