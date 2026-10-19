import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import * as L from 'leaflet';
import { ListingService, PublicListing, SUBTYPES } from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/api-error';

/**
 * Public page for an approved business: the owner's shareable mini-site.
 */
@Component({
    selector: 'app-place',
    templateUrl: './place.component.html',
    styleUrls: ['./place.component.css'],
    standalone: false
})
export class PlaceComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  place: PublicListing | null = null;
  loading = true;
  error: string | null = null;
  activePhoto = 0;
  copied = false;

  private map?: L.Map;

  constructor(
    private route: ActivatedRoute,
    public listingService: ListingService,
    private title: Title,
    private meta: Meta,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.listingService.getPublic(id).subscribe({
      next: place => {
        this.place = place;
        this.loading = false;
        this.title.setTitle(`${place.name}, ${place.city} – CitiTour`);
        this.meta.updateTag({ name: 'description', content: (place.description || `${this.categoryLabel} in ${place.city}`).slice(0, 160) });
      },
      error: err => {
        this.loading = false;
        this.error = err.status === 404 ? 'This business is not listed on CitiTour (or is no longer available).' : apiErrorMessage(err);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.place && this.mapContainer && !this.map) {
      this.zone.runOutsideAngular(() => {
        this.map = L.map(this.mapContainer!.nativeElement, { scrollWheelZoom: false, dragging: !L.Browser.mobile })
          .setView([this.place!.lat, this.place!.lon], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        L.circleMarker([this.place!.lat, this.place!.lon], { radius: 10, color: '#fff', weight: 3, fillColor: '#d6336c', fillOpacity: 1 })
          .addTo(this.map);
      });
    }
  }

  ngOnDestroy(): void {
    this.map?.off();
    this.map?.remove();
  }

  get categoryLabel(): string {
    if (!this.place) return '';
    const sub = this.place.subtype && SUBTYPES[this.place.type].find(s => s.value === this.place!.subtype);
    return sub ? sub.label : { stay: 'Stay', restaurant: 'Restaurant', activity: 'Activity' }[this.place.type];
  }

  get priceText(): string | null {
    const place = this.place;
    if (!place || !place.priceMin) return null;
    const unit = { night: 'night', person: 'person', group: 'group', activity: 'activity' }[place.priceUnit || 'night'] || 'night';
    const range = place.priceMax && place.priceMax > place.priceMin
      ? `₹${place.priceMin.toLocaleString('en-IN')}–${place.priceMax.toLocaleString('en-IN')}`
      : `From ₹${place.priceMin.toLocaleString('en-IN')}`;
    return `${range} / ${unit}`;
  }

  get directionsLink(): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${this.place?.lat},${this.place?.lon}`;
  }

  get shareUrl(): string {
    return window.location.href;
  }

  get whatsappShare(): string {
    return `https://wa.me/?text=${encodeURIComponent(`${this.place?.name}, ${this.place?.city}: ${this.shareUrl}`)}`;
  }

  lead(channel: 'whatsapp' | 'call' | 'website'): void {
    if (this.place) this.listingService.trackLead(this.place.id, channel, 'place_page');
  }

  async share(): Promise<void> {
    if (navigator.share && this.place) {
      try {
        await navigator.share({ title: this.place.name, url: this.shareUrl });
        return;
      } catch {
        // fall back to copy
      }
    }
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    } catch {
      window.prompt('Copy this link', this.shareUrl);
    }
  }
}
