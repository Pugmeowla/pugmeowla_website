// Every player-facing ability in 8.0, from data/infinity/palladium/powers/*.json and the Java ability classes.
// cost: Aspects of Existence spent in the skill tree (0 = free unlock, null = nothing to buy).
// cooldown: ticks. requires: keys of abilities in the same group that have to be unlocked first.
// activation: Toggle | Key press | Hold | Passive | Scroll | Right-click | Upgrade
// page: overrides the group's page when the ability card lives somewhere else.

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
  // Space Stone
  {
    group: 'space', key: 'force_field', name: 'Force Field', type: 'palladium:attribute_modifier + infinity:force_field',
    activation: 'Toggle', cost: 1, requires: [], icon: 'icons/force_field.png',
    summary: 'A shield bubble that blocks attacks but stops you moving.',
    details: `<p>While it's up you get a huge armor and toughness boost, a shield is drawn around you, and you can't walk, strafe
      or jump. Hits from anything dealing less than <strong>23</strong> damage are blocked. Iron Golems, Wardens, Vindicators,
      Piglin Brutes and Zombified Piglins are always blocked. Damage with no attacker (falling, fire, suffocation) still hurts.</p>`,
  },
  {
    group: 'space', key: 'jump_teleport', name: 'Jump Teleport', type: 'infinity:jump_portal',
    activation: 'Key press', cost: 1, requires: ['force_field'], icon: 'icons/teleport.png',
    summary: 'Opens a quick portal to the block you are looking at and jumps you through.',
    details: `<p>One portal opens in front of you and one at the block you're looking at, up to 256 blocks away. You land on
      safe ground next to that block. Both close after 3 seconds and anything can use them until then. Still works while
      you're burnt from the Snap.</p>`,
  },
  {
    group: 'space', key: 'teleport', name: 'Teleport GUI', type: 'infinity:portal',
    activation: 'Key press', cost: 1, requires: ['force_field'], icon: 'icons/teleport.png',
    summary: 'Type a dimension and coordinates and open a portal there.',
    details: `<p>Opens the <em>Space Teleport</em> menu. The dimension field suggests every dimension the server has, and you fill
      in X, Y and Z. <strong>Open Portal</strong> puts one portal 2.5 blocks in front of you and the other at the destination.
      They stay open until someone hits one of them, which closes both. This is how you get to the mod's planets without a
      rocket. Still works while you're burnt from the Snap.</p>`,
  },
  {
    group: 'space', key: 'telekinesis', name: 'Telekinesis', type: 'infinity:telekinesis',
    activation: 'Toggle', cost: 1, requires: ['force_field'], icon: S('space'),
    summary: 'Pick up a mob or a block, move it around and throw it.',
    details: `<p>Turn it on while looking at an entity or solid block (up to 32 blocks away) and it floats in front of you.
      <strong>Scroll</strong> to move it between 2 and 24 blocks away and <strong>left-click</strong> to throw it. Thrown things
      hurt whatever they hit. Turn it off to put it down, and blocks go back into the world. Unbreakable blocks and blocks with
      block entities (chests, furnaces and so on) can't be picked up.</p>`,
  },
  {
    group: 'space', key: 'spatial_lock', name: 'Spatial Lock', type: 'infinity:spatial_lock',
    activation: 'Upgrade', cost: 1, requires: ['telekinesis'], icon: S('space'),
    summary: 'Right-click while holding something with Telekinesis to freeze it in place.',
    details: `<p>Locked things can't move, fall or be knocked back. A held block stays floating. Pick it up with Telekinesis
      again to free it. Locks are saved with the world.</p>`,
  },
  {
    group: 'space', key: 'black_hole', name: 'Black Hole', type: 'infinity:black_hole',
    activation: 'Toggle', cost: 1, requires: ['teleport'], needsStones: ['space', 'power'], icon: 'icons/black_hole.png',
    summary: 'Summon a black hole that follows your aim, then throw it.',
    details: `<p>Needs the Power Stone as well. The black hole grows in front of you, follows where you look and pulls in mobs
      and blocks. <strong>Left-click</strong> throws it and it collapses by itself a bit later. Turning it off before you throw
      it collapses it straight away.</p>`,
  },
  {
    group: 'space', key: 'water_breathing', name: 'Water Breathing', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'Breathe underwater.',
  },
  {
    group: 'space', key: 'fall_immunity', name: 'Fall Damage Immunity', type: 'palladium:damage_immunity',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'No fall damage.',
  },
  {
    group: 'space', key: 'speed', name: 'Speed', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: [], icon: S('space'),
    summary: 'Adds 0.05 to your movement speed, about 50% faster on foot.',
  },
  {
    group: 'space', key: 'step_assist', name: 'Step Assist', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: ['speed'], icon: 'icons/step.png',
    summary: 'Walk up full blocks without jumping.',
  },

  // Mind Stone
  {
    group: 'mind', key: 'passive', name: 'Pacify', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('mind'),
    summary: 'Mobs within 5 blocks stop attacking you. Sneak and use it to undo.',
    details: `<p>You and everything within 5 blocks join the <code>peaceful</code> scoreboard team, so those mobs leave you alone.
      Use it while <strong>sneaking</strong> (Un-Pacify) to take nearby mobs off the team again. Works well with the Soul Stone's
      Summon Zombie.</p>`,
  },
  {
    group: 'mind', key: 'flight', name: 'Flight', type: 'palladium:flight',
    activation: 'Passive', cost: 1, requires: [], icon: 'icons/fly.png',
    summary: 'Fly.',
    details: `<p>Works when the stone comes from the gauntlet, a held Mind Stone or Scepter, the Curios head slot or a Cosmi-Rod.
      If you'd rather use another mod's flight, the free <em>Flight Toggle</em> turns it off and on.</p>`,
  },
  {
    group: 'mind', key: 'flight_toggle', name: 'Flight Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('mind'),
    summary: 'Free. Click it in the skill tree to turn Mind Stone flight off or back on.',
  },
  {
    group: 'mind', key: 'intangibility', name: 'Intangibility', type: 'palladium:intangibility',
    activation: 'Toggle', cost: 1, requires: [], cooldown: 200, icon: S('mind'),
    summary: 'Walk through blocks and mobs. Nothing can hurt you while it is on.',
    details: `<p>You pass through blocks (up and down too while flying) and every hit is cancelled. Your reach and hitbox shrink to
      almost nothing while it's on, which uses Pehkui. 10 second cooldown afterwards.</p>`,
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
    summary: 'Three copies of you for 60 seconds.',
    details: `<p>The clones look exactly like you, with your skin, armor, held items, render layers and name tag. Each has 20
      health. They follow you like a tamed wolf, fight back, and attack whatever you hit. Mobs after you pick randomly between
      you and the clones near you. They vanish after 60 seconds or when you die and never drop anything. 20 second cooldown.</p>`,
  },
  {
    group: 'mind', key: 'mind_reading', name: 'Mind Reading', type: 'infinity:mind_reading',
    activation: 'Key press', cost: 1, requires: [], cooldown: 20, icon: S('mind'),
    summary: 'Look at a mob or player (up to 32 blocks) to see its health, effects, gear, inventory and target.',
    details: `<p>Opens a view you can't take anything out of. The top row has a name tag whose tooltip shows the type, health,
      absorption, armor, owner and current target (plus food and level for players), followed by up to 8 active effects. Below
      that are the six equipment slots, then the inventory of a player, a mob that carries items (villagers, allays, piglins)
      or a horse with a chest.</p>`,
  },
  {
    group: 'mind', key: 'disguise', name: 'Disguise', type: 'infinity:disguise',
    activation: 'Key press', cost: 1, requires: [], cooldown: 20, icon: S('mind'),
    summary: "Type a username and wear that player's skin and name.",
    details: `<p>The name can be 3 to 16 letters, digits or underscores. Everyone sees you with that player's skin and name tag.
      <strong>Reset</strong> puts your own skin back. The disguise is only worn while the ability is unlocked, so losing the stone
      takes it off.</p>`,
  },
  {
    group: 'scepter', key: 'scepter_blast', name: 'Scepter Power Blast', type: 'palladium:energy_beam',
    activation: 'Hold', cost: null, requires: [], icon: 'icons/power_blast_blue.png',
    summary: 'Hold to fire a beam from the Scepter. 20 damage, 50 blocks, sets things on fire.',
    details: `<p>Shows up in the Mind Stone's ability bar while the Scepter is in your main hand. A Mind Stone in the Curios head
      slot fires the same beam from your forehead.</p>`,
  },

  // Reality Stone
  {
    group: 'reality', key: 'save_dummy', name: 'Block Saving', type: 'palladium:dummy',
    activation: 'Upgrade', cost: 128, requires: [], icon: S('reality'),
    summary: 'Unlocks Copy Block and Paste Block.',
    details: `<p><strong>Copy Block</strong> saves the block you're looking at, up to 30 blocks away. Unbreakable blocks can't be
      copied. <strong>Paste Block</strong> turns the block you're looking at into your saved block, or every non-air block within 5
      blocks if you're sneaking. Paste respects build permissions and claims. Your saved block stays through death and relogging
      and shows as the Paste icon.</p>`,
  },
  {
    group: 'reality', key: 'shrink_dummy', name: 'Size Changing', type: 'palladium:dummy + palladium:command',
    activation: 'Scroll', cost: 1, requires: [], icon: S('reality'),
    summary: 'Unlocks Size Control. Turn it on and scroll to grow up to 5× or shrink to 0.1×.',
    details: `<p>Turn on <strong>Size Control</strong> in the ability bar and scroll. Down shrinks you (0.9×, 0.8× and so on down to
      0.1×) and up grows you (2×, 3×, 4×, 5×, and you move faster when you're bigger). Turning Size Control off puts you back to
      normal size. Uses Pehkui.</p>`,
  },
  {
    group: 'reality', key: 'invisibility', name: 'Invisibility', type: 'palladium:invisibility',
    activation: 'Toggle', cost: 1, requires: [], icon: S('reality'),
    summary: 'Properly invisible. No body, no armor, no name tag.',
  },
  {
    group: 'reality', key: 'weather_wheel', name: 'Change the Weather', type: 'palladium:ability_wheel',
    activation: 'Hold', cost: 1, requires: [], icon: 'icons/weather_wheel.png',
    summary: 'Hold for a wheel with Clear, Rain and Thunder.',
  },

  // Power Stone
  {
    group: 'power', key: 'impower', name: 'Energy Blast', type: 'infinity:energy_blast',
    activation: 'Key press', cost: 1, requires: [], cooldown: 5, icon: 'icons/energy_blast.png',
    summary: 'A magenta energy bolt that does 3 × 2^level damage.',
    details: `<p>Hits the first thing in its path. The damage doubles with every
      <a href="@/progression.html#power-levels">Power Stone level</a>, from 3 at level 0 to 6144 at level 11, and becomes infinite at
      full power.</p>`,
  },
  {
    group: 'power', key: 'knockback', name: 'Knockback Resistance', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: ['impower'], icon: S('power'),
    summary: 'Nothing knocks you back.',
  },
  {
    group: 'power', key: 'power_blast_aim', name: 'Power Blast', type: 'infinity:power_blast',
    activation: 'Hold', cost: 1, requires: ['impower'], icon: 'icons/power_blast.png',
    summary: 'Hold to fire a 100 block beam that smelts blocks and starts fires.',
    details: `<p>Does 2^level damage. At full power (level 11 with all six stones) it turns rainbow and explodes (power 4) wherever
      it hits a block, every tick. Fired from your off hand.</p>`,
  },
  {
    group: 'power', key: 'power_levels', name: 'Power Levels 1 to 11', type: 'palladium:dummy (×11)',
    activation: 'Upgrade', cost: 434, requires: [], icon: S('power'),
    summary: 'Eleven levels you buy one by one. Each doubles your base attack damage.',
    details: `<p>They cost 2, 4, 8, 12, 18, 26, 36, 48, 64, 88 and 128 Aspects of Existence, 434 in total. Use
      <strong>Damage Control</strong> to pick which level is active. Full table on
      <a href="@/progression.html#power-levels">Power Levels</a>.</p>`,
  },
  {
    group: 'power', key: 'damage_control', name: 'Damage Control', type: 'palladium:command + infinity:power_level_change',
    activation: 'Scroll', cost: null, requires: ['power_levels'], icon: S('power'),
    summary: 'Turn it on, then scroll to set your active power level.',
    details: `<p>You can't go above the highest level you've bought. The purple bar shows the level (0 to 11). While you have the
      Power Stone your base attack damage is 2^level, and it goes back to 1 when you lose the stone.</p>`,
  },
  {
    group: 'power', key: 'explosion2', name: 'Cosmic Explosion', type: 'palladium:dummy',
    activation: 'Upgrade', cost: 1, requires: ['power_blast_aim'], icon: 'icons/rocket_burst.png',
    summary: 'You can control the raw energy now. Unlocks Rocket Burst and Power Cyclone.',
  },
  {
    group: 'power', key: 'rocket_burst', name: 'Rocket Burst', type: 'infinity:rocket_burst',
    activation: 'Key press', cost: null, requires: ['explosion2'], cooldown: 100, icon: 'icons/rocket_burst.png',
    summary: 'Below level 11, fires five homing rockets.',
    details: `<p>The rockets explode when they hit and never hurt you, and you're immune to explosions while they fire. Damage
      scales with level ÷ 11, so they do nothing at level 0. At level 11 this becomes Power Cyclone. 5 second cooldown.</p>`,
  },
  {
    group: 'power', key: 'power_cyclone', name: 'Power Cyclone', type: 'infinity:power_cyclone',
    activation: 'Hold', cost: null, requires: ['explosion2'], icon: 'icons/rocket_burst.png',
    summary: 'Level 11 only. Hold to turn into a cyclone of energy that fires a rocket every second.',
    details: `<p>You can't move, explosions don't hurt you, and radiation cracks spread over your skin without harming you. The
      cracks can be hidden with Radiation Texture Toggle.</p>`,
  },
  {
    group: 'power', key: 'meteor_storm', name: 'Meteor Storm', type: 'infinity:meteor_storm',
    activation: 'Key press', cost: 1, requires: ['explosion2'], needsStones: ['space', 'power'], icon: 'icons/meteor.png',
    summary: 'Breaks a moon apart and drops the pieces where you are looking.',
    details: `<p>Needs the Space Stone too, from the gauntlet, a held Tesseract or Space Stone, the head slot or a Cosmi-Rod.
      Reaches up to 256 blocks. The moon is 1 + your power level blocks across. You can only have one storm going at a time, and
      big ones can lag.</p>`,
  },
  {
    group: 'power', key: 'radiation_texture_toggle', name: 'Radiation Texture Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('power'),
    summary: 'Free. Click it in the skill tree to hide or show the radiation cracks on your skin.',
  },

  // Time Stone
  {
    group: 'time', key: 'fast_forward', name: 'Fast Forward Daylight Cycle', type: 'palladium:command',
    activation: 'Hold', cost: 1, requires: [], icon: S('time'),
    summary: 'Hold to speed through the day (100 ticks of daytime every tick).',
  },
  {
    group: 'time', key: 'projectile_stop', name: 'Stop Projectile', type: 'infinity:projectile_stop',
    activation: 'Toggle', cost: 1, requires: ['fast_forward'], icon: 'icons/no_arrow.png',
    summary: 'Projectiles that get within 2.5 blocks of you stop in the air.',
    details: `<p>Works on arrows, spectral arrows, tridents, ender pearls, snowballs, eyes of ender, fireballs, eggs and experience
      bottles (the <code>#infinity:projectiles</code> tag). They hang there for 50 seconds and then carry on the way they were
      going, even after a world reload.</p>`,
  },
  {
    group: 'time', key: 'time_set', name: 'Time Command', type: 'infinity:time_set',
    activation: 'Passive', cost: 1, requires: ['fast_forward'], icon: S('time'),
    summary: 'Lets you use /infinity time set <time>.',
    details: `<p>See <a href="@/commands.html#infinity-time-set">/infinity time set</a>. Time always moves forward to the time you
      ask for.</p>`,
  },
  {
    group: 'time', key: 'daylight_cycle_toggle', name: 'Daylight Cycle Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: ['fast_forward'], icon: S('time'),
    summary: 'Free. Click it to switch the doDaylightCycle game rule.',
  },
  {
    group: 'time', key: 'slow_time_dummy', name: 'Slow Time', type: 'infinity:time_flow',
    activation: 'Scroll', cost: 5, requires: ['fast_forward'], icon: 'icons/hourglass.png',
    summary: 'Unlocks Change Flow of Time. Turn it on and scroll to change the server tick rate.',
    details: `<p>While <strong>Change Flow of Time</strong> is on, scroll down to slow the world (4 fewer ticks per second per step,
      down to 2 TPS) or up to speed it up (4 more per step, up to 40 TPS). The green bar shows the step and the middle is normal
      speed. Your step is remembered for next time. Turning it off puts the server back to 20 TPS. You keep moving at normal
      speed. <strong>It affects the whole server.</strong></p>`,
  },
  {
    group: 'time', key: 'time_freeze_dummy', name: 'Freeze Time', type: 'infinity:time_freeze',
    activation: 'Toggle', cost: 10, requires: ['slow_time_dummy'], icon: 'icons/stop.png',
    summary: 'Unlocks Time Freeze. Everything stops except you.',
    details: `<p>Press once to freeze and again to unfreeze. You can walk on water while time is frozen.
      <strong>It affects the whole server.</strong></p>`,
  },
  {
    group: 'time', key: 'screen_toggle', name: 'Screen Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('time'),
    summary: 'Free. Hides or shows the green screen tint you get while using time powers.',
  },

  // Soul Stone
  {
    group: 'soul', key: 'soul_storage', name: 'Soul Storage', type: 'infinity:soul_storage',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'),
    summary: 'Everything you kill gives you a soul, up to 50 (the orange bar).',
    details: `<p>Clones and mobs that were already drained don't count. See <a href="@/progression.html#soul-storage">Soul Storage</a>.</p>`,
  },
  {
    group: 'soul', key: 'soul_heal', name: 'Soul Heal', type: 'infinity:soul_heal',
    activation: 'Key press', cost: 1, requires: ['soul_storage'], cooldown: 10, icon: S('soul'),
    summary: 'Spend 1 soul to heal 2 hearts.',
  },
  {
    group: 'soul', key: 'soul_drain', name: 'Soul Drain', type: 'infinity:soul_drain',
    activation: 'Key press', cost: 1, requires: ['soul_heal'], cooldown: 10, icon: S('soul'),
    summary: 'Pull the soul out of the mob you look at (8 blocks). It stands still and turns grey.',
    details: `<p>Gives you 1 soul. Use it while <strong>sneaking</strong> to give a drained mob its soul back for 1 soul. Players,
      bosses (<code>#forge:bosses</code>), clones and mobs that already have no AI can't be drained. The mob stays drained after a
      reload.</p>`,
  },
  {
    group: 'soul', key: 'glow', name: 'Glow', type: 'palladium:entity_glow',
    activation: 'Hold', cost: 1, requires: [], icon: S('soul'),
    summary: 'Hold to see every mob and player within 100 blocks outlined in orange.',
  },
  {
    group: 'soul', key: 'locateplayer_command', name: 'Locate Entity Command', type: 'infinity:locate_player',
    activation: 'Passive', cost: 1, requires: ['glow'], icon: S('soul'),
    summary: 'Lets you use /infinity soul locateplayer <player>.',
  },
  {
    group: 'soul', key: 'summon_zombie', name: 'Summon Zombie', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Summons six zombies on your team.',
    details: `<p>Three named ones (Transfer, Pugmeowla and Dark Zombie) and three normal ones. You and the zombies join the
      <code>peaceful</code> team so they don't go for you.</p>`,
  },
  {
    group: 'soul', key: 'enter_soulworld', name: 'Enter / Exit Soulworld', type: 'infinity:pocket_dimension_enter / exit',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Takes you and everything within 5 blocks into the Soulworld. Use it again to come back.',
    details: `<p>Everyone arrives at Y 72 above the same X and Z. Each mob remembers where it came from, so <em>Exit Soulworld</em>
      (which replaces the ability while you're inside) sends them all back to their own spot.</p>`,
  },
  {
    group: 'soul', key: 'saturation', name: 'Saturation', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'), defensive: true,
    summary: 'You never get hungry.',
  },
  {
    group: 'soul', key: 'effect_immune', name: 'Effect Immunity', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('soul'), defensive: true,
    summary: 'Clears most bad effects (poison, wither, slowness, blindness and more) every tick.',
  },
  {
    group: 'soul', key: 'regen', name: 'Regeneration', type: 'palladium:command',
    activation: 'Passive', cost: 16, requires: [], icon: S('soul'), defensive: true,
    summary: 'Very strong permanent Regeneration.',
  },
  {
    group: 'soul', key: 'health', name: 'Health', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 64, requires: [], icon: S('soul'), defensive: true,
    summary: 'Close to infinite max health.',
  },
  {
    group: 'soul', key: 'immortal', name: 'Immortality', type: 'palladium:immortality + infinity:invulnerability',
    activation: 'Passive', cost: 128, requires: ['health'], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: S('soul'), defensive: true,
    summary: 'You can not die. Needs all six stones.',
    details: `<p>Every hit is cancelled before it lands, shown with soul particles. That includes damage that normally goes through
      invulnerability.</p>`,
  },

  // Infinity Gauntlet
  {
    group: 'gauntlet', key: 'kill_half', name: 'Kill Half of All Entities', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'The Snap. Half of everything alive in your dimension turns to dust.',
    details: `<p>Press twice within 3 seconds. See <a href="@/gauntlet/snap.html">The Snap</a>.</p>`,
  },
  {
    group: 'gauntlet', key: 'kill_hostile', name: 'Kill All Hostile', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'Sends every hostile mob in every dimension to a locked room in the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'kill_player', name: 'Kill Other Players', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'Sends every other player to the same room in the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'destroy_stones', name: 'Destroy Stones', type: 'palladium:animation_timer',
    activation: 'Toggle', cost: null, requires: [], confirm: true, needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: 'icons/snap.png',
    summary: 'Takes 7 seconds and destroys all six stones in the gauntlet.',
  },
  {
    group: 'gauntlet', key: 'normal_gauntlet', page: 'gauntlet/skins.html', name: 'Return to Original Gauntlet', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/infinity_gauntlet.png',
    summary: 'Takes the skin off and gives you its unlock item back.',
    details: `<p>Only there while a skin is on. While you're still burnt from the Snap it can't take off the Burnt Gauntlet.</p>`,
  },

  // Tools and containers
  {
    group: 'cosmi_rod', key: 'shockwave', name: 'Shockwave', type: 'infinity:shockwave',
    activation: 'Key press', cost: null, requires: [], cooldown: 100, icon: 'icons/shockwave.png',
    summary: 'A blast from your hand that throws back and hurts everything in front of you.',
    details: `<p>Lasts 7 ticks and does 5 damage per tick to everything in a box in front of you that grows up to 4 blocks, launching
      it the way you're facing. 5 second cooldown. Works with the Cosmi-Rod in either hand.</p>`,
  },
  {
    group: 'orb', key: 'rotate', name: 'Rotate Left / Rotate Right', type: 'geckolib:render_layer_animation',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/left.png',
    summary: 'Turns the Orb’s combination lock one step.',
  },
  {
    group: 'orb', key: 'open_close', name: 'Open / Close Orb', type: 'palladium:dummy',
    activation: 'Toggle', cost: null, requires: [], icon: 'renders/orb.png',
    summary: 'Once you know the combination, opens the Orb so you can take or put back the Power Stone.',
  },
  {
    group: 'orb', key: 'reset_progress', name: 'Lock Orb', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/lock.png',
    summary: 'Locks the Orb again. You will need the combination to open it.',
  },
  {
    group: 'eye', key: 'open', name: 'Open / Close Eye', type: 'infinity:eye_of_agamotto',
    activation: 'Key press', cost: null, requires: [], cooldown: 40, icon: 'renders/eye_of_agamotto.png',
    summary: 'Opens or closes the Eye of Agamotto you are wearing.',
  },
  {
    group: 'eye', key: 'remove_stone', name: 'Remove / Insert Time Stone', type: 'infinity:eye_of_agamotto',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: S('time'),
    summary: 'Take the Time Stone out of the open Eye, or put a held one back.',
  },
  {
    group: 'aether', key: 'insert_reality_stone', name: 'Insert Reality Stone', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/aether.png',
    summary: 'With the Reality Stone in your off hand, turns an Empty Aether back into the Aether.',
  },
  {
    group: 'telephone', key: 'summon', name: 'Summon / Return Soul Guardian', type: 'palladium:command',
    activation: 'Right-click', cost: null, requires: [], cooldown: 24000, icon: 'renders/soul_guardian_telephone.png',
    summary: 'Calls the Soul Guardian over from Vormir. Sneak and right-click to send it back.',
  },
];
