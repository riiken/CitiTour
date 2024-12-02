import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPopunder]'
})
export class PopunderDirective {
  @Input('appPopunder') popunderUrl!: string;

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent) {
    // Open the popunder
    if (this.popunderUrl) {
      const popunder = window.open(this.popunderUrl, '_blank');
      if (!popunder) {
        console.error('Popunder blocked by browser.');
      }
    }

    // Allow the default action (navigating to href)
    // Remove preventDefault below to allow navigation
    // event.preventDefault(); 
  }
}
