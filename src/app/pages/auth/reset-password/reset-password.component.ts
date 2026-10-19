import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['../login/login.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ResetPasswordComponent {
  email: string;
  token: string;
  password = '';
  confirm = '';
  saving = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService, route: ActivatedRoute) {
    this.email = route.snapshot.queryParamMap.get('email') || '';
    this.token = route.snapshot.queryParamMap.get('token') || '';
  }

  get linkValid(): boolean {
    return /^[a-f0-9]{64}$/.test(this.token) && !!this.email;
  }

  submit(): void {
    this.error = null;
    if (!PASSWORD_RULE.test(this.password)) {
      this.error = 'Use at least 8 characters with an uppercase letter, a lowercase letter and a number.';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match';
      return;
    }
    this.saving = true;
    this.authService.resetPassword(this.email, this.token, this.password).subscribe({
      next: response => {
        this.toastr.success(response.message);
        this.router.navigate(['/login']);
      },
      error: err => { this.saving = false; this.error = err.message; }
    });
  }
}
