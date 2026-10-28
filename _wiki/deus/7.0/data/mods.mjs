// Other mods the Deus pages mention, linked like on the Infinity wiki. Same entries as the Infinity 8.0 list.
import { mods as all } from '../../../infinity/8.0/data/mods.mjs';

const used = ['alien_evolution', 'palladium', 'chrono_api', 'geckolib', 'jei'];
export const mods = all.filter((mod) => used.includes(mod.icon));
