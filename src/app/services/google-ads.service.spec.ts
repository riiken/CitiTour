import { TestBed } from '@angular/core/testing';

import { GoogleAdsService } from './google-ads.service';

describe('GoogleAdsService', () => {
  let service: GoogleAdsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleAdsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
