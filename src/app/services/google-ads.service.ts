import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

const AD_UNIT_ID = 'ca-app-pub-7610308986725516/1204638595';

// Show at most one interstitial every N completed searches, never before results.
const SEARCHES_PER_INTERSTITIAL = 4;
const MIN_MS_BETWEEN_INTERSTITIALS = 3 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class GoogleAdsService {
  private initialized = false;
  private completedSearches = 0;
  private lastInterstitialAt = 0;

  /** AdMob only exists in the native (Android) app. */
  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async initialize(): Promise<void> {
    if (!this.isNative || this.initialized) return;
    try {
      await AdMob.initialize({ initializeForTesting: false });
      this.initialized = true;
    } catch (error) {
      console.warn('AdMob initialization failed', error);
    }
  }

  /**
   * Call after search results have been rendered. Shows an interstitial only on
   * native, only every few searches, and never more than once per few minutes.
   */
  async onSearchCompleted(): Promise<void> {
    if (!this.isNative) return;
    this.completedSearches += 1;
    const dueBySearchCount = this.completedSearches % SEARCHES_PER_INTERSTITIAL === 0;
    const dueByTime = Date.now() - this.lastInterstitialAt > MIN_MS_BETWEEN_INTERSTITIALS;
    if (dueBySearchCount && dueByTime) {
      this.lastInterstitialAt = Date.now();
      await this.showInterstitialAd();
    }
  }

  async showBannerAd(): Promise<void> {
    if (!this.isNative) return;
    const options: BannerAdOptions = {
      adId: AD_UNIT_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER
    };
    try {
      await AdMob.showBanner(options);
    } catch (error) {
      console.warn('Banner ad failed', error);
    }
  }

  private async showInterstitialAd(): Promise<void> {
    try {
      await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
      await AdMob.showInterstitial();
    } catch (error) {
      console.warn('Interstitial ad failed', error);
    }
  }
}
