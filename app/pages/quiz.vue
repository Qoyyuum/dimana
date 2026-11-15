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
      <div class="text-2xl tracking-wider">
        {{ quizScoreEmoji }}
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('quiz.yourScore', { score, total: quizAreas.length }) }}
      </p>
      <div class="text-4xl font-bold" :class="scoreColor">
        {{ Math.round(score / quizAreas.length * 100) }}%
      </div>

      <!-- Share button row -->
      <div class="flex gap-2">
        <button
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          @click="copyQuizScore"
        >
          <svg v-if="!quizCopied" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ quizCopied ? $t('home.copied') : $t('home.share') }}
        </button>
        <button
          class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          @click="shareQuizToWhatsApp"
          :title="$t('home.shareWhatsApp')"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
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

      <!-- Kampong quizzes -->
      <div class="col-span-full mt-4">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ $t('home.kampongs') }}</h2>
      </div>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('allKampongs')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.allKampongs') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.allKampongsDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('kampongsBruneiMuara')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.kampongsBruneiMuara') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.kampongsBruneiMuaraDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('kampongsBelait')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.kampongsBelait') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.kampongsBelaitDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('kampongsTutong')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.kampongsTutong') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.kampongsTutongDesc') }}</p>
      </button>

      <button
        class="card text-left hover:shadow-md transition-shadow cursor-pointer"
        @click="startQuiz('kampongsTemburong')"
      >
        <h3 class="font-bold text-gray-900 dark:text-white">{{ $t('quiz.kampongsTemburong') }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('quiz.kampongsTemburongDesc') }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '#imports'
import { useAreas, type AreaInfo } from '~/composables/useAreas'

const { t } = useI18n()
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
const allPoolNames = ref<string[]>([])
const quizResults = ref<boolean[]>([])
const quizCopied = ref(false)

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
    case 'allKampongs':
      pool = areas.getValidKampongs()
      break
    case 'kampongsBruneiMuara':
      pool = areas.getKampongsByDistrict('Brunei-Muara')
      break
    case 'kampongsBelait':
      pool = areas.getKampongsByDistrict('Belait')
      break
    case 'kampongsTutong':
      pool = areas.getKampongsByDistrict('Tutong')
      break
    case 'kampongsTemburong':
      pool = areas.getKampongsByDistrict('Temburong')
      break
  }

  // Shuffle and cap at 20 for large pools
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  quizAreas.value = shuffled.length > 20 ? shuffled.slice(0, 20) : shuffled
  allPoolNames.value = [...new Set(pool.map(a => a.name).filter(Boolean))]
  currentIndex.value = 0
  score.value = 0
  quizResults.value = []
  quizActive.value = true
  quizComplete.value = false
  generateOptions()
}

function generateOptions() {
  const correct = quizAreas.value[currentIndex.value]
  if (!correct) return

  const wrong = allPoolNames.value
    .filter(n => n !== correct.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  currentOptions.value = [...wrong, correct.name].sort(() => Math.random() - 0.5)
  answered.value = false
  selectedOption.value = ''
}

function onSelectOption(option: string) {
  if (answered.value) return
  selectedOption.value = option
  answered.value = true
  const isCorrect = option === quizAreas.value[currentIndex.value].name
  if (isCorrect) score.value++
  quizResults.value.push(isCorrect)
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
  quizResults.value = []
}

const quizScoreEmoji = computed(() => {
  return quizResults.value.map(r => r ? '\u{1F7E9}' : '\u{1F7E5}').join('')
})

const quizCategoryLabel = computed(() => {
  const labels: Record<string, string> = {
    allMukims: t('quiz.allMukims'),
    allDistricts: t('quiz.allDistricts'),
    bruneiMuara: 'Brunei-Muara',
    belait: 'Belait',
    tutong: 'Tutong',
    temburong: 'Temburong',
    allKampongs: t('home.allKampongs'),
    kampongsBruneiMuara: 'Brunei-Muara ' + t('home.kampongs'),
    kampongsBelait: 'Belait ' + t('home.kampongs'),
    kampongsTutong: 'Tutong ' + t('home.kampongs'),
    kampongsTemburong: 'Temburong ' + t('home.kampongs'),
  }
  return labels[lastCategory.value] || ''
})

function buildQuizShareText(): string {
  const pct = quizAreas.value.length > 0 ? Math.round(score.value / quizAreas.value.length * 100) : 0
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return [
    `\u{1F5FA}\u{FE0F} Di Mana? Quiz \u2014 ${date}`,
    `${score.value}/${quizAreas.value.length} ${quizCategoryLabel.value} (${pct}%)`,
    `${quizScoreEmoji.value}`,
    `#DiMana`,
    `https://dimana.co.bn`,
  ].join('\n')
}

function shareQuizToWhatsApp() {
  const text = encodeURIComponent(buildQuizShareText())
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

async function copyQuizScore() {
  try {
    await navigator.clipboard.writeText(buildQuizShareText())
    quizCopied.value = true
    setTimeout(() => { quizCopied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = buildQuizShareText()
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    quizCopied.value = true
    setTimeout(() => { quizCopied.value = false }, 2000)
  }
}
</script>
