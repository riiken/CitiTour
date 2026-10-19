import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  const create = (params: Record<string, string>) => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } }]
    });
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    return fixture;
  };

  it('explains an incomplete link', () => {
    const fixture = create({ email: 'a@x.com' });
    expect(fixture.componentInstance.linkValid).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('incomplete');
  });

  it('checks the password rules and matching before calling the API', () => {
    const fixture = create({ email: 'a@x.com', token: 'a'.repeat(64) });
    const component = fixture.componentInstance;
    component.password = 'weak';
    component.submit();
    expect(component.error).toContain('8 characters');
    component.password = 'GoodPassw0rd';
    component.confirm = 'Different1A';
    component.submit();
    expect(component.error).toBe('Passwords do not match');
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('resets and goes to login', () => {
    const fixture = create({ email: 'a@x.com', token: 'a'.repeat(64) });
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    Object.assign(fixture.componentInstance, { password: 'GoodPassw0rd', confirm: 'GoodPassw0rd' });
    fixture.componentInstance.submit();
    const req = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/auth/reset-password'));
    expect(req.request.body).toEqual({ email: 'a@x.com', token: 'a'.repeat(64), password: 'GoodPassw0rd' });
    req.flush({ success: true, message: 'Your password has been changed. Please log in.' });
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
