// js/app.js
document.addEventListener('DOMContentLoaded', async () => {
  const success = await DataLoader.loadAll();
  
  if (success) {
    UI.init();
    MapEngine.init();
    
    // Hide loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  } else {
    document.getElementById('loader').innerHTML = `
      <div style="text-align:center; padding: 2rem;">
        <h2 style="color:var(--accent-red); margin-bottom:1rem;">Security Policy Error (CORS)</h2>
        <p style="color:var(--text-main);">The browser blocked loading the JSON databases.</p>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:1rem; max-width:400px;">
          Because modern browsers prevent the <code>fetch()</code> API from reading local <code>.json</code> files directly from your hard drive, you cannot just double-click the HTML file.
          <br><br>
          <strong>To Fix This:</strong> Run a local development server. <br>
          If you have VS Code, use the <strong>Live Server</strong> extension.<br>
          Or run <code>python3 -m http.server</code> in the terminal.
        </p>
      </div>`;
  }
});
