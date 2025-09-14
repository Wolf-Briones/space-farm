import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  
  public notifications$ = this.notificationSubject.asObservable();

  showSuccess(message: string, title: string = 'Éxito'): void {
    this.addNotification('success', title, message);
  }

  showError(message: string, title: string = 'Error'): void {
    this.addNotification('error', title, message);
  }

  showWarning(message: string, title: string = 'Advertencia'): void {
    this.addNotification('warning', title, message);
  }

  showInfo(message: string, title: string = 'Información'): void {
    this.addNotification('info', title, message);
  }

  private addNotification(type: Notification['type'], title: string, message?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: type === 'error' ? 5000 : 3000,
      timestamp: new Date()
    };

    this.notifications.unshift(notification);
    this.notificationSubject.next([...this.notifications]);

    // Auto-remove notification after duration
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, notification.duration);
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationSubject.next([...this.notifications]);
  }

  clearAll(): void {
    this.notifications = [];
    this.notificationSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}