import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role-based guard that allows access only to authenticated ADMIN users.
 *
 * Usage:
 *  canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Must be logged in first
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Must be an admin
  const userType = authService.getUserType();
  if (userType === 'ADMIN') {
    return true;
  }

  // Logged in but not authorized -> redirect to dashboard home (or login)
  return router.createUrlTree(['/dashboard']);
};
