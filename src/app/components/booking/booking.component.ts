import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TripPlannerService, TripRequest } from 'src/app/services/trip-planner.service';
import { I18nService } from 'src/app/i18n/i18n.service';

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  readonly today = toIsoDate(new Date());
  readonly budgets = ['Budget', 'Mid-range', 'Luxury'];
  readonly interestOptions = ['Sightseeing', 'Food', 'Nature', 'Adventure', 'Beaches', 'Culture', 'Shopping', 'Nightlife'];

  plan: TripRequest;

  @Output() planTripEmmiter = new EventEmitter<TripRequest>();

  constructor(private tripPlannerService: TripPlannerService, private toastr: ToastrService, route: ActivatedRoute, private i18n: I18nService) {
    const fromQuery = route.snapshot.queryParamMap.get('destination');
    const existing = this.tripPlannerService.getTripData();
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(end.getDate() + 3);
    this.plan = {
      destination: fromQuery || existing?.destination || localStorage.getItem('location') || '',
      checkIn: existing?.checkIn || toIsoDate(start),
      checkOut: existing?.checkOut || toIsoDate(end),
      travellers: existing?.travellers || 2,
      budget: existing?.budget || 'Mid-range',
      interests: existing?.interests || ['Sightseeing', 'Food']
    };
  }

  toggleInterest(interest: string): void {
    const interests = this.plan.interests;
    this.plan.interests = interests.includes(interest)
      ? interests.filter(i => i !== interest)
      : [...interests, interest];
  }

  onSubmit(): void {
    if (!this.plan.destination?.trim()) {
      this.toastr.info(this.i18n.t('Where are you going?'));
      return;
    }
    if (!this.plan.checkIn || !this.plan.checkOut || this.plan.checkOut <= this.plan.checkIn) {
      this.toastr.info(this.i18n.t('Choose an end date after the start date.'));
      return;
    }
    const plan = { ...this.plan, destination: this.plan.destination.trim() };
    this.tripPlannerService.setTripData(plan);
    this.planTripEmmiter.emit(plan);
  }
}
