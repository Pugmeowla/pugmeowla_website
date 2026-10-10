// Abilities in 7.3, from the 7.3 addon pack's data/infinity/palladium/powers/*.json and KubeJS scripts.
// Same format as the 8.0 file. In 7.3 the Power Stone's power is infinity:power_stone_passive.

const S = (id) => `stones/${id}_stone.png`;

export const groups = {
  space: { name: 'Space Stone', power: 'infinity:space_stone', page: 'stones/space.html' },
  mind: { name: 'Mind Stone', power: 'infinity:mind_stone', page: 'stones/mind.html' },
  reality: { name: 'Reality Stone', power: 'infinity:reality_stone', page: 'stones/reality.html' },
  power: { name: 'Power Stone', power: 'infinity:power_stone_passive', page: 'stones/power.html' },
  time: { name: 'Time Stone', power: 'infinity:time_stone', page: 'stones/time.html' },
  soul: { name: 'Soul Stone', power: 'infinity:soul_stone', page: 'stones/soul.html' },
  scepter: { name: 'Scepter', power: 'infinity:mind_stone', page: 'stones/mind.html' },
  gauntlet: { name: 'Infinity Gauntlet', power: 'infinity:infinity_gauntlet', page: 'gauntlet/snap.html' },
  cosmi_rod: { name: 'Cosmi-Rod', power: 'infinity:cosmi-rod', page: 'containers.html' },
  orb: { name: 'Orb', power: 'infinity:orb', page: 'containers.html' },
  aether: { name: 'Empty Aether', power: 'infinity:empty_aether', page: 'containers.html' },
  telephone: { name: 'Soul Guardian Telephone', power: 'infinity:soul_guardian_telephone', page: 'containers.html' },
};

export const abilities = [
  // Space Stone
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
  {
    group: 'space', key: 'fall_immunity', name: 'Fall Damage Immunity', type: 'palladium:damage_immunity',
    activation: 'Passive', cost: 1, requires: ['step_assist'], icon: S('space'),
    summary: 'No fall damage.',
  },
  {
    group: 'space', key: 'force_field', name: 'Force Field', type: 'palladium:attribute_modifier',
    activation: 'Toggle', cost: 1, requires: ['fall_immunity'], icon: 'icons/force_field.png',
    summary: 'A shield bubble that blocks attacks but stops you moving.',
    details: `<p>Gives a huge armor and toughness boost and draws a shield around you while you're rooted in place. A KubeJS script
      cancels hits under 23 damage from anything with an attacker, and every hit from Iron Golems, Wardens, Vindicators, Piglin
      Brutes and Zombified Piglins.</p>`,
  },
  {
    group: 'space', key: 'water_breathing', name: 'Water Breathing', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: ['force_field'], icon: S('space'),
    summary: 'Breathe underwater.',
  },
  {
    group: 'space', key: 'grab_entity2', name: 'Telekinesis', type: 'corewithstuff:telekinesis',
    activation: 'Hold', cost: 1, requires: ['force_field'], icon: S('space'),
    summary: 'Hold to grab a mob or player (up to 20 blocks) and move it around.',
    details: `<p>Needs CoreWithStuff. Scroll to move what you're holding between 2 and 30 blocks away and left-click to throw it.
      Bedrock, barriers and obsidian can't be grabbed.</p>`,
  },
  {
    group: 'space', key: 'teleport', name: 'Teleport', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: ['grab_entity2'], icon: 'icons/teleport.png',
    summary: 'Teleports you to where you are looking, through a short portal.',
  },
  {
    group: 'space', key: 'teleport_command', name: 'Teleport Command', type: 'palladium:dummy',
    activation: 'Passive', cost: 10, requires: ['teleport'], icon: 'icons/teleport.png',
    summary: 'Lets you use /space_tp <x> <y> <z> <dimension>.',
    details: `<p>Takes you and everything within 3 blocks to those coordinates in any dimension. See
      <a href="@/commands.html#space-tp">/space_tp</a>.</p>`,
  },
  {
    group: 'space', key: 'teleport_gui', name: 'Teleport GUI', type: 'corewithstuff:wormhole_gui',
    activation: 'Key press', cost: 1, requires: ['teleport'], icon: 'icons/teleport.png',
    summary: 'A wormhole menu from CoreWithStuff. Locked for good without CoreWithStuff.',
  },
  {
    group: 'space', key: 'black_hole_on', name: 'Black Hole', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: ['grab_entity2'], needsStones: ['space', 'power'], icon: 'icons/black_hole.png',
    summary: 'Makes a black hole that pulls in everything within 7 blocks. Press again to switch it off.',
    details: `<p>Needs the Power Stone as well. <em>Black Hole Off</em> takes its place in the bar while one is active.</p>`,
  },

  // Mind Stone
  {
    group: 'mind', key: 'intangibility', name: 'Intangibility', type: 'palladium:intangibility',
    activation: 'Toggle', cost: 1, requires: [], icon: S('mind'),
    summary: 'Walk through blocks and mobs. Nothing can hurt you while it is on.',
    details: `<p>Your reach and hitbox shrink to almost nothing while it's on (Pehkui), and a KubeJS script cancels all damage.
      No cooldown in 7.3.</p>`,
  },
  {
    group: 'mind', key: 'passive', name: 'Pacify', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: ['intangibility'], icon: S('mind'),
    summary: 'Mobs within 5 blocks stop attacking you. Sneak and use it to undo.',
    details: `<p>You and everything within 5 blocks join the <code>peaceful</code> team. Use it while sneaking (Un-Pacify) to take
      them off it again.</p>`,
  },
  {
    group: 'mind', key: 'night_vision', name: 'Night Vision', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: ['intangibility'], icon: S('mind'),
    summary: 'Permanent Night Vision.',
  },
  {
    group: 'mind', key: 'hero', name: 'Hero of the People', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: ['passive'], icon: S('mind'),
    summary: 'Permanent Hero of the Village VI.',
  },
  {
    group: 'mind', key: 'recipe', name: 'Recipes', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: [], icon: S('mind'),
    summary: 'Unlocks every recipe in your recipe book.',
  },
  {
    group: 'mind', key: 'flight', name: 'Flight', type: 'palladium:flight',
    activation: 'Passive', cost: 1, requires: [], icon: 'icons/fly.png',
    summary: 'Fly. Works from the gauntlet, a held Mind Stone or Scepter, the head slot or a Mind Cosmi-Rod.',
  },
  {
    group: 'mind', key: 'flight_toggle', name: 'Flight Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: ['flight'], icon: S('mind'),
    summary: 'Free. Click it in the skill tree to turn Mind Stone flight off or back on.',
  },
  {
    group: 'scepter', key: 'scepter_blast', name: 'Scepter Power Blast', type: 'palladium:energy_beam',
    activation: 'Hold', cost: null, requires: [], icon: 'icons/power_blast_blue.png',
    summary: 'Hold to fire a beam from the Scepter. 20 damage, 50 blocks, sets things on fire.',
    details: `<p>Works while the Scepter is in your main hand. A Mind Stone in the Curios head slot fires the same beam from your head.</p>`,
  },

  // Reality Stone
  {
    group: 'reality', key: 'effects', name: 'Effects', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('reality'),
    summary: 'Gives everything within 100 blocks Blindness, Nausea, Darkness and Slowness for 100 seconds.',
    details: `<p>You don't get them yourself.</p>`,
  },
  {
    group: 'reality', key: 'shrink_dummy', name: 'Size Changing', type: 'palladium:dummy + palladium:command',
    activation: 'Scroll', cost: 1, requires: [], icon: S('reality'),
    summary: 'Unlocks Size Control. Turn it on and scroll to grow up to 5× or shrink to 0.1×.',
    details: `<p>Same steps as 8.0: down goes 0.9×, 0.8× and on to 0.1×, up goes 2× to 5×. Turning Size Control off puts you back to
      normal. Uses Pehkui.</p>`,
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
  {
    group: 'reality', key: 'save_dummy', name: 'Block Saving', type: 'palladium:dummy',
    activation: 'Upgrade', cost: 128, requires: [], icon: S('reality'),
    summary: 'Unlocks Block Duplication: while it is on, blocks you look at get added to your inventory.',
    details: `<p>Use <em>Block Duplication On</em> and <em>Block Duplication Off</em> in the ability bar to switch it.</p>`,
  },

  // Power Stone
  {
    group: 'power', key: 'impower', name: 'Impower', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], cooldown: 2400, icon: 'icons/impower.png',
    summary: 'Health Boost VI and Resistance IV for 90 seconds.',
  },
  {
    group: 'power', key: 'knockback', name: 'Knockback Resistance', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 1, requires: ['impower'], icon: S('power'),
    summary: 'Nothing knocks you back.',
  },
  {
    group: 'power', key: 'power_blast_aim', name: 'Power Blast', type: 'palladium:energy_beam',
    activation: 'Hold', cost: 1, requires: ['impower'], icon: 'icons/power_blast.png',
    summary: 'Hold to fire a 100 block beam that smelts blocks and starts fires. Damage is 2^level.',
    details: `<p>At level 11 with all six stones the beam turns rainbow, does near infinite damage and summons TNT where it hits
      blocks. Fired from your off hand.</p>`,
  },
  {
    group: 'power', key: 'power_levels', name: 'Power Levels 1 to 11', type: 'palladium:dummy (×11)',
    activation: 'Upgrade', cost: 434, requires: [], icon: S('power'),
    summary: 'Eleven levels you buy one by one. Each doubles your base attack damage.',
    details: `<p>They cost 2, 4, 8, 12, 18, 26, 36, 48, 64, 88 and 128 Aspects of Existence. Use <strong>Damage Control</strong> to
      pick the active one. See <a href="@/progression.html#power-levels">Power Levels</a>.</p>`,
  },
  {
    group: 'power', key: 'damage_control', name: 'Damage Control', type: 'palladium:command',
    activation: 'Scroll', cost: null, requires: ['power_levels'], icon: S('power'),
    summary: 'Turn it on, then scroll to set your active power level.',
    details: `<p>Your base attack damage is set to 2^level (1 at level 0, 2048 at level 11) and goes back to 1 when you lose the stone.</p>`,
  },
  {
    group: 'power', key: 'explosion2', name: 'Cosmic Explosion', type: 'palladium:command',
    activation: 'Hold', cost: 1, requires: ['power_blast_aim'], icon: 'icons/rocket_burst.png',
    summary: 'Hold to set off a ring of TNT 8 blocks around you, over and over. Explosions don’t hurt you.',
  },
  {
    group: 'power', key: 'meteor_storm', name: 'Meteor Storm', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: ['explosion2'], needsStones: ['space', 'power'], icon: 'icons/meteor.png',
    summary: 'Drops 20 deepslate meteors from 70 blocks up, spread up to 50 blocks around you.',
    details: `<p>Needs the Space Stone too. Spamming it can lag.</p>`,
  },
  {
    group: 'power', key: 'radiation_texture_toggle', name: 'Radiation Texture Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('power'),
    summary: 'Free. Click it to hide or show the radiation cracks on your skin.',
  },

  // Time Stone
  {
    group: 'time', key: 'fast_forward', name: 'Fast Forward Daylight Cycle', type: 'palladium:command',
    activation: 'Hold', cost: 1, requires: [], icon: S('time'),
    summary: 'Hold to speed through the day (100 ticks of daytime every tick).',
  },
  {
    group: 'time', key: 'projectile_stop', name: 'Stop Projectile', type: 'palladium:command',
    activation: 'Toggle', cost: 1, requires: ['fast_forward'], icon: 'icons/no_arrow.png',
    summary: 'Stops projectiles in the air near you. They carry on after you leave.',
  },
  {
    group: 'time', key: 'time_set', name: 'Time Command', type: 'palladium:dummy',
    activation: 'Passive', cost: 1, requires: ['fast_forward'], icon: S('time'),
    summary: 'Lets you use /time_set <time>.',
  },
  {
    group: 'time', key: 'daylight_cycle_toggle', name: 'Daylight Cycle Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: ['fast_forward'], icon: S('time'),
    summary: 'Free. Click it to switch the doDaylightCycle game rule.',
  },
  {
    group: 'time', key: 'slow_time_dummy', name: 'Slow Time', type: 'palladium:command (chrono)',
    activation: 'Scroll', cost: 5, requires: ['fast_forward'], icon: 'icons/hourglass.png',
    summary: 'Unlocks Change Flow of Time. Turn it on and scroll to change the server tick rate.',
    details: `<p>Runs Chrono API's <code>chrono settickrate</code> for the whole server. Turning it off sets it back to 20.</p>`,
  },
  {
    group: 'time', key: 'time_freeze_dummy', name: 'Freeze Time', type: 'palladium:command (chrono)',
    activation: 'Toggle', cost: 10, requires: ['slow_time_dummy'], icon: 'icons/stop.png',
    summary: 'Unlocks Time Freeze. Pauses the whole server with chrono pausetime.',
  },
  {
    group: 'time', key: 'screen_toggle', name: 'Screen Toggle', type: 'palladium:command',
    activation: 'Key press', cost: 0, requires: [], icon: S('time'),
    summary: 'Free. Hides or shows the green screen tint.',
  },

  // Soul Stone
  {
    group: 'soul', key: 'glow', name: 'Glow', type: 'palladium:entity_glow',
    activation: 'Hold', cost: 1, requires: [], icon: S('soul'),
    summary: 'Hold to see everything within 100 blocks outlined in orange.',
  },
  {
    group: 'soul', key: 'locateplayer_command', name: 'Locate Entity Command', type: 'palladium:dummy',
    activation: 'Passive', cost: 1, requires: ['glow'], icon: S('soul'),
    summary: 'Lets you use /locateplayer <player>.',
  },
  {
    group: 'soul', key: 'saturation', name: 'Saturation', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: ['glow'], icon: S('soul'),
    summary: 'You never get hungry.',
  },
  {
    group: 'soul', key: 'effect_immune', name: 'Effect Immunity', type: 'palladium:command',
    activation: 'Passive', cost: 1, requires: ['saturation'], icon: S('soul'),
    summary: 'Clears most bad effects every tick.',
  },
  {
    group: 'soul', key: 'regen', name: 'Regeneration', type: 'palladium:command',
    activation: 'Passive', cost: 16, requires: ['saturation'], icon: S('soul'),
    summary: 'Very strong permanent Regeneration.',
  },
  {
    group: 'soul', key: 'health', name: 'Health', type: 'palladium:attribute_modifier',
    activation: 'Passive', cost: 64, requires: ['regen'], icon: S('soul'),
    summary: 'Close to infinite max health.',
  },
  {
    group: 'soul', key: 'immortal', name: 'Immortality', type: 'palladium:immortality',
    activation: 'Passive', cost: 128, requires: ['health'], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'],
    icon: S('soul'),
    summary: 'You can not die. Needs all six stones.',
    details: `<p>Comes with Invulnerability, which a KubeJS script uses to cancel every hit, with soul particles.</p>`,
  },
  {
    group: 'soul', key: 'summon_zombie', name: 'Summon Zombie', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Summons six zombies on your team.',
  },
  {
    group: 'soul', key: 'enter_soulworld', name: 'Enter / Exit Soulworld', type: 'palladium:command',
    activation: 'Key press', cost: 1, requires: [], icon: S('soul'),
    summary: 'Takes you and everything within 5 blocks to the Soulworld. Use it again to go back.',
    details: `<p>Exit sends everyone within 5 blocks to the Overworld at Y 72 above the same X and Z, with slow falling. It doesn't
      remember where they came from.</p>`,
  },

  // Gauntlet
  {
    group: 'gauntlet', key: 'kill_half', name: 'Kill Half of All Entities (Sent to Soulworld)', type: 'palladium:command',
    activation: 'Wheel', cost: null, requires: [], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'], icon: 'icons/snap.png',
    summary: 'Each mob and player has a 50% chance to turn to dust and be sent to the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'kill_hostile', name: 'Kill All Hostile', type: 'palladium:command',
    activation: 'Wheel', cost: null, requires: [], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'], icon: 'icons/snap.png',
    summary: 'Sends every hostile mob to the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'kill_player', name: 'Kill Other Players', type: 'palladium:command',
    activation: 'Wheel', cost: null, requires: [], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'], icon: 'icons/snap.png',
    summary: 'Sends every other player to the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'bring_back_snapped', name: 'Bring Back the Snapped', type: 'palladium:command',
    activation: 'Wheel', cost: null, requires: [], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'], icon: 'icons/snap.png',
    summary: 'Teleports everything that was snapped to the Soulworld back to you.',
  },
  {
    group: 'gauntlet', key: 'destroy_stones', name: 'Destroy Stones', type: 'palladium:animation_timer',
    activation: 'Wheel', cost: null, requires: [], needsStones: ['space', 'mind', 'reality', 'power', 'time', 'soul'], icon: 'icons/snap.png',
    summary: 'A 7 second ritual that breaks all six stones and sends you to the Soulworld.',
  },
  {
    group: 'gauntlet', key: 'normal_gauntlet', page: 'gauntlet/skins.html', name: 'Return to Original Gauntlet', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/infinity_gauntlet.png',
    summary: 'Takes your skin off and gives back its unlock item.',
  },

  // Tools and containers
  {
    group: 'cosmi_rod', key: 'insert_stone', name: 'Insert / Remove Stone', type: 'palladium:command',
    activation: 'Right-click', cost: null, requires: [], icon: 'renders/cosmi-rod_power.png',
    summary: 'Right-click with the rod in your main hand and a stone in your off hand to put it in. Sneak and right-click to take it out.',
  },
  {
    group: 'orb', key: 'rotate', name: 'Rotate Left / Rotate Right', type: 'geckolib:render_layer_animation',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/left.png',
    summary: 'Turns the Orb’s combination lock one step.',
  },
  {
    group: 'orb', key: 'open_close', name: 'Open / Close Orb', type: 'palladium:dummy',
    activation: 'Toggle', cost: null, requires: [], icon: 'renders/orb.png',
    summary: 'Once unlocked, opens the Orb so you can take or put back the Power Stone.',
  },
  {
    group: 'orb', key: 'reset_progress', name: 'Lock Orb', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], cooldown: 10, icon: 'icons/lock.png',
    summary: 'Locks the Orb again for you.',
  },
  {
    group: 'aether', key: 'insert_reality_stone', name: 'Insert Reality Stone', type: 'palladium:command',
    activation: 'Key press', cost: null, requires: [], icon: 'renders/aether.png',
    summary: 'With the Reality Stone in your off hand, turns an Empty Aether into the Aether.',
  },
  {
    group: 'telephone', key: 'summon', name: 'Summon / Return Soul Guardian', type: 'palladium:command',
    activation: 'Right-click', cost: null, requires: [], cooldown: 24000, icon: 'renders/soul_guardian_telephone.png',
    summary: 'Calls the Soul Guardian from Vormir. Sneak and right-click to send it back.',
  },
];
