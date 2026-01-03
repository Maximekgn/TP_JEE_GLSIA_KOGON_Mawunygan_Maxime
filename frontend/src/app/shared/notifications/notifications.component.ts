import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      <div 
        *ngFor="let note of notificationService.notifications()" 
        class="pointer-events-auto relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-500 animate-in slide-in-from-right-full fade-in"
        [ngClass]="{
          'bg-white/90 border-emerald-500/20 shadow-emerald-900/10': note.type === 'success',
          'bg-white/90 border-red-500/20 shadow-red-900/10': note.type === 'error',
          'bg-white/90 border-blue-500/20 shadow-blue-900/10': note.type === 'info',
          'bg-white/90 border-amber-500/20 shadow-amber-900/10': note.type === 'warning'
        }"
      >
        <!-- Dynamic accent bar -->
        <div class="absolute top-0 left-0 bottom-0 w-1.5"
             [ngClass]="{
               'bg-emerald-500': note.type === 'success',
               'bg-red-500': note.type === 'error',
               'bg-blue-500': note.type === 'info',
               'bg-amber-500': note.type === 'warning'
             }">
        </div>

        <div class="p-5 pl-7 flex items-start gap-4">
          <!-- Icon container -->
          <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:rotate-12"
               [ngClass]="{
                 'bg-emerald-50 text-emerald-600': note.type === 'success',
                 'bg-red-50 text-red-600': note.type === 'error',
                 'bg-blue-50 text-blue-600': note.type === 'info',
                 'bg-amber-50 text-amber-600': note.type === 'warning'
               }">
            <svg *ngIf="note.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg *ngIf="note.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg *ngIf="note.type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <svg *ngIf="note.type === 'info'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <div class="flex-1 space-y-1">
            <h4 class="text-xs font-black uppercase tracking-widest opacity-40">
              {{ note.type === 'success' ? 'Succès' : note.type === 'error' ? 'Erreur' : note.type === 'warning' ? 'Attention' : 'Information' }}
            </h4>
            <p class="text-sm font-bold text-slate-800 leading-tight">
              {{ note.message }}
            </p>
          </div>

          <button (click)="notificationService.dismiss(note.id)" class="group shrink-0 p-1 -mr-2 text-slate-300 hover:text-slate-900 transition-all">
            <svg class="w-5 h-5 group-active:scale-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Progress bar timer -->
        <div class="absolute bottom-0 left-1.5 right-0 h-1 bg-slate-100/50">
          <div class="h-full transition-all ease-linear animate-progress"
               [ngClass]="{
                 'bg-emerald-500': note.type === 'success',
                 'bg-red-500': note.type === 'error',
                 'bg-blue-500': note.type === 'info',
                 'bg-amber-500': note.type === 'warning'
               }">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-progress {
      animation: progress 5s linear forwards;
    }
  `]
})
export class NotificationsComponent {
  public notificationService = inject(NotificationService);
}
