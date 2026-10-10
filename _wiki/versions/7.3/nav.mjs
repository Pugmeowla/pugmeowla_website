// The 7.3 docs. 7.3 is the version on CurseForge and Modrinth. It ran as a Palladium addon pack with KubeJS scripts.
export const version = {
  id: '7.3',
  label: '7.3',
  status: 'Current release',
  minecraft: '1.20.1',
  loader: 'Forge',
  outDir: '7.3',
  notice: 'These pages are for 7.3, the version on CurseForge and Modrinth right now. 8.0 changes a lot.',
  noticeLink: 'See the 8.0 docs',
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
  { title: 'Help', icon: 'renders/soul_guardian_telephone.png', pages: [
    'compatibility.html', 'credits.html',
  ] },
];
