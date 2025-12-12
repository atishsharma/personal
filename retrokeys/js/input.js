/**
 * Input Module
 * Handles typing logic, command processing, and history.
 */

import { appendToTerminal, updateInputDisplay, animateKey } from './ui.js';

let currentInput = '';
export const chatHistory = ["System: RetroKeys v2.0 Modular Initialized."];

export function processCommand(cmd) {
    if (!cmd) return;
    chatHistory.push(cmd);
    appendToTerminal(cmd, 'input');
    // Simple echo functionality or logic placeholder
    // appendToTerminal(`Processing: ${cmd}`);
}

export function handleInput(key) {
    // Visuals
    animateKey(key);

    // Logic
    if (key === 'Enter') {
        processCommand(currentInput);
        currentInput = '';
    } else if (key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
    } else if (key === 'Space') {
        currentInput += ' ';
    } else if (key.length === 1) {
        currentInput += key;
    }

    updateInputDisplay(currentInput);
}

export function getHistoryText() {
    return chatHistory.join('\n');
}
