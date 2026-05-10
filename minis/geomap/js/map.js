// js/map.js
const MapEngine = {
  map: null,
  geoLayer: null,
  currentMode: 'geopolitics', // 'geopolitics', 'passport', 'gdp', 'visa-focus'
  currentVisaFocus: null,
  selectedCountryId: null,

  init() {
    this.map = L.map('map', {
      center: [40, 0],
      zoom: 2,
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]],
      zoomControl: false // We add it manually below
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Dark minimalist basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Atish Geopolitics',
      maxZoom: 17
    }).addTo(this.map);

    this.renderLayer();
  },

  renderLayer() {
    if (this.geoLayer) this.map.removeLayer(this.geoLayer);

    this.geoLayer = L.geoJSON(DataLoader.data.geomap, {
      style: (feature) => this.getFeatureStyle(feature),
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e) => this.handleMouseOver(e),
          mouseout: (e) => this.handleMouseOut(e),
          click: (e) => this.handleClick(e)
        });
        
        // Add tooltip
        layer.bindTooltip(() => this.getTooltipContent(feature.properties.name), {
          className: 'custom-tooltip',
          direction: 'auto',
          sticky: true
        });
      }
    }).addTo(this.map);
  },

  getFeatureStyle(feature) {
    const id = feature.properties.name;
    const isSelected = this.selectedCountryId === id;
    
    let fillColor = 'var(--bg-land)';
    let fillOpacity = 0.8;
    let className = isSelected ? 'blink-path' : '';
    let weight = isSelected ? 3 : 1;
    let color = isSelected ? 'var(--accent-cyan)' : 'var(--border-country)';

    if (this.currentMode === 'geopolitics') {
      if (this.selectedCountryId && !isSelected) {
        const relations = DataLoader.getGeopolitics(this.selectedCountryId);
        if (relations.allies.includes(id)) { fillColor = 'var(--accent-green)'; fillOpacity = 0.7; }
        else if (relations.enemies.includes(id)) { fillColor = 'var(--accent-red)'; fillOpacity = 0.7; }
        else if (relations.frenemies.includes(id)) { fillColor = 'var(--accent-orange)'; fillOpacity = 0.7; }
        else { fillOpacity = 0.2; }
      }
    } else if (this.currentMode === 'passport') {
      const p = DataLoader.getPassportPower(id);
      if (p) {
        if (p.rank <= 10) fillColor = 'var(--accent-cyan)';
        else if (p.rank <= 50) fillColor = 'var(--accent-green)';
        else if (p.rank <= 80) fillColor = 'var(--accent-orange)';
        else fillColor = 'var(--accent-red)';
        fillOpacity = 0.8;
      } else {
        fillOpacity = 0.2;
      }
    } else if (this.currentMode === 'gdp') {
      const profile = DataLoader.getCountryProfile(id);
      if (profile && profile.gdp_nominal_usd) {
        const gdp = profile.gdp_nominal_usd;
        if (gdp > 10000000000000) fillColor = 'var(--accent-cyan)';
        else if (gdp > 2000000000000) fillColor = 'var(--accent-blue)';
        else if (gdp > 500000000000) fillColor = 'var(--accent-green)';
        else fillColor = 'var(--bg-land)';
        fillOpacity = 0.8;
      } else {
        fillOpacity = 0.2;
      }
    } else if (this.currentMode === 'visa-focus') {
      const p = DataLoader.getPassportPower(this.selectedCountryId);
      let highlightList = [];
      let hColor = '';
      if (p) {
        if (this.currentVisaFocus === 'free') { highlightList = p.free_countries || []; hColor = 'var(--accent-green)'; }
        else if (this.currentVisaFocus === 'voa') { highlightList = p.voa_countries || []; hColor = 'var(--accent-orange)'; }
        else if (this.currentVisaFocus === 'req') { highlightList = p.req_countries || []; hColor = 'var(--accent-red)'; }
      }
      
      if (highlightList.includes(id)) {
        fillColor = hColor;
        fillOpacity = 0.8;
      } else {
        fillOpacity = 0.2;
      }
    }

    return { fillColor, fillOpacity, weight, color, className };
  },

  handleMouseOver(e) {
    const layer = e.target;
    layer.setStyle({ fillOpacity: 1, weight: 2, color: 'white' });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  },

  handleMouseOut(e) {
    this.geoLayer.resetStyle(e.target);
  },

  handleClick(e) {
    const id = e.target.feature.properties.name;
    this.selectCountry(id);
  },

  selectCountry(id) {
    this.selectedCountryId = id;
    let targetLayer = null;
    this.geoLayer.eachLayer(layer => {
      if (layer.feature.properties.name === id) {
        targetLayer = layer;
      }
    });
    
    if (targetLayer) {
       this.map.flyToBounds(targetLayer.getBounds(), { padding: [50, 50], duration: 1 });
    }
    this.renderLayer(); // Re-render to update colors based on selection
    UI.updateCountryProfile(id);
  },

  setMode(mode) {
    this.currentMode = mode;
    this.renderLayer();
    UI.updateLegend(mode);
  },

  zoomToSelected() {
    if (!this.selectedCountryId) return;
    let targetLayer = null;
    this.geoLayer.eachLayer(layer => {
      if (layer.feature.properties.name === this.selectedCountryId) {
        targetLayer = layer;
      }
    });
    if (targetLayer) {
       this.map.flyToBounds(targetLayer.getBounds(), { padding: [50, 50], duration: 1.5, maxZoom: 4 });
    }
  },

  highlightVisaCountries(type) {
    if (!this.selectedCountryId) return;
    this.currentMode = 'visa-focus';
    this.currentVisaFocus = type;
    this.renderLayer();
    UI.updateLegend('visa-focus');
    
    // Also reset any active buttons in header
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  },

  getTooltipContent(id) {
    const profile = DataLoader.getCountryProfile(id);
    const pass = DataLoader.getPassportPower(id);
    
    let html = `<strong>${id}</strong>`;
    if (profile) {
      html += `<div>Pop: ${(profile.population / 1000000).toFixed(1)}M</div>`;
      html += `<div>GDP: $${(profile.gdp_nominal_usd / 1000000000000).toFixed(2)}T</div>`;
    } else {
        html += `<div>Data unavailable</div>`;
    }
    if (pass) {
      html += `<div style="margin-top:4px; color: var(--accent-cyan)">Passport Rank: #${pass.rank}</div>`;
    }
    return html;
  }
};
