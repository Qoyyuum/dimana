<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
      {{ $t('stats.title') }}
    </h1>

    <div v-if="storage.stats.value.totalReviews === 0" class="card text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">
        {{ $t('stats.noProgress') }}
      </p>
      <NuxtLink to="/" class="btn-primary mt-4 inline-block">
        {{ $t('home.startButton') }}
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ mukimLearned }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('stats.totalLearned') }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">
            {{ storage.stats.value.totalReviews }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('stats.totalReviews') }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {{ accuracy }}%
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('stats.accuracy') }}
          </p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {{ storage.stats.value.streak }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('stats.streak') }}
          </p>
        </div>
      </div>

      <!-- By district -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {{ $t('stats.byDistrict') }}
        </h2>
        <div class="space-y-4">
          <div v-for="district in districtProgress" :key="district.name">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ district.name }}</span>
              <span class="text-gray-500 dark:text-gray-400">
                {{ district.learned }} / {{ district.total }} {{ $t('stats.learned') }}
              </span>
            </div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="district.color"
                :style="{ width: (district.learned / district.total * 100) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStorage } from '~/composables/useStorage'
import { useAreas } from '~/composables/useAreas'

const storage = useStorage()
const areas = useAreas()

onMounted(async () => {
  await areas.loadAreas()
  storage.load()
})

const mukimLearned = computed(() => storage.getLearnedCount('mukim'))

const accuracy = computed(() => {
  const s = storage.stats.value
  if (s.totalReviews === 0) return 0
  return Math.round(s.correctReviews / s.totalReviews * 100)
})

const districtProgress = computed(() => {
  const districts = ['Brunei-Muara', 'Belait', 'Tutong', 'Temburong']
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']

  return districts.map((name, i) => {
    const mukims = areas.getAreasByDistrict(name)
    const learned = mukims.filter(m => {
      const card = storage.getCard(m.id)
      return card && card.reps > 0
    }).length

    return {
      name,
      total: mukims.length,
      learned,
      color: colors[i],
    }
  })
})
</script>
