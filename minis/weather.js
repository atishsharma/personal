'use strict';
/* Weather Station. One normalised data model, three providers.
 * Times are epoch seconds; `off` (seconds) is the place's UTC offset, so every clock shows the PLACE's time.
 * ponytail: OpenWeatherMap's free API only gives 5 days in 3-hour steps, so its "daily" is built from those. */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const LS = 'ats_weather_v6', LEG = 'atish_weather_v5', CK = 'ats_weather_cache_v6';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const OM = 'https://api.open-meteo.com/v1', OMA = 'https://air-quality-api.open-meteo.com/v1';
const PROVIDERS = {
  'open-meteo': { name: 'Open-Meteo', key: false },
  weatherapi: { name: 'WeatherAPI.com', key: true, hint: 'Free key at weatherapi.com. The free plan returns 3 forecast days.' },
  openweathermap: { name: 'OpenWeatherMap', key: true, hint: 'Free key at openweathermap.org. New keys can take up to 2 hours to activate. Free plan gives 5 forecast days.' }
};

// ---------- state ----------
function migrate() {
  const o = store.get(LEG); if (!o) return {};
  return { lat: o.lat, lon: o.lon, name: o.locationName, region: o.stateRegion, country: o.country, units: o.units, provider: o.provider, apiKey: o.apiKey, theme: o.theme === 'dark' || o.theme === 'light' ? o.theme : 'auto', pinned: (o.pinnedCities || []).map(c => ({ name: c.name, lat: c.lat, lon: c.lon, region: c.stateRegion || '', country: c.country || '' })), hasLoc: !!(o.lat && o.lon) };
}
const S = Object.assign({ lat: 30.7333, lon: 76.7794, name: 'Chandigarh', region: 'Chandigarh', country: 'India', units: 'metric', provider: 'open-meteo', apiKey: '', theme: 'auto', pinned: [], hasLoc: false }, store.get(LS) || migrate());
if (!PROVIDERS[S.provider]) S.provider = 'open-meteo';
const save = () => store.set(LS, S);
let D = null;               // current normalised data
let loadId = 0;

// ---------- helpers ----------
const imp = () => S.units === 'imperial';
const tu = () => imp() ? '°F' : '°C';
const wu = () => imp() ? 'mph' : 'km/h';
const T = v => v == null || isNaN(v) ? '–' : (Math.round(v) || 0) + '°';
const N = v => v == null || isNaN(v) ? '–' : Math.round(v);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ico = (n, c = '') => `<i data-lucide="${n}" class="${c}" aria-hidden="true"></i>`;
const icons = () => { try { lucide.createIcons(); } catch (e) {} };
const nowSec = () => Date.now() / 1000;
const loc = (t, off) => new Date((t + off) * 1000);                       // read with getUTC*
const fmtTime = (t, off) => { if (t == null) return '–'; const d = loc(t, off); let h = d.getUTCHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(d.getUTCMinutes()).padStart(2, '0')} ${ap}`; };
const fmtHour = (t, off) => { const d = loc(t, off); let h = d.getUTCHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h} ${ap}`; };
const dayKey = (t, off) => loc(t, off).toISOString().slice(0, 10);
const wd = (key, long) => new Date(key + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: long ? 'long' : 'short', timeZone: 'UTC' });
const dateLong = key => new Date(key + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const dur = s => s == null ? '–' : `${Math.floor(s / 3600)}h ${Math.round(s % 3600 / 60)}m`;
const kmh = v => imp() ? v * 1.609344 : v;
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = d => d == null ? '–' : COMPASS[Math.round(d / 22.5) % 16];
const dewPoint = (t, rh) => { if (t == null || !rh) return null; const c = imp() ? (t - 32) * 5 / 9 : t, a = 17.62, b = 243.12, g = Math.log(rh / 100) + a * c / (b + c), dp = b * g / (a - g); return imp() ? dp * 9 / 5 + 32 : dp; };

// ---------- conditions ----------
const WMO = { 0: ['Clear sky', 'clear'], 1: ['Mainly clear', 'clear'], 2: ['Partly cloudy', 'partly'], 3: ['Overcast', 'cloudy'], 45: ['Fog', 'fog'], 48: ['Freezing fog', 'fog'], 51: ['Light drizzle', 'drizzle'], 53: ['Drizzle', 'drizzle'], 55: ['Dense drizzle', 'drizzle'], 56: ['Light freezing drizzle', 'sleet'], 57: ['Freezing drizzle', 'sleet'], 61: ['Light rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy rain', 'heavy'], 66: ['Light freezing rain', 'sleet'], 67: ['Freezing rain', 'sleet'], 71: ['Light snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy snow', 'snow'], 77: ['Snow grains', 'snow'], 80: ['Light rain showers', 'rain'], 81: ['Rain showers', 'rain'], 82: ['Violent rain showers', 'heavy'], 85: ['Light snow showers', 'snow'], 86: ['Heavy snow showers', 'snow'], 95: ['Thunderstorm', 'storm'], 96: ['Thunderstorm with hail', 'storm'], 99: ['Severe thunderstorm with hail', 'storm'] };
const ICON = { clear: ['sun', 'moon'], partly: ['cloud-sun', 'cloud-moon'], cloudy: ['cloud', 'cloud'], fog: ['cloud-fog', 'cloud-fog'], drizzle: ['cloud-drizzle', 'cloud-drizzle'], rain: ['cloud-rain', 'cloud-rain'], heavy: ['cloud-rain-wind', 'cloud-rain-wind'], snow: ['cloud-snow', 'cloud-snow'], sleet: ['cloud-hail', 'cloud-hail'], storm: ['cloud-lightning', 'cloud-lightning'] };
const mk = (kind, text, day) => ({ kind, text, icon: ICON[kind][day ? 0 : 1] });
const wmo = (c, day) => { const [t, k] = WMO[c] || ['Unknown', 'cloudy']; return mk(k, t, day); };
function wapiKind(c) {
  if (c === 1000) return 'clear'; if (c === 1003) return 'partly'; if (c === 1006 || c === 1009) return 'cloudy';
  if ([1030, 1135, 1147].includes(c)) return 'fog'; if ([1150, 1153].includes(c)) return 'drizzle';
  if ([1087, 1273, 1276, 1279, 1282].includes(c)) return 'storm';
  if ([1168, 1171, 1198, 1201, 1069, 1204, 1207, 1249, 1252, 1237, 1261, 1264].includes(c)) return 'sleet';
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(c)) return 'snow';
  if ([1192, 1195, 1246].includes(c)) return 'heavy'; return 'rain';
}
function owmKind(id) {
  if (id >= 200 && id < 300) return 'storm'; if (id < 400) return 'drizzle'; if (id === 511) return 'sleet'; if (id === 502 || id === 503 || id === 504) return 'heavy';
  if (id < 600) return 'rain'; if (id >= 611 && id <= 616) return 'sleet'; if (id < 700) return 'snow'; if (id < 800) return 'fog';
  if (id === 800) return 'clear'; if (id === 801 || id === 802) return 'partly'; return 'cloudy';
}
const skyOf = (kind, day) => (day ? 'day-' : 'night-') + ({ clear: 'clear', partly: 'cloud', cloudy: 'cloud', fog: 'fog', drizzle: 'rain', rain: 'rain', heavy: 'rain', sleet: 'rain', snow: 'snow', storm: 'storm' }[kind]);

// ---------- US AQI from particulates (EPA breakpoints) ----------
const BP = { p25: [[0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 350.4, 301, 400], [350.5, 500.4, 401, 500]], p10: [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 504, 301, 400], [505, 604, 401, 500]] };
function sub(c, t) { if (c == null || isNaN(c)) return null; c = t === 'p25' ? Math.floor(c * 10) / 10 : Math.floor(c); const b = BP[t].find(x => c >= x[0] && c <= x[1]) || BP[t][6]; return Math.round((b[3] - b[2]) / (b[1] - b[0]) * (c - b[0]) + b[2]); }
const usAqi = (p25, p10) => { const a = [sub(p25, 'p25'), sub(p10, 'p10')].filter(x => x != null); return a.length ? Math.max(...a) : null; };

// ---------- providers ----------
async function getJSON(url, errMsg) {
  let r; try { r = await fetch(url); } catch (e) { throw new Error('Network problem. Check your connection and try again.'); }
  if (r.status === 401 || r.status === 403) throw Object.assign(new Error(errMsg || 'The API key was rejected.'), { key: true });
  if (!r.ok) throw new Error(`${errMsg || 'Request failed'} (${r.status})`);
  return r.json();
}

async function loadOpenMeteo() {
  const u = imp() ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' : '';
  const base = `latitude=${S.lat}&longitude=${S.lon}&timezone=auto&timeformat=unixtime`;
  const [w, a] = await Promise.all([
    getJSON(`${OM}/forecast?${base}&forecast_days=7${u}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,uv_index,precipitation&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,is_day,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,cloud_cover_mean,wind_speed_10m_max`, 'Open-Meteo request failed'),
    getJSON(`${OMA}/air-quality?${base}&forecast_days=2&current=us_aqi,pm2_5,pm10&hourly=us_aqi`).catch(() => null)
  ]);
  const off = w.utc_offset_seconds, c = w.current, d = w.daily, h = w.hourly;
  const day = !!c.is_day;
  const todayKey = dayKey(c.time, off);
  let aqiMax = null; if (a && a.hourly) { const v = a.hourly.time.map((t, i) => dayKey(t, off) === todayKey ? a.hourly.us_aqi[i] : null).filter(x => x != null); if (v.length) aqiMax = Math.max(...v); }
  return {
    provider: 'open-meteo', sources: ['Open-Meteo'], off, updated: Date.now(),
    cur: { t: c.time, temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, windDir: c.wind_direction_10m, gust: c.wind_gusts_10m, pressure: c.pressure_msl, cloud: c.cloud_cover, uv: c.uv_index, aqi: a && a.current ? a.current.us_aqi : null, precip: c.precipitation, day, cond: wmo(c.weather_code, day) },
    hourly: h.time.map((t, i) => ({ t, temp: h.temperature_2m[i], pop: h.precipitation_probability[i], wind: h.wind_speed_10m[i], cond: wmo(h.weather_code[i], !!h.is_day[i]) })),
    daily: d.time.map((t, i) => ({ key: dayKey(t, off), hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i], pop: d.precipitation_probability_max[i], cloud: d.cloud_cover_mean[i], uvMax: d.uv_index_max[i], windMax: d.wind_speed_10m_max[i], sunrise: d.sunrise[i], sunset: d.sunset[i], cond: wmo(d.weather_code[i], true) })),
    aqiMax
  };
}

// Fills UV / AQI gaps for providers that do not offer them (free, no key).
async function omExtras(off) {
  try {
    const base = `latitude=${S.lat}&longitude=${S.lon}&timezone=auto&timeformat=unixtime`;
    const [w, a] = await Promise.all([getJSON(`${OM}/forecast?${base}&forecast_days=7&current=uv_index&daily=uv_index_max`), getJSON(`${OMA}/air-quality?${base}&forecast_days=2&current=us_aqi&hourly=us_aqi`).catch(() => null)]);
    const key = dayKey(w.current.time, off); let aqiMax = null;
    if (a && a.hourly) { const v = a.hourly.time.map((t, i) => dayKey(t, off) === key ? a.hourly.us_aqi[i] : null).filter(x => x != null); if (v.length) aqiMax = Math.max(...v); }
    return { uv: w.current.uv_index, uvMax: Object.fromEntries(w.daily.time.map((t, i) => [dayKey(t, off), w.daily.uv_index_max[i]])), aqi: a && a.current ? a.current.us_aqi : null, aqiMax };
  } catch (e) { return null; }
}
async function fillFromOM(data) {
  const x = await omExtras(data.off); if (!x) return data;
  if (data.cur.uv == null) data.cur.uv = x.uv;
  if (data.cur.aqi == null) data.cur.aqi = x.aqi;
  if (data.aqiMax == null) data.aqiMax = x.aqiMax;
  data.daily.forEach(d => { if (d.uvMax == null) d.uvMax = x.uvMax[d.key] ?? null; });
  data.sources.push('Open-Meteo (UV and air quality)'); return data;
}

function astroEpoch(date, str, off) { const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(str || ''); if (!m) return null; let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12; const [y, mo, d] = date.split('-').map(Number); return Date.UTC(y, mo - 1, d, h, +m[2]) / 1000 - off; }
async function loadWeatherAPI() {
  const k = S.apiKey.trim(); if (!k) throw Object.assign(new Error('Add your WeatherAPI key in Settings, or switch to Open-Meteo.'), { key: true });
  const j = await getJSON(`https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(k)}&q=${S.lat},${S.lon}&days=7&aqi=yes&alerts=no`, 'WeatherAPI rejected the key. Check it in Settings.');
  const L = j.location, off = Math.round((Date.parse(L.localtime.replace(' ', 'T') + 'Z') / 1000 - L.localtime_epoch) / 900) * 900, c = j.current, I = imp(), day = !!c.is_day;
  const sel = (cc, ff) => I ? ff : cc;
  const hourly = []; j.forecast.forecastday.forEach(fd => fd.hour.forEach(h => hourly.push({ t: h.time_epoch, temp: sel(h.temp_c, h.temp_f), pop: h.chance_of_rain, wind: sel(h.wind_kph, h.wind_mph), cloud: h.cloud, cond: mk(wapiKind(h.condition.code), h.condition.text, !!h.is_day) })));
  return {
    provider: 'weatherapi', sources: ['WeatherAPI.com'], off, updated: Date.now(),
    cur: { t: c.last_updated_epoch, temp: sel(c.temp_c, c.temp_f), feels: sel(c.feelslike_c, c.feelslike_f), hum: c.humidity, wind: sel(c.wind_kph, c.wind_mph), windDir: c.wind_degree, gust: sel(c.gust_kph, c.gust_mph), pressure: c.pressure_mb, cloud: c.cloud, uv: c.uv, aqi: c.air_quality ? usAqi(c.air_quality.pm2_5, c.air_quality.pm10) : null, precip: sel(c.precip_mm, c.precip_in), day, cond: mk(wapiKind(c.condition.code), c.condition.text, day) },
    hourly,
    daily: j.forecast.forecastday.map(fd => { const hs = fd.hour; return { key: fd.date, hi: sel(fd.day.maxtemp_c, fd.day.maxtemp_f), lo: sel(fd.day.mintemp_c, fd.day.mintemp_f), pop: fd.day.daily_chance_of_rain, cloud: hs.reduce((a, h) => a + h.cloud, 0) / hs.length, uvMax: fd.day.uv, windMax: sel(fd.day.maxwind_kph, fd.day.maxwind_mph), sunrise: astroEpoch(fd.date, fd.astro.sunrise, off), sunset: astroEpoch(fd.date, fd.astro.sunset, off), cond: mk(wapiKind(fd.day.condition.code), fd.day.condition.text, true) }; }),
    aqiMax: null
  };
}

async function loadOWM() {
  const k = S.apiKey.trim(); if (!k) throw Object.assign(new Error('Add your OpenWeatherMap key in Settings, or switch to Open-Meteo.'), { key: true });
  const q = `lat=${S.lat}&lon=${S.lon}&units=${imp() ? 'imperial' : 'metric'}&appid=${encodeURIComponent(k)}`;
  const msg = 'OpenWeatherMap rejected the key. New keys can take up to 2 hours to activate.';
  const [c, f, a] = await Promise.all([getJSON(`https://api.openweathermap.org/data/2.5/weather?${q}`, msg), getJSON(`https://api.openweathermap.org/data/2.5/forecast?${q}`, msg), getJSON(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${S.lat}&lon=${S.lon}&appid=${encodeURIComponent(k)}`).catch(() => null)]);
  const off = c.timezone, ws = v => v == null ? null : imp() ? v : v * 3.6, day = c.dt >= c.sys.sunrise && c.dt < c.sys.sunset;
  const hourly = f.list.map(i => ({ t: i.dt, temp: i.main.temp, pop: Math.round((i.pop || 0) * 100), wind: ws(i.wind.speed), cloud: i.clouds.all, hi: i.main.temp_max, lo: i.main.temp_min, cond: mk(owmKind(i.weather[0].id), cap(i.weather[0].description), i.sys.pod === 'd') }));
  const by = {}; hourly.forEach(h => (by[dayKey(h.t, off)] ||= []).push(h));
  const todayKey = dayKey(c.dt, off);
  const daily = Object.keys(by).sort().map(key => { const hs = by[key], mid = hs.reduce((b, h) => Math.abs((h.t + off) % 86400 - 43200) < Math.abs((b.t + off) % 86400 - 43200) ? h : b, hs[0]); let hi = Math.max(...hs.map(h => h.hi)), lo = Math.min(...hs.map(h => h.lo)); if (key === todayKey) { hi = Math.max(hi, c.main.temp); lo = Math.min(lo, c.main.temp); } return { key, hi, lo, pop: Math.max(...hs.map(h => h.pop)), cloud: hs.reduce((s, h) => s + h.cloud, 0) / hs.length, uvMax: null, windMax: Math.max(...hs.map(h => h.wind)), sunrise: key === todayKey ? c.sys.sunrise : null, sunset: key === todayKey ? c.sys.sunset : null, cond: { ...mid.cond, icon: ICON[mid.cond.kind][0] } }; });
  const comp = a && a.list && a.list[0] ? a.list[0].components : null;
  return {
    provider: 'openweathermap', sources: ['OpenWeatherMap'], off, updated: Date.now(),
    cur: { t: c.dt, temp: c.main.temp, feels: c.main.feels_like, hum: c.main.humidity, wind: ws(c.wind.speed), windDir: c.wind.deg, gust: ws(c.wind.gust), pressure: c.main.pressure, cloud: c.clouds.all, uv: null, aqi: comp ? usAqi(comp.pm2_5, comp.pm10) : null, precip: (c.rain && c.rain['1h']) ?? 0, day, cond: mk(owmKind(c.weather[0].id), cap(c.weather[0].description), day) },
    hourly, daily, aqiMax: null
  };
}
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// ---------- load + cache ----------
const cacheKey = () => `${S.provider}|${(+S.lat).toFixed(2)}|${(+S.lon).toFixed(2)}|${S.units}`;
const cacheGet = () => (store.get(CK) || {})[cacheKey()] || null;
function cacheSet(data) { const c = store.get(CK) || {}; c[cacheKey()] = { ts: Date.now(), data }; const ks = Object.keys(c); if (ks.length > 8) ks.sort((a, b) => c[a].ts - c[b].ts).slice(0, ks.length - 8).forEach(k => delete c[k]); store.set(CK, c); }

async function load(force) {
  const id = ++loadId;
  const hit = cacheGet();
  if (!force && hit && Date.now() - hit.ts < 10 * 60 * 1000) { D = hit.data; render(); return; }
  $('#app').dataset.state = D ? 'ready' : 'loading'; if (D) $('#refresh').classList.add('spin');
  try {
    let data = S.provider === 'weatherapi' ? await loadWeatherAPI() : S.provider === 'openweathermap' ? await loadOWM() : await loadOpenMeteo();
    if (S.provider !== 'open-meteo') data = await fillFromOM(data);
    if (id !== loadId) return;
    D = data; cacheSet(data); render();
  } catch (e) {
    if (id !== loadId) return;
    if (hit) { D = hit.data; render(); toast(`Showing saved data from ${ago(hit.ts)}. ${e.message}`); }
    else showError(e);
  } finally { if (id === loadId) $('#refresh').classList.remove('spin'); }
}
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`; };
function showError(e) {
  $('#app').dataset.state = 'error';
  $('#errMsg').textContent = e.message || 'Could not load the weather.';
  $('#errSettings').hidden = !e.key;
}

// ---------- render ----------
function render() {
  const d = D, off = d.off, c = d.cur, today = d.daily[0], I = imp();
  $('#app').dataset.state = 'ready';
  document.body.dataset.sky = skyOf(c.cond.kind, c.day);
  const rgb = getComputedStyle(document.body).getPropertyValue('--b').trim(); if (rgb) $('meta[name=theme-color]').content = rgb;
  document.title = `${T(c.temp)} ${S.name}, weather | Atish Ak Sharma`;
  const pinned = S.pinned.some(p => near(p));
  $('#place').textContent = S.name;
  $('#region').textContent = [S.region && S.region !== S.name ? S.region : '', S.country].filter(Boolean).join(', ');
  $('#pin').setAttribute('aria-pressed', pinned); $('#pin').setAttribute('aria-label', pinned ? 'Remove from saved places' : 'Save this place');
  $('#pin').innerHTML = ico('star');
  $('#clock').textContent = clockText();
  $('#heroIcon').innerHTML = ico(c.cond.icon);
  $('#temp').textContent = N(c.temp); $('#tunit').textContent = tu();
  $('#cond').textContent = c.cond.text;
  $('#feelsLine').textContent = `Feels like ${T(c.feels)}`;
  $('#hilo').innerHTML = `<span>${ico('arrow-up')}${T(today.hi)}</span><span>${ico('arrow-down')}${T(today.lo)}</span>`;
  $('#heroChips').innerHTML = [`${ico('umbrella')}${N(today.pop)}% rain today`, `${ico('wind')}${N(c.wind)} ${wu()} ${compass(c.windDir)}`, `${ico('droplets')}${N(c.hum)}% humidity`].map(x => `<span class="chip">${x}</span>`).join('');
  $('#updated').textContent = `Updated ${ago(d.updated)} · ${d.sources.join(' + ')}`;

  // hourly: next 24 entries from this hour
  const hs = nowSec() + off, start = Math.floor(hs / 3600) * 3600 - off;
  const hrs = d.hourly.filter(h => h.t >= start - 1).slice(0, d.provider === 'openweathermap' ? 9 : 25);
  hrs.forEach((h, i) => { if (i === 0 && d.provider !== 'openweathermap') h = hrs[0] = { ...h, temp: c.temp, cond: c.cond }; });
  $('#hourly').innerHTML = hrs.map((h, i) => `<div class="hr"><b>${i === 0 && d.provider !== 'openweathermap' ? 'Now' : fmtHour(h.t, off)}</b>${ico(h.cond.icon)}<span class="t">${T(h.temp)}</span><span class="p ${h.pop >= 20 ? 'on' : ''}">${h.pop >= 1 ? N(h.pop) + '%' : ''}</span></div>`).join('') || '<p class="mute">No hourly data for this provider.</p>';
  $('#hourlyHint').textContent = d.provider === 'openweathermap' ? 'Every 3 hours' : 'Next 24 hours';

  // tiles
  const aqi = c.aqi, uv = c.uv ?? today.uvMax, dp = dewPoint(c.temp, c.hum), band = (rows, v) => rows.findIndex(r => v <= r.max);
  const aq = aqi == null ? null : AQI_ROWS[band(AQI_ROWS, aqi)], uvr = uv == null ? null : UV_ROWS[band(UV_ROWS, uv)];
  const wsp = kmh(c.wind), bf = BEAUFORT.findIndex(r => wsp <= r.max);
  $('#tiles').innerHTML = [
    tile('feels', 'Feels like', 'thermometer', `<div class="big">${T(c.feels)}</div><p>${feelsNote(c)}</p>`),
    tile('humidity', 'Humidity', 'droplets', `<div class="big">${N(c.hum)}<small>%</small></div><p>Dew point ${T(dp)}</p>`),
    tile('wind', 'Wind', 'wind', `<div class="wind"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/><text x="32" y="12" text-anchor="middle" font-size="8" fill="currentColor" opacity=".6">N</text><g transform="rotate(${((c.windDir ?? 0) + 180) % 360} 32 32)"><path d="M32 12 40 40 32 35 24 40Z" fill="var(--accent)"/></g></svg><div><div class="big">${N(c.wind)}<small>${wu()}</small></div><p>from ${compass(c.windDir)}</p></div></div>`),
    tile('pressure', 'Pressure', 'gauge', `<div class="big">${N(c.pressure)}<small>hPa</small></div><p>${c.pressure < 1009 ? 'Low' : c.pressure > 1022 ? 'High' : 'Normal'}</p>`),
    tile('uv', 'UV index', 'sun', `<div class="big">${uv == null ? '–' : (Math.round(uv * 10) / 10)}</div><p>${uvr ? uvr.label : 'Not available'}</p>${meter(uv, 11, 'uv')}`),
    tile('aqi', 'Air quality', 'leaf', `<div class="big">${aqi == null ? '–' : N(aqi)}</div><p>${aq ? aq.label : 'Not available'}</p>${meter(aqi, 300, 'aqi')}`),
    tile('sun', 'Sunrise and sunset', 'sunrise', sunTile(today, c, off)),
    tile('rain', 'Rain and clouds', 'cloud-rain', `<div class="big">${N(today.pop)}<small>%</small></div><p>Chance today · ${N(c.cloud)}% cloud</p>`)
  ].join('');

  // daily
  const gmin = Math.min(...d.daily.map(x => x.lo)), gmax = Math.max(...d.daily.map(x => x.hi)), span = Math.max(1, gmax - gmin);
  $('#dailyHint').textContent = `${d.daily.length}-day forecast`;
  $('#daily').innerHTML = d.daily.map((x, i) => `<button class="day" data-day="${i}"><span class="dn">${i === 0 ? 'Today' : wd(x.key)}</span>${ico(x.cond.icon)}<span class="dp ${x.pop >= 20 ? 'on' : ''}">${x.pop >= 1 ? N(x.pop) + '%' : ''}</span><span class="lo">${T(x.lo)}</span><span class="rng"><i style="left:${(x.lo - gmin) / span * 100}%;width:${Math.max(4, (x.hi - x.lo) / span * 100)}%"></i>${i === 0 && c.temp != null ? `<b style="left:${Math.min(100, Math.max(0, (c.temp - gmin) / span * 100))}%"></b>` : ''}</span><span class="hi">${T(x.hi)}</span></button>`).join('');
  renderPlaces(); icons();
}
const near = p => Math.abs(p.lat - S.lat) < 0.02 && Math.abs(p.lon - S.lon) < 0.02;
function tile(id, label, icon, body) { return `<button class="tile" data-info="${id}"><span class="th">${ico(icon)}${label}</span>${body}</button>`; }
function meter(v, max, cls) { return `<span class="meter ${cls}"><i style="left:${v == null ? -10 : Math.min(100, Math.max(0, v / max * 100))}%"></i></span>`; }
function feelsNote(c) { if (c.temp == null || c.feels == null) return ''; const d = Math.round(c.feels - c.temp); if (Math.abs(d) < 2) return 'Close to the actual temperature'; return d > 0 ? `${d}° warmer than the air (humidity)` : `${-d}° cooler than the air (wind)`; }
function sunTile(today, c, off) {
  const sr = today.sunrise, ss = today.sunset; if (sr == null || ss == null) return '<p>Not available</p>';
  const now = nowSec(), f = Math.min(1, Math.max(0, (now - sr) / (ss - sr))), x = 8 - 0 + f * 84, y = 38 - Math.sin(Math.PI * f) * 30, up = now >= sr && now <= ss;
  return `<svg class="arc" viewBox="0 0 100 44" aria-hidden="true"><path d="M8 38 A42 30 0 0 1 92 38" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="1 3"/><line x1="2" y1="38" x2="98" y2="38" stroke="currentColor" stroke-opacity=".4"/>${up ? `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)"/>` : ''}</svg><div class="srss"><span>${fmtTime(sr, off)}</span><span>${fmtTime(ss, off)}</span></div><p>${dur(ss - sr)} of daylight</p>`;
}
function clockText() { if (!D) return ''; const d = loc(nowSec(), D.off); return `${d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} · ${fmtTime(nowSec(), D.off)}`; }

// ---------- reference tables ----------
const UV_ROWS = [{ max: 2.99, range: '0 to 2', label: 'Low', tip: 'No protection needed on most days. Sunglasses help on bright days.', col: '#2e9e55' }, { max: 5.99, range: '3 to 5', label: 'Moderate', tip: 'Cover up and use sunscreen around midday.', col: '#c9a100' }, { max: 7.99, range: '6 to 7', label: 'High', tip: 'Hat, shade and SPF 30+ needed. Limit time in the midday sun.', col: '#e07b00' }, { max: 10.99, range: '8 to 10', label: 'Very high', tip: 'Avoid the midday sun. Skin can burn in under 20 minutes.', col: '#d33a2c' }, { max: 99, range: '11 and above', label: 'Extreme', tip: 'Stay in the shade at midday. Unprotected skin burns in minutes.', col: '#8e3fc0' }];
const AQI_ROWS = [{ max: 50, range: '0 to 50', label: 'Good', tip: 'Air is clean. Enjoy outdoor activity.', col: '#2e9e55' }, { max: 100, range: '51 to 100', label: 'Moderate', tip: 'Acceptable. Unusually sensitive people may notice effects.', col: '#c9a100' }, { max: 150, range: '101 to 150', label: 'Unhealthy for sensitive groups', tip: 'Children, older adults and people with asthma or heart conditions should cut down on heavy outdoor effort.', col: '#e07b00' }, { max: 200, range: '151 to 200', label: 'Unhealthy', tip: 'Everyone may feel effects. Limit long outdoor exertion; a mask (N95) helps.', col: '#d33a2c' }, { max: 300, range: '201 to 300', label: 'Very unhealthy', tip: 'Avoid outdoor exercise. Keep windows closed and use an air purifier if you have one.', col: '#8e3fc0' }, { max: 999, range: '301 and above', label: 'Hazardous', tip: 'Stay indoors. Health warning for everyone.', col: '#7a1230' }];
const BEAUFORT = [{ max: 1, range: 'under 1', label: 'Calm' }, { max: 5, range: '1 to 5', label: 'Light air' }, { max: 11, range: '6 to 11', label: 'Light breeze' }, { max: 19, range: '12 to 19', label: 'Gentle breeze' }, { max: 28, range: '20 to 28', label: 'Moderate breeze' }, { max: 38, range: '29 to 38', label: 'Fresh breeze' }, { max: 49, range: '39 to 49', label: 'Strong breeze' }, { max: 61, range: '50 to 61', label: 'Near gale' }, { max: 74, range: '62 to 74', label: 'Gale' }, { max: 88, range: '75 to 88', label: 'Strong gale' }, { max: 102, range: '89 to 102', label: 'Storm' }, { max: 117, range: '103 to 117', label: 'Violent storm' }, { max: 9999, range: '118 and above', label: 'Hurricane force' }];
const PRESS = [{ max: 1008.99, range: 'under 1009', label: 'Low', tip: 'Often brings cloud, wind or rain.' }, { max: 1022, range: '1009 to 1022', label: 'Normal', tip: 'Typical, settled weather.' }, { max: 9999, range: 'over 1022', label: 'High', tip: 'Usually clear, calm and dry.' }];
const HUM = [{ max: 29.99, range: 'under 30%', label: 'Dry', tip: 'Skin and throat can feel dry.' }, { max: 60, range: '30 to 60%', label: 'Comfortable', tip: 'The most comfortable range indoors and out.' }, { max: 70, range: '61 to 70%', label: 'Humid', tip: 'Feels sticky, sweat evaporates slowly.' }, { max: 100, range: 'over 70%', label: 'Very humid', tip: 'Muggy. Heat feels hotter than the thermometer says.' }];

function table(rows, active, colHead) {
  return `<table class="tbl"><thead><tr><th>${colHead}</th><th>Level</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === active ? 'now' : ''}"><td>${r.range}</td><td>${r.col ? `<i class="dot" style="background:${r.col}"></i>` : ''}${r.label}</td></tr>`).join('')}</tbody></table>`;
}
const idx = (rows, v) => v == null ? -1 : rows.findIndex(r => v <= r.max);

// ---------- popups ----------
function openPop(title, icon, html) {
  $('#popTitle').innerHTML = `${ico(icon)}<span>${esc(title)}</span>`; $('#popBody').innerHTML = html; icons();
  const p = $('#pop'); if (!p.open) p.showModal(); p.scrollTop = 0;
}
function src() { return `<p class="src">Source: ${esc(D.sources.join(' + '))}. Times shown in ${esc(S.name)} local time.</p>`; }
function info(type) {
  const d = D, c = d.cur, today = d.daily[0], off = d.off;
  if (type === 'feels') {
    const dd = c.feels != null && c.temp != null ? Math.round(c.feels - c.temp) : 0;
    return openPop('Feels like', 'thermometer', `<p class="lead">It is <b>${T(c.temp)}</b> in the air and feels like <b>${T(c.feels)}</b>.</p><p>The "feels like" temperature combines air temperature, humidity and wind. ${Math.abs(dd) < 2 ? 'Right now they are close together.' : dd > 0 ? 'Humid air slows sweat evaporation, so it feels warmer.' : 'Wind carries heat away from your skin, so it feels colder.'}</p><div class="kv"><div><span>Air temperature</span><b>${T(c.temp)}</b></div><div><span>Wind</span><b>${N(c.wind)} ${wu()}</b></div><div><span>Humidity</span><b>${N(c.hum)}%</b></div><div><span>Today's range</span><b>${T(today.lo)} to ${T(today.hi)}</b></div></div>${src()}`);
  }
  if (type === 'humidity') { const dp = dewPoint(c.temp, c.hum); return openPop('Humidity', 'droplets', `<p class="lead">Relative humidity is <b>${N(c.hum)}%</b>. The dew point is <b>${T(dp)}</b>.</p><p>Relative humidity is how full the air is with water vapour at this temperature. The dew point is the temperature at which dew starts to form; a higher dew point feels more oppressive than the humidity alone suggests.</p>${table(HUM, idx(HUM, c.hum), 'Humidity')}${src()}`); }
  if (type === 'wind') { const k = kmh(c.wind), b = BEAUFORT.findIndex(r => k <= r.max); return openPop('Wind', 'wind', `<p class="lead"><b>${N(c.wind)} ${wu()}</b> from the <b>${compass(c.windDir)}</b>${c.windDir != null ? ` (${Math.round(c.windDir)}°)` : ''}${c.gust != null ? `, gusting to <b>${N(c.gust)} ${wu()}</b>` : ''}.</p><p>Wind direction is where the wind comes <em>from</em>; the arrow on the tile points the way it blows. Beaufort scale (km/h):</p>${table(BEAUFORT, b, 'Speed (km/h)')}${src()}`); }
  if (type === 'pressure') { return openPop('Pressure', 'gauge', `<p class="lead"><b>${N(c.pressure)} hPa</b> at sea level, which is ${c.pressure < 1009 ? 'low' : c.pressure > 1022 ? 'high' : 'normal'}.</p><p>All pressure readings are adjusted to sea level so they can be compared between places. Falling pressure usually means weather is getting worse; rising means it is improving.</p>${table(PRESS, idx(PRESS, c.pressure), 'Pressure (hPa)')}${src()}`); }
  if (type === 'uv') {
    const uv = c.uv ?? today.uvMax, i = idx(UV_ROWS, uv), r = UV_ROWS[i];
    return openPop('UV index', 'sun', `<p class="lead">${uv == null ? 'UV data is not available for this place.' : `UV is <b>${Math.round(uv * 10) / 10}</b>, <b>${r.label}</b>${c.uv == null ? ' (today\'s peak)' : ''}. Today\'s peak is <b>${today.uvMax == null ? '–' : Math.round(today.uvMax * 10) / 10}</b>.`}</p>${r ? `<p>${r.tip}</p>` : ''}${table(UV_ROWS, i, 'UV index')}<p class="src">WHO / WMO scale. UV is highest around solar noon and drops to 0 at night.</p>${src()}`);
  }
  if (type === 'aqi') {
    const a = c.aqi, i = idx(AQI_ROWS, a), r = AQI_ROWS[i];
    return openPop('Air quality', 'leaf', `<p class="lead">${a == null ? 'Air quality data is not available for this place.' : `US AQI is <b>${N(a)}</b>, <b>${r.label}</b>.${d.aqiMax != null ? ` Highest reading today: <b>${N(d.aqiMax)}</b>.` : ''}`}</p>${r ? `<p>${r.tip}</p>` : ''}${table(AQI_ROWS, i, 'US AQI')}<p class="src">US EPA scale, based on fine particles (PM2.5) and coarse particles (PM10) in the air.</p>${src()}`);
  }
  if (type === 'sun') {
    const f = today.sunrise != null ? `<div class="kv"><div><span>Sunrise</span><b>${fmtTime(today.sunrise, off)}</b></div><div><span>Sunset</span><b>${fmtTime(today.sunset, off)}</b></div><div><span>Daylight</span><b>${dur(today.sunset - today.sunrise)}</b></div><div><span>Solar noon</span><b>${fmtTime((today.sunrise + today.sunset) / 2, off)}</b></div></div>` : '<p>Sun times are not available.</p>';
    const next = d.daily[1] && d.daily[1].sunrise != null ? `<p class="src">Tomorrow: sunrise ${fmtTime(d.daily[1].sunrise, off)}, sunset ${fmtTime(d.daily[1].sunset, off)} (${dur(d.daily[1].sunset - d.daily[1].sunrise)}).</p>` : '';
    return openPop('Sunrise and sunset', 'sunrise', `${f}${next}${src()}`);
  }
  if (type === 'rain') return openPop('Rain and clouds', 'cloud-rain', `<p class="lead"><b>${N(today.pop)}%</b> chance of rain today, with <b>${N(c.cloud)}%</b> of the sky covered by cloud right now.</p><div class="kv"><div><span>Rain chance today</span><b>${N(today.pop)}%</b></div><div><span>Cloud cover now</span><b>${N(c.cloud)}%</b></div><div><span>Rain in the last hour</span><b>${c.precip == null ? '–' : (Math.round(c.precip * 10) / 10) + (imp() ? ' in' : ' mm')}</b></div><div><span>Condition</span><b>${esc(c.cond.text)}</b></div></div><p>Rain chance is the probability that measurable rain falls at this spot at some point during the day, not how much falls.</p>${src()}`);
}
function dayPop(i) {
  const d = D, x = d.daily[i], off = d.off, hs = d.hourly.filter(h => dayKey(h.t, off) === x.key);
  let chart = '<p class="mute">No hourly data for this day.</p>';
  if (hs.length > 1) {
    const W = 560, H = 150, pad = 26, vs = hs.map(h => h.temp), mn = Math.min(...vs), mx = Math.max(...vs), sp = Math.max(1, mx - mn);
    const px = j => pad + j / (hs.length - 1) * (W - pad * 2), py = v => H - 38 - (v - mn) / sp * (H - 74);
    const pts = hs.map((h, j) => `${px(j).toFixed(1)},${py(h.temp).toFixed(1)}`).join(' ');
    const step = Math.ceil(hs.length / 8);
    chart = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature through the day"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${hs.map((h, j) => j % step === 0 || j === hs.length - 1 ? `<circle cx="${px(j)}" cy="${py(h.temp)}" r="3.5" fill="var(--accent)"/><text x="${px(j)}" y="${py(h.temp) - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${T(h.temp)}</text><text x="${px(j)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity=".65">${fmtHour(h.t, off).replace(' ', '')}</text>` : '').join('')}</svg>`;
  }
  openPop(i === 0 ? 'Today' : wd(x.key, true), x.cond.icon, `<p class="lead">${dateLong(x.key)}: <b>${esc(x.cond.text)}</b>, high <b>${T(x.hi)}</b>, low <b>${T(x.lo)}</b>.</p>${chart}<div class="kv"><div><span>Rain chance</span><b>${N(x.pop)}%</b></div><div><span>Cloud cover (avg)</span><b>${N(x.cloud)}%</b></div><div><span>UV peak</span><b>${x.uvMax == null ? '–' : Math.round(x.uvMax * 10) / 10}</b></div><div><span>Max wind</span><b>${N(x.windMax)} ${wu()}</b></div><div><span>Sunrise</span><b>${fmtTime(x.sunrise, off)}</b></div><div><span>Sunset</span><b>${fmtTime(x.sunset, off)}</b></div></div>${src()}`);
}

// ---------- saved places ----------
async function renderPlaces() {
  const box = $('#places'); $('#placesCard').hidden = !S.pinned.length;
  if (!S.pinned.length) return;
  box.innerHTML = S.pinned.map((p, i) => `<div class="pl ${near(p) ? 'cur' : ''}"><button class="plgo" data-go="${i}"><b>${esc(p.name)}</b><span class="pt">–</span><span class="pm">${esc(p.region || p.country || '')}</span></button><button class="plx" data-rm="${i}" aria-label="Remove ${esc(p.name)}">${ico('x')}</button></div>`).join(''); icons();
  try {
    const u = imp() ? '&temperature_unit=fahrenheit' : '', la = S.pinned.map(p => p.lat).join(','), lo = S.pinned.map(p => p.lon).join(',');
    const [w, a] = await Promise.all([getJSON(`${OM}/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1${u}`), getJSON(`${OMA}/air-quality?latitude=${la}&longitude=${lo}&current=us_aqi&timezone=auto`).catch(() => null)]);
    const ws = Array.isArray(w) ? w : [w], as = a ? (Array.isArray(a) ? a : [a]) : [];
    ws.forEach((r, i) => { const el = box.children[i]; if (!el) return; const cd = wmo(r.current.weather_code, !!r.current.is_day), aq = as[i] && as[i].current ? as[i].current.us_aqi : null; const go = el.querySelector('.plgo');
      go.querySelector('.pt').innerHTML = `${ico(cd.icon)}${T(r.current.temperature_2m)}`; go.querySelector('.pm').textContent = `${T(r.daily.temperature_2m_min[0])} to ${T(r.daily.temperature_2m_max[0])} · ${N(r.daily.precipitation_probability_max[0])}% rain${aq != null ? ' · AQI ' + N(aq) : ''}`; }); icons();
  } catch (e) { /* cards keep placeholders */ }
}
function togglePin() {
  const i = S.pinned.findIndex(near);
  if (i >= 0) { S.pinned.splice(i, 1); toast(`${S.name} removed from saved places`); }
  else { if (S.pinned.length >= 8) return toast('You can save up to 8 places. Remove one first.'); S.pinned.push({ name: S.name, lat: S.lat, lon: S.lon, region: S.region, country: S.country }); toast(`${S.name} saved`); }
  save(); render();
}

// ---------- search + location ----------
let sT, results = [], hi = -1, sId = 0;
async function search(q) {
  const box = $('#results'), id = ++sId; if (q.trim().length < 2) { box.hidden = true; return; }
  let failed = false;
  try {
    const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=6&language=en&format=json`);
    if (id !== sId) return;                       // a newer search is in flight
    results = (j.results || []).map(r => ({ name: r.name, region: r.admin1 || '', country: r.country || '', lat: r.latitude, lon: r.longitude }));
  } catch (e) { if (id !== sId) return; results = []; failed = true; }
  hi = -1; box.hidden = false;
  box.innerHTML = results.length ? results.map((r, i) => `<li role="option" data-i="${i}" id="r${i}">${ico('map-pin')}<span><b>${esc(r.name)}</b> <small>${esc([r.region, r.country].filter(Boolean).join(', '))}</small></span></li>`).join('') : `<li class="none">${failed ? 'Search is unavailable right now. Check your connection and try again.' : 'No places found. Try a different spelling.'}</li>`;
  icons();
}
function setPlace(p, fromGPS) {
  Object.assign(S, { lat: +p.lat, lon: +p.lon, name: p.name, region: p.region || '', country: p.country || '', hasLoc: true }); save();
  $('#q').value = ''; $('#results').hidden = true; load(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function reverse(lat, lon) {
  try { const j = await getJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`); return { name: j.city || j.locality || j.principalSubdivision || 'My location', region: j.principalSubdivision || '', country: j.countryName || '' }; }
  catch (e) { return { name: 'My location', region: '', country: '' }; }
}
function useGPS() {
  if (!navigator.geolocation) return toast('This browser cannot share your location.');
  toast('Finding your location…'); $('#locate').classList.add('spin');
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords, r = await reverse(lat, lon); $('#locate').classList.remove('spin'); setPlace({ lat, lon, ...r }, true);
  }, err => { $('#locate').classList.remove('spin'); toast(err.code === 1 ? 'Location is blocked. Allow it in your browser, or search for a city.' : 'Could not get your location. Search for a city instead.'); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
}
async function firstVisit() {
  try { const j = await getJSON('https://ipwho.is/'); if (j.success && j.latitude != null) { Object.assign(S, { lat: j.latitude, lon: j.longitude, name: j.city || 'Your area', region: j.region || '', country: j.country || '', hasLoc: true }); save(); toast(`Showing ${S.name}. Tap the location button for exact GPS.`); } } catch (e) { /* default stays */ }
}

// ---------- settings, theme, toast ----------
function applyTheme() { if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = S.theme; const b = $('#themeBtn'); b.innerHTML = ico(S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'sun-moon'); b.setAttribute('aria-label', `Theme: ${S.theme}`); icons(); }
let tT; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => t.classList.remove('show'), 3600); }
function openSettings() {
  $('#sUnits').value = S.units; $('#sProv').value = S.provider; $('#sKey').value = S.apiKey; $('#sTheme').value = S.theme; provUI(); $('#settings').showModal();
}
function provUI() { const p = PROVIDERS[$('#sProv').value]; $('#keyRow').hidden = !p.key; $('#keyHint').textContent = p.hint || ''; }
function saveSettings() {
  const prev = [S.units, S.provider, S.apiKey].join('|');
  S.units = $('#sUnits').value; S.provider = $('#sProv').value; S.apiKey = $('#sKey').value.trim(); S.theme = $('#sTheme').value;
  save(); applyTheme(); $('#settings').close(); syncUnitSeg();
  if ([S.units, S.provider, S.apiKey].join('|') !== prev) { D = null; load(true); }
}
function syncUnitSeg() { $$('#unitSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.units)); }

// ---------- init ----------
function init() {
  applyTheme(); syncUnitSeg();
  $('#year').textContent = new Date().getFullYear();
  $('#unitSeg').onclick = e => { const b = e.target.closest('[data-u]'); if (!b || b.dataset.u === S.units) return; S.units = b.dataset.u; save(); syncUnitSeg(); D = null; load(true); };
  $('#themeBtn').onclick = () => { S.theme = S.theme === 'auto' ? 'light' : S.theme === 'light' ? 'dark' : 'auto'; save(); applyTheme(); };
  $('#settingsBtn').onclick = openSettings; $('#sProv').onchange = provUI;
  $('#sSave').onclick = saveSettings;
  $('#sClear').onclick = () => { if (confirm('Delete saved places, settings and cached weather from this browser?')) { [LS, LEG, CK].forEach(store.del); location.reload(); } };
  $$('dialog').forEach(d => { d.addEventListener('click', e => { if (e.target === d) d.close(); }); d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close()); });
  $('#locate').onclick = useGPS; $('#refresh').onclick = () => load(true); $('#pin').onclick = togglePin; $('#retry').onclick = () => load(true); $('#errSettings').onclick = openSettings;
  $('#tiles').onclick = e => { const t = e.target.closest('[data-info]'); if (t && D) info(t.dataset.info); };
  $('#daily').onclick = e => { const t = e.target.closest('[data-day]'); if (t && D) dayPop(+t.dataset.day); };
  $('#places').onclick = e => { const g = e.target.closest('[data-go]'), r = e.target.closest('[data-rm]'); if (g) setPlace(S.pinned[+g.dataset.go]); if (r) { const p = S.pinned[+r.dataset.rm]; if (confirm(`Remove ${p.name} from saved places?`)) { S.pinned.splice(+r.dataset.rm, 1); save(); renderPlaces(); if (D) render(); toast(`${p.name} removed`); } } };
  const q = $('#q');
  q.oninput = () => { clearTimeout(sT); sT = setTimeout(() => search(q.value), 280); };
  q.onkeydown = e => {
    const box = $('#results'); if (box.hidden) return;
    if (e.key === 'ArrowDown') { hi = Math.min(results.length - 1, hi + 1); e.preventDefault(); } else if (e.key === 'ArrowUp') { hi = Math.max(0, hi - 1); e.preventDefault(); }
    else if (e.key === 'Enter') { const r = results[hi >= 0 ? hi : 0]; if (r) { e.preventDefault(); setPlace(r); } return; } else if (e.key === 'Escape') { box.hidden = true; return; } else return;
    $$('#results li').forEach((li, i) => li.classList.toggle('on', i === hi)); q.setAttribute('aria-activedescendant', hi >= 0 ? 'r' + hi : '');
  };
  $('#results').onclick = e => { const li = e.target.closest('[data-i]'); if (li) setPlace(results[+li.dataset.i]); };
  document.addEventListener('click', e => { if (!e.target.closest('.search')) $('#results').hidden = true; });
  setInterval(() => { if (D && !document.hidden) { $('#clock').textContent = clockText(); $('#updated').textContent = `Updated ${ago(D.updated)} · ${D.sources.join(' + ')}`; } }, 30000);
  setInterval(() => { if (!document.hidden && D && Date.now() - D.updated > 15 * 60 * 1000) load(true); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && D && Date.now() - D.updated > 15 * 60 * 1000) load(true); });
  (async () => { if (!S.hasLoc) await firstVisit(); load(); })();
}
window.addEventListener('DOMContentLoaded', init);
