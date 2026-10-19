import { ElementRef } from '@angular/core';
import { of } from 'rxjs';
import { CurrencyConverterDirective } from './currency-converter.directive';
import { CurrencyServiceService } from './currency-service.service';

describe('CurrencyConverterDirective', () => {
  it('renders the converted amount in the user currency', () => {
    const element = document.createElement('span');
    const service = {
      getUserCurrency: () => of('INR'),
      convertCurrency: () => of(8300)
    } as unknown as CurrencyServiceService;
    const directive = new CurrencyConverterDirective(new ElementRef(element), service);
    directive.amount = 100;
    directive.fromCurrency = 'USD';
    directive.ngOnInit();
    expect(element.innerText).toContain('8,300');
  });

  it('accepts price strings such as "$1,234"', () => {
    const element = document.createElement('span');
    const convert = jasmine.createSpy().and.returnValue(of(1234));
    const service = { getUserCurrency: () => of('USD'), convertCurrency: convert } as unknown as CurrencyServiceService;
    const directive = new CurrencyConverterDirective(new ElementRef(element), service);
    directive.amount = '$1,234';
    directive.fromCurrency = 'USD';
    directive.ngOnInit();
    expect(convert).toHaveBeenCalledWith(1234, 'USD', 'USD');
  });
});
