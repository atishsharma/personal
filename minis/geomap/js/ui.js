// js/ui.js
const UI = {
  init() {
    this.bindEvents();
    this.updateLegend('geopolitics');
  },

  bindEvents() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        
        const mode = targetBtn.dataset.mode;
        setTimeout(() => {
          MapEngine.setMode(mode);
        }, 10);
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
    document.getElementById('right-panel-title').textContent = id;

    // Fetch official UN name
    const officialNameDiv = document.getElementById('right-panel-official-name');
    if (officialNameDiv) {
        officialNameDiv.textContent = 'Loading official name...';
        fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(id)}?fullText=true`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0 && data[0].name.official) {
              const officialName = data[0].name.official;
              if (officialName.toLowerCase() === id.toLowerCase() || 
                  (data[0].name.common && officialName.toLowerCase() === data[0].name.common.toLowerCase())) {
                  officialNameDiv.textContent = '';
              } else {
                  officialNameDiv.textContent = officialName;
              }
            } else {
              officialNameDiv.textContent = '';
            }
          }).catch(() => { officialNameDiv.textContent = ''; });
    }
    
    // Left Panel - General Stats
    const flagImg = document.getElementById('country-flag');
    if (flagImg) {
      flagImg.src = 'assets/flags/' + id.replace(/ /g, '_').replace(/\//g, '_') + '.webp';
      flagImg.style.display = 'block';
      flagImg.onerror = () => { flagImg.src = 'assets/flags/noflag.jpg'; flagImg.onerror = null; };
    }

    if (profile) {
      document.getElementById('stat-capital').textContent = profile.capital || 'N/A';
      document.getElementById('stat-pop').textContent = (profile.population / 1000000).toFixed(1) + 'M';
      document.getElementById('stat-pop-density').textContent = profile.population_density ? profile.population_density + ' /km²' : '--';
      
      if (profile.gdp_nominal_usd) {
          document.getElementById('stat-gdp').textContent = '$' + (profile.gdp_nominal_usd / 1000000000000).toFixed(2) + 'T';
      } else {
          document.getElementById('stat-gdp').textContent = 'N/A';
      }
      
      if (profile.gdp_per_capita_usd) {
          document.getElementById('stat-gdp-per-capita').textContent = '$' + profile.gdp_per_capita_usd.toLocaleString() + ' per capita';
      } else {
          document.getElementById('stat-gdp-per-capita').textContent = '--';
      }
      
      document.getElementById('stat-area').textContent = profile.area_km2 ? profile.area_km2.toLocaleString() + ' km²' : 'N/A';
      
      document.getElementById('stat-currency').textContent = profile.currency || 'N/A';
      document.getElementById('stat-region').textContent = (profile.region || 'N/A') + (profile.subregion ? ' / ' + profile.subregion : '');
      document.getElementById('stat-languages').textContent = (profile.languages && profile.languages.length > 0) ? profile.languages.join(', ') : 'N/A';
      
      let callingTld = [];
      if (profile.calling_code) callingTld.push(profile.calling_code);
      if (profile.internet_tld) callingTld.push(profile.internet_tld);
      if (profile.timezones && profile.timezones.length > 0) callingTld.push(profile.timezones[0] + (profile.timezones.length > 1 ? ' +' : ''));
      document.getElementById('stat-calling-tld').textContent = callingTld.length > 0 ? callingTld.join(' | ') : 'N/A';
      
      document.getElementById('list-exports').innerHTML = (profile.major_exports && profile.major_exports.length > 0) ? profile.major_exports.map(e => `<div style="margin-bottom:4px">• ${e}</div>`).join('') : "<div class='text-muted'>No data available</div>";
      document.getElementById('list-cities').innerHTML = (profile.major_cities && profile.major_cities.length > 0) ? profile.major_cities.map(c => `<div style="margin-bottom:4px"><strong>${c.name}</strong> <span style="color:var(--text-muted); font-size:0.85em">(${(c.population/1000000).toFixed(1)}M)</span></div>`).join('') : "<div class='text-muted'>No data available</div>";
    } else {
      document.getElementById('stat-capital').textContent = "N/A";
      document.getElementById('stat-pop').textContent = "N/A";
      document.getElementById('stat-pop-density').textContent = "--";
      document.getElementById('stat-gdp').textContent = "N/A";
      document.getElementById('stat-gdp-per-capita').textContent = "--";
      document.getElementById('stat-area').textContent = "N/A";
      document.getElementById('stat-currency').textContent = "N/A";
      document.getElementById('stat-region').textContent = "N/A";
      document.getElementById('stat-languages').textContent = "N/A";
      document.getElementById('stat-calling-tld').textContent = "N/A";
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

    const passCoverImg = document.getElementById('pass-cover');
    if (profile && profile.internet_tld) {
      let alpha2 = typeof profile.internet_tld === 'string' ? profile.internet_tld : profile.internet_tld[0];
      if (alpha2) {
         alpha2 = alpha2.replace('.', '').toLowerCase();
         passCoverImg.src = `assets/passpics/${alpha2}.png`;
      } else {
         passCoverImg.src = 'assets/passpics/nopassport.jpg';
      }
    } else {
      passCoverImg.src = 'assets/passpics/nopassport.jpg';
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
