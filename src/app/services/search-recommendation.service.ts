import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchRecommendationService {
  private apiUrl;
  private searchCache = new Map<string, any>();
  private searchRecommendationSubject = new BehaviorSubject<any>(null);
  public searchRecommendation$: Observable<any> = this.searchRecommendationSubject.asObservable();
  constructor(private http:HttpClient) { 
    this.apiUrl = environment.apiURL;
  }

  getSearchRecommendationFromAPi(location: string, sort?: string): Observable<any> {
    const cacheKey = `search_${location}_${sort || 'default'}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      console.log('Using cached data:', JSON.parse(cachedData));
      return of(JSON.parse(cachedData)); // Return cached data as an Observable
    }
    const url = `${this.apiUrl}recommendlocation`;
    return new Observable((observer) => {
      this.http.post(url, { location, sort }).subscribe(
        (data) => {
          localStorage.setItem(cacheKey, JSON.stringify(data)); // Store in localStorage
          observer.next(data);
          observer.complete();
        },
        (error) => observer.error(error)
      );
    });
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
