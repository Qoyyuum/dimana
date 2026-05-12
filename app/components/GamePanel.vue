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
          {{ $t('home.startButton') }}
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
            <option value="allMukims">{{ $t('home.studyingAll') }} (39)</option>
            <option value="bruneiMuara">Brunei-Muara (18)</option>
            <option value="belait">Belait (8)</option>
            <option value="tutong">Tutong (8)</option>
            <option value="temburong">Temburong (5)</option>
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
import { ref, nextTick } from 'vue'
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
</script>
