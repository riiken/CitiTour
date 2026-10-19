import { ElementRef, Renderer2 } from '@angular/core';
import { NavbarStickyDirective } from './navbar-sticky.directive';

describe('NavbarStickyDirective', () => {
  it('should create an instance', () => {
    const renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['addClass', 'removeClass']);
    expect(new NavbarStickyDirective(renderer, new ElementRef(document.createElement('nav')))).toBeTruthy();
  });
});
