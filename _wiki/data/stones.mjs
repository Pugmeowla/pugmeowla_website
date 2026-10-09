// The six Infinity Stones. Colors come from data/infinity/gauntlet_stones/*.json.
export const stones = [
  {
    id: 'space', item: 'infinity:space_stone', name: 'Space Stone', color: '#0255FF', glint: '#6AC5FF',
    tagline: 'Portals, telekinesis and black holes.',
    container: 'infinity:tesseract', containerName: 'Tesseract',
    structure: 'norse_village', structureName: 'Norse Village', dimension: 'Overworld',
    sources: ['Space Stone or Tesseract held in either hand', 'Space Stone in the Curios head slot',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Space Stone'],
  },
  {
    id: 'mind', item: 'infinity:mind_stone', name: 'Mind Stone', color: '#FFD300', glint: '#DAFF0A',
    tagline: 'Flight, illusions, mind reading and disguises.',
    container: 'infinity:scepter', containerName: 'Scepter',
    structure: 'sanctuary', structureName: 'Sanctuary', dimension: 'The End',
    sources: ['Mind Stone or Scepter held in either hand', 'Mind Stone in the Curios head slot',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Mind Stone'],
  },
  {
    id: 'reality', item: 'infinity:reality_stone', name: 'Reality Stone', color: '#FF0130', glint: '#FF0130',
    tagline: 'Rewrite blocks, change size, weather and visibility.',
    container: 'infinity:aether', containerName: 'Aether',
    structure: 'aether', structureName: 'Aether Chamber', dimension: 'Svartalfheim',
    sources: ['Reality Stone or Aether held in either hand', 'Reality Stone in the Curios head slot',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Reality Stone'],
  },
  {
    id: 'power', item: 'infinity:power_stone', name: 'Power Stone', color: '#C32AD1', glint: '#F12AFF',
    tagline: 'Scaling damage, beams, rockets and meteor storms.',
    container: 'infinity:orb', containerName: 'Orb',
    structure: 'morag_temple', structureName: 'Morag Temple', dimension: 'Morag',
    sources: ['Power Stone held in either hand (dangerous without protection)', 'Power Stone in the Curios head slot',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Power Stone'],
  },
  {
    id: 'time', item: 'infinity:time_stone', name: 'Time Stone', color: '#13CF55', glint: '#12E772',
    tagline: 'Speed up, slow down or freeze the whole world.',
    container: 'infinity:eye_of_agamotto', containerName: 'Eye of Agamotto',
    structure: 'sanctum', structureName: 'Sanctum Sanctorum', dimension: 'Overworld',
    sources: ['Time Stone held in either hand', 'Time Stone in the Curios head slot',
      'Eye of Agamotto with its stone, held or worn on the chest / Curios necklace',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Time Stone'],
  },
  {
    id: 'soul', item: 'infinity:soul_stone', name: 'Soul Stone', color: '#DE7300', glint: '#FF8B00',
    tagline: 'Souls, the Soulworld and near-immortality.',
    container: null, containerName: null,
    structure: 'vormir', structureName: 'Vormir', dimension: 'Vormir',
    sources: ['Soul Stone held in either hand', 'Soul Stone in the Curios head slot',
      'Infinity Gauntlet (or custom gauntlet) with the stone inserted', 'Cosmi-Rod holding the Soul Stone'],
  },
];

export const stoneById = Object.fromEntries(stones.map((s) => [s.id, s]));
