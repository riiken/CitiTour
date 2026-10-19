import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ListingFormComponent } from './listing-form.component';

describe('ListingFormComponent (new listing)', () => {
  let fixture: ComponentFixture<ListingFormComponent>;
  let component: ListingFormComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ListingFormComponent] });
    fixture = TestBed.createComponent(ListingFormComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('requires a map pin before saving', () => {
    component.model.name = 'Lake View Homestay';
    component.model.city = 'Udaipur';
    component.save();
    expect(component.errors[0]).toContain('Google Maps link');
    http.expectNone(() => true);
  });

  it('fills city and address from the picked location without overwriting typed values', () => {
    component.onLocation({ lat: 24.58, lon: 73.68, city: 'Udaipur', area: 'Lal Ghat' });
    expect(component.model.city).toBe('Udaipur');
    expect(component.model.address).toBe('Lal Ghat');
    component.model.address = '12 Lake Road';
    component.onLocation({ lat: 24.59, lon: 73.69, city: 'Udaipur', area: 'Hathi Pol' });
    expect(component.model.address).toBe('12 Lake Road');
    expect(component.model.lat).toBe(24.59);
  });

  it('switching type resets the category and price unit', () => {
    component.model.subtype = 'homestay';
    component.setType('restaurant');
    expect(component.model.subtype).toBe('');
    expect(component.model.priceUnit).toBe('person');
  });

  it('posts the listing and shows every server validation message', () => {
    Object.assign(component.model, { name: 'Lake View', city: 'Udaipur', lat: 24.57, lon: 73.68 });
    component.save();
    const req = http.expectOne(r => r.url.endsWith('/v1/partner/listings') && r.method === 'POST');
    expect(req.request.body.lat).toBe(24.57);
    req.flush({ success: false, errors: [{ message: 'Add a phone' }, { message: 'Name too short' }] }, { status: 400, statusText: 'Bad Request' });
    expect(component.errors).toEqual(['Add a phone', 'Name too short']);
  });

  it('goes to the photo step after creating', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    Object.assign(component.model, { name: 'Lake View', city: 'Udaipur', lat: 24.57, lon: 73.68, contact: { whatsapp: '9876543210' } });
    component.save();
    http.expectOne(r => r.url.endsWith('/v1/partner/listings')).flush({ success: true, data: { id: 'abc123', photos: [] } });
    expect(navigate).toHaveBeenCalledWith(['/partner/edit', 'abc123'], { fragment: 'photos' });
  });
});
