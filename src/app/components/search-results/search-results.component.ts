import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from 'src/app/services/loader.service';
import { SearchRecommendationService } from 'src/app/services/search-recommendation.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }), 
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SearchResultsComponent {

  @Input() searchQuery:string = 'banglore';
  searchRecommendation: any;
  searchRecommendation$: any;
  constructor(private searchRecommendationService:SearchRecommendationService,private loaderService:LoaderService,private toastr:ToastrService){
    this.searchRecommendation$ = this.searchRecommendationService.searchRecommendation$;
    this.searchQuery = localStorage.getItem('location') ?? this.searchQuery;
  }
  ngOnInit(): void {
    this.searchRecommendation$.subscribe((data:any) => {
      if(data){
        this.searchRecommendation = data;
      }else{
        this.setRecommendations();
      }
    });
  }

  onSearch(){
    if(this.searchQuery?.trim()){
      this.setRecommendations();
    }
  }

  setRecommendations(){
    this.loaderService.show();
    this.searchRecommendationService.getSearchRecommentdation(this.searchQuery?.trim()).subscribe((res:any)=>{
      console.log(res);
      this.searchRecommendation = res['data'];
      this.searchRecommendationService.setSearchRecommendation(this.searchRecommendation);
      this.loaderService.hide();
    },(err)=>{
      this.toastr.error(err.message);
      this.loaderService.hide();
      return;
    })
  }

  
}
