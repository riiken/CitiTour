import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const jwt = (expSeconds: number) => `x.${btoa(JSON.stringify({ exp: expSeconds }))}.y`;
const user = { id: '1', name: 'Asha', email: 'a@x.com', tier: 'free' };

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('logs out immediately, even before the server responds', () => {
    localStorage.setItem('accessToken', jwt(Date.now() / 1000 + 600));
    localStorage.setItem('refreshToken', 'r1');
    localStorage.setItem('currentUser', JSON.stringify(user));
    const service = TestBed.inject(AuthService);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    expect(service.isLoggedIn).toBeTrue();

    service.logout();

    expect(service.isLoggedIn).toBeFalse();
    expect(localStorage.getItem('accessToken')).toBeNull();
    const req = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/auth/logout'));
    expect(req.request.body).toEqual({ refreshToken: 'r1' }); // server can revoke even if access token expired
  });

  it('discards a broken stored session on start', () => {
    localStorage.setItem('accessToken', 'not-a-jwt');
    localStorage.setItem('currentUser', JSON.stringify(user));
    const service = TestBed.inject(AuthService);
    expect(service.isLoggedIn).toBeFalse();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('ends the session when refresh fails, without looping', () => {
    localStorage.setItem('accessToken', jwt(Date.now() / 1000 - 10));
    localStorage.setItem('refreshToken', 'stale');
    localStorage.setItem('currentUser', JSON.stringify(user));
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    let failed = false;
    service.refreshSession().subscribe({ error: () => (failed = true) });
    http.match(r => r.url.endsWith('/auth/refresh')).forEach(req => req.flush({}, { status: 401, statusText: 'Unauthorized' }));
    expect(failed).toBeTrue();
    expect(service.isLoggedIn).toBeFalse();
    http.expectNone(r => r.url.endsWith('/auth/refresh'));
  });
});

describe('AuthInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }] });
  });

  it('a wrong password is just an error: no refresh, no logout', () => {
    localStorage.setItem('accessToken', jwt(Date.now() / 1000 + 600));
    localStorage.setItem('refreshToken', 'r1');
    localStorage.setItem('currentUser', JSON.stringify(user));
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    let message = '';
    service.login('a@x.com', 'wrong').subscribe({ error: e => (message = e.message) });
    const req = http.expectOne(r => r.url.endsWith('/auth/login'));
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ message: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
    expect(message).toBe('Invalid email or password');
    http.expectNone(r => r.url.endsWith('/auth/refresh'));
  });

  it('renews an expired token once and retries the request', () => {
    localStorage.setItem('accessToken', jwt(Date.now() / 1000 + 600));
    localStorage.setItem('refreshToken', 'r1');
    localStorage.setItem('currentUser', JSON.stringify(user));
    TestBed.inject(AuthService);
    const client = TestBed.inject(HttpClient);
    const http = TestBed.inject(HttpTestingController);
    let result: any;
    client.get('http://localhost:5000/api/auth/me').subscribe(r => (result = r));
    http.expectOne(r => r.url.endsWith('/auth/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(r => r.url.endsWith('/auth/refresh')).flush({ data: { accessToken: jwt(Date.now() / 1000 + 900), refreshToken: 'r2' } });
    const retry = http.expectOne(r => r.url.endsWith('/auth/me'));
    expect(retry.request.headers.get('Authorization')).toContain('Bearer');
    retry.flush({ ok: true });
    expect(result).toEqual({ ok: true });
  });
});
