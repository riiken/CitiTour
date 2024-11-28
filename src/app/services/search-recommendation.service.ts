import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchRecommendationService {
  private apiUrl;
  constructor(private http:HttpClient) { 
    this.apiUrl = environment.apiURL;
  }

  getSearchRecommentdation(location:string){
    const url = `${this.apiUrl}recommendlocation`;
    return this.http.post(url,{location:location});
  }
}
