// js/ui.js
const UI = {
  init() {
    this.bindEvents();
    this.updateLegend('geopolitics');
  },

  bindEvents() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        MapEngine.setMode(e.target.dataset.mode);
      });
    });

    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      const res = DataLoader.searchCountries(q);
      
      if (res.length > 0 && q.length > 0) {
        searchResults.innerHTML = res.map(c => `<div class="search-result-item" data-id="${c.id}">${c.name}</div>`).join('');
        searchResults.style.display = 'block';
      } else {
        searchResults.style.display = 'none';
      }
    });

    searchResults.addEventListener('click', (e) => {
      if (e.target.classList.contains('search-result-item')) {
        const id = e.target.dataset.id;
        MapEngine.selectCountry(id);
        searchResults.style.display = 'none';
        searchInput.value = '';
      }
    });

    // View profile button
    document.getElementById('btn-view-profile').addEventListener('click', (e) => {
      const leftPanel = document.getElementById('left-panel');
      const rightPanel = document.getElementById('right-panel');
      const isMobile = window.innerWidth <= 768;
      const isVisible = !leftPanel.classList.contains('hidden-left');

      if (isVisible) {
        leftPanel.classList.add('hidden-left');
        e.target.style.background = 'var(--accent-blue)';
        e.target.textContent = 'View Country Profile';
        if (isMobile) {
          rightPanel.classList.remove('hidden-right');
        }
      } else {
        leftPanel.classList.remove('hidden-left');
        e.target.style.background = 'var(--accent-green)';
        e.target.textContent = isMobile ? 'Back to Dossier' : 'Close Profile';
        if (isMobile) {
          rightPanel.classList.add('hidden-right');
        }
      }
    });

    // Close panels
    document.getElementById('close-left').addEventListener('click', () => {
      document.getElementById('left-panel').classList.add('hidden-left');
    });
    document.getElementById('close-right').addEventListener('click', () => {
      document.getElementById('right-panel').classList.add('hidden-right');
      document.getElementById('left-panel').classList.add('hidden-left'); // Also close left
      MapEngine.selectedCountryId = null;
      MapEngine.renderLayer();
    });
  },

  updateLegend(mode) {
    const legend = document.getElementById('legend-content');
    if (mode === 'geopolitics') {
      legend.innerHTML = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Allies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Enemies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> Frenemies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Selected</div>
      `;
    } else if (mode === 'passport') {
      legend.innerHTML = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Elite</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Strong</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> Medium</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Weak</div>
      `;
    } else if (mode === 'gdp') {
      legend.innerHTML = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Superpower</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-blue)"></div> Major</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Emerging</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--bg-land)"></div> Developing</div>
      `;
    } else if (mode === 'visa-focus') {
      legend.innerHTML = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Selected</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Visa Free</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> On Arrival</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Required</div>
      `;
    }
  },

  updateCountryProfile(id) {
    const profile = DataLoader.getCountryProfile(id);
    const pass = DataLoader.getPassportPower(id);
    const geo = DataLoader.getGeopolitics(id);

    // Show only right panel by default
    document.getElementById('right-panel').classList.remove('hidden-right');
    // Ensure left panel is hidden initially when clicking a new country
    document.getElementById('left-panel').classList.add('hidden-left');
    
    // Reset toggle button
    const toggleBtn = document.getElementById('btn-view-profile');
    if (toggleBtn) {
        toggleBtn.style.background = 'var(--accent-blue)';
        toggleBtn.textContent = 'View Country Profile';
    }

    document.getElementById('country-title').textContent = id;
    document.getElementById('right-panel-title').textContent = id + ' Dossier';
    // Left Panel - General Stats
    if (profile) {
      document.getElementById('stat-capital').textContent = profile.capital;
      document.getElementById('stat-pop').textContent = (profile.population / 1000000).toFixed(1) + 'M';
      document.getElementById('stat-gdp').textContent = '$' + (profile.gdp_nominal_usd / 1000000000000).toFixed(2) + 'T';
      document.getElementById('stat-area').textContent = profile.area_km2.toLocaleString() + ' km²';
      
      document.getElementById('list-exports').innerHTML = profile.major_exports.map(e => `<div style="margin-bottom:4px">• ${e}</div>`).join('');
      document.getElementById('list-cities').innerHTML = profile.major_cities.map(c => `<div style="margin-bottom:4px"><strong>${c.name}</strong> <span style="color:var(--text-muted); font-size:0.85em">(${(c.population/1000000).toFixed(1)}M)</span></div>`).join('');
    } else {
      document.getElementById('stat-capital').textContent = "N/A";
      document.getElementById('stat-pop').textContent = "N/A";
      document.getElementById('stat-gdp').textContent = "N/A";
      document.getElementById('stat-area').textContent = "N/A";
      document.getElementById('list-exports').innerHTML = "<div class='text-muted'>No data available</div>";
      document.getElementById('list-cities').innerHTML = "<div class='text-muted'>No data available</div>";
    }

    // Right Panel - Passport
    if (pass) {
      document.getElementById('pass-rank').textContent = '#' + pass.rank;
      document.getElementById('pass-free').textContent = pass.visa_free || '--';
      document.getElementById('pass-voa').textContent = pass.visa_on_arrival || '--';
      document.getElementById('pass-req').textContent = pass.visa_required || '--';
    } else {
      document.getElementById('pass-rank').textContent = "N/A";
      document.getElementById('pass-free').textContent = "N/A";
      document.getElementById('pass-voa').textContent = "N/A";
      document.getElementById('pass-req').textContent = "N/A";
    }

    // Links
    document.getElementById('link-wiki').href = `https://en.wikipedia.org/wiki/${encodeURIComponent(id)}`;
    const govLink = document.getElementById('link-gov');
    govLink.href = `https://www.passportindex.org/passport/${id.replace(/ /g, '-').toLowerCase()}/`;
    govLink.textContent = "Visa Rules";

    // Right Panel - Geopolitics
    const createBadge = (name, type) => `<span class="badge ${type}">${name}</span>`;
    
    document.getElementById('geo-allies').innerHTML = geo.allies.length ? geo.allies.map(a => createBadge(a, 'ally')).join('') : '<span class="text-muted text-sm">None documented</span>';
    document.getElementById('geo-enemies').innerHTML = geo.enemies.length ? geo.enemies.map(a => createBadge(a, 'enemy')).join('') : '<span class="text-muted text-sm">None documented</span>';
    document.getElementById('geo-frenemies').innerHTML = geo.frenemies.length ? geo.frenemies.map(a => createBadge(a, 'frenemy')).join('') : '<span class="text-muted text-sm">None documented</span>';
  }
};
