import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { PartnerDashboardComponent } from './partner-dashboard.component';

describe('PartnerDashboardComponent', () => {
  it('shows the empty state, then listings with status and stats', () => {
    TestBed.configureTestingModule({ declarations: [PartnerDashboardComponent] });
    const fixture = TestBed.createComponent(PartnerDashboardComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/v1/partner/listings')).flush({ data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No listings yet');

    fixture.componentInstance.load();
    http.expectOne(r => r.url.endsWith('/v1/partner/listings')).flush({ data: [{
      id: '1', name: 'Lake View', city: 'Udaipur', type: 'stay', status: 'rejected', rejectionReason: 'Add photos',
      photos: [], views: 12, leads: 3, contact: {}
    }] });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Needs changes');
    expect(text).toContain('Add photos');
    expect(text).toContain('3 enquiries');
  });
});
