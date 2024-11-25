import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent {
  features = [
    'First Class Destinations',
    'Handpicked Hotels',
    '5 Star Accommodations',
    'Latest Model Vehicles',
    '150 Premium City Tours',
    '24/7 Service'
  ];
}
