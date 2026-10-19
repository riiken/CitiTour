import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CurrencyServiceService } from './currency-service.service';

describe('CurrencyServiceService', () => {
  it('fetches exchange rates once per base currency and shares them', () => {
    const service = TestBed.inject(CurrencyServiceService);
    const http = TestBed.inject(HttpTestingController);
    const results: number[] = [];

    service.convertCurrency(10, 'USD', 'INR').subscribe(v => results.push(v));
    service.convertCurrency(20, 'USD', 'INR').subscribe(v => results.push(v));

    http.expectOne('https://api.exchangerate-api.com/v4/latest/USD').flush({ rates: { INR: 83 } });
    http.verify();
    expect(results).toEqual([830, 1660]);
  });

  it('does not call the API when currencies match', () => {
    const service = TestBed.inject(CurrencyServiceService);
    const http = TestBed.inject(HttpTestingController);
    service.convertCurrency(10, 'INR', 'INR').subscribe(v => expect(v).toBe(10));
    http.verify();
  });
});
