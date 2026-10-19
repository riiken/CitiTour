import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ListingService, OwnListing, LISTING_TYPES } from 'src/app/services/listing.service';
import { apiErrorMessage } from 'src/app/services/api-error';

@Component({
  selector: 'app-partner-dashboard',
  templateUrl: './partner-dashboard.component.html',
  styleUrls: ['./partner-dashboard.component.css']
})
export class PartnerDashboardComponent implements OnInit {
  listings: OwnListing[] = [];
  loading = true;
  error: string | null = null;

  readonly statusLabels: Record<string, string> = {
    pending: 'In review', approved: 'Live', rejected: 'Needs changes', paused: 'Paused'
  };

  constructor(public listingService: ListingService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.listingService.mine().subscribe({
      next: listings => { this.listings = listings; this.loading = false; },
      error: err => { this.error = apiErrorMessage(err); this.loading = false; }
    });
  }

  typeIcon(type: string): string {
    return LISTING_TYPES.find(t => t.value === type)?.icon || 'fa-building';
  }

  togglePause(listing: OwnListing): void {
    this.listingService.setPaused(listing.id, listing.status !== 'paused').subscribe({
      next: updated => {
        Object.assign(listing, updated);
        this.toastr.success(updated.status === 'paused' ? 'Listing paused' : 'Sent for review to go live again');
      },
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }

  remove(listing: OwnListing): void {
    if (!confirm(`Delete "${listing.name}"? This cannot be undone.`)) return;
    this.listingService.remove(listing.id).subscribe({
      next: () => { this.listings = this.listings.filter(l => l.id !== listing.id); this.toastr.success('Listing deleted'); },
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }
}
