# M3-Shade — Frontend
## Struktur Project

```
m3-shade-nuxt/
├── assets/
│   └── css/main.css          # Global styles
├── composables/
│   ├── useImageProcessor.js  # K-Means skin tone analyzer
│   └── useApiClient.js       # Anthropic API & shade matching
├── layouts/
│   ├── default.vue           # Layout utama (navbar + footer)
│   └── chatbot.vue           # Layout halaman chatbot
├── pages/
│   ├── index.vue             # Halaman Home
│   ├── find-your-shade.vue   # Upload & analisis foto
│   ├── skin-guide.vue        # Panduan undertone
│   └── chatbot.vue           # AI Chatbot
├── public/
│   └── *.png                 # Gambar aset
├── nuxt.config.ts
└── package.json
```

## Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 3. Build untuk production

```bash
npm run build
npm run preview
```

## Fitur

- **Home** — Halaman landing dengan hero section, steps, dan komunitas
- **Find Your Shade** — Upload foto wajah → analisis warna kulit dengan K-Means clustering → rekomendasi foundation
- **Skin Guide** — Panduan undertone (Warm/Cool/Neutral) + tabel visual
- **Chatbot** — AI assistant berbasis Anthropic Claude untuk konsultasi makeup
