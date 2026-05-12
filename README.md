# Di Mana? 🗺️

**Learn the geography of Brunei Darussalam** — an interactive map-based learning app that teaches you Brunei's districts, mukims, and kampongs using spaced repetition.

Inspired by [whereabouts.earth](https://whereabouts.earth), focused entirely on Brunei.

## Features

- **Name It** — A mukim or kampong is highlighted on the map. Type its name.
- **Find It** — Given a name, click the correct area on the map.
- **Quiz** — Multiple choice quizzes by district or area type.
- **Spaced Repetition (FSRS)** — Reviews are scheduled using the [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) algorithm so you learn efficiently.
- **Share Score** — Copy your Wordle-style emoji score to clipboard or share directly to WhatsApp.
- **Bilingual** — English and Bahasa Melayu.
- **Offline-ready** — All progress saved in localStorage. No account needed.

## What You Can Learn

| Level | Count |
|-------|-------|
| Districts | 4 |
| Mukims | 39 |
| Kampongs | 418 |

Study all areas at once, or focus on a single district: Brunei-Muara, Belait, Tutong, or Temburong.

## Tech Stack

- [Nuxt 3](https://nuxt.com) (Vue 3) with static site generation
- [MapLibre GL JS](https://maplibre.org) for interactive maps
- [Tailwind CSS](https://tailwindcss.com) v4
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) for spaced repetition
- [@nuxtjs/i18n](https://i18n.nuxtjs.org) for bilingual support

## Data Source

GIS data from the [bruneimap](https://github.com/Bruneiverse/bruneimap) R package by Haziq Jamil, sourced from [Nadi.BN](https://nadi.bn). Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
npx nuxt generate
```

Output is in `.output/public/` — deploy to any static host (Netlify, Vercel, Cloudflare Pages).

For Netlify:
- **Build command:** `npx nuxt generate`
- **Publish directory:** `.output/public`

## License

Data: CC BY 4.0 (bruneimap / Nadi.BN)
