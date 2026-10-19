import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

const CACHE_PREFIX = 'search_v2_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_SEARCHES = 15;

/** Turn an API error into a message suitable for a toast. */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'You appear to be offline. Check your connection and try again.';
    const body = error.error;
    if (body?.message && typeof body.message === 'string') return body.message;
    if (Array.isArray(body?.errors) && body.errors[0]?.message) return body.errors[0].message;
    if (error.status === 429) return 'Too many requests. Please wait a moment and try again.';
  }
  return fallback;
};

@Injectable({
  providedIn: 'root'
})
export class SearchRecommendationService {
  private apiUrl = environment.apiURL;
  private searchRecommendationSubject = new BehaviorSubject<any>(null);
  public searchRecommendation$: Observable<any> = this.searchRecommendationSubject.asObservable();

  constructor(private http: HttpClient) {
    this.removeLegacyCache();
  }

  getSearchRecommendationFromAPi(location: string, sort?: string): Observable<any> {
    const cacheKey = `${CACHE_PREFIX}${location.trim().toLowerCase()}_${sort || 'default'}`;
    const cached = this.readCache(cacheKey);
    if (cached) return of(cached);

    return this.http.post(`${this.apiUrl}recommendlocation`, { location, sort }).pipe(
      tap((data: any) => {
        const hasResults = ['hotels', 'restaurants', 'tours'].some(key => data?.data?.[key]?.length);
        if (hasResults) this.writeCache(cacheKey, data);
      })
    );
  }

  setSearchRecommendation(data: any): void {
    this.searchRecommendationSubject.next(data);
  }

  getSearchRecommendation(): any {
    return this.searchRecommendationSubject.getValue();
  }

  private readCache(key: string): any {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry?.savedAt || Date.now() - entry.savedAt > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  private writeCache(key: string, data: any): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      if (keys.length >= MAX_CACHED_SEARCHES) {
        keys
          .map(k => ({ k, savedAt: JSON.parse(localStorage.getItem(k) || '{}').savedAt || 0 }))
          .sort((a, b) => a.savedAt - b.savedAt)
          .slice(0, keys.length - MAX_CACHED_SEARCHES + 1)
          .forEach(({ k }) => localStorage.removeItem(k));
      }
      localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
      // Storage full or unavailable: caching is best-effort
    }
  }

  /** Earlier versions cached results forever under `search_*` keys. */
  private removeLegacyCache(): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('search_') && !k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}
