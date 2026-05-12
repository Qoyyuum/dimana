// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  app: {
    head: {
      title: 'Di Mana? - Learn Brunei Geography',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Learn the districts, mukims, and kampongs of Brunei Darussalam with spaced repetition.' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css' },
      ],
    },
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ms', name: 'Bahasa Melayu', file: 'ms.json' },
    ],
    defaultLocale: 'en',
    langDir: '../i18n/locales/',
    strategy: 'prefix_except_default',
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
