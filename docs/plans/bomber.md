# Operation Red Star: Soviet atomic bomber co-op

Status: detailed plan, not built. Written 2026-11-06 with Finn.

## Pitch
2 to 7 players are blob crew inside one Soviet atomic bomber. Everyone has a different job at a different station. Fly from a Siberian airfield over the Arctic and Atlantic to New York, survive the fighters and flak, and drop the bomb. 15 to 20 minutes. Teamwork under pressure, with comedy: shouting radio lines, a commissar, a very loud engine room.

The aircraft is one big shared vehicle. The host runs it. Nobody flies alone: the pilot cannot fix engines, the engineer cannot see the map, and the bombardier cannot do anything until the others have got him there.

## Crew and roles
Roles are picked in the lobby (one player per role). Smaller crews merge roles. Empty roles are filled by AI crew who work at about half efficiency, so a solo test works.

| Role | Station | Job |
|---|---|---|
| **Pilot** | Cockpit left seat | Steers: heading, altitude, throttle. Keeps the bomber inside the route corridor and level on the bomb run. |
| **Navigator** | Nav table (map) | Plots each leg. Reads wind and drift, calls headings and ETAs to the pilot. Confirms the target on the final leg. |
| **Engineer** | Engine panel, mid-ship | Keeps four engines alive: fuel crossfeed, temperature, fires, leaks. Walks to compartments to repair. Routes power to arm the bomb. |
| **Radio operator** | Radio desk | Decodes orders, answers the air-defence challenge with the code word of the day, jams enemy radar. First to get warnings. |
| **Tail gunner** | Rear turret | Shoots fighters from behind. |
| **Dorsal gunner** | Top turret | Shoots fighters above and ahead. |
| **Bombardier** | Glass nose | Final bomb run: sight alignment, release. Idle until the last 90 seconds, so he also acts as spotter (calls bandits). |
| **Commissar** (extra seat) | Walks free | Comic role. Can shout "For the motherland!" for a short reload and calm buff to nearby crew, and can reassign a station if someone disconnects. Cannot touch controls. |

Merging for small crews: 2 players = Pilot+Navigator and Engineer+Radio (AI do the gunners and bombardier). 3 = add Gunners. 4 = add Bombardier, and so on up to 7 (host + 6) plus commissar as an 8th seat if the room has space. Exact table in the lobby code.

## The aircraft
A Tu-95-style four-engine bomber. Walkable interior, front to back, connected by a tunnel/catwalk:
1. **Glass nose:** bombardier station, bombsight.
2. **Cockpit:** pilot seat, navigator table across the aisle.
3. **Radio desk** behind the cockpit.
4. **Engine/fuel bay:** panel with 4 engine gauges, fuel valves, fire handles, a wall of pipes. Repair points.
5. **Bomb bay:** the big weapon, visible below the catwalk. Arming panel.
6. **Rear:** tail turret. A top turret with a ladder in the mid-ship.

Reuse the existing Interior builder (`Interior.get`, `roomAt`, `chair`, `worldUp`, the interior camera and the blob walk code). Add a `bomber` interior kind.

## The big technical piece: shared interiors
Today each player's interior is local: you walk in your own scene and nobody else is in it. Crew modes need everyone to see each other at their stations. This also unlocks the submarine.

- **Station claim:** new command `{c:'station', k:'pilot', on:1}`. The host validates (role allowed, not taken) and broadcasts the crew table. A player is either **seated** at a station (controls live) or **walking**.
- **Crew presence:** while walking, each client sends `{c:'icrew', x, z, yaw, st}` at about 10 Hz. The host keeps a crew list `S.crew[playerIndex] = {st, x, z, yaw, anim}` and includes it in the snapshot meta (small: a few bytes per player).
- **Rendering:** the interior scene draws blobs for the other crew at those positions (smoothed), with name tags, using the same drawing as the world blobs. Seated crew play a seated pose.
- **Animation reuse:** fire, aim and throw states already travel as snapshot bits for soldiers. Station actions (turning a wheel, typing) are just a short `anim` id on the crew entry.
- Everything stays host-authoritative: guests send intent, the host decides.

## Flight and the map
- A custom low-detail "Red Star Run" map in the style of the Grand Theatre air map: Siberian coast, Arctic ice, Atlantic, and a New York coast with a stylised skyline. Cheap geometry, long sight lines, fog.
- The bomber is one sim entity flying a **route**: a list of waypoints (legs). The route is a corridor with a width. Staying inside it is "on course".
- **Controls are setpoints, not raw stick.** The pilot sends target heading, altitude and throttle about 10 times a second; the host's flight model turns the heavy aircraft toward them. This hides relay latency: a bomber is slow and a 150 ms delay is invisible.
- **Wind and drift:** a slow wind vector pushes the bomber off the corridor each leg. The navigator sees the drift on the table and calls a correction (a heading offset). If the pilot ignores it, fuel burns and the route time grows.
- **Fuel budget:** total fuel is fixed. Bad flying, hard turns and engine damage all burn more. Run dry and the bomber ditches short of New York.

## Engine room (engineer)
- Four engines, each with temperature, health, fuel feed. Random events: oil leak (a pipe sprays, hold the repair key at the spot), engine fire (pull the correct fire handle, then wait), fuel imbalance (turn crossfeed valves until the gauges even out).
- A damaged engine cuts speed. Two dead engines = the bomber cannot hold altitude. Three = ditch.
- **Arming the bomb** needs power: the engineer routes it with a simple switch puzzle in phase 5, which also slows him down so he cannot fix an engine at the same time.
- Repair walks matter: his panel is mid-ship and leaks happen elsewhere, so he leaves his post and the engine gauges go unwatched.

## Radio (radio operator)
- **Orders:** coded messages arrive at set times (change route, hold, weather warning). The radio operator decodes them on the desk with a code wheel (match symbols), then reads the result aloud to the navigator. A wrong decode means a wrong waypoint.
- **Air-defence challenge (phase 4):** a coastal defence radio asks for the code word. The briefing gives a code word of the day. The radio operator picks the right reply from three within about 8 seconds. Fail and the flak and searchlights are much heavier for the rest of the approach.
- **Jamming:** hold a key on a frequency dial to drag a radar lock off. Costs the operator his decoding for a few seconds.

## Threats by phase
1. **Takeoff (about 2 min):** pilot and engineer sync. Throttle up in steps, the engineer watches temperatures. Fail = abort and restart.
2. **Arctic (about 5 min):** navigation and fuel. Storms, ice on the wings (engineer de-ice), drift. Few enemies. The calm before.
3. **Interception (about 4 min):** two or three fighter waves from the clock positions the radio or bombardier call out ("two at 4 o'clock high"). The gunners shoot, the pilot jinks gently, the engineer repairs hits. Reuse the existing air bots and aim code from the arcade modes.
4. **NYC approach (about 3 min):** coastal radar, the code challenge, flak bursts, searchlights, SAM warnings. The pilot descends to the bomb altitude. Heavy radio and engineer load.
5. **Bomb run (about 90 s):** the bombardier takes the sight. The pilot must keep the bomber level and slow. The navigator confirms the aim point. The engineer arms the bomb. Everyone else steadies the aircraft (gunners keep the last fighters off). Release, then a long fall, tension music, and the result.

## Bomb run in detail
- Bombardier sight: a crosshair drifting over the city map; he nudges it onto the aim point with mouse and keys. Pilot instability (turning, damage, turbulence) adds drift, so the whole crew affects accuracy.
- The sight locks when it is on target and the bomber is level and in range. The navigator "confirms" with a key press. The bomb is armed by the engineer. All three must be true before release.
- Result: **perfect / near / miss** by distance from the aim point, shown with a big stylised flash and mushroom cloud (cartoon, no gore) plus the blob crew cheering or despairing.
- Then the way home is optional: a short epilogue flight, or end the mission on the flash.

## Failure, disconnects, difficulty
- **Hull damage** stacks per compartment. A hit near a crew member can knock them out for a short time (a revive by walking to them).
- **Crew death:** a dead player respawns at the nearest station after 20 s as "wounded" (half speed) so nobody sits out for 10 minutes.
- **Disconnect:** the station goes to AI at half efficiency; the commissar can reassign it.
- **Fail** = ditch (fuel, engines), shot down, or bomb dropped far off. Retry from the start of the current phase once, then full restart.
- **Difficulty:** scales fighter count, flak density, event frequency. Small crews get a handicap; big crews get more events. Three presets in the lobby: Training, Standard, Brutal.

## UI per role (sketch)
- **Pilot:** compass, altitude, throttle, a corridor bar showing left/right drift, a callout strip from the navigator.
- **Navigator:** a table map with the route, current position, drift arrow, ETA to each waypoint, and a "call to pilot" quick-message wheel (heading left/right, altitude).
- **Engineer:** four engine gauges, fuel schematic, fire handles, repair prompts, power switch board.
- **Radio:** decode wheel, code list, frequency dial.
- **Gunners:** the existing turret HUD (reuse), with a call-out compass for bandit positions.
- **Bombardier:** the sight view and a three-light "ready" panel (aim, level, armed).
- **Everyone:** one shared "crew status" strip (engines, fuel, hull, who is where), a voice-free callout system (quick-message wheel, since there is no voice chat).

## Lobby and entry
- A new menu tile under *With friends*: **Operation Red Star**. Host picks difficulty and role slots.
- The lobby lists roles; each player clicks a free role. Unfilled roles get AI. Start allowed with 1 player (AI crew) for solo testing.
- Name tags work in the interior too (usernames).

## Networking summary
- Host sim: the bomber entity, the route, the systems state (engines, fuel, hull), the threat script.
- Guests send: station claims, setpoints (pilot), station actions (engineer valves, radio picks, gunner fire, bombardier nudge), `icrew` positions.
- Host sends: the snapshot as today, plus `crew` (a small table), systems state (engines, fuel, hull, drift), and events (callouts, radio messages, flash).
- Bandwidth is small; the relay is not a bottleneck.

## Build order (each step testable)
1. **Shared interior skeleton:** `bomber` interior kind, station claim, crew presence, other blobs visible with name tags. Test: two tabs, both walk, each sees the other. Also unlocks the submarine.
2. **Flight and route:** the custom map, the bomber entity, the pilot setpoints, the corridor, wind drift. Test: a scripted flight completes with a competent pilot and fails with a bad one.
3. **Systems:** engines, fuel, hull, the engineer panel and repairs.
4. **Navigator and radio:** the map table, the code wheel, the challenge.
5. **Threats:** fighter waves, flak, searchlights; gunner stations reuse the turret code.
6. **Bomb run:** sight, arm, release, result flash.
7. **Lobby, roles, AI crew fill, difficulty, debrief screen, polish** (briefing text, radio lines, music, the commissar).

Estimate: about 8 to 12 focused sessions. Steps 1 and 2 carry most of the risk.

## Risks and how to handle them
- **Shared interior rendering** (largest): build step 1 first and prove it with two tabs before anything else.
- **Pilot latency:** use setpoints and host smoothing, as above.
- **Too many mini-games:** keep each one under 5 seconds and make most optional. If a role is bored, give it a spotter job (the bombardier already has one).
- **Balance with 2 players:** AI crew at half efficiency; playtest early with 2 and 4.
- **Single file size:** `index.html` is already large. Put the mode in a labelled section of the sim and Direct, and a small separate section for the interior, like the other mode sections.
- **Testing without 7 players:** an AI crew mode lets one person run every role; headless tests can drive each station with scripted inputs, as the flight-model tests do.

## Content notes
- **Briefing:** a short comic Soviet briefing screen: the target, the code word of the day, the route, the crew list.
- **Radio lines:** a bank of short orders and fighter callouts ("bandit at 4 o'clock", "engine two burning, comrade").
- **Tone question:** keep the cartoon blob look for crew and city. The flash is stylised, not graphic.

## Open questions
- Cartoon-silly or tense? (Leaning cartoon, with real pressure.)
- Other targets and routes after New York (a second city, a harder run)?
- Does the commissar count as a player seat or an extra?
- A voice chat is out of scope; is the quick-message wheel enough?
