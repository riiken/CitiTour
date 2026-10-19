import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    standalone: false
})
export class RegisterComponent implements OnInit {
  returnUrl = '/user-dashboard';
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Only same-site paths are allowed as redirect targets
    const requested = this.route.snapshot.queryParams['returnUrl'];
    this.returnUrl = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//')
      ? requested : '/user-dashboard';
    if (this.authService.isLoggedIn) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.register(
      this.f['name'].value,
      this.f['email'].value,
      this.f['password'].value,
      this.f['acceptTerms'].value === true
    ).subscribe({
      next: (response) => {
        this.toastr.success('Registration successful!', 'Welcome to CitiTour');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Registration failed', 'Error');
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
  }
}
