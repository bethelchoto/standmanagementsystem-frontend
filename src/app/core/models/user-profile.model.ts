import { AuthUser } from './auth.model';

export interface UserProfile extends AuthUser {
  avatarUrl: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

