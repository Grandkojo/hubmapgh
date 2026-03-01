# 🇬🇭 Hub Map GH — Ghana Tech Ecosystem Directory

> The definitive community-maintained directory of co-working spaces, incubators, accelerators, and makerspaces across Ghana.

Built for the [DEV Weekend Challenge: Build for Your Community](https://dev.to/challenges/weekend-2026-02-28).

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment Variables
# Copy .env.local.example to .env.local and fill in your keys:
# - Firebase Config (Console > Project Settings)
# - Gemini API Key (aistudio.google.com)

# 3. Run dev server
npm run dev

# 4. Open http://localhost:3000
```

## 🛠️ Tech Stack

- **Next.js 14** (App Router) — core framework
- **Firebase Firestore** — real-time database & global caching
- **Firebase Auth** — secure admin console access
- **Google Gemini Pro** — AI-powered hub recommendations
- **Tailwind CSS** — premium styling & glassmorphism
- **Leaflet** — interactive map engine
- **Vitest** — unit & integration testing

## 🗂️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── admin/         ← Admin Dashboard & Login
│   │   ├── api/           ← Serverless API routes (AI, Hubs, Admin)
│   │   └── page.tsx       ← Main Map & Recommender interface
│   ├── components/
│   │   ├── AIRecommender.tsx  ← Gemini-powered search
│   │   ├── HubCard.tsx    ← Shared & Native Share API
│   │   └── ConfirmModal.tsx ← Custom premium dialogs
│   ├── context/
│   │   └── AuthContext.tsx ← Firebase User state
│   ├── lib/
│   │   ├── firebase.ts    ← DB, Auth, and Analytics init
│   │   └── cache.ts       ← Server-side performance layer
│   └── test/              ← Vitest test suite
```

## ✨ New in V2
- **AI Matching**: Natural language search for hubs using Gemini Pro.
- **Admin Console**: Secure dashboard to approve community submissions and manage metadata.
- **Sustainability**: IP-based AI usage limits (3/day) to keep operations within free tiers.
- **Native Sharing**: Share hubs to any app using the Web Share API.
- **Performance**: Multi-layer caching (Memory + Firestore Metadata) for sub-50ms map loads.

## 👤 Author

Built by [Ernest Kojo Owusu Essien](https://portfolio.grandkojo.my) — Software Engineer, Accra 🇬🇭

---

*Data is community-maintained. Verified by the Hub Map GH Admin team.*