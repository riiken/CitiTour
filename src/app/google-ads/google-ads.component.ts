import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-google-ads',
  templateUrl: './google-ads.component.html',
  styleUrls: ['./google-ads.component.css']
})
export class GoogleAdsComponent implements AfterViewInit {

  ngAfterViewInit() {
    setTimeout(()=>{
      try {
        (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
      } catch (error) {
        console.error('Error displaying ads:', error);
      }
    },1000)
  }

}
