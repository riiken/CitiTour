import { Component, OnInit } from '@angular/core';
import { AuthService, User, UsageStats } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-user-dashboard',
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.css'],
    standalone: false
})
export class UserDashboardComponent implements OnInit {
  currentUser: User | null = null;
  usageStats: UsageStats['data'] | null = null;
  loading = true;
  showChangePassword = false;

  // Change password form
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  changingPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;

    // Get user profile from API
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.currentUser = response.data.user;
        this.loadUsageStats();
      },
      error: () => {
        this.toastr.error('Failed to load profile', 'Error');
        this.loading = false;
      }
    });
  }

  loadUsageStats(): void {
    this.authService.getUsageStats().subscribe({
      next: (response) => {
        this.usageStats = response.data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load usage stats', 'Error');
        this.loading = false;
      }
    });
  }

  // Pro plans need online payments (not live yet); hide upgrade prompts until then
  readonly proAvailable = false;
  savingReminders = false;

  get tripReminders(): boolean {
    return this.currentUser?.notifications?.tripReminders !== false;
  }

  setTripReminders(enabled: boolean): void {
    this.savingReminders = true;
    this.authService.updateNotifications(enabled).subscribe({
      next: (response: any) => {
        this.savingReminders = false;
        if (response?.data?.user) this.currentUser = response.data.user;
        this.toastr.success(enabled ? 'Trip reminders turned on' : 'Trip reminders turned off');
      },
      error: (err: Error) => {
        this.savingReminders = false;
        this.toastr.error(err.message);
      }
    });
  }

  getTierBadgeClass(): string {
    if (!this.currentUser) return 'badge-free';

    switch (this.currentUser.tier) {
      case 'pro':
        return 'badge-pro';
      case 'premium':
        return 'badge-premium';
      default:
        return 'badge-free';
    }
  }

  getUsagePercentage(type: 'ai' | 'search' | 'email'): number {
    if (!this.usageStats) return 0;

    const usage = this.usageStats.usage[type];
    if (usage.limit === 'unlimited') return 0;

    const limit = typeof usage.limit === 'number' ? usage.limit : parseInt(usage.limit as string);
    // AI quota is hourly; search and email quotas are daily
    const current = type === 'ai' && 'thisHour' in usage ? usage.thisHour : ((usage as any).today ?? usage.total);

    return Math.min((current / limit) * 100, 100);
  }

  getUsageBarClass(percentage: number): string {
    if (percentage >= 90) return 'usage-critical';
    if (percentage >= 70) return 'usage-warning';
    return 'usage-good';
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.toastr.success('Logged out successfully', 'Goodbye');
      this.router.navigate(['/home']);
    }
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    if (!this.showChangePassword) {
      // Reset form
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    }
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.toastr.error('Please fill all password fields', 'Error');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.toastr.error('New passwords do not match', 'Error');
      return;
    }

    if (this.newPassword.length < 8) {
      this.toastr.error('Password must be at least 8 characters', 'Error');
      return;
    }

    this.changingPassword = true;

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully. Please login again.', 'Success');
        this.changingPassword = false;
        this.toggleChangePassword();
        // Redirect to login after password change
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.toastr.error(err.message || 'Failed to change password', 'Error');
        this.changingPassword = false;
      }
    });
  }

  goToUpgrade(): void {
    this.toastr.info('Upgrade feature coming soon!', 'Info');
    // TODO: Navigate to pricing page when implemented
    // this.router.navigate(['/pricing']);
  }

  goToPlanTrip(): void {
    this.router.navigate(['/plan-trip']);
  }
}
