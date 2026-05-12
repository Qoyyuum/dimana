<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
      {{ $t('quiz.title') }}
    </h1>
    <p class="text-center text-gray-500 dark:text-gray-400 mb-8">
      {{ $t('quiz.description') }}
    </p>

    <!-- Quiz in progress -->
    <div v-if="quizActive" class="space-y-4">
      <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{{ $t('quiz.score') }}: {{ score }} / {{ currentIndex }}</span>
        <span>{{ currentIndex }} / {{ quizAreas.length }}</span>
      </div>

      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-600 transition-all duration-300"
          :style="{ width: (currentIndex / quizAreas.length * 100) + '%' }"
        />
      </div>

      <div class="card text-center space-y-4">
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ $t('home.whichArea') }}
        </p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ quizAreas[currentIndex]?.name || '' }}
        </p>

        <!-- Multiple choice options -->
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in currentOptions"
            :key="option"
            class="px-4 py-3 rounded-lg border text-sm font-medium transition-all"
            :class="getOptionClass(option)"
            :disabled="answered"
            @click="onSelectOption(option)"
          >
            {{ option }}
          </button>
        </div>

        <button
          v-if="answered"
          class="btn-primary w-full"
          @click="nextQuizQuestion"
        >
          {{ currentIndex < quizAreas.length - 1 ? $t('home.next') : $t('quiz.quizComplete') }}
        </button>
      </div>
    </div>

    <!-- Quiz complete -->
    <div v-else-if="quizComplete" class="card text-center space-y-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('quiz.quizComplete') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('quiz.yourScore', { score, total: quizAreas.length }) }}
      </p>
      <div class="text-4xl font-bold" :class="scoreColor">
        {{ Math.round(score / quizAreas.length * 100) }}%
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary flex-1" @click="resetQuiz">
          {{ $t('quiz.backToQuizzes') }}
        </button>
        <button class="btn-primary flex-1" @click="startQuiz(lastCategory)">
          {{ $t('quiz.tryAgain') }}
        </button>
      </div>
    </div>

    <!-- Quiz selection -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('allMukims')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.allMukims') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.allMukimsDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('allDistricts')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.allDistricts') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.allDistrictsDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('bruneiMuara')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.bruneiMuara') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.bruneiMuaraDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('belait')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.belait') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.belaitDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('tutong')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.tutong') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.tutongDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('temburong')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.temburong') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.temburongDesc') }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAreas, type AreaInfo } from '~/composables/useAreas'

const areas = useAreas()

const quizActive = ref(false)
const quizComplete = ref(false)
const quizAreas = ref<AreaInfo[]>([])
const currentIndex = ref(0)
const score = ref(0)
const answered = ref(false)
const selectedOption = ref('')
const currentOptions = ref<string[]>([])
const lastCategory = ref('')

onMounted(async () => {
  await areas.loadAreas()
})

const scoreColor = computed(() => {
  const pct = score.value / quizAreas.value.length
  if (pct >= 0.8) return 'text-green-600 dark:text-green-400'
  if (pct >= 0.5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-500'
})

function startQuiz(category: string) {
  lastCategory.value = category
  let pool: AreaInfo[] = []

  switch (category) {
    case 'allMukims':
      pool = areas.getAllMukims()
      break
    case 'allDistricts':
      pool = (areas.areasData.value?.districts || []) as AreaInfo[]
      break
    case 'bruneiMuara':
      pool = areas.getAreasByDistrict('Brunei-Muara')
      break
    case 'belait':
      pool = areas.getAreasByDistrict('Belait')
      break
    case 'tutong':
      pool = areas.getAreasByDistrict('Tutong')
      break
    case 'temburong':
      pool = areas.getAreasByDistrict('Temburong')
      break
  }

  // Shuffle
  quizAreas.value = [...pool].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  score.value = 0
  quizActive.value = true
  quizComplete.value = false
  generateOptions()
}

function generateOptions() {
  const correct = quizAreas.value[currentIndex.value]
  if (!correct) return

  const allNames = quizAreas.value.map(a => a.name)
  const wrong = allNames.filter(n => n !== correct.name).sort(() => Math.random() - 0.5).slice(0, 3)
  currentOptions.value = [...wrong, correct.name].sort(() => Math.random() - 0.5)
  answered.value = false
  selectedOption.value = ''
}

function onSelectOption(option: string) {
  if (answered.value) return
  selectedOption.value = option
  answered.value = true
  if (option === quizAreas.value[currentIndex.value].name) {
    score.value++
  }
}

function getOptionClass(option: string) {
  if (!answered.value) {
    return 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
  }

  const correct = quizAreas.value[currentIndex.value].name
  if (option === correct) {
    return 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  }
  if (option === selectedOption.value && option !== correct) {
    return 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }
  return 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
}

function nextQuizQuestion() {
  currentIndex.value++
  if (currentIndex.value >= quizAreas.value.length) {
    quizActive.value = false
    quizComplete.value = true
  } else {
    generateOptions()
  }
}

function resetQuiz() {
  quizActive.value = false
  quizComplete.value = false
  quizAreas.value = []
  currentIndex.value = 0
  score.value = 0
}
</script>
