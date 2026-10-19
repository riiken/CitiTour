import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PlaceComponent } from './place.component';

describe('PlaceComponent', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      declarations: [PlaceComponent],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'abc' }) } } }]
    });
    const fixture = TestBed.createComponent(PlaceComponent);
    fixture.detectChanges();
    return { fixture, http: TestBed.inject(HttpTestingController) };
  };

  it('shows the business with contact buttons and tracks WhatsApp leads', () => {
    const { fixture, http } = setup();
    http.expectOne(r => r.url.endsWith('/v1/listings/abc')).flush({ data: {
      id: 'abc', type: 'stay', subtype: 'homestay', name: 'Lake View', city: 'Udaipur', lat: 24.58, lon: 73.68,
      priceMin: 1800, priceMax: 3200, priceUnit: 'night', photos: [], verified: true, sponsored: false,
      whatsappLink: 'https://wa.me/919876543210?text=Hi', callLink: 'tel:+919876543210'
    } });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Lake View');
    expect(el.textContent).toContain('Homestay · Udaipur');
    expect(el.textContent).toContain('₹1,800–3,200 / night');
    const track = spyOn(fixture.componentInstance.listingService, 'trackLead');
    (el.querySelector('a.btn-success') as HTMLAnchorElement).dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(track).toHaveBeenCalledWith('abc', 'whatsapp', 'place_page');
  });

  it('explains when the listing is not available', () => {
    const { fixture, http } = setup();
    http.expectOne(r => r.url.endsWith('/v1/listings/abc')).flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('not listed on CitiTour');
  });
});
