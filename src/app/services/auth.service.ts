import { Injectable, NgZone } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environment';

export interface User {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'premium';
  role?: 'user' | 'admin';
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
        today?: number;
        limit: number | string;
        remaining: number | string;
        lastRequest: string | null;
      };
      email: {
        total: number;
        today?: number;
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

const STORAGE = { access: 'accessToken', refresh: 'refreshToken', user: 'currentUser' };

// Pages that need a session; when it ends there, send the user to log in
const PROTECTED_PATHS = [/^\/user-dashboard/, /^\/partner(\/|$)/, /^\/admin/];

/** Seconds-since-epoch expiry from a JWT, or null if the token is malformed. */
const tokenExpiry = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiURL.replace('/ai/', '/auth');
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInFlight$: Observable<string> | null = null;
  /** Client without interceptors: refresh/logout must never trigger the 401 handler. */
  private rawHttp: HttpClient;

  constructor(
    private http: HttpClient,
    httpBackend: HttpBackend,
    private router: Router,
    private zone: NgZone
  ) {
    this.rawHttp = new HttpClient(httpBackend);

    this.currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
    this.currentUser$ = this.currentUserSubject.asObservable();

    if (this.currentUserValue) {
      if (!this.getRefreshToken() || tokenExpiry(this.getAccessToken()) === null) {
        // Corrupt or incomplete session: start clean
        this.clearSession();
      } else {
        this.scheduleRefresh();
      }
    }

    // Keep tabs in sync: logging in/out in one tab updates the others
    window.addEventListener('storage', event => {
      if (event.key !== STORAGE.user && event.key !== STORAGE.access && event.key !== null) return;
      this.zone.run(() => {
        const user = this.readStoredUser();
        this.currentUserSubject.next(user && this.getAccessToken() ? user : null);
        if (user) this.scheduleRefresh(); else this.stopRefreshTimer();
      });
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Logged in = we have a user and a session that can still be used (a valid
   * access token, or a refresh token to get a new one).
   */
  public get isLoggedIn(): boolean {
    if (!this.currentUserValue) return false;
    const expiry = tokenExpiry(this.getAccessToken());
    const accessValid = expiry !== null && expiry * 1000 > Date.now();
    return accessValid || !!this.getRefreshToken();
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(STORAGE.access);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE.refresh);
  }

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------- login / register / logout

  register(name: string, email: string, password: string, acceptTerms = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password, acceptTerms }).pipe(
      tap(response => response.success && this.startSession(response)),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => response.success && this.startSession(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Log out immediately on this device, then tell the server to revoke the
   * refresh token (best effort; works even if the access token has expired).
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getAccessToken();
    this.clearSession();
    this.router.navigate(['/home']);

    if (refreshToken || accessToken) {
      this.rawHttp.post(`${this.apiUrl}/logout`, { refreshToken }, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }).subscribe({ error: () => undefined });
    }
  }

  /**
   * The session can't be renewed (expired, revoked, or the account no longer
   * exists). Clear it; on a page that needs login, go to the login page.
   */
  endSession(): void {
    this.clearSession();
    const path = this.router.url.split('?')[0];
    if (PROTECTED_PATHS.some(pattern => pattern.test(path))) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  /** Request a reset link (same response whether or not the email exists). */
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.rawHttp.post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(email: string, token: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.rawHttp.post<{ success: boolean; message: string }>(`${this.apiUrl}/reset-password`, { email, token, password })
      .pipe(
        tap(() => this.clearSession()),
        catchError(this.handleError)
      );
  }

  // ---------------------------------------------------------------- tokens

  /**
   * Get a new access token. Concurrent callers share one request. On failure
   * the session is ended (never retried, never loops).
   */
  refreshSession(): Observable<string> {
    if (this.refreshInFlight$) return this.refreshInFlight$;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.endSession();
      return throwError(() => new Error('Your session has ended. Please log in again.'));
    }

    this.refreshInFlight$ = this.rawHttp.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map(response => {
        localStorage.setItem(STORAGE.access, response.data.accessToken);
        localStorage.setItem(STORAGE.refresh, response.data.refreshToken);
        this.scheduleRefresh();
        return response.data.accessToken as string;
      }),
      catchError(() => {
        this.endSession();
        return throwError(() => new Error('Your session has ended. Please log in again.'));
      }),
      finalize(() => (this.refreshInFlight$ = null)),
      shareReplay(1)
    );
    return this.refreshInFlight$;
  }

  /** Kept for existing callers. */
  refreshToken(): Observable<any> {
    return this.refreshSession().pipe(map(accessToken => ({ success: true, data: { accessToken } })));
  }

  private startSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE.access, response.data.accessToken);
    localStorage.setItem(STORAGE.refresh, response.data.refreshToken);
    localStorage.setItem(STORAGE.user, JSON.stringify(response.data.user));
    this.currentUserSubject.next(response.data.user);
    this.scheduleRefresh();
  }

  private clearSession(): void {
    this.stopRefreshTimer();
    localStorage.removeItem(STORAGE.access);
    localStorage.removeItem(STORAGE.refresh);
    localStorage.removeItem(STORAGE.user);
    this.currentUserSubject.next(null);
  }

  /** Refresh one minute before the access token expires (immediately if already expired). */
  private scheduleRefresh(): void {
    this.stopRefreshTimer();
    const expiry = tokenExpiry(this.getAccessToken());
    if (expiry === null) return;
    const delay = Math.max(0, expiry * 1000 - Date.now() - 60 * 1000);
    this.refreshTimer = setTimeout(() => this.refreshSession().subscribe({ error: () => undefined }), delay);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // ---------------------------------------------------------------- profile

  getProfile(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem(STORAGE.user, JSON.stringify(response.data.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  updateProfile(name: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile`, { name }).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem(STORAGE.user, JSON.stringify(response.data.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, { currentPassword, newPassword }).pipe(
      tap(response => {
        if (response.success) this.clearSession();
      }),
      catchError(this.handleError)
    );
  }

  getUsageStats(): Observable<UsageStats> {
    return this.http.get<UsageStats>(`${this.apiUrl}/usage`).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Something went wrong. Please try again.';
    if (error?.status === 0) {
      errorMessage = 'Cannot reach the server. Check your connection and try again.';
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.errors) {
      errorMessage = error.error.errors.map((e: any) => e.message).join(', ');
    } else if (error?.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
