import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environment';
import { TripRequest } from './trip-planner.service';
import { storedLanguage } from '../i18n/i18n.service';

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
  canEdit?: boolean;
  edited?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface TripSummary {
  id: string;
  title: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  travellers: number;
  days: number;
  stops: number;
  edited: boolean;
  updatedAt: string;
}

export type AlternativeGroup = 'activity' | 'meal' | 'stay';
export interface Alternative extends ItineraryPlace { distanceKm: number | null; }

export type TripEdit =
  | { op: 'remove'; day: number; index: number }
  | { op: 'move'; day: number; index: number; toDay: number; slot?: Slot }
  | { op: 'add'; day: number; slot: Slot; place: { kind: PlaceKind; name: string } }
  | { op: 'replace'; day: number; index: number; place: { kind: PlaceKind; name: string } }
  | { op: 'stay_remove'; index: number }
  | { op: 'stay_add'; place: { kind: PlaceKind; name: string } }
  | { op: 'title'; title: string };

export type ExploreSection = 'see' | 'do' | 'stay' | 'eat';

export interface ExploreData {
  destination: { name: string; displayName?: string; lat?: number; lon?: number };
  guide?: { title: string; url: string };
  sections: Record<ExploreSection, ItineraryPlace[]>;
  counts: Record<ExploreSection, number>;
  links: { allStays: string; allActivities: string };
}

export interface PackingItem { item: string; category: string; reason: string; }

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
      .post<{ success: boolean; data: Itinerary }>(`${this.baseUrl}/itineraries`, { ...trip, language: storedLanguage() })
      .pipe(map(res => res.data));
  }

  get(id: string): Observable<Itinerary> {
    return this.http
      .get<{ success: boolean; data: Itinerary }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}`)
      .pipe(map(res => res.data));
  }

  explore(destination: string, params: { checkIn?: string; checkOut?: string; travellers?: number } = {}): Observable<ExploreData> {
    const query: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => { if (value) query[key] = String(value); });
    return this.http.get<{ data: ExploreData }>(`${this.baseUrl}/explore/${encodeURIComponent(destination)}`, { params: query })
      .pipe(map(res => res.data));
  }

  /** Download link for the trip as calendar events (.ics). */
  calendarUrl(id: string): string {
    return `${this.baseUrl}/itineraries/${encodeURIComponent(id)}/calendar.ics`;
  }

  packing(id: string): Observable<PackingItem[]> {
    return this.http.get<{ data: PackingItem[] }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}/packing`)
      .pipe(map(res => res.data));
  }

  myTrips(): Observable<TripSummary[]> {
    return this.http.get<{ data: TripSummary[] }>(`${this.baseUrl}/me/trips`).pipe(map(res => res.data));
  }

  /** Save someone's trip as my own editable copy (returns the trip I can edit). */
  saveCopy(id: string): Observable<Itinerary> {
    return this.http.post<{ data: Itinerary }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}/copy`, {})
      .pipe(map(res => res.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}`);
  }

  alternatives(id: string, group: AlternativeGroup, day?: number): Observable<Alternative[]> {
    const params: Record<string, string> = { group };
    if (day) params['day'] = String(day);
    return this.http.get<{ data: Alternative[] }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}/alternatives`, { params })
      .pipe(map(res => res.data));
  }

  edit(id: string, change: TripEdit): Observable<Itinerary> {
    return this.http.patch<{ data: Itinerary }>(`${this.baseUrl}/itineraries/${encodeURIComponent(id)}`, change)
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
