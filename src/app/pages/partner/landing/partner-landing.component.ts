import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-partner-landing',
    templateUrl: './partner-landing.component.html',
    styleUrls: ['./partner-landing.component.css'],
    standalone: false
})
export class PartnerLandingComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
