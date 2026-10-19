import { ElementRef, Renderer2 } from '@angular/core';
import { BackToTopDirective } from './back-to-top.directive';

describe('BackToTopDirective', () => {
  it('should create an instance', () => {
    const renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['addClass', 'removeClass']);
    expect(new BackToTopDirective(new ElementRef(document.createElement('a')), renderer)).toBeTruthy();
  });
});
