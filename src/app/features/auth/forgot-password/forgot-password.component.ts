import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import type { RequestPasswordResetRequest, BasicResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly serverMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  handleSubmit(): void {
    this.submitted.set(true);
    this.serverMessage.set(null);

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload: RequestPasswordResetRequest = this.form.getRawValue();

    this.authApi
      .requestPasswordReset(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: BasicResponse) => {
          if (!response.success) {
            this.serverMessage.set({
              type: 'error',
              text: response.message || 'No account found with that email.'
            });
            return;
          }

          const successText =
            response.message || 'Password reset code has been sent to your email.';

          this.form.reset({ email: payload.email });
          this.submitted.set(false);

          void this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: payload.email },
            state: { message: successText }
          });
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            error?.message ||
            'Unable to initiate password reset. Please try again shortly.';
          this.serverMessage.set({ type: 'error', text: message });
        }
      });
  }
}

