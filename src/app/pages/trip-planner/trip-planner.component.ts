import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TripPlannerService } from 'src/app/services/trip-planner.service';

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.css']
})
export class TripPlannerComponent {
  tripData = {
    location: '',
    time: '',
    travelers: 1,
    budget: 1000,
    activities: [] as string[]
  };
  recommendations: any;

  constructor(private tripplannerservice:TripPlannerService,private loaderService:LoaderService){

  }

  // Function to handle form submission
  onSubmit() {
    console.log('Trip planning form submitted:', this.tripData);
    
    // Dummy response for now, you can replace it with an API call in the future
    this.getRecommendations();
  }

  getRecommendations() {
    this.loaderService.show();
    const { location, time, travelers, budget, activities } = this.tripData;

    if (!location || !time || !travelers || !budget) {
      alert('Please fill in all required fields.');
      this.loaderService.hide();
      return;
    }

    let query = `Plan a trip to ${location} for ${travelers} people for ${time}`;
    if (activities.length > 0) {
      query += ` including activities like ${activities.join(', ')}`;
    }
    query += `.`;

    console.log(query);
    this.tripplannerservice.getTripRecommentdation(query).subscribe((res:any)=>{
      console.log(res);
      this.recommendations = res['guides'];
      this.loaderService.hide();
    })
    // You can also send this query to an API or use it as needed
  }

  // Function to handle activity selection
  onActivitySelection(activity: any) {
    if (!this.tripData.activities.includes(activity)) {
      this.tripData.activities.push(activity);
    }
  }

  // Function to remove an activity from selected activities
  removeActivity(activity: string) {
    this.tripData.activities = this.tripData.activities.filter(a => a !== activity);
  }

  // Dummy method for "View Details" button (you can extend it for navigation)
  viewDetails(rec: any) {
    // Here you can redirect to a detailed page or show a modal with more information
    console.log('Viewing details for:', rec);
  }
}
