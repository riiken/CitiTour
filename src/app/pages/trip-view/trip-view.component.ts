import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Title, Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import {
  Alternative, AlternativeGroup, Itinerary, ItineraryItem, ItineraryPlace, ItineraryService, Slot, TripEdit
} from 'src/app/services/itinerary.service';
import { DestinationService, ForecastDay, WeatherData } from 'src/app/services/destination.service';
import { ListingService } from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/search-recommendation.service';

const DAY_COLOURS = ['#86B817', '#e8590c', '#1c7ed6', '#ae3ec9', '#0ca678', '#f08c00', '#d6336c', '#5c7cfa', '#2b8a3e', '#c92a2a'];

const SLOT_LABELS: Record<string, string> = {
  morning: 'Morning', lunch: 'Lunch', afternoon: 'Afternoon', evening: 'Evening', dinner: 'Dinner'
};

@Component({
  selector: 'app-trip-view',
  templateUrl: './trip-view.component.html',
  styleUrls: ['./trip-view.component.css']
})
export class TripViewComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  itinerary: Itinerary | null = null;
  loading = true;
  error: string | null = null;
  copied = false;
  selectedDay: number | null = null;

  // Editing
  editing = false;
  busy = false;
  editingTitle = false;
  titleDraft = '';
  picker: {
    group: AlternativeGroup;
    mode: 'add' | 'replace' | 'stay';
    day?: number;
    index?: number;
    slot: Slot | null;
    options: Alternative[];
    loading: boolean;
  } | null = null;
  private autoSave = false;

  weather: WeatherData | null = null;
  forecast: ForecastDay[] = [];

  readonly slotLabels = SLOT_LABELS;
  readonly dayColours = DAY_COLOURS;

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private itineraryService: ItineraryService,
    private destinationService: DestinationService,
    public listingService: ListingService,
    private title: Title,
    private meta: Meta,
    private zone: NgZone,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.autoSave = this.route.snapshot.queryParamMap.get('save') === '1';
    this.subscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.load(id);
    });
  }

  ngAfterViewChecked(): void {
    if (this.itinerary && this.mapContainer && !this.map) {
      this.zone.runOutsideAngular(() => this.renderMap());
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.map?.remove();
  }

  private load(id: string): void {
    this.loading = true;
    this.error = null;
    this.itineraryService.get(id).subscribe({
      next: itinerary => {
        this.itinerary = itinerary;
        this.loading = false;
        this.zone.runOutsideAngular(() => this.drawMarkers());
        if (this.autoSave) {
          this.autoSave = false;
          if (!itinerary.canEdit && this.isLoggedIn) this.saveTrip();
        }
        this.title.setTitle(`${itinerary.title} – CitiTour`);
        this.meta.updateTag({ name: 'description', content: itinerary.summary || `Day-by-day plan for ${itinerary.destination.name}` });
        this.loadWeather(itinerary.destination.name);
      },
      error: err => {
        this.loading = false;
        this.error = apiErrorMessage(err, 'We could not load this trip plan.');
      }
    });
  }

  private loadWeather(destination: string): void {
    this.destinationService.getTravelPlanningData(destination, 'metric').subscribe({
      next: response => {
        this.weather = (response.data.currentConditions as any) || null;
        this.forecast = response.data.weatherForecast || [];
      },
      error: () => { /* weather is optional */ }
    });
  }

  // ---------------------------------------------------------------- display

  get nights(): number {
    if (!this.itinerary) return 0;
    const { checkIn, checkOut } = this.itinerary.request;
    return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
  }

  kindIcon(kind: string): string {
    return {
      attraction: 'fa-university', tour: 'fa-ticket', restaurant: 'fa-cutlery', hotel: 'fa-bed', area: 'fa-map-marker'
    }[kind] || 'fa-map-marker';
  }

  stayPrice(place: ItineraryPlace): string | null {
    if (place.priceMin) return `Listed from ₹${place.priceMin.toLocaleString('en-IN')}/night`;
    if (place.priceText) return `Listed: ${place.priceText}`;
    return null;
  }

  isMeal(item: ItineraryItem): boolean {
    return item.slot === 'lunch' || item.slot === 'dinner';
  }

  bookLabel(place: ItineraryPlace): string {
    return place.kind === 'tour' ? 'Book' : 'Find tours & tickets';
  }

  selectDay(day: number | null): void {
    this.selectedDay = this.selectedDay === day ? null : day;
    this.zone.runOutsideAngular(() => this.drawMarkers());
  }

  // ---------------------------------------------------------------- saving & editing

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  /** Save to My trips (as an editable copy); logged-out users log in first. */
  saveTrip(): void {
    if (!this.itinerary) return;
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/trip/${this.itinerary.id}?save=1` } });
      return;
    }
    this.busy = true;
    this.itineraryService.saveCopy(this.itinerary.id).subscribe({
      next: saved => {
        this.busy = false;
        this.toastr.success('Saved to My trips. You can now edit it.');
        this.router.navigate(['/trip', saved.id], { replaceUrl: true });
      },
      error: err => {
        this.busy = false;
        this.toastr.error(apiErrorMessage(err, 'Could not save this trip'));
      }
    });
  }

  toggleEditing(): void {
    this.editing = !this.editing;
    this.picker = null;
  }

  private apply(change: TripEdit, success?: string): void {
    if (!this.itinerary || this.busy) return;
    this.busy = true;
    this.itineraryService.edit(this.itinerary.id, change).subscribe({
      next: updated => {
        this.itinerary = updated;
        this.busy = false;
        this.picker = null;
        this.zone.runOutsideAngular(() => this.drawMarkers());
        if (success) this.toastr.success(success);
      },
      error: err => {
        this.busy = false;
        this.toastr.error(apiErrorMessage(err, 'That change could not be saved'));
      }
    });
  }

  removeItem(day: number, index: number): void {
    this.apply({ op: 'remove', day, index });
  }

  moveItem(day: number, index: number, toDay: string): void {
    const target = Number(toDay);
    if (!target || target === day) return;
    const item = this.itinerary?.days.find(d => d.day === day)?.items[index];
    const slot: Slot | undefined = item && this.isMeal(item) ? item.slot : undefined;
    this.apply({ op: 'move', day, index, toDay: target, slot: slot || (item?.slot as Slot) }, `Moved to day ${target}`);
  }

  removeStay(index: number): void {
    this.apply({ op: 'stay_remove', index });
  }

  startTitleEdit(): void {
    this.titleDraft = this.itinerary?.title || '';
    this.editingTitle = true;
  }

  saveTitle(): void {
    this.editingTitle = false;
    const title = this.titleDraft.trim();
    if (title.length >= 2 && title !== this.itinerary?.title) this.apply({ op: 'title', title });
  }

  /** Open the list of real places that can be added or swapped in. */
  openPicker(group: AlternativeGroup, mode: 'add' | 'replace' | 'stay', day?: number, index?: number): void {
    if (!this.itinerary) return;
    const item = day && index !== undefined ? this.itinerary.days.find(d => d.day === day)?.items[index] : undefined;
    const defaultSlot: Slot | null = mode === 'replace' ? (item?.slot as Slot) : group === 'meal' ? 'lunch' : group === 'activity' ? 'afternoon' : null;
    this.picker = { group, mode, day, index, slot: defaultSlot, options: [], loading: true };
    this.itineraryService.alternatives(this.itinerary.id, group, day).subscribe({
      next: options => {
        if (this.picker) {
          this.picker.options = options;
          this.picker.loading = false;
        }
      },
      error: err => {
        this.picker = null;
        this.toastr.error(apiErrorMessage(err, 'Could not load places'));
      }
    });
  }

  slotChoices(group: AlternativeGroup): Slot[] {
    return group === 'meal' ? ['lunch', 'dinner'] : ['morning', 'afternoon', 'evening'];
  }

  choose(option: Alternative): void {
    const picker = this.picker;
    if (!picker) return;
    const place = { kind: option.kind, name: option.name };
    if (picker.mode === 'stay') {
      this.apply({ op: 'stay_add', place }, `${option.name} added`);
    } else if (picker.mode === 'replace' && picker.day && picker.index !== undefined) {
      this.apply({ op: 'replace', day: picker.day, index: picker.index, place }, `Swapped in ${option.name}`);
    } else if (picker.day && picker.slot) {
      this.apply({ op: 'add', day: picker.day, slot: picker.slot, place }, `${option.name} added to day ${picker.day}`);
    }
  }

  // ---------------------------------------------------------------- sharing

  get shareUrl(): string {
    return window.location.href;
  }

  get whatsappUrl(): string {
    const text = this.itinerary
      ? `${this.itinerary.title}: my ${this.nights}-night ${this.itinerary.destination.name} plan on CitiTour ${this.shareUrl}`
      : this.shareUrl;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  async share(): Promise<void> {
    this.trackShare('native');
    if (navigator.share && this.itinerary) {
      try {
        await navigator.share({ title: this.itinerary.title, url: this.shareUrl });
        return;
      } catch {
        // cancelled or unsupported: fall back to copy
      }
    }
    await this.copyLink();
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    } catch {
      window.prompt('Copy this link', this.shareUrl);
    }
    this.trackShare('copy');
  }

  trackShare(channel: string): void {
    this.itineraryService.track({
      type: 'share', partner: channel, itineraryId: this.itinerary?.id, destination: this.itinerary?.destination.name
    });
  }

  /** A traveller contacting an owner-listed business (billable lead). */
  trackLead(place: ItineraryPlace, channel: 'whatsapp' | 'call' | 'website', placement: string): void {
    if (place.listingId) this.listingService.trackLead(place.listingId, channel, placement, this.itinerary?.id);
  }

  /** Track partner clicks without delaying navigation. */
  trackClick(url: string | undefined, placement: string): void {
    this.itineraryService.track({
      type: 'outbound_click',
      partner: this.itineraryService.partnerOf(url),
      placement,
      itineraryId: this.itinerary?.id,
      destination: this.itinerary?.destination.name
    });
  }

  // ---------------------------------------------------------------- map

  private renderMap(): void {
    if (!this.mapContainer || !this.itinerary) return;
    this.map = L.map(this.mapContainer.nativeElement, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.drawMarkers();
  }

  private drawMarkers(): void {
    if (!this.map || !this.markersLayer || !this.itinerary) return;
    this.markersLayer.clearLayers();
    const points: L.LatLngExpression[] = [];

    for (const day of this.itinerary.days) {
      if (this.selectedDay !== null && day.day !== this.selectedDay) continue;
      const colour = DAY_COLOURS[(day.day - 1) % DAY_COLOURS.length];
      const route: L.LatLngExpression[] = [];
      for (const item of day.items) {
        const { lat, lon, name } = item.place;
        if (typeof lat !== 'number' || typeof lon !== 'number') continue;
        const point: L.LatLngExpression = [lat, lon];
        points.push(point);
        if (!this.isMeal(item)) route.push(point);
        L.circleMarker(point, {
          radius: this.isMeal(item) ? 6 : 9, color: '#fff', weight: 2, fillColor: colour, fillOpacity: 0.95
        }).bindTooltip(`Day ${day.day} · ${SLOT_LABELS[item.slot]}: ${name}`).addTo(this.markersLayer);
      }
      if (route.length > 1) L.polyline(route, { color: colour, weight: 3, opacity: 0.6, dashArray: '6 6' }).addTo(this.markersLayer);
    }

    for (const stay of this.itinerary.stays) {
      const { lat, lon, name } = stay.place;
      if (typeof lat !== 'number' || typeof lon !== 'number') continue;
      points.push([lat, lon]);
      L.circleMarker([lat, lon], { radius: 8, color: '#333', weight: 2, fillColor: '#fff', fillOpacity: 1 })
        .bindTooltip(`Stay: ${name}`).addTo(this.markersLayer);
    }

    if (points.length) {
      this.map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 14 });
    } else if (this.itinerary.destination.lat && this.itinerary.destination.lon) {
      this.map.setView([this.itinerary.destination.lat, this.itinerary.destination.lon], 12);
    }
  }
}
