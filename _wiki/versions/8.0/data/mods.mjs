// Other mods the 8.0 pages mention. The build links every mention in page text (outside code, headings and existing
// links, and not on the wiki home) with the mod's icon (assets/img/compat/<icon>.png) in front. Links go to Modrinth or
// CurseForge, whichever the reader picked in the top bar; a mod only on one of them always links there.
// names: the spellings to link, longest first where one contains another. A name may be a regular expression source.
const M = (slug) => `https://modrinth.com/mod/${slug}`;
const CF = (slug) => `https://www.curseforge.com/minecraft/mc-mods/${slug}`;

export const mods = [
  { icon: 'star_tech', modrinth: null, curseforge: CF('star-tech-man-the-legendary-mod'), names: ['Star Tech, Man! The Legendary Mod\\?'] },
  { icon: 'infintrix', modrinth: M('pugmeowlas-infintrix'), curseforge: CF('pugmeowlas-infintrix'), names: ["Pugmeowla's Infintrix", 'Infintrix'] },
  { icon: 'herbs_of_wakanda', modrinth: M('herbs-of-wakanda'), curseforge: CF('herbs-of-wakanda'), names: ["Pugmeowla's Herbs of Wakanda", 'Herbs of Wakanda'] },
  { icon: 'infinity_generator', modrinth: M('pugmeowlas-infinity-generator'), curseforge: CF('pugmeowlas-infinity-generator'), names: ["Pugmeowla's Infinity Generator", 'Infinity Generator'] },
  { icon: 'infinity_protocol', modrinth: M('pugmeowlas-infinity-protocol'), curseforge: CF('pugmeowlas-infinity-protocol'), names: ["Pugmeowla's Infinity Protocol", 'Infinity Protocol'] },
  { icon: 'ultor_infinitus', modrinth: M('pugmeowlas-ultor-infinitus'), curseforge: CF('pugmeowlas-ultor-infinitus'), names: ["Pugmeowla's Ultor Infinitus", 'Ultor Infinitus'] },
  { icon: 'satsu_iron_man', modrinth: M('satsu-iron-man-addon'), curseforge: CF('satsu-iron-man-addon'), names: ["Satsu's Iron Man Addon", "Satsu's Iron Man"] },
  { icon: 'fsang', modrinth: M('fsang18s-heropack'), curseforge: CF('fsang18s-heropack'), names: ["Fsang's Heropack", "Fsang's"] },
  { icon: 'tinkers', modrinth: M('tinkers-construct'), curseforge: CF('tinkers-construct'), names: ["Tinkers' Construct"] },
  { icon: 'immersive_portals', modrinth: M('immersiveportals'), curseforge: CF('immersive-portals-mod'), names: ['Immersive Portals'] },
  { icon: 'cloth_config', modrinth: M('cloth-config'), curseforge: CF('cloth-config'), names: ['Cloth Config'] },
  { icon: 'chrono_api', modrinth: M('chronoapi'), curseforge: CF('chrono-api'), names: ['Chrono API'] },
  { icon: 'curios', modrinth: M('curios'), curseforge: CF('curios'), names: ['Curios API', 'Curios'] },
  { icon: 'geckolib', modrinth: M('geckolib'), curseforge: CF('geckolib'), names: ['GeckoLib'] },
  { icon: 'pehkui', modrinth: M('pehkui'), curseforge: CF('pehkui'), names: ['Pehkui'] },
  { icon: 'ad_astra', modrinth: M('ad-astra'), curseforge: CF('ad-astra'), names: ['Ad Astra'] },
  { icon: 'cosmic', modrinth: M('cosmic-horizons-cosmos'), curseforge: CF('cosmic-horizons'), names: ['Cosmic Horizons'] },
  { icon: 'jei', modrinth: M('jei'), curseforge: CF('jei'), names: ['JEI'] },
  { icon: 'trinkets', modrinth: M('trinkets'), curseforge: CF('trinkets'), names: ['Trinkets'] },
  { icon: 'powerborne', modrinth: M('powerborne-heroes'), curseforge: CF('powerborne-heroes'), names: ['Powerborne'] },
  { icon: 'alien_evolution', modrinth: M('alienevo'), curseforge: CF('alienevo'), names: ['Alien Evolution', 'Alien Evo'] },
  { icon: 'into_the_omniverse', modrinth: M('into-the-omniverse'), curseforge: CF('into-the-omniverse'), names: ['Into the Omniverse'] },
  { icon: 'omnitrix_evolution', modrinth: M('omni-evo'), curseforge: CF('omni-evo'), names: ['Omnitrix Evolution'] },
  { icon: 'lucraft_core', modrinth: M('lucraftcore'), curseforge: CF('lucraft-core'), names: ['Lucraft Core', 'LucraftCore'] },
  { icon: 'heroes_expansion', modrinth: M('heroesexpansion'), curseforge: CF('heroesexpansion'), names: ['Heroes Expansion', 'HeroesExpansion'] },
  { icon: 'speedster_heroes', modrinth: M('speedsterheroes'), curseforge: CF('speedster-heroes'), names: ['Speedster Heroes'] },
  { icon: 'infinity_craft', modrinth: null, curseforge: CF('infinity-craft'), names: ['Infinity Craft'] },
  // Not "Chrono Palladium" (a different project) and not palladium: IDs.
  { icon: 'palladium', modrinth: M('threetag-palladium'), curseforge: CF('threetag-palladium'), names: ['(?<!Chrono )Palladium(?![\\w:])'] },
];
