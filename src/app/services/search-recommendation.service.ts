import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchRecommendationService {
  private apiUrl;
  private searchRecommendationSubject = new BehaviorSubject<any>(null);
  public searchRecommendation$: Observable<any> = this.searchRecommendationSubject.asObservable();
  constructor(private http:HttpClient) { 
    this.apiUrl = environment.apiURL;
  }

  getSearchRecommentdation(location:string,sort?:string){
    const url = `${this.apiUrl}recommendlocation`;
    return this.http.post(url,{location:location,sort:sort});
  }

  // Set the search recommendation data
  setSearchRecommendation(data: any): void {
    this.searchRecommendationSubject.next(data);
  }

  // Get the current value of search recommendation
  getSearchRecommendation(): any {
    return this.searchRecommendationSubject.getValue();
  }
}
