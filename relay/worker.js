// jjfanwars relay: one Durable Object per room. Host and guests all connect out over WebSocket (port 443),
// so it works on school networks that block peer-to-peer. The host's game stays authoritative; this only forwards bytes.
// Frames: guest -> relay is the raw payload. relay -> host is [idLen][id][payload]. host -> relay is [idLen][id][payload] (empty id = everyone).
// Text frames are control: relay -> host {c:'join'|'leave', id}; relay -> guest {c:'host', up:true|false}.
const enc = new TextEncoder(), dec = new TextDecoder();

export default {
  async fetch(req, env) {
    const u = new URL(req.url), m = /^\/room\/([A-Za-z]{5})$/.exec(u.pathname);
    if (u.pathname === '/') return new Response('jjfanwars relay ok', {headers: {'access-control-allow-origin': '*'}});
    if (!m) return new Response('not found', {status: 404});
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', {status: 426});
    const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1].toUpperCase()));
    return stub.fetch(req);
  },
};

export class Room {
  constructor(state) { this.state = state; state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); }
  host() { return this.state.getWebSockets('host')[0] || null; }
  async fetch(req) {
    const u = new URL(req.url), role = u.searchParams.get('role'), pair = new WebSocketPair(), [cli, srv] = [pair[0], pair[1]];
    if (role === 'host') {
      for (const old of this.state.getWebSockets('host')) try { old.close(4001, 'replaced'); } catch (e) {} // a reconnecting host replaces its stale socket
      this.state.acceptWebSocket(srv, ['host']);
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
    if (typeof data === 'string') return; // pings are auto-answered; nothing else is expected as text
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
}
