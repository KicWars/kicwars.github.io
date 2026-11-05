# Plane combat overhaul: War Thunder-style flight (design)

Sub-project 1 of 3 (then visuals, then ground gameplay/modes).

## Goal
Air combat where speed and altitude are resources: real lift/drag/stall physics, mouse-aim that
flies that physics via an auto-pilot (War Thunder default), plus gunnery, damage and AI that
fit. Everything outside planes is untouched.

## Context
- Single file `index.html` (identical copy `warsim.html`), three.js r128 inlined, no build.
- Current `movePlane` (~line 7805): mouse-aim arcade kinematics on heading `p.h`, pitch `p.p`,
  roll `p.r`; speed is a scalar with a fake stall threshold. `this.fpP` is a flight-path pitch hack.
- Plane stats live in the entity data table `d` (`d.spd`, `d.turn`).
- Sim state is shared with a network layer (play-with-a-friend), so attitude must stay syncable.

## Design
1. **Flight model.** Per plane: quaternion attitude + velocity vector. Lift = f(angle of attack)
   up to a stall AoA, then drops off; drag = parasitic + induced (tight turns bleed speed);
   thrust falls with altitude; flaps add lift+drag; gravity trades altitude for speed. Per-plane
   data in `d`: mass, wing area, thrust, max G, stall AoA, flap effect.
2. **Mouse-aim auto-pilot.** Controller converts the aim point into elevator/aileron/rudder,
   limited by G and AoA. Over-pulling stalls. Toggle switches to direct stick (mouse = pitch/roll).
   Existing stall warning stays.
3. **Gunnery.** Tracers use muzzle velocity + gravity drop. HUD lead-indicator pipper.
   Convergence fixed ~400 m.
4. **Damage.** Parts: wings, tail, engine, fuel. Wing hit = roll bias; engine hit = smoke and
   thrust loss; fuel leak ends in fire; fatal damage = crash.
5. **AI.** AI flies the same physics with basic energy tactics: boom-and-zoom when fast,
   turn-fight when slow, defensive break on inbound missile (existing chaff logic kept).
6. **Camera/HUD.** Chase cam with speed shake and G-blur; HUD shows speed, altitude, G, AoA;
   stall buzz.

## Compatibility
Keep `p.h`, `p.p`, `p.r` as values derived from the quaternion each tick, and keep the network
payload shape, so unchanged code (render, missiles, chaff, ground-warning) keeps working.
Helicopters and ground vehicles are not touched.

## Testing
No test harness exists. Verify in the browser: scripted flight cases (level flight holds speed at
cruise throttle, stall at low speed/high AoA, dive gains speed, hard turn bleeds speed, aim-point
tracking is stable), console-error check, and a friend-mode sanity run.

## Out of scope
Visual overhaul, ground gameplay/modes, helicopter model.
