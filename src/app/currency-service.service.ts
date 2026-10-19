import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, map, shareReplay, catchError } from 'rxjs';

const RATES_TTL_MS = 12 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class CurrencyServiceService {
  private exchangeApiUrl = 'https://api.exchangerate-api.com/v4/latest/';
  // One request per base currency, shared by every price on the page
  private rates = new Map<string, { expiresAt: number; rates$: Observable<Record<string, number>> }>();

  constructor(private http: HttpClient) {}

  getUserCurrency(): Observable<string> {
    return of(localStorage.getItem('currency') || 'USD');
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Observable<number> {
    if (!fromCurrency || fromCurrency === toCurrency) return of(amount);
    return this.getRates(fromCurrency).pipe(
      map(rates => (rates[toCurrency] ? amount * rates[toCurrency] : amount))
    );
  }

  private getRates(base: string): Observable<Record<string, number>> {
    const cached = this.rates.get(base);
    if (cached && cached.expiresAt > Date.now()) return cached.rates$;

    const rates$ = this.http.get<any>(`${this.exchangeApiUrl}${base}`).pipe(
      map(response => response?.rates || {}),
      catchError(() => of({})),
      shareReplay(1)
    );
    this.rates.set(base, { expiresAt: Date.now() + RATES_TTL_MS, rates$ });
    return rates$;
  }
}
