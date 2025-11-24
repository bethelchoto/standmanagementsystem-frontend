import { Injectable } from '@angular/core';
import { AuthUser, UpdateUserProfileResponse } from '../models/auth.model';
import { UserProfile } from '../models/user-profile.model';

type PersistedProfile = AuthUser | UpdateUserProfileResponse;

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private static readonly STORAGE_KEY = 'sms_user_profile';
  private static readonly ASSET_BASE_URL = 'https://standmanagementsystem.vercel.app';

  getStoredProfile(): PersistedProfile | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const rawProfile = localStorage.getItem(UserProfileService.STORAGE_KEY);

    if (!rawProfile) {
      return null;
    }

    try {
      return JSON.parse(rawProfile) as PersistedProfile;
    } catch {
      return null;
    }
  }

  saveProfile(profile: PersistedProfile): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(UserProfileService.STORAGE_KEY, JSON.stringify(profile));
  }

  buildAvatarUrl(profilePicture?: string | null): string {
    if (!profilePicture) {
      return 'https://i.pravatar.cc/160?img=5';
    }

    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }

    const normalizedPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `${UserProfileService.ASSET_BASE_URL}${normalizedPath}`;
  }

  getResolvedProfile(): UserProfile | null {
    const storedProfile = this.getStoredProfile();

    if (!storedProfile) {
      return null;
    }

    return this.enrichProfile(storedProfile);
  }

  private enrichProfile(profile: PersistedProfile): UserProfile {
    const emailVerified = typeof profile.emailVerified === 'number'
      ? Boolean(profile.emailVerified)
      : Boolean(profile.emailVerified);

    return {
      ...profile,
      avatarUrl: this.buildAvatarUrl(profile.profilePicture),
      emailVerified,
      createdAt: profile.createdAt ?? '',
      updatedAt: profile.updatedAt ?? ''
    };
  }
}

