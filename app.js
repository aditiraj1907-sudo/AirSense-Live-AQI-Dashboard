// ── STATE ────────────────────────────────────────────────────────────────────
let currentPage = 0;
let lastAqiData = null;

// ── NAVIGATION ───────────────────────────────────────────────────────────────
const pages = [
  document.getElementById('page1'),
  document.getElementById('page2'),
  document.getElementById('page3'),
];
const dots = document.querySelectorAll('.nav-dot');
const overlay = document.getElementById('overlay');

function goTo(idx) {
  overlay.classList.add('show');
  setTimeout(() => {
    pages[currentPage].classList.remove('active');
    dots[currentPage].classList.remove('active');
    currentPage = idx;
    pages[currentPage].classList.add('active');
    dots[currentPage].classList.add('active');
    // Switch background scene
    document.body.classList.remove('scene-green','scene-smog','scene-health');
    if (idx === 0) document.body.classList.add('scene-green');
    else if (idx === 1) document.body.classList.add('scene-smog');
    else document.body.classList.add('scene-health');
    // Spawn leaf particles on health page
    if (idx === 2) spawnLeaves(); else clearLeaves();
    overlay.classList.remove('show');
  }, 300);
}

// ── LEAF PARTICLES ────────────────────────────────────────────────────────────
let leafInterval = null;
const leafEmojis = ['🍃','🌿','🍀','🌱','🌾','🍂'];
function spawnLeaves() {
  clearLeaves();
  leafInterval = setInterval(() => {
    const el = document.createElement('div');
    el.className = 'leaf-particle';
    el.textContent = leafEmojis[Math.floor(Math.random()*leafEmojis.length)];
    el.style.left = Math.random()*100 + 'vw';
    el.style.bottom = '-60px';
    const dur = 6 + Math.random()*8;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = '0s';
    el.style.fontSize = (0.7 + Math.random()*0.8) + 'rem';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur*1000 + 500);
  }, 900);
}
function clearLeaves() {
  if (leafInterval) { clearInterval(leafInterval); leafInterval = null; }
  document.querySelectorAll('.leaf-particle').forEach(el => el.remove());
}

// ── CLOCK & GREETING ─────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const pad = n => String(n).padStart(2,'0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeStr = `${pad(h12)}:${pad(m)}:${pad(s)} ${ampm}`;
  const dateStr = now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});

  document.getElementById('clockDisplay').textContent = timeStr;
  document.getElementById('dateDisplay').textContent = dateStr;
  document.getElementById('localTime').textContent = `${pad(h12)}:${pad(m)} ${ampm}`;
  document.getElementById('localDate').textContent = now.toLocaleDateString('en-IN',{day:'numeric',month:'short'});

  const greetWord = document.getElementById('greetWord');
  if (h < 12) greetWord.innerHTML = 'Good<br><em>Morning.</em>';
  else if (h < 17) greetWord.innerHTML = 'Good<br><em>Afternoon.</em>';
  else if (h < 21) greetWord.innerHTML = 'Good<br><em>Evening.</em>';
  else greetWord.innerHTML = 'Good<br><em>Night.</em>';
}
updateClock();
setInterval(updateClock, 1000);

// Detect city
(async () => {
  try {
    const r = await fetch('https://ipapi.co/json/');
    const d = await r.json();
    if (d.city) document.getElementById('geoCity').textContent = d.city + ', ' + d.country_name;
  } catch(e) { document.getElementById('geoCity').textContent = 'Unknown'; }
})();

// ── AQI BANDS ────────────────────────────────────────────────────────────────
function getAqiInfo(aqi) {
  const bands = [
    { max:50,  label:'Good', color:'#4ade80', desc:'Air quality is satisfactory. Safe for all outdoor activities.',
      headerEmoji: '😊', bannerEmoji: '🌿',
      advice:[
        { icon:'🌳', bg:'rgba(74,222,128,0.13)', title:'Safe for everyone', text:'Everyone can enjoy outdoor activities freely without concern.' },
        { icon:'🪟', bg:'rgba(74,222,128,0.13)', title:'Open your windows', text:'Let fresh air circulate through your home and workplace.' },
        { icon:'🏃', bg:'rgba(74,222,128,0.13)', title:'Exercise freely', text:'Running, cycling, and outdoor sports are completely fine today.' },
        { icon:'☀️', bg:'rgba(74,222,128,0.13)', title:'Enjoy the outdoors', text:'A great day to be outside — go for a walk or visit a park.' },
      ]},
    { max:100, label:'Moderate', color:'#facc15', desc:'Acceptable. Unusually sensitive people may have minor concerns.',
      headerEmoji: '🙂', bannerEmoji: '🌤️',
      advice:[
        { icon:'⚠️', bg:'rgba(250,204,21,0.12)', title:'Sensitive groups take care', text:'People with respiratory or heart conditions should monitor symptoms.' },
        { icon:'🌿', bg:'rgba(250,204,21,0.12)', title:'Limit prolonged exposure', text:'Avoid spending many hours outdoors continuously.' },
        { icon:'💧', bg:'rgba(250,204,21,0.12)', title:'Stay hydrated', text:'Drink plenty of water to help your body cope with moderate pollution.' },
        { icon:'🚶', bg:'rgba(250,204,21,0.12)', title:'Light exercise ok', text:'Casual walks and light outdoor activity are generally fine for most.' },
      ]},
    { max:150, label:'Unhealthy for Sensitive', color:'#fb923c', desc:'Children, elderly & people with lung/heart disease should limit time outdoors.',
      headerEmoji: '😐', bannerEmoji: '🌫️',
      advice:[
        { icon:'🧒', bg:'rgba(251,146,60,0.12)', title:'Protect children', text:'Reduce outdoor playtime for kids — move activities inside where possible.' },
        { icon:'🏥', bg:'rgba(251,146,60,0.12)', title:'Respiratory patients stay in', text:'People with asthma, COPD, or heart disease should avoid going out.' },
        { icon:'😷', bg:'rgba(251,146,60,0.12)', title:'Consider wearing a mask', text:'An N95 mask significantly reduces particulate inhalation outdoors.' },
        { icon:'🪟', bg:'rgba(251,146,60,0.12)', title:'Keep windows closed', text:'Reduce indoor infiltration of outdoor pollutants by keeping windows shut.' },
      ]},
    { max:200, label:'Unhealthy', color:'#f87171', desc:'Everyone may experience health effects. Sensitive groups should avoid exposure.',
      headerEmoji: '😟', bannerEmoji: '🚨',
      advice:[
        { icon:'😷', bg:'rgba(248,113,113,0.13)', title:'Wear N95 mask outdoors', text:'A properly fitted N95 or KN95 mask is essential when going outside.' },
        { icon:'🏠', bg:'rgba(248,113,113,0.13)', title:'Stay indoors when possible', text:'Minimize outdoor time — work from home if your situation allows.' },
        { icon:'💨', bg:'rgba(248,113,113,0.13)', title:'Use air purifier indoors', text:'Run a HEPA air purifier to clean indoor air and create a safe zone.' },
        { icon:'🚫', bg:'rgba(248,113,113,0.13)', title:'Avoid vigorous exercise', text:'No running, cycling, or intense outdoor workouts — reschedule them.' },
      ]},
    { max:300, label:'Very Unhealthy', color:'#c084fc', desc:'Health alert — everyone should avoid extended outdoor activity.',
      headerEmoji: '😨', bannerEmoji: '☠️',
      advice:[
        { icon:'🚫', bg:'rgba(192,132,252,0.13)', title:'Avoid all outdoor exertion', text:'Even brief vigorous activity outdoors poses serious health risks today.' },
        { icon:'😷', bg:'rgba(192,132,252,0.13)', title:'N95 mask is essential', text:'Do not go outside without an N95 respirator properly fitted on your face.' },
        { icon:'🏠', bg:'rgba(192,132,252,0.13)', title:'Remain indoors all day', text:'Keep all windows and doors closed. Use air purifiers continuously.' },
        { icon:'🌿', bg:'rgba(192,132,252,0.13)', title:'Indoor plants help', text:'Combine HEPA filtration with indoor plants like peace lilies to purify air.' },
      ]},
    { max:999, label:'Hazardous', color:'#e11d48', desc:'Emergency conditions. Avoid all outdoor exposure.',
      headerEmoji: '🆘', bannerEmoji: '🔴',
      advice:[
        { icon:'🚨', bg:'rgba(225,29,72,0.13)', title:'Emergency conditions', text:'This is a public health emergency. Treat this day as an indoor lockdown.' },
        { icon:'🔒', bg:'rgba(225,29,72,0.13)', title:'Seal doors and windows', text:'Use wet towels or tape to seal gaps — prevent outdoor air from entering.' },
        { icon:'😷', bg:'rgba(225,29,72,0.13)', title:'Respirator if you must go out', text:'Only step outside with a properly sealed N95/P100 respirator.' },
        { icon:'🏥', bg:'rgba(225,29,72,0.13)', title:'Seek medical help if unwell', text:'If you experience breathing difficulty or chest pain — call emergency services.' },
      ]},
  ];
  const b = bands.find(x => aqi <= x.max) || bands[bands.length-1];
  return { ...b, pct: Math.min((aqi / 500) * 100, 97) };
}

// ── GEOCODING ────────────────────────────────────────────────────────────────
async function backupGeocode(q) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`);
    const data = await r.json();
    return data.map(p => ({ name: p.display_name, latitude: parseFloat(p.lat), longitude: parseFloat(p.lon), country: p.display_name }));
  } catch(e) { return []; }
}
async function geocode(q) {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=15&language=en&format=json`);
    const d = await r.json();
    if (d.results?.length > 0) return d.results;
  } catch(e) {}
  return await backupGeocode(q);
}

// ── AIR QUALITY FETCH ─────────────────────────────────────────────────────────
async function fetchMeteoAQ(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Meteo AQ failed');
  return r.json();
}
async function getAirQuality(cityName) {
  const geos = await geocode(cityName);
  if (!geos.length) throw new Error(`Cannot find "${cityName}". Try adding country — e.g. "Delhi, India".`);
  const geo = geos[0];
  const lat = geo.latitude || geo.lat;
  const lon = geo.longitude || geo.lon;
  const displayName = geo.display_name || [geo.name, geo.admin1, geo.country].filter(Boolean).join(', ');
  const meteoRes = await fetchMeteoAQ(lat, lon);
  let aqi = null, iaqi = {}, updatedAt = new Date().toISOString(), source = [];
  if (meteoRes?.current) {
    const m = meteoRes.current;
    if (!aqi && m.us_aqi) aqi = m.us_aqi;
    if (!iaqi.pm25 && m.pm2_5 != null) iaqi.pm25 = { v: m.pm2_5 };
    if (!iaqi.pm10 && m.pm10 != null) iaqi.pm10 = { v: m.pm10 };
    if (!iaqi.no2 && m.nitrogen_dioxide != null) iaqi.no2 = { v: m.nitrogen_dioxide };
    if (!iaqi.so2 && m.sulphur_dioxide != null) iaqi.so2 = { v: m.sulphur_dioxide };
    if (!iaqi.o3 && m.ozone != null) iaqi.o3 = { v: m.ozone };
    if (!iaqi.co && m.carbon_monoxide != null) iaqi.co = { v: +(m.carbon_monoxide / 1000).toFixed(3) };
    source.push('Open-Meteo');
  }
  if (!aqi) throw new Error(`No air quality data for "${cityName}".`);
  return { aqi, iaqi, city: displayName, lat, lon, updatedAt, source };
}

// ── AUTOCOMPLETE ──────────────────────────────────────────────────────────────
let acTimer;
const inp = document.getElementById('searchInput');
const acList = document.getElementById('acList');
inp.addEventListener('input', () => {
  clearTimeout(acTimer);
  const q = inp.value.trim();
  if (q.length < 2) { closeAC(); return; }
  acTimer = setTimeout(() => showAC(q), 280);
});
inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap-pos')) closeAC(); });

async function showAC(q) {
  const res = await geocode(q).catch(() => []);
  if (!res.length) { closeAC(); return; }
  acList.innerHTML = res.slice(0,6).map(r => {
    const full = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
    const flag = r.country_code ? `<img src="https://flagcdn.com/16x12/${r.country_code.toLowerCase()}.png" style="width:16px;height:12px;border-radius:2px;flex-shrink:0">` : '🌍';
    return `<div class="ac-item" onclick="pickAC('${full.replace(/'/g,"\\'")}')">
      ${flag}
      <span class="ac-name">${r.name}</span>
      <span class="ac-country">${[r.admin1,r.country].filter(Boolean).join(', ')}</span>
    </div>`;
  }).join('');
  acList.classList.add('open');
}
function pickAC(name) { inp.value = name; closeAC(); doSearch(); }
function closeAC() { acList.classList.remove('open'); acList.innerHTML = ''; }
function quickSearch(c) { inp.value = c; doSearch(); }

// ── SEARCH ────────────────────────────────────────────────────────────────────
async function doSearch() {
  const query = inp.value.trim();
  if (!query) return;
  closeAC();
  const res = document.getElementById('results');
  const btn = document.getElementById('searchBtn');
  const toHealth = document.getElementById('toHealthBtn');
  res.style.display = 'block';
  btn.disabled = true; btn.textContent = '…';
  toHealth.classList.remove('visible');
  res.innerHTML = `<div class="loading"><div class="spinner"></div>Checking air quality for <strong>${query}</strong>…</div>`;
  try {
    const data = await getAirQuality(query);
    lastAqiData = data;
    renderResults(data);
    toHealth.classList.add('visible');
    updateHealthPage(data);
  } catch(err) {
    res.innerHTML = `<div class="error-msg"><strong>⚠️ ${err.message}</strong><br><small style="opacity:.7;display:block;margin-top:6px">Try: "Agra, India" or "Mumbai, India"</small></div>`;
  }
  btn.disabled = false; btn.textContent = 'Check';
}

// ── RENDER RESULTS ────────────────────────────────────────────────────────────
function renderResults(d) {
  const { aqi, iaqi, city, lat, lon, updatedAt, source } = d;
  const info = getAqiInfo(aqi);
  const dateStr = (() => { try { return new Date(updatedAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}); } catch(e) { return updatedAt; } })();
  const METRICS = [
    { key:'pm25', label:'PM2.5', unit:'µg/m³', icon:'🌫️', max:250 },
    { key:'pm10', label:'PM10',  unit:'µg/m³', icon:'💨', max:350 },
    { key:'o3',   label:'O₃',   unit:'µg/m³', icon:'☁️', max:180 },
    { key:'no2',  label:'NO₂',  unit:'µg/m³', icon:'🏭', max:200 },
    { key:'so2',  label:'SO₂',  unit:'µg/m³', icon:'⚡', max:150 },
    { key:'co',   label:'CO',   unit:'ppm',   icon:'🔥', max:15  },
  ];
  const metricCards = METRICS.filter(m => iaqi[m.key] !== undefined).map(m => {
    const val = iaqi[m.key]?.v ?? iaqi[m.key];
    const display = typeof val === 'number' ? (val < 10 ? val.toFixed(2) : Math.round(val)) : '–';
    const pct = typeof val === 'number' ? Math.min((val/m.max)*100, 100) : 0;
    return `<div class="metric-card">
      <div class="metric-icon">${m.icon}</div>
      <div class="metric-name">${m.label}</div>
      <div class="metric-value">${display}<span class="metric-unit">${m.unit}</span></div>
      <div class="metric-bar"><div class="metric-bar-fill" data-w="${pct}" style="background:${info.color}"></div></div>
    </div>`;
  }).join('');

  document.getElementById('results').innerHTML = `
    <div class="aqi-hero" style="--glow:${info.color}">
      <div class="aqi-hero-top">
        <div>
          <div class="aqi-location">📍 ${city}</div>
          <div class="aqi-coords">lat ${lat.toFixed(3)} · lon ${lon.toFixed(3)}</div>
          <div class="aqi-updated">Updated: ${dateStr}</div>
        </div>
        <div class="aqi-number-block">
          <div class="aqi-label-sm">US AQI</div>
          <div class="aqi-number" style="color:${info.color}">${Math.round(aqi)}</div>
        </div>
      </div>
      <div class="aqi-status-row">
        <div class="aqi-pill" style="background:color-mix(in srgb,${info.color} 15%,transparent);border:1px solid color-mix(in srgb,${info.color} 40%,transparent);color:${info.color}">
          <span class="aqi-dot"></span>${info.label}
        </div>
        <span class="aqi-desc">${info.desc}</span>
      </div>
      <div class="scale-wrap">
        <div class="scale-bar">
          <div class="scale-pointer" id="ptr" style="border-color:${info.color};left:0%;box-shadow:0 0 8px ${info.color}"></div>
        </div>
        <div class="scale-labels"><span>0 Good</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span></div>
      </div>
      <div><span class="source-badge">⚡ ${source.join(' + ')}</span></div>
    </div>
    ${metricCards ? `<div class="grid-3">${metricCards}</div>` : ''}
  `;
  setTimeout(() => {
    const ptr = document.getElementById('ptr');
    if (ptr) ptr.style.left = info.pct + '%';
    document.querySelectorAll('.metric-bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }, 80);
}

// ── HEALTH PAGE ───────────────────────────────────────────────────────────────
function updateHealthPage(d) {
  const { aqi, city } = d;
  const info = getAqiInfo(aqi);

  // City tag
  const cityTag = document.getElementById('healthCityTag');
  cityTag.style.display = 'inline-flex';
  document.getElementById('healthCityName').textContent = city.split(',')[0];
  document.getElementById('healthAqiTag').textContent = Math.round(aqi);

  // AQI bar
  const bar = document.getElementById('healthAqiBar');
  bar.style.display = 'flex';
  bar.style.borderLeft = `4px solid ${info.color}`;
  const bigNum = document.getElementById('healthBigNum');
  bigNum.innerHTML = `<span style="font-size:2rem;margin-right:6px">${info.headerEmoji}</span>${Math.round(aqi)}`;
  bigNum.style.color = info.color;
  document.getElementById('healthLabel').textContent = info.label;
  document.getElementById('healthLabel').style.color = info.color;
  document.getElementById('healthDesc').textContent = info.desc;

  // Alert banner
  const alertBanner = document.getElementById('alertBanner');
  if (aqi > 100) {
    alertBanner.classList.add('visible');
    alertBanner.style.background = `color-mix(in srgb, ${info.color} 8%, rgba(5,20,3,0.6))`;
    alertBanner.style.borderColor = info.color;
    alertBanner.style.color = info.color;
    const msg = aqi > 300 ? `🚨 HAZARDOUS: Public health emergency. Do not go outdoors under any circumstance.`
      : aqi > 200 ? `☠️ Very Unhealthy: Health alert — everyone should avoid all outdoor activity.`
      : aqi > 150 ? `🚨 Unhealthy: Everyone may feel health effects. Sensitive groups must stay indoors.`
      : `⚠️ Moderate-Sensitive: Children and elderly should limit outdoor time.`;
    alertBanner.textContent = msg;
  } else {
    alertBanner.classList.remove('visible');
  }

  // Precaution cards with animated emojis
  renderPrecautionCards(info);
}

function renderPrecautionCards(info) {
  const grid = document.getElementById('precautionGrid');
  grid.innerHTML = info.advice.map((a, i) => `
    <div class="precaution-card" style="animation-delay:${i*0.08}s">
      <div class="precaution-icon" style="background:${a.bg}; border: 1px solid ${a.bg.replace('0.13','0.3')}">${a.icon}</div>
      <div class="precaution-text">
        <h4>${a.title}</h4>
        <p>${a.text}</p>
      </div>
    </div>
  `).join('');
}

// Populate health page with default content if no search done
(function initHealthPage() {
  const generalAdvice = [
    { icon:'📅', bg:'rgba(74,222,128,0.12)', title:'Check AQI daily', text:'Make it a habit to check air quality before heading outdoors each morning.' },
    { icon:'💧', bg:'rgba(74,222,128,0.12)', title:'Stay hydrated', text:'Drinking enough water helps your body flush out airborne toxins.' },
    { icon:'🌿', bg:'rgba(74,222,128,0.12)', title:'Indoor plants help', text:'Plants like peace lily, spider plant, and aloe vera improve indoor air quality.' },
    { icon:'💨', bg:'rgba(74,222,128,0.12)', title:'Use air purifiers', text:'A HEPA air purifier significantly reduces PM2.5 and other particulates indoors.' },
    { icon:'🌅', bg:'rgba(74,222,128,0.12)', title:'Ventilate smartly', text:'Open windows in the early morning when pollution tends to be lower.' },
    { icon:'🏃', bg:'rgba(74,222,128,0.12)', title:'Exercise timing matters', text:'Exercise outdoors when AQI is below 100 and avoid peak traffic hours.' },
  ];
  const grid = document.getElementById('precautionGrid');
  grid.innerHTML = generalAdvice.map((a, i) => `
    <div class="precaution-card" style="animation-delay:${i*0.08}s">
      <div class="precaution-icon" style="background:${a.bg}; border:1px solid rgba(74,222,128,0.25)">${a.icon}</div>
      <div class="precaution-text">
        <h4>${a.title}</h4>
        <p>${a.text}</p>
      </div>
    </div>
  `).join('');
})();
