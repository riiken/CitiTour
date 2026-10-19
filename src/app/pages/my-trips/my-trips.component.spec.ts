import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { MyTripsComponent } from './my-trips.component';

describe('MyTripsComponent', () => {
  it('splits trips into upcoming and past', () => {
    TestBed.configureTestingModule({ declarations: [MyTripsComponent] });
    const fixture = TestBed.createComponent(MyTripsComponent);
    fixture.detectChanges();
    const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/v1/me/trips')).flush({ data: [
      { id: 'a', title: 'Goa soon', destination: 'Goa', checkIn: day(10), checkOut: day(13), travellers: 2, days: 4, stops: 12, edited: false, updatedAt: '' },
      { id: 'b', title: 'Jaipur last year', destination: 'Jaipur', checkIn: day(-300), checkOut: day(-297), travellers: 2, days: 4, stops: 10, edited: true, updatedAt: '' }
    ] });
    fixture.detectChanges();
    expect(fixture.componentInstance.upcoming.map(t => t.id)).toEqual(['a']);
    expect(fixture.componentInstance.past.map(t => t.id)).toEqual(['b']);
    expect(fixture.nativeElement.textContent).toContain('Upcoming');
  });
});
