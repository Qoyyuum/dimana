import { ref, computed } from 'vue'
import { useStorage, type CardState } from './useStorage'
import { useFsrs } from './useFsrs'
import { useAreas, type AreaInfo } from './useAreas'

export type GameMode = 'nameIt' | 'findIt'
export type GamePhase = 'idle' | 'question' | 'result' | 'sessionComplete'
export type StudyCollection = 'allMukims' | 'allKampongs' | 'bruneiMuara' | 'belait' | 'tutong' | 'temburong'

export function useGameState() {
  const storage = useStorage()
  const fsrsHelper = useFsrs()
  const areas = useAreas()

  const mode = ref<GameMode>('nameIt')
  const phase = ref<GamePhase>('idle')
  const studyCollection = ref<StudyCollection>('allMukims')
  const currentArea = ref<AreaInfo | null>(null)
  const userAnswer = ref('')
  const isCorrect = ref(false)
  const sessionCorrect = ref(0)
  const sessionTotal = ref(0)
  const queue = ref<AreaInfo[]>([])
  const showSuggestions = ref(false)
  const suggestions = ref<AreaInfo[]>([])

  function getCollectionAreas(): AreaInfo[] {
    switch (studyCollection.value) {
      case 'allMukims':
        return areas.getAllMukims()
      case 'allKampongs':
        return areas.getAllKampongs()
      case 'bruneiMuara':
        return areas.getAreasByDistrict('Brunei-Muara')
      case 'belait':
        return areas.getAreasByDistrict('Belait')
      case 'tutong':
        return areas.getAreasByDistrict('Tutong')
      case 'temburong':
        return areas.getAreasByDistrict('Temburong')
      default:
        return areas.getAllMukims()
    }
  }

  function buildQueue(count = 5) {
    const collectionAreas = getCollectionAreas()
    const now = new Date()

    // Get due cards
    const dueCards: { area: AreaInfo; card: CardState }[] = []
    const newAreas: AreaInfo[] = []

    for (const area of collectionAreas) {
      const card = storage.getCard(area.id)
      if (!card) {
        newAreas.push(area)
      } else if (new Date(card.due) <= now) {
        dueCards.push({ area, card })
      }
    }

    // Sort due cards by due date (most overdue first)
    dueCards.sort((a, b) => new Date(a.card.due).getTime() - new Date(b.card.due).getTime())

    const result: AreaInfo[] = []

    // Add due cards first
    for (const { area } of dueCards) {
      if (result.length >= count) break
      result.push(area)
    }

    // Fill remaining with new areas (shuffled)
    const shuffled = [...newAreas].sort(() => Math.random() - 0.5)
    for (const area of shuffled) {
      if (result.length >= count) break
      result.push(area)
    }

    queue.value = result
  }

  function startSession(count = 5) {
    storage.load()
    sessionCorrect.value = 0
    sessionTotal.value = 0
    buildQueue(count)

    if (queue.value.length > 0) {
      nextQuestion()
    } else {
      phase.value = 'idle'
    }
  }

  function nextQuestion() {
    if (queue.value.length === 0) {
      phase.value = 'sessionComplete'
      return
    }

    currentArea.value = queue.value.shift()!
    userAnswer.value = ''
    isCorrect.value = false
    showSuggestions.value = false
    suggestions.value = []
    phase.value = 'question'
  }

  function submitAnswer(answer?: string) {
    if (!currentArea.value) return

    const given = (answer || userAnswer.value).trim().toLowerCase()
    const correct = currentArea.value.name.toLowerCase()
    isCorrect.value = given === correct

    processResult()
  }

  function submitFindItAnswer(areaId: string) {
    if (!currentArea.value) return
    isCorrect.value = areaId === currentArea.value.id
    processResult()
  }

  function giveUp() {
    if (!currentArea.value) return
    isCorrect.value = false
    processResult()
  }

  function processResult() {
    if (!currentArea.value) return

    sessionTotal.value++
    if (isCorrect.value) sessionCorrect.value++

    // Update FSRS card
    let card = storage.getCard(currentArea.value.id)
    if (!card) {
      card = fsrsHelper.createNewCard(
        currentArea.value.id,
        currentArea.value.name,
        currentArea.value.type,
        currentArea.value.district
      )
    }

    card = fsrsHelper.reviewCard(card, isCorrect.value)
    storage.setCard(card)
    storage.recordReview(isCorrect.value)

    phase.value = 'result'
  }

  function updateSuggestions(query: string) {
    if (!query || query.length < 1) {
      suggestions.value = []
      showSuggestions.value = false
      return
    }

    const type = studyCollection.value === 'allKampongs' ? 'kampong' : 'mukim'
    suggestions.value = areas.searchAreas(query, type)
    showSuggestions.value = suggestions.value.length > 0
  }

  const dueCount = computed(() => {
    const collectionAreas = getCollectionAreas()
    const now = new Date()
    return collectionAreas.filter(area => {
      const card = storage.getCard(area.id)
      return card && new Date(card.due) <= now
    }).length
  })

  const newCount = computed(() => {
    const collectionAreas = getCollectionAreas()
    return collectionAreas.filter(area => !storage.getCard(area.id)).length
  })

  const learnedCount = computed(() => {
    const collectionAreas = getCollectionAreas()
    return collectionAreas.filter(area => {
      const card = storage.getCard(area.id)
      return card && card.reps > 0
    }).length
  })

  const totalCount = computed(() => getCollectionAreas().length)

  return {
    mode,
    phase,
    studyCollection,
    currentArea,
    userAnswer,
    isCorrect,
    sessionCorrect,
    sessionTotal,
    queue,
    showSuggestions,
    suggestions,
    dueCount,
    newCount,
    learnedCount,
    totalCount,
    startSession,
    nextQuestion,
    submitAnswer,
    submitFindItAnswer,
    giveUp,
    updateSuggestions,
    getCollectionAreas,
  }
}
