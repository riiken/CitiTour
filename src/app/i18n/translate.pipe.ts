import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

/** {{ 'Plan a trip' | t }} or {{ 'Plan a trip to {city}' | t: { city: name } }} */
@Pipe({
    name: 't',
    standalone: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(text: string, params?: Record<string, string | number | null | undefined>): string {
    return this.i18n.t(text, params);
  }
}
