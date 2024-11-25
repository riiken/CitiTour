import { Component } from '@angular/core';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.css']
})
export class DestinationComponent {
  destinations = [
    { name: 'Thailand', discount: '30%', image: 'assets/img/destination-1.jpg' },
    { name: 'Malaysia', discount: '25%', image: 'assets/img/destination-2.jpg' },
    { name: 'Australia', discount: '35%', image: 'assets/img/destination-3.jpg' }
  ];
  
  largeDestination = { name: 'Indonesia', discount: '20%', image: 'assets/img/destination-4.jpg' };
}
