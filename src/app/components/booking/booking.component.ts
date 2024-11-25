import { Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  booking = {
    name: '',
    email: '',
    dateTime: '',
    destination: '1',
    specialRequest: ''
  };

  onSubmit() {
    console.log(this.booking);
  }
}
