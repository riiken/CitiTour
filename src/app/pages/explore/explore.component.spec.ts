import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ExploreComponent } from './explore.component';

describe('ExploreComponent', () => {
  it('loads a destination, opens the first non-empty section and filters', () => {
    TestBed.configureTestingModule({
      declarations: [ExploreComponent],
      providers: [{ provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ destination: 'Udaipur' })) } }]
    });
    const fixture = TestBed.createComponent(ExploreComponent);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/v1/explore/Udaipur')).flush({ data: {
      destination: { name: 'Udaipur', lat: 24.58, lon: 73.68 },
      sections: {
        see: [], do: [],
        stay: [
          { kind: 'hotel', name: 'Lake View', partner: true, listingId: 'x1', priceBand: 'budget', whatsappLink: 'https://wa.me/91' },
          { kind: 'hotel', name: 'Grand', priceBand: 'luxury', bookingLink: 'https://www.booking.com/x' }
        ],
        eat: [{ kind: 'restaurant', name: 'Ambrai' }]
      },
      counts: { see: 0, do: 0, stay: 2, eat: 1 },
      links: { allStays: 'https://www.booking.com/all', allActivities: 'https://www.getyourguide.com/s' }
    } });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.active).toBe('stay');
    expect(component.places.length).toBe(2);
    component.toggleVerified();
    expect(component.places.map(p => p.name)).toEqual(['Lake View']);
    component.toggleVerified();
    component.setBand('luxury');
    expect(component.places.map(p => p.name)).toEqual(['Grand']);
    expect(fixture.nativeElement.textContent).toContain('Plan a trip here');
  });
});
