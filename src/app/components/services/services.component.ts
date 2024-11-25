import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  services = [
    { icon: 'globe', title: 'WorldWide Tours', description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam' },
    { icon: 'hotel', title: 'Hotel Reservation', description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam' },
    { icon: 'user', title: 'Travel Guides', description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam' },
    { icon: 'cog', title: 'Event Management', description: 'Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam' }
  ];
}
