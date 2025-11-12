import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { TripPlannerService } from 'src/app/services/trip-planner.service';
import { DestinationService, TravelPlanningData, WeatherData, ForecastDay, DestinationImage } from 'src/app/services/destination.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

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

  // New properties for destination data
  travelData: TravelPlanningData | null = null;
  weather: WeatherData | null = null;
  forecast: ForecastDay[] = [];
  images: DestinationImage[] = [];
  loading = false;
  destination = '';
  showDestinationData = false;

  constructor(
    private tripplannerservice: TripPlannerService,
    private destinationService: DestinationService,
    private loaderService: LoaderService,
    private toastr: ToastrService
  ){
    console.log(this.tripplannerservice.getTripData());
  }

  ngOnInit(){
    const { destination, checkIn, checkOut } = this.tripplannerservice.getTripData();
    if(destination && checkIn && checkOut){
      this.destination = destination;
      this.getRecommendations();
      this.loadDestinationData();
    }
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

  planTripEmmiter(plan:any){
    const { destination, checkIn, checkOut } = plan;
    if(destination && checkIn && checkOut){
      this.destination = destination;
      this.getRecommendations();
      this.loadDestinationData();
    }
  }

  // Load comprehensive destination data
  loadDestinationData() {
    if (!this.destination) {
      this.toastr.warning('Please enter a destination', 'Missing Information');
      return;
    }

    this.loading = true;
    this.showDestinationData = true;
    this.loaderService.show();

    // Load travel planning data (includes weather, forecast, images, recommendations)
    this.destinationService.getTravelPlanningData(this.destination, 'metric').subscribe({
      next: (response) => {
        console.log('Travel data loaded:', response.data);
        this.travelData = response.data;

        // Extract data for child components
        this.weather = response.data.currentConditions as any;
        this.forecast = response.data.weatherForecast || [];
        this.images = response.data.imageGallery.map(img => ({
          url: img.url,
          thumb: img.thumb,
          full: img.url,
          description: img.description,
          photographer: img.photographer,
          source: 'Unsplash',
          attribution: img.attribution
        }));

        this.loading = false;
        this.loaderService.hide();
        this.toastr.success(`Loaded data for ${this.destination}`, 'Success');
      },
      error: (err) => {
        console.error('Failed to load destination data:', err);
        this.toastr.error('Failed to load destination data. Please try again.', 'Error');
        this.loading = false;
        this.loaderService.hide();
      }
    });
  }

  // Toggle destination data visibility
  toggleDestinationData() {
    this.showDestinationData = !this.showDestinationData;
  }
}
