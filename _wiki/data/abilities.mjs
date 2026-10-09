// Every player-facing ability, transcribed from data/infinity/palladium/powers/*.json and the Java ability classes.
// cost: Aspects of Existence spent in the skill tree (0 = free unlock, null = not bought, e.g. always available).
// cooldown: ticks. requires: keys of other abilities in the same group that must be unlocked first.
// activation: Toggle | Key press | Hold | Passive | Scroll | Right-click | Upgrade
// group: the stone id, or 'gauntlet', 'cosmi_rod', 'orb', 'eye', 'aether', 'scepter', 'telephone'.

const S = (id) => `stones/${id}_stone.png`;

export const groups = {
  space: { name: 'Space Stone', power: 'infinity:space_stone', page: 'stones/space.html' },
  mind: { name: 'Mind Stone', power: 'infinity:mind_stone', page: 'stones/mind.html' },
  reality: { name: 'Reality Stone', power: 'infinity:reality_stone', page: 'stones/reality.html' },
  power: { name: 'Power Stone', power: 'infinity:power_stone', page: 'stones/power.html' },
  time: { name: 'Time Stone', power: 'infinity:time_stone', page: 'stones/time.html' },
  soul: { name: 'Soul Stone', power: 'infinity:soul_stone', page: 'stones/soul.html' },
  scepter: { name: 'Scepter', power: 'infinity:mind_stone', page: 'stones/mind.html' },
  gauntlet: { name: 'Infinity Gauntlet', power: 'infinity:infinity_gauntlet', page: 'gauntlet/snap.html' },
  cosmi_rod: { name: 'Cosmi-Rod', power: 'infinity:cosmi_rod', page: 'containers.html' },
  orb: { name: 'Orb', power: 'infinity:orb', page: 'containers.html' },
  eye: { name: 'Eye of Agamotto', power: 'infinity:eye_of_agamotto', page: 'containers.html' },
  aether: { name: 'Empty Aether', power: 'infinity:empty_aether', page: 'containers.html' },
  telephone: { name: 'Soul Guardian Telephone', power: 'infinity:soul_guardian_telephone', page: 'containers.html' },
};

export const abilities = [
  // ───────────────────────── Space Stone ─────────────────────────
  {
    group: 'space', key: 'force_field', name: 'Force Field', type: 'palladium:attribute_modifier + infinity:force_field',
    activation: 'Toggle', cost: 1, requires: [], icon: 'icons/force_field.png',
    summary: 'A shield bubble that blocks attacks but roots you in place.',
    details: `<p>While the field is up you get a huge armor and armor toughness bonus, a shield is drawn around you and you
      can't walk, strafe or jump. Hits from entities dealing less than <strong>23</strong> damage are blocked outright, and
      hits from Iron Golems, Wardens, Vindicators, Piglin Brutes and Zombified Piglins are always blocked. Damage without an
      attacker (falling, fire, suffocation) still gets through.</p>`,
  },
  {
    group: 'space', key: 'jump_teleport', name: 'Jump Teleport', type: 'infinity:jump_portal',
    activation: 'Key press', cost: 1, requires: ['force_field'], icon: 'icons/teleport.png',
    summary: 'Opens a short-lived portal to the block you are looking at and jumps you through.',
    details: `<p>Opens a pair of portals, one in front of you and one at the block you look at (up to 256 blocks away), and
      lands you on safe ground next to that block. The pair closes after 3 seconds; anything can walk through until then.
      Still usable while burnt by the Snap.</p>`,
  },
  {
    group: 'space', key: 'teleport', name: 'Teleport GUI', type: 'infinity:portal',
    activation: 'Key press', cost: 1, requires: ['force_field'], icon: 'icons/teleport.png',
    summary: 'Pick any dimension and coordinates, then open a linked portal pair.',
    details: `<p>Opens the <em>Space Teleport</em> menu with a dimension field (with suggestions for every loaded dimension)
      and X / Y / Z fields. <strong>Open Portal</strong> creates a linked pair: one portal 2.5 blocks in front of you and one
      at the destination. The portals stay open until someone hits one of them, which closes both. This is the main way to
      reach the mod's dimensions without a space mod. Still usable while burnt by the Snap.</p>`,
  },
  {
    group: 'space', key: 'telekinesis', name: 'Telekinesis', type: 'infinity:telekinesis',
    activation: 'Toggle', cost: 1, requires: ['force_field'], icon: S('space'),
    summary: 'Pick up an entity or block, move it around and throw it.',
    details: `<p>Turning it on grabs the entity or solid block you look at (up to 32 blocks away) and holds it in front of you.
      <strong>Scroll</strong> to move it between 2 and 24 blocks away, <strong>left-click</strong> to throw it (it damages
      whatever it hits), or toggle off to set it down; blocks are placed back. Unbreakable blocks and blocks with block
      entities (chests, furnaces…) can't be picked up.</p>`,
  },
  {
    group: 'space', key: 'spatial_lock', name: 'Spatial Lock', type: 'infinity:spatial_lock',
    activation: 'Upgrade', cost: 1, requires: ['telekinesis'], icon: S('space'),
    summary: 'Right-click while holding something with Telekinesis to freeze it in space.',
    details: `<p>An upgrade for Telekinesis. While holding something, <strong>right-click</strong> to lock it where it is: it
      can't move, fall or be knocked back (a held block stays floating) until you pick it up with Telekinesis again. The lock
      is saved with the world.</p>`,
  },
  {
    group: 'space', key: 'black_hole', name: 'Black Hole', type: 'infinity:black_hole',
    activation: 'Toggle', cost: 1, requires: ['teleport'], needsStones: ['space', 'power'], icon: 'icons/black_hole.png',
    summary: 'Summon a growing black hole that follows your aim, then throw it.',
    details: `<p>Requires both the Space Stone and the Power Stone. Turning it on summons a black hole in front of you that grows,
      follows your aim and pulls in entities and blocks. <strong>Left-click</strong> to throw it; it collapses on its own
      later. Toggling off before throwing collapses it immediately.</p>`,
  },
  {
    group: 'space', key: 'water_breathing', name: 'Water Breathing', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'Breathe underwater.',
  },
  {
    group: 'space', key: 'fall_immunity', name: 'Fall Damage Immunity', type: 'palladium:damage_immunity',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'Negates all fall damage.',
  },
  {
    group: 'space', key: 'speed', name: 'Speed', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'Adds 0.05 to your movement speed attribute (+50% for a player).',
  },
  {
    group: 'space', key: 'step_assist', name: 'Step Assist', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: ['speed'], icon: 'icons/step.png',
    summary: 'Walk up full blocks without jumping.',
  },

  // ───────────────────────── Mind Stone ─────────────────────────
  {
    group: 'mind', key: 'passive', name: 'Pacify', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('mind'),
    summary: 'Turns mobs within 5 blocks peaceful towards you. Sneak to undo.',
    details: `<p>You and every entity within 5 blocks join the <code>peaceful</code> team, so pacified mobs stop targeting
      you. Using it while <strong>sneaking</strong> (Un-Pacify) removes nearby entities from the team again. Pairs well with the
      Soul Stone's Summon Zombie.</p>`,
  },
  {
    group: 'mind', key: 'flight', name: 'Flight', type: 'palladium:flight',
    activation: 'Passive', cost: 1, requires: [], icon: 'icons/fly.png',
    summary: 'Fly freely once unlocked.',
    details: `<p>Unlocks while the stone comes from the gauntlet, a held Mind Stone or Scepter, the Curios head slot or a
      Cosmi-Rod. The free <em>Flight Toggle</em> unlock switches it off and on again if you'd rather use another mod's flight.</p>`,
  },
  {
    group: 'mind', key: 'flight_toggle', name: 'Flight Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('mind'),
    summary: 'Free unlock: clicking it in the skill tree turns Mind Stone flight off or back on.',
  },
  {
    group: 'mind', key: 'intangibility', name: 'Intangibility', type: 'palladium:intangibility',
    activation: 'Toggle', cost: 1, requires: [], cooldown: 200, icon: S('mind'),
    summary: 'Phase through blocks and entities; all damage is negated.',
    details: `<p>While on you pass through blocks (vertically too while flying), every hit is negated, and your reach and
      hitbox are shrunk to almost nothing (via Pehkui). 10 second cooldown after use.</p>`,
  },
  {
    group: 'mind', key: 'recipe', name: 'Recipes', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('mind'),
    summary: 'Unlocks every recipe in your recipe book.',
  },
  {
    group: 'mind', key: 'hero', name: 'Hero of the People', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('mind'),
    summary: 'Permanent Hero of the Village VI.',
  },
  {
    group: 'mind', key: 'night_vision', name: 'Night Vision', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('mind'),
    summary: 'Permanent Night Vision.',
  },
  {
    group: 'mind', key: 'clones', name: 'Mind Illusions', type: 'infinity:clones',
    activation: 'Key press', cost: 1, requires: [], cooldown: 400, icon: 'icons/illusion.png',
    summary: 'Creates 3 copies of yourself for 60 seconds.',
    details: `<p>Each clone looks exactly like you (skin, armor, held items, render layers and name tag), has 20 health,
      follows you like a tamed wolf, defends itself and you, and attacks whatever you hit. Mobs targeting you pick randomly
      between you and nearby clones. Clones vanish after 60 seconds or when you die and never drop anything. 20 second cooldown.</p>`,
  },
  {
    group: 'mind', key: 'mind_reading', name: 'Mind Reading', type: 'infinity:mind_reading',
    activation: 'Key press', cost: 1, requires: [], cooldown: 20, icon: S('mind'),
    summary: "Look at a creature (up to 32 blocks) to see its health, effects, gear, inventory and target.",
    details: `<p>Opens a read-only view of the entity: a name tag whose tooltip lists type, health, absorption, armor, owner,
      current target and (for players) food and level; up to 8 active effects; its six equipment slots; and the inventory of
      a player, an item-carrying mob (villagers, allays, piglins) or a chested horse. Nothing can be taken out.</p>`,
  },
  {
    group: 'mind', key: 'disguise', name: 'Disguise', type: 'infinity:disguise',
    activation: 'Key press', cost: 1, requires: [], cooldown: 20, icon: S('mind'),
    summary: "Wear any player's skin and name by typing their username.",
    details: `<p>Opens a menu where you type a Minecraft username (3–16 letters, digits or underscores). Everyone sees you with
      that player's skin and name tag. <strong>Reset</strong> in the menu returns to your own skin. The disguise is only
      worn while the ability is unlocked, so losing the stone takes it off.</p>`,
  },
  {
    group: 'scepter', key: 'scepter_blast', name: 'Scepter Power Blast', type: 'palladium:energy_beam',
    activation: 'Hold', cost: null, requires: [], icon: 'icons/power_blast_blue.png',
    summary: 'Hold to fire a beam from the Scepter: 20 damage, 50 block range, sets targets on fire.',
    details: `<p>Available on the Mind Stone's ability bar while the Scepter is in your main hand. A Mind Stone worn in the Curios
      head slot fires the same beam from the forehead.</p>`,
  },

  // ───────────────────────── Reality Stone ─────────────────────────
  {
    group: 'reality', key: 'save_dummy', name: 'Block Saving', type: 'palladium:dummy',
    activation: 'Upgrade', cost: 128, requires: [], icon: S('reality'),
    summary: 'Unlocks Copy Block and Paste Block.',
    details: `<p><strong>Copy Block</strong> (key press) saves the block you look at, up to 30 blocks away (not unbreakable
      blocks). <strong>Paste Block</strong> (key press) turns the block you look at into your saved block; while
      <strong>sneaking</strong> it changes every non-air block within a radius of 5. Paste respects build permissions and claim
      protection. The saved block is kept through death and relogging and shown as the Paste ability's icon.</p>`,
  },
  {
    group: 'reality', key: 'shrink_dummy', name: 'Size Changing', type: 'palladium:dummy + palladium:command',
    activation: 'Scroll', cost: 1, requires: [], icon: S('reality'),
    summary: 'Unlocks Size Control: toggle it, then scroll to grow up to 5× or shrink down to 0.1×.',
    details: `<p>Turn on <strong>Size Control</strong> from the ability bar, then scroll: scrolling down shrinks you in steps
      (0.9×, 0.8× … 0.1×) and scrolling up grows you (2×, 3×, 4×, 5×; movement scales with size when growing). Turning Size
      Control off resets you to normal size. Uses Pehkui.</p>`,
  },
  {
    group: 'reality', key: 'invisibility', name: 'Invisibility', type: 'palladium:invisibility',
    activation: 'Toggle', cost: 1, requires: [], icon: S('reality'),
    summary: 'True invisibility: no body, no armor, no name.',
  },
  {
    group: 'reality', key: 'weather_wheel', name: 'Change the Weather', type: 'palladium:ability_wheel',
    activation: 'Hold', cost: 1, requires: [], icon: 'icons/weather_wheel.png',
    summary: 'Hold to open a wheel and pick Clear, Rain or Thunder.',
  },

  // ───────────────────────── Power Stone ─────────────────────────
  {
    group: 'power', key: 'impower', name: 'Energy Blast', type: 'infinity:energy_blast',
    activation: 'Key press', cost: 1, requires: [], cooldown: 5, icon: 'icons/energy_blast.png',
    summary: 'Fires a magenta energy bolt. Damage: 3 × 2^level.',
    details: `<p>A glowing projectile that damages the first entity it hits. Its damage doubles with every
      <a href="@/progression.html#power-levels">Power Stone level</a>: 3 at level 0, 6144 at level 11, and infinite at full power.</p>`,
  },
  {
    group: 'power', key: 'knockback', name: 'Knockback Resistance', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: ['impower'], icon: S('power'),
    summary: 'Full knockback resistance.',
  },
  {
    group: 'power', key: 'power_blast_aim', name: 'Power Blast', type: 'infinity:power_blast',
    activation: 'Hold', cost: 1, requires: ['impower'], icon: 'icons/power_blast.png',
    summary: 'Hold to fire a 100-block beam that smelts blocks and starts fires.',
    details: `<p>Damage is 2^level. At full power (level 11 with all six stones) the beam turns rainbow and causes an explosion
      (power 4) wherever it hits a block, every tick. Fired from the off hand.</p>`,
  },
  {
    group: 'power', key: 'power_levels', name: 'Power Levels 1–11', type: 'palladium:dummy (×11)',
    activation: 'Upgrade', cost: 434, requires: [], icon: S('power'),
    summary: 'Eleven purchasable levels. Each one doubles your base attack damage.',
    details: `<p>Buy the levels in order (2, 4, 8, 12, 18, 26, 36, 48, 64, 88 and 128 Aspects of Existence; 434 in total), then
      use <strong>Damage Control</strong> to pick your active level. See <a href="@/progression.html#power-levels">Power Levels</a>.</p>`,
  },
  {
    group: 'power', key: 'damage_control', name: 'Damage Control', type: 'palladium:command + infinity:power_level_change',
    activation: 'Scroll', cost: null, requires: ['power_levels'], icon: S('power'),
    summary: 'Toggle on, then scroll up/down to set your active power level.',
    details: `<p>The level can't go above the highest level you've bought. The purple bar shows the current level (0–11).
      While the Power Stone is active your base attack damage is set to 2^level; it goes back to 1 when the stone is removed.</p>`,
  },
  {
    group: 'power', key: 'explosion2', name: 'Cosmic Explosion', type: 'palladium:dummy',
    activation: 'Upgrade', cost: 1, requires: ['power_blast_aim'], icon: 'icons/rocket_burst.png',
    summary: 'Controls the stone’s raw energy: unlocks Rocket Burst and Power Cyclone.',
  },
  {
    group: 'power', key: 'rocket_burst', name: 'Rocket Burst', type: 'infinity:rocket_burst',
    activation: 'Key press', cost: null, requires: ['explosion2'], cooldown: 100, icon: 'icons/rocket_burst.png',
    summary: 'Below full power: launches five homing rockets.',
    details: `<p>Rockets explode on impact and never hurt you (you're immune to explosions while it fires). Their damage scales
      with level ÷ 11, so they do no damage at level 0. Replaced by Power Cyclone at level 11. 5 second cooldown.</p>`,
  },
  {
    group: 'power', key: 'power_cyclone', name: 'Power Cyclone', type: 'infinity:power_cyclone',
    activation: 'Hold', cost: null, requires: ['explosion2'], icon: 'icons/rocket_burst.png',
    summary: 'At level 11 only: hold to become a cyclone of energy that fires a rocket every second.',
    details: `<p>You're rooted in place, immune to explosions, and the stone's radiation spreads over your skin without harm (the
      overlay can be turned off with Radiation Texture Toggle).</p>`,
  },
  {
    group: 'power', key: 'meteor_storm', name: 'Meteor Storm', type: 'infinity:meteor_storm',
    activation: 'Key press', cost: 1, requires: ['explosion2'], needsStones: ['space', 'power'], icon: 'icons/meteor.png',
    summary: 'Shatters a moon and drops the fragments on the spot you look at.',
    details: `<p>Needs the Space Stone as well (from the gauntlet, a held Tesseract or Space Stone, the head slot or a Cosmi-Rod).
      Targets up to 256 blocks away. The moon's size is 1 + your power level. One storm per player at a time; very large
      storms can lag.</p>`,
  },
  {
    group: 'power', key: 'radiation_texture_toggle', name: 'Radiation Texture Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('power'),
    summary: 'Free: clicking it in the skill tree turns the radiation skin overlay off or on.',
  },

  // ───────────────────────── Time Stone ─────────────────────────
  {
    group: 'time', key: 'fast_forward', name: 'Fast Forward Daylight Cycle', type: 'palladium:command',
    activation: 'Hold', cost: 1, requires: [], icon: S('time'),
    summary: 'Hold to race through the day (+100 ticks of daytime every tick).',
  },
  {
    group: 'time', key: 'projectile_stop', name: 'Stop Projectile', type: 'infinity:projectile_stop',
    activation: 'Toggle', cost: 1, requires: ['fast_forward'], icon: 'icons/no_arrow.png',
    summary: 'Projectiles that come within 2.5 blocks freeze in mid-air.',
    details: `<p>Arrows, spectral arrows, tridents, ender pearls, snowballs, eyes of ender, fireballs, eggs and experience bottles
      (the <code>#infinity:projectiles</code> tag) hang in the air for 50 seconds, then carry on with their original motion.
      They stay stopped through a world reload.</p>`,
  },
  {
    group: 'time', key: 'time_set', name: 'Time Command', type: 'infinity:time_set',
    activation: 'Passive', cost: 1, requires: ['fast_forward'], icon: S('time'),
    summary: 'Lets you use /infinity time set <time>.',
    details: `<p>See <a href="@/commands.html#infinity-time-set">/infinity time set</a>. The world always moves forward to the
      requested time of day.</p>`,
  },
  {
    group: 'time', key: 'daylight_cycle_toggle', name: 'Daylight Cycle Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: ['fast_forward'], icon: S('time'),
    summary: 'Free: clicking it flips the doDaylightCycle game rule.',
  },
  {
    group: 'time', key: 'slow_time_dummy', name: 'Slow Time', type: 'infinity:time_flow',
    activation: 'Scroll', cost: 5, requires: ['fast_forward'], icon: 'icons/hourglass.png',
    summary: 'Unlocks Change Flow of Time: toggle it on, then scroll to change the server tick rate.',
    details: `<p>While <strong>Change Flow of Time</strong> is on, scrolling down slows the world (each step removes 4 ticks
      per second, down to 2 TPS) and scrolling up speeds it up (each step adds 4, up to 40 TPS). The green bar shows the
      step; the middle is normal speed. Your step is remembered between uses and turning it off returns the server to 20 TPS.
      You keep moving at normal speed. <strong>This affects the whole server.</strong></p>`,
  },
  {
    group: 'time', key: 'time_freeze_dummy', name: 'Freeze Time', type: 'infinity:time_freeze',
    activation: 'Toggle', cost: 10, requires: ['slow_time_dummy'], icon: 'icons/stop.png',
    summary: 'Unlocks Time Freeze: pauses the entire world while you keep moving.',
    details: `<p>Press once to freeze time and again to resume. Everything except you stops; you can also walk on water while
      time is frozen. <strong>Affects the whole server.</strong></p>`,
  },
  {
    group: 'time', key: 'screen_toggle', name: 'Screen Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('time'),
    summary: 'Free: turns the green screen overlay shown while using time powers off or on.',
  },

  // ───────────────────────── Soul Stone ─────────────────────────
  {
    group: 'soul', key: 'soul_storage', name: 'Soul Storage', type: 'infinity:soul_storage',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'),
    summary: 'Every entity you kill stores one soul, up to 50 (orange bar).',
    details: `<p>Clones and mobs whose soul was already drained don't count. See <a href="@/progression.html#soul-storage">Soul
      Storage</a>.</p>`,
  },
  {
    group: 'soul', key: 'soul_heal', name: 'Soul Heal', type: 'infinity:soul_heal',
    activation: 'Key press', cost: 1, requires: ['soul_storage'], cooldown: 10, icon: S('soul'),
    summary: 'Spend 1 soul to restore 2 hearts.',
  },
  {
    group: 'soul', key: 'soul_drain', name: 'Soul Drain', type: 'infinity:soul_drain',
    activation: 'Key press', cost: 1, requires: ['soul_heal'], cooldown: 10, icon: S('soul'),
    summary: 'Rip the soul out of the mob you look at (8 blocks), leaving it standing still in greyscale.',
    details: `<p>Stores 1 soul. Used while <strong>sneaking</strong> it gives a drained mob its soul back for 1 soul. Players,
      bosses (<code>#forge:bosses</code>), clones and mobs that already have no AI can't be drained. The drained state is
      saved on the mob.</p>`,
  },
  {
    group: 'soul', key: 'glow', name: 'Glow', type: 'palladium:entity_glow',
    activation: 'Hold', cost: 1, requires: [], icon: S('soul'),
    summary: 'Hold to see every entity within 100 blocks outlined in orange.',
  },
  {
    group: 'soul', key: 'locateplayer_command', name: 'Locate Entity Command', type: 'infinity:locate_player',
    activation: 'Passive', cost: 1, requires: ['glow'], icon: S('soul'),
    summary: 'Lets you use /infinity soul locateplayer <player>.',
  },
  {
    group: 'soul', key: 'summon_zombie', name: 'Summon Zombie', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Summons six zombies that join your peaceful team.',
    details: `<p>Three named zombies (Transfer, Pugmeowla and Dark Zombie) and three plain ones. You and the zombies join the
      <code>peaceful</code> team, so they won't attack you.</p>`,
  },
  {
    group: 'soul', key: 'enter_soulworld', name: 'Enter / Exit Soulworld', type: 'infinity:pocket_dimension_enter / exit',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Takes you and everything within 5 blocks into the Soulworld; use again to return.',
    details: `<p>Everyone arrives at Y 72 above the same X/Z. Each entity remembers where it came from, so <em>Exit
      Soulworld</em> (shown while you're inside) sends them all back to their original spot.</p>`,
  },
  {
    group: 'soul', key: 'saturation', name: 'Saturation', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'), defensive: true,
    summary: 'You never get hungry.',
  },
  {
    group: 'soul', key: 'effect_immune', name: 'Effect Immunity', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'), defensive: true,
    summary: 'Clears most negative effects (poison, wither, slowness, blindness…) every tick.',
  },
  {
    group: 'soul', key: 'regen', name: 'Regeneration', type: 'palladium:command',
    activation: 'Passive', cost: 16, requires: [], icon: S('soul'), defensive: true,
    summary: 'Permanent, extremely strong Regeneration.',
  },
  {
    group: 'soul', key: 'health', name: 'Health', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 64, requires: [], icon: S('soul'), defensive: true,
    summary: 'Nearly infinite max health.',
  },
  {
    group: 'soul', key: 'immortal', name: 'Immortality', type: 'palladium:immortality + infinity:invulnerability',
    activation: 'Passive', cost: 128, requires: ['health'], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: S('soul'), defensive: true,
    summary: 'Complete immortality. Needs all six stones.',
    details: `<p>All damage is negated before it lands (shown with soul particles), including damage that bypasses invulnerability.</p>`,
  },

  // ───────────────────────── Infinity Gauntlet ─────────────────────────
  {
    group: 'gauntlet', key: 'kill_half', name: 'Kill Half of All Entities', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'The Snap: half of the living entities in your dimension turn to dust.',
    details: `<p>Press twice within 3 seconds. See <a href="@/gauntlet/snap.html">The Snap</a>.</p>`,
  },
  {
    group: 'gauntlet', key: 'kill_hostile', name: 'Kill All Hostile', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'Snaps every hostile mob in every dimension into a sealed Soulworld cell.',
  },
  {
    group: 'gauntlet', key: 'kill_player', name: 'Kill Other Players', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'Snaps every other player into the Soulworld cell.',
  },
  {
    group: 'gauntlet', key: 'destroy_stones', name: 'Destroy Stones', type: 'palladium:animation_timer',
    activation: 'Toggle', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'A 7 second ritual that destroys all six stones in the gauntlet.',
  },
  {
    group: 'gauntlet', key: 'normal_gauntlet', page: 'gauntlet/skins.html', name: 'Return to Original Gauntlet', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/infinity_gauntlet.png',
    summary: 'Removes the current skin and gives its unlock item back.',
    details: `<p>Only shown while a skin is applied. The Burnt Gauntlet can't be removed this way while you're still burnt.</p>`,
  },

  // ───────────────────────── Tools & containers ─────────────────────────
  {
    group: 'cosmi_rod', key: 'shockwave', name: 'Shockwave', type: 'infinity:shockwave',
    activation: 'Key press', cost: null, requires: [], cooldown: 100, icon: 'icons/shockwave.png',
    summary: 'Concussive blast from the hand that flings and hurts everything in front of you.',
    details: `<p>Fires for 7 ticks, dealing 5 damage per tick to everything in a box in front of you that grows up to 4 blocks,
      and launching it along your look direction. 5 second cooldown. Available while the Cosmi-Rod is in either hand.</p>`,
  },
  {
    group: 'orb', key: 'rotate', name: 'Rotate Left / Rotate Right', type: 'geckolib:render_layer_animation',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/left.png',
    summary: 'Turn the Orb’s combination lock one step.',
  },
  {
    group: 'orb', key: 'open_close', name: 'Open / Close Orb', type: 'palladium:dummy',
    activation: 'Toggle', cost: null, requires: [], icon: 'renders/orb.png',
    summary: 'Once unlocked, opens the Orb to take or insert the Power Stone (right-click).',
  },
  {
    group: 'orb', key: 'reset_progress', name: 'Lock Orb', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/lock.png',
    summary: 'Locks the Orb again; you’ll need the combination to reopen it.',
  },
  {
    group: 'eye', key: 'open', name: 'Open / Close Eye', type: 'infinity:eye_of_agamotto',
    activation: 'Key press', cost: null, requires: [], cooldown: 40, icon: 'renders/eye_of_agamotto.png',
    summary: 'Opens or closes the worn Eye of Agamotto.',
  },
  {
    group: 'eye', key: 'remove_stone', name: 'Remove / Insert Time Stone', type: 'infinity:eye_of_agamotto',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: S('time'),
    summary: 'Take the Time Stone out of the open Eye, or put a held one back.',
  },
  {
    group: 'aether', key: 'insert_reality_stone', name: 'Insert Reality Stone', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/aether.png',
    summary: 'With the Reality Stone in your off hand, turns an Empty Aether into the Aether.',
  },
  {
    group: 'telephone', key: 'summon', name: 'Summon / Return Soul Guardian', type: 'palladium:command',
    activation: 'Right-click', cost: null, requires: [], cooldown: 24000, icon: 'renders/soul_guardian_telephone.png',
    summary: 'Calls the Soul Guardian from Vormir to you. Sneak + right-click sends it back.',
  },
];
