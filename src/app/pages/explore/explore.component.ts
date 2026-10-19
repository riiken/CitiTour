import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SeoService } from '../../services/seo.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { ExploreData, ExploreSection, ItineraryPlace, ItineraryService } from 'src/app/services/itinerary.service';
import { ListingService } from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/api-error';
import { I18nService } from 'src/app/i18n/i18n.service';

const SECTION_LABELS: Record<ExploreSection, string> = { see: 'See', do: 'Do', stay: 'Stay', eat: 'Eat' };
const POPULAR = ['Udaipur', 'Jaipur', 'Goa', 'Rishikesh', 'Manali', 'Varanasi', 'Munnar', 'Darjeeling'];

/**
 * Browse real places for a destination: sights, activities, stays and food,
 * including verified local businesses. /explore and /explore/:destination
 */
@Component({
    selector: 'app-explore',
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ExploreComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  readonly sectionLabels = SECTION_LABELS;
  readonly sections: ExploreSection[] = ['see', 'do', 'stay', 'eat'];
  readonly popular = POPULAR;

  query = '';
  destination = '';
  data: ExploreData | null = null;
  loading = false;
  error: string | null = null;
  active: ExploreSection = 'see';
  verifiedOnly = false;
  priceBand: string | null = null;

  private map?: L.Map;
  private markers?: L.LayerGroup;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itineraryService: ItineraryService,
    public listingService: ListingService,
    private title: Title,
    private seo: SeoService,
    private zone: NgZone,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe(params => {
      const destination = params.get('destination');
      if (destination) {
        this.query = destination;
        this.load(destination);
      } else {
        this.data = null;
        this.title.setTitle('Explore destinations – CitiTour');
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.data && this.mapContainer && !this.map) {
      this.zone.runOutsideAngular(() => {
        this.map = L.map(this.mapContainer!.nativeElement, { scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        this.markers = L.layerGroup().addTo(this.map);
        this.drawMarkers();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.map?.off();
    this.map?.remove();
  }

  search(destination = this.query): void {
    const value = destination.trim();
    if (value.length < 2) return;
    this.router.navigate(['/explore', value]);
  }

  private load(destination: string): void {
    this.destination = destination;
    this.loading = true;
    this.error = null;
    this.itineraryService.explore(destination).subscribe({
      next: data => {
        this.data = data;
        this.loading = false;
        this.active = this.sections.find(section => data.counts[section]) || 'see';
        this.seo.setPage(
          `Things to do, stay & eat in ${data.destination.name} – CitiTour`,
          `Explore ${data.destination.name}: ${data.counts.see} sights, ${data.counts.stay} places to stay and ${data.counts.eat} places to eat, with maps and booking links.`
        );
        this.zone.runOutsideAngular(() => this.drawMarkers());
      },
      error: err => {
        this.loading = false;
        this.data = null;
        this.error = apiErrorMessage(err, 'Could not load this destination.');
      }
    });
  }

  select(section: ExploreSection): void {
    this.active = section;
    this.priceBand = null;
    this.zone.runOutsideAngular(() => this.drawMarkers());
  }

  get places(): ItineraryPlace[] {
    if (!this.data) return [];
    return this.data.sections[this.active].filter(place =>
      (!this.verifiedOnly || place.partner) && (!this.priceBand || place.priceBand === this.priceBand));
  }

  get priceBands(): string[] {
    if (!this.data || this.active !== 'stay') return [];
    return ['budget', 'mid-range', 'luxury'].filter(band => this.data!.sections.stay.some(place => place.priceBand === band));
  }

  get hasPartners(): boolean {
    return !!this.data?.sections[this.active].some(place => place.partner);
  }

  toggleVerified(): void {
    this.verifiedOnly = !this.verifiedOnly;
    this.zone.runOutsideAngular(() => this.drawMarkers());
  }

  setBand(band: string | null): void {
    this.priceBand = band;
    this.zone.runOutsideAngular(() => this.drawMarkers());
  }

  bookLabel(place: ItineraryPlace): string {
    if (place.kind === 'hotel' || place.kind === 'area') return place.kind === 'area' ? 'Find hotels here' : 'Check prices';
    return place.kind === 'tour' ? 'Book' : 'Tours & tickets';
  }

  priceText(place: ItineraryPlace): string | null {
    if (place.priceMin) {
      const price = place.priceMin.toLocaleString('en-IN');
      return this.i18n.t(place.kind === 'hotel' ? 'From ₹{price}/night' : 'From ₹{price}', { price });
    }
    return place.priceText ? place.priceText : null;
  }

  trackClick(place: ItineraryPlace, url: string | undefined | null): void {
    if (!url) return;
    this.itineraryService.track({
      type: 'outbound_click', partner: this.itineraryService.partnerOf(url), placement: `explore_${this.active}`,
      destination: this.data?.destination.name
    });
  }

  trackLead(place: ItineraryPlace, channel: 'whatsapp' | 'call' | 'website'): void {
    if (place.listingId) this.listingService.trackLead(place.listingId, channel, `explore_${this.active}`);
  }

  private drawMarkers(): void {
    if (!this.map || !this.markers || !this.data) return;
    this.markers.clearLayers();
    const points: L.LatLngTuple[] = [];
    for (const place of this.places) {
      if (typeof place.lat !== 'number' || typeof place.lon !== 'number') continue;
      points.push([place.lat, place.lon]);
      L.circleMarker([place.lat, place.lon], {
        radius: place.partner ? 9 : 7, color: '#fff', weight: 2, fillColor: place.partner ? '#2b8a3e' : '#86B817', fillOpacity: 0.95
      }).bindTooltip(place.name).addTo(this.markers);
    }
    if (points.length) {
      this.map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 14, animate: false });
    } else if (this.data.destination.lat && this.data.destination.lon) {
      this.map.setView([this.data.destination.lat, this.data.destination.lon], 12, { animate: false });
    }
  }
}
