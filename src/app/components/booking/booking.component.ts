import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

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

  constructor(private datePipe:DatePipe){}

  onSubmit() {
    console.log(this.plan);
  }

  onStartDateSelect(date: any): void {
    const formattedDate = this.datePipe.transform(date, 'yyyy/MM/dd');
    this.plan.checkIn = formattedDate || '';
  }

  onEndDateSelect(date: any): void {
    const formattedDate = this.datePipe.transform(date, 'yyyy/MM/dd');
    this.plan.checkOut = formattedDate || '';
    console.log(this.plan);
  }
}
