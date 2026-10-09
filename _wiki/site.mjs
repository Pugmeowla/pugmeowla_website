// Site-wide settings and the navigation. Page titles and descriptions come from each page's front matter;
// the order here is the sidebar order and the previous/next order.
export const site = {
  name: 'Infinity Stone Core Wiki',
  modName: "Pugmeowla's Infinity Stone Core",
  modVersion: '7.4',
  minecraft: '1.20.1',
  loader: 'Forge 47+',
  palladium: '4.2.0+ (built against 4.5.6)',
  updated: '2026-10-10',
  curseforge: 'https://www.curseforge.com/minecraft/mc-mods/pugmeowlas-infinity-stone-core',
  modrinth: 'https://modrinth.com/mod/pugmeowlas-infinity-stone-core',
  discord: 'https://discord.gg/jRZnRFabKP',
};

export const nav = [
  { title: 'Getting Started', icon: 'renders/infinity_gauntlet_cast.png', pages: [
    'index.html', 'getting-started.html', 'finding-stones.html', 'progression.html',
  ] },
  { title: 'Infinity Stones', icon: 'stones/space_stone.png', pages: [
    'stones/index.html', 'stones/space.html', 'stones/mind.html', 'stones/reality.html',
    'stones/power.html', 'stones/time.html', 'stones/soul.html',
  ] },
  { title: 'Infinity Gauntlet', icon: 'renders/infinity_gauntlet.png', pages: [
    'gauntlet/index.html', 'gauntlet/snap.html', 'gauntlet/skins.html',
  ] },
  { title: 'Abilities', icon: 'icons/energy_blast.png', pages: [
    'abilities.html',
  ] },
  { title: 'Items & Equipment', icon: 'renders/cosmi-rod.png', pages: [
    'items.html', 'containers.html',
  ] },
  { title: 'Exploration', icon: 'renders/vormir_stone.png', pages: [
    'structures.html', 'dimensions.html',
  ] },
  { title: 'Commands', icon: 'icons/teleport.png', pages: [
    'commands.html',
  ] },
  { title: 'Addon Development', icon: 'renders/52-d_unit.png', pages: [
    'addons/index.html', 'addons/stones.html', 'addons/skins.html', 'addons/custom-gauntlets.html',
    'addons/ground-items.html', 'addons/abilities.html',
  ] },
  { title: 'Help', icon: 'renders/soul_guardian_telephone.png', pages: [
    'compatibility.html', 'troubleshooting.html',
  ] },
];
