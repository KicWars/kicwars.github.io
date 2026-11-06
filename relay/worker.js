// jjfanwars relay: one Durable Object per room. Host and guests all connect out over WebSocket (port 443),
// so it works on school networks that block peer-to-peer. The host's game stays authoritative; this only forwards bytes.
// Frames: guest -> relay is the raw payload. relay -> host is [idLen][id][payload]. host -> relay is [idLen][id][payload] (empty id = everyone).
// Text frames are control: relay -> host {c:'join'|'leave', id}; relay -> guest {c:'host', up:true|false}.
const enc = new TextEncoder(), dec = new TextDecoder();

export default {
  async fetch(req, env) {
    const u = new URL(req.url), m = /^\/room\/([A-Za-z]{5})$/.exec(u.pathname);
    const CORS = {'access-control-allow-origin': '*'};
    if (u.pathname === '/') return new Response('jjfanwars relay ok', {headers: CORS});
    if (u.pathname === '/rooms' || u.pathname === '/log') { // live room list for the Join screen / history of every room ever made
      const r = await env.DIR.get(env.DIR.idFromName('dir')).fetch('https://d' + u.pathname);
      return new Response(r.body, {headers: {...CORS, 'content-type': 'application/json', 'cache-control': 'no-store'}});
    }
    if (!m) return new Response('not found', {status: 404});
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', {status: 426});
    const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1].toUpperCase()));
    return stub.fetch(req);
  },
};

export class Room {
  constructor(state, env) { this.state = state; this.env = env; state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); }
  host() { return this.state.getWebSockets('host')[0] || null; }
  async fetch(req) {
    this._code = (/\/room\/([A-Za-z]{5})/.exec(req.url) || [])[1]; if (this._code) { this._code = this._code.toUpperCase(); this.state.storage.put('code', this._code); }
    const u = new URL(req.url), role = u.searchParams.get('role'), pair = new WebSocketPair(), [cli, srv] = [pair[0], pair[1]];
    if (role === 'host') {
      for (const old of this.state.getWebSockets('host')) try { old.close(4001, 'replaced'); } catch (e) {} // a reconnecting host replaces its stale socket
      this.state.acceptWebSocket(srv, ['host']);
      this.state.storage.setAlarm(Date.now() + 1500); // tell the room directory shortly (after the host sends its name)
      for (const g of this.state.getWebSockets('guest')) { const id = g.deserializeAttachment(); try { srv.send(JSON.stringify({c: 'join', id})); g.send(JSON.stringify({c: 'host', up: true})); } catch (e) {} }
    } else {
      if (!this.host()) { this.state.acceptWebSocket(srv, ['guest']); srv.close(4404, 'no such room'); return new Response(null, {status: 101, webSocket: cli}); }
      const id = (u.searchParams.get('id') || Math.random().toString(36).slice(2, 9)).replace(/[^A-Za-z0-9]/g, '').slice(0, 12) || 'g';
      if (this.state.getWebSockets('guest').length >= 7) { this.state.acceptWebSocket(srv, ['guest']); srv.close(4429, 'room full'); return new Response(null, {status: 101, webSocket: cli}); }
      for (const g of this.state.getWebSockets('guest')) if (g.deserializeAttachment() === id) try { g.close(4001, 'replaced'); } catch (e) {}
      this.state.acceptWebSocket(srv, ['guest']); srv.serializeAttachment(id);
      try { this.host().send(JSON.stringify({c: 'join', id})); srv.send(JSON.stringify({c: 'host', up: true})); } catch (e) {}
    }
    return new Response(null, {status: 101, webSocket: cli});
  }
  webSocketMessage(ws, data) {
    if (typeof data === 'string') { // host sends {c:'meta', name, open}; pings are auto-answered
      if (!this.state.getTags(ws).includes('host')) return;
      try { const m = JSON.parse(data); if (m.c === 'meta') { this.meta = {name: clean(m.name) || 'Friendly war', open: !!m.open}; this.state.storage.put('meta', this.meta); this.state.storage.setAlarm(Date.now() + 300); } } catch (e) {}
      return;
    }
    const isHost = this.state.getTags(ws).includes('host');
    if (isHost) {
      const b = new Uint8Array(data), n = b[0], id = dec.decode(b.subarray(1, 1 + n)), body = b.subarray(1 + n);
      for (const g of this.state.getWebSockets('guest')) if (!n || g.deserializeAttachment() === id) try { g.send(body); } catch (e) {}
    } else {
      const h = this.host(); if (!h) return;
      const id = enc.encode(ws.deserializeAttachment() || ''), b = new Uint8Array(data), out = new Uint8Array(1 + id.length + b.length);
      out[0] = id.length; out.set(id, 1); out.set(b, 1 + id.length);
      try { h.send(out); } catch (e) {}
    }
  }
  webSocketClose(ws) {
    if (this.state.getTags(ws).includes('host')) {
      if (this.host() && this.host() !== ws) return; // already replaced
      for (const g of this.state.getWebSockets('guest')) try { g.send(JSON.stringify({c: 'host', up: false})); } catch (e) {}
    } else { const h = this.host(), id = ws.deserializeAttachment(); if (h && id) try { h.send(JSON.stringify({c: 'leave', id})); } catch (e) {} }
  }
  webSocketError(ws) { this.webSocketClose(ws); }
  async alarm() { // heartbeat to the directory while a host is connected
    this._code = this._code || await this.state.storage.get('code'); const h = this.host();
    this.meta = this.meta || await this.state.storage.get('meta') || {name: 'Friendly war', open: true};
    const body = JSON.stringify({code: this.code(), name: this.meta.name, open: this.meta.open, n: this.state.getWebSockets('guest').length + 1, gone: !h});
    try { await this.env.DIR.get(this.env.DIR.idFromName('dir')).fetch('https://d/beat', {method: 'POST', body}); } catch (e) {}
    if (h) this.state.storage.setAlarm(Date.now() + 20000);
  }
  code() { return this._code || ''; }
}

const clean = s => String(s || '').replace(/[^A-Za-z0-9 .'!&-]/g, '').trim().slice(0, 28);

// One directory: which rooms are live right now, plus a permanent log of every room that has been made.
export class Dir {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(req) {
    const u = new URL(req.url), now = Date.now();
    let rooms = await this.state.storage.get('rooms') || {};
    for (const k of Object.keys(rooms)) if (now - rooms[k].t > 50000) delete rooms[k];
    if (u.pathname === '/beat') {
      const b = await req.json(), prev = rooms[b.code];
      if (b.gone) delete rooms[b.code];
      else {
        rooms[b.code] = {code: b.code, name: b.name, open: b.open, n: b.n, t: now, since: prev ? prev.since : now};
        if (!prev) await this.log(b, now);
      }
      await this.state.storage.put('rooms', rooms);
      return new Response('ok');
    }
    if (u.pathname === '/log') return new Response(JSON.stringify(await this.state.storage.get('log') || []));
    return new Response(JSON.stringify(Object.values(rooms).map(r => ({code: r.code, name: r.name, open: r.open, n: r.n, age: Math.round((now - r.since) / 1000)}))));
  }
  async log(b, now) {
    const line = {t: new Date(now).toISOString(), code: b.code, name: b.name};
    const log = await this.state.storage.get('log') || []; log.push(line); await this.state.storage.put('log', log.slice(-500));
    const e = this.env; // optional: also record it on GitHub as an issue comment (secret GH_TOKEN, vars GH_REPO "owner/repo", GH_ISSUE number)
    if (e.GH_TOKEN && e.GH_REPO && e.GH_ISSUE) try {
      await fetch('https://api.github.com/repos/' + e.GH_REPO + '/issues/' + e.GH_ISSUE + '/comments', {method: 'POST', headers: {authorization: 'Bearer ' + e.GH_TOKEN, 'user-agent': 'jjfanwars-relay', accept: 'application/vnd.github+json'}, body: JSON.stringify({body: '`' + line.t + '` room **' + line.code + '** "' + line.name + '" created'})});
    } catch (er) {}
  }
}
