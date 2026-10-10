// 7.3 items: mostly the same as 8.0, with the per-stone Cosmi-Rods, the separate Empty Eye of Agamotto
// and no Temple Beacon. Descriptions that differ in 7.3 are overridden here.
import { items as current, categories } from '../../8.0/data/items.mjs';

const R = (id) => `renders/${id}.png`;

const overrides = {
  'infinity:infinity_gauntlet': {
    obtain: 'Craftable, or cast with Tinkers\' Construct (see JEI). Needs the Infinity Gauntlet Cast.',
    desc: 'Six stone slots, one fixed slot per stone, opened through the CoreWithStuff menu. Wear it in the off hand or the Curios hands slot.',
  },
  'infinity:cosmi-rod': {
    desc: 'Ronan\'s Universal Weapon. Right-click it in your main hand with a stone in your off hand to turn it into that stone\'s Cosmi-Rod.',
  },
  'infinity:eye_of_agamotto': {
    desc: 'Agamotto\'s amulet with the Time Stone in it. Gives the Time Stone\'s power held in either hand, on your chest or in the Curios necklace slot. Hit it on the ground to get the stone out.',
  },
  'infinity:black_hole': { page: 'stones/space.html#black-hole-on' },
};
for (const [id, name] of [['space', 'Space'], ['mind', 'Mind'], ['reality', 'Reality'], ['power', 'Power'], ['time', 'Time'], ['soul', 'Soul']]) {
  overrides[`infinity:${id}_stone`] = {
    desc: `Gives the ${name} Stone's power while held, in the Infinity Gauntlet or in its Cosmi-Rod${id === 'mind' ? ', and in the Curios head slot' : ''}. Doesn't despawn or burn when dropped.`,
  };
}

const stoneRods = [
  ['power', 'Power'], ['space', 'Space'], ['reality', 'Reality'], ['soul', 'Soul'], ['time', 'Time'], ['mind', 'Mind'],
].map(([id, name]) => ({
  id: `infinity:cosmi-rod_${id}`, name: `Cosmi-Rod (${name} Stone)`, category: 'weapon', img: R(`cosmi-rod_${id}`), rarity: 'Epic',
  page: 'containers.html#cosmi-rod',
  obtain: `Put the ${name} Stone in a Cosmi-Rod.`,
  desc: `A Cosmi-Rod with the ${name} Stone in it. Gives the ${name} Stone's power in your main hand. Sneak and right-click to take the stone out.`,
}));

export const items = [
  ...current
    .filter((item) => item.id !== 'infinity:temple_beacon')
    .map((item) => (overrides[item.id] ? { ...item, ...overrides[item.id] } : item))
    .flatMap((item) => (item.id === 'infinity:cosmi-rod' ? [item, ...stoneRods] : [item])),
  {
    id: 'infinity:empty_eye_of_agamotto', name: 'Empty Eye of Agamotto', category: 'container', img: R('empty_eye_of_agamotto'),
    rarity: 'Epic', page: 'containers.html#eye-of-agamotto',
    obtain: 'Left behind when you take the Time Stone out of the Eye of Agamotto.',
    desc: 'The Eye without its stone. Can be worn on the chest or in the Curios necklace slot.',
  },
];

export { categories };
