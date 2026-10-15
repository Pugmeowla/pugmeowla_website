// Other mods the 8.0 pages mention. The build links every mention in page text (outside code, headings and existing
// links, and not on the wiki home) to the mod's Modrinth page, or its CurseForge page when it isn't on Modrinth, with the
// mod's icon (assets/img/compat/<icon>.png) in front.
// names: the spellings to link, longest first where one contains another. A name may be a regular expression source.
const M = (slug) => `https://modrinth.com/mod/${slug}`;
const CF = (slug) => `https://www.curseforge.com/minecraft/mc-mods/${slug}`;

export const mods = [
  { icon: 'star_tech', url: CF('star-tech-man-the-legendary-mod'), names: ['Star Tech, Man! The Legendary Mod\\?'] },
  { icon: 'infintrix', url: M('pugmeowlas-infintrix'), names: ["Pugmeowla's Infintrix", 'Infintrix'] },
  { icon: 'herbs_of_wakanda', url: M('herbs-of-wakanda'), names: ["Pugmeowla's Herbs of Wakanda", 'Herbs of Wakanda'] },
  { icon: 'infinity_generator', url: M('pugmeowlas-infinity-generator'), names: ["Pugmeowla's Infinity Generator", 'Infinity Generator'] },
  { icon: 'infinity_protocol', url: M('pugmeowlas-infinity-protocol'), names: ["Pugmeowla's Infinity Protocol", 'Infinity Protocol'] },
  { icon: 'ultor_infinitus', url: M('pugmeowlas-ultor-infinitus'), names: ["Pugmeowla's Ultor Infinitus", 'Ultor Infinitus'] },
  { icon: 'fsang', url: M('fsang18s-heropack'), names: ["Fsang's Heropack", "Fsang's"] },
  { icon: 'tinkers', url: M('tinkers-construct'), names: ["Tinkers' Construct"] },
  { icon: 'immersive_portals', url: M('immersiveportals'), names: ['Immersive Portals'] },
  { icon: 'cloth_config', url: M('cloth-config'), names: ['Cloth Config'] },
  { icon: 'chrono_api', url: M('chronoapi'), names: ['Chrono API'] },
  { icon: 'curios', url: M('curios'), names: ['Curios API', 'Curios'] },
  { icon: 'geckolib', url: M('geckolib'), names: ['GeckoLib'] },
  { icon: 'pehkui', url: M('pehkui'), names: ['Pehkui'] },
  { icon: 'ad_astra', url: M('ad-astra'), names: ['Ad Astra'] },
  { icon: 'cosmic', url: M('cosmic-horizons-cosmos'), names: ['Cosmic Horizons'] },
  { icon: 'jei', url: M('jei'), names: ['JEI'] },
  { icon: 'trinkets', url: M('trinkets'), names: ['Trinkets'] },
  { icon: 'powerborne', url: M('powerborne-heroes'), names: ['Powerborne'] },
  { icon: 'alien_evolution', url: M('alienevo'), names: ['Alien Evolution', 'Alien Evo'] },
  { icon: 'into_the_omniverse', url: M('into-the-omniverse'), names: ['Into the Omniverse'] },
  { icon: 'omnitrix_evolution', url: M('omni-evo'), names: ['Omnitrix Evolution'] },
  { icon: 'lucraft_core', url: M('lucraftcore'), names: ['Lucraft Core', 'LucraftCore'] },
  { icon: 'heroes_expansion', url: M('heroesexpansion'), names: ['Heroes Expansion', 'HeroesExpansion'] },
  { icon: 'speedster_heroes', url: M('speedsterheroes'), names: ['Speedster Heroes'] },
  { icon: 'infinity_craft', url: CF('infinity-craft'), names: ['Infinity Craft'] },
  // Not "Chrono Palladium" (a different project) and not palladium: IDs.
  { icon: 'palladium', url: M('threetag-palladium'), names: ['(?<!Chrono )Palladium(?![\\w:])'] },
];
