import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional Interceptor that attaches the JWT token to outgoing requests
 * if the user is authenticated.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Check if we have a token and if the request is going to our local API
  // We avoid sending the token to external third-party APIs for security
  const isApiUrl = req.url.startsWith('/api');

  // Do not attach ADMIN token to:
  // - Client Registration (POST /api/clients)
  // - Client Auth endpoints (/api/client/auth/**)
  const isRegistration = (req.url === '/api/clients' || req.url === '/api/clients/') && req.method === 'POST';
  const isClientAuth = req.url.startsWith('/api/client/auth');

  if (token && isApiUrl && !isRegistration && !isClientAuth) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
