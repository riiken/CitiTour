import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environment';
import { TripRequest } from './trip-planner.service';

export type PlaceKind = 'attraction' | 'hotel' | 'restaurant' | 'tour' | 'area';
export type Slot = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'dinner';

export interface ItineraryPlace {
  kind: PlaceKind;
  name: string;
  description?: string;
  area?: string;
  lat?: number;
  lon?: number;
  rating?: number;
  priceMin?: number;
  priceText?: string;
  price?: number;
  currency?: string;
  priceBand?: string;
  cuisines?: string[];
  duration?: string;
  thumbnail?: string;
  url?: string;
  mapsLink?: string;
  bookingLink?: string;
  // Owner-listed businesses
  partner?: boolean;
  sponsored?: boolean;
  listingId?: string;
  photo?: string;
  priceUnit?: string;
  whatsappLink?: string | null;
  callLink?: string | null;
  websiteLink?: string | null;
}

export interface ItineraryItem {
  slot: Slot;
  note?: string;
  place: ItineraryPlace;
}

export interface ItineraryDay {
  day: number;
  date: string;
  kind: 'arrival' | 'full' | 'departure';
  theme?: string;
  items: ItineraryItem[];
  foodNearbyLink?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  summary?: string;
  request: TripRequest;
  destination: { name: string; displayName?: string; lat?: number; lon?: number };
  days: ItineraryDay[];
  stays: { note?: string; place: ItineraryPlace }[];
  links: { allStays: string; allActivities: string };
  budget?: { total?: string; perDay?: string; includes?: string };
  tips?: string[];
  sources?: string[];
  guide?: { title: string; url: string };
  generatedBy?: 'ai' | 'rules';
  hasPartners?: boolean;
  createdAt?: string;
}

export interface TrackEvent {
  type: 'outbound_click' | 'share' | 'plan_view';
  partner?: string;
  placement?: string;
  itineraryId?: string;
  destination?: string;
}

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private baseUrl = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  create(trip: TripRequest): Observable<Itinerary> {
    return this.http
      .post<{ success: boolean; data: Itinerary }>(`${this.baseUrl}/itineraries`, trip)
      .pipe(map(res => res.data));
  }

  get(id: string): Observable<Itinerary> {
    return this.http
      .get<{ success: boolean; data: Itinerary }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}`)
      .pipe(map(res => res.data));
  }

  /**
   * Fire-and-forget tracking that survives navigation to the partner site.
   */
  track(event: TrackEvent): void {
    const url = `${this.baseUrl}/events`;
    const body = JSON.stringify(event);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))) {
        return;
      }
    } catch {
      // fall through to fetch
    }
    fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true })
      .catch(() => undefined);
  }

  /** Partner name from an outbound URL, for click tracking. */
  partnerOf(url: string | undefined): string {
    if (!url) return 'unknown';
    if (url.includes('booking.com')) return 'booking';
    if (url.includes('getyourguide.com')) return 'getyourguide';
    if (url.includes('google.com/maps')) return 'maps';
    if (url.includes('tripadvisor')) return 'tripadvisor';
    if (url.includes('wikivoyage') || url.includes('wikipedia')) return 'wiki';
    return 'other';
  }
}
