// Run: node core.test.js  (walks the manual's own examples through the CORE engine)
const assert = require('assert');
const { Core, parse } = require('./core.js');

let t = new Date(2026, 10, 10, 22, 15, 30).getTime();      // Tue 10 Nov 2026, 10:15:30 PM
const sent = [], tones = [];
const core = new Core({
  now: () => t,
  presets: { 'E-a': 'VCR Power', '8-a': 'TV Power', '9-b': 'VCR Play', '9-1': 'VCR Record', '9-2': 'VCR Stop' },
  on: { send: c => sent.push(c.ir), tone: (k, n) => tones.push(k + n) },
});
const keys = s => s.split(' ').forEach(k => core.press(k));
const run = ms => { const end = t + ms; while (t < end) { t += 100; core.tick(); } };
const clock = () => { const d = new Date(core.vnow()); return `${d.getDay()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`; };
const status = () => core.view().status.join('').trimEnd();

// Operating a factory preset: P 8 shows "8-", then a sends TV Power (p.5).
keys('P'); assert.strictEqual(status(), 'P');
keys('8'); assert.strictEqual(status(), '8-');
keys('a'); run(300); assert.deepStrictEqual(sent, ['TV Power']); assert.strictEqual(core.loc, '8-a');

// Setting the time, direct-digit method: 7 3 2, PM, OK -> 7:32 PM, seconds zeroed (p.3).
keys('SET 7 3 2 b- OK'); assert.strictEqual(clock(), '2 19:32:00');
// Scanning keeps the seconds: hour up from 7:32 -> 8:32.
run(5000); keys('SET b OK'); assert.strictEqual(clock(), '2 20:32:05');
// Four-digit time 11:59, then 1 3 9 0 is not a valid 4th digit.
keys('SET 1 1 5 9 OK'); assert.strictEqual(clock(), '2 23:59:00');
tones.length = 0; keys('SET 1 3 9 0'); assert.deepStrictEqual(tones, ['reject1']); keys('CANCEL');

// Learning: P 0 (KEY) a, ENABLE, DO -> "L-", capture -> "LC-", OK stores it (pp.8-10).
keys('P 0 KEY a'); assert.strictEqual(status(), '0-a');
keys('ENABLE'); assert.strictEqual(status(), '0-a   En');
keys('DO'); assert.strictEqual(status(), 'L-');
assert.ok(core.capture('Power', false)); assert.strictEqual(status(), 'LC-');
keys('OK'); assert.deepStrictEqual(core.mem['0-a'], [{ ir: 'Power', once: false }]);
// DO is refused without Enable.
keys('ENABLE'); tones.length = 0; keys('DO'); assert.deepStrictEqual(tones, ['reject1']);

// Sequence on 0-b: VCR Power, TV Power, VCR Play (pp.12-13).
sent.length = 0;
keys('ENABLE P 0 KEY b DO P E a P 8 a'); assert.strictEqual(status(), 'LPE-aP8-a-'.slice(-8));
keys('P 9 b OK'); keys('ENABLE');
keys('P 0 b'); run(1000); assert.deepStrictEqual(sent, ['VCR Power', 'TV Power', 'VCR Play']);

// Absolute timer 3 minutes from now (pp.15-17): ENABLE AT d d d DO P 0 b OK.
keys('SET 7 3 2 b- OK');                                   // 7:32 PM, so +3 min does not wrap
sent.length = 0;
keys('ENABLE AT d d d DO P 0 b OK'); assert.strictEqual(core.queue.length, 1);
keys('EDIT AT'); assert.strictEqual(status(), 'P0-b'); keys('OK');
run(2 * 60000); assert.deepStrictEqual(sent, []);
run(70000); assert.deepStrictEqual(sent, ['VCR Power', 'TV Power', 'VCR Play']); assert.strictEqual(core.queue.length, 0);

// Relative 15 s interval (p.49): WAIT 0 1 5 DO P 8 a OK.
sent.length = 0; keys('WAIT 0 1 5 DO P 8 a OK');
run(14000); assert.deepStrictEqual(sent, []); run(1500); assert.deepStrictEqual(sent, ['TV Power']);

// Interval inside a program (p.51): record, wait 1 hour, stop.
sent.length = 0; keys('KEY 1 DO P 9 1 WAIT a 1 DO P 9 2 OK OK'); keys('1');
run(1000); assert.deepStrictEqual(sent, ['VCR Record']);
run(3600000); assert.deepStrictEqual(sent, ['VCR Record', 'VCR Stop']);

// Repeat loop: → 3 P 8 a ← sends TV Power three times.
sent.length = 0; keys('KEY 2 DO → 3 P 8 a ← OK'); keys('2'); run(1000);
assert.deepStrictEqual(sent, ['TV Power', 'TV Power', 'TV Power']);

// SET inside a program (p.42): DO SET b OK OK puts the clock forward one hour.
keys('KEY 3 DO SET b OK OK'); const before = core.vnow(); keys('3'); run(200);
assert.ok(Math.abs(core.vnow() - before - 3600000) < 1000);

// Built-in syntax check: AT without a location is refused, editing stays open.
tones.length = 0; keys('KEY 4 DO AT 7 DO OK'); assert.strictEqual(core.mode, 'prog'); keys('CANCEL');

// Recursion gives two reject tones (p.73).
tones.length = 0; keys('KEY 5 DO 5 OK'); keys('5'); run(200); assert.ok(tones.includes('reject2'));

// Editing: EDIT P 0 b, cursor left, DELETE removes the token before the cursor (p.55).
keys('EDIT P 0 b'); assert.strictEqual(core.mode, 'edit');
keys('DELETE EDIT'); assert.strictEqual(core.mode, 'edit');               // "P 9" alone fails the syntax check
keys('b EDIT'); assert.strictEqual(core.mode, 'idle');                   // retyped, saved
keys('EDIT P 0 b ← ← ← DELETE DELETE DELETE EDIT');                       // cursor before "P 9 b", drop "P 8 a"
assert.deepStrictEqual(core.mem['0-b'], ['P', 'E', 'a', 'P', '9', 'b']);

// Direct-page key holds its own program and runs on one press (p.18).
sent.length = 0; keys('a- DO P 8 a OK'); keys('ENABLE'); keys('a-'); run(300);
assert.deepStrictEqual(sent, ['TV Power']); assert.strictEqual(core.page, 'a');

// Event timer options: 7:32 PM TU RPT repeats weekly; MF runs Mon-Fri this week only.
const { firstFire, nextFire } = require('./core.js');
const tue9pm = new Date(2026, 10, 10, 21, 0).getTime();
const mf = { h24: 19, m: 32, s: 0, dow: 'MF', rpt: false, second: false };
let f = firstFire(mf, tue9pm); assert.strictEqual(new Date(f).getDay(), 3);           // Wednesday
f = nextFire(mf, f); assert.strictEqual(new Date(f).getDay(), 4);
f = nextFire(mf, f); assert.strictEqual(new Date(f).getDay(), 5);
assert.strictEqual(nextFire(mf, f), null);
const wed = new Date(2026, 10, 11, 12, 0).getTime(), sat = new Date(2026, 10, 14, 12, 0).getTime();
const mf2 = { ...mf, second: true };
assert.strictEqual(new Date(firstFire(mf2, wed)).getDate(), 16);    // Wed -> next Monday
assert.strictEqual(new Date(firstFire(mf2, sat)).getDate(), 23);    // Sat -> a week from next Monday

// Reset + c clears timers and programs; plain reset keeps them (p.85).
keys('ENABLE AT 7 DO P 8 a OK'); assert.ok(core.queue.length);
core.reset(); assert.ok(Object.keys(core.mem).length && core.queue.length);
core.reset(); keys('a-'); assert.strictEqual(core.queue.length, 0); assert.ok(Object.keys(core.mem).length);
core.reset(); keys('c'); assert.deepStrictEqual(core.mem, {});

assert.throws(() => parse(['→', '3', '8', 'a', '←'], '0'));
console.log('core.test.js: all checks passed');
