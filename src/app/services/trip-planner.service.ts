import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {
  private apiUrl;
  private tripPlannerSubject = new BehaviorSubject<any>(null);
  public tripPlanner$: Observable<any> = this.tripPlannerSubject.asObservable();
  constructor(private http:HttpClient) { 
    this.apiUrl = environment.apiURL;
  }

  getTripRecommentdation(query:string){
    const url = `${this.apiUrl}query`;
    return this.http.post(url,{query:query});
  }

  getSearchRecommentdation(location:string){
    const url = `${this.apiUrl}recommendlocation`;
    return this.http.post(url,{location:location});
  }

  // Set the search recommendation data
  setTripData(data: any): void {
    this.tripPlannerSubject.next(data);
  }

  // Get the current value of search recommendation
  getTripData(): any {
    return this.tripPlannerSubject.getValue();
  }
}
