import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientAuthService } from '../services/client-auth.service';

/**
 * Functional Interceptor that attaches the client JWT token to outgoing requests
 * for client-related API calls.
 */
export const clientAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const clientAuthService = inject(ClientAuthService);

  // Only add token for client API routes
  if (req.url.includes('/api/client') || req.url.includes('/api/accounts')) {
    const token = clientAuthService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req);
};
