<template>
  <div class="relative h-[calc(100vh-3.5rem)]">
    <!-- Map fills the screen -->
    <BruneiMap
      ref="mapRef"
      :clickable="game.mode.value === 'findIt' && game.phase.value === 'question'"
      :click-layer="currentLayer"
      @area-click="onMapClick"
      @map-ready="onMapReady"
    />

    <!-- Game panel overlay -->
    <GamePanel
      v-model:mode="game.mode.value"
      v-model:study-collection="game.studyCollection.value"
      v-model:phase="game.phase.value"
      :current-area="game.currentArea.value"
      :is-correct="game.isCorrect.value"
      :session-correct="game.sessionCorrect.value"
      :session-total="game.sessionTotal.value"
      :due-count="game.dueCount.value"
      :new-count="game.newCount.value"
      :learned-count="game.learnedCount.value"
      :total-count="game.totalCount.value"
      :suggestions="game.suggestions.value"
      :show-suggestions="game.showSuggestions.value"
      @start="onStartSession"
      @submit-name-it="onSubmitNameIt"
      @give-up="onGiveUp"
      @next="onNext"
      @stop="onStop"
      @update-suggestions="game.updateSuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useGameState } from '~/composables/useGameState'
import { useAreas } from '~/composables/useAreas'
import { useStorage } from '~/composables/useStorage'

const game = useGameState()
const areas = useAreas()
const storage = useStorage()
const mapRef = ref<InstanceType<typeof BruneiMap> | null>(null)
const mapReady = ref(false)

const currentLayer = computed(() => {
  return game.studyCollection.value === 'allKampongs' ? 'kampongs' : 'mukims'
})

onMounted(async () => {
  await areas.loadAreas()
  storage.load()
})

function onMapReady() {
  mapReady.value = true
}

function onStartSession() {
  game.startSession()
  if (game.currentArea.value && mapRef.value) {
    highlightCurrentArea()
  }
}

function highlightCurrentArea() {
  if (!game.currentArea.value || !mapRef.value) return

  const id = Number(game.currentArea.value.id.split('-')[1])
  const layer = currentLayer.value

  mapRef.value.clearHighlights()

  if (game.mode.value === 'nameIt') {
    mapRef.value.highlightArea(id, layer)
  } else {
    // Find It: enable clicking, don't highlight
    mapRef.value.enableClickableLayer(layer)
  }
}

function onSubmitNameIt(answer: string) {
  game.submitAnswer(answer)
  showResultOnMap()
}

function onMapClick(areaId: string, _name: string) {
  if (game.phase.value !== 'question' || game.mode.value !== 'findIt') return

  const currentId = game.currentArea.value?.id
  if (!currentId) return

  const clickedNumericId = areaId
  const expectedNumericId = currentId.split('-')[1]
  game.submitFindItAnswer(currentId.split('-')[0] + '-' + clickedNumericId)
  showResultOnMap()
}

function showResultOnMap() {
  if (!game.currentArea.value || !mapRef.value) return

  const id = Number(game.currentArea.value.id.split('-')[1])
  const layer = currentLayer.value

  mapRef.value.clearHighlights()
  mapRef.value.showResult(id, game.isCorrect.value, layer)
}

function onGiveUp() {
  game.giveUp()
  showResultOnMap()
}

function onNext() {
  game.nextQuestion()
  if (game.phase.value === 'question' && game.currentArea.value) {
    highlightCurrentArea()
  } else if (game.phase.value === 'sessionComplete') {
    mapRef.value?.clearHighlights()
    mapRef.value?.resetView()
  }
}

function onStop() {
  game.phase.value = 'idle'
  mapRef.value?.clearHighlights()
  mapRef.value?.resetView()
}

watch(() => game.phase.value, (newPhase) => {
  if (newPhase === 'idle' || newPhase === 'sessionComplete') {
    mapRef.value?.clearHighlights()
  }
})
</script>
