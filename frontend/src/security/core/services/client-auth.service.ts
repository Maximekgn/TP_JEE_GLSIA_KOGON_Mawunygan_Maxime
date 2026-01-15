import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface ClientAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  message: string;
}

export interface ClientInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  birth_date: string;
  gender: string;
  nationality: string;
}

export interface ClientRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
  gender: string;
  address: string;
  phone_number: string;
  nationality: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientAuthService {
  private readonly TOKEN_KEY = 'client_auth_token';
  private readonly EXPIRES_AT_KEY = 'client_token_expires_at';
  private readonly USER_ID_KEY = 'client_user_id';
  private readonly USER_EMAIL_KEY = 'client_email';
  private readonly USER_FIRST_NAME_KEY = 'client_first_name';
  private readonly USER_LAST_NAME_KEY = 'client_last_name';

  private authStatusSub = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimer: any = null;
  private readonly API_BASE = '/api/client/auth';

  public authStatus$ = this.authStatusSub.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeAuth();
  }

  /**
   * Register a new client
   */
  register(clientData: ClientRegisterData): Observable<any> {
    const payload: ClientRegisterData = {
      ...clientData,
      email: (clientData.email || '').trim().toLowerCase(),
    };

    // Never log PII/sensitive payloads (password, personal data). Keep logs minimal.
    console.log('ClientAuthService.register - sending registration request');

    return this.http.post<any>('/api/clients', payload).pipe(
      tap(() => {
        console.log('ClientAuthService.register - client created');
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Login client and store token
   */
  login(credentials: { email: string; password: string }): Observable<ClientAuthResponse> {
    const payload = {
      ...credentials,
      email: (credentials.email || '').trim().toLowerCase(),
    };

    // Never log credentials (even masked). Keep logs minimal.
    console.log('ClientAuthService.login - sending login request');

    return this.http.post<ClientAuthResponse>(`${this.API_BASE}/login`, payload).pipe(
      tap((res) => {
        console.log('ClientAuthService.login - received auth response');
        if (res && res.access_token) {
          this.saveAuthData(res);
        }
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Get current client information
   */
  getCurrentClient(): Observable<ClientInfo> {
    return this.http
      .get<ClientInfo>(`${this.API_BASE}/me`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(res: ClientAuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.USER_ID_KEY, res.user_id.toString());
    localStorage.setItem(this.USER_EMAIL_KEY, res.email);
    localStorage.setItem(this.USER_FIRST_NAME_KEY, res.first_name);
    localStorage.setItem(this.USER_LAST_NAME_KEY, res.last_name);

    // Store absolute expiration timestamp (ms)
    if (res.expires_in && res.expires_in > 0) {
      const expiresAt = Date.now() + res.expires_in * 1000;
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
      this.setAutoLogout(expiresAt - Date.now());
    }

    this.authStatusSub.next(true);
  }

  /**
   * Logout client, clear token and redirect
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.USER_FIRST_NAME_KEY);
    localStorage.removeItem(this.USER_LAST_NAME_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    this.authStatusSub.next(false);
    this.router.navigate(['/client/login']);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if client is logged in and token is valid
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (expiresAt) {
      const exp = parseInt(expiresAt, 10);
      if (Date.now() >= exp) {
        this.logout();
        return false;
      }
      return true;
    }

    // Fallback: try decode JWT exp claim if available
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Math.floor(new Date().getTime() / 1000) >= payload.exp;
      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get stored user ID
   */
  getUserId(): number | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }

  /**
   * Get stored user email
   */
  getUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  /**
   * Get stored user first name
   */
  getUserFirstName(): string | null {
    return localStorage.getItem(this.USER_FIRST_NAME_KEY);
  }

  /**
   * Get stored user last name
   */
  getUserLastName(): string | null {
    return localStorage.getItem(this.USER_LAST_NAME_KEY);
  }

  /**
   * Get user full name
   */
  getUserFullName(): string {
    const firstName = this.getUserFirstName();
    const lastName = this.getUserLastName();
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Client';
  }

  /**
   * Set auto logout timer
   */
  private setAutoLogout(durationMs: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = setTimeout(() => {
      console.log('Token expired - auto logout');
      this.logout();
    }, durationMs);
  }

  /**
   * Initialize authentication state on service creation
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

    if (token && expiresAt) {
      const exp = parseInt(expiresAt, 10);
      if (Date.now() < exp) {
        this.authStatusSub.next(true);
        this.setAutoLogout(exp - Date.now());
        return;
      }
    }

    // Token expired or missing
    this.logout();
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('ClientAuthService API Error:', error);
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.status === 409) {
        errorMessage = 'Un compte existe déjà avec cet email';
      } else if (error.status === 404) {
        errorMessage = 'Service non disponible';
      } else if (error.status === 400) {
        errorMessage = 'Données invalides';
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      original: error,
    }));
  }
}
