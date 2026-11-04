# WARSIM overnight log

## Start here
- **Play:** https://finndoolan-m.github.io/warplayable-game/
- **vs bots:** open the link, press *Play vs Bots*, pick a nation, *Start War*.
- **With a friend (no extra server, works over github.io only):**
  1. You: open the link, press **Play with a Friend: host**, then **1. Make invite code** and **Copy code** (or **Copy link**).
  2. Send it to your friend in any chat. They open the game, press **Join a Friend**, paste it, press **Join** (or they just open your link). They get a **reply code**: they copy it and send it back.
  3. You paste the reply in step 3 and press **Connect**. Their nation appears in your lobby. Press **Start War**.
  - If it says the direct link failed, your networks block peer-to-peer. Try both on the same Wi-Fi or a phone hotspot, or use **GitHub relay** (slower, each player pastes their own GitHub token with only the *gist* scope; the on-screen text explains how).
  - Two tabs on one computer: host in one tab, then in the other tab Join a Friend and type the 5-letter room code shown in the lobby.
- Single-file copy: https://finndoolan-m.github.io/warplayable-game/warsim.html (save it and open from disk).

## Log (newest first, Sydney time)

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
