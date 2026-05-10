// js/ui.js
const UI = {
  init() {
    this.checkAutoTheme();
    this.bindEvents();
    this.updateLegend('geopolitics');
  },

  checkAutoTheme() {
    // Typical Chandigarh sunrise/sunset (approx 6 AM to 7 PM)
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 19;
    if (isDay) {
      document.body.classList.add('light-theme');
      document.getElementById('theme-toggle').textContent = '🌙';
      // MapEngine.init is usually called after UI.init in app.js
      // So we might need to handle the initial theme in MapEngine.init
    } else {
      document.body.classList.remove('light-theme');
      document.getElementById('theme-toggle').textContent = '☀️';
    }
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
      const lp = document.getElementById('left-panel');
      lp.classList.add('hidden-left');
      lp.classList.remove('fullscreen');
      const toggleBtn = document.getElementById('btn-view-profile');
      if (toggleBtn) {
        toggleBtn.style.background = 'var(--accent-blue)';
        toggleBtn.textContent = 'View Country Profile';
      }
    });
    document.getElementById('close-right').addEventListener('click', () => {
      const rp = document.getElementById('right-panel');
      const lp = document.getElementById('left-panel');
      rp.classList.add('hidden-right');
      rp.classList.remove('fullscreen');
      lp.classList.add('hidden-left');
      lp.classList.remove('fullscreen');
      MapEngine.selectedCountryId = null;
      // Reset to geopolitics mode
      MapEngine.setMode('geopolitics');
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      const geoBtn = document.querySelector('.mode-btn[data-mode="geopolitics"]');
      if (geoBtn) geoBtn.classList.add('active');
    });

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        themeBtn.textContent = isLight ? '🌙' : '☀️';
        MapEngine.updateTheme(isLight);
      });
    }

    // Mobile back button
    document.getElementById('back-to-right').addEventListener('click', () => {
      document.getElementById('left-panel').classList.add('hidden-left');
      document.getElementById('right-panel').classList.remove('hidden-right');
      const toggleBtn = document.getElementById('btn-view-profile');
      if (toggleBtn) {
        toggleBtn.style.background = 'var(--accent-blue)';
        toggleBtn.textContent = 'View Country Profile';
      }
    });

    // Compare button — toggle inline section in right panel
    document.getElementById('btn-compare').addEventListener('click', () => {
      if (!MapEngine.selectedCountryId) return;
      const section = document.getElementById('compare-section');
      const isVisible = section.style.display !== 'none';
      if (isVisible) {
        section.style.display = 'none';
      } else {
        section.style.display = 'block';
        const select = document.getElementById('compare-select');
        select.innerHTML = '<option value="">-- Select a country --</option>';
        
        // Sort countries A-Z
        const sorted = [...DataLoader.data.countries].sort((a, b) => a.name.localeCompare(b.name));
        
        sorted.forEach(c => {
          if (c.id !== MapEngine.selectedCountryId) {
            select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
          }
        });
        document.getElementById('btn-open-compare').style.display = 'none';
        
        // Auto-scroll to show the dropdown
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
    document.getElementById('compare-select').addEventListener('change', (e) => {
      const btn = document.getElementById('btn-open-compare');
      btn.style.display = e.target.value ? 'block' : 'none';
    });
    document.getElementById('btn-open-compare').addEventListener('click', () => {
      const idB = document.getElementById('compare-select').value;
      if (!idB || !MapEngine.selectedCountryId) return;
      
      // Hide panels with classes (animations)
      document.getElementById('left-panel').classList.add('hidden-left');
      document.getElementById('right-panel').classList.add('hidden-right');
      
      // Delay display:none to allow transition? No, user wants them CLOSED now.
      // We'll just trust the classes + overlay blocking for now.
      
      // Show overlay
      this.renderComparison(MapEngine.selectedCountryId, idB);
      const overlay = document.getElementById('compare-overlay');
      overlay.classList.remove('compare-overlay-hidden');
      overlay.classList.add('compare-overlay-visible');
    });
    
    // Use event delegation on the overlay so tabs always work
    document.getElementById('compare-overlay').addEventListener('click', (e) => {
      const tab = e.target.closest('.compare-tab');
      if (tab) {
        document.querySelectorAll('.compare-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        if (this._compareTabs && this._compareTabs[tabName]) {
          document.getElementById('compare-table').innerHTML = this._compareRenderGrid(this._compareTabs[tabName]);
        }
      }
    });
  },

  closeCompare() {
    const overlay = document.getElementById('compare-overlay');
    overlay.classList.remove('compare-overlay-visible');
    overlay.classList.add('compare-overlay-hidden');
    
    // Restore right panel (Dossier)
    document.getElementById('right-panel').classList.remove('hidden-right');
  },

  updateLegend(mode) {
    const legend = document.getElementById('legend-content');
    const mobileLegend = document.getElementById('legend-mobile');
    let html = '';
    if (mode === 'geopolitics') {
      html = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Allies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Enemies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> Frenemies</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Selected</div>
      `;
    } else if (mode === 'passport') {
      html = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Elite</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Strong</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> Medium</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Weak</div>
      `;
    } else if (mode === 'gdp') {
      html = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Superpower</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-blue)"></div> Major</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Emerging</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Developing</div>
      `;
    } else if (mode === 'visa-focus') {
      html = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Selected</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-green)"></div> Visa Free</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-orange)"></div> On Arrival</div>
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-red)"></div> Required</div>
      `;
    } else if (mode === 'border-focus') {
      html = `
        <div style="display:flex; align-items:center; gap:4px;"><div class="legend-color" style="width:10px; height:10px; background:var(--accent-cyan)"></div> Selected Country</div>
      `;
    }
    legend.innerHTML = html;
    if (mobileLegend) mobileLegend.innerHTML = html;
  },

  updateCountryProfile(id) {
    const profile = DataLoader.getCountryProfile(id);
    const pass = DataLoader.getPassportPower(id);
    const geo = DataLoader.getGeopolitics(id);

    // Reset compare section
    const compareSection = document.getElementById('compare-section');
    if (compareSection) compareSection.style.display = 'none';

    // Show right panel
    document.getElementById('right-panel').classList.remove('hidden-right');
    const isMobile = window.innerWidth <= 768;
    const leftPanel = document.getElementById('left-panel');
    const leftWasOpen = !leftPanel.classList.contains('hidden-left');
    
    // On desktop: keep left panel open if it was already open
    // On mobile: always hide left panel when selecting a new country
    if (isMobile) {
      leftPanel.classList.add('hidden-left');
    }
    
    // Only reset toggle button if left panel is hidden
    const toggleBtn = document.getElementById('btn-view-profile');
    if (leftPanel.classList.contains('hidden-left')) {
      if (toggleBtn) {
        toggleBtn.style.background = 'var(--accent-blue)';
        toggleBtn.textContent = 'View Country Profile';
      }
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
      
      if (profile.population) {
          let pop = profile.population;
          if (pop >= 1e9) {
              document.getElementById('stat-pop').textContent = (pop / 1e9).toFixed(2) + 'B';
          } else if (pop >= 1e6) {
              document.getElementById('stat-pop').textContent = (pop / 1e6).toFixed(2) + 'M';
          } else if (pop >= 1e3) {
              document.getElementById('stat-pop').textContent = (pop / 1e3).toFixed(1) + 'K';
          } else {
              document.getElementById('stat-pop').textContent = pop.toLocaleString();
          }
      } else {
          document.getElementById('stat-pop').textContent = 'N/A';
      }
      
      document.getElementById('stat-pop-density').textContent = profile.population_density ? profile.population_density + ' /km²' : '--';
      
      if (profile.gdp_nominal_usd) {
          let gdp = profile.gdp_nominal_usd;
          if (gdp >= 1e12) {
              document.getElementById('stat-gdp').textContent = '$' + (gdp / 1e12).toFixed(2) + 'T';
          } else if (gdp >= 1e9) {
              document.getElementById('stat-gdp').textContent = '$' + (gdp / 1e9).toFixed(2) + 'B';
          } else if (gdp >= 1e6) {
              document.getElementById('stat-gdp').textContent = '$' + (gdp / 1e6).toFixed(2) + 'M';
          } else {
              document.getElementById('stat-gdp').textContent = '$' + gdp.toLocaleString();
          }
      } else {
          document.getElementById('stat-gdp').textContent = 'N/A';
      }

      if (profile.gdp_ppp_usd) {
          let gdp = profile.gdp_ppp_usd;
          if (gdp >= 1e12) {
              document.getElementById('stat-gdp-ppp').textContent = '$' + (gdp / 1e12).toFixed(2) + 'T';
          } else if (gdp >= 1e9) {
              document.getElementById('stat-gdp-ppp').textContent = '$' + (gdp / 1e9).toFixed(2) + 'B';
          } else if (gdp >= 1e6) {
              document.getElementById('stat-gdp-ppp').textContent = '$' + (gdp / 1e6).toFixed(2) + 'M';
          } else {
              document.getElementById('stat-gdp-ppp').textContent = '$' + gdp.toLocaleString();
          }
      } else {
          document.getElementById('stat-gdp-ppp').textContent = 'N/A';
      }
      
      document.getElementById('stat-area').textContent = profile.area_km2 ? profile.area_km2.toLocaleString() + ' km²' : 'N/A';
      document.getElementById('stat-currency').textContent = profile.currency || 'N/A';
      
      let cInfoFull = DataLoader.data.countries.find(c => c.id === id) || {};
      let regionStr = cInfoFull.region || profile.region || 'N/A';
      let subregionStr = profile.subregion ? ' / ' + profile.subregion : '';
      document.getElementById('stat-region').textContent = regionStr + subregionStr;
      
      let unStatus = cInfoFull.unStatus || 'N/A';
      let unElem = document.getElementById('stat-un-status');
      unElem.textContent = unStatus;
      if (unStatus === 'UN Member State') unElem.style.color = 'var(--accent-green)';
      else if (unStatus === 'UN Observer State') unElem.style.color = 'var(--accent-blue)';
      else if (unStatus === 'Non-UN Member') unElem.style.color = 'var(--accent-red)';
      else unElem.style.color = '';
      
      document.getElementById('stat-gov').textContent = profile.government_type || 'N/A';
      document.getElementById('stat-head').textContent = profile.head_of_state || 'N/A';
      
      let hdiVal = profile.hdi;
      let hdiElem = document.getElementById('stat-hdi');
      if (hdiVal) {
          hdiElem.textContent = hdiVal.toFixed(3);
          if (hdiVal >= 0.8) {
              hdiElem.style.color = 'var(--accent-green)';
          } else if (hdiVal >= 0.7) {
              hdiElem.style.color = 'var(--accent-orange)';
          } else {
              hdiElem.style.color = 'var(--accent-red)';
          }
      } else {
          hdiElem.textContent = 'N/A';
          hdiElem.style.color = '';
      }
      
      document.getElementById('stat-military').textContent = profile.military_spending ? '$' + (profile.military_spending / 1e9).toFixed(2) + 'B' : 'N/A';
      
      document.getElementById('stat-languages').textContent = (profile.languages && profile.languages.length > 0) ? profile.languages.join(', ') : 'N/A';
      
      let callingTld = [];
      if (profile.calling_code) callingTld.push(profile.calling_code);
      if (profile.internet_tld) callingTld.push(profile.internet_tld);
      if (profile.timezones && profile.timezones.length > 0) callingTld.push(profile.timezones[0] + (profile.timezones.length > 1 ? ' +' : ''));
      document.getElementById('stat-calling-tld').textContent = callingTld.length > 0 ? callingTld.join(' | ') : 'N/A';
      
      document.getElementById('list-exports').innerHTML = (profile.major_exports && profile.major_exports.length > 0) ? profile.major_exports.map(e => `<div style="margin-bottom:4px">• ${e}</div>`).join('') : "<div class='text-muted'>No data available</div>";
      document.getElementById('list-imports').innerHTML = (profile.major_imports && profile.major_imports.length > 0) ? profile.major_imports.map(e => `<div style="margin-bottom:4px">• ${e}</div>`).join('') : "<div class='text-muted'>No data available</div>";
      document.getElementById('list-industries').innerHTML = (profile.largest_industries && profile.largest_industries.length > 0) ? profile.largest_industries.map(e => `<span style="display:inline-block; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin:2px;">${e}</span>`).join('') : "<div class='text-muted'>No data available</div>";
      document.getElementById('list-cities').innerHTML = (profile.major_cities && profile.major_cities.length > 0) ? profile.major_cities.map(c => `<div style="margin-bottom:4px"><strong>${c.name}</strong> <span style="color:var(--text-muted); font-size:0.85em">(${(c.population/1000000).toFixed(1)}M)</span></div>`).join('') : "<div class='text-muted'>No data available</div>";
      document.getElementById('list-neighbors').innerHTML = (profile.neighboring_countries && profile.neighboring_countries.length > 0) ? profile.neighboring_countries.map(e => `<span style="display:inline-block; background:rgba(16,185,129,0.1); color:var(--accent-green); padding:2px 6px; border-radius:4px; margin:2px;">${e}</span>`).join('') : "<div class='text-muted'>None (Island)</div>";
    } else {
      document.getElementById('stat-capital').textContent = "N/A";
      document.getElementById('stat-pop').textContent = "N/A";
      document.getElementById('stat-pop-density').textContent = "--";
      document.getElementById('stat-gdp').textContent = "N/A";
      document.getElementById('stat-gdp-ppp').textContent = "N/A";

      document.getElementById('stat-area').textContent = "N/A";
      document.getElementById('stat-currency').textContent = "N/A";
      document.getElementById('stat-region').textContent = "N/A";
      document.getElementById('stat-un-status').textContent = "N/A";
      document.getElementById('stat-gov').textContent = "N/A";
      document.getElementById('stat-head').textContent = "N/A";
      document.getElementById('stat-hdi').textContent = "N/A";
      document.getElementById('stat-military').textContent = "N/A";
      document.getElementById('stat-languages').textContent = "N/A";
      document.getElementById('stat-calling-tld').textContent = "N/A";
      document.getElementById('list-exports').innerHTML = "<div class='text-muted'>No data available</div>";
      document.getElementById('list-imports').innerHTML = "<div class='text-muted'>No data available</div>";
      document.getElementById('list-industries').innerHTML = "<div class='text-muted'>No data available</div>";
      document.getElementById('list-cities').innerHTML = "<div class='text-muted'>No data available</div>";
      document.getElementById('list-neighbors').innerHTML = "<div class='text-muted'>No data available</div>";
    }

    // Right Panel - Passport
    if (pass) {
      document.getElementById('pass-rank').textContent = '#' + pass.rank;
      document.getElementById('pass-voa').textContent = pass.visa_on_arrival || '0';
      document.getElementById('pass-evisa').textContent = pass.e_visa || '0';
      document.getElementById('pass-free').textContent = pass.visa_free || '--';
      document.getElementById('pass-req').textContent = pass.visa_required || '--';
    } else {
      document.getElementById('pass-rank').textContent = "N/A";
      document.getElementById('pass-voa').textContent = "N/A";
      document.getElementById('pass-evisa').textContent = "N/A";
      document.getElementById('pass-free').textContent = "N/A";
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
    
    // We kept govLink for Foreign Office/Visa Rules. The user's index.html says "Foreign Office" but this script changed it to Visa Rules. Let's keep Visa Rules for govLink and add the new one.
    const govLink = document.getElementById('link-gov');
    govLink.href = `https://www.passportindex.org/passport/${id.replace(/ /g, '-').toLowerCase()}/`;
    govLink.textContent = "Visa Check";
    
    // External affairs google search link
    const extAffairsLink = document.getElementById('link-external-affairs');
    if (extAffairsLink) {
        extAffairsLink.href = `https://www.google.com/search?q=Ministry+of+Foreign+Affairs+${encodeURIComponent(id)}+Official+Website`;
    }

    // Right Panel - Geopolitics
    const createBadge = (name, type) => `<span class="badge ${type}">${name}</span>`;
    
    document.getElementById('geo-allies').innerHTML = geo.allies.length ? geo.allies.map(a => createBadge(a, 'ally')).join('') : '<span class="text-muted text-sm">None documented</span>';
    document.getElementById('geo-enemies').innerHTML = geo.enemies.length ? geo.enemies.map(a => createBadge(a, 'enemy')).join('') : '<span class="text-muted text-sm">None documented</span>';
    document.getElementById('geo-frenemies').innerHTML = geo.frenemies.length ? geo.frenemies.map(a => createBadge(a, 'frenemy')).join('') : '<span class="text-muted text-sm">None documented</span>';
  },

  renderComparison(idA, idB) {
    const pA = DataLoader.getCountryProfile(idA) || {};
    const pB = DataLoader.getCountryProfile(idB) || {};
    const passA = DataLoader.getPassportPower(idA) || {};
    const passB = DataLoader.getPassportPower(idB) || {};
    const cA = DataLoader.data.countries.find(c => c.id === idA) || {};
    const cB = DataLoader.data.countries.find(c => c.id === idB) || {};

    const fmt = (v) => { if (v == null) return 'N/A'; return v; };
    const fmtNum = (v) => {
      if (v == null) return 'N/A';
      if (v >= 1e12) return '$' + (v/1e12).toFixed(2) + 'T';
      if (v >= 1e9) return '$' + (v/1e9).toFixed(2) + 'B';
      if (v >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
      return '$' + v.toLocaleString();
    };
    const fmtPop = (v) => {
      if (v == null) return 'N/A';
      if (v >= 1e9) return (v/1e9).toFixed(2) + 'B';
      if (v >= 1e6) return (v/1e6).toFixed(2) + 'M';
      return v.toLocaleString();
    };

    const higherBetter = ['population','gdp_nominal_usd','gdp_ppp_usd','area_km2','hdi','visa_free','voa','evisa','military'];
    const lowerBetter = ['visa_required','rank'];

    const arrow = (a, b, field) => {
      if (a == null || b == null || a === 'N/A' || b === 'N/A') return ['',''];
      const na = parseFloat(a), nb = parseFloat(b);
      if (isNaN(na) || isNaN(nb) || na === nb) return ['',''];
      if (higherBetter.includes(field)) {
        return na > nb ? ['<span class="arrow-up">▲</span>','<span class="arrow-down">▼</span>'] : ['<span class="arrow-down">▼</span>','<span class="arrow-up">▲</span>'];
      }
      if (lowerBetter.includes(field)) {
        return na < nb ? ['<span class="arrow-up">▲</span>','<span class="arrow-down">▼</span>'] : ['<span class="arrow-down">▼</span>','<span class="arrow-up">▲</span>'];
      }
      return ['',''];
    };

    const regionA = cA.region || pA.region || 'N/A';
    const regionB = cB.region || pB.region || 'N/A';

    const tabs = {
      'Overview': [
        ['Capital', fmt(pA.capital), fmt(pB.capital), '', null, null],
        ['Population', fmtPop(pA.population), fmtPop(pB.population), 'population', pA.population, pB.population],
        ['Area', pA.area_km2 ? pA.area_km2.toLocaleString()+' km²' : 'N/A', pB.area_km2 ? pB.area_km2.toLocaleString()+' km²' : 'N/A', 'area_km2', pA.area_km2, pB.area_km2],
        ['HDI', pA.hdi ? pA.hdi.toFixed(3) : 'N/A', pB.hdi ? pB.hdi.toFixed(3) : 'N/A', 'hdi', pA.hdi, pB.hdi],
        ['Government', fmt(pA.government_type), fmt(pB.government_type), '', null, null],
        ['Head of State', fmt(pA.head_of_state), fmt(pB.head_of_state), '', null, null],
        ['Region', regionA, regionB, '', null, null],
        ['UN Status', fmt(cA.unStatus), fmt(cB.unStatus), '', null, null],
      ],
      'Economy': [
        ['GDP (Nominal)', fmtNum(pA.gdp_nominal_usd), fmtNum(pB.gdp_nominal_usd), 'gdp_nominal_usd', pA.gdp_nominal_usd, pB.gdp_nominal_usd],
        ['GDP (PPP)', fmtNum(pA.gdp_ppp_usd), fmtNum(pB.gdp_ppp_usd), 'gdp_ppp_usd', pA.gdp_ppp_usd, pB.gdp_ppp_usd],
        ['Currency', fmt(pA.currency), fmt(pB.currency), '', null, null],
        ['Military $', pA.military_spending ? '$'+(pA.military_spending/1e9).toFixed(2)+'B' : 'N/A', pB.military_spending ? '$'+(pB.military_spending/1e9).toFixed(2)+'B' : 'N/A', 'military', pA.military_spending, pB.military_spending],
        ['Languages', (pA.languages||[]).join(', ')||'N/A', (pB.languages||[]).join(', ')||'N/A', '', null, null],
      ],
      'Passport': [
        ['Global Rank', passA.rank != null ? '#'+passA.rank : 'N/A', passB.rank != null ? '#'+passB.rank : 'N/A', 'rank', passA.rank, passB.rank],
        ['Visa Free', fmt(passA.visa_free), fmt(passB.visa_free), 'visa_free', passA.visa_free, passB.visa_free],
        ['Visa Required', fmt(passA.visa_required), fmt(passB.visa_required), 'visa_required', passA.visa_required, passB.visa_required],
        ['Visa on Arrival', fmt(passA.visa_on_arrival), fmt(passB.visa_on_arrival), 'voa', passA.visa_on_arrival, passB.visa_on_arrival],
        ['e-Visa', fmt(passA.e_visa), fmt(passB.e_visa), 'evisa', passA.e_visa, passB.e_visa],
      ],
    };

    // Real-time Exchange Rate Fetch (JSDelivr Currency API - No Key/Limits)
    const getCode = (c) => {
        const m = (c || "").match(/\(([A-Z]{3})\)/);
        return m ? m[1] : null;
    };
    const codeA = getCode(pA.currency);
    const codeB = getCode(pB.currency);

    if (codeA && codeB) {
        if (codeA === codeB) {
            tabs['Economy'].push(['Live FX Rate', `1 ${codeA}`, `1.0000 ${codeB}`, 'exchange', null, null]);
        } else {
            tabs['Economy'].push(['Live FX Rate', `1 ${codeA}`, 'Fetching...', 'exchange', null, null]);
            const from = codeA.toLowerCase();
            const to = codeB.toLowerCase();
            
            fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`)
                .then(r => {
                    if (!r.ok) throw new Error("API Error");
                    return r.json();
                })
                .then(data => {
                    if (data[from] && data[from][to]) {
                        const rate = data[from][to];
                        const date = data.date || 'Recent';
                        const row = tabs['Economy'].find(r => r[0] === 'Live FX Rate');
                        if (row) {
                            row[1] = `1 ${codeA}`;
                            row[2] = `${rate.toFixed(4)} ${codeB} (${date})`;
                            const activeTab = document.querySelector('.compare-tab.active');
                            if (activeTab && activeTab.dataset.tab === 'Economy') {
                                document.getElementById('compare-table').innerHTML = this._compareRenderGrid(tabs['Economy']);
                            }
                        }
                    }
                })
                .catch(() => {
                    const row = tabs['Economy'].find(r => r[0] === 'Live FX Rate');
                    if (row) {
                        row[1] = `1 ${codeA}`;
                        row[2] = `N/A (Rate Offline)`;
                    }
                });
        }
    }

    // Store on UI object for event delegation
    this._compareTabs = tabs;
    this._compareRenderGrid = (rows) => {
      let g = '<div class="compare-grid">';
      g += `<div class="compare-cell header">Metric</div><div class="compare-cell header">${idA}</div><div class="compare-cell header">${idB}</div>`;
      for (const [label, vA, vB, field, rawA, rawB] of rows) {
        const [arA, arB] = arrow(rawA, rawB, field);
        g += `<div class="compare-cell label">${label}</div><div class="compare-cell">${arA} ${vA}</div><div class="compare-cell">${arB} ${vB}</div>`;
      }
      g += '</div>';
      return g;
    };

    // Render tabs
    const tabNames = Object.keys(tabs);
    let tabsHtml = '';
    tabNames.forEach((name, i) => {
      tabsHtml += `<button class="compare-tab${i === 0 ? ' active' : ''}" data-tab="${name}">${name}</button>`;
    });
    document.getElementById('compare-tabs').innerHTML = tabsHtml;

    // Show first tab
    document.getElementById('compare-table').innerHTML = this._compareRenderGrid(tabs[tabNames[0]]);
  }
};
