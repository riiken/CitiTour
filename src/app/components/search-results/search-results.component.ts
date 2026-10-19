import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { GoogleAdsService } from 'src/app/services/google-ads.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SearchRecommendationService, apiErrorMessage } from 'src/app/services/search-recommendation.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  @Input() searchQuery = 'Goa';
  searchRecommendation: any;
  private subscription?: Subscription;

  constructor(
    private googleAds: GoogleAdsService,
    private searchRecommendationService: SearchRecommendationService,
    private loaderService: LoaderService,
    private toastr: ToastrService
  ) {
    this.searchQuery = localStorage.getItem('location') ?? this.searchQuery;
  }

  ngOnInit(): void {
    this.subscription = this.searchRecommendationService.searchRecommendation$.subscribe((data: any) => {
      if (data) {
        this.searchRecommendation = data;
      } else {
        this.setRecommendations();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSearch(): void {
    if (this.searchQuery?.trim()) {
      localStorage.setItem('location', this.searchQuery.trim());
      this.setRecommendations(true);
    }
  }

  setRecommendations(userInitiated = false): void {
    this.loaderService.show();
    this.searchRecommendationService.getSearchRecommendationFromAPi(this.searchQuery.trim()).subscribe({
      next: (res: any) => {
        this.searchRecommendation = res?.data;
        this.loaderService.hide();
        if (userInitiated) this.googleAds.onSearchCompleted();
      },
      error: (err) => {
        this.loaderService.hide();
        this.toastr.error(apiErrorMessage(err, 'Search failed. Please try again.'));
      }
    });
  }
}
