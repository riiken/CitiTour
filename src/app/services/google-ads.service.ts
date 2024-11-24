import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleAdsService {

  constructor() { }
  loadAds() {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6764912423351872';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
    };
  }
}
