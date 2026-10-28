// Shared settings for every mod wiki. Each wiki has a folder in _wiki/<id>/ with one subfolder per documented version,
// and builds into wiki/<dir>/.
const links = {
  discord: 'https://discord.gg/jRZnRFabKP',
  patreon: 'https://www.patreon.com/cw/Pugmeowla',
  kofi: 'https://ko-fi.com/pugmeowla',
};

export const wikis = [
  {
    ...links,
    id: 'infinity',
    dir: 'infinity',
    name: 'Infinity Stone Core Wiki',
    brand: 'Infinity Stone Core',
    modName: "Pugmeowla's Infinity Stone Core",
    author: 'Pugmeowla',
    logo: 'logo.png',
    favicon: 'favicon.png',
    namespace: 'infinity',
    // The card on wiki/index.html: its picture (relative to the site root), colors and a one-line pitch.
    hub: { image: 'infinity.png', color: '#8e1fa6', glow: '#e3a43a', tagline: 'The six Infinity Stones, the Infinity Gauntlet and everything around them.' },
    // Ability cards show what an ability costs to unlock in this currency.
    costName: 'Aspect of Existence',
    searchPlaceholder: 'Search abilities, items, commands…',
    collapsibleAbilities: true,
    curseforge: 'https://www.curseforge.com/minecraft/mc-mods/pugmeowlas-infinity-stone-core',
    modrinth: 'https://modrinth.com/mod/pugmeowlas-infinity-stone-core',
    // Versions shown in the version switcher, newest first. Each has a folder in _wiki/infinity.
    versions: ['8.0', '7.3'],
    // The version players get from CurseForge and Modrinth right now.
    released: '7.3',
  },
  {
    ...links,
    id: 'deus',
    dir: 'deus-chrono-machina',
    name: 'Deus Chrono-Machina Wiki',
    brand: 'Deus Chrono-Machina',
    modName: 'Deus Chrono-Machina',
    author: 'Rolmi and Pugmeowla',
    logo: 'deus/logo.png',
    // The page colors come from html[data-wiki="deus"] in wiki.css: the logo's greens and golds.
    themeColor: '#a9c78f',
    namespace: 'chrono',
    hub: { image: 'clockwork.png', color: '#2f7a24', glow: '#d9a93a', tagline: 'Clockwork the Chronosapien for Alien Evolution: bend time, then face Maltruant.' },
    searchPlaceholder: 'Search abilities, items, mobs…',
    curseforge: 'https://www.curseforge.com/members/pugmeowla/projects',
    modrinth: 'https://modrinth.com/mod/deus-chrono-machina',
    versions: ['7.0'],
    released: '7.0',
  },
];
