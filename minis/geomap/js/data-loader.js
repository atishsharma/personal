// js/data-loader.js
const DataLoader = {
  data: {
    geomap: null,
    countries: [],
    geopolitics: {},
    passport: {},
    profiles: {}
  },

  async loadAll() {
    try {
      const [geomapRes, countriesRes, geopoliticsRes, passportRes, profilesRes] = await Promise.all([
        fetch('data/geomap.json'),
        fetch('data/countries.json'),
        fetch('data/geopolitics.json'),
        fetch('data/passport-power.json'),
        fetch('data/country-profiles.json')
      ]);

      this.data.geomap = await geomapRes.json();
      this.data.countries = await countriesRes.json();
      this.data.geopolitics = await geopoliticsRes.json();
      this.data.passport = await passportRes.json();
      this.data.profiles = await profilesRes.json();

      return true;
    } catch (error) {
      console.error("Error loading datasets:", error);
      return false;
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
