import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PickedLocation } from 'src/app/shared/location-picker/location-picker.component';
import {
  ListingInput, ListingService, ListingType, LISTING_TYPES, OwnListing, SUBTYPES
} from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/search-recommendation.service';

const AMENITIES = ['Wi-Fi', 'Parking', 'Air conditioning', 'Breakfast included', 'Hot water', 'Lake/river view',
  'Mountain view', 'Rooftop', 'Pool', 'Family rooms', 'Pet friendly', 'Airport pickup', 'Power backup', 'Kitchen'];
const CUISINES = ['North Indian', 'South Indian', 'Rajasthani', 'Gujarati', 'Punjabi', 'Bengali', 'Goan', 'Himachali',
  'Chinese', 'Continental', 'Italian', 'Cafe', 'Street food', 'Seafood', 'Desserts'];

@Component({
  selector: 'app-listing-form',
  templateUrl: './listing-form.component.html',
  styleUrls: ['./listing-form.component.css']
})
export class ListingFormComponent implements OnInit {

  readonly types = LISTING_TYPES;
  readonly subtypes = SUBTYPES;
  readonly amenityOptions = AMENITIES;
  readonly cuisineOptions = CUISINES;

  listingId: string | null = null;
  listing: OwnListing | null = null;
  model: ListingInput = this.emptyModel();
  saving = false;
  uploading = false;
  errors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public listingService: ListingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id');
    if (this.listingId) {
      this.listingService.getMine(this.listingId).subscribe({
        next: listing => this.fill(listing),
        error: err => {
          this.toastr.error(apiErrorMessage(err, 'Listing not found'));
          this.router.navigate(['/partner']);
        }
      });
    }
  }

  private emptyModel(): ListingInput {
    return {
      type: 'stay', subtype: '', name: '', description: '', city: '', address: '', lat: null, lon: null,
      priceMin: null, priceMax: null, priceUnit: 'night', amenities: [], cuisines: [], vegOnly: false,
      duration: '', openingHours: '', contact: { phone: '', whatsapp: '', email: '', website: '', bookingUrl: '' }
    };
  }

  private fill(listing: OwnListing): void {
    this.listing = listing;
    this.model = {
      ...this.emptyModel(),
      ...listing,
      contact: { ...this.emptyModel().contact, ...(listing.contact || {}) }
    };
  }

  // ---------------------------------------------------------------- type helpers

  setType(type: ListingType): void {
    this.model.type = type;
    this.model.subtype = '';
    this.model.priceUnit = { stay: 'night', restaurant: 'person', activity: 'person' }[type];
  }

  toggle(list: 'amenities' | 'cuisines', value: string): void {
    const current = this.model[list] || [];
    this.model[list] = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
  }

  get priceLabel(): string {
    return { stay: 'Price per night (₹)', restaurant: 'Average cost per person (₹)', activity: 'Price per person (₹)' }[this.model.type];
  }

  // ---------------------------------------------------------------- location

  /** From the location picker; fills city/address only when the owner left them empty. */
  onLocation(location: PickedLocation): void {
    this.model.lat = location.lat;
    this.model.lon = location.lon;
    if (!this.model.city?.trim() && location.city) this.model.city = location.city;
    if (!this.model.address?.trim() && location.area) this.model.address = location.area;
  }

  // ---------------------------------------------------------------- save

  save(): void {
    this.errors = [];
    if (this.model.lat == null || this.model.lon == null) {
      this.errors = ['Set your location: use your current location, paste a Google Maps link, or search your address.'];
      return;
    }
    const payload: ListingInput = {
      ...this.model,
      subtype: this.model.subtype || undefined,
      priceMin: this.model.priceMin ?? undefined,
      priceMax: this.model.priceMax ?? undefined,
      amenities: this.model.type === 'stay' ? this.model.amenities : [],
      cuisines: this.model.type === 'restaurant' ? this.model.cuisines : []
    };
    this.saving = true;
    const request = this.listingId ? this.listingService.update(this.listingId, payload) : this.listingService.create(payload);
    request.subscribe({
      next: listing => {
        this.saving = false;
        if (!this.listingId) {
          this.toastr.success('Saved! Now add a few photos.');
          this.router.navigate(['/partner/edit', listing.id], { fragment: 'photos' });
        } else {
          this.listing = listing;
          this.toastr.success('Changes saved and sent for review');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        const list = err.error?.errors;
        this.errors = Array.isArray(list) && list.length ? list.map((e: any) => e.message) : [apiErrorMessage(err)];
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ---------------------------------------------------------------- photos

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';
    if (!this.listingId || !files.length) return;
    const remaining = 6 - (this.listing?.photos.length || 0);
    this.uploadSequentially(files.slice(0, remaining));
  }

  private uploadSequentially(files: File[]): void {
    const file = files.shift();
    if (!file || !this.listingId) {
      this.uploading = false;
      return;
    }
    this.uploading = true;
    this.listingService.uploadPhoto(this.listingId, file).subscribe({
      next: listing => {
        this.listing = listing;
        this.uploadSequentially(files);
      },
      error: err => {
        this.toastr.error(apiErrorMessage(err, 'Photo upload failed'));
        this.uploadSequentially(files);
      }
    });
  }

  deletePhoto(photo: string): void {
    if (!this.listingId) return;
    this.listingService.deletePhoto(this.listingId, photo).subscribe({
      next: listing => (this.listing = listing),
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }
}
