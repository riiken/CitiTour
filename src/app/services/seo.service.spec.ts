import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let meta: Meta;

  beforeEach(() => {
    seo = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
  });

  it('sets title, description, preview tags and a single canonical link', () => {
    seo.setPage('Jaipur – CitiTour', 'Forts and bazaars');
    seo.setPage('Goa – CitiTour', 'Beaches and seafood');

    expect(TestBed.inject(Title).getTitle()).toBe('Goa – CitiTour');
    expect(meta.getTag('name="description"')?.content).toBe('Beaches and seafood');
    expect(meta.getTag('property="og:title"')?.content).toBe('Goa – CitiTour');
    expect(meta.getTag('name="twitter:description"')?.content).toBe('Beaches and seafood');
    const canonical = document.head.querySelectorAll('link[rel="canonical"]');
    expect(canonical.length).toBe(1);
    expect((canonical[0] as HTMLLinkElement).href).toContain(location.origin);
  });
});
