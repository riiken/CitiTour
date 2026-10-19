import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { I18nService } from '../i18n/i18n.service';

@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.css'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms 300ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate('300ms', style({ opacity: 0 })),
            ])
        ])
    ],
    standalone: false
})
export class HeroComponent {
  searchQuery = '';
  readonly popularDestinations = ['Goa', 'Jaipur', 'Manali', 'Udaipur', 'Rishikesh', 'Kerala'];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private i18n: I18nService
  ) {}

  searchFor(destination: string): void {
    this.searchQuery = destination;
    this.onSearch();
  }

  onSearch(): void {
    const query = this.searchQuery?.trim();
    if (!query) {
      this.toastr.info(this.i18n.t('Enter a city or destination.'));
      return;
    }
    localStorage.setItem('location', query);
    this.router.navigate(['/plan-trip'], { queryParams: { destination: query } });
  }
}
