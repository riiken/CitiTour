import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { ListingService, PlaceResult } from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/api-error';

export interface PickedLocation {
  lat: number;
  lon: number;
  city?: string;
  area?: string;
  displayName?: string;
}

const INDIA: L.LatLngTuple = [22.5, 79];
const MIN_PIN_ZOOM = 15;

/**
 * Location picker for business owners. Three quick ways in (GPS, Google Maps
 * link, address search), then a map with a fixed centre pin: the owner moves
 * the map under the pin and sees the detected address to confirm.
 */
@Component({
    selector: 'app-location-picker',
    templateUrl: './location-picker.component.html',
    styleUrls: ['./location-picker.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LocationPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() lat: number | null = null;
  @Input() lon: number | null = null;
  /** City typed in the form, used to bias suggestions */
  @Input() cityHint = '';
  @Output() locationChange = new EventEmitter<PickedLocation>();

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  mode: 'none' | 'link' = 'none';
  query = '';
  suggestions: (PlaceResult & { title: string })[] = [];
  searching = false;
  linkText = '';
  resolvingLink = false;
  locating = false;
  message: { kind: 'info' | 'error'; text: string } | null = null;
  confirmedAddress: string | null = null;
  needsZoom = false;
  hasPin = false;

  private map?: L.Map;
  private query$ = new Subject<string>();
  private reverse$ = new Subject<{ lat: number; lon: number }>();
  private subscriptions = new Subscription();
  private programmaticMove = false;
  private destroyed = false;

  constructor(private listingService: ListingService, private zone: NgZone) {
    this.subscriptions.add(this.query$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(q => q.trim().length >= 3),
      switchMap(q => {
        this.searching = true;
        const withCity = this.cityHint && !q.toLowerCase().includes(this.cityHint.toLowerCase()) ? `${q}, ${this.cityHint}` : q;
        return this.listingService.suggest(withCity).pipe(catchError(() => of([] as PlaceResult[])));
      })
    ).subscribe(results => {
      this.searching = false;
      this.suggestions = this.labelled(results);
      if (!results.length) this.message = { kind: 'info', text: 'No matches. Try a nearby landmark, or move the map to your place.' };
    }));

    this.subscriptions.add(this.reverse$.pipe(
      debounceTime(700),
      switchMap(point => this.listingService.reverse(point.lat, point.lon).pipe(catchError(() => of(null))))
    ).subscribe(place => {
      if (!place) return;
      this.confirmedAddress = this.shortAddress(place);
      this.emit({ lat: this.lat!, lon: this.lon!, city: place.city, area: place.area, displayName: place.displayName });
    }));
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initMap());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Existing listing loaded: show its pin
    if ((changes['lat'] || changes['lon']) && this.lat != null && this.lon != null && this.map && !this.hasPin) {
      this.hasPin = true;
      this.moveTo(this.lat, this.lon, 17);
      this.reverse$.next({ lat: this.lat, lon: this.lon });
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscriptions.unsubscribe();
    this.map?.off();
    this.map?.remove();
    this.map = undefined;
  }

  // ---------------------------------------------------------------- options

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.message = { kind: 'error', text: 'Your browser cannot share location. Use search or paste a Google Maps link.' };
      return;
    }
    this.locating = true;
    this.message = null;
    navigator.geolocation.getCurrentPosition(
      position => this.zone.run(() => {
        this.locating = false;
        const { latitude, longitude, accuracy } = position.coords;
        this.setPoint(latitude, longitude, 18);
        this.message = accuracy > 100
          ? { kind: 'info', text: `Location found (accuracy about ${Math.round(accuracy)} m). Move the map so the pin is on your entrance.` }
          : { kind: 'info', text: 'Location found. Fine-tune by moving the map if needed.' };
      }),
      error => this.zone.run(() => {
        this.locating = false;
        this.message = {
          kind: 'error',
          text: error.code === error.PERMISSION_DENIED
            ? 'Location permission was blocked. Allow it in your browser settings, or use search / a Google Maps link.'
            : 'Could not get your location. Use search or paste a Google Maps link.'
        };
      }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  toggleLink(): void {
    this.mode = this.mode === 'link' ? 'none' : 'link';
    this.message = null;
  }

  useLink(): void {
    if (!this.linkText.trim()) return;
    this.resolvingLink = true;
    this.message = null;
    this.listingService.fromLink(this.linkText.trim()).subscribe({
      next: place => {
        this.resolvingLink = false;
        this.mode = 'none';
        this.linkText = '';
        this.setPoint(place.lat, place.lon, 18, place);
        this.message = { kind: 'info', text: `Found${place.name ? ` "${place.name}"` : ' your place'}. Check the pin below.` };
      },
      error: err => {
        this.resolvingLink = false;
        this.message = { kind: 'error', text: apiErrorMessage(err, "We couldn't read that link.") };
      }
    });
  }

  onQuery(value: string): void {
    this.query = value;
    this.message = null;
    if (value.trim().length < 3) this.suggestions = [];
    this.query$.next(value);
  }

  choose(place: PlaceResult): void {
    this.suggestions = [];
    this.query = this.shortAddress(place) || '';
    this.setPoint(place.lat, place.lon, 17, place);
    this.message = { kind: 'info', text: 'Move the map so the pin sits exactly on your entrance.' };
  }

  // ---------------------------------------------------------------- map

  private initMap(): void {
    if (!this.mapContainer) return;
    const start: L.LatLngTuple = this.lat != null && this.lon != null ? [this.lat, this.lon] : INDIA;
    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: true, attributionControl: true })
      .setView(start, this.lat != null ? 17 : 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // The pin is fixed at the centre; the location is wherever the map stops
    this.map.on('moveend', () => {
      if (this.programmaticMove) {
        this.programmaticMove = false;
        return;
      }
      this.zone.run(() => this.onUserMoved());
    });

    if (this.lat != null && this.lon != null) {
      this.hasPin = true;
      this.zone.run(() => this.reverse$.next({ lat: this.lat!, lon: this.lon! }));
    }
    setTimeout(() => !this.destroyed && this.map?.invalidateSize(), 0);
  }

  private onUserMoved(): void {
    if (!this.map) return;
    if (this.map.getZoom() < MIN_PIN_ZOOM) {
      this.needsZoom = !this.hasPin;
      if (!this.hasPin) return;
    }
    this.needsZoom = false;
    const centre = this.map.getCenter();
    this.setPoint(centre.lat, centre.lng);
  }

  private moveTo(lat: number, lon: number, zoom: number): void {
    if (!this.map || this.destroyed) return;
    this.programmaticMove = true;
    // No animation: an in-flight animation would fail if the form is closed mid-move
    this.map.setView([lat, lon], zoom, { animate: false });
  }

  /** Set the location; recentre the map when it came from an option, not a drag. */
  private setPoint(lat: number, lon: number, zoom?: number, known?: PlaceResult): void {
    this.lat = Math.round(lat * 1e6) / 1e6;
    this.lon = Math.round(lon * 1e6) / 1e6;
    this.hasPin = true;
    this.needsZoom = false;
    if (zoom) this.zone.runOutsideAngular(() => this.moveTo(this.lat!, this.lon!, zoom));
    if (known && (known.city || known.area)) {
      this.confirmedAddress = this.shortAddress(known);
      this.emit({ lat: this.lat, lon: this.lon, city: known.city, area: known.area, displayName: known.displayName });
    } else {
      this.confirmedAddress = null;
      this.emit({ lat: this.lat, lon: this.lon });
    }
    this.reverse$.next({ lat: this.lat, lon: this.lon });
  }

  private emit(location: PickedLocation): void {
    this.locationChange.emit(location);
  }

  /**
   * Give each suggestion a distinguishable title: when several share a name
   * (e.g. three "Lal Ghat" results), use the first parts of the full address.
   */
  private labelled(results: PlaceResult[]): (PlaceResult & { title: string })[] {
    const unique = results.filter((place, index) =>
      results.findIndex(other => other.displayName === place.displayName) === index);
    const base = (place: PlaceResult) => place.name || place.area || place.city || '';
    return unique.map(place => {
      const duplicate = unique.filter(other => base(other) === base(place)).length > 1;
      const title = duplicate || !base(place)
        ? (place.displayName || '').split(',').slice(0, 2).join(',').trim()
        : base(place);
      return { ...place, title };
    });
  }

  private shortAddress(place: PlaceResult): string {
    const parts = [place.name, place.area, place.city].filter(Boolean) as string[];
    return [...new Set(parts)].join(', ') || (place.displayName || '').split(',').slice(0, 3).join(',');
  }
}
