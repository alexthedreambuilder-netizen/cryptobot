import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import { it } from './it'
import { ro } from './ro'

export const translations = {
  en,
  es,
  fr,
  it,
  ro,
}

export type LanguageCode = keyof typeof translations
export type Translations = typeof en
