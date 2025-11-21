import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Simple auth guard that checks for a JWT token in localStorage.
 * If no token is present, redirect to the login page.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  // During SSR, window/localStorage are not available
  if (typeof window === 'undefined') {
    return router.parseUrl('/auth/login');
  }

  const token = localStorage.getItem('sms_auth_token');

  if (!token) {
    return router.parseUrl('/auth/login');
  }

  return true;
};



