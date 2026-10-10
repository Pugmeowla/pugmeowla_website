// The six stones in 7.3. Same stones and places as 8.0, but fewer ways to channel them.
export const stones = [
  {
    id: 'space', item: 'infinity:space_stone', name: 'Space Stone', color: '#0255FF', glint: '#6AC5FF',
    tagline: 'Teleporting, telekinesis and black holes.',
    container: 'infinity:tesseract', containerName: 'Tesseract',
    structure: 'norse_village', structureName: 'Norse Village', dimension: 'Overworld',
  },
  {
    id: 'mind', item: 'infinity:mind_stone', name: 'Mind Stone', color: '#FFD300', glint: '#DAFF0A',
    tagline: 'Flight, intangibility and pacifying mobs.',
    container: 'infinity:scepter', containerName: 'Scepter',
    structure: 'sanctuary', structureName: 'Sanctuary', dimension: 'The End',
  },
  {
    id: 'reality', item: 'infinity:reality_stone', name: 'Reality Stone', color: '#FF0130', glint: '#FF0130',
    tagline: 'Block duplication, size, invisibility and weather.',
    container: 'infinity:aether', containerName: 'Aether',
    structure: 'aether', structureName: 'Aether Chamber', dimension: 'Svartalfheim',
  },
  {
    id: 'power', item: 'infinity:power_stone', name: 'Power Stone', color: '#C32AD1', glint: '#F12AFF',
    tagline: 'Power levels, beams, TNT and meteors.',
    container: 'infinity:orb', containerName: 'Orb',
    structure: 'morag_temple', structureName: 'Morag Temple', dimension: 'Morag',
  },
  {
    id: 'time', item: 'infinity:time_stone', name: 'Time Stone', color: '#13CF55', glint: '#12E772',
    tagline: 'Speed up, slow down or freeze the world.',
    container: 'infinity:eye_of_agamotto', containerName: 'Eye of Agamotto',
    structure: 'sanctum', structureName: 'Sanctum Sanctorum', dimension: 'Overworld',
  },
  {
    id: 'soul', item: 'infinity:soul_stone', name: 'Soul Stone', color: '#DE7300', glint: '#FF8B00',
    tagline: 'The Soulworld, a zombie army and near immortality.',
    container: null, containerName: null,
    structure: 'vormir', structureName: "Vormir's Edge", anchor: 'vormir', dimension: 'Vormir',
  },
];
