/* CL 9 CORE (1987) simulator.
 * Behaviour follows the CORE Reference Manual (CL 9, 1987): Getting Started,
 * Chapters 1-4, Appendix A (display symbols) and Appendix B (syntax guide).
 * The engine (Core) has no DOM code so core.test.js can run it under Node.
 * Not simulated: Chapter 5 (number of sends, output frequency, slow send),
 * single-step verification, program duplicate, hold-to-repeat, battery. */
'use strict';
(function (root) {

const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'E', 'F'];
const DIRECT = ['a-', 'b-', 'c-'];
const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const TIMER_DAYS = [0, 'MF', 1, 2, 3, 4, 5, 6];   // MF sits between Sunday and Monday (manual p.45)
const MAX_KEYS = 62, MAX_CAPTURES = 6, MAX_DEPTH = 24;
const SEND_GAP = 200;                              // normal sequence send rate, 0.2 s (manual p.65)
const TIMEOUT = 120000;                            // display time-out ("a few minutes")
const RESET_WINDOW = 4000;
const isHex = t => HEX.includes(t);
const isCap = t => t && typeof t === 'object';
const pageOf = loc => loc[0];

/* ---------- time entry (SET, AT): direct-digit and scanning methods ---------- */
class TimeSpec {
  constructor(base, forTimer) {
    const d = new Date(base);
    this.h24 = d.getHours(); this.m = d.getMinutes(); this.dow = d.getDay();
    this.digits = ''; this.rpt = false; this.second = false; this.forTimer = forTimer;
  }
  apply(k) {
    if (/^[0-9]$/.test(k)) return this.digit(k);
    switch (k) {
      case 'a': this.h24 = (this.h24 + 23) % 24; return true;          // hour down
      case 'b': this.h24 = (this.h24 + 1) % 24; return true;           // hour up
      case 'c': this.m = (this.m + 59) % 60; return true;              // minute down (wraps, hour unchanged)
      case 'd': this.m = (this.m + 1) % 60; return true;               // minute up
      case 'E': case 'F': {
        const list = this.forTimer ? TIMER_DAYS : [0, 1, 2, 3, 4, 5, 6];
        const i = list.indexOf(this.dow), n = list.length;
        this.dow = list[(i + (k === 'F' ? 1 : n - 1)) % n]; return true;
      }
      case 'a-': if (this.h24 >= 12) this.h24 -= 12; return true;      // AM
      case 'b-': if (this.h24 < 12) this.h24 += 12; return true;       // PM
      case 'c-': if (!this.forTimer) return false; this.second = !this.second; return true;
      case 'P': if (!this.forTimer) return false; this.rpt = !this.rpt; return true;
    }
    return false;
  }
  digit(k) {
    const d = this.digits + k, n = d.length;
    if (n === 1 && k === '0') return false;
    if (n === 2 && k > '5') return false;
    if (n === 4 && !(d[0] === '1' && d[1] <= '2' && d[2] <= '5')) return false;
    if (n > 4) return false;
    const h = n === 4 ? +d.slice(0, 2) : +d[0];
    const m = n === 1 ? 0 : n === 2 ? +d[1] * 10 : n === 3 ? +d.slice(1) : +d.slice(2);
    const pm = this.h24 >= 12;
    this.h24 = (h % 12) + (pm ? 12 : 0); this.m = m; this.digits = d;
    return true;
  }
  get usedDigits() { return this.digits.length > 0; }
}

function occurrence(from, addDays, s) {
  const d = new Date(from); d.setDate(d.getDate() + addDays); d.setHours(s.h24, s.m, s.s, 0);
  return d.getTime();
}
function firstFire(s, from) {
  const want = s.dow === 'MF' ? [1, 2, 3, 4, 5] : [s.dow];
  let t = null;
  for (let i = 0; i < 8 && t === null; i++) {
    const c = occurrence(from, i, s);
    if (c > from && want.includes(new Date(c).getDay())) t = c;
  }
  if (s.second) t = s.dow === 'MF' ? occurrence(t, 8 - new Date(t).getDay(), s) : occurrence(t, 7, s);
  return t;
}
function nextFire(s, last) {
  if (s.dow === 'MF') {
    if (new Date(last).getDay() < 5) return occurrence(last, 1, s);
    return s.rpt ? occurrence(last, s.second ? 10 : 3, s) : null;
  }
  return s.rpt ? occurrence(last, s.second ? 14 : 7, s) : null;
}

/* ---------- program syntax (Appendix B) ---------- */
// Location forms: P page key | (KEY) key | key | a-/b-/c- [key]
function parseLocation(t, i, page) {
  const a = t[i], b = t[i + 1], c = t[i + 2];
  if (a === 'P' && isHex(b) && isHex(c)) return { loc: `${b}-${c}`, i: i + 3 };
  if (a === 'KEY' && isHex(b)) return { loc: `${page}-${b}`, i: i + 2 };
  if (isHex(a)) return { loc: `${page}-${a}`, i: i + 1 };
  if (DIRECT.includes(a)) return isHex(b) ? { loc: `${a[0]}-${b}`, i: i + 2 } : { loc: a, i: i + 1 };
  return null;
}
function matchingOK(t, i) {        // i points just after an opening DO/SET
  for (let open = 1; i < t.length; i++) {
    if (t[i] === 'DO' || t[i] === 'SET') open++;
    else if (t[i] === 'OK' && --open === 0) return i;
  }
  return -1;
}
function checkSpec(spec, forTimer) {
  const s = new TimeSpec(0, forTimer);
  return spec.every(k => s.apply(k));
}
// Returns a list of items; throws a string on a syntax error.
function parse(t, page) {
  const out = [];
  let i = 0;
  const loc = () => {
    const r = parseLocation(t, i, page);
    if (!r) throw 'location expected';
    i = r.i; return r.loc;
  };
  const expect = k => { if (t[i] !== k) throw `${k} expected`; i++; };
  while (i < t.length) {
    const k = t[i];
    if (isCap(k)) { out.push({ t: 'send', c: k }); i++; continue; }
    // Redefining a location inside a program: [P page] (KEY key | a-/b-/c-) DO ... OK
    let p = page, j = i;
    if (k === 'P' && isHex(t[i + 1]) && t[i + 2] === 'KEY') { p = t[i + 1]; j = i + 2; }
    if ((t[j] === 'KEY' && isHex(t[j + 1]) && t[j + 2] === 'DO') || (DIRECT.includes(t[j]) && t[j + 1] === 'DO')) {
      const target = t[j] === 'KEY' ? `${p}-${t[j + 1]}` : t[j];
      const start = t[j] === 'KEY' ? j + 3 : j + 2, end = matchingOK(t, start);
      if (end < 0) throw 'OK expected';
      const body = t.slice(start, end);
      parse(body, pageOf(target));
      out.push({ t: 'def', loc: target, body });
      i = end + 1; continue;
    }
    switch (k) {
      case '→': {                                   // repeat loop: → n location ←
        i++; let n = '';
        while (/^[0-9]$/.test(t[i])) n += t[i++];
        if (!n || n.length > 2 || +n < 1) throw 'repeat count 1-99 expected';
        if (t[i] !== 'P') throw 'P expected';       // Location (1) only: P page key
        const l = loc(); expect('←');
        out.push({ t: 'loop', n: +n, loc: l }); break;
      }
      case 'AT': {
        const end = t.indexOf('DO', i + 1);
        if (end < 0) throw 'DO expected';
        const spec = t.slice(i + 1, end);
        if (!checkSpec(spec, true)) throw 'bad time';
        i = end + 1; const l = loc(); expect('OK');
        out.push({ t: 'at', spec, loc: l }); break;
      }
      case 'WAIT': {
        i++; let long = false, d = '';
        if (t[i] === 'a' || t[i] === 'b') { long = true; i++; }
        while (/^[0-9]$/.test(t[i]) && d.length < 3) {
          if (d.length === 1 && t[i] > '5') throw 'bad interval';
          d += t[i++];
        }
        expect('DO'); const l = loc(); expect('OK');
        out.push({ t: 'wait', ms: intervalMs(d, long), loc: l }); break;
      }
      case 'SET': {
        const end = t.indexOf('OK', i + 1);
        if (end < 0) throw 'OK expected';
        const spec = t.slice(i + 1, end);
        if (!checkSpec(spec, false)) throw 'bad time';
        out.push({ t: 'set', spec }); i = end + 1; break;
      }
      default:
        out.push({ t: 'call', loc: loc() });
    }
  }
  return out;
}
function intervalMs(d, long) {
  const x = (d + '000').slice(0, 3);
  return long ? (+x[0] * 3600 + +x.slice(1) * 60) * 1000 : (+x[0] * 60 + +x.slice(1)) * 1000;
}

/* ---------- display cells (Appendix A) ---------- */
const SYM = { DO: 'L', OK: 'J', P: 'P', KEY: 'o', AT: 'A', WAIT: '+', SET: '≡', '→': '┌', '←': '┐', 'a-': 'a\u0304', 'b-': 'b\u0304', 'c-': 'c\u0304' };
function tokenCells(t) {
  const out = [];
  let ctx = null, afterP = false;
  for (const k of t) {
    if (isCap(k)) { out.push(k.once ? 'Ɔ' : 'C'); continue; }
    if (ctx === 'time' && k !== 'DO' && k !== 'OK') {
      out.push({ a: 'h', b: 'h', c: 'm', d: 'm', E: 'd', F: 'd', 'a-': 'u', 'b-': 'n', 'c-': '2', P: 'R' }[k] || k); continue;
    }
    if (ctx === 'wait' && k !== 'DO') { out.push(k === 'a' || k === 'b' ? 'h' : k); continue; }
    if (k === 'AT' || k === 'SET') ctx = 'time';
    else if (k === 'WAIT') ctx = 'wait';
    else if (k === 'DO' || k === 'OK') ctx = null;
    if (afterP && isHex(k)) { out.push(k, '-'); afterP = false; continue; }
    afterP = k === 'P';
    out.push(SYM[k] || k);
  }
  return out;
}
const locCells = loc => DIRECT.includes(loc) ? [loc[0], '-'] : [loc[0], '-', loc[2]];
function timeCells(h24, m) {
  const h = String(h24 % 12 || 12).padStart(2, ' ');
  return [h[0], h[1], String(m).padStart(2, '0')[0], String(m).padStart(2, '0')[1]];
}
function windowCells(cells, cursor, n = 8) {
  if (cells.length <= n) return { cells, left: false, right: false, start: 0 };
  let start = cells.length - n;
  if (cursor !== null) start = Math.max(0, Math.min(cursor - n + 1, cells.length - n));
  return { cells: cells.slice(start, start + n), left: start > 0, right: start + n < cells.length, start };
}

/* ---------- the remote ---------- */
class Core {
  constructor({ now = () => Date.now(), store = null, presets = {}, on = {} } = {}) {
    this.now = now; this.store = store; this.presets = presets; this.on = on;
    const saved = store && store.load();
    this.mem = (saved && saved.mem) || this.factoryMemory();
    this.queue = (saved && saved.queue) || [];
    this.offset = (saved && saved.offset) || 0;
    this.page = '0'; this.loc = '0-0'; this.sel = null;
    this.enable = false; this.mode = 'idle'; this.m = {};
    this.jobs = []; this.bell = false; this.off = false;
    this.last = now(); this.sendUntil = 0; this.lampUntil = 0; this.resetUntil = 0; this.okUntil = 0;
  }
  factoryMemory() {
    const mem = {};
    for (const [loc, name] of Object.entries(this.presets)) mem[loc] = [{ ir: name, once: false }];
    return mem;
  }
  vnow() { return this.now() + this.offset; }
  save() { if (this.store) this.store.save({ mem: this.mem, queue: this.queue, offset: this.offset }); this.emit('change'); }
  emit(ev, ...a) { if (this.on[ev]) this.on[ev](...a); }
  tone(kind, n = 1) { this.emit('tone', kind, n); }
  reject(n = 1) { this.tone('reject', n); return false; }

  /* ----- keys ----- */
  press(k) {
    const now = this.now();
    this.last = now;
    if (this.off) { this.off = false; }
    this.bell = false;
    if (now < this.resetUntil) {
      this.resetUntil = 0;
      if (k === 'a-') { this.queue = []; this.save(); this.tone('alert'); return; }
      if (k === 'c') { this.queue = []; this.mem = {}; this.save(); this.tone('alert'); return; }
    }
    const fn = { idle: this.kIdle, set: this.kSet, at: this.kTimer, wait: this.kTimer, prog: this.kProg,
      editSel: this.kEditSel, edit: this.kEdit, queue: this.kQueue }[this.mode];
    fn.call(this, k);
    this.emit('render');
  }
  toIdle() { this.mode = 'idle'; this.m = {}; this.sel = null; }

  kIdle(k) {
    if (k === 'P') { this.sel = this.sel === 'page' ? null : 'page'; return; }
    if (isHex(k)) {
      if (this.sel === 'page') { this.page = k; this.sel = 'pagekey'; return; }
      const run = this.sel !== 'key';
      this.loc = `${this.page}-${k}`; this.sel = null;
      if (run) this.operate(this.loc);
      return;
    }
    if (DIRECT.includes(k)) {
      const run = this.sel !== 'key';
      this.page = k[0]; this.loc = k; this.sel = null;
      if (run && this.mem[k]) this.operate(k);
      return;
    }
    switch (k) {
      case 'KEY': this.sel = 'key'; return;
      case 'ENABLE': this.enable = !this.enable; return;
      case 'CANCEL': this.jobs = []; this.sel = null; return;
      case 'SET': this.mode = 'set'; this.m = { spec: new TimeSpec(this.vnow(), false) }; return;
      case 'AT': case 'WAIT':
        if (!this.enable) return this.reject();
        this.mode = k === 'AT' ? 'at' : 'wait';
        this.m = { spec: new TimeSpec(this.vnow(), true), long: false, d: '', phase: 'time', loc: [] };
        return;
      case 'EDIT': this.mode = 'editSel'; this.m = { sel: null }; return;
      case 'DO':
        if (!this.enable || this.sel === 'page' || this.sel === 'pagekey') return this.reject();
        this.mode = 'prog'; this.m = { target: this.loc, buf: [] }; this.sel = null; return;
    }
    this.reject();
  }

  kSet(k) {
    const s = this.m.spec;
    if (k === 'OK') { this.applySet(s); this.toIdle(); return; }
    if (k === 'CANCEL') { this.toIdle(); return; }
    if (!s.apply(k)) this.reject();
  }
  applySet(s) {
    const v = this.vnow(), d = new Date(v);
    d.setDate(d.getDate() + (s.dow - d.getDay()));
    d.setHours(s.h24, s.m, s.usedDigits ? 0 : new Date(v).getSeconds(), new Date(v).getMilliseconds());
    this.offset += d.getTime() - v;
    this.save();
  }

  kTimer(k) {
    const m = this.m;
    if (k === 'CANCEL') { this.toIdle(); return; }
    if (m.phase === 'time') {
      if (k === 'DO') { m.phase = 'loc'; return; }
      if (this.mode === 'at') { if (!m.spec.apply(k)) this.reject(); return; }
      if ((k === 'a' || k === 'b') && !m.d && !m.long) { m.long = true; return; }
      if (/^[0-9]$/.test(k) && m.d.length < 3 && !(m.d.length === 1 && k > '5')) { m.d += k; return; }
      return this.reject();
    }
    if (k === 'OK') {
      const r = parseLocation(m.loc, 0, this.page);
      if (!r || r.i !== m.loc.length) return this.reject();
      const v = this.vnow();
      if (this.mode === 'at') {
        const spec = { h24: m.spec.h24, m: m.spec.m, s: m.spec.usedDigits ? 0 : new Date(v).getSeconds(),
          dow: m.spec.dow, rpt: m.spec.rpt, second: m.spec.second };
        this.addEvent(firstFire(spec, v), r.loc, spec);
      } else this.addEvent(v + intervalMs(m.d, m.long), r.loc, null);
      this.loc = r.loc; this.page = pageOf(r.loc);
      this.tone('alert'); this.toIdle(); return;
    }
    if (k === 'P' || k === 'KEY' || isHex(k) || DIRECT.includes(k)) { m.loc.push(k); return; }
    this.reject();
  }
  addEvent(fire, loc, spec) {
    if (fire === null) return;
    this.queue.push({ fire, loc, spec });
    this.queue.sort((a, b) => a.fire - b.fire);
    this.save();
  }

  kProg(k) {
    const m = this.m, buf = m.buf;
    if (k === 'CANCEL') { this.toIdle(); return; }
    if (k === 'ENABLE' || k === 'EDIT') return this.reject();
    if (k === 'DELETE') { if (!buf.length) return this.reject(); buf.pop(); return; }
    if (k === 'OK') {
      const open = buf.filter(t => t === 'DO' || t === 'SET').length - buf.filter(t => t === 'OK').length;
      if (open <= 0) return this.finishProgram(m.target, buf);
    }
    if (buf.length >= MAX_KEYS) return this.reject(2);
    buf.push(k);
  }
  finishProgram(target, buf) {
    try { parse(buf, pageOf(target)); } catch (e) { return this.reject(); }   // built-in syntax check
    if (buf.length) this.mem[target] = buf.slice(); else delete this.mem[target];
    this.loc = target; this.page = pageOf(target);
    this.save(); this.tone('alert'); this.okUntil = this.now() + 600;
    this.toIdle();
  }
  capture(code, once) {
    if (this.off) this.off = false;
    this.last = this.now();
    if (this.mode !== 'prog') return false;
    const buf = this.m.buf;
    if (buf.filter(isCap).length >= MAX_CAPTURES || buf.length >= MAX_KEYS) { this.reject(2); return false; }
    buf.push({ ir: String(code), once: !!once });
    this.tone('alert'); this.emit('render');
    return true;
  }

  kEditSel(k) {
    const m = this.m;
    if (k === 'CANCEL') { this.toIdle(); return; }
    if (k === 'AT') {
      if (!this.queue.length) { this.reject(); this.toIdle(); return; }
      this.mode = 'queue'; this.m = { i: 0 }; return;
    }
    if (m.sel === 'page') { if (!isHex(k)) return this.reject(); this.page = k; m.sel = 'pagekey'; return; }
    if (k === 'P') { m.sel = 'page'; return; }
    if (k === 'KEY') return;
    let target = null;
    if (isHex(k)) target = `${this.page}-${k}`;
    else if (DIRECT.includes(k)) target = k;
    if (!target) return this.reject();
    this.loc = target;
    const buf = (this.mem[target] || []).slice();
    this.mode = 'edit'; this.m = { target, buf, cur: buf.length };
  }
  kEdit(k) {
    const m = this.m;
    if (k === '←') { m.cur = Math.max(0, m.cur - 1); return; }
    if (k === '→') { m.cur = Math.min(m.buf.length, m.cur + 1); return; }
    if (k === 'CANCEL') { this.toIdle(); return; }
    if (k === 'EDIT') {
      if (!this.enable) { this.toIdle(); return; }
      return this.finishProgram(m.target, m.buf);
    }
    if (!this.enable) return this.reject();
    if (k === 'DELETE') { if (!m.cur) return this.reject(); m.buf.splice(--m.cur, 1); return; }
    if (k === 'ENABLE') return this.reject();
    if (m.buf.length >= MAX_KEYS) return this.reject(2);
    m.buf.splice(m.cur++, 0, k);
  }
  kQueue(k) {
    const m = this.m;
    if (k === 'OK' || k === 'CANCEL') { this.toIdle(); return; }
    if (k === '→') { m.i = Math.min(this.queue.length - 1, m.i + 1); return; }
    if (k === '←') { m.i = Math.max(0, m.i - 1); return; }
    if (k === 'DELETE' && this.enable) {
      this.queue.splice(m.i, 1); this.save();
      if (!this.queue.length) { this.reject(); this.toIdle(); return; }
      m.i = Math.min(m.i, this.queue.length - 1); return;
    }
    this.reject();
  }

  /* ----- running programs ----- */
  operate(loc) {
    this.loc = loc; this.page = pageOf(loc);
    if (!this.mem[loc]) return;
    this.start(loc);
  }
  start(loc) {
    this.jobs.push({ gen: this.runLoc(loc, 0), wake: 0 });
    this.tick();
  }
  *runLoc(loc, depth) {
    if (depth > MAX_DEPTH) throw 'recursion';
    const p = this.mem[loc];
    if (!p || !p.length) return;
    for (const it of parse(p, pageOf(loc))) {
      switch (it.t) {
        case 'send':
          this.sendUntil = this.now() + 300;
          this.emit('send', it.c, loc);
          yield SEND_GAP; break;
        case 'call': yield* this.runLoc(it.loc, depth + 1); break;
        case 'loop': for (let n = 0; n < it.n; n++) yield* this.runLoc(it.loc, depth + 1); break;
        case 'def':
          if (it.body.length) this.mem[it.loc] = it.body.slice(); else delete this.mem[it.loc];
          this.save(); break;
        case 'at': {
          const v = this.vnow(), s = new TimeSpec(v, true);
          it.spec.forEach(k => s.apply(k));
          const spec = { h24: s.h24, m: s.m, s: s.usedDigits ? 0 : new Date(v).getSeconds(), dow: s.dow, rpt: s.rpt, second: s.second };
          this.addEvent(firstFire(spec, v), it.loc, spec); break;
        }
        case 'wait': yield it.ms; yield* this.runLoc(it.loc, depth + 1); break;
        case 'set': {
          const s = new TimeSpec(this.vnow(), false);
          it.spec.forEach(k => s.apply(k));
          this.applySet(s); break;
        }
      }
    }
  }
  tick() {
    const now = this.now();
    for (const job of this.jobs.slice()) {
      while (job.wake <= this.now() && this.jobs.includes(job)) {
        let r;
        try { r = job.gen.next(); } catch (e) { this.jobs = []; this.reject(2); break; }
        if (r.done) { this.jobs.splice(this.jobs.indexOf(job), 1); break; }
        if (r.value > 0) { job.wake = this.now() + r.value; break; }
      }
    }
    const v = this.vnow();
    for (const ev of this.queue.slice()) {
      if (ev.fire > v) break;
      if (this.mode === 'queue') { if (!ev.warned) { ev.warned = true; this.tone('alert', 2); } continue; }
      this.queue.splice(this.queue.indexOf(ev), 1);
      const next = ev.spec ? nextFire(ev.spec, ev.fire) : null;
      if (next !== null) this.queue.push({ fire: next, loc: ev.loc, spec: ev.spec });
      this.queue.sort((a, b) => a.fire - b.fire);
      this.tone('alert', 3); this.bell = true;
      this.emit('alarm', ev.loc);
      if (this.mem[ev.loc]) this.start(ev.loc);
      this.save();
    }
    if (!this.off && this.mode === 'idle' && !this.jobs.length && now - this.last > TIMEOUT) this.off = true;
  }
  reset() {
    this.jobs = []; this.toIdle(); this.enable = false; this.off = false;
    this.lampUntil = this.now() + 900; this.resetUntil = this.now() + RESET_WINDOW;
    this.emit('render');
  }
  restoreFactory() { this.mem = this.factoryMemory(); this.save(); }

  /* ----- display model ----- */
  view() {
    const now = this.now(), v = this.vnow(), d = new Date(v);
    const V = { off: this.off, lamp: now < this.lampUntil, time: timeCells(d.getHours(), d.getMinutes()), colon: true,
      ampm: d.getHours() >= 12 ? 'PM' : 'AM', day: DAYS[d.getDay()], at: '', rpt: false, second: false,
      bell: this.bell, edit: false, status: [], cursor: null, left: false, right: false };
    const m = this.m;
    const showLoc = loc => { const c = locCells(loc); V.time = c.length === 2 ? [' ', c[0], c[1], ' '] : [' ', c[0], c[1], c[2]]; V.colon = false; V.ampm = ''; V.day = ''; };
    const showSpec = s => { V.time = timeCells(s.h24, s.m); V.ampm = s.h24 >= 12 ? 'PM' : 'AM'; V.day = s.dow === 'MF' ? 'MF' : DAYS[s.dow]; V.rpt = s.rpt; V.second = s.second; };
    switch (this.mode) {
      case 'idle': {
        let st;
        if (this.sel === 'page') st = ['P'];
        else if (this.sel === 'pagekey') st = [this.page, '-'];
        else if (this.sel === 'key') st = [this.page, '-', 'o'];
        else st = locCells(this.loc);
        const used = st.length;
        st = st.concat(Array(8 - used).fill(' '));
        if (now < this.okUntil) st[used + 1] = 'J';
        if (now < this.sendUntil) { st[7] = 'C'; if (this.enable) { st[5] = 'E'; st[6] = 'n'; } }
        else if (this.enable) { st[6] = 'E'; st[7] = 'n'; }
        V.status = st; break;
      }
      case 'set': showSpec(m.spec); V.status = ['≡']; break;
      case 'at': case 'wait': {
        if (this.mode === 'at') { showSpec(m.spec); V.at = 'on'; }
        else {
          const x = (m.d + '000').slice(0, 3);
          V.time = [' ', x[0], x[1], x[2]]; V.ampm = ''; V.day = '';
          for (let i = m.d.length; i < 3; i++) V.time[i + 1] = '0';
        }
        const head = this.mode === 'at' ? ['A'] : (m.long ? ['+', 'h'] : ['+']);
        V.status = m.phase === 'time' ? head.concat('-') : head.concat('L', tokenCells(m.loc), '-');
        break;
      }
      case 'prog': {
        showLoc(m.target);
        const w = windowCells(['L', ...tokenCells(m.buf), '-'], null);
        V.status = w.cells; V.left = w.left; V.right = w.right; break;
      }
      case 'editSel':
        V.edit = true;
        V.status = m.sel === 'page' ? ['P'] : m.sel === 'pagekey' ? [this.page, '-'] : ['r'];
        break;
      case 'edit': {
        showLoc(m.target); V.edit = true;
        const full = tokenCells(m.buf), ci = tokenCells(m.buf.slice(0, m.cur)).length;
        const w = windowCells([...full.slice(0, ci), '-', ...full.slice(ci)], ci);
        V.status = w.cells; V.left = w.left; V.right = w.right; V.cursor = ci - w.start;
        break;
      }
      case 'queue': {
        const ev = this.queue[m.i];
        const f = new Date(ev.fire);
        V.time = timeCells(f.getHours(), f.getMinutes()); V.ampm = f.getHours() >= 12 ? 'PM' : 'AM';
        V.day = ev.spec && ev.spec.dow === 'MF' ? 'MF' : DAYS[f.getDay()];
        V.rpt = !!(ev.spec && ev.spec.rpt); V.second = !!(ev.spec && ev.spec.second);
        V.at = this.enable ? 'flash' : 'on';
        V.status = ['P', ...locCells(ev.loc)]; break;
      }
    }
    V.status = V.status.slice(0, 8);
    while (V.status.length < 8) V.status.push(' ');
    return V;
  }
}

/* readable form of a stored program, for the memory list */
function describe(t) {
  return t.map(k => isCap(k) ? `“${k.ir}”${k.once ? '¹' : ''}` : k === 'KEY' ? '(KEY)' : k).join(' ');
}

const api = { Core, TimeSpec, parse, tokenCells, describe, intervalMs, firstFire, nextFire, HEX, DAYS };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
