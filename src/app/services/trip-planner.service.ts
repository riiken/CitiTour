import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TripRequest {
  destination: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  travellers: number;
  budget: string;
  interests: string[];
}

export interface GuideItem {
  placeName: string;
  explanation: string;
  location?: string;
  cost?: string;
  mapsLink?: string;
  bookingLink?: string;
}

export interface TravelGuide {
  destination?: string;
  budget: string;
  travelGuide: GuideItem[];
  stayGuide: GuideItem[];
  foodGuide: GuideItem[];
}

const TRIP_STORAGE_KEY = 'currentTrip';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {
  private apiUrl = environment.apiURL;
  private tripPlannerSubject = new BehaviorSubject<TripRequest | null>(this.readStoredTrip());
  public tripPlanner$: Observable<TripRequest | null> = this.tripPlannerSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTripRecommentdation(trip: TripRequest): Observable<{ query: string; guides: TravelGuide }> {
    const query = `Plan a ${trip.budget.toLowerCase()} trip to ${trip.destination} from ${trip.checkIn} to ${trip.checkOut} for ${trip.travellers} travellers.`;
    return this.http.post<{ query: string; guides: TravelGuide }>(`${this.apiUrl}query`, {
      query,
      destination: trip.destination,
      checkIn: trip.checkIn,
      checkOut: trip.checkOut,
      travellers: trip.travellers,
      budget: trip.budget,
      interests: trip.interests
    });
  }

  setTripData(data: TripRequest): void {
    this.tripPlannerSubject.next(data);
    try {
      localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // best-effort persistence
    }
  }

  getTripData(): TripRequest | null {
    return this.tripPlannerSubject.getValue();
  }

  private readStoredTrip(): TripRequest | null {
    try {
      const raw = localStorage.getItem(TRIP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
