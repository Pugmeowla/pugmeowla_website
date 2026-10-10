// Registered items, from addon/infinity/items, addon/infinity/blocks and the Java registries.
// img: path under assets/img. obtain: how players get it (no crafting recipes, "Craftable" points to JEI).
// page: the wiki page with more detail.

const R = (id) => `renders/${id}.png`;
const ST = (id) => `stones/${id}_stone.png`;

export const categories = [
  { id: 'stone', name: 'Infinity Stones' },
  { id: 'container', name: 'Stone Containers' },
  { id: 'gauntlet', name: 'Gauntlet' },
  { id: 'weapon', name: 'Weapons & Tools' },
  { id: 'armor', name: 'Armor' },
  { id: 'special', name: 'Special Items' },
  { id: 'material', name: 'Materials' },
  { id: 'block', name: 'Blocks' },
  { id: 'fluid', name: 'Fluids' },
  { id: 'technical', name: 'Technical' },
];

const stone = (id, name, container, page) => ({
  id: `infinity:${id}_stone`, name, category: 'stone', img: ST(id), rarity: 'Epic', page,
  obtain: container,
  desc: `Grants the ${name}'s power while held, worn in the Curios head slot, inserted in the Infinity Gauntlet or socketed in a Cosmi-Rod. Never despawns or burns when dropped.`,
});

export const items = [
  stone('space', 'Space Stone', 'Break a Tesseract open (hit it while it lies on the ground).', 'stones/space.html'),
  stone('mind', 'Mind Stone', 'Break the Scepter open (hit it while it lies on the ground).', 'stones/mind.html'),
  stone('reality', 'Reality Stone', 'Break the Aether open (hit it while it lies on the ground).', 'stones/reality.html'),
  stone('power', 'Power Stone', 'Take it out of the unlocked Orb. Only one Power Stone exists per world.', 'stones/power.html'),
  stone('time', 'Time Stone', 'Take it out of the open Eye of Agamotto. Only one Time Stone exists per world.', 'stones/time.html'),
  stone('soul', 'Soul Stone', "Trade a Best Friend's Soul to the Soul Guardian on Vormir.", 'stones/soul.html'),

  { id: 'infinity:tesseract', name: 'Tesseract', category: 'container', img: R('tesseract'), rarity: 'Epic', page: 'containers.html#tesseract',
    obtain: 'Item frame inside the Norse Village (Overworld).',
    desc: `The cube from Odin's vault, with the Space Stone inside. Gives the Space Stone's power in either hand. Hit it on the ground to get the stone out.` },
  { id: 'infinity:empty_tesseract', name: 'Empty Tesseract', category: 'container', img: R('empty_tesseract'), rarity: 'Epic', page: 'containers.html#tesseract',
    obtain: 'Creative tab or commands only.', desc: 'A Tesseract shell without its stone. Breaking a Tesseract open only drops the stone.' },
  { id: 'infinity:scepter', name: 'Scepter', category: 'container', img: R('scepter'), rarity: 'Epic', page: 'containers.html#scepter',
    obtain: 'Glow item frame inside the Sanctuary (The End).',
    desc: `Loki's staff, an iron tier sword with the Mind Stone in it. Gives the Mind Stone's power in either hand and fires the Scepter Power Blast from the main hand.` },
  { id: 'infinity:empty_scepter', name: 'Empty Scepter', category: 'container', img: R('empty_scepter'), rarity: 'Epic', page: 'containers.html#scepter',
    obtain: 'Left behind when a Scepter is broken open.', desc: 'Iron tier sword. Right-click it on the ground while holding the Mind Stone to rebuild the Scepter.' },
  { id: 'infinity:aether', name: 'Aether', category: 'container', img: R('aether'), rarity: 'Epic', page: 'containers.html#aether',
    obtain: 'Glow item frame in the Aether Chamber (Svartalfheim), guarded by Malekith.',
    desc: `The Reality Stone in its fluid form, the weapon Malekith wanted. Gives the Reality Stone's power in either hand. Hit it on the ground to get the stone out.` },
  { id: 'infinity:empty_aether', name: 'Empty Aether', category: 'container', img: R('empty_aether'), rarity: 'Epic', page: 'containers.html#aether',
    obtain: 'Craftable (see JEI).', desc: 'To put the Reality Stone back in, hold the stone in your off hand and use Insert Reality Stone, or right-click the Empty Aether on the ground with the stone.' },
  { id: 'infinity:orb', name: 'Orb', category: 'container', img: R('orb'), rarity: 'Epic', page: 'containers.html#orb',
    obtain: 'Armor stand inside the Morag Temple (Morag).',
    desc: `The Power Stone's casing from the Morag vault. It has a combination lock you open with Rotate Left and Rotate Right.` },
  { id: 'infinity:eye_of_agamotto', name: 'Eye of Agamotto', category: 'container', img: R('eye_of_agamotto'), rarity: 'Epic', page: 'containers.html#eye-of-agamotto',
    obtain: 'Armor stand inside the Sanctum Sanctorum (Overworld). Also craftable (see JEI).',
    desc: `Agamotto's amulet. Wear it on your chest (it counts as iron armor) or in the Curios necklace slot. It opens up to show the Time Stone and gives you the Time Stone's power while the stone is in it.` },

  { id: 'infinity:infinity_gauntlet', name: 'Infinity Gauntlet', category: 'gauntlet', img: R('infinity_gauntlet'), rarity: 'Epic', page: 'gauntlet/index.html',
    obtain: 'Craftable, or cast with Tinkers\' Construct (see JEI). Needs the Infinity Gauntlet Cast.',
    desc: 'Six stone slots. Wear it in the off hand or the Curios hands slot and you can use every stone in it at once. Fire resistant.' },
  { id: 'infinity:infinity_gauntlet_cast', name: 'Infinity Gauntlet Cast', category: 'gauntlet', img: R('infinity_gauntlet_cast'), rarity: 'Rare', page: 'gauntlet/index.html#getting-a-gauntlet',
    obtain: 'Village weaponsmith chests (weight 3 of 97 per roll).', desc: 'Needed to make the Infinity Gauntlet.' },

  { id: 'infinity:cosmi-rod', name: 'Cosmi-Rod', category: 'weapon', img: R('cosmi-rod'), rarity: 'Epic', page: 'containers.html#cosmi-rod',
    obtain: 'Item frame in the Crashed Kree Ship (Overworld plains).',
    desc: `Ronan's Universal Weapon. A netherite tier weapon with a socket for one stone (right-click to open it). Gives that stone's power while held, plus Shockwave.` },
  { id: 'infinity:double_edged_sword', name: 'Double-Edged Sword', category: 'weapon', img: R('double_edged_sword'), rarity: 'Epic', page: 'items.html',
    obtain: 'Craftable (see JEI).', desc: 'Thanos\' double-bladed sword. Netherite tier, high damage, slow swing.' },
  { id: 'infinity:single_edged_sword', name: 'Single-Edged Sword', category: 'weapon', img: R('single_edged_sword'), rarity: 'Epic', page: 'items.html',
    obtain: 'Craftable (see JEI).', desc: 'Netherite tier sword. Swings faster than the Double-Edged Sword.' },
  { id: 'infinity:hammer', name: 'Hammer', category: 'weapon', img: R('hammer'), rarity: 'Common', page: 'items.html',
    obtain: 'Craftable (see JEI).', desc: 'Crafting tool for plates and dusts. It is handed back to you after crafting with it.' },
  { id: 'infinity:injection', name: 'Injection', category: 'weapon', img: R('injection'), rarity: 'Common', page: 'items.html',
    obtain: 'Craftable (see JEI).', desc: 'Has no ability of its own in the core mod.' },

  ...['helmet', 'chestplate', 'leggings', 'boots'].flatMap((piece) => [
    { id: `infinity:thanos_classic_${piece}`, name: `Thanos' ${piece[0].toUpperCase() + piece.slice(1)} (Classic)`, category: 'armor',
      img: R(`thanos_classic_${piece}`), rarity: 'Epic', page: 'items.html#thanos-armor',
      obtain: 'Creative tab or commands.', desc: 'Netherite armor with a comic-style Thanos look.' },
    { id: `infinity:thanos_mcu_${piece}`, name: `Thanos' ${piece[0].toUpperCase() + piece.slice(1)} (MCU)`, category: 'armor',
      img: R(`thanos_mcu_${piece}`), rarity: 'Epic', page: 'items.html#thanos-armor',
      obtain: 'Creative tab or commands.', desc: 'Netherite armor with the MCU Thanos look.' },
  ]),

  { id: 'infinity:aspects_of_existance', name: 'Aspects of Existence', category: 'special', img: R('aspects_of_existance'), rarity: 'Epic', page: 'progression.html#aspects-of-existence',
    obtain: 'Infinity Temple chests (1 to 4 per chest), or craftable (see JEI).',
    desc: `What you spend in every stone's skill tree. All abilities are bought with it.` },
  { id: 'infinity:shards_of_existance', name: 'Shards of Existence', category: 'special', img: R('shards_of_existance'), rarity: 'Epic', page: 'progression.html#aspects-of-existence',
    obtain: 'Infinity Temple chests.', desc: 'Fragments used to make more Aspects of Existence (see JEI).' },
  { id: 'infinity:best_friends_soul', name: "Best Friend's Soul", category: 'special', img: R('best_friends_soul'), rarity: 'Epic', page: 'stones/soul.html#obtaining',
    obtain: 'Given the first time you kill one of your own tamed pets ("How Could You").',
    desc: 'The price of the Soul Stone. Trade it to the Soul Guardian on Vormir.' },
  { id: 'infinity:soul_guardian_telephone', name: 'Soul Guardian Telephone', category: 'special', img: R('soul_guardian_telephone'), rarity: 'Epic', page: 'containers.html#soul-guardian-telephone',
    obtain: 'Craftable (see JEI).', desc: 'Right-click to call the Soul Guardian from Vormir to you. Sneak + right-click to send it back.' },
  { id: 'infinity:fancy_bottle', name: 'Fancy Bottle', category: 'special', img: R('fancy_bottle'), rarity: 'Epic', page: 'items.html#fancy-bottle',
    obtain: 'Craftable (see JEI).', desc: 'Hold it in your main hand and you can bottle 3 experience levels into a Bottle o\' Enchanting from its power screen.' },
  { id: 'infinity:52-d_unit', name: 'NP-Λ52 Unit', category: 'special', img: R('52-d_unit'), rarity: 'Common', page: 'gauntlet/skins.html',
    obtain: 'Craftable (see JEI).', desc: 'Unlocks the (NP-Λ52) Enhanced Gauntlet skin.' },
  { id: 'infinity:endosym_ingot', name: 'Endosymbiotic Ingot', category: 'special', img: R('endosym_ingot'), rarity: 'Common', page: 'gauntlet/skins.html',
    obtain: 'Craftable (see JEI).', desc: 'Unlocks the Endosymbiotic Gauntlet skin.' },
  { id: 'infinity:ferro-titanium-gold_alloy_ingot', name: 'Ferro-Titanium-Gold Alloy Ingot', category: 'special', img: R('ferro-titanium-gold_alloy_ingot'), rarity: 'Common', page: 'gauntlet/skins.html',
    obtain: "Tinkers' Construct casting (see JEI).", desc: 'Unlocks the Ferro-Titanium-Gold Alloy Gauntlet skin.' },
  { id: 'infinity:soul_infused_netherite_ingot', name: 'Soul-Infused Netherite Ingot', category: 'special', img: R('soul_infused_netherite_ingot'), rarity: 'Common', page: 'gauntlet/skins.html',
    obtain: 'Craftable (see JEI).', desc: 'Unlocks the Soul Infused Netherite Gauntlet skin.' },

  ...[
    ['titanium', 'Titanium', ['dust', 'ingot', 'nugget', 'plate']],
    ['steel', 'Steel', ['dust', 'ingot', 'nugget', 'plate']],
    ['gold_titanium_alloy', 'Gold-Titanium Alloy', ['dust', 'ingot', 'nugget', 'plate', 'handle']],
    ['dwarf_star_alloy', 'Dwarf Star Alloy', ['dust', 'ingot', 'nugget', 'plate']],
    ['uru', 'Uru', ['dust', 'ingot', 'nugget', 'plate', 'blade']],
  ].flatMap(([id, name, forms]) => forms.map((form) => ({
    id: `infinity:${id}_${form}`, name: `${name} ${form[0].toUpperCase() + form.slice(1)}`, category: 'material',
    img: R(`${id}_${form}`), rarity: form === 'blade' ? 'Epic' : 'Common', page: 'items.html#materials',
    obtain: 'Crafted or smelted (see JEI).', desc: `${name} crafting material.`,
  }))),
  { id: 'infinity:raw_uru', name: 'Raw Uru', category: 'material', img: R('raw_uru'), rarity: 'Common', page: 'items.html#materials',
    obtain: 'Mine Uru Ore in Svartalfheim meteor craters.', desc: 'Smelt it into Uru.' },
  ...['iron_dust', 'iron_plate', 'gold_dust', 'gold_plate', 'coal_dust'].map((id) => ({
    id: `infinity:${id}`, name: id.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), category: 'material',
    img: R(id), rarity: 'Common', page: 'items.html#materials', obtain: 'Craftable (see JEI).', desc: 'Crafting material.',
  })),

  { id: 'infinity:uru_ore', name: 'Uru Ore', category: 'block', img: R('uru_ore'), page: 'structures.html#uru-meteor',
    obtain: 'Uru meteor craters in Svartalfheim.', desc: 'Drops Raw Uru.' },
  { id: 'infinity:dwarf_star_meteor', name: 'Dwarf Star Meteor', category: 'block', img: R('dwarf_star_meteor'), page: 'structures.html#dwarf-star-meteor',
    obtain: 'Dwarf star meteor craters in the Overworld.', desc: 'Used to make Dwarf Star Alloy (see JEI).' },
  ...[['titanium_block', 'Titanium Block'], ['steel_block', 'Block of Steel'], ['gold_titanium_alloy_block', 'Gold Titanium Alloy Block'],
    ['dwarf_star_alloy_block', 'Dwarf Star Alloy Block'], ['uru_block', 'Uru Block']].map(([id, name]) => ({
    id: `infinity:${id}`, name, category: 'block', img: R(id), page: 'items.html#blocks', obtain: 'Craftable (see JEI).', desc: 'Storage block.',
  })),
  ...[['vormir_sand', 'Vormir Sand', 'Vormir'], ['vormir_stone', 'Vormir Stone', 'Vormir'], ['morag_stone', 'Morag Stone', 'Morag'],
    ['svartelheim_stone', 'Svartelheim Stone', 'Svartalfheim'], ['svartelheim_sand', 'Svartelheim Sand', 'Svartalfheim']].map(([id, name, where]) => ({
    id: `infinity:${id}`, name, category: 'block', img: R(id), page: 'dimensions.html', obtain: `Generates in ${where}.`, desc: `Terrain block of ${where}.`,
  })),
  { id: 'infinity:temple_beacon', name: 'Temple Beacon', category: 'block', img: null, page: 'structures.html#infinity-temple',
    obtain: 'Only found in Infinity Temples. Otherwise creative or commands, and it drops nothing when broken.',
    desc: 'A beacon that always shines, without a pyramid. Stained glass above it tints the beam like a normal beacon.' },

  ...[['molten_uru', 'Molten Uru'], ['molten_titanium', 'Molten Titanium'], ['molten_gold_titanium_alloy', 'Molten Gold-Titanium Alloy'],
    ['molten_ferro-titanium-gold_alloy', 'Molten Ferro-Titanium-Gold Alloy']].map(([id, name]) => ({
    id: `infinity:${id}_bucket`, name: `${name} Bucket`, category: 'fluid', img: null, page: 'compatibility.html#tinkers-construct',
    obtain: "Tinkers' Construct smeltery.", desc: `Bucket of ${name}, used with Tinkers' Construct casting.`,
  })),

  { id: 'infinity:portal', name: 'Portal', category: 'technical', img: R('portal'), page: 'stones/space.html#teleport',
    obtain: 'Not obtainable.', desc: 'Worn by the invisible armor stands that make up Space Stone portals.' },
  { id: 'infinity:black_hole', name: 'Black Hole', category: 'technical', img: R('black_hole'), page: 'stones/space.html#black-hole',
    obtain: 'Not obtainable.', desc: 'Used to draw the black hole.' },
  { id: 'infinity:pugmeowla', name: 'Pugmeowla Icon', category: 'technical', img: R('pugmeowla'), page: 'items.html',
    obtain: 'Not obtainable.', desc: 'Advancement icon.' },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item]));
