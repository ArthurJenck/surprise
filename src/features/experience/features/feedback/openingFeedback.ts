import type { FeedbackConfig } from '../../../../config/experience/types'

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

export function playOpeningFeedback(config: FeedbackConfig) {
  triggerVibration(config)

  if (!config.audio.enabled) {
    return
  }

  try {
    const audioWindow = window as AudioContextWindow
    const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const startAt = context.currentTime
    const { audio } = config
    const master = context.createGain()
    master.gain.setValueAtTime(audio.minimumGain, startAt)
    master.gain.exponentialRampToValueAtTime(
      audio.masterPeakGain,
      startAt + audio.masterAttackDurationSeconds
    )
    master.gain.exponentialRampToValueAtTime(
      audio.minimumGain,
      startAt + audio.masterReleaseDurationSeconds
    )
    master.connect(context.destination)

    audio.treasureChime.notes.forEach((note) => {
      const noteStartAt = startAt + note.startDelaySeconds
      const noteGain = context.createGain()
      noteGain.gain.setValueAtTime(audio.minimumGain, noteStartAt)
      noteGain.gain.exponentialRampToValueAtTime(
        note.gainPeak,
        noteStartAt + audio.treasureChime.attackDurationSeconds
      )
      noteGain.gain.exponentialRampToValueAtTime(
        audio.minimumGain,
        noteStartAt + audio.treasureChime.attackDurationSeconds + note.releaseDurationSeconds
      )
      noteGain.connect(master)

      audio.treasureChime.partials.forEach((partial) => {
        const oscillator = context.createOscillator()
        const partialGain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(
          note.frequencyHz * partial.frequencyMultiplier,
          noteStartAt
        )
        partialGain.gain.setValueAtTime(partial.gainMultiplier, noteStartAt)
        oscillator.connect(partialGain)
        partialGain.connect(noteGain)
        oscillator.start(noteStartAt)
        oscillator.stop(
          noteStartAt + audio.treasureChime.attackDurationSeconds + note.releaseDurationSeconds
        )
      })
    })

    void context.resume().catch(() => undefined)
    window.setTimeout(
      () => void context.close().catch(() => undefined),
      audio.contextCloseDelayMs
    )
  } catch {
    return
  }
}

function triggerVibration(config: FeedbackConfig) {
  if (!config.vibrationEnabled || config.vibrationPatternMs.length === 0) {
    return
  }

  try {
    navigator.vibrate?.([...config.vibrationPatternMs])
  } catch {
    return
  }
}
