import { Component, EventEmitter, Output, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileVersion: boolean;
  currentUser: User | null = null;
  private userSubscription?: Subscription;
  @Output() toggleSidebar = new EventEmitter<void>();
  activeNav: any = 'home';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    public i18n: I18nService
  ){
    this.mobileVersion = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  getUserInitial(): string {
    if (this.currentUser && this.currentUser.name) {
      return this.currentUser.name.charAt(0).toUpperCase();
    }
    return '?';
  }

  toggleSidebarFUn() {
    this.toggleSidebar.emit(); // Emit event to toggle the sidebar
  }

  navClicked(item:any){
    this.activeNav = item;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.toastr.success('Logged out successfully', 'Goodbye');
      this.router.navigate(['/home']);
    }
  }

}
