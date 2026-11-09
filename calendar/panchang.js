/* Panchang engine: real sun/moon positions, no tables of dates.
 * Sun: Meeus ch.25 (~0.01 deg). Moon: Meeus ch.47, 59 longitude terms (~0.01 deg, about 1 min on a tithi edge).
 * Sidereal = tropical minus Lahiri ayanamsa. Sunrise/sunset: NOAA method for Chandigarh.
 * ponytail: ignores delta-T (~1 min), kshaya months, Bhadra rule for Holika Dahan, Sankashti (needs moonrise),
 * and purnimanta names inside adhika years. Add a moonrise routine if Sankashti/Karwa Chauth are wanted.
 */
(function (root) {
  const RAD = Math.PI / 180;
  const DAY = 864e5, HR = 36e5;
  const LAT = 30.7333, LON = 76.7794, TZ = 5.5; // Chandigarh, IST
  const norm = x => ((x % 360) + 360) % 360;
  const wrap180 = x => norm(x + 180) - 180;
  const jdOf = ms => ms / DAY + 2440587.5;
  const msOf = jd => (jd - 2440587.5) * DAY;
  const Tof = jd => (jd - 2451545) / 36525;

  function sunLon(jd) {
    const T = Tof(jd);
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
      + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    return norm(L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * RAD));
  }

  // [D, M, M', F, longitude coefficient in 1e-6 deg]
  const MOON = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
    [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
    [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
    [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
    [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
    [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
    [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
    [2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],
    [2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],
    [2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
  ];
  function moonLon(jd) {
    const T = Tof(jd), T2 = T * T;
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2;
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T2;
    const E = 1 - 0.002516 * T - 0.0000074 * T2;
    let s = 0;
    for (const [d, m, mp, f, c] of MOON) {
      const a = (d * D + m * M + mp * Mp + f * F) * RAD;
      s += c * Math.sin(a) * (m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E);
    }
    s += 3958 * Math.sin((119.75 + 131.849 * T) * RAD) + 1962 * Math.sin((Lp - F) * RAD)
      + 318 * Math.sin((53.09 + 479264.29 * T) * RAD);
    return norm(Lp + s / 1e6);
  }

  const ayan = jd => 23.85306 + 1.39604 * Tof(jd); // Lahiri
  const sidSun = jd => norm(sunLon(jd) - ayan(jd));
  const sidMoon = jd => norm(moonLon(jd) - ayan(jd));
  const elong = jd => norm(moonLon(jd) - sunLon(jd));

  function sunPos(jd) {
    const T = Tof(jd);
    const lon = sunLon(jd) * RAD;
    const eps = (23.439291 - 0.0130042 * T) * RAD;
    const L0 = 280.46646 + 36000.76983 * T;
    const ra = norm(Math.atan2(Math.cos(eps) * Math.sin(lon), Math.cos(lon)) / RAD);
    return { dec: Math.asin(Math.sin(eps) * Math.sin(lon)), eqt: 4 * wrap180(L0 - 0.0057183 - ra) };
  }

  const timesCache = new Map();
  function sunTimes(dayMs) { // dayMs = local (IST) midnight in epoch ms
    let c = timesCache.get(dayMs);
    if (c) return c;
    const base = dayMs + TZ * HR; // UTC midnight of the same calendar date
    const at = (jdGuess, sign) => {
      const p = sunPos(jdGuess);
      const cosH = (Math.sin(-0.833 * RAD) - Math.sin(LAT * RAD) * Math.sin(p.dec)) / (Math.cos(LAT * RAD) * Math.cos(p.dec));
      const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD;
      return base + (720 - 4 * LON - p.eqt + sign * 4 * H) * 6e4;
    };
    let sr = at(jdOf(dayMs + 6 * HR), -1), ss = at(jdOf(dayMs + 18 * HR), 1);
    sr = at(jdOf(sr), -1); ss = at(jdOf(ss), 1);
    c = { sr, ss };
    timesCache.set(dayMs, c);
    return c;
  }

  // ---- lunar month (amanta, 0 = Chaitra) ----
  const SYN = 29.530589, MEAN_RATE = 12.19075;
  function newMoonNear(jd) {
    for (let i = 0; i < 6; i++) jd -= wrap180(elong(jd)) / MEAN_RATE;
    return jd;
  }
  function monthAt(ms) {
    const jd = jdOf(ms);
    const ns = newMoonNear(jd - elong(jd) / MEAN_RATE);
    const ne = newMoonNear(ns + SYN);
    const rs = Math.floor(sidSun(ns) / 30), re = Math.floor(sidSun(ne) / 30);
    return { idx: (rs + 1) % 12, adhika: rs === re };
  }
  const tithAt = ms => Math.floor(elong(jdOf(ms)) / 12);

  // ---- time of day each rule is judged at ----
  const WHEN = {
    sunrise: d => sunTimes(d).sr,
    madhyahna: d => (sunTimes(d).sr + sunTimes(d).ss) / 2,
    aparahna: d => sunTimes(d).sr + 0.6 * (sunTimes(d).ss - sunTimes(d).sr),
    pradosh: d => sunTimes(d).ss + 0.8 * HR,
    nishita: d => (sunTimes(d).ss + sunTimes(d + DAY).sr) / 2
  };
  // Instant at which tithi T "belongs" to this day, or null.
  // Direct hit, or T fell entirely between two instants (kshaya) and began today.
  function hit(dayMs, T, when) {
    const a = WHEN[when](dayMs), ta = tithAt(a);
    if (ta === T) return a;
    const b = WHEN[when](dayMs + DAY);
    if (ta === (T + 29) % 30 && tithAt(b) === (T + 1) % 30) return T === 29 ? a : b;
    return null;
  }

  // [name, amanta month, tithi (0 = Shukla 1 ... 14 = Purnima, 29 = Amavasya), judged at]
  const FEST = [
    ['Hindu New Year (Chaitra Navratri)', 0, 0, 'sunrise'], ['Ram Navami', 0, 8, 'madhyahna'],
    ['Hanuman Jayanti', 0, 14, 'sunrise'], ['Akshaya Tritiya', 1, 2, 'madhyahna'],
    ['Guru Purnima', 3, 14, 'sunrise'], ['Raksha Bandhan', 4, 14, 'aparahna'],
    ['Krishna Janmashtami', 4, 22, 'nishita'], ['Ganesh Chaturthi', 5, 3, 'madhyahna'],
    ['Sharad Navratri begins', 6, 0, 'sunrise'], ['Dussehra', 6, 9, 'aparahna'],
    ['Dhanteras', 6, 27, 'pradosh'], ['Diwali', 6, 29, 'pradosh'],
    ['Govardhan Puja', 7, 0, 'sunrise'], ['Bhai Dooj', 7, 1, 'aparahna'],
    ['Kartik Purnima (Guru Nanak Jayanti)', 7, 14, 'sunrise'],
    ['Maha Shivaratri', 10, 28, 'nishita'], ['Holika Dahan', 11, 14, 'pradosh']
  ];
  const EKADASHI = [ // [krishna, shukla] by amanta month
    ['Papmochani', 'Kamada'], ['Varuthini', 'Mohini'], ['Apara', 'Nirjala'], ['Yogini', 'Devshayani'],
    ['Kamika', 'Putrada'], ['Aja', 'Parivartini'], ['Indira', 'Papankusha'], ['Rama', 'Devutthana'],
    ['Utpanna', 'Mokshada'], ['Saphala', 'Pausha Putrada'], ['Shattila', 'Jaya'], ['Vijaya', 'Amalaki']
  ];
  const ADHIKA_EKADASHI = ['Parama', 'Padmini'];
  const YOGA_N = 27, KARANA_FIX = [7, 8, 9]; // Shakuni, Chatushpada, Naga

  function ingressBetween(jd0, jd1) {
    const r0 = Math.floor(sidSun(jd0) / 30), r1 = Math.floor(sidSun(jd1) / 30);
    if (r0 === r1) return null;
    let lo = jd0, hi = jd1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (Math.floor(sidSun(mid) / 30) === r0) lo = mid; else hi = mid;
    }
    return { jd: hi, rashi: r1 };
  }
  // Sankranti belongs to the day of ingress; after sunset it moves to the next day.
  function sankrantiOn(dayMs) {
    for (const w of [dayMs - DAY, dayMs]) {
      const st = sunTimes(w), ing = ingressBetween(jdOf(st.sr), jdOf(sunTimes(w + DAY).sr));
      if (ing && (msOf(ing.jd) < st.ss ? w : w + DAY) === dayMs) return ing.rashi;
    }
    return null;
  }

  const dayCache = new Map();
  function rawEvents(dayMs) { // festivals and vrats judged by tithi
    const ev = [];
    const monthOf = (inst) => monthAt(inst);
    for (const [name, mo, T, when] of FEST) {
      const inst = hit(dayMs, T, when);
      if (inst == null) continue;
      const m = monthOf(inst);
      if (!m.adhika && m.idx === mo) ev.push({ name, kind: 'fest' });
    }
    for (const T of [10, 25]) {
      const inst = hit(dayMs, T, 'sunrise');
      if (inst == null) continue;
      const m = monthOf(inst), k = T === 10 ? 1 : 0;
      // Dark-half names follow the northern (purnimanta) month, light-half names the amanta month.
      const nm = m.adhika ? ADHIKA_EKADASHI[k] : EKADASHI[k === 0 ? (m.idx + 1) % 12 : m.idx][k];
      ev.push({ name: nm + ' Ekadashi', kind: 'vrat' });
    }
    if (hit(dayMs, 14, 'sunrise') != null) ev.push({ name: 'Purnima Vrat', kind: 'vrat' });
    if (hit(dayMs, 29, 'sunrise') != null) ev.push({ name: 'Amavasya', kind: 'vrat' });
    for (const T of [12, 27]) if (hit(dayMs, T, 'pradosh') != null) ev.push({ name: 'Pradosh Vrat', kind: 'vrat' });
    return ev;
  }

  function fmt(ms) {
    const d = new Date(ms + TZ * HR);
    let h = d.getUTCHours(); const mi = String(d.getUTCMinutes()).padStart(2, '0');
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${mi} ${ap}`;
  }

  // y, m (0-11), d: the calendar date in Chandigarh
  function day(y, m, d) {
    const dayMs = Date.UTC(y, m, d) - TZ * HR;
    const hitC = dayCache.get(dayMs);
    if (hitC) return hitC;
    const { sr, ss } = sunTimes(dayMs), jd = jdOf(sr);
    const el = elong(jd), tithi = Math.floor(el / 12);
    const sM = sidMoon(jd), sS = sidSun(jd);
    const kIdx = Math.floor(el / 6);
    const karana = kIdx === 0 ? 10 : kIdx >= 57 ? KARANA_FIX[kIdx - 57] : (kIdx - 1) % 7;
    const mo = monthAt(sr), krishna = tithi >= 15;
    // Northern (purnimanta) naming: the dark half belongs to the next month.
    const month = krishna && !mo.adhika ? (mo.idx + 1) % 12 : mo.idx;
    const events = rawEvents(dayMs);
    if (rawEvents(dayMs - DAY).some(e => e.name === 'Holika Dahan')) events.push({ name: 'Holi', kind: 'fest' });
    const sank = sankrantiOn(dayMs);
    if (sank != null) events.push({ name: 'Sankranti', rashi: sank, kind: 'sank' });
    if (sank === 0) events.push({ name: 'Baisakhi', kind: 'fest' });
    if (sankrantiOn(dayMs + DAY) === 9) events.push({ name: 'Lohri', kind: 'fest' });

    const seg = (ss - sr) / 8, k = [8, 2, 7, 5, 6, 4, 3][new Date(dayMs + TZ * HR).getUTCDay()];
    const out = {
      tithi, paksha: krishna ? 1 : 0, tithiNum: tithi % 15 + 1,
      // index into the 16-name list: ... 14 Purnima, 15 Amavasya
      tithiName: tithi % 15 === 14 ? (krishna ? 15 : 14) : tithi % 15,
      nak: Math.floor(sM / (360 / 27)), yoga: Math.floor(norm(sS + sM) / (360 / YOGA_N)), karana,
      month, adhika: mo.adhika, ritu: Math.floor(month / 2),
      sunRashi: Math.floor(sS / 30), moonRashi: Math.floor(sM / 30),
      el, dayMs, srMs: sr, ssMs: ss, rahuMs: [sr + (k - 1) * seg, sr + k * seg], brahmaMs: [sr - 96 * 6e4, sr - 48 * 6e4],
      sunrise: fmt(sr), sunset: fmt(ss),
      rahu: `${fmt(sr + (k - 1) * seg)} - ${fmt(sr + k * seg)}`,
      brahma: `${fmt(sr - 96 * 6e4).slice(0, 5)} - ${fmt(sr - 48 * 6e4)}`,
      events
    };
    dayCache.set(dayMs, out);
    return out;
  }

  // Vikram Samvat changes on Chaitra Shukla Pratipada (day of the Hindu New Year).
  const nyCache = new Map();
  function vikramSamvat(y, m, d) {
    if (!nyCache.has(y)) {
      let found = null;
      for (let dd = 1; dd <= 61 && !found; dd++) {
        const dt = new Date(Date.UTC(y, 2, dd));
        if (day(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()).events.some(e => e.name.startsWith('Hindu New Year'))) found = dt;
      }
      nyCache.set(y, found ? found.getTime() : Date.UTC(y, 3, 1));
    }
    return Date.UTC(y, m, d) >= nyCache.get(y) ? y + 57 : y + 56;
  }

  const api = { day, vikramSamvat, _internal: { elong, sunTimes, newMoonNear, moonLon, sunLon, jdOf, msOf, fmt } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Panchang = api;
})(typeof window !== 'undefined' ? window : globalThis);
