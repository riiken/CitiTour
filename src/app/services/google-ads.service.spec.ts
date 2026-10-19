import { TestBed } from '@angular/core/testing';
import { AdMob } from '@capacitor-community/admob';
import { GoogleAdsService } from './google-ads.service';

describe('GoogleAdsService (web)', () => {
  it('never calls AdMob in the browser', async () => {
    const service = TestBed.inject(GoogleAdsService);
    const init = spyOn(AdMob, 'initialize').and.resolveTo();
    const interstitial = spyOn(AdMob, 'showInterstitial').and.resolveTo();

    await service.initialize();
    for (let i = 0; i < 8; i++) await service.onSearchCompleted();

    expect(service.isNative).toBeFalse();
    expect(init).not.toHaveBeenCalled();
    expect(interstitial).not.toHaveBeenCalled();
  });
});
