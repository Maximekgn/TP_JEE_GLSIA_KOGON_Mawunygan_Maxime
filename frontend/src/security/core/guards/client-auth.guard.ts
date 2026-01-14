import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

export const clientAuthGuard = () => {
  const clientAuthService = inject(ClientAuthService);
  const router = inject(Router);

  if (clientAuthService.isLoggedIn()) {
    return true;
  }

  // Not logged in, redirect to client login
  router.navigate(['/client/login']);
  return false;
};
