import { Injectable } from '@angular/core';
import { HINDI } from './hi';

export type Language = 'en' | 'hi';
const STORAGE_KEY = 'lang';

export const storedLanguage = (): Language => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
};

/**
 * Lightweight UI translation. English text is the key; Hindi comes from
 * ./hi.ts and anything untranslated falls back to English. The language is
 * fixed per page load (switching reloads once so dates and labels change
 * together).
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang: Language = storedLanguage();

  constructor() {
    document.documentElement.lang = this.lang;
  }

  get isHindi(): boolean {
    return this.lang === 'hi';
  }

  /** Translate English text; {name} placeholders are filled from params. */
  t(text: string, params?: Record<string, string | number | null | undefined>): string {
    let result = this.lang === 'hi' ? HINDI[text] ?? text : text;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        result = result.split(`{${key}}`).join(value == null ? '' : String(value));
      }
    }
    return result;
  }

  setLanguage(lang: Language): void {
    if (lang === this.lang) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      return;
    }
    window.location.reload();
  }
}
