// js/map.js
const MapEngine = {
  map: null,
  geoLayer: null,
  baseLayer: null,
  currentTheme: 'dark',
  currentMode: 'geopolitics', // 'geopolitics', 'passport', 'gdp', 'visa-focus', 'border-focus'
  currentVisaFocus: null,
  selectedCountryId: null,

  init() {
    const isMobile = window.innerWidth <= 768;
    this.map = L.map('map', {
      center: [22, 78],
      zoom: isMobile ? 2 : 3,
      minZoom: 2,
      worldCopyJump: false, // Disabled because we now use triple-buffered GeoJSON features for manual seamless panning
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.5,
      renderer: L.canvas()
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.layers = {
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: "&copy; CARTO",
        maxZoom: 17
      }),
      light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: "&copy; CARTO",
        maxZoom: 17
      })
    };

    const isLight = document.body.classList.contains('light-theme');
    this.currentTheme = isLight ? 'light' : 'dark';
    this.baseLayer = this.layers[this.currentTheme].addTo(this.map);

    this.renderLayer();
  },

  updateTheme(isLight) {
    const newTheme = isLight ? 'light' : 'dark';
    if (this.currentTheme === newTheme) return;

    // Remove old base layer and add new one for a cleaner transition
    if (this.baseLayer) this.map.removeLayer(this.baseLayer);
    this.baseLayer = this.layers[newTheme].addTo(this.map);
    
    this.currentTheme = newTheme;
    
    // Redraw the canvas layer
    if (this.geoLayer) {
      this.renderLayer();
    }
  },

  renderLayer() {
    if (!this.geoLayer) {
      this.geoLayer = L.geoJSON(DataLoader.data.geomapFeatures, {
        style: (feature) => this.getFeatureStyle(feature),
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => this.handleMouseOver(e),
            mouseout: (e) => this.handleMouseOut(e),
            click: (e) => this.handleClick(e)
          });
          
          layer.bindTooltip(() => this.getTooltipContent(feature.properties.name), {
            className: 'custom-tooltip',
            direction: 'auto',
            sticky: true
          });
        }
      }).addTo(this.map);
    } else {
      this.geoLayer.setStyle((feature) => this.getFeatureStyle(feature));
      
      // Ensure selected country is on top after style update
      if (this.selectedCountryId) {
        this.geoLayer.eachLayer(layer => {
          if (layer.feature.properties.name === this.selectedCountryId) {
            layer.bringToFront();
          }
        });
      }
    }
  },

  getStyleValue(varName) {
    // Helper to get computed CSS variable values for Canvas renderer
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
  },

  getFeatureStyle(feature) {
    const id = feature.properties.name;
    const isSelected = this.selectedCountryId === id;
    const isLight = this.currentTheme === 'light';
    
    let fillColor = this.getStyleValue('--map-land');
    let fillOpacity = isLight ? 0.9 : 0.8;
    let className = isSelected ? 'blink-path' : '';
    let weight = isSelected ? 3 : (isLight ? 1.5 : 1);
    let color = isSelected ? this.getStyleValue('--accent-cyan') : this.getStyleValue('--map-border');

    if (this.currentMode === 'geopolitics') {
      if (this.selectedCountryId && !isSelected) {
        const relations = DataLoader.getGeopolitics(this.selectedCountryId);
        if (relations.allies.includes(id)) { fillColor = this.getStyleValue('--accent-green'); fillOpacity = 0.7; }
        else if (relations.enemies.includes(id)) { fillColor = this.getStyleValue('--accent-red'); fillOpacity = 0.7; }
        else if (relations.frenemies.includes(id)) { fillColor = this.getStyleValue('--accent-orange'); fillOpacity = 0.7; }
        else { fillOpacity = 0.2; }
      }
    } else if (this.currentMode === 'passport') {
      const p = DataLoader.getPassportPower(id);
      if (p) {
        if (p.rank <= 10) fillColor = this.getStyleValue('--accent-cyan');
        else if (p.rank <= 50) fillColor = this.getStyleValue('--accent-green');
        else if (p.rank <= 80) fillColor = this.getStyleValue('--accent-orange');
        else fillColor = this.getStyleValue('--accent-red');
        fillOpacity = 0.8;
      } else {
        fillOpacity = 0.2;
      }
    } else if (this.currentMode === 'gdp') {
      const profile = DataLoader.getCountryProfile(id);
      if (profile && profile.gdp_nominal_usd) {
        const gdp = profile.gdp_nominal_usd;
        if (gdp > 10000000000000) fillColor = this.getStyleValue('--accent-cyan');
        else if (gdp > 2000000000000) fillColor = this.getStyleValue('--accent-blue');
        else if (gdp > 500000000000) fillColor = this.getStyleValue('--accent-green');
        else { fillColor = this.getStyleValue('--accent-red'); fillOpacity = 0.5; }
        fillOpacity = fillOpacity || 0.8;
      } else {
        fillOpacity = 0.2;
      }
    } else if (this.currentMode === 'visa-focus') {
      const p = DataLoader.getPassportPower(this.selectedCountryId);
      let highlightList = [];
      let hColor = '';
      if (p) {
        if (this.currentVisaFocus === 'free') { highlightList = p.visa_free_list || []; hColor = this.getStyleValue('--accent-green'); }
        else if (this.currentVisaFocus === 'voa') { highlightList = p.visa_on_arrival_list || []; hColor = this.getStyleValue('--accent-orange'); }
        else if (this.currentVisaFocus === 'req') { highlightList = p.visa_required_list || []; hColor = this.getStyleValue('--accent-red'); }
      }
      
      if (highlightList.includes(id)) {
        fillColor = hColor;
        fillOpacity = 0.8;
      } else {
        fillOpacity = 0.2;
      }
    } else if (this.currentMode === 'border-focus') {
      if (isSelected) {
        fillColor = this.getStyleValue('--accent-cyan');
        fillOpacity = 0.8;
      } else {
        fillColor = 'transparent';
        fillOpacity = 0;
        weight = 0;
        color = 'transparent';
      }
    }

    return { fillColor, fillOpacity, weight, color, className };
  },

  handleMouseOver(e) {
    const layer = e.target;
    const isLight = this.currentTheme === 'light';
    const hoverColor = isLight ? '#ff1493' : 'white'; // bright pink for light theme
    layer.setStyle({ fillOpacity: 1, weight: 2, color: hoverColor });
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

  async selectCountry(id) {
    this.selectedCountryId = id;
    
    this.renderLayer(); // Re-render to show update colors
    
    let targetLayer = null;
    if (this.geoLayer) {
        const mapCenter = this.map.getCenter();
        let minDistance = Infinity;
        
        this.geoLayer.eachLayer(layer => {
          if (layer.feature.properties.name === id) {
            const layerCenter = layer.getBounds().getCenter();
            // Use simple horizontal longitude distance for visual proximity
            const dist = Math.abs(mapCenter.lng - layerCenter.lng);
            if (dist < minDistance) {
                minDistance = dist;
                targetLayer = layer;
            }
          }
        });
    }
    
    if (targetLayer) {
       this.map.flyToBounds(targetLayer.getBounds(), { padding: [50, 50], duration: 1 });
    }
    UI.updateCountryProfile(id);
  },

  setMode(mode) {
    this.currentMode = mode;
    this.renderLayer();
    UI.updateLegend(mode);
  },

  zoomToSelected() {
    if (!this.selectedCountryId) return;
    // Switch to border-focus mode
    this.currentMode = 'border-focus';
    this.renderLayer();
    UI.updateLegend('border-focus');
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

    let targetLayer = null;
    const mapCenter = this.map.getCenter();
    let minDistance = Infinity;

    this.geoLayer.eachLayer(layer => {
      if (layer.feature.properties.name === this.selectedCountryId) {
        const layerCenter = layer.getBounds().getCenter();
        const dist = Math.abs(mapCenter.lng - layerCenter.lng);
        if (dist < minDistance) {
            minDistance = dist;
            targetLayer = layer;
        }
      }
    });
    if (targetLayer) {
       this.map.flyToBounds(targetLayer.getBounds(), { padding: [50, 50], duration: 1.5, maxZoom: 5 });
       
       // Hide right panel on mobile to focus on the map
       if (window.innerWidth <= 768) {
         const rightPanel = document.getElementById('right-panel');
         if (rightPanel) rightPanel.classList.add('hidden-right');
       }
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
