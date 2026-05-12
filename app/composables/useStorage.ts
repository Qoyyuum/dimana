import { ref, watch } from 'vue'

export interface CardState {
  id: string
  name: string
  type: 'mukim' | 'kampong' | 'district'
  district: string
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: number // 0=New, 1=Learning, 2=Review, 3=Relearning
  due: string // ISO date string
  lastReview: string | null
}

export interface ProgressStats {
  totalReviews: number
  correctReviews: number
  lastSessionDate: string | null
  streak: number
}

const CARDS_KEY = 'dimana-cards'
const STATS_KEY = 'dimana-stats'

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function useStorage() {
  const cards = ref<Record<string, CardState>>({})
  const stats = ref<ProgressStats>({
    totalReviews: 0,
    correctReviews: 0,
    lastSessionDate: null,
    streak: 0,
  })

  function load() {
    cards.value = loadFromStorage<Record<string, CardState>>(CARDS_KEY, {})
    stats.value = loadFromStorage<ProgressStats>(STATS_KEY, {
      totalReviews: 0,
      correctReviews: 0,
      lastSessionDate: null,
      streak: 0,
    })
  }

  function saveCards() {
    saveToStorage(CARDS_KEY, cards.value)
  }

  function saveStats() {
    saveToStorage(STATS_KEY, stats.value)
  }

  function getCard(id: string): CardState | undefined {
    return cards.value[id]
  }

  function setCard(card: CardState) {
    cards.value[card.id] = card
    saveCards()
  }

  function recordReview(correct: boolean) {
    stats.value.totalReviews++
    if (correct) stats.value.correctReviews++

    const today = new Date().toISOString().split('T')[0]
    if (stats.value.lastSessionDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (stats.value.lastSessionDate === yesterday) {
        stats.value.streak++
      } else {
        stats.value.streak = 1
      }
      stats.value.lastSessionDate = today
    }

    saveStats()
  }

  function getLearnedCount(type?: string): number {
    return Object.values(cards.value).filter(
      c => c.reps > 0 && (!type || c.type === type)
    ).length
  }

  function getDueCards(type?: string): CardState[] {
    const now = new Date()
    return Object.values(cards.value).filter(c => {
      if (type && c.type !== type) return false
      return new Date(c.due) <= now
    })
  }

  function resetProgress() {
    cards.value = {}
    stats.value = {
      totalReviews: 0,
      correctReviews: 0,
      lastSessionDate: null,
      streak: 0,
    }
    saveCards()
    saveStats()
  }

  return {
    cards,
    stats,
    load,
    getCard,
    setCard,
    recordReview,
    getLearnedCount,
    getDueCards,
    resetProgress,
  }
}
