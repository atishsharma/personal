// js/data-loader.js
const DataLoader = {
  data: {
    geomapFeatures: [],
    countries: [],
    geopolitics: {},
    passport: {},
    profiles: {}
  },

  async loadAll() {
    try {
      const v = Date.now();
      const [amchartsRes, countriesRes, geopoliticsRes, passportRes, profilesRes] = await Promise.all([
        fetch('data/amcharts_worldIndiaHigh.json?v=' + v),
        fetch('data/countries.json?v=' + v),
        fetch('data/geopolitics.json?v=' + v),
        fetch('data/passport-rank.json?v=' + v),
        fetch('data/country-profiles.json?v=' + v)
      ]);

      const rawGeo = await amchartsRes.json();
      this.data.countries = await countriesRes.json();
      this.data.geopolitics = await geopoliticsRes.json();
      this.data.passport = await passportRes.json();
      this.data.profiles = await profilesRes.json();

      const nameMap = {
        'Democratic Republic of Congo': 'DR Congo',
        'Republic of Congo': 'Republic of the Congo',
        'Tanzania': 'United Republic of Tanzania',
        'Czech Republic': 'Czechia',
        "C\u00f4te d'Ivoire": 'Ivory Coast',
        'Eswatini': 'eSwatini',
        'Timor-Leste': 'East Timor',
        'Macedonia': 'North Macedonia',
        'Palestinian Territories': 'Palestine',
        'Serbia': 'Republic of Serbia',
        'Vatican City': 'Vatican',
        'T\u00fcrkiye': 'Turkey',
        'Cape Verde': 'Cabo Verde'
      };

      const skipCountries = new Set([
        'Baker Island', 'Howland Island', 'Jarvis Island', 'Johnston Atoll',
        'Midway Islands', 'Wake Island', 'Glorioso Islands', 'Juan De Nova Island',
        'Bouvet Island', 'Gibraltar', 'Bonair, Saint Eustachius and Saba'
      ]);

      const baseFeatures = rawGeo.features
        .filter(f => !skipCountries.has(f.properties.name))
        .map(f => {
          f.properties.name = nameMap[f.properties.name] || f.properties.name;
          return f;
        });

      // Create wrapped clones for seamless 360 scrolling
      const eastClones = JSON.parse(JSON.stringify(baseFeatures)).map(f => {
          this.shiftCoordinates(f.geometry.coordinates, 360);
          return f;
      });
      const westClones = JSON.parse(JSON.stringify(baseFeatures)).map(f => {
          this.shiftCoordinates(f.geometry.coordinates, -360);
          return f;
      });

      this.data.geomapFeatures = [...westClones, ...baseFeatures, ...eastClones];

      return true;
    } catch (error) {
      console.error("Error loading datasets:", error);
      return false;
    }
  },

  shiftCoordinates(coords, shift) {
    if (typeof coords[0] === 'number') {
      coords[0] += shift;
    } else {
      coords.forEach(c => this.shiftCoordinates(c, shift));
    }
  },

  getCountryProfile(id) { return this.data.profiles[id] || null; },
  getGeopolitics(id) { return this.data.geopolitics[id] || { allies: [], enemies: [], frenemies: [] }; },
  getPassportPower(id) { return this.data.passport[id] || null; },
  
  searchCountries(query) {
    if(!query) return [];
    query = query.toLowerCase();
    return this.data.countries.filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));
  }
};
