'use client'

import { useState, useEffect, useCallback } from 'react'
import { translations, type LanguageCode, type Translations } from './translations'

const STORAGE_KEY = 'app-language'
const DEFAULT_LANG: LanguageCode = 'en'

export function useTranslation() {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANG)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode
    if (stored && translations[stored]) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const t = useCallback(
    (key: keyof Translations, subKey?: string, params?: Record<string, string | number>) => {
      const translation = translations[language]
      let value: string | undefined

      if (subKey && typeof translation[key] === 'object') {
        const section = translation[key] as Record<string, string>
        value = section[subKey]
      } else if (!subKey && typeof translation[key] === 'string') {
        value = translation[key] as string
      }

      if (!value) {
        // Fallback to English
        const fallback = translations[DEFAULT_LANG]
        if (subKey && typeof fallback[key] === 'object') {
          const section = fallback[key] as Record<string, string>
          value = section[subKey]
        } else if (!subKey && typeof fallback[key] === 'string') {
          value = fallback[key] as string
        }
      }

      if (value && params) {
        return Object.entries(params).reduce((acc, [k, v]) => {
          return acc.replace(new RegExp(`{${k}}`, 'g'), String(v))
        }, value)
      }

      return value || key
    },
    [language]
  )

  return {
    language,
    setLanguage,
    t,
    languages: [
      { code: 'en' as const, name: 'English', flag: '🇬🇧' },
      { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
      { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
      { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
      { code: 'ro' as const, name: 'Română', flag: '🇷🇴' },
    ],
    mounted,
  }
}
