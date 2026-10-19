import { Inject, Injectable, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

const DEFAULT_DESCRIPTION =
  'Plan a trip anywhere in India in seconds: day-by-day plans built only from real places, with maps, stays, food and booking links. Free.';

/**
 * Keeps search and link-preview tags in step with the current page:
 * description, canonical URL and Open Graph / Twitter title & description.
 * Routes may set `data: { description }`; pages with loaded content
 * (trip, explore) call `setPage()` once their data arrives.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  init(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.route;
      while (route.firstChild) route = route.firstChild;
      const description = route.snapshot.data['description'] || DEFAULT_DESCRIPTION;
      this.setPage(this.title.getTitle(), description);
    });
  }

  setPage(title: string, description: string): void {
    this.title.setTitle(title);
    const url = this.document.location.origin + this.router.url.split(/[?#]/)[0];
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
