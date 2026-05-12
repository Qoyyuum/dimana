<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
        <span class="text-2xl">🌏</span>
        <span>Di Mana?</span>
      </NuxtLink>

      <!-- Nav links -->
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/"
          class="btn-ghost"
          :class="{ '!text-blue-600 dark:!text-blue-400': $route.path === '/' || $route.path === '/ms' }"
        >
          {{ $t('nav.home') }}
        </NuxtLink>
        <NuxtLink
          to="/quiz"
          class="btn-ghost"
          :class="{ '!text-blue-600 dark:!text-blue-400': $route.path.includes('/quiz') }"
        >
          {{ $t('nav.quiz') }}
        </NuxtLink>
        <NuxtLink
          to="/stats"
          class="btn-ghost"
          :class="{ '!text-blue-600 dark:!text-blue-400': $route.path.includes('/stats') }"
        >
          {{ $t('nav.stats') }}
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="btn-ghost"
          :class="{ '!text-blue-600 dark:!text-blue-400': $route.path.includes('/about') }"
        >
          {{ $t('nav.about') }}
        </NuxtLink>

        <!-- Language toggle -->
        <button
          class="btn-ghost text-xs"
          @click="toggleLocale"
        >
          {{ locale === 'en' ? 'MS' : 'EN' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()

function toggleLocale() {
  const newLocale = locale.value === 'en' ? 'ms' : 'en'
  setLocale(newLocale)
}
</script>
