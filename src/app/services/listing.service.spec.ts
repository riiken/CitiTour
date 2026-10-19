import { TestBed } from '@angular/core/testing';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  it('resolves photo paths against the API origin', () => {
    const service = TestBed.inject(ListingService);
    expect(service.photoUrl('/api/v1/photos/abc')).toBe(`${service.apiOrigin}/api/v1/photos/abc`);
    expect(service.photoUrl('https://cdn.example/x.jpg')).toBe('https://cdn.example/x.jpg');
  });

  it('sends leads as beacons', () => {
    const beacon = spyOn(navigator, 'sendBeacon').and.returnValue(true);
    TestBed.inject(ListingService).trackLead('abc', 'whatsapp', 'itinerary_stay', 'trip1');
    expect(beacon).toHaveBeenCalled();
    expect(beacon.calls.mostRecent().args[0]).toContain('/v1/listings/abc/lead');
  });
});
