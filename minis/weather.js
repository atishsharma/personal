        lucide.createIcons();
        document.querySelectorAll('.settings-year').forEach(el => el.textContent = new Date().getFullYear());

        // Obfuscated API Key Logic
        const _kPart1 = 'NzE2MThkMGE2';
        const _kPart2 = 'YjM0NDUzNDk4';
        const _kPart3 = 'ZjEwNDUzMDI2MDkwNQ==';
        function getBuiltInKey() { return atob(_kPart1 + _kPart2 + _kPart3); }

        // LocalStorage keys and state
        const savedSettings = JSON.parse(localStorage.getItem('atish_weather_v5')) || {};

        const state = {
            // Nullified defaults here to detect first-time visitors
            lat: savedSettings.lat || null, 
            lon: savedSettings.lon || null,
            locationName: savedSettings.locationName || null,
            stateRegion: savedSettings.stateRegion || null, 
            country: savedSettings.country || null, 
            timezone: savedSettings.timezone || null, 
            provider: savedSettings.provider || "open-meteo", 
            apiKey: savedSettings.apiKey || "",
            theme: savedSettings.theme || "light", 
            color: savedSettings.color || "blue", 
            units: savedSettings.units || "metric",
            pinnedCities: savedSettings.pinnedCities || [],
            weatherData: null,
            isLoading: false
        };

        const PROVIDERS = [
            { id: "open-meteo", name: "Open-Meteo (Default)", requiresKey: false },
            { id: "weatherapi", name: "WeatherAPI.com (Premium)", requiresKey: true },
            { id: "openweathermap", name: "OpenWeatherMap (Custom API Key)", requiresKey: true }
        ];

        const els = {
            citySearch: document.getElementById('city-search'),
            searchResults: document.getElementById('search-results'),
            providerSelect: document.getElementById('provider-select'),
            apiKeyInput: document.getElementById('api-key-input'),
            apiHint: document.getElementById('api-hint'),
            unitSelect: document.getElementById('unit-select'),
            countryInput: document.getElementById('country-input'), 
            timezoneInput: document.getElementById('timezone-input'), 
            colorBtns: document.querySelectorAll('.color-btn'),
            locateBtn: document.getElementById('locate-btn'),
            themeBtn: document.getElementById('theme-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            closeSettingsBtn: document.getElementById('close-settings'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            clearDataBtn: document.getElementById('clear-data-btn'),
            settingsModal: document.getElementById('settings-modal'),
            infoModal: document.getElementById('info-modal'),
            closeInfoBtn: document.getElementById('close-info'),
            infoTitle: document.getElementById('info-title'),
            infoContent: document.getElementById('info-content'),
            themeIconWrapper: document.getElementById('theme-icon-wrapper'),
            weatherContainer: document.getElementById('weather-container'),
            loadingState: document.getElementById('loading-state'),
            toast: document.getElementById('toast'),
            toastMsg: document.getElementById('toast-msg'),
            toastIconWrapper: document.getElementById('toast-icon-wrapper'),
            pinnedWrapper: document.getElementById('pinned-wrapper'),
            pinnedContainer: document.getElementById('pinned-cities-container'),
            
            locationName: document.getElementById('location-name'),
            locationRegion: document.getElementById('location-region'), 
            dateTime: document.getElementById('date-time'),
            mainIconWrapper: document.getElementById('main-icon-wrapper'),
            temperature: document.getElementById('temperature'),
            tempUnitLabels: document.querySelectorAll('.temp-unit-label'),
            windUnitLabel: document.getElementById('wind-unit-label'),
            conditionDesc: document.getElementById('condition-desc'),
            feelsLikeInline: document.getElementById('feels-like-inline'),
            currentRainProb: document.getElementById('current-rain-prob'),
            currentCloudCover: document.getElementById('current-cloud-cover'),
            tempHigh: document.getElementById('temp-high'),
            tempLow: document.getElementById('temp-low'),
            humidity: document.getElementById('humidity'),
            humidityDesc: document.getElementById('humidity-desc'),
            windSpeed: document.getElementById('wind-speed'),
            windDir: document.getElementById('wind-dir'),
            pressure: document.getElementById('pressure'),
            uvIndex: document.getElementById('uv-index'),
            uvDesc: document.getElementById('uv-desc'),
            aqi: document.getElementById('aqi'),
            aqiDesc: document.getElementById('aqi-desc'),
            aqiIconWrapper: document.getElementById('aqi-icon-wrapper'),
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            forecastContainer: document.getElementById('forecast-container'),
            // Mobile bottom bar
            mobileBottomBar: document.getElementById('mobile-bottom-bar'),
            headerBar: document.getElementById('header-bar'),
            headerControls: document.getElementById('header-controls'),
            citySearchMobile: document.getElementById('city-search-mobile'),
            searchResultsMobile: document.getElementById('search-results-mobile'),
            locateBtnMobile: document.getElementById('locate-btn-mobile'),
            themeBtnMobile: document.getElementById('theme-btn-mobile'),
            settingsBtnMobile: document.getElementById('settings-btn-mobile'),
            themeIconWrapperMobile: document.getElementById('theme-icon-wrapper-mobile'),
            layoutToggleBtn: document.getElementById('layout-toggle-btn'),
            layoutToggleLabel: document.getElementById('layout-toggle-label'),
            updateSpinner: document.getElementById('update-spinner'),
            updateStatusText: document.getElementById('update-status-text'),
            currentProviderName: document.getElementById('current-provider-name')
        };

        let searchTimeout;
        let pressTimer;
        let isDragging = false;
        let startX = 0;
        let cityToRemoveIndex = -1;
        let autoUpdateInterval;
        let autoUpdateSeconds = 1200;
        let lastUpdateTimeStr = "--:--";

        function updateStatusDisplay() {
            if (els.updateStatusText) {
                els.updateStatusText.textContent = `Updated On (${lastUpdateTimeStr} + ${autoUpdateSeconds}s)`;
            }
        }

        function startAutoUpdateCountdown() {
            clearInterval(autoUpdateInterval);
            autoUpdateSeconds = 1200;
            updateStatusDisplay();
            autoUpdateInterval = setInterval(() => {
                autoUpdateSeconds--;
                if (autoUpdateSeconds <= 0) {
                    clearInterval(autoUpdateInterval);
                    fetchWeather(true);
                } else {
                    updateStatusDisplay();
                }
            }, 1000);
        }

        // Helper to smoothly add options dynamically if they don't exist
        function updateSelectOption(selectEl, value) {
            if (!value) return;
            let exists = Array.from(selectEl.options).some(opt => opt.value === value);
            if (!exists && value) selectEl.add(new Option(value, value));
            selectEl.value = value;
        }

        function init() {
            // Apply saved zoom or default 90% on desktop
            const savedZoom = localStorage.getItem('atish_weather_zoom');
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop) {
                document.body.style.zoom = savedZoom || '0.9';
            } else {
                document.body.style.zoom = '1';
            }

            const zoomBtn = document.getElementById('zoom-toggle-btn');
            const zoomLabel = document.getElementById('zoom-toggle-label');
            function updateZoomBtnState() {
                const current = parseFloat(document.body.style.zoom) || 0.9;
                if (current >= 1) {
                    zoomLabel.textContent = '90%';
                    zoomBtn.style.background = 'rgb(var(--c-main))';
                    zoomBtn.style.color = '#fff';
                    zoomBtn.style.borderColor = 'rgb(var(--c-main))';
                } else {
                    zoomLabel.textContent = '100%';
                    zoomBtn.style.background = '';
                    zoomBtn.style.color = '';
                    zoomBtn.style.borderColor = '';
                }
            }
            updateZoomBtnState();

            zoomBtn.addEventListener('click', () => {
                const current = parseFloat(document.body.style.zoom) || 0.9;
                const newZoom = current >= 1 ? '0.9' : '1';
                document.body.style.zoom = newZoom;
                localStorage.setItem('atish_weather_zoom', newZoom);
                updateZoomBtnState();
            });

            document.documentElement.setAttribute('data-theme', state.theme);
            document.documentElement.setAttribute('data-color', state.color);
            updateThemeIcon();

            PROVIDERS.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                els.providerSelect.appendChild(opt);
            });

            els.providerSelect.value = state.provider;
            els.apiKeyInput.value = state.apiKey;
            els.unitSelect.value = state.units;
            if (state.country) updateSelectOption(els.countryInput, state.country);
            if (state.timezone) updateSelectOption(els.timezoneInput, state.timezone);
            
            els.colorBtns.forEach(btn => {
                if(btn.dataset.color === state.color) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            
            checkApiFieldVisibility();

            els.locateBtn.addEventListener('click', () => getUserLocation(false));
            els.themeBtn.addEventListener('click', toggleTheme);
            
            els.settingsBtn.addEventListener('click', () => els.settingsModal.classList.remove('hidden'));
            els.closeSettingsBtn.addEventListener('click', () => els.settingsModal.classList.add('hidden'));
            els.closeInfoBtn.addEventListener('click', () => els.infoModal.classList.add('hidden'));

            // Mobile bottom bar wiring
            els.locateBtnMobile.addEventListener('click', () => getUserLocation(false));
            els.themeBtnMobile.addEventListener('click', toggleTheme);
            els.settingsBtnMobile.addEventListener('click', () => els.settingsModal.classList.remove('hidden'));

            // Sync mobile search
            els.citySearchMobile.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                if (query.length < 3) { els.searchResultsMobile.classList.add('hidden'); return; }
                searchTimeout = setTimeout(() => fetchCitySuggestionsMobile(query), 400);
            });

            // Mobile layout toggle
            const savedLayout = localStorage.getItem('atish_weather_layout') || 'app';
            applyMobileLayout(savedLayout);

            els.layoutToggleBtn.addEventListener('click', () => {
                const current = localStorage.getItem('atish_weather_layout') || 'app';
                const next = current === 'app' ? 'header' : 'app';
                localStorage.setItem('atish_weather_layout', next);
                applyMobileLayout(next);
            });
            
            els.colorBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    state.color = color;
                    document.documentElement.setAttribute('data-color', color);
                    els.colorBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });

            els.providerSelect.addEventListener('change', checkApiFieldVisibility);
            els.saveSettingsBtn.addEventListener('click', saveSettings);
            
            if (els.clearDataBtn) {
                els.clearDataBtn.addEventListener('click', () => {
                    if (confirm("Are you sure you want to clear all cached data and pinned cities? This will reload the application.")) {
                        localStorage.removeItem('atish_weather_v5');
                        localStorage.removeItem('atish_weather_cache');
                        window.location.reload();
                    }
                });
            }

            // Dynamic City Search
            els.citySearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                if (query.length < 3) {
                    els.searchResults.classList.add('hidden');
                    return;
                }
                searchTimeout = setTimeout(() => fetchCitySuggestions(query), 400);
            });

            document.addEventListener('click', (e) => {
                if(!els.citySearch.contains(e.target) && !els.searchResults.contains(e.target)) {
                    els.searchResults.classList.add('hidden');
                }
                if(!els.citySearchMobile.contains(e.target) && !els.searchResultsMobile.contains(e.target)) {
                    els.searchResultsMobile.classList.add('hidden');
                }
                if(e.target === els.infoModal) els.infoModal.classList.add('hidden');
                if(e.target === els.settingsModal) els.settingsModal.classList.add('hidden');
            });

            updateClock();
            setInterval(updateClock, 1000);
            window.addEventListener('resize', updatePinnedArrows);

            // ---- BOOT & LOCATION LOGIC ----
            if (state.lat === null || state.lon === null) {
                // First start sequence: Geolocation -> IP Location -> Chandigarh
                tryFirstStartLocation();
            } else {
                // Future visits: Load saved location seamlessly
                const cached = getWeatherCache(state.lat, state.lon, true);
                if (cached) {
                    state.weatherData = cached;
                    updateWeatherUI();
                    autoThemeByTime(cached);
                }
                
                fetchWeather(true);
                renderPinnedCities();
                checkLocationChangeInBackground();
            }
        }

        function applyMobileLayout(mode) {
            const isMobile = window.innerWidth < 1024;
            if (!isMobile) { 
                els.mobileBottomBar.classList.add('hidden');
                els.headerControls.classList.remove('hidden');
                document.body.classList.remove('bottom-bar-active');
                return;
            }
            if (mode === 'app') {
                els.mobileBottomBar.classList.remove('hidden');
                els.headerControls.classList.add('hidden');
                document.body.classList.add('bottom-bar-active');
                els.layoutToggleBtn.style.background = 'rgb(var(--c-main))';
                els.layoutToggleBtn.style.color = '#fff';
                els.layoutToggleBtn.style.borderColor = 'rgb(var(--c-main))';
                els.layoutToggleLabel.textContent = 'In Header';
            } else {
                els.mobileBottomBar.classList.add('hidden');
                els.headerControls.classList.remove('hidden');
                document.body.classList.remove('bottom-bar-active');
                els.layoutToggleBtn.style.background = '';
                els.layoutToggleBtn.style.color = '';
                els.layoutToggleBtn.style.borderColor = '';
                els.layoutToggleLabel.textContent = 'App Like';
            }
        }

        window.addEventListener('resize', () => {
            const layout = localStorage.getItem('atish_weather_layout') || 'app';
            applyMobileLayout(layout);
        });

        async function fetchCitySuggestionsMobile(query) {
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    renderSearchResultsMobile(data.results);
                } else {
                    els.searchResultsMobile.innerHTML = '<div class="p-4 text-center text-sm font-bold opacity-70">No cities found</div>';
                    els.searchResultsMobile.classList.remove('hidden');
                }
            } catch(e) { console.error(e); }
        }

        function renderSearchResultsMobile(results) {
            els.searchResultsMobile.innerHTML = '';
            results.forEach(city => {
                const div = document.createElement('div');
                div.className = 'p-4 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex flex-col transition-colors border-b border-black/5 dark:border-white/5 last:border-0';
                div.innerHTML = `<span class="font-extrabold text-[rgb(var(--c-main))]">${city.name}</span><span class="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</span>`;
                div.addEventListener('click', () => {
                    if (state.pinnedCities.length === 0 && state.locationName) {
                        state.pinnedCities.push({ name: state.locationName, lat: state.lat, lon: state.lon, isHome: true, stateRegion: state.stateRegion, country: state.country });
                    }
                    state.lat = city.latitude;
                    state.lon = city.longitude;
                    state.locationName = city.name;
                    state.stateRegion = city.admin1 || '';
                    state.country = city.country || 'India';
                    state.timezone = city.timezone || 'Asia/Kolkata';
                    updateSelectOption(els.countryInput, state.country);
                    updateSelectOption(els.timezoneInput, state.timezone);
                    const newCity = { name: city.name, lat: city.latitude, lon: city.longitude, stateRegion: city.admin1 || '', country: city.country || 'India' };
                    const existingIndex = state.pinnedCities.findIndex(c => c.name === city.name && !c.isHome);
                    if (existingIndex > 0) state.pinnedCities.splice(existingIndex, 1);
                    state.pinnedCities.splice(1, 0, newCity);
                    if(state.pinnedCities.length > 6) state.pinnedCities.pop();
                    els.citySearchMobile.value = '';
                    els.searchResultsMobile.classList.add('hidden');
                    saveLocationToStorage();
                    updateClock();
                    fetchWeather();
                    renderPinnedCities();
                });
                els.searchResultsMobile.appendChild(div);
            });
            els.searchResultsMobile.classList.remove('hidden');
        }


        function checkApiFieldVisibility() {
            const provider = PROVIDERS.find(p => p.id === els.providerSelect.value);
            if (provider.requiresKey) {
                els.apiKeyInput.classList.remove('hidden');
                if(els.providerSelect.value === 'weatherapi') {
                    els.apiHint.classList.remove('hidden');
                } else {
                    els.apiHint.classList.add('hidden');
                }
            } else {
                els.apiKeyInput.classList.add('hidden');
                els.apiHint.classList.add('hidden');
            }
        }

        async function fetchCitySuggestions(query) {
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    renderSearchResults(data.results);
                } else {
                    els.searchResults.innerHTML = '<div class="p-4 text-center text-sm font-bold opacity-70">No cities found</div>';
                    els.searchResults.classList.remove('hidden');
                }
            } catch(e) {
                console.error(e);
            }
        }

        function renderSearchResults(results) {
            els.searchResults.innerHTML = '';
            results.forEach(city => {
                const div = document.createElement('div');
                div.className = 'p-4 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer flex flex-col transition-colors border-b border-black/5 dark:border-white/5 last:border-0';
                div.innerHTML = `<span class="font-extrabold text-[rgb(var(--c-main))] transition-colors duration-300">${city.name}</span><span class="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</span>`;
                
                div.addEventListener('click', () => {
                    if (state.pinnedCities.length === 0 && state.locationName) {
                        state.pinnedCities.push({ name: state.locationName, lat: state.lat, lon: state.lon, isHome: true, stateRegion: state.stateRegion, country: state.country });
                    }

                    state.lat = city.latitude;
                    state.lon = city.longitude;
                    state.locationName = city.name;
                    state.stateRegion = city.admin1 || "";
                    state.country = city.country || "India";
                    state.timezone = city.timezone || "Asia/Kolkata";
                    
                    updateSelectOption(els.countryInput, state.country);
                    updateSelectOption(els.timezoneInput, state.timezone);
                    
                    const newCity = { name: city.name, lat: city.latitude, lon: city.longitude, stateRegion: city.admin1 || '', country: city.country || 'India' };
                    const existingIndex = state.pinnedCities.findIndex(c => c.name === city.name && !c.isHome);
                    if (existingIndex > 0) state.pinnedCities.splice(existingIndex, 1);
                    
                    state.pinnedCities.splice(1, 0, newCity);
                    if(state.pinnedCities.length > 6) state.pinnedCities.pop(); 

                    els.citySearch.value = '';
                    els.searchResults.classList.add('hidden');
                    saveLocationToStorage();
                    updateClock();
                    fetchWeather();
                    renderPinnedCities();
                });
                els.searchResults.appendChild(div);
            });
            els.searchResults.classList.remove('hidden');
        }

        function saveLocationToStorage() {
            const saved = JSON.parse(localStorage.getItem('atish_weather_v5')) || {};
            saved.lat = state.lat;
            saved.lon = state.lon;
            saved.locationName = state.locationName;
            saved.stateRegion = state.stateRegion;
            saved.country = state.country;
            saved.timezone = state.timezone;
            saved.pinnedCities = state.pinnedCities;
            localStorage.setItem('atish_weather_v5', JSON.stringify(saved));
        }

        function saveSettings() {
            state.provider = els.providerSelect.value;
            state.apiKey = els.apiKeyInput.value;
            state.units = els.unitSelect.value;
            state.country = els.countryInput.value || "India";
            state.timezone = els.timezoneInput.value || "Asia/Kolkata";

            localStorage.setItem('atish_weather_v5', JSON.stringify({
                lat: state.lat,
                lon: state.lon,
                locationName: state.locationName,
                stateRegion: state.stateRegion,
                country: state.country,
                timezone: state.timezone,
                provider: state.provider,
                apiKey: state.apiKey,
                theme: state.theme,
                color: state.color,
                units: state.units,
                pinnedCities: state.pinnedCities
            }));

            els.settingsModal.classList.add('hidden');
            updateClock();
            fetchWeather();
            renderPinnedCities();
        }

        function toggleTheme() {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', state.theme);
            updateThemeIcon();
            localStorage.setItem('atish_weather_theme_manual', '1');
            
            const saved = JSON.parse(localStorage.getItem('atish_weather_v5')) || {};
            saved.theme = state.theme;
            localStorage.setItem('atish_weather_v5', JSON.stringify(saved));
        }

        function updateThemeIcon() {
            const iconName = state.theme === 'light' ? 'moon' : 'sun';
            updateLucideIconWrapper(els.themeIconWrapper, iconName, "w-4 h-4 md:w-5 md:h-5 text-[rgb(var(--c-main))] transition-colors duration-300");
            updateLucideIconWrapper(els.themeIconWrapperMobile, iconName, "w-5 h-5 text-[rgb(var(--c-main))] transition-colors duration-300");
        }

        function updatePinnedArrows() {
            const lBtn = document.getElementById('scroll-left-btn');
            const rBtn = document.getElementById('scroll-right-btn');
            const isDesktop = window.innerWidth >= 768; 
            const total = state.pinnedCities.length;
            
            const needsScroll = isDesktop ? total > 3 : total > 1;
            
            if(needsScroll) {
                lBtn.classList.remove('hidden');
                rBtn.classList.remove('hidden');
            } else {
                lBtn.classList.add('hidden');
                rBtn.classList.add('hidden');
            }
        }

        window.scrollPinned = function(direction) {
            const container = els.pinnedContainer;
            const cardWidth = container.querySelector('.glass')?.offsetWidth || 0;
            const scrollAmount = cardWidth + 16; 
            container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }

        window.handleTouchStart = function(index, e) {
            isDragging = false;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            pressTimer = window.setTimeout(() => {
                if (!isDragging) {
                    isDragging = true;
                    showConfirmModal(index);
                }
            }, 800);
        }
        
        window.handleTouchMove = function(e) {
            const currentX = e.touches ? e.touches[0].clientX : e.clientX;
            if (Math.abs(currentX - startX) > 10) {
                isDragging = true;
                clearTimeout(pressTimer);
            }
        }

        window.handleTouchEnd = function() {
            clearTimeout(pressTimer);
        }
        
        window.handlePinnedClick = function(index) {
            if (!isDragging) {
                const c = state.pinnedCities[index];
                state.lat = c.lat;
                state.lon = c.lon;
                state.locationName = c.name;
                state.stateRegion = c.stateRegion || '';
                state.country = c.country || '';
                saveLocationToStorage();
                fetchWeather();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                els.pinnedContainer.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }

        window.showConfirmModal = function(index) {
            cityToRemoveIndex = index;
            document.getElementById('confirm-city-name').textContent = state.pinnedCities[index].name;
            document.getElementById('confirm-modal').classList.remove('hidden');
        }

        window.confirmRemove = function() {
            if (cityToRemoveIndex > -1) {
                const removed = state.pinnedCities[cityToRemoveIndex].name;
                state.pinnedCities.splice(cityToRemoveIndex, 1);

                saveLocationToStorage();
                renderPinnedCities();
                showToast(`${removed} removed`, "trash-2", "red");
                document.getElementById('confirm-modal').classList.add('hidden');
                cityToRemoveIndex = -1;
            }
        }

        window.cancelRemove = function() {
            document.getElementById('confirm-modal').classList.add('hidden');
            cityToRemoveIndex = -1;
        }

        async function renderPinnedCities() {
            if (state.pinnedCities.length === 0) {
                els.pinnedWrapper.classList.add('hidden');
                return;
            }
            els.pinnedWrapper.classList.remove('hidden');
            
            const lats = state.pinnedCities.map(c => c.lat).join(',');
            const lons = state.pinnedCities.map(c => c.lon).join(',');
            const unitParams = state.units === 'imperial' ? '&temperature_unit=fahrenheit' : '';
            
            const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,weather_code&daily=precipitation_probability_max,temperature_2m_min&timezone=auto${unitParams}`;
            const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi&timezone=auto`;
            
            try {
                const [wRes, aRes] = await Promise.all([
                    fetch(wUrl),
                    fetch(aUrl).catch(() => null)
                ]);

                const wData = await wRes.json();
                const aData = aRes && aRes.ok ? await aRes.json() : null;

                const results = Array.isArray(wData) ? wData : [wData];
                const aqiResults = aData ? (Array.isArray(aData) ? aData : [aData]) : [];
                
                els.pinnedContainer.innerHTML = '';
                results.forEach((d, i) => {
                    const c = state.pinnedCities[i];
                    const { icon } = mapWMOCode(d.current.weather_code, d.current.is_day || 1);
                    const temp = Math.round(d.current.temperature_2m);
                    const minTemp = Math.round(d.daily?.temperature_2m_min?.[0] || 0);
                    const rain = d.daily?.precipitation_probability_max?.[0] || 0;
                    const humidity = d.current.relative_humidity_2m || 0;
                    
                    const aqiObj = aqiResults[i];
                    const aqi = aqiObj && aqiObj.current && aqiObj.current.us_aqi ? aqiObj.current.us_aqi : "--";
                    const aqiCol = getAqiColorClass(parseFloat(aqi));
                    
                    const item = document.createElement('div');
                    item.className = 'glass flex flex-col p-4 shrink-0 snap-center w-[64vw] md:w-[30%] cursor-pointer hover:bg-white/10 transition-colors group/card select-none !shadow-none';
                    item.style.setProperty('--card-color', 'var(--c-main)');
                    
                    item.onmousedown = (e) => handleTouchStart(i, e);
                    item.onmousemove = handleTouchMove;
                    item.onmouseup = handleTouchEnd;
                    item.onmouseleave = handleTouchEnd;
                    item.ontouchstart = (e) => handleTouchStart(i, e);
                    item.ontouchmove = handleTouchMove;
                    item.ontouchend = handleTouchEnd;
                    item.onclick = () => handlePinnedClick(i);

                    item.innerHTML = `
                        <div class="flex justify-between items-start w-full mb-1">
                            <span class="font-extrabold text-base md:text-lg text-[rgb(var(--c-main))] truncate pr-2 group-hover/card:scale-[1.02] transition-transform origin-left flex items-center gap-1">${c.isHome ? '<i data-lucide="map-pin" class="w-4 h-4"></i>' : ''} ${c.name}</span>
                            <i data-lucide="${icon}" class="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--c-main))] shrink-0 drop-shadow-md ${getIconAnimClass(icon)}"></i>
                        </div>
                        <div class="flex items-end gap-2 w-full mt-1">
                            <span class="text-3xl font-extrabold text-[rgb(var(--c-main))] leading-none">${temp}°</span>
                            <span class="text-xs font-bold text-blue-500 dark:text-blue-400 opacity-80 mb-1">Min: ${minTemp}°</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] sm:text-xs font-bold opacity-80 mt-3 w-full bg-black/5 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-black/5 dark:border-white/10">
                            <span title="Rain Probability" class="flex items-center gap-1"><i data-lucide="cloud-rain" class="w-3 h-3 text-blue-500 dark:text-blue-400"></i> ${rain}%</span>
                            <span title="Humidity" class="flex items-center gap-1"><i data-lucide="droplets" class="w-3 h-3 text-[rgb(var(--c-cool))]"></i> ${humidity}%</span>
                            <span title="AQI" class="flex items-center gap-1 ${aqiCol}"><i data-lucide="leaf" class="w-3 h-3"></i> ${aqi}</span>
                        </div>
                    `;
                    els.pinnedContainer.appendChild(item);
                });
                lucide.createIcons();
                updatePinnedArrows();
            } catch (e) {
                console.error("Failed fetching pinned cities", e);
            }
        }

        function getUserLocation() {
            if (!navigator.geolocation) {
                showToast("Geolocation is not supported by your browser", "x-circle", "red");
                return;
            }

            setLoading(true, "Locating you...");
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    state.lat = position.coords.latitude;
                    state.lon = position.coords.longitude;
                    
                    await reverseGeocode();
                    
                    if (state.pinnedCities.length === 0) {
                        state.pinnedCities.push({ name: state.locationName, lat: state.lat, lon: state.lon, isHome: true, stateRegion: state.stateRegion, country: state.country });
                    } else if (state.pinnedCities[0].isHome) {
                        state.pinnedCities[0] = { name: state.locationName, lat: state.lat, lon: state.lon, isHome: true, stateRegion: state.stateRegion, country: state.country };
                    }
                    
                    saveLocationToStorage();
                    fetchWeather();
                    renderPinnedCities();
                },
                (error) => {
                    setLoading(false);
                    showToast("Location access denied or unavailable.", "alert-circle", "red");
                },
                { timeout: 10000 }
            );
        }

        function checkLocationChangeInBackground() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const newLat = position.coords.latitude;
                        const newLon = position.coords.longitude;
                        // check if distance is > 0.05 degrees (approx 5km)
                        if (Math.abs(newLat - state.lat) > 0.05 || Math.abs(newLon - state.lon) > 0.05) {
                            state.lat = newLat;
                            state.lon = newLon;
                            await reverseGeocode();
                            
                            if (state.pinnedCities.length === 0) {
                                state.pinnedCities.push({
                                    name: state.locationName, lat: state.lat, lon: state.lon, isHome: true, stateRegion: state.stateRegion, country: state.country
                                });
                            } else if(state.pinnedCities[0].isHome) {
                                state.pinnedCities[0] = {
                                    name: state.locationName,
                                    lat: state.lat,
                                    lon: state.lon,
                                    isHome: true,
                                    stateRegion: state.stateRegion,
                                    country: state.country
                                };
                            }
                            saveLocationToStorage();
                            fetchWeather(true);
                            renderPinnedCities();
                        }
                    },
                    () => {},
                    { timeout: 10000, maximumAge: 60000 }
                );
            }
        }

        function tryFirstStartLocation() {
            setLoading(true, "Locating you...");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        state.lat = position.coords.latitude;
                        state.lon = position.coords.longitude;
                        await reverseGeocode();
                        finishInitialLocation();
                    },
                    (error) => {
                        // Fallback to IP
                        fallbackToIpLocation();
                    },
                    { timeout: 5000 }
                );
            } else {
                fallbackToIpLocation();
            }
        }

        async function fallbackToIpLocation() {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                    state.lat = data.latitude;
                    state.lon = data.longitude;
                    state.locationName = data.city || "Unknown City";
                    state.stateRegion = data.region || "";
                    state.country = data.country_name || "India";
                    state.timezone = data.timezone || "Asia/Kolkata";
                    finishInitialLocation();
                    return;
                }
            } catch (e) {
                console.error("IP fallback failed", e);
            }
            // Ultimate fallback: Chandigarh
            applyChandigarhFallback();
        }

        function applyChandigarhFallback() {
            state.lat = 30.7333;
            state.lon = 76.7794;
            state.locationName = "Chandigarh";
            state.stateRegion = "Chandigarh";
            state.country = "India";
            state.timezone = "Asia/Kolkata";
            finishInitialLocation();
        }

        function finishInitialLocation() {
            if (state.pinnedCities.length === 0) {
                state.pinnedCities.push({
                    name: state.locationName,
                    lat: state.lat,
                    lon: state.lon,
                    isHome: true,
                    stateRegion: state.stateRegion,
                    country: state.country
                });
            } else if (state.pinnedCities[0].isHome) {
                state.pinnedCities[0] = {
                    name: state.locationName,
                    lat: state.lat,
                    lon: state.lon,
                    isHome: true,
                    stateRegion: state.stateRegion,
                    country: state.country
                };
            }
            saveLocationToStorage();
            updateSelectOption(els.countryInput, state.country);
            updateSelectOption(els.timezoneInput, state.timezone);
            fetchWeather(false);
            renderPinnedCities();
            setLoading(false);
        }

        // Removed applyFallbackLocation as we now initialize Chandigarh directly on boot

        async function reverseGeocode() {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${state.lat}&lon=${state.lon}&zoom=10`);
                const data = await res.json();
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county;
                    state.locationName = city || `${state.lat.toFixed(2)}, ${state.lon.toFixed(2)}`;
                    state.stateRegion = data.address.state || "";
                    state.country = data.address.country || "India";
                } else {
                    state.locationName = `${state.lat.toFixed(2)}, ${state.lon.toFixed(2)}`;
                }

                const tzRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&current=temperature_2m&timezone=auto`);
                const tzData = await tzRes.json();
                if (tzData.timezone) {
                    state.timezone = tzData.timezone;
                }

                updateSelectOption(els.countryInput, state.country);
                updateSelectOption(els.timezoneInput, state.timezone);
                updateClock();

            } catch (err) {
                state.locationName = `${state.lat.toFixed(2)}, ${state.lon.toFixed(2)}`;
            }
        }

        // --- Info Modal Logic ---
        function showInfo(type) {
            if (!state.weatherData) return;
            const w = state.weatherData;
            const isImp = state.units === 'imperial';
            const tu = isImp ? '°F' : '°C';
            
            let title = '', icon = '', content = '', colorCls = '';

            switch(type) {
                case 'main': {
                    title = 'Current Weather'; icon = 'cloud-lightning'; colorCls = 'text-[rgb(var(--c-main))]';
                    content = `<p class="font-bold opacity-80 leading-relaxed">Currently <span class="font-extrabold text-lg text-[rgb(var(--c-main))]">${w.temp}${tu}</span> in <span class="font-extrabold text-lg text-[rgb(var(--c-main))]">${state.locationName}</span> with <span class="capitalize font-extrabold text-[rgb(var(--c-main))]">${w.conditionText}</span> skies, feels like <span class="font-extrabold text-[rgb(var(--c-main))]">${w.feelsLike}${tu}</span>. Rain probability is <span class="font-extrabold text-[rgb(var(--c-cool))]">${w.rainProb}%</span> and cloud cover is <span class="font-extrabold opacity-70">${w.cloudCover}%</span>.</p>`;
                    break;
                }
                case 'uv': {
                    title = 'UV Index'; icon = 'sun'; colorCls = 'text-[rgb(var(--c-warm))]';
                    const showUv = w.uvIndex.current !== "--" ? w.uvIndex.current : w.uvIndex.max;
                    const uv = parseFloat(showUv) || 0;
                    content = `
                        <p class="opacity-80 font-medium">The Ultraviolet (UV) Index indicates the risk of harm from unprotected sun exposure.</p>
                        <div class="w-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 mt-3">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-black/5 dark:bg-white/5"><tr><th class="p-3">Index</th><th class="p-3">Risk Level</th></tr></thead>
                                <tbody>
                                    <tr class="${uv <= 2 ? 'bg-green-500/20 text-green-700 dark:text-green-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">0 - 2</td><td class="p-3">Low</td></tr>
                                    <tr class="${uv > 2 && uv <= 5 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">3 - 5</td><td class="p-3">Moderate</td></tr>
                                    <tr class="${uv > 5 && uv <= 7 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">6 - 7</td><td class="p-3">High</td></tr>
                                    <tr class="${uv > 7 && uv <= 10 ? 'bg-red-500/20 text-red-700 dark:text-red-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">8 - 10</td><td class="p-3">Very High</td></tr>
                                    <tr class="${uv > 10 ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">11+</td><td class="p-3">Extreme</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="p-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 mt-3 flex justify-between items-center">
                            <span class="font-bold">Your Location:</span>
                            <span class="font-extrabold text-lg">${showUv} (${getUvDescription(showUv)})</span>
                        </div>`;
                    break;
                }
                case 'aqi': {
                    title = 'Air Quality Index'; icon = 'leaf'; colorCls = 'text-[rgb(var(--c-earth))]';
                    const aqi = parseFloat(w.aqi) || 0;
                    content = `
                        <p class="opacity-80 font-medium">AQI measures the density of pollutants in the air. Higher values indicate poorer air quality.</p>
                        <div class="w-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 mt-3">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-black/5 dark:bg-white/5"><tr><th class="p-3">AQI Range</th><th class="p-3">Health Concern</th></tr></thead>
                                <tbody>
                                    <tr class="${aqi >= 0 && aqi <= 50 ? 'bg-green-500/20 text-green-700 dark:text-green-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">0 - 50</td><td class="p-3">Good</td></tr>
                                    <tr class="${aqi > 50 && aqi <= 100 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">51 - 100</td><td class="p-3">Moderate</td></tr>
                                    <tr class="${aqi > 100 && aqi <= 150 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">101 - 150</td><td class="p-3">Unhealthy (Sensitive)</td></tr>
                                    <tr class="${aqi > 150 && aqi <= 200 ? 'bg-red-500/20 text-red-700 dark:text-red-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">151 - 200</td><td class="p-3">Unhealthy</td></tr>
                                    <tr class="${aqi > 200 && aqi <= 300 ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">201 - 300</td><td class="p-3">Very Unhealthy</td></tr>
                                    <tr class="${aqi > 300 ? 'bg-red-900/20 text-red-900 dark:text-red-500 font-bold' : ''} border-t border-black/5 dark:border-white/5"><td class="p-3">301+</td><td class="p-3">Hazardous</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="p-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 mt-3 flex justify-between items-center">
                            <span class="font-bold">Your Location:</span>
                            <span class="font-extrabold text-lg">${w.aqi === "--" ? "N/A" : w.aqi + " (" + getAqiDescription(w.aqi) + ")"}</span>
                        </div>`;
                    break;
                }
                case 'humidity': {
                    title = 'Humidity'; icon = 'droplets'; colorCls = 'text-[rgb(var(--c-cool))]';
                    content = `<p class="font-bold opacity-80">Relative humidity is <span class="font-extrabold text-lg text-[rgb(var(--c-cool))]">${w.humidity}%</span>.</p>
                               <p class="font-medium opacity-70 mt-2">Humidity measures the amount of water vapor in the air. Levels between 30% and 60% are generally considered comfortable. Above 60% feels muggy, and below 30% can feel dry to the skin.</p>`;
                    break;
                }
                case 'wind': {
                    title = 'Wind'; icon = 'wind'; colorCls = 'text-[rgb(var(--c-cool))]';
                    const wu = isImp ? 'mph' : 'km/h';
                    content = `<p class="font-bold opacity-80">Wind is currently blowing at <span class="font-extrabold text-lg text-[rgb(var(--c-cool))]">${w.windSpeed} ${wu}</span> from the <span class="font-extrabold text-lg text-[rgb(var(--c-cool))]">${getWindDirection(w.windDir)}</span>.</p>
                               <p class="font-medium opacity-70 mt-2">Wind direction indicates where the wind is coming <em>from</em>. Higher wind speeds can significantly lower the "Feels Like" temperature.</p>`;
                    break;
                }
                case 'pressure': {
                    title = 'Atmospheric Pressure'; icon = 'gauge'; colorCls = 'text-[rgb(var(--c-earth))]';
                    content = `<p class="font-bold opacity-80">Current pressure is <span class="font-extrabold text-lg text-[rgb(var(--c-earth))]">${w.pressure} hPa</span>.</p>
                               <p class="font-medium opacity-70 mt-2">High pressure generally brings clear skies and calm weather, while low pressure is often associated with clouds, wind, and precipitation.</p>`;
                    break;
                }
                case 'extremes': {
                    title = 'Temperature Extremes'; icon = 'thermometer-sun'; colorCls = 'text-[rgb(var(--c-warm))]';
                    content = `<p class="font-bold opacity-80">Today's High: <span class="font-extrabold text-lg text-red-500">${w.high}${tu}</span></p>
                               <p class="font-bold opacity-80 mt-1">Today's Low: <span class="font-extrabold text-lg text-blue-500">${w.low}${tu}</span></p>
                               <p class="font-medium opacity-70 mt-3">These are the maximum and minimum forecasted temperatures for the entire 24-hour day in your area.</p>`;
                    break;
                }
                case 'sun': {
                    title = 'Sun Cycle'; icon = 'sunrise'; colorCls = 'text-[rgb(var(--c-warm))]';
                    content = `<p class="font-bold opacity-80">Sunrise: <span class="font-extrabold text-lg text-[rgb(var(--c-warm))]">${w.sunrise}</span></p>
                               <p class="font-bold opacity-80 mt-1">Sunset: <span class="font-extrabold text-lg text-[rgb(var(--c-warm))]">${w.sunset}</span></p>
                               <p class="font-medium opacity-70 mt-3">Times are displayed in your device's local timezone based on the geographic coordinates of the selected city.</p>`;
                    break;
                }
                case 'forecast': {
                    title = '7-Day Forecast'; icon = 'calendar-days'; colorCls = 'text-[rgb(var(--c-main))]';
                    const header = `
                        <div class="flex justify-between items-center px-4 py-2 border-b border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">
                            <span class="w-1/4">Day</span>
                            <div class="flex items-center justify-center w-2/4 gap-2 md:gap-4">
                                <span class="w-12 md:w-16 flex justify-center" title="Rain Probability"><i data-lucide="cloud-rain" class="w-3.5 h-3.5"></i></span>
                                <span class="w-6 md:w-8 shrink-0 flex justify-center text-[rgb(var(--c-main))]" title="Weather"><i data-lucide="cloud-sun" class="w-4 h-4"></i></span>
                                <span class="w-12 md:w-16 flex justify-center" title="Cloud Cover"><i data-lucide="cloud" class="w-3.5 h-3.5"></i></span>
                            </div>
                            <div class="w-1/4 text-right pr-1">
                                <span class="md:hidden">H</span><span class="hidden md:inline">High</span>
                                <span class="md:hidden ml-1">L</span><span class="hidden md:inline ml-2">Low</span>
                            </div>
                        </div>
                    `;
                    const list = w.forecast.map(f => `
                        <div class="flex justify-between items-center py-2.5 px-4 border-b border-black/5 dark:border-white/10 last:border-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <span class="font-extrabold w-1/4 text-xs md:text-sm">${f.day}</span>
                            <div class="flex items-center justify-center w-2/4 gap-2 md:gap-4">
                                <span class="flex items-center justify-center gap-1 text-[rgb(var(--c-cool))] text-[10px] md:text-xs font-bold w-12 md:w-16" title="Rain Probability"><i data-lucide="cloud-rain" class="w-3 h-3"></i> ${f.rainProb}%</span>
                                <i data-lucide="${f.icon}" class="w-6 h-6 md:w-8 md:h-8 text-[rgb(var(--c-main))] ${getIconAnimClass(f.icon)} shrink-0 drop-shadow-md"></i>
                                <span class="flex items-center justify-center gap-1 opacity-60 text-[10px] md:text-xs font-bold w-12 md:w-16" title="Cloud Cover"><i data-lucide="cloud" class="w-3 h-3"></i> ${f.cloudCover}%</span>
                            </div>
                            <div class="font-extrabold w-1/4 text-right text-xs md:text-sm"><span class="text-[rgb(var(--c-warm))]">${f.max}°</span> <span class="text-[rgb(var(--c-cool))] opacity-80 ml-1">${f.min}°</span></div>
                        </div>
                    `).join('');
                    content = `<div class="w-full rounded-xl border border-black/5 dark:border-white/10 mt-2 bg-black/5 dark:bg-white/5 overflow-hidden">${header}${list}</div>`;
                    break;
                }
            }

            els.infoTitle.innerHTML = `<i data-lucide="${icon}" class="w-7 h-7 ${colorCls} transition-colors duration-300 ${getIconAnimClass(icon)}"></i> <span class="${colorCls} transition-colors duration-300">${title}</span>`;
            els.infoContent.innerHTML = content;
            lucide.createIcons();
            els.infoModal.classList.remove('hidden');
        }

        // Weather cache: keyed by lat+lon, 20-min TTL, max 6 entries
        const CACHE_KEY = 'atish_weather_cache';
        const CACHE_TTL = 20 * 60 * 1000; // 20 minutes
        const CACHE_MAX = 6;

        function getWeatherCache(lat, lon, ignoreTTL = false) {
            try {
                const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
                const key = `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
                const entry = cache[key];
                if (entry) {
                    if (ignoreTTL || Date.now() - entry.ts < CACHE_TTL) return entry.data;
                }
            } catch(e) {}
            return null;
        }

        function setWeatherCache(lat, lon, data) {
            try {
                let cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
                const key = `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
                cache[key] = { data, ts: Date.now() };
                // Enforce max 6 entries - remove oldest
                const keys = Object.keys(cache);
                if (keys.length > CACHE_MAX) {
                    keys.sort((a, b) => cache[a].ts - cache[b].ts);
                    while (Object.keys(cache).length > CACHE_MAX) {
                        delete cache[keys.shift()];
                    }
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch(e) {}
        }

        async function fetchWeather(isBackground = false) {
            if (els.updateSpinner) els.updateSpinner.classList.add('anim-spin');
            updateStatusDisplay();

            // Check cache first
            const cached = getWeatherCache(state.lat, state.lon);
            if (cached) {
                state.weatherData = cached;
                updateWeatherUI();
                autoThemeByTime(cached);
                
                if (els.updateSpinner) els.updateSpinner.classList.remove('anim-spin');
                lastUpdateTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                startAutoUpdateCountdown();
                return;
            }

            let activeKey = state.apiKey;
            
            if (state.provider === 'weatherapi' && !activeKey) {
                activeKey = getBuiltInKey();
            }

            const providerInfo = PROVIDERS.find(p => p.id === state.provider);
            if (els.currentProviderName) els.currentProviderName.textContent = providerInfo.name;

            if (providerInfo.requiresKey && !activeKey) {
                showToast(`Please enter an API Key for ${providerInfo.name} in Settings`, "alert-circle", "red");
                if (els.updateSpinner) els.updateSpinner.classList.remove('anim-spin');
                if (els.updateStatusText) els.updateStatusText.textContent = `Updated On (${lastUpdateTimeStr} + API Key Error)`;
                return;
            }

            if (!isBackground) setLoading(true);

            try {
                let data;
                switch (state.provider) {
                    case "open-meteo": data = await fetchOpenMeteo(); break;
                    case "openweathermap": data = await fetchOpenWeatherMap(activeKey); break;
                    case "weatherapi": data = await fetchWeatherAPI(activeKey); break;
                }
                
                // DATA COMBINATION: Force combine Open-Meteo & WeatherAPI for optimal Real-Time vs Max data
                try {
                    const fallbackKey = getBuiltInKey();
                    
                    const [wApiData, omData] = await Promise.all([
                        state.provider !== 'weatherapi' ? fetchWeatherAPI(fallbackKey).catch(()=>null) : Promise.resolve(data),
                        state.provider !== 'open-meteo' ? fetchOpenMeteo().catch(()=>null) : Promise.resolve(data)
                    ]);

                    // Inject Real-Time AQI from WeatherAPI and Max AQI from Open-Meteo
                    if (wApiData && wApiData.aqi !== "--") data.aqi = wApiData.aqi;
                    if (omData && omData.aqiMax !== "--") data.aqiMax = omData.aqiMax;

                    // UV Index: combine current from WeatherAPI + max from Open-Meteo
                    if (wApiData && wApiData.uvIndex && wApiData.uvIndex.current !== "--") {
                        data.uvIndex.current = wApiData.uvIndex.current;
                    }
                    if (omData && omData.uvIndex && omData.uvIndex.max !== "--") {
                        data.uvIndex.max = omData.uvIndex.max;
                    }

                    // Standard augmentation for missing elements
                    if (omData) {
                        if (data.rainProb === "--") data.rainProb = omData.rainProb;
                        if (data.windSpeed === "--" || data.windSpeed === undefined) {
                            data.windSpeed = omData.windSpeed;
                            data.windDir = omData.windDir;
                        }
                        if (data.cloudCover === "--") data.cloudCover = omData.cloudCover;
                        
                        if (data.forecast && omData.forecast) {
                            data.forecast.forEach((day, i) => {
                                if (omData.forecast[i]) {
                                    if (day.rainProb === "--") day.rainProb = omData.forecast[i].rainProb;
                                    if (day.cloudCover === "--") day.cloudCover = omData.forecast[i].cloudCover;
                                }
                            });
                        }
                    }
                } catch (fallbackErr) {
                    console.warn("Augmentation failed", fallbackErr);
                }

                state.weatherData = data;
                setWeatherCache(state.lat, state.lon, data);
                updateWeatherUI();
                autoThemeByTime(data);
                if (!isBackground) showToast("Weather updated successfully!", "check-circle", "green");
                
                lastUpdateTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                startAutoUpdateCountdown();

            } catch (err) {
                console.error(err);
                if (!isBackground) showToast(err.message || "Failed to fetch weather data.", "alert-circle", "red");
                els.weatherContainer.style.opacity = '0.5';
                if (els.updateStatusText) els.updateStatusText.textContent = `Updated On (${lastUpdateTimeStr} + Update failed)`;
            } finally {
                if (!isBackground) setLoading(false);
                if (els.updateSpinner) els.updateSpinner.classList.remove('anim-spin');
            }
        }

        function autoThemeByTime(data) {
            if (localStorage.getItem('atish_weather_theme_manual')) return;
            try {
                const now = new Date();
                const sunriseStr = data.sunrise;
                const sunsetStr = data.sunset;
                if (!sunriseStr || !sunsetStr || sunriseStr === '--:--' || sunsetStr === '--:--') return;
                
                const parseTime = (str) => {
                    const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return null;
                    let h = parseInt(match[1]);
                    const m = parseInt(match[2]);
                    const ampm = match[3].toUpperCase();
                    if (ampm === 'PM' && h !== 12) h += 12;
                    if (ampm === 'AM' && h === 12) h = 0;
                    return h * 60 + m;
                };
                
                const sunriseMin = parseTime(sunriseStr);
                const sunsetMin = parseTime(sunsetStr);
                if (sunriseMin === null || sunsetMin === null) return;
                
                let nowOpts = {};
                if (state.timezone) { try { nowOpts.timeZone = state.timezone; } catch(e){} }
                const nowH = parseInt(now.toLocaleString('en-US', { ...nowOpts, hour: 'numeric', hour12: false }));
                const nowM = parseInt(now.toLocaleString('en-US', { ...nowOpts, minute: 'numeric' }));
                const nowMin = nowH * 60 + nowM;
                
                const shouldBeDark = nowMin >= sunsetMin || nowMin < sunriseMin;
                const newTheme = shouldBeDark ? 'dark' : 'light';
                
                if (state.theme !== newTheme) {
                    state.theme = newTheme;
                    document.documentElement.setAttribute('data-theme', newTheme);
                    updateThemeIcon();
                    const saved = JSON.parse(localStorage.getItem('atish_weather_v5')) || {};
                    saved.theme = newTheme;
                    localStorage.setItem('atish_weather_v5', JSON.stringify(saved));
                }
            } catch(e) { console.warn('Auto-theme failed', e); }
        }

        // Swipe on main weather card to change pinned city - 3D book flip
        (function() {
            let swipeStartX = 0, swipeDelta = 0, swiping = false, flipping = false;
            const card = document.getElementById('main-weather-card');
            if (!card) return;
            
            function handleSwipeEnd() {
                if (!swiping || flipping) return;
                swiping = false;
                if (state.pinnedCities.length < 2 || Math.abs(swipeDelta) < 60) return;
                flipping = true;
                
                let curIdx = state.pinnedCities.findIndex(c => c.name === state.locationName);
                if (curIdx === -1) curIdx = 0;
                const nextIdx = swipeDelta < 0
                    ? (curIdx + 1) % state.pinnedCities.length
                    : (curIdx - 1 + state.pinnedCities.length) % state.pinnedCities.length;
                
                const c = state.pinnedCities[nextIdx];
                const outClass = swipeDelta < 0 ? 'card-flip-out-left' : 'card-flip-out-right';
                const inClass = swipeDelta < 0 ? 'card-flip-in-right' : 'card-flip-in-left';
                
                card.classList.add(outClass);
                
                setTimeout(() => {
                    state.lat = c.lat;
                    state.lon = c.lon;
                    state.locationName = c.name;
                    state.stateRegion = c.stateRegion || '';
                    state.country = c.country || '';
                    saveLocationToStorage();
                    card.classList.remove(outClass);
                    card.classList.add(inClass);
                    fetchWeather();
                    updateSwipeNotches();
                    
                    setTimeout(() => {
                        card.classList.remove(inClass);
                        flipping = false;
                    }, 500);
                }, 500);
            }

            card.addEventListener('touchstart', e => { if (!flipping) { swipeStartX = e.touches[0].clientX; swiping = true; swipeDelta = 0; } }, { passive: true });
            card.addEventListener('touchmove', e => { if (swiping) swipeDelta = e.touches[0].clientX - swipeStartX; }, { passive: true });
            card.addEventListener('touchend', handleSwipeEnd);
            card.addEventListener('mousedown', e => { if (!flipping) { swipeStartX = e.clientX; swiping = true; swipeDelta = 0; } });
            card.addEventListener('mousemove', e => { if (swiping) swipeDelta = e.clientX - swipeStartX; });
            card.addEventListener('mouseup', handleSwipeEnd);
            card.addEventListener('mouseleave', () => { swiping = false; });
        })();

        async function fetchOpenMeteo() {
            const unitParams = state.units === 'imperial' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto${unitParams}`;
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${state.lat}&longitude=${state.lon}&current=us_aqi&hourly=us_aqi&timezone=auto`;
            
            const [wRes, aRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(aqiUrl).catch(() => null)
            ]);

            if (!wRes.ok) throw new Error("Open-Meteo request failed");
            
            const wData = await wRes.json();
            const aData = aRes && aRes.ok ? await aRes.json() : null;

            let aqiCur = "--";
            let aqiMax = "--";
            if (aData) {
                if (aData.current && aData.current.us_aqi) aqiCur = aData.current.us_aqi;
                if (aData.hourly && aData.hourly.us_aqi) {
                    const todayAqi = aData.hourly.us_aqi.slice(0, 24).filter(x => x !== null);
                    if (todayAqi.length > 0) aqiMax = Math.max(...todayAqi);
                }
            }

            const curr = wData.current;
            const daily = wData.daily;
            const { desc, icon } = mapWMOCode(curr.weather_code, curr.is_day);

            const forecast = [];
            for(let i = 0; i < 7; i++) {
                const dateObj = new Date(daily.time[i]);
                const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                forecast.push({
                    day: dayName,
                    max: Math.round(daily.temperature_2m_max[i]),
                    min: Math.round(daily.temperature_2m_min[i]),
                    icon: mapWMOCode(daily.weather_code[i], 1).icon,
                    rainProb: daily.precipitation_probability_max && daily.precipitation_probability_max[i] !== null ? daily.precipitation_probability_max[i] : "--",
                    cloudCover: i === 0 ? (curr.cloud_cover !== null ? curr.cloud_cover : "--") : "--"
                });
            }

            return {
                temp: Math.round(curr.temperature_2m),
                feelsLike: Math.round(curr.apparent_temperature),
                high: Math.round(daily.temperature_2m_max[0]),
                low: Math.round(daily.temperature_2m_min[0]),
                humidity: curr.relative_humidity_2m,
                windSpeed: Math.round(curr.wind_speed_10m),
                windDir: curr.wind_direction_10m,
                pressure: Math.round(curr.surface_pressure),
                uvIndex: { current: "--", max: daily.uv_index_max && daily.uv_index_max[0] ? daily.uv_index_max[0].toFixed(1) : "--" },
                aqi: aqiCur,
                aqiMax: aqiMax,
                sunrise: formatTime(daily.sunrise[0]),
                sunset: formatTime(daily.sunset[0]),
                conditionText: desc,
                iconType: icon,
                rainProb: daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== null ? daily.precipitation_probability_max[0] : "--",
                cloudCover: curr.cloud_cover !== null ? curr.cloud_cover : "--",
                forecast: forecast
            };
        }

        async function fetchOpenWeatherMap(key) {
            const unitType = state.units === 'imperial' ? 'imperial' : 'metric';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${state.lat}&lon=${state.lon}&appid=${key}&units=${unitType}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Invalid OpenWeatherMap API Key or request failed");
            const data = await res.json();
            
            let iconType = "cloud";
            const id = data.weather[0].id;
            if (id >= 200 && id < 300) iconType = "cloud-lightning";
            else if (id >= 300 && id < 600) iconType = "cloud-rain";
            else if (id >= 600 && id < 700) iconType = "snowflake";
            else if (id === 800) iconType = "sun";
            else if (id > 800) iconType = "cloud";

            const mockForecast = Array.from({length: 7}, (_, i) => ({
                day: i === 0 ? 'Today' : `Day ${i+1}`,
                max: Math.round(data.main.temp_max),
                min: Math.round(data.main.temp_min),
                icon: iconType,
                rainProb: "--",
                cloudCover: "--"
            }));

            const wSpeed = state.units === 'imperial' ? Math.round(data.wind.speed) : Math.round(data.wind.speed * 3.6);

            return {
                temp: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                high: Math.round(data.main.temp_max),
                low: Math.round(data.main.temp_min),
                humidity: data.main.humidity,
                windSpeed: wSpeed,
                windDir: data.wind.deg,
                pressure: data.main.pressure,
                uvIndex: { current: "--", max: "--" }, 
                aqi: "--",
                aqiMax: "--",
                sunrise: formatTime(data.sys.sunrise * 1000, true),
                sunset: formatTime(data.sys.sunset * 1000, true),
                conditionText: data.weather[0].description,
                iconType: iconType,
                rainProb: "--",
                cloudCover: data.clouds && data.clouds.all !== undefined ? data.clouds.all : "--",
                forecast: mockForecast
            };
        }

        async function fetchWeatherAPI(key) {
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${state.lat},${state.lon}&days=7&aqi=yes`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Invalid WeatherAPI Key or request failed");
            const data = await res.json();
            const curr = data.current;
            const today = data.forecast.forecastday[0].day;

            let iconType = "cloud";
            const code = curr.condition.code;
            if (code === 1000) iconType = curr.is_day ? "sun" : "moon";
            else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240].includes(code)) iconType = "cloud-rain";
            else if ([1066, 1114, 1210, 1213, 1219, 1222, 1225].includes(code)) iconType = "snowflake";
            else if ([1087, 1273, 1276].includes(code)) iconType = "cloud-lightning";

            const forecast = data.forecast.forecastday.map((day, i) => {
                const dateObj = new Date(day.date);
                return {
                    day: i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                    max: Math.round(state.units === 'imperial' ? day.day.maxtemp_f : day.day.maxtemp_c),
                    min: Math.round(state.units === 'imperial' ? day.day.mintemp_f : day.day.mintemp_c),
                    icon: day.day.condition.text.toLowerCase().includes('rain') ? 'cloud-rain' : 'cloud',
                    rainProb: day.day.daily_chance_of_rain !== undefined ? day.day.daily_chance_of_rain : "--",
                    cloudCover: "--"
                };
            });

            return {
                temp: Math.round(state.units === 'imperial' ? curr.temp_f : curr.temp_c),
                feelsLike: Math.round(state.units === 'imperial' ? curr.feelslike_f : curr.feelslike_c),
                high: Math.round(state.units === 'imperial' ? today.maxtemp_f : today.maxtemp_c),
                low: Math.round(state.units === 'imperial' ? today.mintemp_f : today.mintemp_c),
                humidity: curr.humidity,
                windSpeed: Math.round(state.units === 'imperial' ? curr.wind_mph : curr.wind_kph),
                windDir: curr.wind_degree,
                pressure: curr.pressure_mb,
                uvIndex: { 
                    current: curr.uv !== undefined ? curr.uv.toFixed(1) : "--", 
                    max: today.uv !== undefined ? today.uv.toFixed(1) : "--" 
                },
                aqi: curr.air_quality && curr.air_quality['us-epa-index'] ? Math.round((curr.air_quality['us-epa-index'] * 50) - 20) : "--",
                aqiMax: "--",
                sunrise: data.forecast.forecastday[0].astro.sunrise,
                sunset: data.forecast.forecastday[0].astro.sunset,
                conditionText: curr.condition.text,
                iconType: iconType,
                rainProb: data.forecast.forecastday[0].day.daily_chance_of_rain !== undefined ? data.forecast.forecastday[0].day.daily_chance_of_rain : "--",
                cloudCover: curr.cloud !== undefined ? curr.cloud : "--",
                forecast: forecast
            };
        }

        function formatTime(dateStringOrTimestamp, isTimestamp = false) {
            if(!dateStringOrTimestamp) return "--:--";
            const d = isTimestamp ? new Date(dateStringOrTimestamp) : new Date(dateStringOrTimestamp);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }

        function getAqiDescription(aqi) {
            if (aqi === "--") return "Unavailable";
            if (aqi <= 50) return "Good";
            if (aqi <= 100) return "Moderate";
            if (aqi <= 150) return "Sensitive";
            if (aqi <= 200) return "Unhealthy";
            if (aqi <= 300) return "Very Unhealthy";
            return "Hazardous";
        }

        function getAqiColorClass(aqi) {
            if (isNaN(aqi)) return 'text-[rgb(var(--c-earth))]';
            if (aqi <= 50) return 'text-green-500';
            if (aqi <= 100) return 'text-yellow-500';
            if (aqi <= 150) return 'text-orange-500';
            if (aqi <= 200) return 'text-red-500';
            return 'text-purple-500';
        }

        function getUvDescription(uv) {
            if (uv === "--") return "Unavailable";
            if (uv <= 2) return "Low";
            if (uv <= 5) return "Moderate";
            if (uv <= 7) return "High";
            if (uv <= 10) return "Very High";
            return "Extreme";
        }

        function mapWMOCode(code, isDay) {
            const map = {
                0: { desc: "Clear sky", icon: isDay ? "sun" : "moon" },
                1: { desc: "Mainly clear", icon: isDay ? "cloud-sun" : "cloud-moon" },
                2: { desc: "Partly cloudy", icon: "cloud" },
                3: { desc: "Overcast", icon: "cloud" },
                45: { desc: "Fog", icon: "cloud-fog" },
                48: { desc: "Depositing rime fog", icon: "cloud-fog" },
                51: { desc: "Light drizzle", icon: "cloud-drizzle" },
                53: { desc: "Moderate drizzle", icon: "cloud-drizzle" },
                61: { desc: "Slight rain", icon: "cloud-rain" },
                63: { desc: "Moderate rain", icon: "cloud-rain" },
                65: { desc: "Heavy rain", icon: "cloud-rain" },
                71: { desc: "Slight snow fall", icon: "snowflake" },
                75: { desc: "Heavy snow fall", icon: "snowflake" },
                95: { desc: "Thunderstorm", icon: "cloud-lightning" }
            };
            return map[code] || { desc: "Unknown", icon: "cloud" };
        }

        function getWindDirection(degree) {
            if(degree === undefined || degree === null) return "Var";
            const val = Math.floor((degree / 22.5) + 0.5);
            const arr = ["N", "N-NE", "NE", "E-NE", "E", "E-SE", "SE", "S-SE", "S", "S-SW", "SW", "W-SW", "W", "W-NW", "NW", "N-NW"];
            return arr[(val % 16)];
        }

        function getIconAnimClass(iconName) {
            if(!iconName) return 'anim-float';
            if(iconName === 'sun') return 'anim-spin-slow';
            if(iconName === 'moon' || iconName === 'leaf' || iconName === 'calendar-days') return 'anim-rock';
            if(iconName.includes('wind')) return 'anim-slide-x';
            if(iconName.includes('droplet') || iconName === 'gauge') return 'anim-pulse';
            return 'anim-float';
        }

        function updateWeatherUI() {
            const w = state.weatherData;
            const isImp = state.units === 'imperial';
            
            els.tempUnitLabels.forEach(el => el.textContent = isImp ? '°F' : '°C');
            els.windUnitLabel.textContent = isImp ? 'mph' : 'km/h';

            els.locationName.textContent = state.locationName;
            
            const regionDetails = [];
            if(state.stateRegion && state.stateRegion !== state.locationName) regionDetails.push(state.stateRegion);
            if(state.country) regionDetails.push(state.country);
            els.locationRegion.textContent = regionDetails.length ? regionDetails.join(', ') : '';

            els.temperature.textContent = w.temp;
            els.conditionDesc.textContent = w.conditionText;
            const tu = isImp ? '°F' : '°C';
            els.feelsLikeInline.textContent = `(Feels Like ${w.feelsLike}${tu})`;
            els.currentRainProb.textContent = w.rainProb;
            els.currentCloudCover.textContent = w.cloudCover;
            els.tempHigh.textContent = `${w.high}`;
            els.tempLow.textContent = `${w.low}`;
            
            const uvCur = w.uvIndex.current;
            const uvMax = w.uvIndex.max;
            const showUv = uvCur !== "--" ? uvCur : uvMax;
            
            els.uvIndex.textContent = showUv;
            els.uvDesc.textContent = uvCur !== "--" ? `Max today: ${uvMax}` : `Daily Max`;

            const aqiVal = parseFloat(w.aqi);
            els.aqi.textContent = w.aqi;
            els.aqiDesc.textContent = w.aqiMax !== "--" ? `Max: ${w.aqiMax} • ${getAqiDescription(w.aqi)}` : getAqiDescription(w.aqi);
            updateLucideIconWrapper(els.aqiIconWrapper, 'leaf', `w-6 h-6 anim-rock ${getAqiColorClass(aqiVal)}`);
            
            els.humidity.textContent = w.humidity;
            els.humidityDesc.textContent = w.humidity > 60 ? "High moisture" : w.humidity < 30 ? "Dry air" : "Comfortable";
            
            els.windSpeed.textContent = w.windSpeed;
            els.windDir.textContent = getWindDirection(w.windDir);
            
            els.pressure.textContent = w.pressure;
            els.sunrise.textContent = w.sunrise;
            els.sunset.textContent = w.sunset;

            const fxLayer = document.getElementById('weather-fx-layer');
            fxLayer.className = 'absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-overlay weather-fx-layer transition-all duration-1000';
            
            if(w.iconType.includes('lightning')) fxLayer.classList.add('weather-anim-lightning');
            else if(w.iconType.includes('rain') || w.iconType.includes('drizzle')) fxLayer.classList.add('weather-anim-rain');
            else if(w.iconType.includes('snow')) fxLayer.classList.add('weather-anim-snow');
            else if(w.iconType.includes('cloud')) fxLayer.classList.add('weather-anim-cloud');
            else if(w.iconType === 'sun') fxLayer.classList.add('weather-anim-sun');
            else if(w.iconType === 'moon') fxLayer.classList.add('weather-anim-moon');

            const mainAnim = getIconAnimClass(w.iconType);
            updateLucideIconWrapper(els.mainIconWrapper, w.iconType, `w-48 h-48 drop-shadow-2xl text-[rgb(var(--c-main))] transition-colors duration-300 ${mainAnim}`);

            els.forecastContainer.innerHTML = '';
            w.forecast.forEach((f) => {
                const item = document.createElement('div');
                item.className = 'glass flex flex-col items-center justify-center p-3 lg:p-4 w-full rounded-2xl lg:rounded-3xl transform transition hover:bg-white/10 shadow-none pointer-events-none last:col-span-2 sm:last:col-span-1 lg:last:col-span-1';
                item.style.border = '1px solid rgba(var(--c-main), 0.5)';
                
                const fAnim = getIconAnimClass(f.icon);
                item.innerHTML = `
                    <span class="text-xs md:text-sm lg:text-base font-extrabold mb-1 lg:mb-2">${f.day}</span>
                    <i data-lucide="${f.icon}" class="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 mb-2 lg:mb-3 drop-shadow-md text-[rgb(var(--c-main))] transition-colors duration-300 ${fAnim}"></i>
                    <div class="flex gap-1.5 lg:gap-2 text-xs md:text-sm lg:text-base font-extrabold">
                        <span class="text-[rgb(var(--c-warm))] transition-colors duration-300">${f.max}°</span>
                        <span class="text-[rgb(var(--c-cool))] transition-colors duration-300">${f.min}°</span>
                    </div>
                `;
                els.forecastContainer.appendChild(item);
            });
            lucide.createIcons();

            els.weatherContainer.style.opacity = '1';
            updateSwipeNotches();
        }

        function updateSwipeNotches() {
            const leftNotch = document.getElementById('swipe-notch-left');
            const rightNotch = document.getElementById('swipe-notch-right');
            if (!leftNotch || !rightNotch) return;
            
            if (state.pinnedCities.length >= 2) {
                leftNotch.classList.remove('hidden');
                rightNotch.classList.remove('hidden');
            } else {
                leftNotch.classList.add('hidden');
                rightNotch.classList.add('hidden');
            }
        }

        function updateLucideIconWrapper(wrapperElement, iconName, classes) {
            wrapperElement.innerHTML = `<i data-lucide="${iconName}" class="${classes}"></i>`;
            lucide.createIcons();
        }

        function updateClock() {
            const now = new Date();
            const dayOpts = { weekday: 'long' };
            const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
            
            if (state.timezone) {
                try {
                    dayOpts.timeZone = state.timezone;
                    dateOpts.timeZone = state.timezone;
                } catch(e) {}
            }
            
            const dayStr = now.toLocaleDateString('en-US', dayOpts);
            const dateStr = now.toLocaleDateString('en-US', dateOpts);
            els.dateTime.textContent = `${dayStr}, ${dateStr}`;
        }

        function setLoading(isLoading, text = "") {
            state.isLoading = isLoading;
            if (isLoading) {
                els.loadingState.querySelector('p').textContent = text || "Gathering data...";
                els.loadingState.classList.remove('hidden');
            } else {
                els.loadingState.classList.add('hidden');
            }
        }

        let toastTimeout;
        function showToast(msg, iconName, colorClass) {
            els.toastMsg.textContent = msg;
            updateLucideIconWrapper(els.toastIconWrapper, iconName, `w-6 h-6 text-${colorClass}-500`);
            els.toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => els.toast.classList.remove('show'), 3000);
        }

        init();
