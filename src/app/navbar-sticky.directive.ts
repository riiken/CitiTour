import { Directive, HostListener, Renderer2, ElementRef, OnInit } from '@angular/core';

@Directive({
    selector: '[appNavbarSticky]',
    standalone: false
})
export class NavbarStickyDirective {

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  
  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY;
    if (scrollTop > 45) {
      this.renderer.addClass(this.el.nativeElement, 'sticky-top');
      this.renderer.addClass(this.el.nativeElement, 'shadow-sm');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'sticky-top');
      this.renderer.removeClass(this.el.nativeElement, 'shadow-sm');
    }
  }

  ngOnInit(): void {
    this.onScroll(); // Trigger on page load
  }

}

