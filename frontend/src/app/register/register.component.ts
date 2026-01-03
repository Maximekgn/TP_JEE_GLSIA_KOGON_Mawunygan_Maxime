import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import countriesData from '../../assets/data/countries.json';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: [],
})
export class RegisterComponent {
  countries = countriesData;
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
    this.form = this.fb.group(
      {
        lastName: ['', Validators.required],
        firstName: ['', Validators.required],
        birthDate: ['', Validators.required],
        sex: ['', Validators.required],
        address: ['', Validators.required],
        phone: ['', Validators.required],
        nationality: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch },
    );
  }

  // Custom validator to ensure password and confirmPassword match
  private passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { passwordsMismatch: true };
  }

  // Called from the template when the user submits the form
  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    const payload = {
      email: this.form.value.email,
      password: this.form.value.password,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      userType: 'CLIENT',
      phoneNumber: this.form.value.phone,
      address: this.form.value.address,
      gender: this.form.value.sex,
      birthDate: this.form.value.birthDate,
      nationality: this.form.value.nationality,
    };

    this.authService.register(payload).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Inscription réussie ! Redirection vers votre espace...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.message || "Erreur lors de l'inscription";
      },
    });
  }
}
