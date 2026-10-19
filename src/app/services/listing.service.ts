import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '../environment';

export type ListingType = 'stay' | 'restaurant' | 'activity';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'paused';

export const LISTING_TYPES: { value: ListingType; label: string; icon: string }[] = [
  { value: 'stay', label: 'Stay (hotel, homestay…)', icon: 'fa-bed' },
  { value: 'restaurant', label: 'Restaurant or café', icon: 'fa-cutlery' },
  { value: 'activity', label: 'Activity or tour', icon: 'fa-ticket' }
];

export const SUBTYPES: Record<ListingType, { value: string; label: string }[]> = {
  stay: [
    { value: 'hotel', label: 'Hotel' }, { value: 'homestay', label: 'Homestay' }, { value: 'guest_house', label: 'Guest house' },
    { value: 'hostel', label: 'Hostel' }, { value: 'resort', label: 'Resort' }, { value: 'villa', label: 'Villa' }
  ],
  restaurant: [
    { value: 'restaurant', label: 'Restaurant' }, { value: 'cafe', label: 'Café' }, { value: 'dhaba', label: 'Dhaba' },
    { value: 'bar', label: 'Bar' }, { value: 'bakery', label: 'Bakery' }, { value: 'street_food', label: 'Street food' }
  ],
  activity: [
    { value: 'tour', label: 'Guided tour' }, { value: 'trek', label: 'Trek' }, { value: 'water_sports', label: 'Water sports' },
    { value: 'adventure', label: 'Adventure' }, { value: 'workshop', label: 'Workshop / class' }, { value: 'guide', label: 'Local guide' },
    { value: 'transport', label: 'Taxi / transport' }
  ]
};

export interface ListingInput {
  type: ListingType;
  subtype?: string;
  name: string;
  description?: string;
  city: string;
  address?: string;
  lat: number | null;
  lon: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceUnit?: string;
  amenities?: string[];
  cuisines?: string[];
  vegOnly?: boolean;
  duration?: string;
  openingHours?: string;
  contact: { phone?: string; whatsapp?: string; email?: string; website?: string; bookingUrl?: string };
}

export interface OwnListing extends ListingInput {
  id: string;
  status: ListingStatus;
  rejectionReason?: string;
  featured?: boolean;
  featuredUntil?: string;
  photos: string[];
  views: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
  owner?: { name: string; email: string } | null;
}

export interface PlaceResult {
  lat: number;
  lon: number;
  name?: string;
  area?: string;
  city?: string;
  state?: string;
  displayName?: string;
}

/** Public view of an approved listing (contact only as links). */
export interface PublicListing {
  id: string;
  type: ListingType;
  subtype?: string;
  name: string;
  description?: string;
  city: string;
  address?: string;
  lat: number;
  lon: number;
  priceMin?: number;
  priceMax?: number;
  priceUnit?: string;
  amenities?: string[];
  cuisines?: string[];
  vegOnly?: boolean;
  duration?: string;
  openingHours?: string;
  photos: string[];
  verified: boolean;
  sponsored: boolean;
  whatsappLink?: string | null;
  callLink?: string | null;
  websiteLink?: string | null;
}

export interface AdminOverview {
  listings: Record<string, number>;
  last30Days: { plans: number; leads: Record<string, number>; outboundClicks: Record<string, number> };
}

const MAX_EDGE_PX = 1280;

/** Resize and re-encode an image in the browser before upload (keeps uploads ~150 KB). */
export const resizeImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/jpeg', 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image we can read'));
    };
    img.src = url;
  });

@Injectable({ providedIn: 'root' })
export class ListingService {
  private base = `${environment.apiUrl}/v1`;
  readonly apiOrigin = environment.apiUrl.replace(/\/api$/, '');

  constructor(private http: HttpClient) {}

  /** Photo paths from the API are relative to the API origin. */
  photoUrl(path: string): string {
    return path.startsWith('http') ? path : `${this.apiOrigin}${path}`;
  }

  // ---- partner
  mine(): Observable<OwnListing[]> {
    return this.http.get<{ data: OwnListing[] }>(`${this.base}/partner/listings`).pipe(map(r => r.data));
  }
  getMine(id: string): Observable<OwnListing> {
    return this.http.get<{ data: OwnListing }>(`${this.base}/partner/listings/${id}`).pipe(map(r => r.data));
  }
  create(input: ListingInput): Observable<OwnListing> {
    return this.http.post<{ data: OwnListing }>(`${this.base}/partner/listings`, input).pipe(map(r => r.data));
  }
  update(id: string, input: Partial<ListingInput>): Observable<OwnListing> {
    return this.http.patch<{ data: OwnListing }>(`${this.base}/partner/listings/${id}`, input).pipe(map(r => r.data));
  }
  setPaused(id: string, paused: boolean): Observable<OwnListing> {
    return this.http.post<{ data: OwnListing }>(`${this.base}/partner/listings/${id}/pause`, { paused }).pipe(map(r => r.data));
  }
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/partner/listings/${id}`);
  }
  uploadPhoto(id: string, file: File): Observable<OwnListing> {
    return from(resizeImage(file)).pipe(
      switchMap(blob => this.http.post<{ data: OwnListing }>(`${this.base}/partner/listings/${id}/photos`, blob, {
        headers: { 'Content-Type': 'image/jpeg' }
      })),
      map(r => r.data)
    );
  }
  deletePhoto(id: string, photoPath: string): Observable<OwnListing> {
    const photoId = photoPath.split('/').pop();
    return this.http.delete<{ data: OwnListing }>(`${this.base}/partner/listings/${id}/photos/${photoId}`).pipe(map(r => r.data));
  }
  geocode(q: string): Observable<PlaceResult> {
    return this.http.get<{ data: PlaceResult }>(`${this.base}/geocode`, { params: { q } }).pipe(map(r => r.data));
  }
  /** Address suggestions (India first). */
  suggest(q: string): Observable<PlaceResult[]> {
    return this.http.get<{ results: PlaceResult[] }>(`${this.base}/geocode`, { params: { q } }).pipe(map(r => r.results || []));
  }
  /** Readable address for a point. */
  reverse(lat: number, lon: number): Observable<PlaceResult> {
    return this.http.get<{ data: PlaceResult }>(`${this.base}/geocode/reverse`, { params: { lat, lon } }).pipe(map(r => r.data));
  }
  /** Location from a pasted Google Maps link or "lat, lon" text. */
  fromLink(link: string): Observable<PlaceResult> {
    return this.http.post<{ data: PlaceResult }>(`${this.base}/geocode/link`, { link }).pipe(map(r => r.data));
  }

  // ---- public
  getPublic(id: string): Observable<PublicListing> {
    return this.http.get<{ data: PublicListing }>(`${this.base}/listings/${id}`).pipe(map(r => r.data));
  }

  /** Fire-and-forget lead tracking that survives opening WhatsApp / the dialler. */
  trackLead(listingId: string, channel: 'whatsapp' | 'call' | 'website', placement: string, itineraryId?: string): void {
    const url = `${this.base}/listings/${listingId}/lead`;
    const body = JSON.stringify({ channel, placement, itineraryId });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))) return;
    } catch {
      // fall through
    }
    fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => undefined);
  }

  // ---- admin
  adminOverview(): Observable<AdminOverview> {
    return this.http.get<{ data: AdminOverview }>(`${this.base}/admin/overview`).pipe(map(r => r.data));
  }
  adminList(status: ListingStatus): Observable<OwnListing[]> {
    return this.http.get<{ data: OwnListing[] }>(`${this.base}/admin/listings`, { params: { status } }).pipe(map(r => r.data));
  }
  approve(id: string): Observable<OwnListing> {
    return this.http.post<{ data: OwnListing }>(`${this.base}/admin/listings/${id}/approve`, {}).pipe(map(r => r.data));
  }
  reject(id: string, reason: string): Observable<OwnListing> {
    return this.http.post<{ data: OwnListing }>(`${this.base}/admin/listings/${id}/reject`, { reason }).pipe(map(r => r.data));
  }
  feature(id: string, featured: boolean, until?: string): Observable<OwnListing> {
    return this.http.post<{ data: OwnListing }>(`${this.base}/admin/listings/${id}/feature`, { featured, until }).pipe(map(r => r.data));
  }
}
