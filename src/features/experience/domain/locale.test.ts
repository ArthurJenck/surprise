import { describe, expect, it } from 'vitest'
import { isLocale, persistLocale, readPersistedLocale } from './locale'

function createStorage(initialEntries: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initialEntries))

  return {
    getItem(key: string) {
      return entries.get(key) ?? null
    },
    setItem(key: string, value: string) {
      entries.set(key, value)
    },
  }
}

describe('locale preference', () => {
  it('accepts only supported locale codes', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })

  it('ignores a missing or invalid persisted preference', () => {
    expect(readPersistedLocale(createStorage())).toBeUndefined()
    expect(
      readPersistedLocale(createStorage({ 'super-alternant.locale': 'de' }))
    ).toBeUndefined()
  })

  it('persists and reads a supported locale', () => {
    const storage = createStorage()

    persistLocale('en', storage)

    expect(readPersistedLocale(storage)).toBe('en')
  })

  it('tolerates unavailable storage', () => {
    expect(readPersistedLocale(undefined)).toBeUndefined()
    expect(() => persistLocale('fr', undefined)).not.toThrow()
  })
})
