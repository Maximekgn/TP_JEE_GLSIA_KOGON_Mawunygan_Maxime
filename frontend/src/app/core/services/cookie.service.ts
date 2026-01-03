import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  /**
   * Sets a cookie with a specific name, value, and expiration days.
   * @param name Cookie name
   * @param value Cookie value
   * @param days Number of days until expiration
   */
  setCookie(name: string, value: string, days: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    // Secure and SameSite=Strict are best practices for auth tokens
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict`;
  }

  /**
   * Retrieves a cookie value by name.
   * @param name Cookie name
   */
  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Deletes a cookie by name.
   * @param name Cookie name
   */
  deleteCookie(name: string): void {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
  }
}
