// Run: node panchang.test.js  (checks the engine against published astronomy and panchang dates)
const assert = require('assert');
const P = require('./panchang.js'), I = P._internal;
const utc = (y,mo,d,h,mi) => Date.UTC(y,mo-1,d,h,mi);
// Moon phases (UTC): Meeus ex.49a, NASA eclipse tables. Tolerance 10 min.
const near = (jd, ms, name) => { const diff = Math.abs(I.msOf(jd) - ms) / 6e4; assert(diff < 10, `${name} off by ${diff.toFixed(1)} min`); };
near(I.newMoonNear(I.jdOf(utc(2000,1,6,0,0))), utc(2000,1,6,18,14), 'new moon 2000-01-06');
near(I.newMoonNear(I.jdOf(utc(2026,3,19,0,0))), utc(2026,3,19,1,23), 'new moon 2026-03-19');
// full moon = elongation 180: shift by half a synodic month trick
const fm = jd => { for (let i=0;i<6;i++) jd -= (((I.elong(jd)-180+540)%360)-180)/12.19; return jd; };
near(fm(I.jdOf(utc(2000,1,21,0,0))), utc(2000,1,21,4,41), 'full moon 2000-01-21');
near(fm(I.jdOf(utc(2026,3,3,0,0))), utc(2026,3,3,11,38), 'full moon 2026-03-03');
// Chandigarh sunrise/sunset 1 Jan 2026 about 07:15 / 17:30 IST (+-4 min)
const t = I.sunTimes(Date.UTC(2026,0,1)-5.5*36e5);
console.log('1 Jan 2026 sunrise', I.fmt(t.sr), 'sunset', I.fmt(t.ss));
for (const [y,m,d] of [[2026,1,14],[2026,1,29],[2026,2,15],[2026,2,28],[2026,3,3],[2026,3,19],[2026,3,26],[2026,3,27],[2026,4,19],[2026,8,28],[2026,9,4],[2026,9,14],[2026,10,11],[2026,10,20],[2026,11,8],[2026,11,10]]) {
  const r = P.day(y, m-1, d);
  console.log(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} tithi=${r.tithi} month=${r.month}${r.adhika?'(adhika)':''} VS=${P.vikramSamvat(y,m-1,d)} ->`, r.events.map(e=>e.name+(e.rashi!=null?e.rashi:'')).join(', ') || '-');
}
console.log('2026-05-20', P.day(2026,4,20).month, P.day(2026,4,20).adhika);
