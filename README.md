# 🍳 Reciplore — Frontend Application

Modern Single Page Application for Reciplore built with React 19, Vite 6, Tailwind CSS v4, and Zustand.

---

## ⚡ Enhancements & Optimizations

- **Route Code Splitting**: All page routes are loaded asynchronously with `React.lazy()` and `<Suspense>` skeletons.
- **Vendor Chunk Splitting**: Rollup `manualChunks` in `vite.config.js` splits `vendor`, `ui`, and `utils`, reducing initial gzipped bundle to ~71 kB.
- **Centralized Auth & Session Handling**: Overhauled `authStore.js` with `getAuthHeaders()`, automatic token refresh, clean session restore, and eliminated all `accessToken_undefined` bugs.
- **Graceful UI Fallbacks**: Skeletons, placeholder images, and error bounds for banners, cards, and AI recommendations.
- **Fixed Cart & Favorite Management**: Synchronized state with backend routes `/auth/toggle-favourite`, `/cart/add`, `/cart/remove`, and `/order/stripe`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_BACKEND_URL=http://localhost:5000`.
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
