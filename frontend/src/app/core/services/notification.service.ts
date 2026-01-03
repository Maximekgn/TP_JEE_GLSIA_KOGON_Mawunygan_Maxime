import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Using Angular Signals for state management (Best Practice in Angular 17+)
  private notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  private nextId = 0;

  /**
   * Displays a notification message
   * @param message The text to display
   * @param type The style of the notification
   * @param duration Time in ms before auto-dismiss (default 5s)
   */
  show(message: string, type: NotificationType = 'info', duration: number = 5000): void {
    const id = this.nextId++;
    const newNotification: Notification = { id, message, type };

    // Update signal state
    this.notificationsSignal.update(notifications => [...notifications, newNotification]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Removes a notification by ID
   */
  dismiss(id: number): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Clears all notifications
   */
  clear(): void {
    this.notificationsSignal.set([]);
  }
}
