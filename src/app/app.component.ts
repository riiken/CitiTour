import { Component, OnInit } from '@angular/core';
import { GoogleAdsService } from './services/google-ads.service';
import { TripPlannerService } from './services/trip-planner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'CitiTour';

  constructor(private googleAdsService: GoogleAdsService, private tripPlanner: TripPlannerService) {}

  ngOnInit(): void {
    this.googleAdsService.initialize();
    this.setCurrentUserCountry();
  }

  /** Detect the visitor's currency once; prices are converted client-side. */
  private setCurrentUserCountry(): void {
    if (localStorage.getItem('currency')) return;
    this.tripPlanner.getUserLocation().subscribe({
      next: (data: any) => {
        if (data?.currency) localStorage.setItem('currency', data.currency);
      },
      error: () => { /* fall back to USD in CurrencyServiceService */ }
    });
  }
}
