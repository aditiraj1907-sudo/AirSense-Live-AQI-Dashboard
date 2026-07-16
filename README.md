# 🌿 AirSense — Real-Time Air Quality

A 3-page air quality web app with real-time AQI data, animated backgrounds, and health precautions.

## 📁 File Structure

```
airsense/
├── index.html   — Page structure & layout (3 pages)
├── style.css    — All styles, animations, background scenes
├── app.js       — AQI fetching, navigation, clock, health logic
└── README.md    — This file
```

## 🚀 How to Run

Just open `index.html` in any modern browser — no build step, no server needed.

```bash
# Option 1: Double-click index.html
# Option 2: Use VS Code Live Server extension
# Option 3: Python quick server
python3 -m http.server 8080
# then open http://localhost:8080
```

## 📄 Pages

| Page | Scene | Description |
|------|-------|-------------|
| 1 — Greeting | 🌿 Green forest | Real-time clock, greeting, location detect |
| 2 — Live AQI  | 🏙️ Smoggy city | Search any city, live pollutant breakdown |
| 3 — Health     | 🌿 Moody green | AQI-based precautions with animated emojis |

## 🌐 Data Sources

- **Air Quality:** [Open-Meteo Air Quality API](https://open-meteo.com/) (free, no key needed)
- **Geocoding:** [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) + Nominatim fallback
- **Location detect:** [ipapi.co](https://ipapi.co/) (free tier)


