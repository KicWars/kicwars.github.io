# WARSIM overnight log

## Start here
- **Play:** https://finndoolan-m.github.io/warplayable-game/
- **Fastest start:** open the link, press **Quick Battle: jump in**, pick a unit, and play it. Just move the mouse to aim, **Space** fires, **Alt** frees the cursor, **F** switches to commanding your army. Or press *Play vs Bots* to choose nations and opponents.
- **With a friend (no extra server, works over github.io only):**
  1. You: open the link, press **Play with a Friend: host**, then **1. Make invite code** and **Copy code** (or **Copy link**).
  2. Send it to your friend in any chat. They open the game, press **Join a Friend**, paste it, press **Join** (or they just open your link). They get a **reply code**: they copy it and send it back.
  3. You paste the reply in step 3 and press **Connect**. Their nation appears in your lobby. Press **Start War**.
  - If it says the direct link failed, your networks block peer-to-peer. Try both on the same Wi-Fi or a phone hotspot, or use **GitHub relay** (slower, each player pastes their own GitHub token with only the *gist* scope; the on-screen text explains how).
  - Two tabs on one computer: host in one tab, then in the other tab Join a Friend and type the 5-letter room code shown in the lobby.
- Single-file copy: https://finndoolan-m.github.io/warplayable-game/warsim.html (save it and open from disk).

## Log (newest first, Sydney time)

### 2026-11-05 03:20 AEDT — Big update: fight in first person, real planes, detailed tanks
**What's new**
- **Quick Battle: jump in** on the main menu: starts a 1 v 1 against a bot with a ready-made base on both sides and opens the unit chooser. Pick any soldier, vehicle, plane, drone or ship, choose Capital or Front line, and you spawn in. When you die the chooser comes back; a rifleman respawn is always free every 15 s.
- **First person by default, V for third person** (remembered). Your own blob hands and gun are drawn in front of you, never clipping. Tanks get a gunner sight, jets a cockpit with HUD, FPV drones goggles.
- **No clicking needed:** the mouse locks to the view as soon as you spawn; just move it to aim. **Space fires**, E secondary, Q aim/scope, R reload, X jump, C sprint (and hold breath in a scope), G national special, T cycle missile lock, H help. **Alt frees the cursor** (a panel with Aim again / Chooser / Command / Settings appears), Alt again to aim. If the browser refuses the mouse lock, moving the cursor away from the centre steers instead. Window blur and Alt+Tab clear held keys.
- **Gunplay:** shots go exactly where the crosshair is (also in third person: an orange X shows when a hill blocks your gun). Hits are checked against each body, with a weak spot on top of a blob's head ("BONK" crits). Recoil, spread that grows when moving, aim-down-sights, reloads, hit markers, damage numbers, kill feed, red arrows showing where damage came from, low-health glow, muzzle flash, ejected casings, impacts. Each weapon is different: battle rifle + frag grenades, shotgun + sticky bombs, flamethrower + napalm, rocket launcher, scoped sniper with hold-breath, SMG + heal burst, alpha-wolf bite.
- **Real projectiles** you can watch: tank shells, rockets, grenades that bounce, artillery with an arc preview and range readout (Q switches direct fire), MLRS ripple salvos, homing missiles with lock-on, bombs with an impact marker, torpedoes.
- **Planes fly freely in 3D**: mouse-aim flight (the jet banks and pulls toward where you point), W/S throttle, A/D roll, stall and pull-up warnings, crash if you hit the ground, afterburner. Bot aircraft now climb, dive on strafing runs and follow terrain instead of flying at one height.
- **National specials (G):** Licases Peloton Dash, Dhruvs Smart Scan, Valentinos Rally Flag, Jethroes Alpha Howl (turn into a wolf blob), Toms Flex (half damage), Veil Pocket Bribe.
- **Looks:** new detailed aircraft (F-16, F-15, F-35, Rafale-style fighter, F-14-style interceptor, B-52-style bomber, Apache-style gunship, FPV quad, loitering drone) with shiny canopies, moving stabilators, afterburner flames, contrails and a simple version for distance. New tanks (reactive armour, road wheels, tracks, blob commander in the hatch), IFV, self-propelled howitzer, SAM truck, MLRS, Arleigh Burke-style destroyer, Virginia and Ohio-style subs.
- **New unit: MLRS rocket artillery** (War Factory).
- **Controls and settings** screen (main menu and in-game Menu): sensitivity, invert, aim assist (off by default), auto-fire, start in third person, and every key can be rebound. Graphics now has **Auto**, which lowers quality if your laptop struggles.
- Trackpad and touch in command view: two-finger scroll pans, pinch zooms, two-finger tap or long press gives orders, tap selects.

**Pacing (measured with a simulated player in tools/pacing.js, 12 fights each)**
- Rifle vs 1 bot rifleman at 10 m: first kill about 1.6 s. Vs 3 riflemen at 12 m: all three down in about 6 s; on hard you die in about 7 s if you stand still, about 14 s if you strafe. Easy bots rarely kill you.
- Shotgun at 5 m: 2 kills in about 4 s. Flamethrower vs 3 at 4 m: about 4.5 s, wins every time. Sniper vs 2 at 20 m: about 4 s, out of their range.
- Rocket trooper vs a tank: about 10 s to kill it, and you die in about half the fights. Tank vs tank: about 11 s (was 21 s; cannon damage raised).
- Bots: reaction 0.5 s (hard) to 1.2 s (easy), hit chance 32% / 46% / 60% by difficulty, worse when you move or when you have just shot near them. Hard bots prefer to target you.
- Commander bot-vs-bot (tools/balance.js, every nation pair): first kill about 3 min, first big battle about 4 min, match median about 17 min. A sudden-death rule after 30 minutes means no match stalls. Win rates per nation 40-73%; the spread looks like map luck rather than traits (removing the Valentinos' traits did not change their result), see the later entry for a second seed set.

**Tested here:** two-player over WebRTC in two separate browser profiles (invite, reply, lobby, orders, sync, win/lose), the GitHub relay against a local fake GitHub API, the first-five-minutes flow (Quick Battle, chooser, spawn, mouse-only look, Alt, blur, V, rebinding, death), and driving rifle, sniper, flamer, rocket, scout, tank, IFV, artillery, MLRS, F-16, F-15, gunship, FPV and destroyer with keyboard and mouse. Zero console errors.
**Not testable here:** a real GPU's frame rate, your network, real GitHub tokens, phones.
- Balance re-run on a second set of 60 bot matches: every nation won 40-60%, no match went past 40 minutes, median 18.5 min.
- The GitHub relay now passes a full match test against a local stand-in for GitHub's gist API (join, orders, Victory/Defeat). With real GitHub it should behave the same, but I could not try real tokens.

### 2026-11-05 02:35 AEDT — Two player now needs only GitHub; blob troops
- Removed PeerJS (it needed an outside broker server). Multiplayer now uses a direct WebRTC link set up by copy-pasting an invite code and a reply code (about 560 characters each), or an invite link. No server is involved; the page asks Google's public STUN server for your public address if it can reach it, and works without it on the same network.
- Fallback: a GitHub relay through secret gists. Each player pastes their own token with only the gist scope; it is stored only in their browser (if they tick remember) and only sent to api.github.com. It updates every few seconds, so it suits commanding more than flying. I could not test this one because it needs real tokens.
- Tested: two separate browser profiles on a local server serving the exact published file: invite, reply, join, nation pick, the friend's move orders run on the host, unit counts and positions stay in sync, Victory for the host and Defeat for the friend. Zero console errors. Not testable here: your school/home network, two real computers.
- Every soldier is now a round blob guy (eyes, hands, feet that step, squash and stretch, flinch when hit, pop-and-splat deaths). Toms are short, wide and buff with sunglasses, Dhruvs have big glasses, Licases ride road bikes, Valentinos wear the tricolour sash and a moustache, Jethroes are red/white/blue, Veil are gold with a veil. Alpha wolves are wolf blobs with a bandana. Capital villagers are blobs too.
- Next: first-person direct control with precise gunplay, then planes.

### 2026-11-05 01:52 AEDT — Run started, early build published
- Fetched `v2` and `wip-snapshot` of the source repo: they are identical, so nothing needed merging. Source work is on branch `claude/warsim-overnight`.
- The game from the last session exists and runs: menu with a live bot battle, lobby, command view, direct control, deploy chooser.
- Published that build here as-is so there is something to play straight away. Its online mode still uses an outside server (PeerJS), which your network probably blocks; replacing that is the top job tonight.
- I cannot open github.io from my environment, so I check publishing through GitHub's API instead.
