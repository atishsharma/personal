/**
 * Theme Module
 * Handles Settings Modal and CSS Variables.
 */

export function initTheme() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const accentColorPicker = document.getElementById('accentColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');

    if (!settingsBtn || !settingsModal) return;

    // Open
    settingsBtn.addEventListener('click', () => {
        settingsModal.showModal();
    });

    // Close
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.close();
    });

    // Close on click outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.close();
    });

    // Theme Logic
    accentColorPicker.addEventListener('input', (e) => {
        setTheme(e.target.value);
    });

    bgColorPicker.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--md-sys-color-background', e.target.value);
    });

    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            const bg = btn.dataset.bg;

            // Update Inputs
            accentColorPicker.value = color;
            bgColorPicker.value = bg;

            // Apply
            setTheme(color);
            document.documentElement.style.setProperty('--md-sys-color-background', bg);
        });
    });

    function setTheme(color) {
        const root = document.documentElement;
        root.style.setProperty('--md-sys-color-primary', color);
        root.style.setProperty('--md-sys-color-primary-container', adjustBrightness(color, -20));
        root.style.setProperty('--key-accent-bg', color);
        root.style.setProperty('--term-accent', color);
    }

    // Helper to darken/lighten slightly for "container" colors if needed
    // Simple placeholder for robust color manipulation
    function adjustBrightness(col, amt) {
        return col; // In a real app we'd parse hex, but for now exact color is fine
    }
}
