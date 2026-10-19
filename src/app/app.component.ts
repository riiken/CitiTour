import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GoogleAdsService } from './services/google-ads.service';
import { SeoService } from './services/seo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'CitiTour';

  constructor(private googleAdsService: GoogleAdsService, private seo: SeoService) {}

  ngOnInit(): void {
    this.googleAdsService.initialize();
    this.seo.init();
  }
}
