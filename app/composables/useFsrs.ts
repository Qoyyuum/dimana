import { fsrs, createEmptyCard, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs'
import type { CardState } from './useStorage'

const params = generatorParameters({ enable_fuzz: true })
const scheduler = fsrs(params)

export function useFsrs() {
  function createNewCard(id: string, name: string, type: 'mukim' | 'kampong' | 'district', district: string): CardState {
    const card = createEmptyCard()
    return {
      id,
      name,
      type,
      district,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays: card.elapsed_days,
      scheduledDays: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      due: card.due.toISOString(),
      lastReview: card.last_review ? new Date(card.last_review).toISOString() : null,
    }
  }

  function toFsrsCard(cardState: CardState): Card {
    return {
      stability: cardState.stability,
      difficulty: cardState.difficulty,
      elapsed_days: cardState.elapsedDays,
      scheduled_days: cardState.scheduledDays,
      reps: cardState.reps,
      lapses: cardState.lapses,
      state: cardState.state,
      due: new Date(cardState.due),
      last_review: cardState.lastReview ? new Date(cardState.lastReview) : undefined,
    } as Card
  }

  function reviewCard(cardState: CardState, correct: boolean): CardState {
    const card = toFsrsCard(cardState)
    const grade: Grade = correct ? Rating.Good : Rating.Again
    const result = scheduler.repeat(card, new Date())
    const updated = result[grade].card

    return {
      ...cardState,
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsedDays: updated.elapsed_days,
      scheduledDays: updated.scheduled_days,
      reps: updated.reps,
      lapses: updated.lapses,
      state: updated.state,
      due: updated.due.toISOString(),
      lastReview: updated.last_review ? new Date(updated.last_review).toISOString() : null,
    }
  }

  return {
    createNewCard,
    reviewCard,
  }
}
