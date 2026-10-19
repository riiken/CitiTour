import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly destinations = ['Udaipur', 'Jaipur', 'Goa', 'Rishikesh', 'Manali', 'Varanasi', 'Munnar', 'Darjeeling'];
}
