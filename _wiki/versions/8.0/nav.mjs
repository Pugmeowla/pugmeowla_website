// The 8.0 docs: version info and navigation (sidebar order = previous/next order).
export const version = {
  id: '8.0',
  label: '8.0',
  status: 'In development',
  minecraft: '1.20.1',
  loader: 'Forge',
  outDir: '',
  notice: 'These pages are for 8.0, which isn\'t out yet. The version on CurseForge and Modrinth is still 7.3.',
};

export const nav = [
  { title: 'Wiki Home', icon: 'logo.png', link: true, pages: ['index.html'] },
  { title: 'Getting Started', icon: 'renders/infinity_gauntlet_cast.png', pages: [
    'installation.html', 'getting-started.html', 'finding-stones.html', 'progression.html', 'advancements.html',
  ] },
  { title: 'Infinity Stones', icon: 'stones/power_stone.png', pages: [
    'stones/index.html', 'stones/containers.html', 'stones/power.html', 'stones/space.html', 'stones/reality.html',
    'stones/soul.html', 'stones/time.html', 'stones/mind.html',
  ] },
  { title: 'Infinity Gauntlet', icon: 'items/infinity_gauntlet.png', pages: [
    'gauntlet/index.html', 'gauntlet/snap.html', 'gauntlet/skins.html',
  ] },
  { title: 'Abilities', icon: 'icons/energy_blast.png', pages: [
    'abilities.html',
  ] },
  { title: 'Items & Equipment', icon: 'renders/cosmi-rod.png', pages: [
    'items.html', 'tools.html',
  ] },
  { title: 'Exploration', icon: 'renders/vormir_stone.png', pages: [
    'structures.html', 'dimensions.html',
  ] },
  { title: 'Commands', icon: 'icons/teleport.png', pages: [
    'commands.html',
  ] },
  { title: 'Addon Development', icon: 'renders/52-d_unit.png', pages: [
    'addons/index.html', 'addons/stones.html', 'addons/skins.html', 'addons/custom-gauntlets.html',
    'addons/ground-items.html', 'addons/ability-overlays.html', 'addons/abilities.html',
  ] },
  { title: 'Help', icon: 'renders/soul_guardian_telephone.png', pages: [
    'configuration.html', 'troubleshooting.html', 'credits.html',
  ] },
  { title: 'Changelog', icon: 'icons/hourglass.png', link: true, pages: ['changelog.html'] },
];
