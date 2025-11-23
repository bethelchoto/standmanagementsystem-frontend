import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';

type AlertState = { type: 'success' | 'error'; text: string };

@Component({
  selector: 'app-update-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-profile-modal.component.html',
  styleUrls: ['./update-profile-modal.component.css']
})
export class UpdateProfileModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  @Output() close = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<void>();

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly serverMessage = signal<AlertState | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    dateOfBirth: [''],
    nationalIdentityNumber: [''],
    gender: [''] as any,
    profilePicture: [null as File | null]
  });

  protected handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.serverMessage.set({
        type: 'error',
        text: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.serverMessage.set({
        type: 'error',
        text: 'File size exceeds 5MB. Please choose a smaller image.'
      });
      return;
    }

    this.selectedFile.set(file);
    this.form.patchValue({ profilePicture: file });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected removeFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.form.patchValue({ profilePicture: null });
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  protected handleClose(): void {
    this.close.emit();
  }

  protected handleSubmit(): void {
    this.submitted.set(true);
    this.serverMessage.set(null);

    const formValue = this.form.getRawValue();

    // Check if at least one field is provided
    const hasDateOfBirth = formValue.dateOfBirth && formValue.dateOfBirth.trim() !== '';
    const hasNationalId = formValue.nationalIdentityNumber && formValue.nationalIdentityNumber.trim() !== '';
    const hasGender = formValue.gender && formValue.gender.trim() !== '';
    const hasProfilePicture = formValue.profilePicture !== null;

    if (!hasDateOfBirth && !hasNationalId && !hasGender && !hasProfilePicture) {
      this.serverMessage.set({
        type: 'error',
        text: 'Please provide at least one field to update.'
      });
      return;
    }

    // Validate date format if provided
    if (hasDateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formValue.dateOfBirth)) {
        this.serverMessage.set({
          type: 'error',
          text: 'Invalid date format. Please use YYYY-MM-DD format (e.g., 1990-01-15).'
        });
        return;
      }
    }

    this.loading.set(true);

    const payload: any = {};
    if (hasDateOfBirth) {
      payload.dateOfBirth = formValue.dateOfBirth;
    }
    if (hasNationalId) {
      payload.nationalIdentityNumber = formValue.nationalIdentityNumber;
    }
    if (hasGender) {
      payload.gender = formValue.gender;
    }

    this.authApi
      .updateProfile(payload, formValue.profilePicture || undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.serverMessage.set({
            type: 'success',
            text: response.message || 'Profile updated successfully!'
          });
          
          // Emit success and close after a short delay
          setTimeout(() => {
            this.profileUpdated.emit();
            this.handleClose();
          }, 1500);
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Unable to update profile.';
          this.serverMessage.set({ type: 'error', text: errorMessage });
        }
      });
  }
}
