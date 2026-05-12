<template>
  <div class="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-4 px-4 pointer-events-none">
    <div class="card max-w-lg w-full pointer-events-auto shadow-lg">
      <!-- Idle / Welcome -->
      <div v-if="phase === 'idle'" class="text-center space-y-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ $t('home.welcome') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.description') }}
        </p>

        <button class="btn-primary w-full" @click="onStart">
          {{ $t(startButtonKey) }}
        </button>

        <!-- Mode toggle -->
        <div class="flex justify-center gap-2">
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="mode === 'nameIt'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
            @click="mode = 'nameIt'"
          >
            {{ $t('home.nameIt') }}
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="mode === 'findIt'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
            @click="mode = 'findIt'"
          >
            {{ $t('home.findIt') }}
          </button>
        </div>

        <!-- Study collection -->
        <div class="flex justify-center">
          <select
            v-model="studyCollection"
            class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <optgroup :label="$t('home.mukims')">
              <option value="allMukims">{{ $t('home.allMukims') }} (39)</option>
              <option value="bruneiMuara">Brunei-Muara (18)</option>
              <option value="belait">Belait (8)</option>
              <option value="tutong">Tutong (8)</option>
              <option value="temburong">Temburong (5)</option>
            </optgroup>
            <optgroup :label="$t('home.kampongs')">
              <option value="allKampongs">{{ $t('home.allKampongs') }} (418)</option>
              <option value="kampongsBruneiMuara">Brunei-Muara (186)</option>
              <option value="kampongsBelait">Belait (81)</option>
              <option value="kampongsTutong">Tutong (82)</option>
              <option value="kampongsTemburong">Temburong (69)</option>
            </optgroup>
          </select>
        </div>

        <!-- Stats summary -->
        <div v-if="learnedCount > 0" class="text-xs text-gray-500 dark:text-gray-400">
          <span v-if="dueCount > 0">{{ dueCount }} {{ $t('home.due') }} &middot; </span>
          <span v-if="newCount > 0">{{ newCount }} {{ $t('home.new') }} &middot; </span>
          {{ learnedCount }} {{ $t('home.of') }} {{ totalCount }} {{ $t('home.seen') }}
        </div>
      </div>

      <!-- Name It question -->
      <div v-else-if="phase === 'question' && mode === 'nameIt'" class="space-y-3">
        <p class="text-center text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.whichArea') }}
        </p>

        <div class="relative">
          <input
            ref="answerInput"
            v-model="userAnswer"
            class="input-field"
            :placeholder="$t('home.whichArea')"
            autocomplete="off"
            @input="onInputChange"
            @keydown.enter="onSubmitNameIt"
            @keydown.escape="localShowSuggestions = false"
          />

          <!-- Autocomplete suggestions -->
          <div
            v-if="(localShowSuggestions || props.showSuggestions) && props.suggestions.length > 0"
            class="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20"
          >
            <button
              v-for="s in props.suggestions"
              :key="s.id"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              @click="selectSuggestion(s.name)"
            >
              <span class="font-medium">{{ s.name }}</span>
              <span class="text-gray-400 text-xs ml-2">{{ s.district }}</span>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="$emit('giveUp')">
            {{ $t('home.dontKnow') }}
          </button>
          <button
            class="btn-primary flex-1"
            :disabled="!userAnswer.trim()"
            @click="onSubmitNameIt"
          >
            {{ $t('home.confirm') }}
          </button>
        </div>
      </div>

      <!-- Find It question -->
      <div v-else-if="phase === 'question' && mode === 'findIt'" class="space-y-3 text-center">
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.whereIs') }}
        </p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ currentArea?.name }}
        </p>
        <p class="text-xs text-gray-400">
          {{ $t('home.tapArea') }}
        </p>
        <button class="btn-ghost" @click="$emit('giveUp')">
          {{ $t('home.dontKnow') }}
        </button>
      </div>

      <!-- Result -->
      <div v-else-if="phase === 'result'" class="text-center space-y-3">
        <div v-if="isCorrect" class="space-y-1">
          <p class="text-lg font-bold text-green-600 dark:text-green-400">
            {{ $t('home.correct') }}
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ currentArea?.name }}
          </p>
        </div>
        <div v-else class="space-y-1">
          <p class="text-lg font-bold text-red-500">
            {{ $t('home.wrong') }}
          </p>
          <p class="text-sm text-gray-500">{{ $t('home.theAnswerWas') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ currentArea?.name }}
          </p>
        </div>

        <p class="text-xs text-gray-400">
          {{ currentArea?.district }}
        </p>

        <div class="flex gap-2">
          <button class="btn-ghost flex-1" @click="$emit('stop')">
            {{ $t('home.stopForNow') }}
          </button>
          <button class="btn-primary flex-1" @click="$emit('next')">
            {{ $t('home.next') }}
          </button>
        </div>

        <p class="text-xs text-gray-400">
          {{ $t('home.guessesCorrect', { correct: sessionCorrect, total: sessionTotal }) }}
        </p>
      </div>

      <!-- Session Complete -->
      <div v-else-if="phase === 'sessionComplete'" class="text-center space-y-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ $t('home.sessionComplete') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('home.guessesCorrect', { correct: sessionCorrect, total: sessionTotal }) }}
        </p>
        <div class="text-2xl tracking-wider">
          {{ scoreEmoji }}
        </div>

        <!-- Share buttons -->
        <div class="flex gap-2">
          <button
            class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            @click="shareToWhatsApp"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {{ $t('home.shareWhatsApp') }}
          </button>
          <button
            class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="copyScore"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            {{ copied ? $t('home.copied') : $t('home.copyScore') }}
          </button>
        </div>

        <div class="flex gap-2">
          <button class="btn-secondary flex-1" @click="phase = 'idle'">
            {{ $t('home.stop') }}
          </button>
          <button class="btn-primary flex-1" @click="onStart">
            {{ $t('home.keepGoing') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useI18n } from '#imports'
import type { GameMode, GamePhase, StudyCollection } from '~/composables/useGameState'
import type { AreaInfo } from '~/composables/useAreas'

const props = defineProps<{
  phase: GamePhase
  mode: GameMode
  studyCollection: StudyCollection
  currentArea: AreaInfo | null
  isCorrect: boolean
  sessionCorrect: number
  sessionTotal: number
  dueCount: number
  newCount: number
  learnedCount: number
  totalCount: number
  suggestions: AreaInfo[]
  showSuggestions: boolean
  sessionResults: boolean[]
}>()

const emit = defineEmits<{
  (e: 'start'): void
  (e: 'submitNameIt', answer: string): void
  (e: 'giveUp'): void
  (e: 'next'): void
  (e: 'stop'): void
  (e: 'updateSuggestions', query: string): void
}>()

const mode = defineModel<GameMode>('mode')
const studyCollection = defineModel<StudyCollection>('studyCollection')
const phase = defineModel<GamePhase>('phase')
const userAnswer = ref('')
const answerInput = ref<HTMLInputElement>()
const localShowSuggestions = ref(false)

const isKampongMode = computed(() => {
  const sc = studyCollection.value
  return sc === 'allKampongs' || (sc && sc.startsWith('kampongs'))
})

const startButtonKey = computed(() => {
  return isKampongMode.value ? 'home.startButtonKampongs' : 'home.startButtonMukims'
})

function onStart() {
  emit('start')
  nextTick(() => {
    answerInput.value?.focus()
  })
}

function onSubmitNameIt() {
  if (!userAnswer.value.trim()) return
  emit('submitNameIt', userAnswer.value.trim())
  userAnswer.value = ''
}

function onInputChange() {
  localShowSuggestions.value = userAnswer.value.length > 0
  emit('updateSuggestions', userAnswer.value)
}

function selectSuggestion(name: string) {
  userAnswer.value = name
  localShowSuggestions.value = false
  emit('submitNameIt', name)
  userAnswer.value = ''
}

const { t } = useI18n()
const copied = ref(false)

const scoreEmoji = computed(() => {
  return props.sessionResults.map(r => r ? '\u{1F7E9}' : '\u{1F7E5}').join('')
})

const collectionLabel = computed(() => {
  const sc = studyCollection.value
  const labels: Record<string, string> = {
    allMukims: t('home.allMukims'),
    allKampongs: t('home.allKampongs'),
    bruneiMuara: 'Brunei-Muara',
    belait: 'Belait',
    tutong: 'Tutong',
    temburong: 'Temburong',
    kampongsBruneiMuara: 'Brunei-Muara ' + t('home.kampongs'),
    kampongsBelait: 'Belait ' + t('home.kampongs'),
    kampongsTutong: 'Tutong ' + t('home.kampongs'),
    kampongsTemburong: 'Temburong ' + t('home.kampongs'),
  }
  return labels[sc || ''] || ''
})

function buildShareText(): string {
  const pct = props.sessionTotal > 0 ? Math.round(props.sessionCorrect / props.sessionTotal * 100) : 0
  return [
    `\u{1F30F} Di Mana? \u2014 ${collectionLabel.value}`,
    `${scoreEmoji.value}`,
    `${props.sessionCorrect}/${props.sessionTotal} (${pct}%)`,
    `dimana.co.bn`,
  ].join('\n')
}

function shareToWhatsApp() {
  const text = encodeURIComponent(buildShareText())
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

async function copyScore() {
  try {
    await navigator.clipboard.writeText(buildShareText())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea')
    ta.value = buildShareText()
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>
