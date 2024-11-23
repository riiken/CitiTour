import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-google-ads',
  templateUrl: './google-ads.component.html',
  styleUrls: ['./google-ads.component.css']
})
export class GoogleAdsComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Push the ad code to render the ad
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

}
