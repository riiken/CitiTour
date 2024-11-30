import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { SearchRecommendationService } from 'src/app/services/search-recommendation.service';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.css']
})
export class DestinationComponent {
  constructor(private searchRecommendationService:SearchRecommendationService,private loaderService:LoaderService){
    this.getPopularDestinations()
  }

  destinations:any[] = [];
  // destinations = [
  //   { name: 'Thailand', discount: '30%', image: 'assets/img/destination-1.jpg' },
  //   { name: 'Malaysia', discount: '25%', image: 'assets/img/destination-2.jpg' },
  //   { name: 'Australia', discount: '35%', image: 'assets/img/destination-3.jpg' }
  // ];
  
  largeDestination = { name: 'Indonesia', discount: '20%', image: 'assets/img/destination-4.jpg' };

  getPopularDestinations(){
    this.loaderService.show();
    this.searchRecommendationService.getSearchRecommentdation('india','POPULARITY').subscribe((res:any)=>{
      console.log(res);
      this.destinations = res['data'];
      // this.searchRecommendationService.setSearchRecommendation(this.searchRecommendation);
      this.loaderService.hide();
    })
  }
}
