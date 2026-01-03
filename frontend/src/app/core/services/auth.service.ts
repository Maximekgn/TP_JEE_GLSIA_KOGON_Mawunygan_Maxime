import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  expiresIn: number;
  userType: string;
  userId: number;
  email: string;
  tokenType: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private authStatusSub = new BehaviorSubject<boolean>(this.isLoggedIn());
  private readonly API_BASE = '/api/auth';
  private readonly USER_ID_KEY = 'auth_user_id';
  private readonly USER_TYPE_KEY = 'auth_user_type';
  private readonly USER_EMAIL_KEY = 'auth_email';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  /**
   * Register a new user
   */
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/register`, userData).pipe(
      tap((res) => {
        if (res && res.token) {
          this.saveAuthData(res);
        }
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Login user and store token
   */
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token) {
          this.saveAuthData(res);
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
        errorMessage = 'Service d\'authentification introuvable (404)';
      } else {
        errorMessage = error.message || errorMessage;
      }
    }
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      original: error
    }));
  }

  private saveAuthData(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_ID_KEY, res.userId.toString());
    localStorage.setItem(this.USER_TYPE_KEY, res.userType);
    localStorage.setItem(this.USER_EMAIL_KEY, res.email);
    this.authStatusSub.next(true);
  }

  /**
   * Logout user, clear token and redirect
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_TYPE_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    this.authStatusSub.next(false);
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

    // Basic JWT expiration check
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
   * Get stored user type
   */
  getUserType(): string | null {
    return localStorage.getItem(this.USER_TYPE_KEY);
  }

  /**
   * Observable to track auth status
   */
  get authStatus$(): Observable<boolean> {
    return this.authStatusSub.asObservable();
  }
}
