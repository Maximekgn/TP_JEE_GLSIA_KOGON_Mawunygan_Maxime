import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId?: number;
  email?: string;
  tokenType?: string;
  message?: string;
}

// Backend response shape
interface BackendAuthResponse {
  access_token: string;
  user_id: number;
  token_type?: string;
  message?: string;
  expires_in?: number; // seconds
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly EXPIRES_AT_KEY = 'auth_token_expires_at';
  private readonly USER_ID_KEY = 'auth_user_id';
  private readonly USER_EMAIL_KEY = 'auth_email';

  private authStatusSub = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimer: any = null;
  private readonly API_BASE = '/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuth();
  }

  /**
   * Register a new user
   */
  register(userData: any): Observable<AuthResponse> {
    const toLog = { ...userData } as any;
    if (toLog.password) toLog.password = '***';
    console.log('AuthService.register - sending:', toLog);

    return this.http.post<BackendAuthResponse>(`${this.API_BASE}/register`, userData).pipe(
      tap((res) => {
        console.log('AuthService.register - received (raw):', res);
      }),
      map((res) => this.mapBackendResponse(res)),
      tap((mapped) => {
        console.log('AuthService.register - received (mapped):', mapped);
        if (mapped && mapped.token) {
          this.saveAuthData(mapped);
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Login user and store token
   */
  login(credentials: any): Observable<AuthResponse> {
    const toLog = { ...credentials } as any;
    if (toLog.password) toLog.password = '***';
    console.log('AuthService.login - sending:', toLog);

    return this.http.post<BackendAuthResponse>(`${this.API_BASE}/login`, credentials).pipe(
      tap((res) => {
        console.log('AuthService.login - received (raw):', res);
      }),
      map((res) => this.mapBackendResponse(res)),
      tap((mapped) => {
        console.log('AuthService.login - received (mapped):', mapped);
        if (mapped && mapped.token) {
          this.saveAuthData(mapped);
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any) {
    console.error('AuthService API Error:', error);
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      // Prélever le message du backend s'il existe (votre backend renvoie un champ 'message')
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'Identifiants incorrects ou accès refusé';
      } else if (error.status === 404) {
        errorMessage = "Service d'authentification introuvable (404)";
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

  private mapBackendResponse(resp: BackendAuthResponse): AuthResponse {
    return {
      token: resp.access_token,
      expiresIn: resp.expires_in ?? 0,
      userId: resp.user_id,
      email: resp.username,
      tokenType: resp.token_type,
      message: resp.message,
    } as AuthResponse;
  }

  private saveAuthData(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    if (res.userId !== undefined && res.userId !== null) {
      localStorage.setItem(this.USER_ID_KEY, res.userId.toString());
    }
    if (res.email) {
      localStorage.setItem(this.USER_EMAIL_KEY, res.email);
    }

    // store absolute expiration timestamp (ms)
    if (res.expiresIn && res.expiresIn > 0) {
      const expiresAt = Date.now() + res.expiresIn * 1000;
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
      this.setAutoLogout(expiresAt - Date.now());
    }

    this.authStatusSub.next(true);
  }

  /**
   * Logout user, clear token and redirect
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is logged in and token is valid
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

  private setAutoLogout(durationMs: number) {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, durationMs);
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

    if (token && expiresAt) {
      const exp = parseInt(expiresAt, 10);
      if (Date.now() < exp) {
        // Token is valid - set user as authenticated and setup auto-logout
        this.authStatusSub.next(true);
        this.setAutoLogout(exp - Date.now());
        return;
      } else {
        // Token expired - clean up localStorage without redirecting
        this.clearAuthData();
      }
    }

    // Token missing or expired - just set status to false
    this.authStatusSub.next(false);
  }

  /**
   * Clear authentication data from localStorage without redirecting
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    this.authStatusSub.next(false);
  }
}
  

