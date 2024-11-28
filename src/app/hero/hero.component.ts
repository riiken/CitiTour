import { Component } from '@angular/core';
import { SearchRecommendationService } from '../services/search-recommendation.service';
import { LoaderService } from '../services/loader.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms 300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('300ms', style({ opacity: 0 })),
      ])
    ]),
    trigger('barAnimation', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('3s ease-out', style({ width: '100%' }))
      ])
    ])
  ]
})
export class HeroComponent {
  searchQuery: string = '';
  searchRecommendation:any;
  constructor(private searchRecommendationService:SearchRecommendationService,private loaderService:LoaderService){

  }

  onSearch(): void {
    this.loaderService.show();
    if (this.searchQuery?.trim()) {
      this.searchRecommendationService.getSearchRecommentdation(this.searchQuery?.trim()).subscribe((res:any)=>{
        console.log(res);
        this.searchRecommendation = res['data'];
        this.loaderService.hide();
        this.searchQuery = ''
      })
    } else {
      console.warn('Search query is empty');
      this.loaderService.hide();
    }
  }
}
