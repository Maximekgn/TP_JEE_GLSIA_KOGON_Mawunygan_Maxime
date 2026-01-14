import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientAuthService } from '../../security/core/services/client-auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-register.component.html',
  styleUrls: ['./client-register.component.css'],
})
export class ClientRegisterComponent {
  registerForm: FormGroup;
  submitting = false;
  error: string | null = null;
  success: string | null = null;
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private clientAuthService: ClientAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Step 1: Personal Information
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      birth_date: ['', Validators.required],
      gender: ['', Validators.required],
      nationality: ['', Validators.required],

      // Step 2: Contact Information
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],

      // Step 3: Security
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  nextStep() {
    if (this.currentStep === 1) {
      const step1Fields = ['first_name', 'last_name', 'birth_date', 'gender', 'nationality'];
      const step1Valid = step1Fields.every(field => {
        const control = this.registerForm.get(field);
        return control && control.valid;
      });

      if (!step1Valid) {
        step1Fields.forEach(field => {
          this.registerForm.get(field)?.markAsTouched();
        });
        return;
      }
    } else if (this.currentStep === 2) {
      const step2Fields = ['email', 'phone_number', 'address'];
      const step2Valid = step2Fields.every(field => {
        const control = this.registerForm.get(field);
        return control && control.valid;
      });

      if (!step2Valid) {
        step2Fields.forEach(field => {
          this.registerForm.get(field)?.markAsTouched();
        });
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    // Remove confirmPassword before sending
    const formData = { ...this.registerForm.value };
    delete formData.confirmPassword;

    this.clientAuthService
      .register(formData)
      .pipe(
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.success = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
          console.log('Client registration success:', response);
          setTimeout(() => {
            this.router.navigate(['/client/login']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.message || 'Une erreur est survenue lors de l\'inscription';
          console.error('Client registration error:', err);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }

  // Getters for form controls
  get first_name() { return this.registerForm.get('first_name'); }
  get last_name() { return this.registerForm.get('last_name'); }
  get birth_date() { return this.registerForm.get('birth_date'); }
  get gender() { return this.registerForm.get('gender'); }
  get nationality() { return this.registerForm.get('nationality'); }
  get email() { return this.registerForm.get('email'); }
  get phone_number() { return this.registerForm.get('phone_number'); }
  get address() { return this.registerForm.get('address'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  // Get today's date for max birth date validation
  get maxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get minimum birth date (18 years ago)
  get minBirthDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  }
}
