# Direction interview (2026-11-07)

Captured from a click-through interview with Finn. No code was written that day. Order below is the agreed priority. Status: decisions, not built.

## Goal
Open the game to the public **within a month**, friends first. Ranked ladder is cut for now.

## Order of work
1. **Gameplay feel, controls and balance** (improves every mode)
2. **Operation Red Star**: Navigator and Bombardier roles, flak, fighters
3. **Accounts** on the relay
4. **Performance** (frame rate in big battles, load time)
5. **Visuals** (lowest priority if time runs short)
6. **Public-launch bar**: new-player tutorial

Process: ask before big design choices, keep `docs/plans/` current as work lands, test with short Playwright pokes only (no long sims).

## 1. Feel, controls, balance

### Planes (laptop trackpad is the target device)
- Aim: **mouse aim with cursor lag** (the plane chases a cursor, War Thunder style). Fix the twitchy/drifting mouse aim.
- Weapon keys: **left click fires guns, one key for the special weapon** (replaces E/R/Y as the default; keep rebindable).
- Landing gear and flaps: an **assist toggle** (automatic by default, manual option for experienced pilots).
- Target lock: easier to acquire, stays locked when the target turns, clearer lead marker, camera smoothing.

### Tanks / ground vehicles
- Too easy: bot tanks line up to be one-tapped. They should **spread out and flank** and **use cover and hills**.
- **Collision:** tanks block each other, push infantry and props aside, and are blocked by buildings and trees.
- Driving feels clunky; targets are hard to see (spotting, markers).

### On foot (first person)
- Mouse look, climbing and terrain, and gun feel.
- Gun feel to add: recoil and muzzle flash, hit markers and sounds, reload animation, aim down sights.

### Balance
- Bots: aim accuracy, tactics, RTS expansion speed, with easy/medium/hard levels (this is the backlog "difficulty setting").
- RTS economy: **early game too slow, costs feel arbitrary**. Ideas picked: faster early income, cheaper first buildings, early skirmish objectives.
- Weapon damage and reload need a pass.

## 2. Operation Red Star
Already built (see [bomber.md](bomber.md)): flight, complications, shared crew lounge, parachutes and bail-out, Polar Base, two-key arming, take-off roll, and the **Strangelove ending** (rider on the falling bomb, blast, end card). Note: bomber.md's top "not built" line is out of date.

Next, in order:
- **Navigator:** plot legs on a chart, call ETAs and landmarks, confirm the target.
- **Bombardier / bomb run:** bombsight alignment, pilot and bombardier cooperating, two-key arming first, a timing window.
- **Threats:** flak over the coast, fighter attacks, escalating waves, crew casualties, screen shake and sound.
- **Shared interiors** must show: other crew walking, seated poses at stations, windows to the outside, lounge activities.
- **Difficulty selector** (Training / Standard / Brutal). Crews of 2 to 8 must all work, since Finn's group size varies (use the merged-role scaling in bomber.md).
- Tone: silly crew, tense target.
- **Delayed:** Engineer and Radio roles, and the code-word challenge.

## 3. Accounts (small database on the relay)
- Unique usernames reserved on the relay, a simple passcode per name, a profanity filter, recovery on a new device.
- Saved rank, XP and stats (today in localStorage `kw-xp` / `kw-stats`).
- Friends: invite code (as now), join a friend directly, party before a match.
- Cut for now: ranked ladder, online/offline presence.
- Risk: the relay stores data for the first time; needs abuse protection. Propose the schema before building.

## 4. Performance
- Low frame rate in big battles; slow load/startup.
- Ideas picked: smaller file / lazy-load rarely used modes, skip the menu demo battle.

## 5. Visuals
Mountains and rocks, trees and foliage, UI and menus.

## Public menu
Show **Play vs bots (RTS)**, **Operation Red Star**, and **Arcade battles marked as beta** at launch.

## Dropped for now
Submarine, convoy escort, heist, 1v1 duel arena, naval battles, kill cam, camos.

## Launch bar
New-player tutorial, opened as a **guided tutorial mission** on first load. It covers RTS basics, flying a plane, driving a tank / on foot, and joining a friend's game. (Moderation tools and a public lobby were not picked.)

## Red Star clarity and comms
- Weakest point today: **unclear what to do**. Role guidance and prompts matter more than pacing or length.
- Most crews will play **in the same room** (voice in person), so in-game comms stay light: **text chat** only. No quick-message wheel or map pings needed for now.

## Risks
- One month is tight for feel work, Red Star roles and accounts together. If it slips, cut visuals first, then friends list.
- Accounts touch the relay, which can break multiplayer if rushed.

## Open questions
- Which key is the special-weapon key, and how a plane with several specials (missiles, bombs, rockets) cycles them.
- Account storage: which database on the relay.
