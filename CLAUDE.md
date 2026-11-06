# jjfanwars: notes for Claude

Browser war game in one file: `index.html` (Three.js r128). Live at https://jjfanwars.github.io. Repo: `jjfanwars/jjfanwars.github.io`. The game was formerly called KICwars, and the repo was formerly KicWars/kicwars.github.io.

## Rules for every change
- Copy `index.html` to `warsim.html` before each commit.
- Commit messages end with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: <session url>`.
- Push with `git push -q origin main`. Make sure origin points to `https://github.com/jjfanwars/jjfanwars.github.io`. Leave nothing uncommitted or unpushed.
- Don't open PRs unless asked.
- Add a line to the in-game **What's new** list (`CHANGELOG` array near the end of index.html, newest first) for user-visible changes.
- What's new must never mention the site or repo move, and never reveal the `tester` code (it unlocks everything; the code box is at the bottom right of the menu).
- The user wants concise replies and "quick" versions when asked.
- Don't run long simulations. Write the code first, then do a load check and short Playwright pokes.

## Testing
- Playwright in headless Chromium, for example `UI.launch({mode:'host',size:128,seed:1,players:[{nation:0,name:'You'},{nation:1,name:'Bot',bot:'easy'}],me:0,link:null,tut:false,quick:false})`.
- To start arcade battles: `UI.openBat('arc'); UI.batLaunch(i); UI.scenPick('f16')`.
- Headless runs at very low fps. To test physics, call `Direct.movePlane(1/60, e, M, N)` in a loop instead of waiting for frames.
- Syntax check: extract each `<script>` block and run `node --check` on it.

## Code map (all in index.html)
- **Script blocks:** Sim (host-authoritative, DT .1), Renderer, Direct (first-person control of any unit), UI, Sfx, Tension (death screen).
- **Events and commands:** events go through `this.ev({k})`, reach `Renderer.handle` and the `UI.onEvent` switch, and Direct gets them too. Commands go through `g.issue({c})` and land in the `Sim.prototype.issue` switch.
- **Data tables:** NATIONS, UNITS, BUILDINGS, PWPN (per-unit weapons for Direct; index = weapon slot), BATTLES (`arc:'air'|'ground'` arcade modes), TIERS, RANKS, XP, Stats (localStorage `kw-xp` and `kw-stats`), BIND_DEFAULTS and BIND_LABELS.
- **Arcade:** `arcSetup`, `arcStep`, `arcSpawn(o, k, rwy)`, `arcTankGoal` (tank bots use a lane plus a push/flank/over role), `scenSpawn(pi, k, tier, rwy)`. `S.field[o]` is the arcade airfield.
- **Planes (Direct):**
  - `movePlane` holds the flight model.
  - `groundRoll` handles takeoff and ground roll; touchdown is detected in movePlane; `nearField`.
  - `this.landing` is the landing mode; `this.vLock`/`leadAim` is the WT camera target lock (L or right click).
  - `drawAirMarks` draws range markers, off-screen arrows and the lead circle.
  - The missile seeker uses `SEEKER` with `Sfx.lockTone`; `bsight` is the bombsight (Q for bombers).
- **Weapon keys:** E fires W[1], R fires W[2], Y fires W[3] (`w4`); K or middle click spots.
- **Spies:** questions in SPY_GUARDS (exactly 2 per nation) plus the shared card (leader, password, war cry).
  - Questioning cutscene: `startCut`.
  - Heists: `spyTarget`, `startHeist`, `heistStep` on the client; `Sim.spySteal` on the server.
  - `p.spyMap` holds the buildings a spy has mapped.
- **Damage reports:** `hurt()` logs `hitLog`, which flushes as a `dmgrep` event.
- **RTS UI:**
  - `groups`/`groupBar`/`selGroup`, `formation` (right-drag).
  - Clickable bad alerts; Space jumps to the last alert.
- **Sound:**
  - `Sfx.init` runs on the first input.
  - `Sfx.engine(kind, k)` and `Sfx.lockTone(st, k)` fade out if not called every 300 ms.
  - Menus are silent (`Sfx.ui` is a no-op), and the demo battle is muted (`Sfx.mute`).
- **Touch:** `Direct.isTouch` is decided by the last real input (`window.__ptr`); touchscreen laptops get mouse lock.
- **Xaviers:** neutral healers, only in Play vs bots when the "optXav" checkbox is on (off by default).

## Recently done (Nov 2026)
- Rename to jjfanwars, school mentions removed. Old `KICWARS-` invite codes are still accepted, new ones are `JJFANWARS-`.
- Tank bots spread out; you can climb mountains on foot; low-flight and camera fixes; kill feed; you pick your vehicle at the start of arcade battles; A-10 pick fix.
- Hit reports for buildings and drones; spy heists and the spy map.
- Fog fix: a building shows when any part of it is in sight.
- Takeoff and landing; WT missile seeker; engine sounds; ranks and profile; control groups bar; formations; spotting; bombsight; A-10 rocket pods; salvo fix.
- WT arcade range markers and camera target lock.

## Backlog / ideas
- **Next up:** proper multiplayer (the user wants this next).
- **Ideas the user picked:**
  - Naval battles mode with aircraft carriers, more boats and subs that dive.
  - Kill cam.
  - Camos as rank unlocks.
- **Older backlog:**
  - Vehicle guns hit where aimed.
  - Digging system polish.
  - Research trees.
  - Difficulty setting.
  - Visual overhaul (rocks, mountains, trees, UI).
- **Open GitHub issues:**
  - #1: rename. Done, can be closed.
  - #2: fog with sent troops. Fixed by the building-footprint visibility change, but never reproduced exactly; ask the user if it still happens.
