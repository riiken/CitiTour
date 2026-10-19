import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('prefers the server message', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 503, error: { message: 'Trip planning is busy' } }))).toBe('Trip planning is busy');
  });

  it('uses the first validation error', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { errors: [{ message: 'Add a phone' }] } }))).toBe('Add a phone');
  });

  it('explains offline errors', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('offline');
  });
});
