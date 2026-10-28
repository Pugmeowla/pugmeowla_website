// Clockwork's abilities, from data/chrono_machina/palladium/powers/*.json, the skill tree in data/chrono_machina/aliens and
// the lang file. cooldown: ticks. requires: keys of skill tree entries in the same group that unlock it.
// activation: Hold | Key press | Toggle | Scroll | Right-click | Passive | Unlock (a skill tree entry)
// energy: Temporal Energy used from the 1,000-point Chronosapien meter.

const ic = (name) => `deus/icons/${name}.png`;
const up = (name) => `deus/icons/upgrade_${name}.png`;
const details = (energy, extra = '') => `<p class="ability-req"><span>Energy</span> ${energy}${extra}</p>`;

export const groups = {
  tree: { name: 'Skill tree', power: 'chrono_machina:chronosapien', page: 'skill-tree.html' },
  rays: { name: 'Temporal rays', power: 'chrono_machina:chronosapien', page: 'abilities.html' },
  timeflow: { name: 'Timeflow', power: 'chrono_machina:chronosapien', page: 'abilities.html' },
  body: { name: 'Clockwork', power: 'chrono_machina:chronosapien', page: 'abilities.html' },
  upgrade: { name: 'Upgrade fusion', power: 'chrono_machina:chronosapien_upgrade', page: 'upgrade.html' },
};

// pos: gui_position from the alien file (x right, y down). gives: the abilities it unlocks, as group/key.
// A node with parents in the alien file costs 1 Chronosapien skill point; one without is free.
const node = (key, name, icon, requires, summary, pos, gives, free = false) => ({
  group: 'tree', key, name, type: 'palladium:dummy', activation: 'Unlock', requires, icon: ic(icon), summary, pos, gives,
  unlock: free ? 'Free' : '1 skill point',
});

export const abilities = [
  // The skill tree: each entry unlocks the real abilities below. Its layout is in the alien file.
  node('beam-dummy', 'Basic Temporal Ray', 'time_beam', [], 'The starting entry. The Basic Temporal Ray fires from the chest and deals direct temporal damage.', [0, 0], ['rays/time_blast', 'rays/beam_boost'], true),
  node('slow-dummy', 'Timeflow Control', 'accelerate_time', ['beam-dummy'], 'Slow Time and Accelerate Time, and changing the time-flow rate once they\'re on.', [0.6, -0.6], ['timeflow/slow_time', 'timeflow/accelerate_time', 'timeflow/scroll_control', 'timeflow/daylight_cycle']),
  node('beam-dummy2', 'Stasis & Restoration Ray', 'time_beam_restore', ['beam-dummy'], 'The Stasis Ray stops a target in time; the Restoration Ray restores it and clears harmful effects.', [0.6, 0.6], ['rays/time_blast_stop', 'rays/time_blast_restore']),
  node('rollback-dummy', 'Temporal Reversion', 'rollback_time', ['slow-dummy'], 'The Reversion Ray, usable while Slow Time is on.', [1.2, -0.6], ['rays/time_blast_rollback']),
  node('stop-dummy', 'Time Control', 'stop', ['beam-dummy2'], 'Stopping time around you, with Beyond Time, Restop Time and Speed Up.', [1.2, 0.6], ['timeflow/stop', 'timeflow/beyondtime_area', 'timeflow/restoptime_area', 'timeflow/stoptime_speed']),
  node('meal-dummy', 'Enhanced Temporal Ray', 'time_beam_upgrade', ['rollback-dummy', 'stop-dummy'], 'A stronger ray that also slows targets and speeds up block changes. Needs both earlier branches.', [1.8, 0], ['rays/time_blast_upgrade']),
  node('timeout-ray-dummy', 'Omnitrix Timeout', 'detransform', ['meal-dummy'], 'The Timeout Ray, usable while Slow Time is on. Forces another Omnitrix to time out.', [1.8, 0.6], ['rays/time_blast_detransform'], true),
  node('recharge-ray-dummy', 'Recharge Ray', 'recharge', ['meal-dummy'], 'The Recharge Ray, usable while Accelerate Time is on. Fully recharges another Omnitrix.', [1.8, -0.6], ['rays/time_blast_recharge'], true),
  node('time-anchor-dummy', 'Temporal Anchor', 'time_anchor_back', ['meal-dummy'], 'Records your state and brings you back to it.', [2.4, -0.6], ['body/time_anchor']),
  node('remove-dummy', 'Timeline Erasure', 'time_beam_remove', ['time-anchor-dummy'], 'The Erasure Ray, charged up to erase a target from the timeline.', [3.0, -0.6], ['rays/time_blast_remove']),
  node('energy-orb-dummy', 'Temporal Singularity', 'temporal_orb', ['meal-dummy'], 'An orb of temporal energy that freezes life and grays the terrain when it bursts.', [2.4, 0.6], ['body/temporal_orb']),
  node('rewind-dummy', 'Time Rewind', 'detransform_area', ['energy-orb-dummy'], 'Infinite Timeflow: during Time Control, scroll the stopped timeline forwards or backwards.', [3.0, 0.6], ['timeflow/time_god_control', 'timeflow/rewind_time']),
  node('rotate-dummy', 'Temporal Mainspring', 'rotate_key', [], 'Turning the key on your head to charge the temporal core.', [3.6, 0], ['body/rotate_key'], true),

  // Temporal rays: pick one in the Temporal Arsenal, then hold to fire. Which ones you can pick depends on the timeflow.
  { group: 'rays', key: 'time_blast', name: 'Basic Temporal Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('time_beam'),
    summary: 'A temporal beam from the chest: 3 damage, 64 blocks. Hitting blocks ages them.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_upgrade', name: 'Enhanced Temporal Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('time_beam_upgrade'),
    summary: 'A stronger ray that slows its targets and speeds up time-based block changes (crops, saplings).', details: details('100 to fire') },
  { group: 'rays', key: 'beam_boost', name: 'Temporal Ray Overcharge', type: 'palladium:command', activation: 'Hold', icon: ic('time_beam_upgrade'),
    summary: 'While a ray is firing, overcharge it for +2 damage, more sparks and a bigger beam.', details: details('+1 while it runs') },
  { group: 'rays', key: 'time_blast_stop', name: 'Stasis Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('time_beam_stop'),
    summary: 'Stops its target in time. Only while no timeflow is running.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_restore', name: 'Restoration Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('time_beam_restore'),
    summary: 'Restores the target\'s flow of time: unfreezes it and clears harmful effects.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_rollback', name: 'Reversion Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('rollback_time'),
    summary: 'While Slow Time is on: puts the target back in an earlier state, or heals it when there is none.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_detransform', name: 'Omnitrix Timeout Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('detransform'),
    summary: 'While Slow Time is on: forces another player\'s Omnitrix to time out.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_recharge', name: 'Recharge Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('recharge'),
    summary: 'While Accelerate Time is on: fully recharges another player\'s Omnitrix.', details: details('100 to fire') },
  { group: 'rays', key: 'time_blast_remove', name: 'Timeline Erasure Ray', type: 'palladium:energy_beam', activation: 'Hold', cooldown: 100, icon: ic('time_beam_remove'),
    summary: 'Charge it up to erase the target from the timeline: a huge beam that deals 7 damage.', details: details('200 to fire') },
  { group: 'rays', key: '10k_beam', name: '10K Hand Cannon', type: 'palladium:energy_beam', activation: 'Right-click', cooldown: 40, icon: ic('chronosapien_hand_cannon'),
    summary: 'With the Prototype or 10K Omnitrix uniform, Temporal Charge is replaced by a hand cannon: hold right-click to charge an erasure beam or an energy shot.' },

  // Timeflow: hold the key to charge, let go to start. A longer charge lasts longer.
  { group: 'timeflow', key: 'slow_time', name: 'Slow Time', type: 'palladium:command', activation: 'Hold', cooldown: 80, icon: ic('slow_time'),
    summary: 'Hold to charge, then everything around you slows to the chosen time-flow rate. You stay at full speed.' },
  { group: 'timeflow', key: 'accelerate_time', name: 'Accelerate Time', type: 'palladium:command', activation: 'Hold', cooldown: 80, icon: ic('accelerate_time'),
    summary: 'Hold to charge, then speed up the time around you to the chosen rate while you stay in control.' },
  { group: 'timeflow', key: 'scroll_control', name: 'Change Flow of Time', type: 'palladium:command', activation: 'Scroll', icon: ic('scroll_control_slow'),
    summary: 'While Slow or Accelerate Time is on, toggle this and scroll to pick one of five time-flow rates. Shown on screen.' },
  { group: 'timeflow', key: 'daylight_cycle', name: 'Daylight Cycle', type: 'palladium:command', activation: 'Toggle', icon: ic('daylight_cycle'),
    summary: 'While Accelerate Time is on, speed up the day and night cycle too.' },
  { group: 'timeflow', key: 'stop', name: 'Time Control', type: 'palladium:command', activation: 'Hold', cooldown: 80, icon: ic('stop'),
    summary: 'Hold to charge, then stop time completely around you. You can still move, attack and walk on water.' },
  { group: 'timeflow', key: 'beyondtime_area', name: 'Beyond Time', type: 'palladium:command', activation: 'Key press', cooldown: 20, icon: ic('beyondtime'),
    summary: 'During Time Control, lets nearby mobs and players move again for a while.' },
  { group: 'timeflow', key: 'restoptime_area', name: 'Restop Time', type: 'palladium:command', activation: 'Key press', cooldown: 20, icon: ic('restoptime'),
    summary: 'During Time Control, freezes nearby mobs and players again.' },
  { group: 'timeflow', key: 'stoptime_speed', name: 'Speed Up', type: 'palladium:command', activation: 'Toggle', icon: ic('stoptime_speed'),
    summary: 'During Time Control, move at high speed.' },
  { group: 'timeflow', key: 'time_god_control', name: 'Infinite Timeflow', activation: 'Scroll', icon: ic('detransform_area'),
    summary: 'During Time Control, scroll to push the stopped timeline forwards or rewind it, while everything else stays frozen.' },
  { group: 'timeflow', key: 'rewind_time', name: 'Time Rewind', type: 'palladium:command', activation: 'Hold', cooldown: 80, icon: ic('rollback_time'),
    summary: 'Reverses time across the area around you: blocks and mobs go back to where they were.' },
  { group: 'timeflow', key: 'timeflow_end', name: 'End Timeflow', type: 'palladium:command', activation: 'Key press', icon: ic('stop'),
    summary: 'Ends the running timeflow early and brings back normal time.' },

  // Clockwork himself.
  { group: 'body', key: 'rotate_key', name: 'Temporal Charge', type: 'palladium:animation_timer', activation: 'Right-click', cooldown: 80, icon: ic('rotate_key'),
    summary: 'Hold right-click with an empty hand to turn the key on your head and fill the Temporal Energy meter. Slows you while you wind it.' },
  { group: 'body', key: 'temporal_orb', name: 'Temporal Singularity', activation: 'Hold', icon: ic('temporal_orb'),
    summary: 'Gather an Omnitrix-colored orb of temporal energy. When it bursts it freezes everything alive and turns the terrain gray.' },
  { group: 'body', key: 'time_anchor', name: 'Temporal Anchor', type: 'palladium:command', activation: 'Key press', icon: ic('time_anchor'),
    summary: 'Standing still, record your state. When it runs out, when you press it again, or when you would die, you go back to it. Same dimension only.' },
  { group: 'body', key: 'detransform_area', name: 'Detransform All', type: 'palladium:command', activation: 'Key press', cooldown: 60, icon: ic('detransform_area'),
    summary: 'Forces every transformed player within 10 blocks back to human.' },
  { group: 'body', key: 'fire_resistance', name: 'Chronosapien Body', type: 'palladium:damage_immunity', activation: 'Passive', icon: ic('stop'),
    summary: 'The clockwork body takes no fire or freezing damage, and shrugs off falls.' },

  // The Upgrade fusion (Clockwork merged with Ship).
  { group: 'upgrade', key: 'charge_action', name: 'Temporal Charge (Upgrade)', type: 'palladium:command', activation: 'Passive', icon: up('rotate_key'),
    summary: 'The Upgrade\'s temporal core fills itself; no winding needed. Its timeflows have no time limit.' },
  { group: 'upgrade', key: 'galvan_beam', name: 'Galvan Beam', type: 'palladium:energy_beam', activation: 'Hold', icon: up('time_beam'),
    summary: 'A Galvanic Mechamorph beam. Beam Color switches its color.' },
  { group: 'upgrade', key: 'fire_shoulder_bombs', name: 'Shoulder Bombs', type: 'palladium:projectile', activation: 'Key press', icon: up('bombs'),
    summary: 'Fires explosive bombs from the shoulders, in two stages.' },
  { group: 'upgrade', key: 'drill_hand', name: 'Drill Hand', type: 'palladium:command', activation: 'Toggle', icon: ic('drill_hand'),
    summary: 'Turns a hand into a drill (Tool Hands) for faster digging, with Drill Buff while it spins.' },
  { group: 'upgrade', key: 'leap', name: 'Leap', type: 'palladium:command', activation: 'Key press', icon: up('leap'),
    summary: 'A big jump forwards.' },
  { group: 'upgrade', key: 'super_punch', name: 'Super Punch', type: 'palladium:projectile', activation: 'Key press', icon: up('stop'),
    summary: 'Launches a punch at range. Battle Mode switches the Upgrade into its fighting stance.' },
  { group: 'upgrade', key: 'ben10-ben23-dummy', name: 'Alliance Across Time', type: 'palladium:dummy', activation: 'Passive', icon: ic('ben10_ben23'),
    summary: 'A special passive for Ben 10 and Ben 23 teaming up against Maltruant. The last entry of the Upgrade skill tree.' },
];
