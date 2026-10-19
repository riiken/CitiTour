import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['../login/login.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ForgotPasswordComponent {
  email = '';
  sending = false;
  sentMessage: string | null = null;
  error: string | null = null;

  constructor(private authService: AuthService, route: ActivatedRoute) {
    this.email = route.snapshot.queryParamMap.get('email') || '';
  }

  submit(): void {
    this.error = null;
    if (!/^\S+@\S+\.\S+$/.test(this.email.trim())) {
      this.error = 'Enter the email you registered with';
      return;
    }
    this.sending = true;
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: response => { this.sending = false; this.sentMessage = response.message; },
      error: err => { this.sending = false; this.error = err.message; }
    });
  }
}
