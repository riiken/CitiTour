import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hotel-details',
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css']
})
export class HotelDetailsComponent {
  @Input() hotel:any;

  showAmenities = false;

  toggleAmenities() {
    this.showAmenities = !this.showAmenities;
  }
  
}
