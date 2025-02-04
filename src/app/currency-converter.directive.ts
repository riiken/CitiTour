import { Directive, ElementRef, Input } from '@angular/core';
import { CurrencyServiceService } from './currency-service.service';

@Directive({
  selector: '[appCurrencyConverter]',
  standalone: false
})
export class CurrencyConverterDirective {

  @Input() amount!: number;
  @Input() fromCurrency!: string;

  constructor(private el: ElementRef, private currencyService: CurrencyServiceService) {}

  ngOnInit(): void {
    if (!this.amount || !this.fromCurrency) return;
    this.currencyService.getUserCurrency().subscribe(userCurrency => {
      this.currencyService.convertCurrency(this.amount, this.fromCurrency, userCurrency).subscribe(convertedAmount => {
        this.el.nativeElement.innerText = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: userCurrency
        }).format(convertedAmount);
      });
    });
  }

}
