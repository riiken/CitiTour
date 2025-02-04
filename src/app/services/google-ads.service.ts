import { Injectable } from '@angular/core';
import { BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { AdMob } from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root'
})
export class GoogleAdsService {

  constructor() { }
  // loadAds() {
  //   const script = document.createElement('script');
  //   script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6764912423351872';
  //   script.async = true;
  //   document.head.appendChild(script);
    
  //   script.onload = () => {
  //     (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
  //   };
  // }

  async showAd(adType: 'banner' | 'interstitial' | 'rewarded') {
    switch(adType) {
      case 'banner':
        await this.showBannerAd();
        break;
      case 'interstitial':
        await this.showInterstitialAd();
        break;
      case 'rewarded':
        await this.showRewardedAd();
        break;
      default:
        console.error('Invalid ad type');
    }
  }

  private async showBannerAd() {
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-7610308986725516/1204638595', // Test banner ad unit ID
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.CENTER,
    };

    await AdMob.showBanner(options);
  }

  private async showInterstitialAd() {
    const interstitialAdOptions = {
      adId: 'ca-app-pub-7610308986725516/1204638595',
    };

    await AdMob.prepareInterstitial(interstitialAdOptions);
    await AdMob.showInterstitial();
  }

  private async showRewardedAd() {
    const rewardedAdOptions = {
      adId: 'ca-app-pub-7610308986725516/1204638595', // Test rewarded ad unit ID
    };

    await AdMob.prepareRewardVideoAd(rewardedAdOptions);
    await AdMob.showRewardVideoAd();
  }
}
