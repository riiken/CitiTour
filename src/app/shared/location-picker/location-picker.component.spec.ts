import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { LocationPickerComponent, PickedLocation } from './location-picker.component';

describe('LocationPickerComponent', () => {
  let fixture: ComponentFixture<LocationPickerComponent>;
  let component: LocationPickerComponent;
  let http: HttpTestingController;
  let picked: PickedLocation[];

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [LocationPickerComponent] });
    fixture = TestBed.createComponent(LocationPickerComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    picked = [];
    component.locationChange.subscribe(p => picked.push(p));
    fixture.detectChanges();
  });

  it('uses a pasted Google Maps link', () => {
    component.mode = 'link';
    component.linkText = 'https://maps.app.goo.gl/abc';
    component.useLink();
    http.expectOne(r => r.url.endsWith('/v1/geocode/link'))
      .flush({ data: { lat: 24.5764, lon: 73.6835, name: 'City Palace', area: 'Bhatiyani Chotta', city: 'Udaipur' } });
    expect(picked[0]).toEqual(jasmine.objectContaining({ lat: 24.5764, lon: 73.6835, city: 'Udaipur' }));
    expect(component.confirmedAddress).toContain('Udaipur');
    expect(component.hasPin).toBeTrue();
  });

  it('shows the server message when a link cannot be read', () => {
    component.linkText = 'not a link';
    component.useLink();
    http.expectOne(r => r.url.endsWith('/v1/geocode/link'))
      .flush({ message: 'Tap Share, then Copy link' }, { status: 422, statusText: 'Unprocessable' });
    expect(component.message?.kind).toBe('error');
    expect(component.message?.text).toContain('Copy link');
  });

  it('picks a search suggestion', () => {
    component.choose({ lat: 30.12, lon: 78.32, name: 'Laxman Jhula', city: 'Rishikesh' });
    expect(picked[0]).toEqual(jasmine.objectContaining({ lat: 30.12, lon: 78.32, city: 'Rishikesh' }));
    expect(component.query).toContain('Laxman Jhula');
  });

  it('uses the device location', () => {
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((success: PositionCallback) =>
      success({ coords: { latitude: 15.5, longitude: 73.8, accuracy: 20 } } as GeolocationPosition));
    component.useMyLocation();
    expect(picked[0]).toEqual(jasmine.objectContaining({ lat: 15.5, lon: 73.8 }));
  });
});
