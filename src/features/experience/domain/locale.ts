import type { Locale } from '../../../config/experience'

const LOCALE_STORAGE_KEY = 'super-alternant.locale'

interface LocaleStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function isLocale(value: unknown): value is Locale {
  return value === 'fr' || value === 'en'
}

export function readPersistedLocale(storage: LocaleStorage | undefined) {
  if (!storage) {
    return undefined
  }

  try {
    const locale = storage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(locale) ? locale : undefined
  } catch {
    return undefined
  }
}

export function persistLocale(locale: Locale, storage: LocaleStorage | undefined) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    return
  }
}

export function getBrowserLocaleStorage() {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
