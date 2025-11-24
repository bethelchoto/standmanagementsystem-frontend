import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import type { BasicResponse, ResetPasswordRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly confirmVisible = signal(false);
  protected readonly serverMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: ResetPasswordComponent.passwordMatchValidator }
  );

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }

    const stateMessage = this.router.getCurrentNavigation()?.extras?.state?.['message'] as string | undefined;
    if (stateMessage) {
      this.serverMessage.set({ type: 'success', text: stateMessage });
    }
  }

  handleSubmit(): void {
    this.submitted.set(true);
    this.serverMessage.set(null);

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, code, password } = this.form.getRawValue();

    const payload: ResetPasswordRequest = {
      email,
      verificationCode: code,
      newPassword: password
    };

    this.authApi
      .resetPassword(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: BasicResponse) => {
          this.serverMessage.set({
            type: response.success ? 'success' : 'error',
            text: response.message || 'Your password has been reset. You can now log in with the new password.'
          });

          if (response.success) {
            this.form.reset({
              email,
              code: '',
              password: '',
              confirmPassword: ''
            });
            this.submitted.set(false);
            void this.router.navigateByUrl('/auth/login');
          }
        },
        error: (error) => {
          const message =
            error?.error?.message ||
            error?.message ||
            'Unable to reset your password. Double-check the code and try again.';
          this.serverMessage.set({ type: 'error', text: message });
        }
      });
  }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible.update((value) => !value);
    } else {
      this.confirmVisible.update((value) => !value);
    }
  }

  protected static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;

    if (!password || !confirm) {
      return null;
    }

    return password === confirm ? null : { passwordMismatch: true };
  }
}

