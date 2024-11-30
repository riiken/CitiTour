import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TripPlannerService } from 'src/app/services/trip-planner.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  plan = {
    name: '',
    email: '',
    checkIn: '',
    checkOut:'',
    destination: ''
  };

  constructor(private router:Router,private tripPlannerService:TripPlannerService){}

  onSubmit() {
    console.log(this.plan);
    this.tripPlannerService.setTripData(this.plan);
    this.router.navigate(['plan-trip'])
  }
}
