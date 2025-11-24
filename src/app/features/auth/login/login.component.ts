import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import type { ApiResponse, LoginRequest, LoginResponse } from '../../../core/models/auth.model';
import type { HttpResponse } from '@angular/common/http';

type AlertState = { type: 'success' | 'error'; text: string };
type ResponseDetails = {
  status: number;
  message: string;
  token: string;
  userEmail: string;
  userRole: string;
  headers: Array<{ key: string; value: string | null }>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly userProfileService = inject(UserProfileService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly serverMessage = signal<AlertState | null>(null);
  protected readonly responseDetails = signal<ResponseDetails | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  handleSubmit(): void {
    this.submitted.set(true);
    this.serverMessage.set(null);
    this.responseDetails.set(null);

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload: LoginRequest = this.form.getRawValue();

    this.authApi
      .login(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: HttpResponse<ApiResponse<LoginResponse>>) => {
          const body = response.body;

          if (!body?.data?.token || !body.data.user) {
            this.serverMessage.set({
              type: 'error',
              text: 'Login succeeded but response was missing authentication data.'
            });
            return;
          }

          const headers = response.headers
            .keys()
            .map((key) => ({ key, value: response.headers.get(key) }));

          localStorage.setItem('sms_auth_token', body.data.token);
          this.userProfileService.saveProfile(body.data.user);

          this.responseDetails.set({
            status: response.status,
            message: body.message || 'Login successful',
            token: body.data.token,
            userEmail: body.data.user.email,
            userRole: body.data.user.role,
            headers
          });

          this.serverMessage.set({
            type: 'success',
            text: body.message || 'Login successful. Redirecting you shortly.'
          });

          void this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          const errorMessage =
            error?.error?.message || error?.message || 'Unable to login with those credentials.';
          this.serverMessage.set({ type: 'error', text: errorMessage });
        }
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((value) => !value);
  }

}
