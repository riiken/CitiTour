import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ItineraryService, TripSummary } from 'src/app/services/itinerary.service';
import { apiErrorMessage } from 'src/app/services/api-error';

@Component({
    selector: 'app-my-trips',
    templateUrl: './my-trips.component.html',
    styleUrls: ['./my-trips.component.css'],
    standalone: false
})
export class MyTripsComponent implements OnInit {
  trips: TripSummary[] = [];
  loading = true;
  error: string | null = null;

  constructor(private itineraryService: ItineraryService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.itineraryService.myTrips().subscribe({
      next: trips => { this.trips = trips; this.loading = false; },
      error: err => { this.error = apiErrorMessage(err); this.loading = false; }
    });
  }

  get upcoming(): TripSummary[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.trips.filter(t => t.checkOut >= today).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }

  get past(): TripSummary[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.trips.filter(t => t.checkOut < today);
  }

  remove(trip: TripSummary): void {
    if (!confirm(`Delete "${trip.title}"?`)) return;
    this.itineraryService.remove(trip.id).subscribe({
      next: () => { this.trips = this.trips.filter(t => t.id !== trip.id); this.toastr.success('Trip deleted'); },
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }
}
