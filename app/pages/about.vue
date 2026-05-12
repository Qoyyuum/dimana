<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
      {{ $t('about.title') }}
    </h1>

    <div class="space-y-6">
      <!-- How it works -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('about.howItWorks') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-3">
          {{ $t('about.howItWorksText') }}
        </p>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('about.spacedRepetition') }}
        </p>
      </div>

      <!-- What's covered -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('about.whatsCovered') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('about.whatsCoveredText') }}
        </p>
      </div>

      <!-- Data credits -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {{ $t('about.data') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ $t('about.dataText') }}
        </p>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <span class="text-blue-500 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                <a href="https://github.com/Bruneiverse/bruneimap" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">
                  bruneimap
                </a>
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Maps and Spatial Data of Brunei by Haziq Jamil. GIS data sourced from
                <a href="https://www.nadi.bn" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Nadi.BN</a>,
                licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">CC BY 4.0</a>.
              </p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-green-500 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ $t('about.osmCredit') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <a href="https://www.openstreetmap.org" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">openstreetmap.org</a>
              </p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-purple-500 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ $t('about.maplibreCredit') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <a href="https://maplibre.org" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">maplibre.org</a>
              </p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-orange-500 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ $t('about.fsrsCredit') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <a href="https://github.com/open-spaced-repetition/ts-fsrs" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">github.com/open-spaced-repetition/ts-fsrs</a>
              </p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Inspired by -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Inspired by
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          This project is inspired by
          <a href="https://whereabouts.earth" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">whereabouts.earth</a>
          by Trey Hunner — a spaced repetition app for learning world geography. Di Mana? adapts the same concept for Brunei Darussalam's administrative divisions.
        </p>
      </div>

      <!-- Open Source -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('about.openSource') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('about.openSourceText') }}
        </p>
      </div>

      <!-- Privacy -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('about.privacy') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('about.privacyText') }}
        </p>
      </div>
    </div>
  </div>
</template>
