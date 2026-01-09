import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: [],
})
export class LoginComponent {
  form: FormGroup;
  submitting = false;
  error: string | null = null;
  success: string | null = null;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    this.authService
      .login(this.form.value)
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.success = 'Connexion réussie ! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (err) => {
          this.error = err.message || 'Identifiants incorrects';
        },
      });
  }

  
}
