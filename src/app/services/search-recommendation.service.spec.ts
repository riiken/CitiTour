import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { SearchRecommendationService, apiErrorMessage } from './search-recommendation.service';

describe('SearchRecommendationService', () => {
  beforeEach(() => localStorage.clear());

  it('sends `location` and caches non-empty results', () => {
    const service = TestBed.inject(SearchRecommendationService);
    const http = TestBed.inject(HttpTestingController);
    const response = { data: { hotels: [{ name: 'A' }], restaurants: [], tours: [] } };

    service.getSearchRecommendationFromAPi('Goa').subscribe();
    const req = http.expectOne(r => r.url.endsWith('recommendlocation'));
    expect(req.request.body.location).toBe('Goa');
    req.flush(response);

    let cached: any;
    service.getSearchRecommendationFromAPi('goa').subscribe(r => (cached = r));
    http.verify(); // no second request
    expect(cached).toEqual(response);
  });

  it('does not cache empty results', () => {
    const service = TestBed.inject(SearchRecommendationService);
    const http = TestBed.inject(HttpTestingController);
    service.getSearchRecommendationFromAPi('Nowhere').subscribe();
    http.expectOne(r => r.url.endsWith('recommendlocation')).flush({ data: { hotels: [], restaurants: [], tours: [] } });
    service.getSearchRecommendationFromAPi('Nowhere').subscribe();
    http.expectOne(r => r.url.endsWith('recommendlocation'));
  });

  it('expires cached results after 24 hours', () => {
    localStorage.setItem('search_v2_goa_default', JSON.stringify({ savedAt: Date.now() - 25 * 3600 * 1000, data: {} }));
    const service = TestBed.inject(SearchRecommendationService);
    const http = TestBed.inject(HttpTestingController);
    service.getSearchRecommendationFromAPi('Goa').subscribe();
    http.expectOne(r => r.url.endsWith('recommendlocation'));
  });

  it('removes the legacy never-expiring cache', () => {
    localStorage.setItem('search_goa_default', '{}');
    TestBed.inject(SearchRecommendationService);
    expect(localStorage.getItem('search_goa_default')).toBeNull();
  });
});

describe('apiErrorMessage', () => {
  it('prefers the server message', () => {
    const error = new HttpErrorResponse({ status: 503, error: { message: 'Trip planning is busy' } });
    expect(apiErrorMessage(error)).toBe('Trip planning is busy');
  });

  it('explains offline errors', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('offline');
  });
});
