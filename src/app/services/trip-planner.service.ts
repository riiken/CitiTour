import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {
  private apiUrl;
  constructor(private http:HttpClient) { 
    this.apiUrl = environment.apiURL;
  }

  getTripRecommentdation(query:string){
    const url = `${this.apiUrl}query`;
    return this.http.post(url,{query:query});
  }
}
