import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { TripRequest } from 'src/app/services/trip-planner.service';
import { ItineraryService } from 'src/app/services/itinerary.service';
import { apiErrorMessage } from 'src/app/services/search-recommendation.service';

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.css']
})
export class TripPlannerComponent {
  error: string | null = null;
  planning = false;
  private lastPlan: TripRequest | null = null;

  constructor(
    private itineraryService: ItineraryService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  planTripEmmiter(plan: TripRequest): void {
    if (this.planning) return;
    this.lastPlan = plan;
    this.planning = true;
    this.error = null;
    this.loaderService.show();

    this.itineraryService.create(plan).subscribe({
      next: itinerary => {
        this.planning = false;
        this.loaderService.hide();
        this.router.navigate(['/trip', itinerary.id]);
      },
      error: err => {
        this.planning = false;
        this.loaderService.hide();
        this.error = apiErrorMessage(err, 'We could not build your trip right now. Please try again.');
      }
    });
  }

  retry(): void {
    if (this.lastPlan) this.planTripEmmiter(this.lastPlan);
  }
}
