import type { ExperienceState } from './contracts'

const transitions: Readonly<Record<ExperienceState, readonly ExperienceState[]>> = {
  idle: ['recentering', 'failed'],
  recentering: ['opening', 'failed'],
  opening: ['revealed', 'failed'],
  revealed: ['failed'],
  failed: [],
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
