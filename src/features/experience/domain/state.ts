import type { ExperienceState } from './contracts'

const transitions: Readonly<Record<ExperienceState, readonly ExperienceState[]>> = {
  idle: ['recentering', 'fallback'],
  recentering: ['opening', 'fallback'],
  opening: ['revealed', 'fallback'],
  revealed: ['fallback'],
  fallback: [],
}

export function canTransition(
  currentState: ExperienceState,
  nextState: ExperienceState
) {
  return currentState === nextState || transitions[currentState].includes(nextState)
}

export function assertTransition(
  currentState: ExperienceState,
  nextState: ExperienceState
) {
  if (!canTransition(currentState, nextState)) {
    throw new Error(`Invalid experience state transition: ${currentState} -> ${nextState}`)
  }
}
