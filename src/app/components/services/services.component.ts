import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  constructor(private router:Router){}
  services = [
    { icon: 'globe', title: 'Plan Itinerary', description: 'Customized travel plans including flights, activities, and accommodation.' },
    { icon: 'hotel', title: 'Tour Guide', description: 'Local guides offering insightful tours to landmarks and attractions.' },
    { icon: 'user', title: 'Easy Travel', description: 'Personalized travel suggestions for destinations, activities, and experiences.' }
  ];

  navigateToHome(){
    this.router.navigate(['/search-results'])
  }
}
