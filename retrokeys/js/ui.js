/**
 * UI Module
 * Handles DOM updates for Terminal and Keyboard visuals.
 */

export const outputDiv = document.getElementById('terminalOutput');
export const inputSpan = document.getElementById('currentInput');

export function appendToTerminal(text, type = 'output') {
    const line = document.createElement('div');
    line.className = 'line';
    if (type === 'input') {
        line.innerHTML = `<span class="prompt">$</span> ${text}`;
        line.style.opacity = '0.8';
    } else {
        line.innerText = text;
    }
    outputDiv.appendChild(line);
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

export function updateInputDisplay(text) {
    if (inputSpan) inputSpan.innerText = text;
}

export function animateKey(key) {
    // Find keys in both layouts
    const keyElements = document.querySelectorAll(`.key[data-key="${key}"], .key[data-key="${key.toLowerCase()}"]`);
    keyElements.forEach(el => {
        el.classList.add('pressed');
        setTimeout(() => el.classList.remove('pressed'), 150);
    });
}
