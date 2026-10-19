import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { CurrencyServiceService } from './currency-service.service';

@Directive({
  selector: '[appCurrencyConverter]'
})
export class CurrencyConverterDirective implements OnInit {
  @Input() amount!: number | string;
  @Input() fromCurrency!: string;

  constructor(private el: ElementRef, private currencyService: CurrencyServiceService) {}

  ngOnInit(): void {
    const amount = Number(String(this.amount ?? '').replace(/[^0-9.]/g, ''));
    if (!amount || !this.fromCurrency) return;

    this.currencyService.getUserCurrency().pipe(
      switchMap(userCurrency =>
        this.currencyService.convertCurrency(amount, this.fromCurrency, userCurrency).pipe(
          switchMap(converted => [{ converted, userCurrency }])
        ))
    ).subscribe(({ converted, userCurrency }) => {
      try {
        this.el.nativeElement.innerText = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: userCurrency,
          maximumFractionDigits: 0
        }).format(converted);
      } catch {
        this.el.nativeElement.innerText = `${Math.round(converted)} ${userCurrency}`;
      }
    });
  }
}
