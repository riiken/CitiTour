import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tour-details',
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css']
})
export class TourDetailsComponent {

  @Input() tour:any;
}
