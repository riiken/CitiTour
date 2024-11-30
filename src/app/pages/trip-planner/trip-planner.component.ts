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
    activities:{
      sightseeing:false,
      adventure:false,
      beach:true,
    }
  };
  recommendations: any;

  constructor(private tripplannerservice:TripPlannerService,private loaderService:LoaderService){
    console.log(this.tripplannerservice.getTripData());
  }

  ngOnInit(){
    this.getRecommendations();
  }

  // Function to handle form submission
  onSubmit() {
    console.log('Trip planning form submitted:', this.tripData);
    
    // Dummy response for now, you can replace it with an API call in the future
    this.getRecommendations();
  }

  getRecommendations() {
    this.loaderService.show();
    const { destination, checkIn, checkOut } = this.tripplannerservice.getTripData();

    let query = `Plan a trip to ${destination} from ${checkIn} to ${checkOut}`;
    query += `.`;

    console.log(query);
    this.tripplannerservice.getTripRecommentdation(query).subscribe((res:any)=>{
      console.log(res);
      this.recommendations = res['guides'];
      this.loaderService.hide();
    })
    // You can also send this query to an API or use it as needed
  }


  // Dummy method for "View Details" button (you can extend it for navigation)
  viewDetails(rec: any) {
    // Here you can redirect to a detailed page or show a modal with more information
    console.log('Viewing details for:', rec);
  }
}
