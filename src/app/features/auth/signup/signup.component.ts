import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import type { SignupRequest } from '../../../core/models/auth.model';

type AlertState = { type: 'success' | 'error'; text: string };

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly serverMessage = signal<AlertState | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-()\s]{7,}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['general' as 'admin' | 'general']
  });

  handleSubmit(): void {
    this.submitted.set(true);
    this.serverMessage.set(null);

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload: SignupRequest = this.form.getRawValue();

    this.authApi
      .signup(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.serverMessage.set({
            type: 'success',
            text:
              response.message ||
              'Account created! Check your email for the verification code before logging in.'
          });
          this.form.disable();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Unable to create account.';
          this.serverMessage.set({ type: 'error', text: errorMessage });
        }
      });
  }
}
