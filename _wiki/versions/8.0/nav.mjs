// The 8.0 docs: version info and navigation (sidebar order = previous/next order).
export const version = {
  id: '8.0',
  label: '8.0',
  status: 'In development',
  minecraft: '1.20.1',
  loader: 'Forge',
  outDir: '',
  notice: 'These pages are for 8.0, which isn\'t out yet. The version on CurseForge and Modrinth is 7.3.',
  noticeLink: 'Read the 7.3 docs',
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
    'compatibility.html', 'troubleshooting.html', 'credits.html',
  ] },
];
