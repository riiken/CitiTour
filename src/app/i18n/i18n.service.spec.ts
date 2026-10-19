import { I18nService, storedLanguage } from './i18n.service';
import { HINDI } from './hi';

describe('I18nService', () => {
  afterEach(() => localStorage.removeItem('lang'));

  it('defaults to English and returns the text unchanged', () => {
    localStorage.removeItem('lang');
    const i18n = new I18nService();
    expect(i18n.lang).toBe('en');
    expect(i18n.t('Plan a trip')).toBe('Plan a trip');
    expect(i18n.t('Day {n}', { n: 2 })).toBe('Day 2');
  });

  it('translates to Hindi with placeholders, and falls back to English when missing', () => {
    localStorage.setItem('lang', 'hi');
    expect(storedLanguage()).toBe('hi');
    const i18n = new I18nService();
    expect(i18n.t('Plan a trip')).toBe('यात्रा प्लान करें');
    expect(i18n.t('Day {n}', { n: 3 })).toBe('दिन 3');
    expect(i18n.t('{done} of {total} packed', { done: 2, total: 10 })).toBe('10 में से 2 पैक हो गए');
    expect(i18n.t('Some untranslated text')).toBe('Some untranslated text');
  });

  it('every Hindi entry keeps the placeholders of its English key', () => {
    for (const [english, hindi] of Object.entries(HINDI)) {
      const placeholders = (text: string) => (text.match(/\{\w+\}/g) || []).sort().join(',');
      expect(placeholders(hindi)).withContext(english).toBe(placeholders(english));
    }
  });
});
