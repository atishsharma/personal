# My Personal Website

Static blog built with GitHub Pages | Hosted at: https://atishaksharma.com/  
This repository holds the source for my personal blog/site, as well as several web applications and experimental tools I am testing.

---

## 🚀 What This Is

This is the codebase that powers my personal blog and portfolio of interactive web applications. It's a **GitHub Pages** site — plain HTML, CSS (Tailwind), and vanilla JavaScript with minimal dependencies.

Content is entirely static, served from this repo’s **main** branch.

---

## 📂 Repository Overview (Projects & Apps)

| File / Folder | Purpose |
|---------------|---------|
| `index.html` | Main homepage and blog entry point. |
| `ember/` | **EmberLoom**: A beautiful artisanal candle brand project with 3 main pages:<br>- `index.html`: Premium Storefront with scroll animations and lookbook.<br>- `market.html`: Business intelligence dashboard powered by Chart.js.<br>- `studio/index.html`: Interactive web-based crochet pattern designer and PDF exporter. |
| `calendar/` | Interactive month-view calendar widget module. |
| `memo/` | Quick notes and temporary memo application. |
| `tulip/` | Experimental project/module. |
| `hub/`, `lab/` | Blog sections, content directories, and testing environments. |
| `manifest.json`, `sw.js` | Service worker and manifest for offline caching and PWA support. |
| `CNAME` | Points custom domain to GitHub Pages. |

---

## 🛠 How to Work on This

You don’t need anything fancy — just a text editor and Git.

### Local Preview

Since this is static HTML, you can test locally with a simple server. For example:

### Python 3
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

## ⚡ Want to Extend?

Future ideas (no sugar-coat):
* Migrate to a proper static site generator (Jekyll / Hugo) for templating.
* Add automated CI/CD for previews (GitHub Actions).
* Improve PWA support (offline reading, caching strategy updates).
* Add comments (e.g., Staticman or a lightweight solution).

## 📬 Connect

Built & maintained by Atish Sharma.
Hit me up via the site or any socials linked on it.

## 📜 License

Feel free to add a license if you want open use (MIT recommended).

### Clone

```bash
git clone https://github.com/atishsharma/personal.git
cd personal
```
