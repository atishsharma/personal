/**
 * Main Entry Point
 * Glues modules together.
 */

import { handleInput, getHistoryText } from './input.js';
import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Subsystems
    initTheme();

    // Global Key Listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Alt') e.preventDefault();

        // Normalize key
        let keyVal = e.key;
        if (keyVal === ' ') keyVal = 'Space';

        handleInput(keyVal);
    });

    // Virtual Keyboard Listener (Delegation)
    document.body.addEventListener('click', (e) => {
        // Find closest key if clicked on internal element
        const keyEl = e.target.closest('.key');
        if (keyEl) {
            e.preventDefault(); // Stop native keyboard

            const keyVal = keyEl.dataset.key;

            // Layer Logic
            if (keyVal === '?123') {
                toggleMobileLayer('symbols');
                return;
            }
            if (keyVal === 'ABC') {
                toggleMobileLayer('alpha');
                return;
            }
            if (keyVal === 'EMOJI') {
                toggleMobileLayer('emoji');
                return;
            }

            handleInput(keyVal);
        }
    });

    // Also prevent default on mousedown/touchstart to be sure
    document.body.addEventListener('mousedown', (e) => {
        if (e.target.closest('.key')) e.preventDefault();
    });

    // Helper for layers
    function toggleMobileLayer(layerName) {
        const alphaLayer = document.querySelector('.mobile-layer-alpha');
        const symbolLayer = document.querySelector('.mobile-layer-symbols');
        const emojiLayer = document.querySelector('.mobile-layer-emoji');

        // Reset all
        alphaLayer.style.display = 'none';
        symbolLayer.style.display = 'none';
        emojiLayer.style.display = 'none';

        if (layerName === 'symbols') {
            symbolLayer.style.display = 'flex';
        } else if (layerName === 'emoji') {
            emojiLayer.style.display = 'flex';
        } else {
            alphaLayer.style.display = 'flex';
        }
    }

    // Download Handler
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const textContent = getHistoryText();
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'retrokeys_log.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});
