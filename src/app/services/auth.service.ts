import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environment';

export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'premium';
  isEmailVerified: boolean;
  usage: {
    aiRequests: number;
    searchRequests: number;
    emailRequests: number;
  };
  subscription: {
    status: string | null;
    endDate: string | null;
  };
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface UsageStats {
  success: boolean;
  data: {
    tier: string;
    usage: {
      ai: {
        total: number;
        thisHour: number;
        limit: number | string;
        remaining: number | string;
        lastRequest: string | null;
      };
      search: {
        total: number;
        limit: number | string;
        remaining: number | string;
        lastRequest: string | null;
      };
      email: {
        total: number;
        limit: number | string;
        remaining: number | string;
        lastRequest: string | null;
      };
    };
    subscription: {
      status: string | null;
      startDate: string | null;
      endDate: string | null;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiURL.replace('/ai/', '/auth');
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize with user from localStorage if exists
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Start refresh token timer if user is logged in
    if (this.currentUserValue) {
      this.startRefreshTokenTimer();
    }
  }

  /**
   * Get current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is logged in
   */
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.getAccessToken();
  }

  /**
   * Get access token from localStorage
   */
  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Register new user
   */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      // Call backend logout endpoint
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          this.clearAuthData();
        },
        error: () => {
          // Even if backend fails, clear local data
          this.clearAuthData();
        }
      });
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.apiUrl}/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          // Update tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Restart refresh timer
          this.startRefreshTokenTimer();
        }
      }),
      catchError(error => {
        // If refresh fails, logout user
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile`, { name }).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap(response => {
        if (response.success) {
          // Logout user after password change
          this.clearAuthData();
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Observable<UsageStats> {
    return this.http.get<UsageStats>(`${this.apiUrl}/usage`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Store tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    // Store user
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));

    // Update current user subject
    this.currentUserSubject.next(response.data.user);

    // Start refresh token timer
    this.startRefreshTokenTimer();
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    // Stop refresh token timer
    this.stopRefreshTokenTimer();

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    // Update current user subject
    this.currentUserSubject.next(null);

    // Navigate to home
    this.router.navigate(['/home']);
  }

  /**
   * Start refresh token timer
   * Refreshes token automatically before it expires
   */
  private startRefreshTokenTimer(): void {
    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    // Decode JWT to get expiration
    const jwtToken = JSON.parse(atob(accessToken.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 min before expiry

    // Set timeout to refresh token
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe({
        error: (err) => {
          console.error('Token refresh failed:', err);
        }
      });
    }, timeout);
  }

  /**
   * Stop refresh token timer
   */
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      errorMessage = error.error.errors.map((e: any) => e.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
