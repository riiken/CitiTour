import { Component, ChangeDetectionStrategy } from '@angular/core';

interface FeaturedDestination {
  name: string;
  region: string;
  tagline: string;
  bestFor: string;
  gradient: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeComponent {
  readonly destinations: FeaturedDestination[] = [
    { name: 'Udaipur', region: 'Rajasthan', tagline: 'Lakes, palaces and rooftop dinners', bestFor: 'Couples · Culture', gradient: 'linear-gradient(135deg,#1c7ed6,#74c0fc)' },
    { name: 'Jaipur', region: 'Rajasthan', tagline: 'Forts, bazaars and the Pink City', bestFor: 'Families · History', gradient: 'linear-gradient(135deg,#e8590c,#ffa94d)' },
    { name: 'Goa', region: 'Goa', tagline: 'Beaches, churches and seafood', bestFor: 'Friends · Beaches', gradient: 'linear-gradient(135deg,#0ca678,#63e6be)' },
    { name: 'Rishikesh', region: 'Uttarakhand', tagline: 'Ganga ghats, yoga and rafting', bestFor: 'Adventure · Spiritual', gradient: 'linear-gradient(135deg,#2b8a3e,#8ce99a)' },
    { name: 'Manali', region: 'Himachal Pradesh', tagline: 'Snow peaks, cafes and valleys', bestFor: 'Mountains · Friends', gradient: 'linear-gradient(135deg,#5c7cfa,#bac8ff)' },
    { name: 'Varanasi', region: 'Uttar Pradesh', tagline: 'Ghats, temples and the evening aarti', bestFor: 'Culture · Spiritual', gradient: 'linear-gradient(135deg,#d6336c,#faa2c1)' },
    { name: 'Munnar', region: 'Kerala', tagline: 'Tea hills, waterfalls and misty mornings', bestFor: 'Nature · Couples', gradient: 'linear-gradient(135deg,#37b24d,#b2f2bb)' },
    { name: 'Darjeeling', region: 'West Bengal', tagline: 'Toy train, tea estates and Kanchenjunga views', bestFor: 'Mountains · Families', gradient: 'linear-gradient(135deg,#7048e8,#d0bfff)' }
  ];
}
