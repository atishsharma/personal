// js/data-loader.js
const DataLoader = {
  data: {
    geomapIndex: {},
    geomapFeatures: [],
    loadedChunks: new Set(),
    countries: [],
    geopolitics: {},
    passport: {},
    profiles: {},
    flags: {},
    passportCovers: {}
  },

  async loadAll() {
    try {
      const optionalJson = async (url, fallback) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return fallback;
          return await res.json();
        } catch {
          return fallback;
        }
      };

      const v = Date.now();
      const [geomapIndexRes, countriesRes, geopoliticsRes, passportRes, profilesRes] = await Promise.all([
        fetch('data/geomap_index.json?v=' + v),
        fetch('data/countries.json?v=' + v),
        fetch('data/geopolitics.json?v=' + v),
        fetch('data/passport-rank.json?v=' + v),
        fetch('data/country-profiles.json?v=' + v)
      ]);

      this.data.geomapIndex = await geomapIndexRes.json();
      this.data.countries = await countriesRes.json();
      this.data.geopolitics = await geopoliticsRes.json();
      this.data.passport = await passportRes.json();
      this.data.profiles = await profilesRes.json();

      this.loadAllChunksBackground();
      return true;
    } catch (error) {
      console.error("Error loading datasets:", error);
      return false;
    }
  },

  async fetchWithCache(url) {
    if (!window.caches) return (await fetch(url)).json();
    const cache = await caches.open('geomap-cache-v1');
    const cachedRes = await cache.match(url);
    if (cachedRes) return cachedRes.json();
    const res = await fetch(url);
    if (res.ok) cache.put(url, res.clone());
    return res.json();
  },

  async loadChunkForCountry(id) {
    const chunkFile = this.data.geomapIndex[id];
    if (!chunkFile || this.data.loadedChunks.has(chunkFile)) return;
    
    try {
      const chunkData = await this.fetchWithCache('data/geomap_chunks/' + chunkFile);
      this.data.loadedChunks.add(chunkFile);
      this.data.geomapFeatures.push(...chunkData.features);
      if (typeof MapEngine !== 'undefined' && MapEngine.geoLayer) {
        MapEngine.geoLayer.addData(chunkData.features);
      }
    } catch (e) {
      console.error('Failed to load chunk for', id, e);
    }
  },

  async loadAllChunksBackground() {
    const uniqueChunks = new Set(Object.values(this.data.geomapIndex));
    for (const chunkFile of uniqueChunks) {
      if (!this.data.loadedChunks.has(chunkFile)) {
        try {
          const chunkData = await this.fetchWithCache('data/geomap_chunks/' + chunkFile);
          this.data.loadedChunks.add(chunkFile);
          this.data.geomapFeatures.push(...chunkData.features);
          if (typeof MapEngine !== 'undefined' && MapEngine.geoLayer) {
            MapEngine.geoLayer.addData(chunkData.features);
          }
        } catch (e) {
          console.error("Failed background load", chunkFile, e);
        }
      }
    }
  },

  getCountryProfile(id) { return this.data.profiles[id] || null; },
  getGeopolitics(id) { return this.data.geopolitics[id] || { allies: [], enemies: [], frenemies: [] }; },
  getPassportPower(id) { return this.data.passport[id] || null; },
  getCountryFlag(id) { return this.data.flags[id] || null; },
  getPassportCover(id) { return this.data.passportCovers[id] || null; },
  
  searchCountries(query) {
    if(!query) return [];
    query = query.toLowerCase();
    return this.data.countries.filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));
  }
};
