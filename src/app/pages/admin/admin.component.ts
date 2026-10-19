import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminOverview, ListingService, ListingStatus, OwnListing } from 'src/app/services/listing.service';
import { AuthService } from 'src/app/services/auth.service';
import { apiErrorMessage } from 'src/app/services/search-recommendation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  readonly tabs: { status: ListingStatus; label: string }[] = [
    { status: 'pending', label: 'To review' },
    { status: 'approved', label: 'Live' },
    { status: 'rejected', label: 'Rejected' },
    { status: 'paused', label: 'Paused' }
  ];

  status: ListingStatus = 'pending';
  listings: OwnListing[] = [];
  overview: AdminOverview | null = null;
  loading = false;
  forbidden = false;

  constructor(public listingService: ListingService, private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    // The server decides admin access (a cached login may predate the role field)
    this.loadOverview();
    this.load();
    this.authService.getProfile().subscribe({ error: () => undefined }); // refresh cached role for the navbar
  }

  sum(record: Record<string, number> | undefined): number {
    return Object.values(record || {}).reduce((a, b) => a + b, 0);
  }

  entries(record: Record<string, number> | undefined): [string, number][] {
    return Object.entries(record || {}).sort((a, b) => b[1] - a[1]);
  }

  loadOverview(): void {
    this.listingService.adminOverview().subscribe({
      next: overview => (this.overview = overview),
      error: err => {
        if (err.status === 403) this.forbidden = true;
      }
    });
  }

  select(status: ListingStatus): void {
    this.status = status;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.listingService.adminList(this.status).subscribe({
      next: listings => { this.listings = listings; this.loading = false; },
      error: err => {
        this.loading = false;
        if (err.status === 403) this.forbidden = true;
        else this.toastr.error(apiErrorMessage(err));
      }
    });
  }

  approve(listing: OwnListing): void {
    this.listingService.approve(listing.id).subscribe({
      next: () => this.afterChange(listing, `"${listing.name}" is live`),
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }

  reject(listing: OwnListing): void {
    const reason = prompt(`Why can't "${listing.name}" go live? (The owner will see this.)`, 'Please add real photos and an exact map location.');
    if (!reason) return;
    this.listingService.reject(listing.id, reason).subscribe({
      next: () => this.afterChange(listing, 'Sent back to the owner'),
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }

  toggleFeatured(listing: OwnListing): void {
    let until: string | undefined;
    if (!listing.featured) {
      const days = prompt('Feature for how many days? (leave empty for no end date)', '30');
      if (days === null) return;
      if (days.trim()) until = new Date(Date.now() + Number(days) * 86400000).toISOString().slice(0, 10);
    }
    this.listingService.feature(listing.id, !listing.featured, until).subscribe({
      next: updated => {
        Object.assign(listing, updated);
        this.toastr.success(updated.featured ? 'Featured (shown as Sponsored)' : 'No longer featured');
      },
      error: err => this.toastr.error(apiErrorMessage(err))
    });
  }

  private afterChange(listing: OwnListing, message: string): void {
    this.listings = this.listings.filter(l => l.id !== listing.id);
    this.toastr.success(message);
    this.loadOverview();
  }
}
