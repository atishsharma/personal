# Atish's Hub Toolkit (Browser Local Bookmark Manager)

A beautiful, sleek, client-side web application for managing your bookmarks locally in your browser. 

## Features
- **Local Storage Driven**: All bookmarks and folder structures are kept entirely within your browser's local storage.
- **Chrome Import**: Quickly upload your exported Google Chrome bookmarks HTML file to parse and sync them into the Vault.
- **Folder Tree Management**: Create parent folders and nested sub-folders to organize your links.
- **Dual View Modes**: Switch seamlessly between a visual "Grid" mode with site snapshot placeholders, and a compact "List" mode.
- **Dark/Light Themes**: Supports a classy light mode and a slick dark mode.
- **Inspect Module**: Click on any bookmark to view its details, visit the link, or edit/delete it through a styled popup.
- **PWA Support**: Features a manifest and a service worker, allowing you to install the module as an app.

## File Structure
- `index.html`: The core user interface, styles, and Javascript logic.
- `sw.js`: The Service Worker for caching and offline capabilities.
- `manifest.json`: Web App Manifest defining icons, theme colors, and PWA settings.

## Getting Started
Open `index.html` in a web browser. Use the "Import" button to load your existing browser bookmarks, or add them manually via "Add Link". 
