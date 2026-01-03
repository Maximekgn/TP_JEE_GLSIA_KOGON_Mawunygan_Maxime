import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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
  private readonly API_BASE = 'http://localhost:8080/api/auth';

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
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.authStatusSub.next(true);
        }
      }),
    );
  }

  /**
   * Login user and store token
   */
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.authStatusSub.next(true);
        }
      }),
    );
  }

  /**
   * Logout user, clear token and redirect
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
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
   * Observable to track auth status
   */
  get authStatus$(): Observable<boolean> {
    return this.authStatusSub.asObservable();
  }
}
