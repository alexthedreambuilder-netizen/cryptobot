export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
]

export type LanguageCode = 'en' | 'es' | 'fr' | 'it' | 'ro'

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

export const STORAGE_KEY = 'app-language'
