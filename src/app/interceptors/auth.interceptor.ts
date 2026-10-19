import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../environment';

// Requests where a 401 means "wrong credentials", not "session expired"
const NO_SESSION_HANDLING = /\/auth\/(login|register|refresh|logout)$/;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only our own API gets the token, and never the login/register/refresh calls
    const isOwnApi = request.url.startsWith(environment.apiUrl);
    if (!isOwnApi || NO_SESSION_HANDLING.test(request.url)) {
      return next.handle(request);
    }

    const accessToken = this.authService.getAccessToken();
    const authorised = accessToken ? this.withToken(request, accessToken) : request;

    return next.handle(authorised).pipe(
      catchError(error => {
        // Expired access token: renew once (shared across requests) and retry
        if (error instanceof HttpErrorResponse && error.status === 401 && accessToken) {
          return this.authService.refreshSession().pipe(
            switchMap(newToken => next.handle(this.withToken(request, newToken))),
            catchError(() => throwError(() => error))
          );
        }
        return throwError(() => error);
      })
    );
  }

  private withToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
