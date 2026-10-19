import { Component, OnInit } from '@angular/core';
import { GoogleAdsService } from './services/google-ads.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'CitiTour';

  constructor(private googleAdsService: GoogleAdsService) {}

  ngOnInit(): void {
    this.googleAdsService.initialize();
  }
}
