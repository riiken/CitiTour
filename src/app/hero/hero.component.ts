import { Component } from '@angular/core';
import { SearchRecommendationService } from '../services/search-recommendation.service';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  searchQuery: string = '';

  constructor(private searchRecommendationService:SearchRecommendationService,private loaderService:LoaderService){

  }

  onSearch(): void {
    this.loaderService.show();
    if (this.searchQuery?.trim()) {
      this.searchRecommendationService.getSearchRecommentdation(this.searchQuery?.trim()).subscribe((res)=>{
        console.log(res);
        this.loaderService.hide();
        this.searchQuery = ''
      })
    } else {
      console.warn('Search query is empty');
      this.loaderService.hide();
    }
  }
}
