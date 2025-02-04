import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyServiceService {

  private ipApiUrl = 'https://ipapi.co/json/';  
  private exchangeApiUrl = 'https://api.exchangerate-api.com/v4/latest/'; 

  constructor(private http: HttpClient) {}

  getUserCurrency(): Observable<string> {
    const storedCurrency = localStorage.getItem('currency') || 'USD';
  
    if (storedCurrency) {
      return new Observable(observer => {
        observer.next(storedCurrency);
        observer.complete();
      });
    }
  
    return this.http.get<any>(this.ipApiUrl).pipe(
      map(data => {
        const currency = data.currency;
        localStorage.setItem('userCurrency', currency); // Store in localStorage
        return currency;
      })
    );
  }
  

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Observable<number> {
    return this.http.get<any>(`${this.exchangeApiUrl}${fromCurrency}`).pipe(
      map(response => {
        const rate = response.rates[toCurrency];
        return rate ? amount * rate : amount;
      })
    );
  }
}
