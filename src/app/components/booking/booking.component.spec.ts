import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingComponent } from './booking.component';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ declarations: [BookingComponent] });
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pre-fills sensible future dates', () => {
    expect(component.plan.checkIn > component.today).toBeTrue();
    expect(component.plan.checkOut > component.plan.checkIn).toBeTrue();
  });

  it('emits a structured trip on submit', () => {
    const emitted: any[] = [];
    component.planTripEmmiter.subscribe(plan => emitted.push(plan));
    component.plan.destination = '  Jaipur ';
    component.onSubmit();
    expect(emitted[0].destination).toBe('Jaipur');
    expect(emitted[0].interests.length).toBeGreaterThan(0);
  });

  it('rejects an end date before the start date', () => {
    const emitted: any[] = [];
    component.planTripEmmiter.subscribe(plan => emitted.push(plan));
    component.plan.destination = 'Goa';
    component.plan.checkOut = component.plan.checkIn;
    component.onSubmit();
    expect(emitted.length).toBe(0);
  });

  it('toggles interests', () => {
    component.plan.interests = ['Food'];
    component.toggleInterest('Food');
    component.toggleInterest('Nature');
    expect(component.plan.interests).toEqual(['Nature']);
  });
});
