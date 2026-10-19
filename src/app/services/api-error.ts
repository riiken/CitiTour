import { HttpErrorResponse } from '@angular/common/http';

/** Turn an API error into a message suitable for showing to the user. */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'You appear to be offline. Check your connection and try again.';
    const body = error.error;
    if (body?.message && typeof body.message === 'string') return body.message;
    if (Array.isArray(body?.errors) && body.errors[0]?.message) return body.errors[0].message;
    if (error.status === 429) return 'Too many requests. Please wait a moment and try again.';
  }
  return fallback;
};
