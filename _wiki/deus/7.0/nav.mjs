// The Deus Chrono-Machina 7.0 docs: version info and navigation (sidebar order = previous/next order).
export const version = {
  id: '7.0',
  label: '7.0',
  status: 'Beta',
  minecraft: '1.20.1',
  loader: 'Forge',
  outDir: '',
};

export const nav = [
  { title: 'Wiki Home', icon: 'deus/logo.png', link: true, pages: ['index.html'] },
  { title: 'Getting Started', icon: 'deus/items/timeclock_gear.png', pages: [
    'installation.html', 'getting-dna.html', 'advancements.html',
  ] },
  { title: 'Clockwork', icon: 'deus/items/chronosapien_dna.png', pages: [
    'clockwork.html', 'skill-tree.html', 'abilities.html', 'upgrade.html',
  ] },
  { title: 'Items & Blocks', icon: 'deus/items/galvan_compass.png', pages: [
    'items.html',
  ] },
  { title: 'Mobs & Bosses', icon: 'deus/items/maltruant_key.png', pages: [
    'mobs.html', 'maltruant.html',
  ] },
  { title: 'World', icon: 'deus/items/chrono_ore.png', pages: [
    'world.html', 'commands.html',
  ] },
  { title: 'Help', icon: 'deus/icons/rotate_key.png', pages: [
    'credits.html',
  ] },
  { title: 'Changelog', icon: 'deus/icons/rollback_time.png', link: true, pages: ['changelog.html'] },
];
