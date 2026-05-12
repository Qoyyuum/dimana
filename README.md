# Di Mana?

Learn Brunei Darussalam's geography with spaced repetition.

**Preview:** https://public-tsxkljgo.devinapps.com

## Features

- 🗺️ Interactive map with MapLibre GL JS
- 📝 Name It & Find It study modes
- 🧠 FSRS spaced repetition scheduling
- 📊 Quiz mode with multiple choice by district
- 🌐 Bilingual UI (English / Bahasa Melayu)
- 💾 Progress saved locally (no account needed)

## Data

- 4 districts, 39 mukims, 451 kampongs
- GIS data from [bruneimap](https://github.com/Bruneiverse/bruneimap) by Haziq Jamil
- Source: [Nadi.BN](https://www.nadi.bn), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Tech Stack

- [Nuxt 3](https://nuxt.com) + [Vue 3](https://vuejs.org)
- [MapLibre GL JS](https://maplibre.org) + OpenStreetMap tiles
- [Tailwind CSS](https://tailwindcss.com)
- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- [@nuxtjs/i18n](https://i18n.nuxtjs.org)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run generate
```

Output in `.output/public/` — deploy to any static host.

## License

MIT

## Acknowledgements

Inspired by [whereabouts.earth](https://whereabouts.earth) by Trey Hunner.
