import { AfterViewInit, Component } from '@angular/core';
import { environment } from '../environment';

/**
 * Responsive AdSense unit for the web build. Renders nothing when AdSense is
 * not configured or when running inside the native app (which uses AdMob).
 */
@Component({
    selector: 'app-google-ads',
    templateUrl: './google-ads.component.html',
    styleUrls: ['./google-ads.component.css'],
    standalone: false
})
export class GoogleAdsComponent implements AfterViewInit {
  readonly client = environment.adsenseClient;
  readonly slot = environment.adsenseSlot;
  readonly enabled = !!(environment.adsenseClient && environment.adsenseSlot) &&
    !(window as any).Capacitor?.isNativePlatform?.();

  ngAfterViewInit(): void {
    if (!this.enabled) return;
    this.loadScript();
    setTimeout(() => {
      try {
        (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
      } catch (error) {
        console.warn('AdSense unit failed to render', error);
      }
    });
  }

  private loadScript(): void {
    const id = 'adsbygoogle-js';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.client}`;
    document.head.appendChild(script);
  }
}
