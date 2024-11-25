import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBackToTop]'
})
export class BackToTopDirective {

  showButton = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showButton = window.scrollY > 300;
    if (this.showButton) {
      this.renderer.addClass(this.el.nativeElement, 'show');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'show');
    }
  }

  @HostListener('click', ['$event'])
  scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
