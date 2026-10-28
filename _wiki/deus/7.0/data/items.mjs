// Registered items, from chrono/item/ItemRegistry, the block registry, the recipes in data/chrono_machina/recipes and the
// loot tables in data/chrono/loot_tables. img: path under assets/img. page: the wiki page with more detail.

const I = (id) => `deus/items/${id}.png`;

export const categories = [
  { id: 'dna', name: 'Chronosapien DNA' },
  { id: 'gadget', name: 'Galvan Gadgets' },
  { id: 'fragment', name: 'Maltruant Fragments' },
  { id: 'trophy', name: 'Trophies' },
  { id: 'block', name: 'Blocks' },
  { id: 'egg', name: 'Spawn Eggs' },
];

const fragment = (id, name) => ({
  id: `chrono:maltruant_${id}_block`, name, category: 'fragment', img: I(`maltruant_${id}`), rarity: 'Epic', page: 'maltruant.html',
  obtain: 'Generated once per world, buried 2,000 to 4,000 blocks from 0, 0 (Y −48 to −17). The Galvan Compass and <code>/chrono locate</code> find it.',
  desc: `One of Maltruant's five fragments. Getting within 16 blocks of it the first time opens time portals for Subdora and Exo-Skull. Place all five on the Maltruant Altar to summon Maltruant. Worn on Clockwork, it changes his look and gives him a stat bonus.`,
});

const egg = (id, name, desc) => ({ id: `chrono:${id}_spawn_egg`, name, category: 'egg', img: I(`${id}_spawn_egg`), obtain: 'Creative menu', desc });

const mural = (n) => ({
  id: `chrono:ancient_chrono_mural_${n}_block`, name: `Ancient Chrono Mural ${n.toUpperCase()}`, category: 'block',
  img: I(`ancient_chrono_mural_${n}_block`), page: 'world.html',
  obtain: 'Built into the Maltruant Altar. Drops itself when broken.', desc: 'One of twelve carved panels telling the Chronosapiens\' story. Collect all twelve for the Chronicle Curator advancement.',
});

export const items = [
  {
    id: 'chrono:timeclock_gear', name: 'Timeclock Gear', category: 'dna', img: I('timeclock_gear'), rarity: 'Rare', page: 'getting-dna.html',
    obtain: 'Time Beasts (2 to 4), Maltruant (6 to 12), Chrono Ore, and rare finds in village, bastion and archaeology loot, raids and piglin bartering. Six come from crafting a Timeclock Key back down.',
    desc: 'The basic part of Chronosapien DNA. Right-click it while transformed into the Chronosapien to raise a random attribute.',
  },
  {
    id: 'chrono:timeclock_chip1', name: 'Timeclock Chip I', category: 'dna', img: I('timeclock_chip1'), rarity: 'Rare', page: 'getting-dna.html',
    obtain: 'Crafted: Timeclock Gear, Upgrade Chip, Timeclock Gear in a column. Also converts from Chip II and back.',
    desc: 'A module of Chronosapien DNA. Goes on the left of the DNA recipe.',
  },
  {
    id: 'chrono:timeclock_chip2', name: 'Timeclock Chip II', category: 'dna', img: I('timeclock_chip2'), rarity: 'Rare', page: 'getting-dna.html',
    obtain: 'Crafted: Timeclock Gear, Upgrade Chip, Timeclock Gear in a row. Also converts from Chip I and back.',
    desc: 'A module of Chronosapien DNA. Goes on the right of the DNA recipe.',
  },
  {
    id: 'chrono:timeclock_core', name: 'Timeclock Core', category: 'dna', img: I('timeclock_core'), rarity: 'Rare', page: 'getting-dna.html',
    obtain: 'Crafted: an Upgrade Crystal ringed by four Upgrade Chips and four Timeclock Gears.',
    desc: 'The container of Chronosapien DNA, and the middle of its recipe.',
  },
  {
    id: 'chrono:timeclock_key', name: 'Timeclock Key', category: 'dna', img: I('timeclock_key'), rarity: 'Epic', page: 'getting-dna.html',
    obtain: 'Crafted from six Timeclock Gears. Maltruant always drops one; Time Beasts drop one 5% of the time.',
    desc: 'The Key of Time. Tops the DNA recipe, and crafts back into six Gears. It can also be worn to change how Clockwork looks.',
  },
  {
    id: 'chrono:chronosapien_dna', name: 'Chronosapien DNA', category: 'dna', img: I('chronosapien_dna'), rarity: 'Legendary', page: 'getting-dna.html',
    obtain: 'Crafted (see Getting the DNA). Also a 0.1% Time Beast drop and two 10% rolls from Maltruant.',
    desc: 'Right-click it to inject it into your Omnitrix and unlock the Chronosapien. It needs a free playlist slot and is used up.',
  },
  {
    id: 'chrono:galvan_compass', name: 'Galvan Compass', category: 'gadget', img: I('galvan_compass'), rarity: 'Rare', page: 'items.html',
    obtain: 'Crafted: a Clock surrounded by four Upgrade Chips, with Galvan Metal in the corners.',
    desc: 'Right-click to highlight ores within 10 blocks. Sneak + right-click to point at Maltruant\'s fragments and altar. Gives off light while held.',
  },
  {
    id: 'chrono:galvan_emp', name: 'Galvan EMP', category: 'gadget', img: I('galvan_emp'), rarity: 'Epic', page: 'items.html',
    obtain: 'Crafted: a Nether Star between Timeclock Chip I and II, with two Upgrade Crystals and four Timeclock Gears.',
    desc: 'Sends out electromagnetic pulses that make nearby mobs take more damage and weaken Chronosapiens. Charge it by holding Omni Crystals in your main hand and right-clicking with the EMP in your off hand.',
  },
  {
    id: 'chrono:time_reborn_device', name: 'Time Reborn Device', category: 'gadget', img: I('time_reborn_device'), rarity: 'Epic', page: 'items.html#time-reborn',
    obtain: 'A 25% drop from mobs killed with a Time Reborn weapon (max health up to 30 × the enchantment level).',
    desc: 'Holds the mob it came from. Use it to bring that mob back.',
  },
  {
    id: 'chrono:ship_bucket', name: 'Bucket of Ship', category: 'gadget', img: I('ship_bucket'), page: 'mobs.html#ship',
    obtain: 'Sneak + right-click your tamed Ship with an empty bucket.',
    desc: '"Ship! Ship!" Carries Ship around. Empty it to let Ship out again.',
  },
  fragment('key', 'Maltruant Key'),
  fragment('gear', 'Maltruant Gear'),
  fragment('hex', 'Maltruant Hex'),
  fragment('part1', 'Maltruant Part I'),
  fragment('part2', 'Maltruant Part II'),
  {
    id: 'chrono:chronosapien_time_bomb_block', name: 'Chronosapien Time Bomb', category: 'trophy', img: I('chronosapien_time_bomb'), rarity: 'Legendary', page: 'maltruant.html#rewards',
    obtain: 'Always dropped by Maltruant.',
    desc: '"It\'s designed to wipe other timelines from existence." Right-click to set a program and erase the targeted mobs from the current timeline. It needs a Timeclock Key to charge and does nothing to Maltruant. Rewinding time (the Sotobro Effect) brings erased mobs back. Sneak + right-click to pick it up.',
  },
  {
    id: 'chrono:disc_maltruant_p3', name: 'Music Disc: Future Mal‑Formed', category: 'trophy', img: I('disc_maltruant_p3'), page: 'maltruant.html#rewards',
    obtain: 'Always dropped by Maltruant.', desc: 'Maltruant\'s final phase theme by Rod Abernethy. A trophy for beating him.',
  },
  {
    id: 'chrono:disc_timebeast', name: 'Music Disc: Bugged Out', category: 'trophy', img: I('disc_timebeast'), page: 'mobs.html#time-beast',
    obtain: 'Time Beasts: two rolls, 15% and 20%.', desc: 'The Time Beast theme by Rod Abernethy.',
  },
  {
    id: 'chrono:chrono_ore', name: 'Chrono Ore', category: 'block', img: I('chrono_ore'), page: 'world.html#chrono-ore',
    obtain: 'Small veins below Y 48 in the Overworld. Needs a diamond pickaxe.', desc: 'Drops a Timeclock Gear. Mining it can slow you down, gray you out or rewind the area around you.',
  },
  {
    id: 'chrono:deepslate_chrono_ore', name: 'Deepslate Chrono Ore', category: 'block', img: I('deepslate_chrono_ore'), page: 'world.html#chrono-ore',
    obtain: 'Chrono Ore veins in deepslate.', desc: 'The deepslate version of Chrono Ore. Same drop, same time hazards.',
  },
  {
    id: 'chrono:ash_block', name: 'Aged Block', category: 'block', img: I('ash_block'), page: 'world.html#aged-blocks',
    obtain: 'Left behind by Time Beasts and Maltruant\'s summoning.', desc: 'A block that aged in an instant and crumbles away. Blocks that never change over time aren\'t affected.',
  },
  ...['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'].map(mural),
  egg('maltruant', "Maltruant's Energy Core", 'Summons Maltruant through a time portal.'),
  egg('time_beast', 'Time Beast Spawn Egg', 'Summons a Time Beast through a time portal. Also a 5% Maltruant drop (the One in a Hundred advancement).'),
  egg('exo_skull', 'Exo-Skull Spawn Egg', 'Spawns Exo-Skull, one of Maltruant\'s devotees.'),
  egg('subdora', 'Subdora Spawn Egg', '"Who needs fair when you have flair?" Spawns Subdora, Maltruant\'s other devotee.'),
];
