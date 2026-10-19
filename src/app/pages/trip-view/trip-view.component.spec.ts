import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TripViewComponent } from './trip-view.component';

const itinerary = {
  id: 'abcDEF123456',
  title: 'Royal Udaipur',
  request: { destination: 'Udaipur', checkIn: '2099-12-10', checkOut: '2099-12-13', travellers: 2, budget: 'Mid-range', interests: [] },
  destination: { name: 'Udaipur', lat: 24.58, lon: 73.68 },
  days: [{ day: 1, date: '2099-12-10', kind: 'arrival', items: [
    { slot: 'afternoon', note: 'Go early', place: { kind: 'attraction', name: 'City Palace', lat: 24.576, lon: 73.683, mapsLink: 'https://www.google.com/maps/x', bookingLink: 'https://www.getyourguide.com/s/?q=x' } }
  ] }],
  stays: [{ note: 'Central', place: { kind: 'hotel', name: 'Poonam Haveli', priceMin: 2000, bookingLink: 'https://www.booking.com/searchresults.html?ss=x' } }],
  links: { allStays: 'https://www.booking.com/searchresults.html?ss=Udaipur', allActivities: 'https://www.getyourguide.com/s/?q=Udaipur' },
  budget: { total: '₹20,000 - ₹30,000' },
  tips: ['Book boat rides early'],
  generatedBy: 'ai'
};

describe('TripViewComponent', () => {
  let fixture: ComponentFixture<TripViewComponent>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TripViewComponent],
      providers: [{ provide: ActivatedRoute, useValue: {
        paramMap: of(convertToParamMap({ id: 'abcDEF123456' })),
        snapshot: { queryParamMap: convertToParamMap({}) }
      } }]
    });
    fixture = TestBed.createComponent(TripViewComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(r => r.url.endsWith('/v1/itineraries/abcDEF123456')).flush({ success: true, data: itinerary });
    fixture.detectChanges();
  });

  it('renders stays with a sponsored booking link and the day plan', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Royal Udaipur');
    const stayLink = el.querySelector('.stay-card a[rel~="sponsored"]') as HTMLAnchorElement;
    expect(stayLink.href).toContain('booking.com');
    expect(el.textContent).toContain('Listed from ₹2,000/night');
    expect(el.textContent).toContain('City Palace');
    expect(fixture.componentInstance.nights).toBe(3);
  });

  it('tracks partner clicks', () => {
    const track = spyOn(fixture.componentInstance['itineraryService'], 'track');
    (fixture.nativeElement.querySelector('.stay-card a[rel~="sponsored"]') as HTMLAnchorElement)
      .dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(track).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'outbound_click', partner: 'booking', placement: 'itinerary_stay' }));
  });

  it('builds a WhatsApp share link', () => {
    expect(fixture.componentInstance.whatsappUrl).toContain('https://wa.me/?text=');
  });

  it('offers "Save to my trips" when the viewer does not own the trip', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Save to my trips');
    expect(el.textContent).not.toContain('Edit trip');
  });

  it('owners can edit: removing a stop sends the edit and shows the result', () => {
    fixture.componentInstance.itinerary = { ...(itinerary as any), canEdit: true };
    fixture.componentInstance.toggleEditing();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Done editing');

    fixture.componentInstance.removeItem(1, 0);
    const req = http.expectOne(r => r.method === 'PATCH' && r.url.endsWith('/v1/itineraries/abcDEF123456'));
    expect(req.request.body).toEqual({ op: 'remove', day: 1, index: 0 });
    req.flush({ data: { ...itinerary, canEdit: true, days: [{ ...itinerary.days[0], items: [] }] } });
    expect(fixture.componentInstance.itinerary!.days[0].items.length).toBe(0);
  });

  it('opens real alternatives and swaps one in', () => {
    fixture.componentInstance.itinerary = { ...(itinerary as any), canEdit: true };
    fixture.componentInstance.openPicker('activity', 'replace', 1, 0);
    http.expectOne(r => r.url.includes('/alternatives')).flush({ data: [{ kind: 'attraction', name: 'Jagdish Temple', distanceKm: 0.4 }] });
    fixture.componentInstance.choose(fixture.componentInstance.picker!.options[0]);
    const req = http.expectOne(r => r.method === 'PATCH');
    expect(req.request.body).toEqual({ op: 'replace', day: 1, index: 0, place: { kind: 'attraction', name: 'Jagdish Temple' } });
  });
});
