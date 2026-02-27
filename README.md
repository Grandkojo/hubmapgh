# 🇬🇭 GH Tech Hubs — Ghana Tech Ecosystem Directory

> A community-maintained directory of co-working spaces, incubators, accelerators, and makerspaces across Ghana.

Built for the [DEV Weekend Challenge: Build for Your Community](https://dev.to/challenges/weekend-2026-02-28).

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## 📦 Deploy to Vercel (2 mins)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial commit"
gh repo create ghana-tech-hubs --public --push

# 2. Go to vercel.com → "Add New Project" → import your repo → Deploy
# That's it. Vercel auto-detects Next.js.
```

## 🗂️ Project Structure

```
├── data/
│   └── hubs.json          ← All hub data lives here. Edit this to add hubs.
├── src/
│   ├── app/
│   │   ├── globals.css    ← Global styles + Leaflet dark theme
│   │   ├── layout.tsx     ← Root layout + metadata
│   │   └── page.tsx       ← Main app page (all state logic here)
│   ├── components/
│   │   ├── HubCard.tsx    ← Individual hub card
│   │   ├── HubMap.tsx     ← Leaflet map (client-only)
│   │   ├── FilterBar.tsx  ← City + tag filters
│   │   └── SearchBar.tsx  ← Real-time search input
│   └── types/
│       └── hub.ts         ← TypeScript types
```

## ➕ Adding a New Hub

Edit `data/hubs.json` and add an entry:

```json
{
  "id": "unique-slug",
  "name": "Hub Name",
  "city": "Accra",
  "neighborhood": "East Legon",
  "description": "Short description of the hub.",
  "tags": ["Co-working", "Incubator"],
  "website": "https://example.com",
  "coordinates": { "lat": 5.6356, "lng": -0.1638 },
  "verified": false,
  "founded": 2023,
  "contact": ""
}
```

**To find coordinates:** Go to [Google Maps](https://maps.google.com), right-click the hub location, and copy the lat/lng.

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — styling
- **Leaflet + react-leaflet** — interactive map
- **Vercel** — deployment
- **Static JSON** — data source (no database needed for v1)

## 🗺️ Roadmap (V2)

- [ ] Hub submission form with admin approval
- [ ] User reviews and ratings
- [ ] Events calendar integration
- [ ] "Near me" geolocation filter
- [ ] PWA / offline support

## 👤 Author

Built by [Ernest Kojo Owusu Essien](https://portfolio.grandkojo.my) — Software Engineer, Accra 🇬🇭

---

*Data is community-maintained. If you spot an error or want to add a hub, open a PR.*
# hubmapgh
